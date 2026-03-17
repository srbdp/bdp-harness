// Config-driven architectural layer enforcement.
// Reads layers.json from the project root. If absent, all tests skip gracefully.
// When present, enforces that imports respect declared layer boundaries.

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── Helpers ─────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, "../..");

interface LayerConfig {
  layers: { name: string; paths: string[] }[];
  allowedDependencies: Record<string, string[]>;
  crossCutting: string[];
}

/**
 * Find files matching a glob-like pattern relative to baseDir.
 * Supports patterns like "src/types/**" (directory + all descendants).
 */
function findFiles(pattern: string, baseDir: string = PROJECT_ROOT): string[] {
  const results: string[] = [];
  const ext = path.extname(pattern);
  const dirPrefix = pattern.split("*")[0];
  const searchDir = path.join(baseDir, dirPrefix);

  if (!fs.existsSync(searchDir)) return results;

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        walk(fullPath);
      } else if (entry.isFile() && (!ext || fullPath.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  walk(searchDir);
  return results;
}

/**
 * Extract import/require statements from a file's source text.
 * Returns an array of module specifiers.
 */
function extractImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const imports: string[] = [];

  // ES module imports: import ... from "module"
  const esImportRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = esImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Dynamic imports: import("module")
  const dynamicImportRegex = /import\(\s*['"](.+?)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // CommonJS requires: require("module")
  const requireRegex = /require\(\s*['"](.+?)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Check if a file path matches a glob-like pattern.
 * Supports "src/types/**" meaning anything under src/types/.
 */
function matchesGlob(filePath: string, pattern: string): boolean {
  // Normalize to forward slashes for comparison
  const normalized = filePath.replace(/\\/g, "/");

  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3); // Remove /**
    return normalized.startsWith(prefix + "/") || normalized === prefix;
  }

  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    const remainder = normalized.slice(prefix.length + 1);
    return (
      normalized.startsWith(prefix + "/") && !remainder.includes("/")
    );
  }

  return normalized === pattern;
}

/**
 * Determine which layer a file belongs to, or null if it doesn't belong to any.
 */
function getLayer(
  relPath: string,
  config: LayerConfig
): string | null {
  for (const layer of config.layers) {
    for (const pattern of layer.paths) {
      if (matchesGlob(relPath, pattern)) {
        return layer.name;
      }
    }
  }
  return null;
}

/**
 * Check if a file path matches any cross-cutting pattern.
 */
function isCrossCutting(relPath: string, config: LayerConfig): boolean {
  for (const pattern of config.crossCutting) {
    if (matchesGlob(relPath, pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve a relative import specifier to a project-relative path.
 * Returns null if the import is a package (not relative).
 */
function resolveImport(
  importSpecifier: string,
  importerPath: string
): string | null {
  // Skip non-relative imports (npm packages, node: builtins, aliases)
  if (
    !importSpecifier.startsWith(".") &&
    !importSpecifier.startsWith("/")
  ) {
    return null;
  }

  const importerDir = path.dirname(importerPath);
  let resolved = path.resolve(PROJECT_ROOT, importerDir, importSpecifier);

  // Normalize to project-relative
  let relPath = path.relative(PROJECT_ROOT, resolved).replace(/\\/g, "/");

  // Try common extensions if the resolved path doesn't exist as-is
  const extensions = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"];
  if (!fs.existsSync(path.join(PROJECT_ROOT, relPath))) {
    for (const ext of extensions) {
      const candidate = relPath + ext;
      if (fs.existsSync(path.join(PROJECT_ROOT, candidate))) {
        return candidate;
      }
    }
  }

  return relPath;
}

// ─── Config Loading ──────────────────────────────────────

const LAYERS_CONFIG_PATH = path.join(PROJECT_ROOT, "layers.json");
let layersConfig: LayerConfig | null = null;
let configError: string | null = null;

if (fs.existsSync(LAYERS_CONFIG_PATH)) {
  try {
    const raw = JSON.parse(fs.readFileSync(LAYERS_CONFIG_PATH, "utf-8"));

    // Validate structure
    if (!Array.isArray(raw.layers)) {
      configError = "layers.json: 'layers' must be an array";
    } else if (
      typeof raw.allowedDependencies !== "object" ||
      raw.allowedDependencies === null
    ) {
      configError = "layers.json: 'allowedDependencies' must be an object";
    } else if (!Array.isArray(raw.crossCutting)) {
      configError = "layers.json: 'crossCutting' must be an array";
    } else {
      // Validate each layer has required fields
      for (const layer of raw.layers) {
        if (!layer.name || !Array.isArray(layer.paths)) {
          configError = `layers.json: each layer must have 'name' (string) and 'paths' (array)`;
          break;
        }
        if (!(layer.name in raw.allowedDependencies)) {
          configError = `layers.json: layer "${layer.name}" missing from allowedDependencies`;
          break;
        }
      }

      if (!configError) {
        layersConfig = raw as LayerConfig;
      }
    }
  } catch (e) {
    configError = `layers.json: invalid JSON — ${(e as Error).message}`;
  }
}

// ─── Layer Boundary Tests ────────────────────────────────

describe("Layer boundaries", () => {
  it("layers.json is valid (if present)", () => {
    if (!fs.existsSync(LAYERS_CONFIG_PATH)) {
      return; // No config — skip silently
    }
    if (configError) {
      expect.fail(
        `${configError}\n\nFix: Check layers.json against layers.json.example for the expected format.`
      );
    }
  });

  it("imports respect layer boundaries", () => {
    if (!layersConfig) return; // No config or invalid — skip

    // Collect all source files from all layer paths
    const allFiles: string[] = [];
    for (const layer of layersConfig.layers) {
      for (const pattern of layer.paths) {
        allFiles.push(...findFiles(pattern));
      }
    }

    const violations: string[] = [];

    for (const absPath of allFiles) {
      const relPath = path.relative(PROJECT_ROOT, absPath).replace(/\\/g, "/");
      const sourceLayer = getLayer(relPath, layersConfig);
      if (!sourceLayer) continue;

      const imports = extractImports(absPath);
      const allowed = layersConfig.allowedDependencies[sourceLayer] || [];

      for (const imp of imports) {
        const resolvedImport = resolveImport(imp, relPath);
        if (!resolvedImport) continue; // External package — skip

        // Cross-cutting modules are always allowed
        if (isCrossCutting(resolvedImport, layersConfig)) continue;

        const targetLayer = getLayer(resolvedImport, layersConfig);
        if (!targetLayer) continue; // Not in any layer — skip

        // Same-layer imports are always allowed
        if (targetLayer === sourceLayer) continue;

        // Check if the target layer is in the allowed list
        if (!allowed.includes(targetLayer)) {
          violations.push(
            `VIOLATION: ${relPath} (layer: ${sourceLayer}) imports ${resolvedImport} (layer: ${targetLayer})\n` +
            `  Allowed dependencies for "${sourceLayer}": ${allowed.length > 0 ? allowed.join(", ") : "(none)"}\n` +
            `  Fix: Move this logic to a service in an allowed layer, or add "${targetLayer}" to allowedDependencies["${sourceLayer}"] in layers.json if this dependency is intentional.`
          );
        }
      }
    }

    if (violations.length > 0) {
      expect.fail(
        `Found ${violations.length} layer boundary violation(s):\n\n${violations.join("\n\n")}`
      );
    }
  });
});

// ─── Non-Layer Structural Tests ──────────────────────────

describe("Structural rules", () => {
  it("source files should not contain hardcoded localhost URLs", () => {
    const sourceFiles = [
      ...findFiles("src/**/*.ts"),
      ...findFiles("src/**/*.tsx"),
      ...findFiles("lib/**/*.ts"),
      ...findFiles("app/**/*.ts"),
      ...findFiles("app/**/*.tsx"),
    ];

    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of sourceFiles) {
      const lines = fs.readFileSync(file, "utf-8").split("\n");
      lines.forEach((text, index) => {
        const trimmed = text.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
        if (file.includes(".test.") || file.includes(".spec.")) return;

        if (/https?:\/\/localhost[:/]/.test(text)) {
          violations.push({
            file: path.relative(PROJECT_ROOT, file),
            line: index + 1,
            text: trimmed,
          });
        }
      });
    }

    if (violations.length > 0) {
      const report = violations
        .map((v) => `  ${v.file}:${v.line} — ${v.text}`)
        .join("\n");
      expect.fail(
        `Found ${violations.length} hardcoded localhost URL(s):\n${report}\n\nFix: Use environment variables (e.g., process.env.API_URL) instead of hardcoded URLs.`
      );
    }
  });

  it("no .env files besides .env.example in repo", () => {
    const entries = fs.readdirSync(PROJECT_ROOT);
    const envFiles = entries.filter(
      (name) => name.startsWith(".env") && name !== ".env.example"
    );

    if (envFiles.length > 0) {
      expect.fail(
        `Found .env file(s) that should not be committed: ${envFiles.join(", ")}\n\n` +
        `Fix: Add these to .gitignore and remove from version control. Use .env.example as a template with placeholder values.`
      );
    }
  });
});

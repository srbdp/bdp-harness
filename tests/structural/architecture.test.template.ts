// Rename to .test.ts and customize for your project
//
// Structural tests verify architectural rules at build time.
// They catch violations like forbidden imports, circular dependencies,
// and hardcoded values before they reach production.

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { globSync } from "node:fs";

// ─── Helpers ─────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, "../..");

/**
 * Find files matching a glob pattern relative to the project root.
 * Uses Node's built-in globSync (Node 22+) or falls back to manual walk.
 */
function findFiles(pattern: string, baseDir: string = PROJECT_ROOT): string[] {
  // For simple patterns like "src/**/*.ts", walk the directory tree
  const results: string[] = [];
  const ext = path.extname(pattern);
  const dirPrefix = pattern.split("*")[0];
  const searchDir = path.join(baseDir, dirPrefix);

  if (!fs.existsSync(searchDir)) return results;

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
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

// ─── Tests ───────────────────────────────────────────────

describe("Architectural rules", () => {
  it.todo("UI components should not import server-side modules");
  // Example: files in src/components/ should not import from "node:fs",
  // "node:child_process", database clients, or server-only libraries.

  it.todo("No circular dependencies between modules");
  // Build an import graph from extractImports() and check for cycles
  // using depth-first search.

  it.todo("API routes should export validation schemas");
  // Each file in src/app/api/ (or pages/api/) should export a schema
  // constant, enforcing input validation at the boundary.

  it.todo("No .env files besides .env.example in repo");
  // Walk the project root for .env* files and assert only .env.example exists.
  // This prevents accidental secret commits.

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
        // Skip comments and test files
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
        `Found ${violations.length} hardcoded localhost URL(s):\n${report}\n\nUse environment variables instead.`
      );
    }
  });
});

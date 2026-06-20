/**
 * Guardrail against new hardcoded user-facing presentation text.
 *
 * This check intentionally starts with the current CLI output boundary:
 * direct writes to stdout/stderr and parsed error-message literals. It keeps
 * stable technical data, format helpers, and localization catalog text out of
 * scope so the guard is useful without blocking domain code.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PRESENTATION_DIRS = ["apps/cli/src"];

const DIRECT_PRESENTATION_PATTERNS = [
  /\bconsole\.(?:log|error)\(\s*(["'`])[^"'`]*[A-Za-z][^"'`]*\1/u,
  /\bio\.(?:stdout|stderr)\(\s*(["'`])[^"'`]*[A-Za-z][^"'`]*\1/u,
  /\bmessage:\s*(["'`])[^"'`]*[A-Za-z][^"'`]*\1/u,
] as const;

/**
 * Runs the localized-presentation-text check and exits non-zero on violations.
 */
async function main(): Promise<void> {
  const violations: string[] = [];

  for (const dir of PRESENTATION_DIRS) {
    for (const file of await listTypeScriptFiles(join(ROOT, dir))) {
      const source = await readFile(file, "utf8");
      const lines = source.split("\n");

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index] ?? "";

        if (isAllowedLine(line)) {
          continue;
        }

        for (const pattern of DIRECT_PRESENTATION_PATTERNS) {
          if (pattern.test(line)) {
            violations.push(`${relative(ROOT, file)}:${index + 1}: ${line.trim()}`);
            break;
          }
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error("Hardcoded presentation text found. Use @game/i18n labels instead:");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Localized presentation text check: OK");
}

/**
 * Recursively lists non-test TypeScript source files under one presentation dir.
 */
async function listTypeScriptFiles(dir: string): Promise<readonly string[]> {
  const files: string[] = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listTypeScriptFiles(path));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(path);
    }
  }

  return files;
}

/**
 * Allows localization calls and non-user-facing plumbing around console output.
 */
function isAllowedLine(line: string): boolean {
  return (
    line.includes("text(") ||
    line.includes("createTranslator(") ||
    line.includes("console.log(line)") ||
    line.includes("console.error(line)") ||
    line.trim().startsWith("*")
  );
}

await main();

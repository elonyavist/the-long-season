/**
 * Absence assertion for the web four-role collapse (Phase 81 Step 02).
 *
 * `playerSquadDepartment` is the single owner of "which department does this
 * player belong to". It is a total `Record<PlayerRole, PlayerSquadDepartment>`,
 * so adding a canonical role fails the build instead of falling into a default.
 *
 * Step 13's absence check found four independent re-implementations of that rule
 * in `apps/web`, which had already drifted apart: all four classified `winger` as
 * a midfielder where the owner says attacker, two of them classified `wing_back`
 * as a midfielder where the other two agreed with the owner, and two carried a
 * `wide_forward` branch matching no member of the union. A player's department
 * therefore depended on which screen was open. This check exists so a fifth copy
 * cannot appear quietly.
 *
 * It is deliberately narrow, and it looks for the shape the drifted copies had:
 * a file that reads `primaryRole` and returns department words as literals. The
 * key is what makes this the department rule. Mapping a formation slot, a board
 * role code, or a football position to the same four words answers a different
 * question, so those are not flagged - the check would be worthless if it cried
 * wolf on `roleKeyForDomainSlot`, and an ignored check protects nothing.
 */
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

/** Where a second implementation of the department rule would appear. */
const SCANNED_ROOTS = ["apps/web/src", "packages/ui/src"] as const;

/** The four department words the drifted copies returned. */
const DEPARTMENT_WORDS = ["goalkeeper", "defender", "midfielder", "attacker"] as const;

/** What makes a classification the department rule rather than a lookalike. */
const PLAYER_ROLE_KEYED = /\bprimaryRole\b/u;

/**
 * Test sources, which are checked by the suite rather than by this assertion.
 *
 * A fixture builder that hands a board player a department word is not a second
 * owner of the rule; like the squad-depth assertion, this one guards production
 * paths.
 */
const TEST_SOURCE = /\.(?:test|spec)\.tsx?$/u;

/**
 * How many distinct department words a returned-literal cluster may reach.
 *
 * Two is a partial test such as `role === "goalkeeper" ? ... : ...`, which is a
 * question about one department rather than a competing classification. Three is
 * the collapse.
 */
const MAXIMUM_DISTINCT_RETURNED_WORDS = 2;

/** Runs the absence assertion and exits non-zero on violations. */
async function main(): Promise<void> {
  const violations: string[] = [];
  let scannedFileCount = 0;

  for (const scannedRoot of SCANNED_ROOTS) {
    for await (const file of sourceFiles(join(ROOT, scannedRoot))) {
      if (TEST_SOURCE.test(file)) {
        continue;
      }

      scannedFileCount += 1;
      const source = await readFile(file, "utf8");

      if (!PLAYER_ROLE_KEYED.test(source)) {
        continue;
      }

      const returned = new Set(
        DEPARTMENT_WORDS.filter((word) => new RegExp(`return "${word}"`, "u").test(source)),
      );

      if (returned.size > MAXIMUM_DISTINCT_RETURNED_WORDS) {
        violations.push(`${relative(ROOT, file)}: returns ${[...returned].sort().join(", ")}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error("Presentation code must reach a player's department through playerSquadDepartment:");
    for (const violation of violations) {
      console.error(`  ${violation}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Role department owner check: OK (${scannedFileCount} presentation files)`);
}

/** Yields every TypeScript source file under one directory; the caller filters. */
async function* sourceFiles(directory: string): AsyncGenerator<string> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      yield* sourceFiles(path);
      continue;
    }

    if (extname(entry.name) === ".ts" || extname(entry.name) === ".tsx") {
      yield path;
    }
  }
}

await main();

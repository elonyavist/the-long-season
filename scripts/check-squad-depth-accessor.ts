/**
 * Absence assertion for the single squad-depth accessor (Phase 81 A6).
 *
 * `Club.playerIds` is stored ownership. Every path that decides *who a club can
 * field* must go through `fieldablePlayerIds` / `fieldablePlayerIdsFor` instead,
 * because Phase 82A introduces loans and ownership stops answering that
 * question. One accessor makes that a single-definition change; a direct read
 * hard-codes "owned" into a question that is really "selectable".
 *
 * The check is deliberately narrow. It guards the files that compose a lineup,
 * a bench, or a matchday squad. Market, finance, and persistence code legitimately
 * reads stored ownership and is out of scope here; Phase 82A revisits it under
 * its own contract.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

/** Files that compose a lineup, a bench, or a matchday squad. */
const LINEUP_COMPOSING_FILES = [
  "packages/engine/src/career/career-ai-team-selection.ts",
  "packages/engine/src/career/progress-fixture.ts",
  "apps/web/src/features/matchday/matchday-adapter.ts",
  "apps/web/src/features/match-preparation/match-preparation-adapter.ts",
  "apps/cli/src/commands/career/preparation.ts",
  "apps/cli/src/commands/career/progression.ts",
  "apps/cli/src/commands/career/matchday-output.ts",
  "apps/cli/src/commands/fake-season-input.ts",
  "apps/cli/src/commands/live-match-control-report-data.ts",
] as const;

/** Direct reads of a club roster, in the shapes this codebase actually uses. */
const DIRECT_ROSTER_READ = /\b(?:club|selectedClub|sellingClub|buyingClub|clubs\[[^\]]*\])\??\.playerIds\b/u;

/** Runs the absence assertion and exits non-zero on violations. */
async function main(): Promise<void> {
  const violations: string[] = [];

  for (const file of LINEUP_COMPOSING_FILES) {
    const source = await readFile(join(ROOT, file), "utf8");

    source.split("\n").forEach((line, index) => {
      if (DIRECT_ROSTER_READ.test(line)) {
        violations.push(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }

  if (violations.length > 0) {
    console.error("Lineup-composing paths must reach squad depth through fieldablePlayerIds:");
    for (const violation of violations) {
      console.error(`  ${violation}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Squad depth accessor check: OK (${LINEUP_COMPOSING_FILES.length} lineup-composing files)`);
}

await main();

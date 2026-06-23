# CLI Adapter Decomposition Report

Date: 2026-06-22
Phase: `44-cli-adapter-decomposition-and-presentation-boundaries`
Status: Complete

## Summary

Phase 44 reduced the `simulate-season` CLI adapter from a broad all-in-one
command file into a smaller command adapter plus named output and builder
modules.

No gameplay behavior, engine algorithm, generated content tuning, balance target,
or localization catalog was changed for product effect. The phase was a
readability and architecture hardening pass: make the current CLI easier to
trace now, and make future UI-facing presentation contracts easier to extract
later.

## Files Changed In This Phase

Source:

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season/fixture-detail-output.ts`
- `apps/cli/src/commands/simulate-season/demo-builders.ts`
- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`
- `apps/cli/src/commands/simulate-season/demo-output.ts`
- `apps/cli/src/commands/simulate-season/season-summary-output.ts`

Documentation:

- `docs/audits/CLI_SIMULATE_SEASON_DECOMPOSITION_AUDIT.md`
- `docs/audits/CLI_PRESENTATION_BOUNDARY_REVIEW.md`
- `docs/audits/CLI_ADAPTER_DECOMPOSITION_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`

## Modules Created

| Module | Responsibility |
|---|---|
| `fixture-detail-output.ts` | Fixture result detail, event rows, all-starter player match stats, scorer lines, and optional match explanation trace output. |
| `demo-builders.ts` | CLI-owned setup, lineup, condition, and fixture-scoped inspection builders plus demo types. |
| `generated-inspection-output.ts` | Identity review and player-generation report construction/output. |
| `demo-output.ts` | Setup, condition, lineup, fixture-lineup, and manual tactic switch inspection output. |
| `season-summary-output.ts` | Default season summary, final table, top-player summaries, best/worst team rows, and round fixture/scorer output. |

## What Improved

- `simulate-season.ts` is now primarily an adapter: parse result handling,
  generated content creation, simulation bridge, mode dispatch, and stdout/stderr
  writes.
- Output families can be found by file name instead of by scanning one large
  command file.
- Demo construction moved out of the adapter without becoming engine logic.
- Fixture detail and season summary output now have clearer, testable ownership.
- `docs/ARCHITECTURE.md` now reflects the current simulate-season module map.

## Behavior Preserved

The phase intentionally preserved:

- deterministic season simulation;
- fixture detail output;
- match explanation trace output;
- round output;
- formation-fit inspection;
- player-generation report;
- identity review;
- market-demo output;
- condition, setup, lineup, and manual tactic switch inspection;
- strict `calibration-v1` balance behavior.

## Remaining Risks

| Risk | Current Decision |
|---|---|
| `career/format.ts` is still a large presentation file. | Decompose it next if the project continues toward playable career UI/readability. |
| `ten-season-report.ts` still mixes long-run setup, report assembly, CLI output, and Markdown output. | Split after career presentation unless long-run reporting becomes the immediate focus. |
| Some simulate-season modules still mix report building and rendering. | Accept for now because the facts are command-specific inspection tools; split only when reused by UI or when readability declines. |
| No UI view models exist yet. | Correct for this phase; create them only when a UI phase needs stable presentation contracts. |

## Checks Run

Final phase checks:

- `test -f docs/audits/CLI_ADAPTER_DECOMPOSITION_REPORT.md`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `pnpm cli simulate-season --seed=world-a --round=1`
- `pnpm cli simulate-season --seed=world-a --formation-fit=4-2-3-1`
- `pnpm cli simulate-season --seed=world-a --player-generation-report`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-a --market-demo=pro01-affordable-permanent`
- `pnpm cli simulate-season --seed=world-a --condition-demo=pro01-season`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000003 --lineup-demo=pro01-rotated`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000003 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Recommended Next Phase

Recommended next phase:

`Phase 45 - Career Presentation Decomposition And View-Model Readiness`

Reason: the playable career loop is the core product direction, and
`apps/cli/src/commands/career/format.ts` is the next large presentation boundary.
Splitting it by output family would make career summary, preparation, fixture
progression, development, and market outputs easier to understand and easier to
map into a future UI without changing gameplay.

Do not start UI in that phase. First make the career presentation layer as clear
as the simulate-season presentation layer became in Phase 44.

# Architecture CLI Slimming Plan

Date: 2026-06-22
Phase: `43-architecture-hardening-and-package-rework`
Step: `04-cli-command-slimming-plan-and-first-slice`

## Summary

The first CLI slimming slice targets `apps/cli/src/commands/career.ts`.

Reason:

- it is smaller and lower-risk than `simulate-season.ts` and `ten-season-report.ts`;
- it already has submodules for parsing, progression, preparation, scenarios, types, and formatting;
- it still contained two pure season-lab computations that were not command dispatch:
  - `buildCareerDevelopmentReport`;
  - `rolloverCareerSeason`.

Adopted slice:

- move the pure development-report and rollover-season helpers into `apps/cli/src/commands/career/season-labs.ts`;
- keep command flags and output stable;
- keep formatting in `career/format.ts`;
- keep storage and command dispatch in `career.ts`.

## Intended Career Command Shape

The target shape is:

| Layer | Current file | Responsibility |
|---|---|---|
| Parse intent | `career/parse-career-args.ts` | Convert CLI args into a typed command mode. |
| Execute preparation | `career/preparation.ts` | Save selected lineup/tactic demo preparation. |
| Execute progression | `career/progression.ts` | Build caller-supplied contexts and call engine career advancement. |
| Execute scenarios | `career/scenarios.ts` | Build new-world and market-demo career states. |
| Execute season labs | `career/season-labs.ts` | Pure in-memory development report and completed-season rollover helpers. |
| Render result | `career/format.ts` | Localized CLI output. |
| Command adapter | `career.ts` | Storage, dispatch, save/no-save decisions, and IO. |

## First Slice Implemented

Moved from `career.ts` to `career/season-labs.ts`:

- development-report result types;
- development-report builder;
- season-rollover result types;
- season-rollover builder;
- private helper functions used only by those builders.

No command flags changed.
No localized output changed.
No engine/content/storage dependency rule changed.

## Files Explicitly Not Touched Yet

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season/parse-args.ts`
- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career/parse-career-args.ts`

These remain valid future candidates, but this step avoids broad CLI churn.

## Future CLI Slimming Recommendations

1. Split `simulate-season.ts` by inspection mode only after a dedicated phase or step.
2. Move pure long-run report model logic from `ten-season-report.ts` to `@game/simulation-tools` in Step 06.
3. Consider splitting `career/format.ts` by output family only after `docs/ARCHITECTURE.md` documents current presentation entry points.

## Verification

- Focused CLI and i18n tests: passed.
- `pnpm check`: passed.
- Career CLI smoke commands: passed:
  - `pnpm cli career --save=phase43-cli --seed=world-a --new-world-preview`
  - `pnpm cli career --save=phase43-cli --summary`
  - `pnpm cli career --save=phase43-cli --squad`
- `git diff --check`: passed.

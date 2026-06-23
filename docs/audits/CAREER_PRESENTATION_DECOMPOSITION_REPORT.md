# Career Presentation Decomposition Report

Date: 2026-06-23
Phase: `45-career-presentation-decomposition-and-view-model-readiness`

## Outcome

Phase 45 decomposed the career CLI presentation layer by product/output family.
Before this phase, most career rendering lived in one broad
`apps/cli/src/commands/career/format.ts` file. After the phase, each major career
output has a named module and `format.ts` is a shared helper module.

No gameplay, save schema, market, rollover, player generation, condition,
development, or localization behavior was intentionally changed.

## Source Files Changed

- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career/overview-output.ts`
- `apps/cli/src/commands/career/preparation-output.ts`
- `apps/cli/src/commands/career/matchday-output.ts`
- `apps/cli/src/commands/career/roster-output.ts`
- `apps/cli/src/commands/career/development-output.ts`
- `apps/cli/src/commands/career/market-output.ts`
- `apps/cli/src/commands/career/season-rollover-output.ts`

## Documentation Files Changed

- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_AUDIT.md`
- `docs/audits/CAREER_PRESENTATION_BOUNDARY_REVIEW.md`
- `docs/audits/CAREER_PRESENTATION_DECOMPOSITION_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`

## Modules Created

- `overview-output.ts`
  - new-world preview;
  - career summary;
  - career inspect.
- `preparation-output.ts`
  - saved lineup;
  - saved tactic;
  - persisted match-preparation summary lines.
- `matchday-output.ts`
  - career fixture advancement;
  - pre-match recovery lines;
  - post-match condition lines;
  - optional explanation trace.
- `roster-output.ts`
  - senior squad inspection;
  - youth academy inspection.
- `development-output.ts`
  - multi-season development report.
- `market-output.ts`
  - permanent-transfer apply output.
- `season-rollover-output.ts`
  - season rollover output.

## Behavior Preserved

Preserved:

- career save creation and loading;
- summary and inspect output shape;
- squad and youth academy inspection;
- selected lineup and tactic save behavior;
- career fixture advancement behavior;
- condition recovery/spend rules;
- optional fixture explanation trace semantics;
- development report simulation;
- permanent-transfer apply behavior;
- rollover validation and output;
- localized text key usage.

Known preserved behavior:

- `career --rollover-season` exits `1` on a freshly created save because the
  current season is incomplete. Phase 45 verified this invalid output path but
  did not change it.

## Current Shape

`apps/cli/src/commands/career.ts` is still the save/dispatch adapter.

`apps/cli/src/commands/career/format.ts` is now a shared presentation helper
module. It is no longer the owner of broad career output families.

The career presentation layer is now traceable by file name:

- overview;
- preparation;
- matchday;
- roster/youth;
- development;
- market;
- rollover.

## Remaining Risks

1. `parse-career-args.ts` remains broad at 810 lines.
   - This is a parsing hotspot, not a presentation blocker.

2. `season-labs.ts` remains broad at 448 lines.
   - It can split later if lab commands grow.

3. `career/format.ts` is still named `format.ts` even though it is now a helper
   module.
   - Renaming to `presentation-helpers.ts` is reasonable later, but not required
     to continue.

4. No UI-facing view-model contracts exist yet.
   - This is intentional. The phase made the CLI presentation layer easier to
     trace first.

## Verification

Completed checks:

- `test -f docs/audits/CAREER_PRESENTATION_DECOMPOSITION_REPORT.md`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm check`
- `pnpm cli career --save=phase45-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-check --summary`
- `pnpm cli career --save=phase45-check --inspect`
- `pnpm cli career --save=phase45-check --squad`
- `pnpm cli career --save=phase45-check --youth-academy`
- `pnpm cli career --save=phase45-check --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase45-check --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase45-check --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase45-check --development-report`
- `pnpm cli career --save=phase45-market --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-market --apply-market-demo=pro01-affordable-permanent`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Recommended Next Phase

Recommended next phase:

`46-ten-season-report-decomposition-and-long-run-presentation-boundaries`

Reason:

The career command presentation layer is now easier to navigate. The remaining
large CLI/reporting hotspot is the long-run report command, which is important
for judging whether the game stays fun and structurally stable over many seasons.
That work should stay separate from UI implementation and should not start until
Phase 46 is explicitly documented.

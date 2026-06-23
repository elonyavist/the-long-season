# 05 - Long-Run Manual Inspection Command Review

## Goal

Document and, only if necessary, lightly improve how a developer or designer
manually inspects long-run report output.

This step should make it clear which commands to run when reviewing whether the
game remains fun and structurally stable across seasons.

## Expected files

- `docs/audits/LONG_RUN_MANUAL_INSPECTION_GUIDE.md`
- `apps/cli/src/commands/ten-season-report.ts`, only if command help or wording
  has a narrow documented gap.
- `apps/cli/src/commands/ten-season-report/*`, only if Step 03 created section
  modules that need tiny inspection text changes.
- Focused tests for touched source files.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create `docs/audits/LONG_RUN_MANUAL_INSPECTION_GUIDE.md`.
- Include practical command examples for:
  - quick smoke inspection;
  - medium sample inspection;
  - deeper gate-style inspection when runtime allows.
- Explain what to review in the output:
  - world survival;
  - squad-size stability;
  - youth pipeline pressure;
  - table spread and champion variety;
  - scoring and assist concentration;
  - transfer turnover;
  - player growth and aging.
- Add source changes only if current command wording blocks manual inspection.
- Prefer documentation over adding new flags.

## What NOT to implement

- Do not add new long-run simulation behavior.
- Do not add new gates.
- Do not add new CLI flags unless the existing command cannot support manual
  inspection and the need is documented.
- Do not change warning semantics.
- Do not start UI work.

## Required checks

- `test -f docs/audits/LONG_RUN_MANUAL_INSPECTION_GUIDE.md`
- Focused tests for touched source files, if any.
- `pnpm --filter @game/cli run typecheck`, if source is touched.
- `pnpm check`, if source is touched.
- `pnpm cli ten-season-report --seed-prefix=phase46-manual --worlds=10 --seasons=10`
- `pnpm cli ten-season-report --seed-prefix=phase46-manual --worlds=50 --seasons=10`
- `git diff --check`

## Definition of Done

- The project has a clear manual inspection guide for long-run reports.
- The guide says what to review and why it matters for user fun.
- Any source changes are narrow, tested, and presentation-only.

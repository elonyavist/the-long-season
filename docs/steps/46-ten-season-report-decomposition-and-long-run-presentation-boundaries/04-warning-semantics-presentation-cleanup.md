# 04 - Warning Semantics Presentation Cleanup

## Goal

Make long-run warning presentation clearer without hiding real gameplay signals.

Warnings should help answer product questions: is the world still fun, credible,
and structurally healthy over time? This step should improve wording, grouping,
or documentation around warning meaning. It should not tune systems just to
remove warnings.

## Expected files

- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report/*`
- `packages/simulation-tools/src/long-run/*`, only if warning status labels or
  structured semantics must be clarified close to the diagnostics.
- `packages/i18n/src/*`, only if localized labels need to change.
- `docs/audits/LONG_RUN_WARNING_PRESENTATION_REVIEW.md`
- Focused tests for touched files.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Review each warning/fail family exposed by the ten-season report.
- Classify warnings as:
  - gameplay risk;
  - monitoring signal;
  - healthy football variance;
  - likely threshold or wording mismatch.
- Create `docs/audits/LONG_RUN_WARNING_PRESENTATION_REVIEW.md`.
- Improve CLI wording or grouping only where it helps the user understand the
  gameplay meaning.
- Keep the report honest: do not downgrade, suppress, or hide a real issue.
- If a threshold appears semantically wrong, document it as a future gameplay or
  diagnostics step rather than changing it in this presentation step.

## What NOT to implement

- Do not remove warnings to make the report pass.
- Do not change gate thresholds unless the step explicitly proves a naming-only
  semantic mismatch and keeps behavior equivalent.
- Do not change simulation behavior.
- Do not change market, youth, development, player generation, or match engine
  behavior.
- Do not add UI.

## Required checks

- `test -f docs/audits/LONG_RUN_WARNING_PRESENTATION_REVIEW.md`
- Focused tests for touched files.
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck`, if simulation-tools is
  touched.
- `pnpm --filter @game/i18n run typecheck`, if localization is touched.
- `pnpm check`
- `pnpm cli ten-season-report --seed-prefix=phase46-warning --worlds=50 --seasons=10`
- `git diff --check`

## Definition of Done

- Warning presentation explains gameplay meaning more clearly.
- The report still surfaces real long-run concerns.
- Any threshold concern is documented as a future scoped rework, not hidden.
- `docs/PROJECT_STATUS.md` records the adopted presentation cleanup.

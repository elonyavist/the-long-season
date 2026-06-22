# 04 - CLI Pre-Match Readiness Output

## Goal

Expose compact recovery and readiness information in career CLI outputs so the user can inspect matchday condition without receiving tactical advice.

## Expected files

- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/labels.ts`
- Other touched career CLI files only if required by the existing architecture.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Show recovery information in the relevant career advance output.
- Keep output compact and scannable.
- Include enough facts to inspect:
  - recovery day count;
  - selected-club affected players;
  - before and after readiness summary;
  - post-match condition summary when available.
- Ensure `career --summary` and `career --squad` remain useful after one or more fixture advances.
- Localize new labels through the i18n layer.
- Use English fallback.
- Avoid hardcoded user-facing labels that would be useful to CLI or UI.
- Add tests for English output.
- Add focused localization coverage for Italian when practical.

## What NOT to implement

- Do not add advice such as "rotate this player".
- Do not add UI.
- Do not add injury, morale, training, or staff text.
- Do not persist rendered text in saves.
- Do not introduce large output tables unless required for inspection.

## Required checks

- Focused CLI and i18n tests for touched files.
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm check`
- `pnpm cli career --save=phase42-check --summary`
- `pnpm cli career --save=phase42-check --advance-next-fixture`
- `pnpm cli career --save=phase42-check --squad`
- `git diff --check`

## Definition of Done

- Career CLI output makes recovery visible.
- Output remains inspection-focused and not advisory.
- All new user-facing labels are localized.


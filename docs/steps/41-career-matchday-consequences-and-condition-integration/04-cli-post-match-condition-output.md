# Step 04 - CLI Post-Match Condition Output

## Goal

Show compact post-match condition consequences in career CLI output without
turning the command into a broad report or giving lineup advice.

## Context

After Step 03, career advancement changes player condition. The manager needs a
small, readable output that says what changed and why the next lineup decision
matters.

## Expected files

- `apps/cli/src/commands/career/format.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/labels.ts`
- touched parser/progression files only if the existing result shape requires it
- `docs/audits/CAREER_MATCHDAY_CONDITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document, only if a lesson learned changes future work

## Implementation checklist

- Add a compact post-match condition section to successful career advancement.
- Show only factual consequences:
  - starters who spent condition;
  - before and after fitness;
  - delta;
  - rested first-team players if available from saved preparation.
- Keep output localized.
- Keep default output readable.
- Do not recommend rotation.
- Add tests for English and at least one localized smoke if labels change.
- Update audit and status.

## What NOT to implement

- Do not add a full squad report inside `advance-next-fixture`.
- Do not add tactical advice.
- Do not add injuries, morale, or form.
- Do not change save behavior beyond condition already wired in Step 03.

## Required checks

- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm check`
- `pnpm cli career --save=phase41-check --advance-next-fixture`
- `pnpm cli career --save=phase41-check --squad`
- `git diff --check`

## Definition of Done

- The manager can see condition consequences after a played career fixture.
- Output is factual, localized, and compact.
- No automatic lineup/tactic decision is introduced.
- `docs/PROJECT_STATUS.md` is updated.

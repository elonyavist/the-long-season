# Step 05 - Half-Time Tab Shell And Summary Hierarchy

## Status

Ready.

## Goal

Turn the interval into a focused decision workspace with a compact summary and
accessible tabs instead of simultaneous competing panels.

## User-Visible Outcome

- Half time keeps score, latest commentary, and first-half tabellino above the
  decision workspace.
- The workspace exposes four compact tabs: `Sintesi`, `Tattica`, `La tua
  squadra`, and `Avversario`.
- `Sintesi` opens by default and answers what happened plus which selected-club
  players need attention.
- Decision signals appear as small indicators tied to player facts, not as a
  separate dashboard card.
- One Start second half action is always located consistently and enabled only
  when the tactical draft is valid.

## Scope

1. Add one phase-local accessible tab composition for half time.
2. Keep active tab ephemeral and reset it deterministically when entering a new
   interval.
3. Recompose current decisive events, watch list, contributors, validation, and
   substitution count into the Summary tab.
4. Remove the old side-by-side first-half review and decision-signals panels.
5. Keep the current validation owner and one resume action.
6. Define focus behavior when changing tabs and when validation changes.

## Implementation Contract

- Tabs select presentation only; they never mutate match, tactic, lineup, or
  persistence state.
- Summary derives only from current structured review/player facts.
- A player signal must be compact, explainable, and tied to rating, condition,
  status, or contribution already present in the row.
- No generated coaching advice, emotional judgment, or hidden recommendation.
- Tab semantics and keyboard behavior must work before visual polish is
  accepted.

## Expected Files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.test.tsx`
- `apps/web/src/features/matchday/MatchdayPhaseTabs.tsx`
- `apps/web/src/features/matchday/MatchdayPhaseTabs.test.tsx`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No tactical-board layout change; Step 06 mounts it in the tab.
- No full-time tabs.
- No team-talk, tactical-advice generator, morale choice, or new match decision.
- No generic application-wide tabs package.
- No persistence of active tab.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Capture event-rich, event-light, leading, level, and trailing Summary states
  at desktop and narrow widths.
- Verify tab list is visually smaller than buttons and active state is clear.
- Navigate tabs with keyboard arrows, Home/End, Enter/Space, and pointer.
- Verify score/commentary/tabellino remain stable above the changing panel.
- Verify the resume action is unique, reachable, and reflects validation.

## Cleanup Boundary

Delete the old review/signals grid, duplicated headings, selectors, labels, and
tests after Summary provides the same truthful decision support. Do not leave
the previous panels hidden behind CSS.

## Completion Criteria

- Half time has one accessible four-tab shell.
- Summary is concise, football-specific, and decision-supporting.
- Existing signals are integrated without duplicate panels or invented advice.
- One validation owner and one resume command remain.
- The user can inspect Summary and the tab interaction before Step 06.


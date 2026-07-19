# Step 01 - Pre-Match Workspace And Full-Width Content Contract

## Status

Done.

## Goal

Establish the final Matchday page geometry and remove the duplicated pre-match
information before changing live playback.

## User-Visible Outcome

- The persistent career sidebar keeps its current width and behavior.
- Matchday fills 100% of the remaining shell content outlet.
- The scoreboard is the only fixture summary.
- The redundant lower `Ready to play`, `Fixture`, and `Venue` card is gone.
- Pre-match presents one short confirmation line and one Start match action.
- The first useful viewport is football content, not repeated metadata.

## Scope

1. Lock the shell/content geometry with an explicit Matchday layout test.
2. Remove the redundant pre-match detail card and its copy.
3. Recompose the pre-match scoreboard into a full-width broadcast header.
4. Keep phase, minute, round, venue orientation, club names, score, and Start
   match only where each fact has a unique purpose.
5. Preserve command pending/error feedback and focus behavior.
6. Delete replaced selectors, labels, and assertions after the new state passes.

## Implementation Contract

- Do not change `AppShell` navigation behavior or sidebar width unless a local
  CSS correction is required to make the existing content contract explicit.
- Matchday may not introduce an internal page-level aside.
- The action remains explicit because starting the match is a manager
  commitment.
- Valid pre-match state must not show raw IDs, fallback words, or duplicated
  venue/fixture prose.

## Expected Files

- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.test.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No live playback, commentary, tabellino, half-time, or full-time redesign.
- No global shell redesign or new rail.
- No engine, persistence, or tactical-board change.
- No decorative empty card replacing the deleted pre-match card.

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

- Capture pre-match at `1440x900`, `1920x1080`, and `390x844`.
- Verify the sidebar is unchanged and the Matchday content touches the full
  usable outlet without an unexplained blank column.
- Verify fixture/venue facts are not repeated below the scoreboard.
- Verify one clear Start match action, visible focus, pending feedback, and no
  horizontal page overflow.

## Cleanup Boundary

Delete the old pre-match detail markup, related labels, selectors, fixtures,
and assertions only after the replacement state is covered. Do not keep a
hidden compatibility branch.

## Completion Criteria

- Matchday owns 100% of the shell content outlet.
- Pre-match contains one information hierarchy and one command.
- No replaced pre-match path remains in production or tests.
- The user can inspect the completed pre-match slice before Step 02 starts.

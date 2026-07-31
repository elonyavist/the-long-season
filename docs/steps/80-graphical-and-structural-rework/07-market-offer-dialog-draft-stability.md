# Step 07 - Market Offer Dialog Draft Stability

## Status

Done.

## Goal

Prevent a transfer-offer draft from disappearing while the manager edits the
club fee or navigates the long player-detail workspace.

## Accepted Semantics

- Market player details are transactional while an offer draft is active.
- Backdrop, blank gutter, and scrollbar interaction do not close that dialog.
- Explicit close and `Escape` remain valid close paths.
- Fee edits survive scrolling and profile-tab changes for the same player.
- Switching to another player still receives that player's own draft identity;
  drafts never leak across targets.
- Successful submission follows the existing command/result lifecycle.

## What To Implement

- Add an explicit backdrop-dismiss policy to `FullScreenDialog`, defaulting to
  current behavior for existing consumers.
- Disable backdrop dismissal for the Market player dialog.
- Add a targeted regression that edits fee, scrolls/uses the gutter, switches
  tabs, returns, verifies the fee, and submits.
- Preserve native focus trap, `Escape`, explicit close, and opener focus
  restoration.
- If reproducing the exact report identifies a narrower current-step cause,
  fix that cause instead and record the lesson without expanding scope.

## What NOT To Implement

- No global removal of light-dismiss behavior.
- No draft persistence, autosave, confirmation dialog, command rewrite, or
  transfer-state change.
- No CSS pointer-event workaround that bypasses dialog semantics.

## Expected Files

- `apps/web/src/features/shared/FullScreenDialog.tsx`
- `apps/web/src/features/shared/FullScreenDialog.test.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/80-graphical-and-structural-rework/README.md`
- `docs/steps/80-graphical-and-structural-rework/07-market-offer-dialog-draft-stability.md`

## Required Checks

```bash
pnpm exec vitest run \
  apps/web/src/features/shared/FullScreenDialog.test.tsx \
  apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx
pnpm --filter @game/web run typecheck
pnpm --filter @game/web exec playwright test \
  src/visual-qa/current-product.spec.ts \
  --grep "Market offer draft survives dialog scrolling and gutter interaction" \
  --workers=1
git diff --check
graphify update .
```

No long run belongs to this step.

## Definition Of Done

- The reported fee-edit journey cannot close through backdrop/gutter/scrollbar
  interaction.
- The edited amount survives same-player tab and scroll navigation.
- Explicit close, `Escape`, submission, and focus restoration still work.
- Other full-screen dialogs retain their documented default behavior.
- Required checks pass and Step 08 is the only next action.

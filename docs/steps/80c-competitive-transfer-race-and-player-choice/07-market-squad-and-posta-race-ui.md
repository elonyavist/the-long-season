# Step 07 - Market, Squad And Posta Race UI

## Status

Not started.

## Goal

Show the race truthfully in the browser: who else is bidding, how much, how long
is left, and what the manager can do about it.

## Expected Files

- `packages/ui/src/career/career-market-view.ts`
- `packages/ui/src/career/career-market-view.test.ts`
- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `packages/ui/src/career/career-inbox-view.ts`
- `packages/ui/src/career/career-inbox-view.test.ts`
- `packages/ui/src/index.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.test.ts`
- `apps/web/src/styles/components.css`
- `docs/steps/80c-competitive-transfer-race-and-player-choice/07-market-squad-and-posta-race-ui.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Show current best offer, whether it is the manager's, current race stage, and
  that stage's shared deadline in the Market offer composer.
- Show one current actionable race conversation in Posta; a raise updates the
  present fact instead of appending a permanent bid-history timeline.
- When the selected club owns the player, keep accept/reject/final-counter
  actions attached to each canonical incoming offer while showing that the
  offers belong to one race.
- Explain that accepting an incoming offer makes it seller-acceptable but does
  not close the race immediately; the shared deadline remains visible and only
  the highest accepted fee plus exact matches can reach player choice.
- Expose the raise action with the minimum acceptable amount visible before
  submission, so a rejected sub-increment raise is avoidable rather than
  punitive.
- Expose three distinct decisions where eligible: match the current best, raise
  by at least the displayed minimum, or walk away.
- When the three active places are full, present the structured
  `race_participant_limit_reached` result without implying that the approach
  was submitted or queued.
- Show `outbid` and `lost_to_rival` as distinct readable outcomes; the manager
  must know whether the fee lost or the player chose another club.
- Never expose rival wage, duration, bonus, or promised squad status. These
  remain private inputs to player choice.
- React renders `@game/ui` facts only. No ranking, increment, deadline, or
  eligibility rule is recomputed in the browser.
- Race state must not be communicated by colour alone; shape and accessible
  text carry it.
- Preserve dense table height, keyboard semantics, focus restoration, narrow
  layout, `200%` text, and reduced motion.
- Localize every visible string across all five languages, ASCII-safe.

## What NOT To Implement

- No separate race screen or new navigation destination.
- No duplicated rule in React.
- No engine, policy, or diagnostic change.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/ui/src/career/career-market-view.test.ts \
  packages/ui/src/career/career-market-target-view.test.ts \
  packages/ui/src/career/career-inbox-view.test.ts \
  packages/i18n/src/labels.test.ts \
  apps/web/src/features/market/career-market-adapter.test.ts \
  apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx \
  apps/web/src/features/inbox/career-inbox-presenter.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
```

## Definition Of Done

- The manager can see the best offer, the deadline, and the minimum raise, and
  can act without leaving Market or Posta.
- Losing on price and losing the player's choice are explicit and distinct.
- No market rule is duplicated in React.
- Manager-owned incoming offers communicate qualification-versus-completion
  correctly; accepting one never looks like an immediate sale.
- Accessibility, narrow layout, `200%` text, and reduced motion do not regress.

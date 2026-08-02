# Step 08 - Squad, Market And Posta Loan UI

## Status

Not started.

## Goal

Expose market postures, incoming offers, final counters, and bidirectional
loans through the existing Squad contextual menu, Market workspace, and Posta.

## What To Implement

- Squad contextual menu:
  - toggle `In vendita`;
  - toggle `Disponibile in prestito`;
  - show combinable posture state;
  - explain active-loan restrictions.
- Market:
  - expose eligible permanent/loan actions;
  - label command eligibility as an available action, not a guarantee that the
    seller will negotiate;
  - present `player_not_for_sale` as an explicit seller response when the
    canonical willingness owner refuses after submission;
  - show parent/temporary club and end-of-season return;
  - select wage share `0/50/100`;
  - preserve transactional dialog draft/focus behavior.
- Posta:
  - show exact original permanent fee or loan wage share;
  - allow accept, reject, or one final counter;
  - show `Controproposta finale`, `Invia controproposta finale`, and
    `In attesa della risposta finale`;
  - do not show a numeric remaining-counter badge.
- Use exact locale-safe money and non-color-only state.
- Preserve keyboard, focus, reduced motion, narrow, and `200%` text behavior.

## What NOT To Implement

- No second loan screen, drag/drop, playing-time promise, option, fee, or
  second counter.
- No React gameplay/eligibility calculation or screen-local persisted posture.
- No duplicated seller-willingness projection or misleading `available to
  negotiate` copy.

## Expected Files

- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-squad-view.test.ts`
- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `packages/ui/src/career/career-inbox-view.ts`
- `packages/ui/src/career/career-inbox-view.test.ts`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/inbox/InboxMessageDetail.tsx`
- `apps/web/src/features/inbox/InboxMessageDetail.test.tsx`
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/ui/src/career/career-squad-view.test.ts \
  packages/ui/src/career/career-market-target-view.test.ts \
  packages/ui/src/career/career-inbox-view.test.ts \
  apps/web/src/features/inbox/InboxMessageDetail.test.tsx \
  apps/web/src/features/inbox/career-inbox-presenter.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web exec playwright test \
  src/visual-qa/current-product.spec.ts \
  --grep "incoming offers and loans" \
  --workers=1
git diff --check
graphify update .
```

## Definition Of Done

- Postures are combinable and operable from Squad.
- Permanent and loan actions are understandable in Market/Posta.
- Enabled outgoing actions and seller willingness remain visibly distinct; a
  valid `player_not_for_sale` response is understandable rather than looking
  like a broken button.
- Final-counter semantics are explicit without a numeric counter.
- Desktop/narrow/keyboard/focus/reduced-motion/200%-text paths pass.
- Step 09 is the only next action.

# Step 04 - Posta Final-Counteroffer Workflow

## Status

Not started.

## Goal

Deliver incoming permanent offers as actionable Posta decisions and let the
manager accept, reject, or make one final fee counterproposal.

## Accepted Semantics

`AI offer -> accept / reject / final counter -> AI final accept / reject`

- One manager counter only.
- Original stage deadline remains at most three in-game days.
- Countering never resets the deadline.
- Posta stops Continue according to the existing important/actionable policy.
- UI exposes original offer, manager counter, and textual final-counter state.

## What To Implement

- Add incoming-offer Posta categories, related negotiation identity, action
  IDs, and resolution rules.
- Add typed accept/reject/final-counter engine/runtime commands.
- Re-evaluate AI affordability/willingness once after the manager counter.
- Complete accepted transfers through the existing atomic club/player/finance
  workflow.
- Expire unanswered offers/counters deterministically.
- Persist exactly once per resolved command and restore opener/focus in later
  UI.
- Add localized message facts and presenter/read-model support; Step 08 owns
  final visual composition.

## What NOT To Implement

- No second counter, deadline reset, loan, or screen-local negotiation state.
- No bypass of player willingness/contract stage on permanent completion.

## Expected Files

- `packages/domain/src/career/inbox.ts`
- `packages/domain/src/career/inbox.test.ts`
- `packages/domain/src/career/attention.ts`
- `packages/domain/src/career/attention.test.ts`
- `packages/domain/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/career-inbox-lifecycle.ts`
- `packages/engine/src/career/career-inbox-lifecycle.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `packages/ui/src/career/career-inbox-view.ts`
- `packages/ui/src/career/career-inbox-view.test.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
- `apps/web/src/features/inbox/career-inbox-presenter.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/inbox.test.ts \
  packages/domain/src/career/attention.test.ts \
  packages/engine/src/career/career-inbox-lifecycle.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/ui/src/career/career-inbox-view.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts \
  apps/web/src/features/inbox/career-inbox-presenter.test.ts \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
git diff --check
graphify update .
```

## Definition Of Done

- Incoming offer messages stop Continue and resolve exactly once.
- Accept/reject/final counter and expiry pass.
- Counter cannot loop or reset its clock.
- Atomic transfer behavior remains canonical.
- Step 05 is the only next action.

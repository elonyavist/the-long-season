# Step 03 - Continue And Inbox Attention Motion

## Status

Done.

## Goal

Connect the existing deterministic Continue progression and Posta decision
centre with restrained motion that makes elapsed time and newly relevant
attention understandable.

## User-Visible Outcome

- Continue visibly advances dates and then settles cleanly on the stopping day.
- A newly delivered blocking or important message receives one bounded arrival
  cue.
- Opening a Posta item preserves list/detail orientation.
- Informational messages remain quiet and no Inbox element pulses forever.

## Scope

1. Adapt the existing calendar advance plan to the shared motion policy without
   changing sampled dates or the 1.8-second maximum.
2. Keep reduced motion as a direct destination update with the same final date.
3. Animate the one current-date value and final attention handoff without
   introducing a second date loop.
4. Add a one-time arrival treatment for newly delivered blocking/important
   messages based on existing lifecycle facts.
5. Add bounded list/detail presence for desktop and narrow Posta layouts.
6. Preserve selection, Back focus, filters, read/acknowledged/resolved state,
   same-date batching, and command locks.
7. Remove migrated manual animation checks only after Motion owns the path.

## Implementation Contract

- `calendar-advance-transition.ts` remains the pure pacing policy.
- No animation state or seen-animation flag enters durable Inbox lifecycle.
- Arrival emphasis is derived from the current UI transition, not persisted as
  a gameplay fact.
- Message severity remains visible in text/semantics without motion.
- Route changes occur after the same existing Continue result, not after an
  animation callback.

## Expected Files

- `apps/web/src/features/inbox/calendar-advance-transition.ts`
- its focused test
- `apps/web/src/features/inbox/CareerInboxScreen.tsx`
- its focused test
- `apps/web/src/features/app-shell/AppShellPostaRail.tsx`
- its focused test
- `apps/web/src/app/App.tsx`
- `apps/web/src/shared/motion/web-motion.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No new attention category, message type, market/contract/finance/youth/staff
  workflow, or Continue stop rule.
- No persisted animation cursor, date timer, or message-arrival flag.
- No permanent pulsing unread badge or animated informational message list.
- No second Posta layout or duplicate narrow markup.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Run Continue over a short range, a long accelerated range, same-date message
  batching, and a blocking matchday stop.
- Open and return from Posta detail at desktop and narrow widths.
- Repeat with keyboard, reduced motion, and 200% text.

## Completion Criteria

- Continue motion explains time without changing the canonical stop result.
- New relevant attention is noticeable once and then becomes calm.
- Posta remains dense, accessible, and stable.
- No durable or gameplay state was added for presentation.

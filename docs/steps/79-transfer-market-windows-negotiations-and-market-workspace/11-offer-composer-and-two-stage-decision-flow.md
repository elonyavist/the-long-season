# Step 11 - Offer Composer And Two-Stage Decision Flow

## Status

Ready.

## Goal

Let the manager submit, revise, withdraw, and complete permanent-transfer or
preliminary-agreement talks through one clear command flow.

## User-Visible Outcome

The manager always knows which table is active, what is being offered, when an
answer is due, what could be spent, and what will actually happen on confirm.

## Scope

1. Add a club-offer composer for one up-front fee during an open window.
2. Add a player-terms composer after club acceptance and for eligible
   preliminary agreements.
3. Reuse the supported annual contract fields and current profile/renewal input
   controls instead of creating a second contract form.
4. Show actual budget, this proposal, existing pending exposure, and projected
   post-completion headroom as distinct facts.
5. Support submit, revise after counter, accept counter, reject/withdraw, and
   retry after a recoverable command failure.
6. Preserve drafts on validation, engine, or storage failure and keep the
   current screen/focus coherent.
7. Lock duplicate submission while a command is pending and expose immediate
   loading, success, expiry, and failure feedback.
8. Use one dominant command per state and semantic reduced-motion-safe
   transitions.

## Implementation Contract

- Browser forms create typed command inputs; engine owns every validation and
  outcome.
- No optimistic transfer completion or direct storage write.
- A changed career fact invalidates the preview and requires a fresh engine
  response before confirmation.
- Money uses integer minor units behind localized display controls.

## Expected Files

- focused offer/negotiation components, hooks, and tests under the current
  `apps/web/src/features/market/` feature
- current web career runtime/command adapter only for typed market commands
- current shared command, dialog, form, money, status, and motion primitives
  only where reusable corrections are required
- `packages/i18n/` labels/tests required by visible copy
- current-product visual QA fixture updates
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No duplicate contract form, direct domain import from web, optimistic budget
  mutation, hidden auto-acceptance, or generic form framework.
- No installments, clauses, agents, promises, or loans.
- No animation that delays or completes a command.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Complete accepted, countered, rejected, withdrawn, expired, and newly
  unaffordable flows with keyboard, touch, and reduced motion.
- Submit multiple offers and confirm actual budget remains unchanged while the
  exposure preview remains understandable.

## Completion Criteria

- Permanent transfers and preliminary agreements have complete explicit form
  flows over canonical commands.
- Draft, command, focus, error, and retry behavior is reliable.
- No duplicate contract or finance logic exists in web.
- Step 12 is the only next implementation step.

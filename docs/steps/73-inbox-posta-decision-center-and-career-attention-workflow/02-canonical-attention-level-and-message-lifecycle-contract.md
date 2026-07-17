# Step 02 - Canonical Attention Level And Message Lifecycle Contract

## Status

Pending.

## Goal

Give domain and engine one language-agnostic contract for attention level,
message lifecycle, and the unified current matchday decision.

## Scope

- Replace priority/action-required ambiguity with the canonical attention levels
  `blocking`, `important`, and `informational`.
- Model `unread/read`, acknowledgement, and resolution as distinct facts without
  impossible combinations.
- Replace the separate preparation and matchday message identities with one
  current matchday category and stable message/event ID.
- Keep preparation blocker keys as structured facts on that message.
- Define functional source keys without rendered names or fake staff members.
- Keep current production action IDs bounded to preparation and match entry.
- Update constructors, exports, and focused tests so every added value has a
  production caller in this step.
- Preserve deterministic sort tie-breakers and namespaced IDs.

## Expected files

- `packages/domain/src/career/attention.ts`
- `packages/domain/src/career/attention.test.ts`
- `packages/domain/src/career/inbox.ts`
- `packages/domain/src/career/inbox.test.ts`
- `packages/domain/src/career/index.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/career/continue-career.ts`
- `packages/engine/src/career/continue-career.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/03-daily-continue-stop-policy-and-same-date-delivery.md` only if a lesson changes future scope.

## Contract requirements

- Blocking is derived from an unresolved structured requirement, not a color or
  action-label heuristic.
- Important is acknowledged independently from read state.
- Informational messages can be unread without stopping advancement.
- The unified matchday message retains one stable identity while its blocker
  facts and primary destination change.
- No rendered prose enters domain or engine.

## What NOT to implement

- No persistence migration yet.
- No React or CSS changes.
- No market, contract, finance, youth, staff, result, or rollover category.
- No generic event bus or extensible handler registry.
- No compatibility union that keeps both old match categories active.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/career/attention.test.ts packages/domain/src/career/inbox.test.ts packages/engine/src/career/continue-career.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- One canonical attention-level vocabulary exists.
- Lifecycle invariants reject invalid message states.
- Preparation and matchday use one category and one stable identity.
- Old constructors and branches are removed.
- Focused tests prove IDs, invariants, and structured matchday blockers.
- `docs/PROJECT_STATUS.md` marks Step 02 Done and Step 03 active.

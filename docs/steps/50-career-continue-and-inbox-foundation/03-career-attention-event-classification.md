# 03 - Career Attention Event Classification

## Goal

Define how the career engine classifies events that can stop `Continue`.

The classification should explain why advancement stops without hiding
manager decisions inside the engine.

## Expected files

- `packages/domain/src/career/attention.ts`
- `packages/domain/src/career/attention.test.ts`
- `packages/domain/src/career/index.ts`
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Define a `CareerAttentionEvent` contract with:
  - stable event ID;
  - game date;
  - category key;
  - severity or priority key;
  - action-required flag;
  - reason key;
  - optional related entity IDs;
  - optional blocker keys.
- Add category keys for the current phase:
  - match preparation required;
  - matchday reached.
- Add future categories only if represented as documented type unions with tests
  and without generation behavior.
- Add helper functions only when they keep later code simpler, for example:
  - create a match-preparation-required event;
  - create a matchday-reached event;
  - compare events deterministically by date and ID.
- Keep event IDs deterministic and non integer-like.
- Add TSDoc to exported contracts and helpers.

## What NOT to implement

- Do not advance career time.
- Do not create Inbox messages yet.
- Do not implement market, contracts, youth, staff, finance, registration, or
  media events.
- Do not auto-resolve manager decisions.
- Do not render event text.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- Focused tests for `packages/domain/src/career/attention.test.ts`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Career attention events have a small, deterministic domain shape.
- Current phase categories are explicitly modeled.
- Future categories have a safe extension path without dead generation code.
- `docs/PROJECT_STATUS.md` records Step 03 as complete or blocked.

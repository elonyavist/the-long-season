# Step 06 - Free-Agent Negotiation And Race

## Status

Not started.

## Goal

Introduce the missing durable free-agent negotiation lifecycle, let several
clubs compete for a free agent through the same race, and keep
`applyCareerFreeAgentSigning` as the single atomic apply called only by the
winner.

## Expected Files

- `packages/domain/src/career/free-agent-negotiation.ts`
- `packages/domain/src/career/free-agent-negotiation.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/career/index.ts`
- `packages/engine/src/career/player-transfer-race.ts`
- `packages/engine/src/career/player-transfer-race.test.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `docs/steps/82b-competitive-transfer-race-and-player-choice/06-free-agent-negotiation-and-race.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Add canonical `FreeAgentNegotiationState`; the immediate signing command is
  an atomic commit, not a negotiation state, and must not be stretched into
  one.
- A free agent enters the player stage directly, with no selling club and no
  club stage.
- Competing approaches for one free agent form a race with the same shared
  player-stage clock rules and no selling-club clock.
- The player-stage deadline is always exactly three in-game days after opening,
  capped only when an applicable registration-window close is earlier. This
  wait applies even when there is only one suitor; no instant-signing workflow
  remains alongside it.
- At most three acquiring clubs may be active. A fourth is rejected with
  `race_participant_limit_reached`, and a pre-deadline withdrawal frees a
  place.
- The player compares suitors through the Step 05 owner; one club wins.
- Only the winner calls `applyCareerFreeAgentSigning`, whose signature and
  atomicity are unchanged. Do not turn it into a negotiation machine.
- One and several suitors use the same negotiation/race path. Its one-suitor
  response timing is the same fixed three-day player stage; do not preserve a
  separate command whose outcome depends on command order.
- Losing approaches close as `lost_to_rival` with a delivered Posta message.
- Persist the new negotiation variant losslessly in JSON and SQLite/OPFS.
  Delete incompatible beta saves through the canonical runtime/storage path;
  add no migration, dual reader, or fallback default.

## What NOT To Implement

- No change to `applyCareerFreeAgentSigning` behaviour, ownership, registration,
  or finance effects.
- No transfer fee for a free agent; it stays exactly zero.
- No second atomic boundary.
- No competitive loan path.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/free-agent-negotiation.test.ts \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/player-transfer-race.test.ts \
  packages/engine/src/career/apply-career-free-agent-signing.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts \
  packages/storage/src/json-career-storage.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- Several clubs can compete for one free agent and the player chooses.
- One and many suitors use one free-agent negotiation lifecycle.
- One-suitor and multi-suitor free agents both wait through the same three-day
  player stage, and neither can exceed three active acquiring clubs.
- `applyCareerFreeAgentSigning` remains one atomic apply, called only by the
  winner, with a zero fee.
- Free-agent negotiations and race references survive a lossless save/reload
  round trip.

# Step 04 - Raise Command, Posta Visibility And AI Raise Policy

## Status

Not started.

## Goal

Let the manager learn a rival's exact bid and answer it, and let AI clubs raise
within budget, so the race is a decision rather than a notification.

## Expected Files

- `packages/domain/src/career/inbox.ts`
- `packages/domain/src/career/inbox.test.ts`
- `packages/engine/src/career/player-transfer-race.ts`
- `packages/engine/src/career/player-transfer-race.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/selected-club-market-workflow.ts`
- `packages/engine/src/career/selected-club-market-workflow.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `docs/steps/80c-competitive-transfer-race-and-player-choice/04-raise-posta-visibility-and-ai-raise-policy.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Add or update one actionable race conversation in Posta with the current
  exact rival amount, restricted to races involving the selected club. Do not
  create a permanent message for every raise.
- Project the selected club's role explicitly: as buyer it sees the current
  rival transfer amount needed to respond; as seller it sees each actionable
  incoming negotiation it owns. Do not collapse several incoming offers into
  one decision or count.
- Add one competitive-fee command that matches or raises the current best on an
  existing negotiation without creating a second negotiation for the buyer.
- Permit an exact match. Reject a true raise below the versioned minimum
  increment with a stable structured reason.
- Reject a raise made against a stale observed-best amount with a stable
  structured reason and return the new minimum; this makes two near-simultaneous
  raises deterministic instead of last-write-wins.
- A raise never resets or extends the club-stage clock.
- Permit one manager response to each newly observed rival best amount; reject
  repeated self-raises when no new rival best exists.
- Add an explicit walk-away command. It closes only that buyer's negotiation as
  `withdrawn`; other participants and the race remain active. If this happens
  before the shared deadline, the vacated active-participant place may be
  filled by another acquiring club.
- A fourth active acquiring club is rejected with
  `race_participant_limit_reached`; no hidden queue or automatic replacement is
  created.
- Add a bounded AI raise policy: budget-limited, deterministic, versioned,
  consuming the same public facts the manager sees, and limited to one
  evaluation per club/race/in-game day.
- Localize every visible string across all five languages, ASCII-safe.
- Prove information symmetry: the AI reads no fact the manager cannot see.

## What NOT To Implement

- No player-stage comparison, free-agent path, or Market/Squad UI.
- No unbounded bidding loop, unseeded bid, or raise chosen to make a diagnostic
  non-zero.
- No durable bid-history collection; canonical current offers plus structured
  transition facts are enough for UI and diagnostics.
- No club-stage clock change of any kind.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/inbox.test.ts \
  packages/engine/src/career/player-transfer-race.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/selected-club-market-workflow.test.ts \
  packages/i18n/src/labels.test.ts \
  apps/web/src/runtime/web-career-runtime.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- The manager receives the exact rival amount only where involved and can
  match, raise, or walk away.
- Matching is distinct from a minimum-increment raise.
- A sub-increment raise is rejected with a structured reason.
- A stale raise cannot overwrite a newer bid.
- AI raises within budget, deterministically, on the same public facts.
- No club-stage deadline is reset or extended.
- Walking away cannot close another participant.
- A pre-deadline withdrawal frees one of the three active places, while a
  fourth simultaneous participant is rejected deterministically.
- Every new visible string exists in all five languages.

# Step 03 - AI Free-Agent Signing Policy

## Status

Not started.

## Entry Gate

- Step 02 is Done: expiries are season-anchored and terms are month-precision.
- The free-agent share measured in Step 01 is on record, together with its
  separate inflow and outflow.

## Goal

Give the AI a reason to sign the players who are already available, so the
free-agent pool drains instead of accumulating.

## User-Facing Reason

A fifth of the world sitting permanently out of contract is visible: the market
list fills with players nobody wants, and a released player never finds a club.
In real football the out-of-contract group is where most moves come from, and it
turns over every window.

## What To Implement

- Add one named free-agent signing policy Module in the career layer. It answers
  a football question - should this club sign this available player now - and is
  not a generic candidate-ranking framework.
- Drive the decision from facts the AI is already allowed to see: squad need by
  department against the existing structural floors, the public
  current/`P50`/upper assessment, wage affordability against the club's finance
  state, the player's wage demand, and the club's competitive tier. No stored
  ceiling and no information the manager could not obtain.
- Respect the existing market cadence rather than inventing a second one, and
  keep the manager's advantage in attention rather than in clock: the AI acts on
  its cadence, the manager may act at any time.
- Make the policy season-aware. Signing pressure is highest when the pool has
  just filled at the season boundary and when a squad sits below its floor, and
  lowest mid-season for a club with no gap.
- Keep the existing `applyCareerFreeAgentSigning` commit path. This step decides
  who signs, not how a signing is applied.
- Ensure a signed free agent receives a term through Step 02's month-precision
  path, so a mid-season signing naturally lands on the current season's end.
- Add tests for: a club below a department floor signing; a full, financially
  stretched club not signing; identical inputs producing identical decisions;
  the pool draining across simulated seasons; and no club exceeding its wage
  capacity through free-agent signings.
- Re-run the Step 01 audit and report Steps 02 and 03 together against the
  frozen bands: free-agent share, arrivals per club, and contract-expiry share
  as a proportion of all movements.

## Clean-Code Requirements

- The Module is named for the football decision, not for ranking or scoring.
- One evaluator owns the decision; AI market lifecycle, replenishment, and
  diagnostics consume it rather than re-deriving their own version.
- Squad depth is read through the named accessor introduced in Phase 81, never
  through `club.playerIds` directly.
- Delete any replenishment path that this policy supersedes rather than leaving
  both reachable.
- Exported contracts document why zero signings cannot pass as success.

## What NOT To Implement

- No free-agent negotiation lifecycle, counteroffer, or multi-suitor race.
  Phase 82B owns durable free-agent negotiation, and this step must leave that
  seam untouched.
- No loan or posture behaviour.
- No hidden-information advantage for the AI.
- No generic strategy registry, plugin system, or scoring framework.
- No band adjusted because the measurement disappointed.
- No change to the signing commit path itself.

## Expected Files

- `packages/engine/src/career/free-agent-signing-policy.ts`
- `packages/engine/src/career/free-agent-signing-policy.test.ts`
- `packages/engine/src/career/free-agent-pool.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/engine/src/career/senior-squad-replenishment.ts`
- `packages/engine/src/career/senior-squad-replenishment.test.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.test.ts`
- `packages/engine/src/index.ts`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/simulation-tools/src/market-economy/market-economy-audit.ts`
- `packages/simulation-tools/src/market-economy/market-economy-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/career/free-agent-signing-policy.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/senior-squad-replenishment.test.ts \
  packages/engine/src/career/apply-career-free-agent-signing.test.ts \
  packages/simulation-tools/src/market-economy/market-economy-audit.test.ts
pnpm cli market-economy-report --seed-prefix=phase81a-steps-02-03
pnpm check
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- One named policy owns the free-agent signing decision and every AI path reads
  it.
- The free-agent share sits inside its frozen band, with positive signings per
  season recorded - a stable share with zero outflow does not pass.
- Structural squad floors and wage capacity are never violated by a signing.
- Identical inputs produce identical decisions.
- Steps 02 and 03 are reported together against the Step 01 bands, with the
  combined effect on arrivals per club stated as one result.
- No superseded replenishment path remains reachable.
- Step 04 is the only next action.

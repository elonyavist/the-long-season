# Step 04 - Complete Domestic Background Fixtures

## Status

Blocked behind Step 03.

## Goal

Resolve every domestic fixture required by canonical career progression through
one deterministic producer, so tables and player statistics are complete before
season rollover.

## What To Implement

- Implement only the all-domestic competition set frozen by Step 03. The unit
  of completeness is a registered competition-season, not the selected club's
  division.
- Resolve automatic fixtures inside the canonical career advancement/commit
  boundary frozen by Step 03.
- Build both clubs through the Phase 81A canonical tactical/XI selector. Zero
  fixed `4-4-2`, fallback formation or background-only team-strength path.
- Derive fixture RNG from stable world/fixture keys; explicit ordering and
  final tie-breakers must make worker count irrelevant.
- Commit canonical fixture result, player participation, goals, assists,
  condition/availability and finance facts once. Tables and report sections
  read those facts; they never reconstruct a match.
- Derive idempotency from canonical fixture state. Discard/retry around a live
  session follows the Step 03 transaction contract.
- Keep the automatic detail level bounded: retain only facts required by active
  gameplay/report consumers.
- Add a locked bounded checkpoint before advancing. It reconciles scheduled,
  resolved, participation, table, goal and assist totals per competition and
  proves one complete season can roll over.
- Measure p50/p90 runtime, memory and artifact size against Step 03 budgets.

## What NOT To Implement

- No cups or continental competitions unless Step 03 proves canonical rollover
  already requires them.
- No selected-division-only shortcut.
- No per-minute telemetry without an active consumer.
- No second simulator or background-specific player model.
- No 750 x 10 run.

## Expected Files

Populated by Step 03 from Graphify. It must include the actual owners for:

- career month/season advancement and transactional live-session boundary
- fixture simulation/commit and deterministic ordering
- participation, standings, scorer/assist and finance aggregation
- worker/world projection and `simulation-report` canonical sections
- focused engine/CLI/integration tests and affected exports
- localized workflow text, if any user-facing text changes
- this step and Step 05; `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm check
pnpm cli simulation-report \
  --profile=phase81c-background-world-canary-7x1-v1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81c-background-world-canary-7x1-v1.json
git diff --check
graphify update .
```

Run the checkpoint alone and capture the real exit code. Profile ID remains
provisional until Step 03 registers it.

## Definition Of Done

- Every required domestic competition completes and rolls over canonically.
- Tables and player facts reconcile exactly from committed fixtures.
- Automatic teams use the real selector with zero fallback source.
- Discard/retry and idempotency are proven.
- Operational budgets hold or the owning design is reopened.
- Step 05 is the only next action.


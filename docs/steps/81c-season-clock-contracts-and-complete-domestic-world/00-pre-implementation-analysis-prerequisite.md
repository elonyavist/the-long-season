# Step 00 - Pre-Implementation Analysis Prerequisite

## Status

Planned. Blocked behind Phase 81B GO. Analysis only.

## Goal

Resolve the contradictions found in the former Phase 81B plan before any
contract, background-fixture or long-run implementation begins.

## Findings That Must Be Closed

1. **Same-date commit order.** The old Step 04 placed arrival-date background
   work on the wrong side of the live match commit. The new contract must name
   one executable order and prove discard/retry behavior.
2. **No duplicate durable fixture checkpoint.** `Fixture.result` is canonical.
   Idempotency must derive from canonical state unless a genuinely
   non-derivable fact is demonstrated.
3. **Selected-division-only cannot support ten-season rollover.** The runner
   must complete every registered domestic competition required by canonical
   season completion, or the report must narrow its claim and not roll over.
4. **Runner ownership.** Expected Files must contain the actual long-run world
   runner, worker boundary, section producer and tests before Step 07 is
   authorized.
5. **Term-reader inventory.** Every `durationYears`/term converter and persisted
   reader must be inventoried before month-precision terms are implemented.
6. **Free-agent denominators.** Pool stock, unique inflow, unique attributed
   signing and closing stock use player transitions, never repeated evaluation
   events. Division attribution is defined at the transition boundary.
7. **Requested versus effective term.** The contract must distinguish them or
   own one canonical effective value; a nominal 60-month cap cannot silently
   become a different term after season anchoring.
8. **Kickoff equivalence.** `simulate-match` neutrality compares the exact
   kickoff context and producer. Human intervention after kickoff is outside
   that equivalence.
9. **Fresh/resume render purity.** Execution telemetry may differ. Canonical
   simulation sections and derived HTML identity must be compared separately
   from execution metadata.
10. **Operational budget.** Canary and acceptance profiles freeze p50/p90
    throughput, maximum wall clock, shard/artifact size and resume rules before
    acceptance seeds run.

## Required Decisions

- Enumerate the competitions needed for one truthful domestic season rollover.
- Name the live-match/background commit boundary and deterministic ordering.
- Decide the phase's single beta-reset owner after the persisted contract shape
  is known.
- Freeze exact inherited Phase 81A/81B gate IDs and their populations; do not
  cite phase names as if they were metrics.
- Confirm the Phase 81B AI free-agent policy is reused unchanged. Phase 81C may
  change when candidates become available, not how squad needs rank them.
- Decide which `7 x 10` facts are binding and which 750 x 10 facts are product
  inspection only.

## What NOT To Implement

- No production code or numeric calibration.
- No new report profile beyond read-only discovery.
- No acceptance-seed run.
- No rewrite of Phase 81B evidence.

## Expected Files

- this document
- this phase README and Steps 01-07 when a decision changes their contract
- `docs/PROJECT_STATUS.md`
- no production file

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --help
git diff --check
```

## Definition Of Done

- Every finding above has one written resolution and one owning later step.
- Step 01 has exact populations, denominators, seed contract and outputs.
- Step 03 has an executable rollover/background-world contract.
- Step 07 cannot start through a selected-division or fixed-formation fallback.
- Step 01 is the only next action.


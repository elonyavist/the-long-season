# Step 06B7 - Generational Renewal Owner Correction

## Status

Done under the recorded `STOP / RETHINK`. The emergency
`ai_selection_opportunity` blocker is corrected and both failed narrow
ablations were removed. The owner's 2026-08-09 authorization opens Step 06B7A,
not Step 06B8 directly.

## Goal

Correct the first material `ai_selection_opportunity` funnel break so credible new
generations can earn senior minutes and become leading players without directly
tuning age, goals, assists or the final leaderboard.

## Binding Constraints

- Preserve current/potential separation and the national rarity budgets.
- AI and manager evaluate the same public current/P50/upper facts.
- Only real recorded minutes affect development opportunity.
- Do not manufacture young stars merely to replace veterans.
- Preserve believable exceptional veterans and individual career variance.
- Modify the narrowest canonical owner identified by L4.
- Remove the superseded behaviour in the same change; no compatibility branch,
  duplicated curve or report-only exception survives.

## Frozen Causal Hypothesis

The same club and fixture fail with the senior pool alone and become playable
when active academy players are exposed as emergency candidates. No academy
player enters an ordinary selection while the senior candidates already yield
a legal matchday squad.

The paired counterfactual uses the same generated career state, fixture and
seed. Only `emergencyPlayerIds` changes from the empty set to the club's active
academy roster. The disabled arm must reproduce the typed selection failure;
the enabled arm must field a legal XI without unavailable or unknown players.

## Frozen Rule And Bounds

- ordinary senior selection always runs first;
- active academy candidates are tried only after the ordinary selector throws
  `AiSquadSelectionError`;
- an emergency candidate must belong to the same club's active academy roster
  at that season boundary and must be available on the fixture date;
- the selector applies its existing positional, current-quality, condition and
  recent-use scoring unchanged; there is no youth bonus or forced starter;
- ordinary successful selections have exactly zero emergency IDs;
- at least one emergency ID must be observed on generated real career data;
- the call-up changes no senior registration, contract, promotion or academy
  lifecycle status. Its only durable consequence is canonical played minutes;
- every selected emergency ID is emitted as a fact, so reachability is derived
  from IDs rather than a duplicated count.

### Retirement/exit ablation

- only `player-aging-policy.ts` changes; generation, potential, selection,
  market, scoring and exit probability stay fixed;
- outfield physical decline keeps its existing age-32 start but increases
  smoothly; attacker technical decline starts at 32, midfielder at 34 and
  defender at 35;
- goalkeeper decline magnitude and later windows remain byte-identical;
- `33+` leaders must remain observed, while the frozen season-ten opening and
  generated shares decide whether this owner is sufficient;
- if insufficient, no further aging tuning is allowed in this step: L4 names
  `development_conversion` as the residual owner before another code change.

Result: insufficient (`6 -> 5` generated leader positions). The ablation is
fully removed.

### Development-conversion correction

- zero real minutes still means exactly zero positive development;
- the existing monthly opportunity bands remain bounded by `1`, but real
  sparse minutes become more meaningful: `<90 = 0.25`, `<270 = 0.60`,
  `<450 = 0.85`, `>=450 = 1`;
- age multipliers, performance, club environment, potential, generation,
  selection and outcome scoring remain unchanged;
- lower and upper boundaries are asserted directly, and generated career data
  must move leader occupancy before the correction can survive;
- if this owner does not reach the frozen renewal target, the phase records
  `STOP / RETHINK`; it may not add a youth bonus or direct leaderboard tuning.

Result: insufficient. Career-generated leader occupancy moved `6 -> 5`, and
mean ability for generated `21..24` players moved only `6.81 -> 6.84`. The
experimental opportunity curve was removed in full.

The remaining need is architectural, not another coefficient: academy/reserve
fixtures or loans must create real, durable development minutes before a player
is expected to displace a prime senior. That pathway is outside this step's
authorized owner and cannot be invented under a checkpoint that promised only
one narrow correction.

## Frozen Outcome Targets

On the unchanged L4 population after the owner correction:

- season-ten opening-origin leaderboard share `<= 0.50`;
- season-ten career-generated leaderboard share `>= 0.30`;
- every world contains at least one career-generated scorer or assist leader;
- every division has at least one completed academy-to-senior promotion over
  ten seasons;
- `33+` leaders remain reachable; they are not forced to zero;
- all rarity, rating-scale, potential-ordering, squad-depth, value-cap and
  stable-ID invariants remain green.

## What NOT To Implement

- No direct leaderboard, goal, assist or age-distribution multiplier.
- No global youth quality increase without the L4 owner proving generation is
  the break.
- No forced promotion quota without the L4 owner proving promotion is the
  break.
- No AI youth bonus without the L4 owner proving selection is the break.
- No persistence reset; Step 14 remains the sole reset owner.

## Expected Files

- `packages/engine/src/use-cases/simulate-season.ts` and test; the generic
  automatic-selection boundary owns the senior-first, emergency-second retry
  and the exact emergency IDs actually selected
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test; the
  career composition root alone can supply same-club active academy IDs without
  importing app state into engine
- `apps/cli/src/commands/simulation-report/generational-succession.ts` and test;
  L4 records emergency opportunity by origin and age from the played facts
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test only if
  the new canonical L4 field must be projected into the checkpoint output
- `apps/cli/src/commands/simulation-report/report-registry.ts`; the repeated L4
  run uses a new cache contract
- `docs/audits/PHASE_81A_CHECKPOINT_L4_GENERATIONAL_SUCCESSION.md` **(new)**
- `docs/audits/README.md`, this step, the phase README and
  `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulation-report/generational-succession.test.ts apps/cli/src/commands/simulation-report/career-world-facts.test.ts
pnpm cli simulation-report --profile=phase81a-generational-succession-l4-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-generational-succession-l4-7x10.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The emergency owner is corrected and reachable, both failed experiments are
removed without residue, the architectural blocker is named from paired runs,
and Step 06B8 remains closed until a separately authorized youth-minute pathway
has its own step and checkpoint.

**Recorded outcome:** Done. Steps 06B7A and 06B7B now own that separately
authorized pathway and checkpoint.

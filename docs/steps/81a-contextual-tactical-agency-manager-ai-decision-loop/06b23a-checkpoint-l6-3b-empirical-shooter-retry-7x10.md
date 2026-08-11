# Step 06B23A - Checkpoint L6.3B Empirical Shooter Retry 7 x 10

## Status

Done - **SHOOTER GO / overall REFINE**. The corrected world-isolated reader
accepts top-ten scoring at `18.45`; top-ten assists remain red at `7.1614`.
06B23B proves that creator failure predates 06B22B, so the empirical shooter
implementation is retained and the creator path receives its own attribution.

## Entry Gate

Steps 06B22A and 06B22B are `GO`. The external role rates, formula, schema and
full repository gate are fixed. This checkpoint changes no gameplay and reuses
the complete L6.2/L6.3 evaluator.

## Frozen Population

- only entrypoint: `pnpm cli simulation-report`;
- profile: `phase81a-integrated-l6-3b-7x10`;
- seed prefix: `phase81a-integrated-l6-3b-v1`, unused elsewhere;
- exactly `7` worlds, `10` seasons and `7` workers;
- all three divisions, every canonical career section, standard detail, JSON;
- same `integrated_player_world_l6_2` checkpoint reader used by L6.2/L6.3;
- no cached L6.3 facts and no override of world, season, seed, worker, detail or
  section set.

No target, formula, population or reader may change after execution begins.
L6.3 and L6.3B use different seed populations, so their numeric difference is
descriptive, never a paired causal estimate.

## Frozen Acceptance Lanes

The implementation owns one direct target and one non-regression target:

| Lane | Metric | Frozen band | Meaning |
|---|---|---:|---|
| shooter | top-ten scorer mean | `14.5..18.5` | empirical propensity fixes scoring concentration |
| creator | top-ten assist mean | `8..10.5` | unchanged creator path remains healthy |

Both are read from the existing
`HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS`; this step introduces no threshold.
Shooter/creator ability correlations remain diagnostic and cannot rescue a red
lane.

All other L6.3 metrics remain visible and binding in the **overall** report:
leader ages, age-33+ shares, age drift, minutes, distinct users, generated
leaders, local replacement, formations, standings, historical upset lanes,
reconciliation and reachability. They do not belong to 06B22B merely because
the complete report reads them. This distinction is frozen now because L6.3
already established that aging, squad use and replacement were independent red
families before the external shooter implementation.

## Decision Rules

- **SHOOTER GO / overall GO:** both acceptance lanes and the entire inherited
  register pass. Open the next phase checkpoint.
- **SHOOTER GO / overall REFINE:** both acceptance lanes pass, facts reconcile,
  and only carried families are red. Accept 06B22B permanently; the next step
  may address only an owner demonstrated by those carried facts.
- **SHOOTER REFINE:** top-ten scoring is outside `14.5..18.5`, or top-ten assists
  leave `8..10.5`. Reopen only 06B22B; do not tune the empirical rates from the
  observed distance.
- **STOP / RETHINK:** missing facts, nonzero reconciliation, fallback selection,
  unavailable selected players, profile/evaluator drift or a new simulator.

Scorer age cannot veto the empirical frequency owner by itself: the same metric
also reads the age/quality composition that L6.3 already found red. It remains a
real overall failure and must receive attribution before any correction.

## What NOT To Implement

- no gameplay, target, evaluator, report formula or HTML change;
- no old-selector oracle or coefficient inferred from L6.3;
- no cached report presented as fresh evidence;
- no creator, hierarchy or upset retune;
- no acceptance based only on ability correlation.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`;
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`;
- `packages/i18n/src/labels.ts`;
- this step, the Phase README and `docs/PROJECT_STATUS.md`;
- the generated L6.3B audit and `docs/audits/README.md` after execution;
- one next step only if its owner is earned by the outcome.

## Required Verification And Command

```bash
nvm use 24
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-integrated-l6-3b-7x10 \
  --format=json \
  --report-output=simulation-out/phase81a-integrated-l6-3b-7x10.json
git diff --check
graphify update .
```

The simulation runs alone. Exit `1` is a valid canonical overall `REFINE` when
facts reconcile; the two acceptance lanes determine whether 06B22B itself is
accepted.

## First Run Finding - Not Evidence For The Lane

The locked run completed with exit `1`, zero fallback/unavailable selections
and zero player reconciliation. Its raw 70 season tables produce mean top-ten
scoring near `18.47`, while the checkpoint object reports `26.74`. The reader
flattened worlds before choosing each top ten, reducing the intended `700`
leader observations to `100`. Therefore neither shooter nor overall acceptance
may cite that checkpoint object. The unchanged profile reruns after 06B23A1 to
`simulation-out/phase81a-integrated-l6-3b-7x10-reader-corrected.json`.

## Outcome

- 06B23A1 corrected the reader without changing or regenerating match facts;
- the corrected same-seed report has hash
  `845fd9df94c3934a00170fd5108b4540`, zero reconciliation, scorer mean `18.45`
  and assist mean `7.1614`;
- 06B23B reevaluated cached pre-06B22B facts with the corrected reader. Their
  player section is byte-identical to the historical artifact and already
  records assist mean `7.1914 < 8`;
- outcome: **SHOOTER GO / overall REFINE**. The direct shooter lane passes; the
  creator lane is a pre-existing owner question and cannot reopen the immutable
  empirical role frequencies.

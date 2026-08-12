# Step 06B23D - Checkpoint L6.3C Assist-Supply Attribution 7 x 1

## Status

Done - **assist_credit_probability** with all goal kinds reachable and zero
reconciliation failures.

## Product Question

The real assisted-goal share is `0.6710`; the game records `0.5413`. Determine
whether the missing assists come from:

- creator/shooter overlap: too many goals are made by the same player who
  created the chance, so no assist is possible; or
- assist-credit probability: a distinct creator exists but is denied formal
  assist credit.

Both are credible football events. The defect is their aggregate frequency,
not the existence of either branch.

## Frozen Population

- only entrypoint: `pnpm cli simulation-report`;
- new locked profile `phase81a-assist-supply-l6-3c-7x1`;
- seed prefix `phase81a-assist-supply-l6-3c-v1`, unused elsewhere;
- exactly `7` worlds, `1` season and `7` workers;
- all three divisions simulate normally, but the decision reads only the seven
  First-Division seasons;
- standard detail and canonical season producer; no alternate match engine;
- fresh cache suffix `facts-v1`; no replay of caches that lack the new facts.

One season per world is sufficient for this attribution because the expected
denominator is about `5,800` First-Division goals, not seven leader rows. It is
not a replacement for the later `7 x 10` player checkpoint.

## One Mutually Exclusive Goal Classification

Read only durable `MatchReport.events`. Every goal must enter exactly one class:

1. `penalty`: goal event has no route and no creator/assist;
2. `self_created`: routed goal has neither `assistPlayerId` nor
   `creatorPlayerId`; the engine contract means selected creator equals scorer;
3. `distinct_uncredited`: routed goal has `creatorPlayerId` and no assist;
4. `credited_assist`: routed goal has `assistPlayerId` and no creator copy.

Any goal matching zero or multiple classes is a reconciliation failure. Goal
count must equal report stats and player-season goals; credited assists must
equal player-season assists. Store only the non-derivable mutually exclusive
counts; all shares and ceilings derive in the evaluator.

Also retain the same four counts by `(chanceType, shotType)`. This is diagnostic
ownership for a later external category baseline; it cannot change the decision
below or become a probability by itself.

## Versioned External Reference

Add the 06B23C source facts to the sole historical target register:

```text
allGoalAssistedShare = 0.670974411992763
materialSupplyGap    = 0.05
comparisonTolerance = 0.02
```

The first is the frozen external observation. The other two were preregistered
in 06B23C. No literal may live in the evaluator.

## Derived Metrics

```text
goalCount = penalty + self_created + distinct_uncredited + credited_assist
creditedShare = credited_assist / goalCount
maximumCreditableShare = (credited_assist + distinct_uncredited) / goalCount
selfCreatedShare = self_created / goalCount
distinctCreditRate = credited_assist
                   / (credited_assist + distinct_uncredited)
```

`maximumCreditableShare` changes only the credit decision for already distinct
creators. It does not turn self-created goals into passes and therefore does not
grant the probability owner credit for changing actor allocation.

## Predeclared Decision

- **creator_shooter_overlap:** `maximumCreditableShare` remains below external
  share minus `0.02`. Even crediting every distinct creator cannot reach the
  real supply; actor overlap owns the missing capacity.
- **assist_credit_probability:** credited share is at least `0.05` below real,
  while `maximumCreditableShare` reaches external share minus `0.02`. Existing
  distinct creators are sufficient; the credit decision owns the deficit.
- **not_reproduced:** credited share is within `0.05` of the external value.
- **shared_or_unresolved:** reconciliation is green but neither exclusive rule
  applies. Stop and refine the decomposition; do not choose the larger count.
- **STOP / RETHINK:** missing facts, reconciliation failure, fallback/default,
  a profile mismatch or any gameplay difference caused by observation.

The outcome assigns the next measurement owner, not a correction coefficient.
If probability owns the deficit, a later step must establish external
chance-type probabilities before implementation.

## Purity And Reachability

- a focused real match must reach all four classes over a deterministic seed
  search; a synthetic event fixture cannot close reachability;
- the observer receives completed immutable season results. A real-result test
  hashes the result before/after observation and requires byte identity; no
  second simulation arm is created for a post-hoc reader that cannot affect RNG;
- reversing fixture/event input order must either be explicitly forbidden by
  canonical order or yield the same aggregated facts;
- every chance/shot category observed is enumerated; an unknown value is a
  build failure through total typed mappings.

## What NOT To Implement

- no change to creator selection, shooter selection, assist probability,
  outcome resolution, goals, targets or historical rates;
- no persisted match-event field or storage schema change;
- no duplicate total goal/assist fact beside canonical player/report facts;
- no second report command, report module or simulator;
- no `7 x 10` run and no HTML in this attribution step.

## Expected Files

- `apps/cli/src/commands/simulation-report/assist-supply-attribution.ts` and
  test **(new)** - one owner for classification, reconciliation and decision;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test -
  observation-only integration into the canonical world projection;
- `apps/cli/src/commands/simulation-report/historical-simulation-targets.ts`
  and test - the sole versioned numeric register;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts` - locked profile and cache contract;
- `packages/i18n/src/labels.ts` - five-language profile metadata;
- this step, the Phase README and `docs/PROJECT_STATUS.md`;
- an audit/index and one owner-specific next step only after the run.

## Required Verification And Command

```bash
nvm use 24.16.0
pnpm vitest run \
  apps/cli/src/commands/simulation-report/assist-supply-attribution.test.ts \
  apps/cli/src/commands/simulation-report/career-sections.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm typecheck
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-assist-supply-l6-3c-7x1 \
  --format=json \
  --report-output=simulation-out/phase81a-assist-supply-l6-3c-7x1.json
git diff --check
graphify update .
```

The simulation and full gate run alone. Canonical exit `1` is acceptable when
the complete inherited register remains `REFINE`; the assist-supply decision
must be read separately and have zero reconciliation failures.

## Outcome

- fresh profile completed with canonical exit `1`, report hash
  `e96790ae524a92328fc241cf34ef4353` and zero reconciliation failures;
- `6,442` goals classify exactly once: penalty `341`, self-created `649`,
  distinct uncredited `1,916`, credited `3,536`;
- credited share is `0.5489`; maximum share using already distinct creators is
  `0.8463`, above the external `0.6710` reference;
- all four real branches are reached and category credit rates reproduce the
  shipped probability table, excluding RNG failure;
- preregistered decision: **assist_credit_probability**. 06B23E must measure
  external category rates before any content/gameplay change.

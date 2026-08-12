# Step 06B23E - Empirical Assist Credit By Chance Baseline

## Status

Done - `STOP / RETHINK`: StatsBomb key-pass credit is a semantic identity, not
a category probability.

## Question

06B23D proved the shipped probability table, rather than creator capacity or a
broken random draw, owns low assist supply. Replace guessed probabilities only
if real event data can answer the same category question.

## Frozen Source

Reuse StatsBomb Open Data commit
`b0bc9f22dd77c206ddedc1d742893b3bbe64baec`, the same `1,517` complete
2015/16 domestic-league matches, seven workers and two byte-identical runs from
06B22A/06B23C. No new competition or season enters.

## Goal Join And Category Mapping

For every StatsBomb goal shot:

1. `Penalty` or direct `Free Kick` -> `dead_ball|set_piece`, no distinct
   creator expected;
2. otherwise resolve `shot.key_pass_id` in the same match;
3. no key pass -> `self_created`, outside assist-credit probability;
4. key pass with `pass.cross = true` -> `cross|header` when shot body part is
   `Head`, otherwise `cross|normal`;
5. remaining key pass in play pattern `From Counter` -> `counter|normal`;
6. remaining key pass -> `open_play|normal`.

For each category with a distinct key-pass creator:

```text
empiricalCreditShare = goal-assist passes / distinct key-pass goal passes
probabilityBasisPoints = round(empiricalCreditShare * 10_000)
```

The pass counts as credited only when `pass.goal_assist = true`. Missing joins,
duplicate key-pass IDs, different teams, non-goal targets, unknown categories
or disagreement with 06B23C's `3,869` goals / `2,596` assisted goals stop the
run.

## Reachability And Decision

- every gameplay-reachable category must have at least `100` distinct-creator
  goal observations; otherwise its probability stays unowned;
- `dead_ball|set_piece` is expected to have no distinct creator in the current
  engine because penalties bypass `buildOccasionContext`. 06B23E must report
  this rather than invent a rate; if confirmed, the later implementation
  removes the unreachable `0.25` branch;
- **GO:** all reachable categories reconcile, clear the observation floor and
  two runs are byte-identical. Open a versioned probability implementation;
- **REFINE:** a structured StatsBomb field needs a deterministic interpretation
  decidable without reading category rates. Discard output and rerun unchanged;
- **STOP / RETHINK:** category definitions cannot align, a reachable category
  is underpowered, or implementation would require a coefficient chosen from
  game output.

No distance from the shipped probabilities is itself a gate. Real values are
adopted because they describe the external population, not because they move
`0.5489` toward `0.6710`.

## What NOT To Implement

- no engine/content/schema/report/profile/game-output change;
- no rescaling to force the pooled target;
- no creator-propensity implementation;
- no retained extractor or raw dataset;
- no HTML or simulation run.

## Outcome

Two seven-worker extractions over all `1,517` matches are byte-identical and
reconcile the accepted `3,869` goals / `2,596` assists exactly. Every reachable
category clears the `100`-observation floor, but every goal with a distinct
`key_pass_id` is also credited: counter `198/198`, cross/header `312/312`,
cross/normal `482/482`, open-play/normal `1,604/1,604`.

The apparent four-row `10000` table is tautological. StatsBomb's key pass on a
goal identifies the assist; the game's selected creator is a more general
chance-origin fact. The two concepts cannot support the same category
probability. Implementing `10000` would push the game toward its `0.8463`
distinct-creator ceiling and away from the real `0.6710` all-goal share.

The preregistered decision is therefore **STOP / RETHINK**, not GO. The useful
external facts survive: `413` dead-ball goals, `860` self-created goals and
`2,596` distinctly assisted goals; the latter are `0.7512` of the `3,456`
non-dead-ball goals. 06B23F must redesign assist eligibility around that
interpretable population, without a chance-type table.

## Expected Files

- this step;
- a new StatsBomb category audit and `docs/audits/README.md`;
- the Phase README and `docs/PROJECT_STATUS.md`;
- one implementation step only after `GO`.

## Required Verification

```bash
nvm use 24.16.0
# temporary extractor, same corpus, exactly seven workers, two complete runs
git diff --check
```

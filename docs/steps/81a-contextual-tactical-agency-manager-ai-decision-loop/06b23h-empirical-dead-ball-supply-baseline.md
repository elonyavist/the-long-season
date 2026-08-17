# Step 06B23H - Empirical Dead-Ball Supply Baseline

## Status

Done - `GO`; penalty and direct-free-kick owners are separately measurable.

## Question

How much of the `dead_ball_supply` gap belongs to penalty frequency, penalty
conversion and direct-free-kick goals in real football?

## Frozen Source And Corpus

Reuse StatsBomb Open Data commit
`b0bc9f22dd77c206ddedc1d742893b3bbe64baec` and the exact `1,517` complete
2015/16 Premier League, La Liga, Serie A and Ligue 1 matches already accepted by
06B22A, 06B23C and 06B23E. Use exactly seven workers and two byte-identical
complete extractions. No competition, season or post-output seed is added.

## Frozen Measurements

Using structured shot fields only, record:

- total matches, shots and goals;
- penalty attempts (`shot.type = Penalty`), penalty goals and conversion;
- direct-free-kick attempts (`shot.type = Free Kick`), goals and conversion;
- ordinary attempts and goals for reconciliation;
- attempts and goals per match for both dead-ball classes;
- each class's share of all goals and their combined share.

Every shot belongs to exactly one class. Unknown shot types are reported but do
not enter a guessed class. Counts must reconcile to the already accepted
`35,739` non-penalty/non-direct-free-kick shots, `400` penalty shots, `1,749`
direct-free-kick shots, `3,869` goals and `413` combined dead-ball goals.

## Decision

- **GO:** all totals reconcile, both dead-ball classes contain at least `100`
  attempts, both have positive goals, and two runs are byte-identical. Open a
  game-side attribution checkpoint; implement nothing here.
- **REFINE:** a structured StatsBomb field needs one deterministic
  interpretation decidable without reading its rate. Discard output and rerun
  the same corpus.
- **STOP / RETHINK:** a class is underpowered, totals disagree or the source
  cannot distinguish attempts from goals without inference.

No distance from the game is a gate. The output is an external baseline, not a
coefficient selected to close the current report.

## What NOT To Implement

- no discipline, penalty, free-kick, conversion or report gameplay change;
- no combined coefficient hiding penalty and free-kick mechanisms;
- no retained extractor or raw event cache;
- no simulation or HTML.

## Expected Files

- this step;
- a new StatsBomb dead-ball audit and `docs/audits/README.md`;
- Phase README and `docs/PROJECT_STATUS.md`;
- one game-side attribution step only after GO.

## Required Verification

```bash
nvm use 24.19.0
# temporary extractor, exact frozen corpus, 7 workers, 2 complete runs
git diff --check
```

## Outcome

Two complete seven-worker runs are byte-identical and reconcile `37,888` shots,
`3,869` goals and the previously frozen three shot populations. Penalties are
`400` attempts / `300` goals (`0.2637` and `0.1978` per match, conversion
`0.7500`). Direct free kicks are `1,749` attempts / `113` goals (`1.1529` and
`0.0745` per match, conversion `0.0646`).

Both clear the observation floor. Direct free kicks supply `2.92%` of all goals
and cannot be represented by extra penalties. 06B23I opens to measure the
game's penalty award and conversion lanes while recording the absent direct-
free-kick path as its own structural owner.

# Step 06C13 - Result-Resolution Causal Decomposition

## Status

Done: `STOP / RETHINK`. Both individual resolver stages are coherent in both
untouched sets, while the composed xG-state model remains below `R^2=0.5`.
No gameplay change is authorized.

## Goal

Separate three different reasons expected-goal differential may explain less
than half of response-driven win-share variance:

1. total xG changes draw and upset geometry even when xG differential is equal;
2. stochastic shot conversion weakens xG-to-goal preservation;
3. scoreline distribution weakens goal-to-win-share preservation.

Reuse the same canonical matches and the same locked 06C12 profile. Do not
change opportunity rates, finishing probabilities, randomness, targets or
response selection.

## Measurement Contract Frozen Before Output

Retain two additional channel facts from each existing replay observation:

- total expected goals, own plus opponent;
- total goals, own plus opponent.

Together with the already-retained differentials and win share, center all
nine response means within each context and pool with the existing population
weights. Fit deterministic ordinary least-squares models with intercept removed
after centering:

- `xg_diff -> goal_diff`;
- `[xg_diff, xg_total] -> goal_diff`;
- `goal_diff -> win_share`;
- `[goal_diff, goal_total] -> win_share`;
- `[xg_diff, xg_total] -> win_share`.

For two-predictor models, solve the complete `2 x 2` normal equations. A
singular matrix is `not_observed`, never regularized or silently reduced to one
predictor. Report slopes, `R^2`, residual variance and, per model, real context
counts above and below `R^2 = 0.5`.

The semantic majority split remains exactly `0.5`; it is inherited from 06C11
and is not refitted to this output. Both sides must be reached by real contexts
for whichever model names the owner.

## Frozen Decision

Evaluate each untouched set independently, then require the same owner twice:

- `xg_geometry` when differential-only xG-to-win is below `0.5` but the
  two-variable `[xg_diff, xg_total]` model reaches `>= 0.5`. Result resolution
  is then behaving coherently with the full xG state; no resolver correction is
  authorized.
- `shot_conversion` when the two-variable xG-to-goal model is `< 0.5` and the
  two-variable goal-to-win model is `>= 0.5`. The first lossy stage is chance
  conversion.
- `scoreline_mapping` when xG-to-goal is `>= 0.5` and goal-to-win is `< 0.5`.
- `distributed_resolution` when both two-variable stages are `< 0.5`.
- `stop_rethink` when both two-variable stages reach `>= 0.5` but the combined
  xG-state-to-win model remains `< 0.5`; that interaction does not name one
  lossy stage and cannot authorize a local correction.
- `stop_rethink` when both stages and the combined model reach `>= 0.5`; in
  that case the prior aggregate label no longer reproduces under the fuller
  state and there is no lossy result stage to change.
- `stop_rethink` for a non-positive primary differential slope, singular pooled
  model, missing telemetry or failed 06C12 reconciliation.
- Opposite set owners are `MIXED`; no gameplay change is authorized.

An identified stage opens only an empirical credibility checkpoint for that
stage. It does **not** directly authorize reducing randomness: rare upsets,
draws and finishing variance are part of realistic football.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  test; retain totals from the same canonical result and derive the models;
- `packages/simulation-tools/src/index.ts` only if new public types cross its
  explicit barrel;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`; expose
  per-set and aggregate decomposition through the existing locked profile;
- `apps/cli/src/commands/simulation-report/report-registry.ts` only if its
  adapter must forward a new aggregate decision;
- `docs/audits/PHASE_81A_RESULT_RESOLUTION_DECOMPOSITION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- the phase `README.md`; reflect the decision and handoff;
- the next empirical checkpoint document only after the same owner appears in
  both sets.

Any discovered file is added here with ownership before editing it.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-b2-downstream-replication --workers=7 --format=json \
  --report-output=simulation-out/phase81a-b2-resolution-decomposition.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The same replay rows expose total and differential causal facts, both untouched
sets name or disagree on the first lossy stage, classifier reachability is
proved on real contexts, and no gameplay or target changes.

## Result

The locked `28`-world, `128`-context run reproduces every prior population and
Phase-1 gate. xG state explains `0.8482/0.7923` of goal-differential variance;
goal state explains `0.6042/0.5656` of win-share variance. Their primary slopes
remain positive. Nevertheless xG state explains only `0.3839/0.4046` of
win-share variance, so both sets return the preregistered `stop_rethink`.

This rejects a local variance reduction. Mean complete-row ranges are only
`0.1543/0.1322` xG differential and `0.0379/0.0366` win share. The next step
must evaluate the `0.045` product premise against season-level agency and upset
credibility; it cannot tune finishing or scoreline randomness merely to make a
diagnostic green.

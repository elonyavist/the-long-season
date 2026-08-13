# Step 06C11 - Chance-To-Result Materiality Attribution

## Status

Done: `MIXED`. Step 06C10 proved that the canonical analytic response space is
diverse and coherent while final-result materiality remains sub-target; the
two independent populations now disagree on the downstream owner.

## Goal

Locate the first downstream stage that fails to preserve tactical response
separation. Reuse the exact complete-row match simulations and retain their
opportunity differential, expected-goals differential, goal differential and
win share. Do not add a simulator, replay, coefficient or gameplay branch.

The player-facing question is whether a correct tactical response actually
creates a meaningfully different match, or whether the created difference is
lost only when chances become goals and results. That distinction decides
whether the next product change belongs to chance generation or whether the
frozen `+0.045/-0.045` result target itself must be reconsidered against
football-plausible variance.

## Measurement Contract Frozen Before Output

`tacticalAgencyReplayWinShare(...)` currently throws away canonical telemetry
after reading the score. Replace that lossy reader with one internal replay
observation containing, from the same `simulateMatch(...)` result:

- own-minus-opponent opportunity count;
- own-minus-opponent expected goals from engine telemetry;
- own-minus-opponent goals;
- own win share (`1 / 0.5 / 0`).

Selection and the historical replay gates continue to read only `winShare`.
The complete nine-response row additionally retains one mean channel row per
response and the context-free mean. Raw simulations are neither repeated nor
reconstructed.

Across all response rows, center xG differential and win share within each
context before pooling with the existing population weights. Report:

- weighted mean response range for opportunities, xG, goals and win share;
- positive/negative/zero within-context xG-to-win covariance counts;
- the pooled least-squares slope of win share on xG differential;
- pooled `R^2`, the exact share of response-driven win-share variance explained
  by the one-variable xG projection;
- how many real contexts individually fall on each side of `R^2 = 0.5`.

The `0.5` split is semantic, not calibrated: it asks which side owns the
majority of response-driven result variance. It is frozen before telemetry is
read.

## Frozen Decision

- Fail closed as `STOP_RETHINK` if telemetry is absent, any reconciliation is
  lost, xG response variance is zero, or the pooled slope is non-positive.
- `opportunity_xg_magnitude` owns the shortfall when pooled `R^2 >= 0.5` in
  both seed sets: final results predominantly preserve the xG ordering, so the
  upstream xG separation is what is too small for the frozen result target.
- `result_resolution` owns it when pooled `R^2 < 0.5` in both sets: most
  response-driven result variance is introduced after xG.
- Opposite owners across the two untouched seed sets are `MIXED`; no gameplay
  correction is authorized.

The artifact must also demonstrate that both sides of the `0.5` classifier
occur among real replay contexts. If one branch is unreachable on real data,
the aggregate owner may be reported but cannot authorize implementation.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts` and
  test; retain canonical telemetry once and derive the downstream attribution;
- `packages/simulation-tools/src/index.ts` only if its explicit exports need a
  new public type; the materiality summary is exported through this barrel, so
  its downstream-attribution types must remain available to legal consumers;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`; expose
  the attribution through the existing current-materiality profile, never a
  new report entrypoint;
- `apps/cli/src/commands/simulation-report/report-registry.ts`; the existing
  profile adapter must forward the aggregate owner and reachability decision,
  not strand them in the producer while exposing only per-set details;
- `docs/audits/PHASE_81A_CHANCE_TO_RESULT_MATERIALITY_ATTRIBUTION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `README.md`;
- the next step document only after the owner is known;
- `07-player-task-execution.md` only after independent B2 `GO`.

Any discovered file is added here with ownership before editing it.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2-current-materiality --workers=7 \
  --format=json --report-output=simulation-out/phase81a-b2-chance-to-result.json
pnpm check
git diff --check
graphify update .
```

The report runs alone and its real exit is captured. `REFINE` is expected while
the frozen result gate is red; attribution is evidence, not a replacement pass.

## Definition Of Done

One canonical match execution supplies every downstream channel, the two seed
sets independently name or disagree on the owner, both classifier branches are
observed on real contexts, and no gameplay fact changes.

## Result

The in-sample set reports `R^2 = 0.48724` and names `result_resolution`; the
untouched out-of-sample set reports `0.55516` and names
`opportunity_xg_magnitude`. Both have positive xG-result covariance in `31/32`
contexts and both exercise each side of the `0.5` classifier on real rows.

The frozen aggregate decision is therefore `MIXED`; no correction is
authorized. Mean best-to-worst response ranges are only `0.1764/0.2455` xG and
`0.04494/0.04679` win share across the two sets. Continuing now requires a
product decision between retaining the `+0.045/-0.045` target with deeper
structural execution, reconsidering the target premise, or preregistering a
larger independent attribution population. Step 07 stays closed.

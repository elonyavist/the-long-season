# Phase 81A Chance-To-Result Materiality Attribution

## Decision

`MIXED`. No gameplay correction is authorized.

The exact complete-row simulations now retain chance frequency, expected
goals, goals and win share from one canonical `simulateMatch(...)` result. The
in-sample population falls just below the frozen majority-of-variance split;
the untouched out-of-sample population falls just above it. The preregistered
rule requires the same owner twice, so neither chance/xG magnitude nor result
resolution may be changed from this evidence.

## Population

`phase81a-b2-current-materiality` ran alone with exactly seven workers over the
same two seven-world populations and the same `32` stratified replay contexts
per set used by the complete-row materiality checkpoint. Each context retains
all nine response means after `207` paired seeds per response. No match was
added, rerun or reconstructed for this attribution.

## Result

| fact | in-sample | out-of-sample |
|---|---:|---:|
| mean opportunity-differential range | `1.1396` | `1.3539` |
| mean xG-differential range | `0.1764` | `0.2455` |
| mean goal-differential range | `0.2054` | `0.2617` |
| mean win-share range | `0.04494` | `0.04679` |
| positive / negative xG-result covariance contexts | `31 / 1` | `31 / 1` |
| pooled win-share-on-xG slope | `0.17385` | `0.12415` |
| pooled `R^2` | `0.48724` | `0.55516` |
| contexts `R^2 >= 0.5` / below | `23 / 9` | `26 / 6` |
| preregistered owner | `result_resolution` | `opportunity_xg_magnitude` |

Both classifier branches are reached by real contexts in each set. The
instrument therefore can fail in either direction; the aggregate disagreement
is evidence, not a vacuous gate.

The profile remains `REFINE` because the original result-materiality target is
still red. Its first run wrote
`simulation-out/phase81a-b2-chance-to-result.json` with final SHA-256
`60ed97f0d8b1416470fa5bc967266bbc43a9b5186d71d74ac8109e877dabfc22`.
The artifact contains the per-set facts and forwards aggregate owner `mixed`
with `downstreamAttributionHeld: false` through the report adapter.

## Product Fork

The phase cannot legally choose its next gameplay change from these facts.
Three coefficient families, their endpoint interaction and the parallel
analytic formula have already been exhausted. The remaining alternatives are
product-level, not another local calibration:

1. keep the frozen `+0.045/-0.045` target and authorize a deeper structural
   redesign that creates substantially more player-visible xG separation;
2. reconsider how much one correct tactical read should be worth, accepting
   that the canonical engine currently produces a reproducible total
   best-to-worst response range of only about `0.045-0.047` win share;
3. authorize a new independently preregistered population large enough to
   resolve the near-boundary downstream owner before choosing either path.

The current protocol forbids choosing among them after seeing this output.
Step 07 remains closed until the product decision is explicit.

# Phase 81A Result-Resolution Decomposition

## Verdict

`STOP / RETHINK`. Both untouched populations reproduce the prior
`result_resolution` aggregate label, but neither identifies a defective local
resolver stage. No reduction of finishing or scoreline variance is authorized.

## Locked Run

```text
profile: phase81a-b2-downstream-replication
workers: 7
sets: 2 x 14 untouched worlds
contexts: 64 per set
real exit: 1 (the frozen materiality gate remains REFINE)
artifact: simulation-out/phase81a-b2-resolution-decomposition.json
sha256: 16d7714d4cd0be05ed93a11adc8c99f1a82344e175e226f6bee01cd902ed406e
```

The added totals are retained from the same canonical match result as the
existing differentials. The run changed no gameplay, seed, response, target or
calibration value. All `84/84` population rows and both Phase-1 decisions
remain green, so the new observation did not contaminate 06C12A.

## Results

| Model | Set A R2 | Set B R2 |
| --- | ---: | ---: |
| xG differential -> goal differential | 0.8482 | 0.7896 |
| xG state -> goal differential | 0.8482 | 0.7923 |
| goal differential -> win share | 0.6038 | 0.5474 |
| goal state -> win share | 0.6042 | 0.5656 |
| xG state -> win share | 0.3839 | 0.4046 |

Every primary differential slope is positive. The xG-to-goal slope is
`0.9603/0.9857`; the goal-to-win slope is `0.1339/0.1396`. Real contexts reach
both sides of `R2 = 0.5` for the xG-to-goal stage (`61/3`, `62/2`), while the
goal-state model is overwhelmingly coherent (`64/0`, `59/5`).

Both individual stages therefore preserve a majority of response variance,
while their composed linear xG-state model does not. The preregistered outcome
is `stop_rethink`: this interaction cannot name either shot conversion or
scoreline mapping as the first lossy owner.

## Product Meaning

The replay still permits draws and upsets, as football should. Removing that
variance to force `R2` upward would optimize the diagnostic rather than the
game. The more relevant magnitude facts are that the complete response space
currently spans only `0.1543/0.1322` mean xG differential and
`0.0379/0.0366` win share. The next step must test whether the frozen
`+0.045/-0.045` single-match premise is compatible with realistic match
variance and season-level agency; it may not tune the resolver.

## Generational Renewal

This observational step does not touch population generation, development,
market selection or minutes. L6.31 remains the current renewal evidence:
ready-replacement share improved `+0.1363/+0.1034` and generated-career leader
share `+0.0810/+0.0905`. Those facts must be rerun in the integrated canary;
they are not inferred from this tactical checkpoint.

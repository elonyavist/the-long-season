# Phase 81A - Checkpoint B2 Independent Replay

## Verdict

`REFINE`. The complete conditioned analytic graph is healthy, but its selected
best and exposed responses do not produce the required match-result magnitude
on independent seeds. Step 07 stays closed.

## Accepted Population

- two frozen seven-world seed sets, decided independently;
- `3,402` directed analytic contexts per set;
- `32` sampled directed contexts per set as `16` reciprocal matchup pairs;
- one reciprocal pair in every opponent tactic/focus stratum before
  farthest-first completion;
- integer stratum-local weights sum to `3,402` per set;
- exactly seven worker threads;
- eight paired selection seeds per candidate;
- `207` paired replay seeds per context;
- `44,352` simulated matches per set, `88,704` total.

Selection, replay and low-block prefixes are disjoint. Formation, XI, player
state, opponent and match seed remain paired. The oracle is analysis-only and
has no production caller.

## Result

| measure | in-sample | out-of-sample | target |
|---|---:|---:|---:|
| `counter_move_ceiling` | `+0.00483` | `+0.00797` | `>= +0.045` |
| ceiling 95% interval | `[-0.00070, +0.01035]` | `[+0.00262, +0.01331]` | — |
| `counter_move_exposure` | `-0.00808` | `-0.00509` | `<= -0.045` |
| exposure 95% interval | `[-0.01393, -0.00224]` | `[-0.01007, -0.00011]` | — |
| context-free delta | `+0.00021` | `-0.00379` | `abs <= 0.015`, includes zero |
| context-free 95% interval | `[-0.00858, +0.00899]` | `[-0.01269, +0.00511]` | includes zero |
| low-block xG reduction | `0.14756` | `0.19076` | `>= 0.08` |
| low-block exchange | `1.93969` | `2.17507` | `<= 2.0` |

The predeclared `STOP / RETHINK` interpretation required both ceiling and
exposure intervals to include zero in a set. That does not occur. The replay
therefore finds a small directional signal but misses materiality, which is
`REFINE`.

The three original readers retain their exact semantics and pass:

- `no_dominant_composition = 0.4062`;
- `no_dominant_formation = 0.5180`;
- `no_dominant_tactic = 0.5141`.

## Instrument Account

The first complete execution is rejected as checkpoint evidence. It sampled
directed contexts independently, producing a non-reciprocal context-free
population, and timed only Phase 1. No gameplay value or numeric target moved.
The accepted retry pairs directions, gives them equal integer weights inside
each response stratum, and records the whole `677,885.253875 ms` producer.

The accepted artifact is
`simulation-out/phase81a-checkpoint-b2-independent-replay.json`, SHA-256
`abfd925d559eb83277f73f04a90db787340f226a939f516a3ec6bcb4df1be4e9`.

## Handoff

Eight paired selection seeds produce a tied best response in `31/64` contexts.
This audit does not infer that selection owns the shortfall. Step 06C5 must
replay all nine responses on the same declared contexts and ask whether the
replay population's own maximum and minimum can reach `+0.045 / -0.045`.
If even that optimistic bound misses, the owner is match-effect materiality;
if it passes while the frozen selected arms fail, the owner is selection power.

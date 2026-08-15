# Phase 81A Checkpoint L6.42A - Progressive Current-16 Lifecycle

## Verdict

**`OWNER_IDENTIFIED: observed_ceiling_supply` on 2026-08-15.** The current
product does not primarily lose generated current-16 players through aging,
development after a viable ceiling, retention or leadership conversion. Almost
all loss occurs before current `16` is an observed reachable ceiling.

This checkpoint changed no gameplay. It read the completed L6.40 cache through
the sole `simulation-report` entrypoint.

## Instrument Account

The first L6.42 terminal classifier returned `STOP_INSTRUMENT`. It required
every downstream loss state to be positive, but only thirteen players reached
current `16` and all thirteen survived there. The raw output was not promoted
to a verdict.

L6.42A preregistered a nested funnel before retrying. A zero downstream loss is
now a measured `100%` survival rate; every denominator must remain positive and
every count must be a subset of the previous stage. The `0.50` owner floor and
`5/7` world-coherence floor did not move.

## Current-Product Funnel

| transition | denominator | survivors | losses | survival share |
|---|---:|---:|---:|---:|
| generated -> senior observed | `1885` | `1041` | `844` | `0.5523` |
| senior observed -> ceiling 16 observed | `1041` | `22` | `1019` | `0.0211` |
| ceiling 16 -> current 16 reached | `22` | `13` | `9` | `0.5909` |
| current 16 reached -> retained in First Division at season ten | `13` | `13` | `0` | `1.0000` |
| retained current 16 -> scorer/creator leader | `13` | `4` | diagnostic | `0.3077` |

The ceiling transition owns `1019/1872 = 0.5443` of all failures before
retained current-16 stock and is the largest loss in `6/7` worlds. The frozen
owner rule therefore passes.

## Independent Cross-Check

The outcome-independent L6.27 reader was rerun on the later L6.40 product,
rather than reusing its historical result:

| state | players |
|---|---:|
| stationary ready | `436` |
| development realization gap | `148` |
| ceiling supply gap | `780` |
| reference not observed | `10` |

Among `928` like-aged non-ready replacements, `780` have a stored ceiling below
their exact role/division opening reference: `0.8405`, coherent in `7/7`
worlds. This independently identifies `ceiling_supply` without reading minutes,
goals, assists or leader membership.

## Opening Stock Correction

The earlier phrase “opening-stock retention” was too broad for current `16`:

- opening First-Division current-16 cohort: `447`;
- still First-Division current-16 in season ten: `71` (`0.1588`);
- no longer active: `344`;
- active outside First Division: `11`;
- active in First Division below current `16`: `21`;
- total season-ten opening-senior current-16 stock: `91`;
- of those `91`, `20` began below current `16`.

No world retains half of its opening current-16 cohort. Opening elite retention
is therefore **not** the owner under the precise test. The absolute stock of
`91` combines a large opening population, `71` genuine survivors and `20`
players who reached the rung later.

## Consequence

The next gameplay proposal may open only the observed ceiling-supply owner. It
must explain separately why `844` generated players never reach a senior
observation, but that is the second-largest loss and cannot replace the proven
ceiling owner.

The proposal must not:

- retune the rejected role-aware aging candidate;
- add an age, selection, goal or assist malus;
- increase generic development after the output;
- protect minutes or retention for generated players, because the thirteen who
  reach current `16` already survive at `100%` in this cohort;
- use player origin as a gameplay bonus.

## Evidence

- profile: `phase81a-progressive-current16-l6-42a-cached`;
- source cache:
  `phase81a-stationary-age-succession-l6-40-7x10-facts-v1`;
- seven worlds, ten seasons, seven-worker metadata;
- zero reconciliation failures;
- two JSON builds were byte-identical;
- local artifacts:
  `simulation-out/phase81a-progressive-current16-l6-42a-cached.json` and
  `simulation-out/phase81a-progressive-current16-l6-42a-cached-rebuild.json`.

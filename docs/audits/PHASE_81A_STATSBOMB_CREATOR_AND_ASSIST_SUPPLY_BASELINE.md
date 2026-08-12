# Phase 81A - StatsBomb Creator And Assist-Supply Baseline

## Verdict

**assist_supply.** Real top-ten creator concentration exceeds the game's by
only `0.0128`, below the preregistered `0.02` material floor. The assisted-goal
share is different by `0.1297` (`0.6710` real, `0.5413` game), well above the
`0.05` floor. Creator propensity is therefore not authorized yet; the next
step isolates self-created goals from distinct creators denied assist credit.

## Source And Population

This analysis uses [StatsBomb Open Data](https://github.com/statsbomb/open-data)
at frozen commit
[`b0bc9f22dd77c206ddedc1d742893b3bbe64baec`](https://github.com/statsbomb/open-data/tree/b0bc9f22dd77c206ddedc1d742893b3bbe64baec).
It reuses the exact complete 2015/16 domestic-league corpus accepted by 06B22A:

| Competition | Matches |
|---|---:|
| Premier League | `380` |
| La Liga | `380` |
| Serie A | `380` |
| Ligue 1 | `377` |
| **Total** | **`1,517`** |

The extraction processed `5,321,459` events with exactly seven workers. It
reuses 06B22A's accepted `189,855,033,974,000` canonical role microseconds
rather than creating a second owner for the same position timeline.

## Definitions

- creator event: a StatsBomb pass with `shot_assist = true`, joined to a shot
  in the same match;
- eligible creator event: its joined shot is neither a penalty nor a direct
  free kick, matching 06B22A's `35,739`-shot population;
- assisted goal: a goal shot joined to exactly one pass with
  `goal_assist = true`;
- creator rate: eligible creator events per fielded-role 90;
- concentration: top-ten eligible creator-event share in each complete league
  season; the mean of four rows is descriptive, never a p10/p90 estimate.

Missing joins, duplicate shot IDs, unknown positions and goal assists linked to
non-goals are structural failures. None occurred.

## Creator Propensity

| Canonical role | Events | Per 90 | Basis points |
|---|---:|---:|---:|
| goalkeeper | `79` | `0.024627` | `246` |
| right full-back | `1,652` | `0.576914` | `5,769` |
| centre-back | `926` | `0.137114` | `1,371` |
| left full-back | `1,821` | `0.635854` | `6,359` |
| defensive midfielder | `3,187` | `0.692829` | `6,928` |
| central midfielder | `3,155` | `1.010034` | `10,100` |
| right midfielder | `1,485` | `1.145967` | `11,460` |
| left midfielder | `1,573` | `1.215132` | `12,151` |
| attacking midfielder | `2,294` | `1.468699` | `14,687` |
| right winger | `2,259` | `1.322969` | `13,230` |
| left winger | `2,284` | `1.337780` | `13,378` |
| striker | `3,724` | `0.891163` | `8,912` |

All `11/11` supported outfield roles have positive events. The goalkeeper is
reported for reconciliation but remains excluded from game creator selection.
These values are evidence, not yet content: the concentration gate below does
not authorize their implementation.

## Concentration

| Competition | Events | Distinct creators | Top-ten share | Effective count |
|---|---:|---:|---:|---:|
| Premier League | `6,506` | `438` | `0.1190` | `194.95` |
| Ligue 1 | `5,643` | `475` | `0.1168` | `210.61` |
| La Liga | `5,763` | `451` | `0.1088` | `214.29` |
| Serie A | `6,527` | `464` | `0.0985` | `230.80` |
| **Mean** | | **`457.00`** | **`0.1108`** | **`212.66`** |

The game's corrected L6.3B top-ten nomination share is `0.0980`. The absolute
difference is `0.0128`, below the frozen `0.02` material floor. Different fact
semantics also remain visible: StatsBomb rows are distinct shot-assist passes;
the cached game nomination includes self-created chances it cannot separate.

## Assist Supply

| Population | Goals | Assisted goals | Share |
|---|---:|---:|---:|
| all StatsBomb shot goals | `3,869` | `2,596` | `0.6710` |
| non-penalty/non-direct-FK goals | `3,456` | `2,596` | `0.7512` |
| game first division, L6.3B | `828.46` mean/season | `448.56` | `0.5413` |

All `2,596` goal-assist passes reconcile one-to-one with goal shots. The real
all-goal share exceeds the game by `0.1297`, more than twice the preregistered
`0.05` floor. The route-compatible share is diagnostic until the game reports
the matching denominator.

## Reproducibility

- eligible shot-assist passes: `24,439`;
- excluded penalties: `400`;
- excluded direct free kicks: `1,749`;
- two complete extractions are byte-identical;
- accepted file SHA-256:
  `287e3fb15f9f90d485eee4be2773c0ea323763e87cc91023b9d86c1bc7bbe60a`;
- aggregate hash:
  `5eeb6dd3fce6c8347e0fa673a54a4b739f51361a9b41b0512329c4c120a4b85a`.

## Handoff

The preregistered outcome is **assist_supply**. 06B23D must measure, from
current match facts, mutually exclusive self-created goals, distinct
uncredited creators, credited assists and penalties. Only that same-population
decomposition may assign ownership to creator/shooter overlap or assist-credit
probability. No rate in this audit is implemented by 06B23C.

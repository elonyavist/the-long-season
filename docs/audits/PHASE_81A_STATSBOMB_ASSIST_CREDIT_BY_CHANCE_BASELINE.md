# Phase 81A - StatsBomb Assist Credit By Chance Baseline

## Verdict

**STOP / RETHINK: the proposed probability is not an empirical quantity.**
The extraction is complete, reconciled and reproducible, but every goal carrying
`shot.key_pass_id` also carries a joined pass with `goal_assist = true`.
Consequently all four reachable category rates are exactly `1.0000`. This is a
semantic identity in StatsBomb, not evidence that four football situations
share a stochastic assist-credit probability.

Copying four `10000` values into the game is rejected. It would turn every
already-distinct game creator into an assister and move the all-goal assisted
share toward the game's `0.8463` maximum, away from the external `0.6710` fact.

## Source And Population

This analysis uses [StatsBomb Open Data](https://github.com/statsbomb/open-data)
at frozen commit
[`b0bc9f22dd77c206ddedc1d742893b3bbe64baec`](https://github.com/statsbomb/open-data/tree/b0bc9f22dd77c206ddedc1d742893b3bbe64baec).
It reuses the accepted 2015/16 complete domestic-league corpus:

| Competition | Matches |
|---|---:|
| Premier League | `380` |
| La Liga | `380` |
| Serie A | `380` |
| Ligue 1 | `377` |
| **Total** | **`1,517`** |

Exactly seven workers processed `5,321,459` events. Two complete passes over
the frozen corpus produced byte-identical output.

## Reconciled Result

| Category | Goals | Distinct key-pass creator | Credited assist | Credit share |
|---|---:|---:|---:|---:|
| dead ball / set piece | `413` | `0` | `0` | `not_observed` |
| self-created | `860` | `0` | `0` | `not_observed` |
| counter / normal | `198` | `198` | `198` | `1.0000` |
| cross / header | `312` | `312` | `312` | `1.0000` |
| cross / normal | `482` | `482` | `482` | `1.0000` |
| open play / normal | `1,604` | `1,604` | `1,604` | `1.0000` |
| **Total** | **`3,869`** | **`2,596`** | **`2,596`** | **`0.6710` of all goals** |

All reachable categories clear the frozen `100`-observation floor. The four
category counts sum to the exact `2,596` assisted goals accepted by 06B23C;
dead-ball and self-created rows complete the exact `3,869`-goal denominator.
Pass and shot `From Counter` classifications disagree zero times.

The population decomposition is therefore useful even though the proposed
probability is not:

- dead-ball goals: `0.1067` of all goals;
- self-created open-play goals: `0.2223`;
- goals with a distinct credited creator: `0.6710`;
- among non-penalty/non-direct-free-kick goals, credited creator share:
  `0.7512` (`2,596 / 3,456`).

## Why The Probability Question Failed

The game currently names a general chance creator on every opportunity and can
then deny that distinct player assist credit. StatsBomb's `key_pass_id` does not
name the same concept on a goal: it identifies the pass that becomes the goal
assist. Conditioning on that field and asking whether the pass is a goal assist
therefore asks whether an assist is an assist.

This is not a low-sample result and cannot be repaired with more seasons,
competitions or a category-specific coefficient. The next design must represent
assist eligibility separately from general chance creation, decide it before
the outcome, and keep the named creator and shooter causal. The external
`0.7512` non-set-piece share may govern that eligibility only if the model makes
an eligible creator distinct by construction; it may not be multiplied by the
current independent creator/shooter overlap and called the same statistic.

## Reproducibility

- accepted file SHA-256, both runs:
  `c3bfd6bbb7dc9049f6b7d3966a4b9684969c88c0429cd3d46b9cd19e9ad821bb`;
- aggregate per-match hash:
  `41cf45b45cf0a19c7641dae76d3bf033ee835d8649b4206291967b22e348eb2c`;
- missing joins, duplicate IDs, cross-team joins, non-goal targets and category
  reconciliation failures: all `0`;
- temporary extractor, raw event cache and generated JSON were removed after
  the accepted facts were recorded here.

## Handoff

06B23E authorizes no probability table. A new design step must remove the
unreachable dead-ball probability branch and replace the overloaded boolean
with one externally interpretable assist-eligibility decision. Its checkpoint
must report non-set-piece and all-goal assisted shares separately, so a penalty
frequency mismatch cannot be hidden inside assist calibration.

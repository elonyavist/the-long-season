# Phase 81A Checkpoint L6.3C - Assist-Supply Attribution

## Verdict

**assist_credit_probability.** Existing distinct creators can support an
assisted-goal share of `0.8463`, above the real `0.6710`. Actual credited share
is `0.5489`; creator/shooter overlap is therefore not the capacity owner.

## Population

- profile `phase81a-assist-supply-l6-3c-7x1`;
- seven fresh worlds, one season, seven workers;
- all divisions simulated; seven First-Division seasons decide;
- `6,442` durable goal events;
- report hash `e96790ae524a92328fc241cf34ef4353`;
- file SHA-256
  `6da9b5479c7eb76e3619d5120472215cbeaff5a3ff348561293aef0f15254431`.

This population measures supply ownership, not ten-season leader health.

## Mutually Exclusive Goal Facts

| Kind | Count | Goal share |
|---|---:|---:|
| penalty | `341` | `0.0529` |
| self-created | `649` | `0.1007` |
| distinct creator, uncredited | `1,916` | `0.2974` |
| credited assist | `3,536` | `0.5489` |

All four real branches are reached. Report goals, report stats, player goals
and player assists reconcile with zero failures.

Derived facts:

- maximum creditable share without changing actors: `0.8463`;
- credit rate among already distinct creators: `0.6486`;
- external all-goal assisted share: `0.6710`;
- preregistered result: **assist_credit_probability**.

## Category Diagnostics

| Chance / shot | Self | Distinct uncredited | Credited | Distinct credit rate |
|---|---:|---:|---:|---:|
| counter / normal | `214` | `463` | `712` | `0.6060` |
| cross / header | `116` | `242` | `1,244` | `0.8371` |
| cross / normal | `97` | `201` | `595` | `0.7475` |
| open play / normal | `222` | `1,010` | `985` | `0.4937` |
| dead ball / set piece | penalty `341` | `0` | `0` | not observed |

These realized rates closely reproduce the shipped probabilities `0.60`,
`0.85`, `0.75` and `0.50`. The random draw is working as designed; the open
question is whether those design values reflect football.

## Handoff

No probability changes here. 06B23E must derive comparable external
chance/shot-category assist rates from the already frozen StatsBomb corpus.
Only those rates may authorize a versioned content change. The empirical
creator-role mapping remains evidence but is still unimplemented because its
concentration lane did not clear the preregistered material floor.

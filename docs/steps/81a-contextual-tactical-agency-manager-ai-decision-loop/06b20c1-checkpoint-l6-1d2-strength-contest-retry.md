# Step 06B20C1 - Checkpoint L6.1D2 Strength-Contest Retry

## Status

**Done: `GO` on 2026-08-11.** L6.1D remains canonically `REFINE`; this fresh
retry accepted the already-implemented `1.25` product candidate. No gameplay
number changed during this step.

## TESI

The `1.25` department-contest candidate should be accepted only if a fresh
population confirms two football-facing facts at once: stronger squads create
more separation, and a league table that is already historically healthy stays
healthy. L6.1D measured the first fact but its coherence reader could not
represent the second: a legacy world already inside the historical band had
zero distance to improve.

This retry corrects only that measurement. It does not reinterpret L6.1D, reuse
its seeds, tune the coefficient, widen a band or introduce a second gameplay
candidate.

## Frozen Before-State

L6.1D executed on `28 x 10` with exactly seven workers:

- legacy `1.0` champion mean: `71.4285714286`;
- product `1.25` champion mean: `73.7714285714`;
- raw champion response `>= 0.5` in `28/28` worlds;
- product inside the exact `72.3842..87.7158` band in `23/28` worlds;
- all `17` historical table guardrails held;
- reconciliation failures: `0`;
- old distance-only coherence: `17/28`, against `>= 20/28`;
- nine legacy worlds were already inside the band, leaving at most nineteen
  worlds capable of positive distance improvement.

The post-run health-preserving diagnostic read `26/28`. It demonstrates that
the new rule is reachable on real data but is not evidence for this retry.

## Frozen Reader

For each world, aggregate the ten First-Division champion rows separately for
product `1.25` and paired legacy `1.0`. Let `distance(x)` be zero inside the
exact historical band and the absolute distance from the nearest edge outside.

```text
raw_delta = product_champion_mean - legacy_champion_mean
distance_improvement = distance(legacy) - distance(product)

health_preserved =
  (distance(legacy) == 0 && distance(product) == 0)
  || distance_improvement >= 0.5

direction_preserved = raw_delta >= 0.5
```

The two readers are deliberately separate. `health_preserved` gives correct
credit to an already-healthy table; `direction_preserved` prevents an
inside-to-inside fall from being silently called a healthy strength response.
Both thresholds and the `20/28` count are frozen before fresh output.

The evaluator reports mutually readable counts:

- legacy worlds inside the band;
- product worlds inside the band;
- worlds improving distance by at least `0.5`;
- health-preserving worlds;
- direction-preserving worlds.

No count is stored in the world cache; each derives from the canonical paired
table rows.

## Locked Profiles

```text
canary profile: phase81a-strength-contest-l6-1d2-canary-7x1
full profile:   phase81a-strength-contest-l6-1d2-28x10
seed prefixes:  phase81a-strength-contest-l6-1d2-canary-v1
                phase81a-strength-contest-l6-1d2-v1
workers:        exactly 7
format:         JSON
```

The profiles reuse the one canonical `simulation-report` producer, the same
product `1.25` and the same absolute legacy override `1.0`. Their seed prefixes
have never been used by L6.1B, L6.1D or another checkpoint. The retry never
reads the L6.1D fact cache.

The `7 x 1` canary proves profile lock, schema, two complete paired arms, exact
worker count and zero reconciliation. Balance is `not_evaluated`.

## Full Decision

The fresh `28 x 10` decision is total:

- **GO**: all 28 worlds and 840 competition-seasons complete; reconciliation
  is zero; product champion mean is inside `72.3842..87.7158`;
  `healthPreservedWorldCount >= 20`; `directionPreservedWorldCount >= 20`; and
  the same 17 no-new-distance table guardrails all hold;
- **REFINE**: execution is sound but any product, health, direction or
  guardrail requirement is red;
- **STOP / RETHINK**: incomplete population, reconciliation failure, wrong
  coefficient/legacy override, reused cache or seed, observer contamination,
  or any post-output change to a seed, band, threshold, count or formula.

GO accepts the already-implemented `1.25` candidate. It does not authorize a
second coefficient and does not itself open gameplay work outside the future
integrated L6.2 design.

## What NOT To Implement

- no engine, content, match, population, market, renewal or squad-use change;
- no new strength formula or alternate coefficient;
- no modification of the L6.1D profiles, evaluator result, audit or artifacts;
- no cached replay from L6.1D and no seed reuse;
- no second report command, simulator or derived world fact;
- no HTML: this is a machine checkpoint, not the integrated user inspection.

## Outcome

The locked canary returned `GO` with exit `0`: `7` fresh worlds, one season,
`21` competition-seasons, exactly seven workers and zero reconciliation.
Balance was `not_evaluated`.

The fresh full cohort also returned `GO` with exit `0`:

| Measurement | Legacy `1.0` | Product `1.25` | Gate |
| --- | ---: | ---: | --- |
| First-Division champion mean | `72.8035714286` | `75.2142857143` | inside exact band |
| paired champion delta | - | `+2.4107142857` | half-width 95% `0.3288896584` |
| worlds inside the band | `17/28` | `27/28` | diagnostic |
| distance improved `>= 0.5` | - | `8/28` | diagnostic |
| health preserved | - | `25/28` | `>= 20/28`: held |
| direction preserved | - | `28/28` | `>= 20/28`: held |
| historical table guardrails | - | `17/17` | held |
| reconciliation failures | - | `0` | held |

The new health reader is non-vacuous on generated data: three worlds fail it,
while twenty-five pass. It correctly counts legacy-inside/product-inside worlds
without hiding direction, which independently holds in all twenty-eight.

The canonical artifacts are:

- `simulation-out/phase81a-strength-contest-l6-1d2-canary-7x1.json`, report
  hash `38be6c3670f76015438515140bcc1937`, SHA-256
  `71fa2fc534c87e4456f90233a03b1268f89442715b7d060d8ffe9caebe9e68fb`;
- `simulation-out/phase81a-strength-contest-l6-1d2-28x10.json`, report hash
  `682f859471ebd2c3a475cd93bdb19ac4`, SHA-256
  `9ba0e497d10c9784d1fd72b12edf5d91805bfea5acf2a3821d8aca68f0c18a7c`.

The same product facts also prove that upsets survive. In the First Division,
when the kickoff-strength gap is `1+`, favorites win `60.62%`, draw `23.90%`
and lose `15.48%` of `50,384` matches. The bucket is too broad to claim a
first-versus-last rate or historical calibration; that requires finer strength
buckets and pre-match rank gaps in the separately documented integrated L6.2
checkpoint. It is nevertheless direct evidence that `1.25` does not make the
favorite deterministic.

The durable decision record is
[`PHASE_81A_CHECKPOINT_L6_1D2_STRENGTH_CONTEST_RETRY.md`](../../audits/PHASE_81A_CHECKPOINT_L6_1D2_STRENGTH_CONTEST_RETRY.md).

Focused evaluator/profile verification passed `51/51`. The final `pnpm check`
passed `306` files and `2382` tests, `880` modules with no dependency
violations, all four custom checks and workspace TypeScript with real exit code
`0`. `git diff --check` is clean and `PROJECT_STATUS.md` remains below its
300-line limit.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts` and test: one
  versioned retry mode on the existing evaluator, the frozen reader and its
  fail-closed tests;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`: two locked fresh profiles and independent caches;
- `packages/i18n/src/labels.ts`: titles/descriptions in all five languages;
- `docs/audits/PHASE_81A_CHECKPOINT_L6_1D2_STRENGTH_CONTEST_RETRY.md` **(new)**
  and `docs/audits/README.md` after execution;
- this step, the phase README and `docs/PROJECT_STATUS.md`.

Before closeout, `git status --short` is crossed against the cumulative
uncommitted 06B19B/C, 06B20C and this list. Files owned by earlier steps are not
silently reassigned to this retry.

## Required Checks

1. focused evaluator/profile tests and TypeScript;
2. `7 x 1` canary alone with exactly seven workers;
3. only after canary GO, fresh `28 x 10` alone with exactly seven workers;
4. real-data reachability recorded from the fresh checkpoint;
5. `pnpm check` alone with the real exit code;
6. `git diff --check` and `PROJECT_STATUS.md <= 300` lines;
7. `graphify update .` and affected-path review.

## Exit

`GO` accepts `1.25`, closes the population-strength hierarchy owner and permits
only a separately documented integrated L6.2 checkpoint. `REFINE` or `STOP /
RETHINK` leaves the candidate unaccepted and opens nothing automatically.

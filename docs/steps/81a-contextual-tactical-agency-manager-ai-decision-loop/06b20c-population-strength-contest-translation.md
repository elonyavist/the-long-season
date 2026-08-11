# Step 06B20C - Population Strength Contest Translation

## Status

**Implemented; Checkpoint L6.1D recorded `REFINE` on 2026-08-11.** L6.1B-H
identified `population_strength` in `28/28` fresh worlds and was the only result
that authorized this step. The `1.25` candidate is measured but not accepted;
no later step opens from this result.

## TESI

A visibly stronger eleven should accumulate small advantages over ninety
minutes because its midfield wins more control, its attack works better
positions, its defenders block more often and its goalkeeper saves more. The
engine already derives those four departments from the selected footballers;
the defect is not missing quality or a missing club-rank bonus. The explicit
department-versus-department contests translate the observed gap too softly,
leaving the powered First-Division champion mean below the historical band.

`TeamStrength` remains raw player quality and tactical shape remains a separate
derived fact. This step changes only how two opposing department scores are
compared. Equal departments remain byte-identical, home advantage remains a
separate factor, tactics never add strength, and no division, reputation,
expected rank or table position enters a match.

## Frozen Before-State

L6.1B-H is the only entry evidence:

- population: `28` fresh worlds, `10` seasons, exactly `7` workers;
- current First-Division champion mean: `71.4714285714`, below the exact
  `72.3842..87.7158` register band;
- analysis replay at contest scale `1.5`: `76.7428571429`;
- healthy champion response: `28/28` worlds;
- last points, spread, PPG deviation, goals per match and draw share all kept
  their frozen no-new-distance guardrails;
- reconciliation failures: `0`.

The `1.5` replay is an owner diagnostic, not the product value. No coefficient
may be obtained by inverting its points delta.

## Frozen Product Rule

Add one required, versioned-by-content `strengthGapMultiplier` to
`MatchEngineConfig`. It is consumed by one shared pure derivation that centres
two opposing scores on their midpoint and expands only their difference:

```text
midpoint = (own + opponent) / 2
own_contest = midpoint + (own - opponent) * multiplier / 2
opponent_contest = midpoint - (own - opponent) * multiplier / 2
```

The product multiplier is frozen at **`1.25`** before checkpoint output. This
is the single coarse midpoint between the unchanged contest (`1.0`) and the
owner oracle (`1.5`), not a fitted solution. There is no second candidate in
this step: if `1.25` fails, the checkpoint records `REFINE` or
`STOP / RETHINK`; the value is not changed after reading the run.

The shared pair is read in exactly four football contests:

1. midfield against midfield before match-state control modifiers;
2. attack/build-up against defence/midfield before home advantage and chance
   texture;
3. defence against attack for block probability;
4. attack against goalkeeper for conversion.

The existing analysis replay becomes an **absolute override** of this content
multiplier. `1.0` therefore reproduces the pre-06B20C product on the same
players, lineups, fixtures and RNG streams; `1.5` retains the meaning used by
L6.1B. The old implementation that rewrites `TeamStrength` is deleted in the
same step. No parallel strength model survives.

## Why This Is Football-Facing

The change does not manufacture wins. A better side must first field better
players in the relevant department. Its advantage then appears in the actual
duels that department owns. A weak attack receives no bonus because its club is
expected to lose, and equal teams do not move at all. Surprise results remain
possible because opportunity creation, conversion and match events keep their
existing seeded randomness and bounds.

## Locked Checkpoint L6.1D

Two new profiles use seeds never read by L6.1B or L6.1C:

```text
canary profile: phase81a-strength-contest-l6-1d-canary-7x1
full profile:   phase81a-strength-contest-l6-1d-28x10
seed prefixes:  phase81a-strength-contest-l6-1d-canary-v1
                phase81a-strength-contest-l6-1d-v1
workers:        exactly 7
format:         JSON
```

Every world simulates the product arm at `1.25` and an analysis replay at
absolute scale `1.0`. The replay shares the selected players, substitutions,
calendar and match seed; it is not a regenerated historical world.

The `7 x 1` canary proves schema, exact worker count, complete paired tables,
zero reconciliation, equal-strength neutrality and reachability on real
generated First-Division matches. Its balance values are never evidence.

The full `28 x 10` decision is total:

- **GO**: all `28` worlds complete; reconciliation is zero; product champion
  mean is inside the exact First-Division band; product improves distance to
  that band by at least the frozen `0.5` points in `>= 20/28` worlds relative
  to the `1.0` replay; the five other First-Division metrics and all six table
  metrics in both lower divisions satisfy the existing no-new-distance rule;
- **REFINE**: execution is sound but the champion response is too small,
  incoherent or still outside the band;
- **STOP / RETHINK**: missing worlds, nonzero reconciliation, equal-strength
  drift, RNG/event contamination, a product result worse than the legacy arm
  beyond the registered guardrails, or any attempt to alter multiplier, seeds,
  population or target after output.

The checkpoint reports raw product and legacy means, paired per-world deltas,
half-widths, coherence count and all `17` guardrails. A global match rule may
not spend lower-division credibility to repair the First Division. It does not
reuse the L6.1B result as its own pass.

## Outcome

The locked canary completed with exit `0`, `7` worlds, one season, exactly
seven workers, `21` competition-seasons and zero reconciliation failures. Its
checkpoint decision was `GO`; balance remained `not_evaluated` as required.

The full run completed soundly but exited `1` with `REFINE`:

| Measurement | Legacy `1.0` | Product `1.25` | Gate |
| --- | ---: | ---: | --- |
| First-Division champion mean | `71.4285714286` | `73.7714285714` | product inside `72.3842..87.7158`: held |
| paired raw delta | - | `+2.3428571429` | diagnostic |
| distance improvement | - | `+0.9742428571` | diagnostic |
| coherent worlds | - | `17/28` | `>= 20/28`: **broken** |
| historical guardrails | - | `17/17` | held |
| reconciliation failures | - | `0` | held |

Every one of the `28` paired worlds increased champion points by at least the
frozen `0.5`; the product mean was inside the historical band in `23/28`.
However, the preregistered coherence reader was distance-to-band improvement.
Nine legacy worlds were already inside the band, so they received exactly zero
improvement even when the product remained inside. The gate therefore had only
`19` worlds in which positive distance improvement was possible, below its own
required `20`; its construction made the requested count arithmetically
impossible on this observed population.

That defect does not rewrite the completed decision. L6.1D remains `REFINE`,
`1.25` is not adopted, and no threshold or seed is changed after output. A
future retry needs a fresh preregistration and fresh seeds. Its natural
candidate reader is a health-preserving response: a world counts when legacy
is inside and product remains inside, or when product improves legacy distance
by at least `0.5`. Applied only as a diagnostic to this completed population,
that reader would describe `26/28`; it is not evidence for a future `GO`.

Canonical artifacts and hashes:

- canary: `simulation-out/phase81a-strength-contest-l6-1d-canary-7x1.json`,
  report hash `813f4fb36d10a1481a544edaf67ba021`, SHA-256
  `ab61efc279e46090c6ef4e882e081fa6695e3cac491b86ac4171f2df978d94c2`;
- full: `simulation-out/phase81a-strength-contest-l6-1d-28x10.json`, report
  hash `ce0c6d70571c1606b2e2a7cf2bf2dcb9`, SHA-256
  `b81ba28add0d5ece08acc731c7ea8267ac515e014ce78d5f0497b9b31bc7146e`.

The detailed decision record is
[`PHASE_81A_CHECKPOINT_L6_1D_STRENGTH_CONTEST.md`](../../audits/PHASE_81A_CHECKPOINT_L6_1D_STRENGTH_CONTEST.md).

The first full `pnpm check` then exposed exactly two product-golden quality
values shifted by one ULP. Score, event sequence, event count, RNG-driven
choices and every other field were identical. The golden was re-recorded at
those two values; this is the expected floating-point consequence of the new
contest arithmetic, not evidence that the unaccepted balance candidate passed.
The isolated file then passed `12/12`; the fresh full gate passed `306` files
and `2380` tests, dependency checks, all four custom checks and TypeScript with
real exit code `0`.

## What NOT To Implement

- no further population-band widening;
- no direct points, result, draw, rank, reputation or division term;
- no tactic or formation strength bonus;
- no market, blueprint, renewal, squad-use or player-aging change;
- no second simulator, standalone report command or cached-result fallback;
- no optional/defaulted config field and no beta-save compatibility residue;
- no second numeric candidate after the canary or full output.

## Expected Files

- `packages/engine/src/match-engine/match-engine-config.ts`: required validated
  contest multiplier;
- `packages/engine/src/match-engine/strength-contest.ts` **(new)** and its test:
  one pair derivation, symmetry, midpoint conservation, neutrality and real
  direction reachability;
- `packages/engine/src/match-engine/match-control.ts` and test;
- `packages/engine/src/match-engine/aggregate-occasion-resolver.ts` and test;
- `packages/engine/src/use-cases/simulate-season.ts` and test: analysis scale is
  an absolute config override and the superseded strength rewrite is removed;
- every existing test fixture that constructs `MatchEngineConfig`: required
  fields are added explicitly, never through a compatibility default;
- `packages/content/src/generators/gameplay-config.ts` and test: product value
  `1.25` has one content owner;
- shared CLI/web canonical identity records only if the required config fact
  changes them, always together;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and tests:
  L6.1D paired decision, purity and reconciliation;
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and test: the
  observer carries the one expected absolute replay scale instead of a boolean
  that silently meant `1.5`;
- `apps/cli/src/commands/simulation-report/report-registry.ts`, planner tests
  and `packages/i18n/src/labels.ts`: two locked profiles through the sole report
  entrypoint;
- `docs/audits/PHASE_81A_CHECKPOINT_L6_1D_STRENGTH_CONTEST.md` **(new)** and
  `docs/audits/README.md` after execution;
- this step, phase README and `docs/PROJECT_STATUS.md`.

Before closeout, `git status --short` is crossed against this list. Any touched
file missing here is added with its ownership before further edits.

## Required Checks

1. focused engine/content/CLI tests and TypeScript;
2. `7 x 1` canary alone with exactly seven workers;
3. only after canary GO, `28 x 10` checkpoint alone with exactly seven workers;
4. `pnpm check` alone, real exit code captured without a pipe;
5. `git diff --check`;
6. `graphify update .`, followed by affected-path review.

## Exit

`GO` closes the hierarchy owner and may open the previously planned integrated
L6.2 checkpoint only after that checkpoint receives its own documented design.
`REFINE` or `STOP / RETHINK` opens nothing automatically.

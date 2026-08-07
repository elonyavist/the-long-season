# Phase 81A - Checkpoint A: Ownership And Before-State

## Decision

**STOP / RETHINK.**

Recorded 2026-08-07, against the original preregistered contract. No threshold,
signal or rule was changed after reading output.

---

## Code State And Included Steps

| Item | Value |
|---|---|
| Included steps | 81A Step 01, 81A Step 02 |
| Behaviour changed by those steps | none in the minute loop; explanation trace corrected |
| Match-tactics calibration | `match-tactics-calibration-v1` |
| Explanation-trace schema | `2` |
| Beta persistence | untouched; the phase's single reset remains Step 14 |

## Population And Seed Manifest

| Reading | Population | Denominator |
|---|---|---:|
| Career selections | `7` worlds, third division, rounds `1-3` | `378` = `7 x 3 x 18` |
| Primary roles | senior squads of those clubs | `2772` = `7 x 18 x 22` |
| Low block | two real clubs, paired, home and away | `48` matches per arm |
| Ownership replay | complete `0..1` knob space, `24` steps per knob | `390625` points |

World seeds `phase81a-agency-before-state-001` through `-007`. Low-block replay
prefix `phase81a-agency-replay`, disjoint from every world seed. Exactly `7`
workers, recorded in the report the command wrote. Throughput `297.81`
selections per second.

**What this population cannot see.** One country, one division, opening rounds,
no season progression, no transfers, no injuries beyond the generated state. It
answers what a squad chooses on day one, not how that drifts.

---

## Result 1 - Ownership Replay: Step 01 Changed No Match

The intended replay - the same fixtures played before and after Step 01 -
**could not be run, and was not faked**. `controlWeight(...)` has no injection
point, so an old arm would have required either a legacy switch inside the
production engine or a second copy of the minute loop. Both are refused by the
authorization under which this oracle exists.

The declared fallback was executed instead, and for this particular change it is
stronger than a sampled replay.

### The exhaustive arithmetic proof

`legacyPhase81ControlWeightReference(...)` reproduces the pre-Step-01 term
character for character - the literals `0.12 / 0.04 / 0.03 / -0.08`, the order
`pressing, risk, width, directness`, and the final subtraction. It reads no
versioned asset. It lives only in the Checkpoint A analysis module, has no
production caller, and its removal owner is the Phase 81A closeout report.

| Quantity | Result |
|---|---:|
| `comparedPoints` | `390625` |
| `differingPoints` | **`0`** |
| `maximumAbsoluteDifference` | **`0`** |

The control term is a pure function of four intensities that
`normalizedTactic(...)` clamps to `0..1`, so this grid is the whole reachable
space rather than a sample of it.

**The gate is non-vacuous.** One basis point of drift on one knob
(`pressing: 1201`) and one flipped direction (`directness: increase`) are both
caught, each on its own test.

### Why no golden hash was needed

Step 01 made five changes. Four of them cannot reach a match at all, and the
fifth is the term proven identical above:

1. `OpportunityRoutePlan.controlCapacity` removed - **zero production readers**
   before removal.
2. `deriveControlCapacity(...)` removed - its only caller was the field above.
3. `bottleneckByRoute` added to the plan - read only by the explanation trace.
   Nothing in the minute loop iterates the plan's keys; every reader names its
   field, as the determinism rules require.
4. The trace now reads the real plan - built after the match, consumes no RNG,
   returns diagnostic data that no simulation path reads back.
5. The four control coefficients moved to the asset - `differingPoints = 0`.

A hash of seeded matches would restate this conclusion with less force. It is
recorded as a proof rather than as a witness.

**Verdict on this signal: equivalent.** Outcomes, events, ordering and RNG
consumption are unchanged by Step 01.

---

## Result 2 - The Uniform Matrix And Contextual Response

The `23 x 23` uniform-ability matrix is the Phase 81 report's, cited rather than
recomputed. Step 01 is proven above to have changed no match, so regenerating it
would spend hours to reproduce numbers that cannot have moved, and a second copy
would be free to drift from the frozen one.

| Quantity | Frozen value |
|---|---:|
| Best formation row means | `0.5184` / `0.5210` (`4-2-3-1`) |
| Formations uncountered | `0 of 23` |
| `no_dominant_formation` at `0.55` | passes |
| Counter-move gain, cross-validated | `0.0064` / `0.0117` against a `0.0295` floor |

**There is no material contextual response.** One deterministic best answer
covers all 23 opponents, and the measured counter-move gain sits below the
paired noise floor of its own sample. This signal is reproduced as the thesis
described it.

---

## Result 3 - The Real Career Path (81A Step 02)

Full document:
[`PHASE_81A_STEP_02_REAL_CAREER_BEFORE_STATE.md`](./PHASE_81A_STEP_02_REAL_CAREER_BEFORE_STATE.md).

| Metric | Measured | Thesis expected |
|---|---:|---|
| `topFormationShare` | **`0.9286`** (`4-2-4`) | high, on `4-4-2` |
| `distinctFormationCount` | `3` of `23` | few |
| **`tieDecidedShare`** | **`0.0000`** | **high - the stated cause** |
| `noChoiceShare` | `0.0000` | - |
| `meanBestMinusSecond` | `0.7610` | ~zero |
| `meanOutOfPositionSlots` | `0.0000` | - |

Primary roles over `2772` seniors, `0` undeclared: `defensive_midfielder`,
`attacking_midfielder` and `wide_midfielder` at exactly `0.0000`; `center_back`
`0.2727`; `striker` `0.2273`.

**That the absent roles cause the monoculture is an inference, not a
measurement.** This checkpoint observes both facts and isolates neither. Proving
the link is owed by the squad-identity work and its checkpoint.

---

## Result 4 - Low Block xG Baseline

| Quantity | Measured | Step 05 target |
|---|---:|---|
| `concededExpectedGoalsReduction` | `0.2248` | `>= 0.08` |
| `ownLossPerConcededReduction` | `1.4940` | `<= 2.0` |
| own opportunities, neutral -> block | `13.35` -> `7.52` | - |

**Both Step 05 targets are already met in the before-state.** They therefore
become **non-regression guardrails** and may never be cited as evidence that
Step 05 produced an improvement.

Phase 81's occasion reading - `-22.6%` own for `-1.7%` conceded, ratio `13.3` -
is superseded as a statement of the block's cost. Volume fell further here
(`-43.7%`) and xG still improved, which is only possible if the block concedes
worse chances rather than merely fewer. **The `13.3` may not be quoted again.**

Absolute levels across the two arms are not comparable: the arms are two real
clubs of unequal quality. Only the paired deltas are evidence.

---

## The Decision, And Why It Is Not GO

The preregistered GO rule required the measurement to reproduce three things:
the uniform squad structure, **the tie bias**, and the absence of material
contextual responses.

| Signal | Status |
|---|---|
| uniform squad structure | reproduced |
| **tie bias** | **falsified - `tieDecidedShare` is `0.0000`** |
| no material contextual response | reproduced |

- **GO is impossible.** A preregistered signal was falsified. The greater
  severity of the defect does not convert a falsified hypothesis into a pass,
  and rewriting the signal after reading the output would be relaxing a
  threshold whatever the intent.
- **REFINE is excluded.** It reopens Steps 01-02 for instrumentation that misses
  the real path or a replay that is not equivalent. The instrument goes through
  `selectCareerAiTeam(...)`, the replay is proven equivalent above, and the
  finding is real.
- **STOP / RETHINK is adopted**, on the clause's stated purpose: *"si aggiorna la
  diagnosi prima di toccare il modello"*. The diagnosis the structural steps were
  built on does not describe the current career.

**One honesty note that must survive this document.** The literal wording of the
STOP clause anticipates the **opposite** population - *"la popolazione reale
mostra gia varieta stabile e contromosse materiali"*. Neither occurred: there is
*less* variety than the thesis expected, not more. The outcome is adopted on the
clause's purpose, not on its text. A future reader must not conclude that stable
variety was observed.

## What Was Falsified, And What Replaces It

**Falsified:** *seven catalog shapes tie at the top on real squads and the first
entry in `FORMATIONS` wins the comparison.* Reordering the catalog would change
nothing; `tieDecidedShare` is `0.0000`.

**Replaces it:** *squads generated from one skeleton are near-identical, so one
shape is structurally better for almost all of them.* `4-2-4` wins `92.86%` of
selections by a mean structural margin of `0.7610`.

The remedy direction is unchanged - squad identity - but its mechanism is not.
Work scoped to **break ties** must be rescoped to **make the winning shape depend
on the squad**. Adding the three missing roles to every club would replace a
`4-2-4` monoculture with a `4-2-3-1` one and would satisfy no honest gate.

## Permanently Frozen Before-State

These numbers are the immutable reference for every later checkpoint. None may
be regenerated to make a later gate pass.

```text
tieDecidedShare            0.0000
topFormationShare          0.9286   (4-2-4)
distinctFormationCount     3 of 23
meanBestMinusSecond        0.7610
absent primary roles       defensive_midfielder, attacking_midfielder, wide_midfielder
concededXgReduction        0.2248
ownLossPerConcededRatio    1.4940
```

## Authorized Next Action

Rewrite the premise before changing behaviour, then:

1. `03a-squad-archetypes-and-primary-role-reachability.md` - deterministic squad
   archetypes replacing the single skeleton. Archetypes describe **players and
   roles, never a formation to choose**; no `preferredFormation` field may exist.
2. `03b-checkpoint-a2-real-career-squad-identity.md` - the post-correction
   checkpoint, on the same seeds **and** a second set never used, exactly `7`
   workers. It does not replace this checkpoint and does not erase this failure.

Its targets are frozen **before** the archetypes are implemented. Structural
work - conservation, contested routes, and everything downstream - stays closed
until Checkpoint A2 records a GO.

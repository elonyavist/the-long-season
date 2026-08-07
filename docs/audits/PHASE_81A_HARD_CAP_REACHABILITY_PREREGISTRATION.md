# Phase 81A - Hard-Cap Reachability Probe, Preregistration

**Written before the probe runs. Nothing in this document may be edited after
reading its output.** Thresholds, corpus and outcome meanings are fixed here.

## Why This Exists

Phase 81A Step 03A changed squad generation. On the `phase31-test` two-world
sample the `hard_cap_eligibility_and_display` evidence moved from
`matching=1 share_bps=5000` to `matching=0 share_bps=0`.

**This is not a gate failure, and the probe is not an attempt to make it one.**
`hardCapCohortGate(...)` bands the eligible exact-cap share at `0..9999` basis
points with an explicit minimum of `0`: it limits how *often* a public value may
land exactly on the cap, and never requires that it happen. Its non-vacuity
requirement is `eligibleObservationCount > 0`, which still holds at `2`.

What is at stake is narrower. That golden line was the **only observation in the
suite of a real generated population producing an exact cap hit**. The remaining
coverage - `player-generation-economy-audit.test.ts:272`, asserting
`eligibleExactHardCapCount === 1` - is built on hand-constructed observations
with `hardCapEligible: true` set by a fixture builder. It proves the counter
increments; it cannot prove the branch is reachable on generated data.

Re-recording the snapshot to `0/0` without this probe would retire the project's
only real-data evidence for that branch and leave a fixture standing in for it.

## Declared Corpus

Fixed before execution. Extending it after reading output is forbidden; see
*Outcomes*.

| Parameter | Value |
|---|---|
| Seed prefixes | `phase31-test`, `phase81a-hardcap-a`, `phase81a-hardcap-b` |
| Worlds per prefix | `7` |
| Seasons per world | `10` |
| Workers | exactly `7` |
| Total world-seasons | `210` |

`phase31-test` is included as a **historical reference, not a positive control**.
It is the prefix that produced the exact hit under the pre-81A squad chart, and
under the new population nothing guarantees it still does - whether it does is
one of the things this probe is here to measure. Calling it a control would
assume the answer. The other two prefixes have never been used for selection,
tuning or inspection.

Ten seasons rather than two because an exact cap hit is a *career* outcome: a
player has to grow into the cap, and a two-season window mostly measures opening
generation. Seven worlds and seven workers follow the project's gate convention -
one world per worker, and the probe runs alone.

## Declared Measurements

### Correction Made Before Execution: The Audit Observes Twice Per World

Found while wiring the reader, **before any probe output existed**, and recorded
here rather than quietly shipped.

The canonical audit is fed
`observations: [...initialObservations, ...finalObservations]` - one snapshot at
the opening of a world and one at its closing season. It does **not** observe
every season. So a row per world-season for all ten seasons does not exist in
the canonical path, and producing ten rows would mean either extending the audit
or observing seasons myself: the two things this probe is forbidden to do.

The rows are therefore **per observed season**, which is two per world:
`3 x 7 x 2 = 42` rows. The `210` world-seasons stay exactly as declared - they
are the simulation the closing observation sits on top of, and ten seasons of
growth is precisely what makes the closing snapshot worth measuring. What
changes is the artifact's row count, not the corpus.

The opening rows are kept rather than dropped. They are the least likely place
for a cap hit, and that is the point: they are the floor the closing rows are
read against.

Recorded per world **and** per observed season, never only as a total:

1. `eligibleObservationCount` - players eligible to reach the cap.
2. `eligibleExactHardCapCount` - eligible players whose public value equals the
   cap exactly.
3. `ineligibleExactHardCapCount` and `ineligibleRenderedAsHardCapCount` - the
   structural violations the gate already refuses.
4. **Approach distribution**: the maximum eligible public value observed, and the
   count of eligible values within `1%` and within `5%` of the cap.

Measurement `4` is declared now because it separates two outcomes that a bare
zero cannot: a corpus where values crowd just under the cap and one where
nothing comes near it. The first says the branch is reachable and rare; the
second says the cap sits outside the reachable value range. Choosing to look at
this *after* seeing a zero would be choosing an explanation to fit an answer.

### How "within 1% / 5%" Is Computed

Left to the implementer this is three decisions in a trench coat, so it is
settled here.

- Values are **integer minor units**, the unit public value is already stored
  in. No floating point enters the comparison.
- The two proximity bands are stated in **basis points of the cap**, `100` and
  `500`, so there is one scale rather than a second percent scale beside it.
- Band edge, integer division, floor: `edge(bps) = cap - (cap * bps) / 10_000`.
- An eligible observation is counted in band `bps` when
  `value >= edge(bps) && value <= cap`. **Both bounds inclusive.**
- The bands are **nested, not disjoint**: an exact hit is counted in `100` and in
  `500`, and every `100` observation is also a `500` observation. A row where
  `within100 > within500` is a bug, not a finding.
- Values **above** the cap are outside both bands. They cannot exist for an
  eligible player and are a structural violation the gate already refuses; if
  one appears, the probe records it rather than folding it into a band.
- When a row has `eligibleObservationCount = 0`, the maximum is written
  `not_observed` and **never `0`**. Zero is a real value that means "worthless
  player", and a row that cannot tell it from "no player" cannot be re-read.

## Artifact And Command

`docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_REPORT.md`, carrying one raw row per
`(seedPrefix, world, season)` - never only the totals. A total without its rows
cannot be re-read by anyone checking this later.

Each row carries:

| Field | Note |
|---|---|
| `seedPrefix`, `worldSeed`, `season` | the row's identity |
| `eligibleObservationCount` | denominator |
| `eligibleExactHardCapCount` | the branch under test |
| `maxEligiblePublicValueMinorUnits` | or `not_observed` |
| `within100BasisPointsCount`, `within500BasisPointsCount` | nested, as defined above |
| `ineligibleExactHardCapCount`, `ineligibleRenderedAsHardCapCount` | structural violations |
| `calibrationVersionBundle` | which economy the row was measured under |

**The probe groups the canonical observations that *feed* the audit - not the
observations it emits, because it emits none.**

`createPlayerGenerationEconomyAudit(...)` (`report-data.ts:1349`) is handed
`[...initialObservations, ...finalObservations]` and returns only their
aggregates: `PlayerGenerationCapSummary` carries counts and no rows. So a probe
that read the audit's *output* could not produce a single declared row, and one
that rebuilt only the closing observations for itself would silently drop the
`21` opening rows and would have no way to split the audit's one aggregate back
into the two observed seasons.

The reader therefore requires one seam first:

```text
PlayerEconomyObservationSnapshots { opening, closing, hardCapMinorUnits }
auditedPlayerEconomyObservations(snapshots) -> the audit's exact input
```

`createSingleWorldReport(...)` builds the pair, feeds the audit through that one
derivation, and returns the pair on `SingleWorldLongRunReport`. The probe reads
the **same two sets** to produce its `42` rows. One derivation, two consumers,
neither reconstructing what the other saw.

### Correction Made Before Execution: The Pair Is Built, Not Manufactured

Written while implementing the seam, **before any probe output existed**.

An earlier plan gave the pair a `createPlayerEconomyObservationSnapshots(...)`
factory. There is nothing for it to do: the two sets are produced at opposite
ends of `createSingleWorldReport(...)` - the opening set exists before the first
season and is already consumed by the exceptional-stock snapshot, the closing
set cannot exist until the last season has been played - so a factory that
*derived* both would build a second, equal-but-separate copy of the opening set,
the precise thing the seam exists to prevent, and one that merely returned its
own arguments would be a public function with no work and no external caller.
The pair is therefore a typed object built in place, and the only function is
the one that owns the audit's input order.

The pair also carries `hardCapMinorUnits`. Every band in this document is
defined against the cap, and a probe that re-derived the cap from the career
state would agree with the audit today and could stop agreeing the moment the
report changes which config it reads. Carrying it makes that divergence
impossible rather than unlikely.

**The probe then reconciles, and fails if it cannot.** Aggregating its own
`opening + closing` rows must reproduce the audit's cap facts exactly -
`eligibleObservationCount`, `eligibleExactHardCapCount`,
`ineligibleExactHardCapCount`, `ineligibleRenderedAsHardCapCount`. A mismatch
means the probe is describing a population the gate is not, and a probe that can
disagree with the thing it is evidence for is worth nothing. It reports the
disagreement rather than the cap numbers.

Three things this keeps true. No second simulator - a probe that simulates
separately measures its own simulator, and any hit it found would prove nothing
about the game. No change to `player-generation-economy-audit.ts`, so the other
economy gates reading that audit cannot be perturbed by the probe measuring one
of them. And no half of the data rebuilt independently of the other.

The command and its test are added to Step 03A's `Expected Files` with their
ownership before either is written.

## Outcomes

**FOUND** - at least one real exact cap hit in the declared corpus. Add that
population to the reachability proof so the branch is covered by generated data
rather than by a fixture, then re-record the
`hard_cap_eligibility_and_display` snapshot to its new value. The snapshot moves
only after the proof exists, never before.

**NOT_FOUND** - no exact hit anywhere in `210` world-seasons. This is recorded
as `NOT_FOUND`, **not** as "the cap is dead". It is an explicit decision point
with two candidate readings, and measurement `4` above is what tells them apart:
extend the corpus, or revise the cap's scale or domain. Neither is taken here.

**Forbidden in both cases.** Treating `0` hits in `2` eligible observations as
sufficient evidence on its own. Adding seeds or seasons after reading the output
to reach a hit - that is choosing a corpus for its answer, which is the same
move as relaxing a threshold. Re-recording the snapshot before the outcome is
decided.

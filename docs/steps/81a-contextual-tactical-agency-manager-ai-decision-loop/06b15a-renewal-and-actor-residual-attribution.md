# Step 06B15A - Renewal And Actor Residual Attribution

## Status

Active after Checkpoint L5.3 returned `REFINE`.

## Goal

Assign the two residual L5.3 failures to their real owners before changing any
gameplay value. This step is analytical: it reads the frozen cohort and the
production derivations; it does not rerun a smaller population or select a more
convenient seed.

## Attribution

### Renewal quality

At season ten in the first division, annual-academy players aged `21..24` have
mean current ability `10.8049` and only `0.1446` mean potential room. Only
`124 / 807` are senior quality. Surviving opening seniors aged `33+` average
`13.7973`. Quality-matched younger alternatives exist for only `2.7883%` of
veteran starts, and fresher alternatives for `1.1416%`.

The opportunity owner is therefore discharged: the mature generated cohort has
used its stored room and still does not contain enough first-team quality. The
remaining owner is the annual serious-prospect distribution, not selection,
minutes, an origin bonus or a direct veteran penalty.

Production inspection supplies an independent bound. The authored division
rarity budget expects `4..8` high-potential players per division, while roughly
`48` first-division annual candidates and the current `2.2%..3%` serious chance
produce only about `1..2`. The correction must make the existing annual
generator capable of filling that already-authored budget without changing the
national ceiling-six allocator.

### Actor concentration

Before Step 06B14, top-ten scorer output was `17.83` and shooter nomination
correlation `0.0205`. After it, they are `30.15` and `0.3753`. The engine now
selects shooters with role-and-task weights, but `shooterQualityEdgeFor(...)`
still centres conversion on role-only weights. Its comment that the expected
selected edge is zero is no longer true. A high-quality shooter is selected
more often and then compared with a lower, obsolete pool mean.

That mismatch owns the scorer inflation. Creator credit has no equivalent
conversion edge, but its `10.64` top-ten mean shows that the task multiplier is
also stronger than needed.

## Frozen Corrections For 06B15B

1. Replace the annual serious-prospect chance curve with
   `0.03, 0.04, 0.05, 0.06, 0.08, 0.10, 0.12` from `very_poor` through
   `excellent`. On a normal first-division annual pool this reaches roughly
   `4..6` serious prospects, inside the existing `4..8` high-potential budget.
   Interesting-prospect chances and ceiling-six allocation do not move.
2. Halve the Step 06B14 task-weight response: divisor `5 -> 10`, symmetric
   bounds `0.25..1.75 -> 0.625..1.375`. This is frozen from the measured
   before/after response: the minimum interpolation from correlation `0.0205`
   toward `0.3753` that reaches the attribution boundary `0.20` is `0.506`.
3. Centre shooter conversion on the exact task-weighted selection pool for the
   current chance type. One shared derivation owns selection and centring; no
   copied task table is admissible.
4. Do not change aging, recovery, selection, total opportunity counts, result
   bonuses, player origins, targets or leaderboard presentation.

## Decision

- `GO`: both owners are unique and every correction is expressible through an
  existing football fact; open 06B15B.
- `STOP / RETHINK`: either conclusion needs an age/output rule, a generated
  player bonus or a duplicated simulator.

The decision is **GO**. Step 06B15B implements only the corrections above and
then a fresh locked `7 x 10` must repeat L5.3 before Step 06B16 opens.

## Expected Files

- this document, the phase README and project status;
- Step 06B15B, written before gameplay edits;
- no production file.

## Required Checks

The source facts reconcile to the L5.3 artifact, document links resolve, and
`git diff --check` remains clean.

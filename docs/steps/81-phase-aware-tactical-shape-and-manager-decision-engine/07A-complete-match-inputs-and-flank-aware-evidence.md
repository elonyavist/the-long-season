# Step 07A - Complete Match Inputs And Flank-Aware Evidence

## Status

Done 2026-08-04. See the handoff note at the end of this document.

## Goal

Make the world the engine *measures* the same world it *plays*, and give the one
open route question an instrument instead of an argument.

## User-Facing Reason

Three things are currently true and none of them should be. A red card to the
goalkeeper costs a manager nothing. The balance report that decides this game's
numbers is produced from matches where no player has any attributes. And the
audit that says formation choice does not matter cannot tell a manager's left
flank from his right.

## Why This Step Exists Between 07 And 08

Step 07 found all three while wiring causal actors, recorded them, and fixed none
of them, because none was its business. They are collected here rather than
scattered into later steps for one reason: **they are the same defect wearing
three faces.** In each, the engine's own evidence describes something other than
what a manager experiences. Left separate, each looks like a footnote; together
they decide whether any number this phase has measured can be trusted.

This step must land before Step 11, which is the deadline for the carried
`goals_per_match_avg` monitor, and before Step 12, which runs the checkpointed
`50 x 20`. Measuring at cohort scale on the wrong population is the one mistake
that cannot be undone cheaply.

## Block 1 - Player Attributes Are Not Optional

`MatchTeamContext.incidentProfiles` is optional, and `incidentProfileFor` returns
a neutral profile of `10`s when it is absent. Two producers omit it, and both
matter:

| Path | Profiles today |
|---|---|
| career play - `progress-fixture.ts` via AI squad selection | yes |
| web and CLI live/preparation via `buildTacticTeamContext` | yes |
| `ten-season-report` - the A7 monitor's instrument | yes |
| `simulateSeason` default path - no `aiSelection` | **no** |
| `calibration-report.ts`, reached by `pnpm cli balance-report` | **no** |

So the balance report is produced from football where every player tackles at
`10`, keeps his composure at `10`, never tires from a real starting fitness, and
where both Step 07 actor edges are structurally `0`. That is not a slightly
different population. Discipline, injuries, penalties and therefore goals are all
being measured against players who do not exist.

**The fix is small and the guard is the point.** Both profile-less producers live
in `simulate-season.ts` and already hold `team.players`, so supplying profiles is
two call sites. Making the field **required** is what stops the next producer
from omitting it, in the same way `ROLE_WEIGHT_KEY_BY_CANONICAL_ROLE` makes a
missing role a build failure rather than a silent `midfielder`.

The neutral fallback in `incidentProfileFor` goes with it. It cannot survive a
required field, and it should not: a fallback that returns plausible numbers is
how this stayed invisible.

**This will move numbers, and that is information rather than a regression.**
Real fitness replaces `100`, real tackling replaces `10`, and penalties are one
of the ways a goal happens, so `goals_per_match_avg` may move. Measure it, record
it, and do not tune anything back to hide it. If the monitor leaves its band, say
so and hand it to Step 11 with the measurement, exactly as Phase 80A handed it
here.

## Block 2 - A Sent-Off Goalkeeper Must Cost Something

`removeForcedOffPlayerFromMatchContext` promotes the best remaining outfield
player into goal after a dismissal or a forced injury exit, rewrites his
`canonicalRole` to `goalkeeper`, and leaves `strength` untouched. The conversion
term therefore keeps reading the goalkeeper department that was derived from the
man who just left the pitch. A centre-back in goal saves like an international.

**`strength` cannot simply be recomputed here.** `MatchTeamContext` carries no
`players` and no `roleWeights`, so `deriveTeamShapeAndStrength` is unreachable
from this module. Anything that reaches for them would drag content into the
minute loop.

What the module *does* have, at the moment of promotion, is the incident profile
of both goalkeepers - the one leaving and the one arriving - measured in the same
attributes off the same accessor. That is a same-scale comparison, and it is
enough: scale `strength.goalkeeper` by how much worse at goalkeeping the promoted
player is than the specialist he replaces. An equal replacement changes nothing;
an outfield player drops the department in proportion to the real gap.

This is also what makes a goalkeeper actor edge possible at all. Step 07 refused
one because the only anchor available compared a raw attribute against a
role-weighted department score, and against the neutral fallback that difference
was a large constant rather than zero. With Block 1 done the fallback is gone,
but the scale mismatch is not, so the edge stays refused and the department is
corrected instead. **Do not add a goalkeeper edge in this step.** Fixing the
department is the honest fix; an edge on top of it would price the same fact
twice.

## Block 3 - The Audit Cannot See A Flank

`crossShareOf` sums `chanceType: "cross"`, which covers both flanks, so the audit
measures how *wide* a shape played and never which side it favoured. Step 07 put
the route on the event, so the instrument is now buildable.

Add per-route counts beside the existing chance-type counts in the audit series,
and report `left` and `right` separately. Then answer the one question the phase
has been carrying without an instrument:

> **Open - a route's defining phase carries `11.7%` of its own chain**, so a real
> `-12.8%` flank difference between formations arrives as `-1.5%`. That is why
> the formation row is inside the noise. Recorded as a reopen candidate on
> Step 04.

Measure what the flank difference actually is now, between formations that
genuinely differ down one side, and write the number into Step 04's document.

**Change no model.** `TACTICAL_ROUTE_DEFINITION` is frozen and its chain
weighting is Step 04's. This step delivers the measurement that a Step 04 reopen
would need to be decided on evidence rather than on the recollection of an
earlier one. Deciding it is that reopen's job and takes a numbered contract
amendment.

## What To Implement

- Make `MatchTeamContext.incidentProfiles` required and validate it as such.
- Remove the neutral fallback from `incidentProfileFor`.
- Supply profiles from both `simulate-season.ts` context builders.
- Scale `strength.goalkeeper` on emergency promotion by the same-scale
  goalkeeping gap between the outgoing and incoming keeper.
- Add per-route counts to the tactical-shape audit series and split flank
  reporting into `left` and `right`.
- Re-measure the A7 monitor and the balance report on the corrected population
  and record both, whatever they say.
- Measure the real between-formation flank difference and write it into Step 04.

## Clean-Code Requirements

- A required field, not a defaulted one. No `?? neutralProfile` survives.
- The goalkeeper correction is one named function with the football reason on it,
  not an inline coefficient.
- Route counts are derived from the events the audit already walks; no second
  simulation pass and no parallel model.
- Every fixture that builds a `MatchTeamContext` supplies real profiles. A
  fixture that wants attribute-neutral players says so by supplying neutral
  numbers explicitly, so the intent is readable.

## What NOT To Implement

- No goalkeeper actor edge. Block 2 corrects the department instead.
- No change to `TACTICAL_ROUTE_DEFINITION`, its chain weighting, or any
  `TACTICAL_SHAPE_THRESHOLDS` value.
- No recalibration to move a monitor back into band. Measure and report.
- No cohort run. Step 12 owns the `50 x 20`.
- No UI work and no storage migration.

## Expected Files

- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/match-discipline.ts`
- `packages/engine/src/match-engine/match-team-exit.ts`
- `packages/engine/src/match-engine/match-team-exit.test.ts`
- `packages/engine/src/match-engine/match-simulation-state.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- every test fixture that builds a `MatchTeamContext`, which the required field
  turns into a compile error and therefore enumerates itself
- `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/04-relational-phase-matchup-and-route-capacity.md`
- `docs/PROJECT_STATUS.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm check
pnpm cli balance-report
pnpm cli ten-season-report
graphify update .
```

The two reports are the point of the step, not a formality. Run them before and
after Block 1 and record both readings.

## Definition Of Done

- No `MatchTeamContext` anywhere can exist without real player attributes, and
  the type says so.
- An emergency goalkeeper concedes measurably more than the specialist he
  replaced, and an equal replacement changes nothing.
- The audit reports `left` and `right` separately.
- The A7 monitor and the balance report are re-measured on the corrected
  population and recorded, in band or not.
- Step 04 carries a measured flank difference instead of a remembered one.
- Nothing was tuned to make a number look better.
- Step 08 is the only next action.

## What The Code Said That The Plan Did Not

### The Required Field Found Four More Producers, Two Of Them In Career Play

The plan named two profile-less producers, both in `simulate-season.ts`. Making
the field required turned every other one into a compile error, and there were
four:

| Producer | What it feeds |
|---|---|
| `simulate-season.ts`, default team path | `balance-report`, the season golden |
| `simulate-season.ts`, fixture lineup override | CLI lineup inspection |
| `matchday-adapter.ts`, `buildCareerTeamsByClubId` | **every opponent in web career play** |
| `apps/cli career/progression.ts` | **every opponent in CLI career play** |
| `apps/cli simulate-season.ts`, two context builders | CLI season inspection |

The two marked ones are the reason this block was worth a required field rather
than two patches. In career play the manager's own club is built through
`buildTacticTeamContext` and always had real attributes, while every side he
faced was assembled by a different branch that omitted them. So the player's
eleven tackled, tired and kept their nerve as themselves, and all twenty-odd
opponent clubs did it at a flat `10`. Nothing failed, because the engine invented
those numbers on the way past.

Patching the two known sites would have left both of those exactly as they were,
and nothing would have pointed at them.

The five sites now share `matchPlayerIncidentProfilesForLineup(...)`, which walks
the lineup rather than a player list so a producer cannot cover ten of eleven.

### An Incomplete Label Table Is A Runtime Crash, Not A Build Failure

With real attributes in the CLI season, a penalty was scored where none had been
before, and the fixture detail formatter died on
`Unknown localization key: event.shotType.set_piece`. Fixed, and it died again on
`event.chanceType.dead_ball`.

Both keys belong to **total domain unions** - `ShotType` has three members and
`ShotChanceType` has four - and both were missing from all five languages, in
every language, since those unions were introduced. They were unreachable in
these fixtures rather than unused.

The cause is that `presentationMessageKey(prefix, value)` builds the key by
string concatenation, so an incomplete table cannot fail to compile the way
`ROLE_WEIGHT_KEY_BY_CANONICAL_ROLE` does. `pnpm check:localized-text` does not
catch it either: it checks that presentation text is localized, not that a key
family covers its union.

The other three families this formatter builds the same way -
`conditionTracking`, `effectDirection`, `varianceMarker` - were checked by hand
and are complete. **Recorded, not fixed:** nothing structurally prevents the next
union member from being a crash in a rarely-taken branch. A check that walks
these key families against their unions is the fix, and it belongs to whichever
step next owns presentation.

### Team Strength Cannot Be Recomputed Where The Goalkeeper Changes

As the plan suspected, and worse than it assumed. `MatchTeamContext` carries no
`players` and no `roleWeights`, so `deriveTeamShapeAndStrength` is unreachable
from `match-team-exit.ts` and nothing there can re-derive a department.

The correction is a ratio between the two keepers' goalkeeping, taken from the
same attribute off the same accessor, with a floor at `0.35` of the department
because an outfield player in goal is far worse than a specialist and is still
not an empty net. An equal replacement changes nothing, which is what makes it a
comparison rather than a penalty for the shirt changing.

### The Flank Instrument Works And The Population Cannot Exercise It

Measured over the curated formations: asymmetries from `0.0588` to `0.2105`,
mean `0.126`, against a sampling noise floor near `1 / sqrt(35)` = `0.17`. Every
row sits inside it, and must: the calibration enforces left/right mirror symmetry
and every curated formation fields the same shape on both flanks, so this
population's *expected* asymmetry is exactly zero.

The recorded `-12.8%` flank claim therefore cannot be checked here at all -
there is no flank difference in this population to attenuate. Step 04's document
now carries the table and what deciding its reopen would actually need: a
deliberately lopsided side. Choosing that population is that step's call and was
deliberately not made here.

### Files Touched Beyond `Expected Files`

- `packages/engine/src/match-engine/tactic-team-context.ts` - home of
  `createMatchPlayerIncidentProfile`, so the plural belongs beside it.
- `packages/engine/src/match-engine/index.ts` - exports it.
- `packages/engine/src/test-fixtures/match-player-incident-profiles.ts` - new;
  the neutral fixture the required field forced on eighteen call sites.
- `apps/web/src/features/matchday/matchday-adapter.ts`,
  `apps/cli/src/commands/career/progression.ts`,
  `apps/cli/src/commands/simulate-season.ts` - the four unplanned producers.
- `packages/i18n/src/labels.ts` - the two missing labels, in five languages.

## Verification

```text
pnpm check                                    EXIT_REALE=0
Test Files  273 passed (273)
     Tests  1985 passed (1985)
```

### The Two Instruments, Re-Measured

`pnpm cli balance-report`, taken before and after Block 1 in the same session:

| Metric | Before | After | Status |
|---|---|---|---|
| Goals per match | `2.729` | `2.739` | PASS both |
| Home win rate | `0.394` | `0.391` | PASS both |
| Draw rate | `0.261` | `0.266` | PASS both |
| Away win rate | `0.345` | `0.343` | PASS both |
| First-place points | `68.200` | `69.200` | PASS both |
| Last-place points | `27.000` | `28.200` | PASS both |
| Table points spread | `41.200` | `41.000` | PASS both |
| Upset proxy rate | `0.361` | `0.359` | PASS both |

This is the report that was measuring attribute-neutral football, and the
aggregate barely moved. That is worth stating precisely rather than as relief:
the *population* changed completely - every player now tackles, tires and keeps
his nerve as himself - and the league-level aggregates did not. Player attributes
were already inside department strength through the role-weighted scoring pass;
what was missing from this path was their effect on discipline, injury, fitness
and the two Step 07 actor edges, and those are second-order at league scale.

`pnpm cli ten-season-report`, the A7 monitor's instrument:

| Metric | Step 06 recorded | Now | Status |
|---|---|---|---|
| `goals_per_match_avg` | `2.74` | `2.78` | PASS, band `2.0..3.2`, warn outside `2.3..3.0` |
| `table_points_spread_avg` | `42.0` | `40.1` | PASS, band `36..60` |

Whole anomaly block PASS. Nothing was tuned; no threshold, denominator or
severity was touched.

**That second table does not measure this step, and the row header says so.**
`2.74` was recorded at Step 06's commit. Between it and this run sit **two**
steps, 07 and 07A, so `+0.04` is their combined movement and none of it can be
attributed to either alone.

This is not a small caveat here, because of which step it hides. Step 07's own
verification says every season aggregate stayed identical - measured on the
*season golden*, which is on the profile-less path where both actor edges are
structurally `0`. The ten-season path is not: it supplies `aiSelection`, so it
has always carried attributes and Step 07's actor edges were live in it from the
moment they landed. Nobody ran this report at Step 07. Its effect on the carried
monitor is unmeasured, and this run cannot separate it from Block 1's.

That matters more than the number does. A7's rule is that Step 11 is the deadline
and, if the monitor is still out of band there, **the fix is reopening Step 06** -
so knowing which step moves the goal rate is exactly what decides whether Step 06
is the right thing to reopen. Attributing a combined `+0.04` to whichever step
happened to measure last is how a phase reopens the wrong thing.

Isolating them needs one run at `c1f3bda` (Step 07 committed, 07A not) for this
step's own delta, and one at `a62ced4` for Step 07's. Both are cheap and neither
was done here.

The other WARN blocks in that report - youth population, contract funnel - are
untouched by this step: nothing here feeds squad generation or wage negotiation.

### 2026-08-04 - docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/07A-complete-match-inputs-and-flank-aware-evidence.md

- Status: Done
- Outcome: player attributes are required on every `MatchTeamContext` and covered
  per lineup player; the neutral fallback is gone; six producers supply them
  through one shared reader. A sent-off goalkeeper now costs the goalkeeper
  department in proportion to the real gap. The audit counts routes and reports
  `left` apart from `right`.
- Adopted solution: make the field required rather than patch the two known
  sites - which is what surfaced the four unplanned producers, two of them the
  opponents in career play - and correct the goalkeeper department by a
  same-scale ratio because this module cannot re-derive strength.
- Verification: `pnpm check` green at `1985/1985`; both balance instruments
  re-measured and recorded above; A7 `2.74` to `2.78`, still PASS.
- Follow-up: two items recorded and unowned. An incomplete `presentationMessageKey`
  family is a runtime crash rather than a build failure, and
  `check:localized-text` does not cover it - a check that walks those families
  against their domain unions is the structural fix. And Step 04's flank reopen
  now has an instrument but needs a deliberately lopsided population before it
  can be decided.
- Next action: Step 08.

# Step 07A - Complete Match Inputs And Flank-Aware Evidence

## Status

Not started.

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

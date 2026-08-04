# Step 07 - Route Quality, Causal Actors And Explanation Facts

## Status

Done 2026-08-04. See the handoff note at the end of this document.

## Goal

Create one explicit occasion context in which route and named actors exist
before aggregate quality and outcome are resolved.

## User-Facing Reason

The manager should see events that follow from the selected players and route,
not names attached after the engine has already decided the result.

## Inherited From Step 06 - The Shot Chain Is Already Reordered

Step 06 rebuilt `aggregate-occasion-resolver.ts`, which this step then makes
consume the occasion context. Build on the chain that is there rather than the
one the original plan assumed, and do not collapse it back.

Each actor is asked exactly one question, in pitch order:

1. **Blocked?** defence against attack.
2. **On target?** the striker and the position he is shooting from. **The
   keeper has no input here.** Whether a shot hits the target belongs to
   whoever struck it.
3. **Goal or save?** only now the keeper, deciding which side of the line a
   shot already on target ends up.

The version before it asked the keeper both how good the chance was - he carried
`0.40` of the defending score - and how often shots were on target, since every
save counts as on target. A world-class keeper therefore *raised* his opponent's
shots on target while leaving goals unchanged, because two keepers nine points
apart landed in one conversion band. A poor striker out-shot a great one and
scored just as often. Measured after the fix, keeper quality moves goals into
saves without touching the shot count:

| striker 19, only the keeper changes | on target | goals | saves |
|---|---|---|---|
| keeper `19` | `44.4%` | `14.6%` | `29.7%` |
| keeper `14` | `44.4%` | `18.0%` | `26.4%` |
| keeper `10` | `44.4%` | `20.3%` | `24.1%` |

Two constraints this step must preserve when the context arrives:

- **A goal is a shot on target and a block never is.** `isShotOnTarget` is not
  free to drift from the outcome.
- **A keeper always saves some share of what reaches him.**
  `MAX_GOAL_SHARE_OF_ON_TARGET` exists because a goal is one kind of shot on
  target, so without a ceiling a large enough mismatch makes every shot on
  target a goal and the keeper stops existing. It binds in `0.6%` of matchups;
  median keeper save share is `61%`.

`aggregate-occasion-resolver.test.ts` states all of this and must keep passing
once actors are named. Named actors replace *who* is credited, never *whether*
the chain asks each question once.

## What To Implement

- Add one typed `OccasionContext` containing route, attacking/defending side,
  creator, shooter, primary defender, goalkeeper, and bounded route facts.
- Select actors before resolution through dedicated deterministic RNG streams.
- Make relevant actor attributes contribute boundedly to route quality and
  aggregate resolution without simulating autonomous agents.
- Make the resolver consume the occasion context and keep exactly one outcome
  owner.
- Project route plus causal actors into sparse structured match events and the
  explanation trace.
- Replace/remove post-resolution actor attribution and any duplicated chance
  type/actor selection path.
- Bump the match-event contract only if the new structured route fact is
  persisted; Step 08 owns the one final save/schema reset.
- Add tests for causal ordering, actor eligibility, goalkeeper identity,
  role/route relevance, no duplicate actor, event coherence, and deterministic
  replay.

## Clean-Code Requirements

- `OccasionContext` is a football concept, not a bag of optional fields.
- Do not preserve the old actor path behind a fallback.
- Keep actor selection, quality derivation, resolution, and event projection
  as distinct named responsibilities behind one occasion seam.
- Remove obsolete fixtures and catch-all route mappings.

## What NOT To Implement

- No full pass sequence, generic duel engine, event bus, or player-agent loop.
- No rendered commentary or prose in engine/domain.
- No UI work.
- No storage migration or compatibility path.

## Expected Files

- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/domain/src/entities/match-event.entity.test.ts`
- `packages/engine/src/match-engine/occasion-context.ts`
- `packages/engine/src/match-engine/occasion-context.test.ts`
- `packages/engine/src/match-engine/chance-actors.ts`
- `packages/engine/src/match-engine/chance-actors.test.ts`
- `packages/engine/src/match-engine/occasion-resolver.ts`
- `packages/engine/src/match-engine/aggregate-occasion-resolver.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/entities/match-event.entity.test.ts \
  packages/engine/src/match-engine/occasion-context.test.ts \
  packages/engine/src/match-engine/chance-actors.test.ts \
  packages/engine/src/match-engine/step-match.test.ts \
  packages/engine/src/match-engine/create-match-report.test.ts \
  packages/engine/src/match-engine/match-explanation-trace.test.ts \
  packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Route and actors exist before quality/outcome resolution.
- Actor attributes affect only relevant bounded facts.
- Structured events and explanation trace agree with the occasion context.
- Post-resolution attribution and superseded chance inference are absent.
- No autonomous-agent or pass-chain abstraction exists.
- Step 08 is the only next action.

## What The Code Said That The Plan Did Not

### The Chain Was Circular, And The Cycle Is Where The Bug Lived

The plan asks for actors before resolution. The code made that impossible as
written: `deriveShotContext(route, resolution.quality)` read the *resolved*
quality to decide whether a cross was headed, and `selectChanceActors` was
seeded with that shot type. So the shooter depended on the quality, which
depended on the outcome, which is exactly the ordering this step exists to
remove - and it meant forcing a different outcome quietly picked a different
player.

The cycle is cut at the shot type. Whether a cross is met with a head is now a
contest between two named players - the shooter's `strength` against the primary
defender's - decided before anything is resolved and consuming no randomness.
The actor stream lost `shotType` from its key and keeps `chanceType`, which
comes from the route alone. Shot type feeds no conversion term anywhere; it
decides how the event reads and how likely the creator is to be credited.

### An Actor Edge Must Be A Deviation From The Pool, Not From A Department

The first shape of this had the shooter, the blocker and the goalkeeper each
measured against their side's department strength. That is wrong twice over.

It inflates. `strength.attack` is a role-weighted department score and the
selection distribution over shooters is not centred on it, so the term would
have had a population mean and every match in every division would have
converted slightly differently - the same mistake the route term's
`EVEN_CONTEST_ROUTE_CAPACITY` anchor exists to prevent.

Worse, it breaks on a context with no per-player attributes.
`incidentProfileFor` returns a neutral profile of `10`s, so against a keeper
department of `13` the edge would have been a *constant* `-3` - not zero - and
every aggregate-only match would have conceded more. `occasion-context.test.ts`
locks the corrected rule: an edge is a distance from the selection-weighted mean
of the same attribute over the same pool, off the same accessor, so an absent
profile gives every candidate the same value and the edge is exactly `0` with no
branch and no fallback. Measured over 90 chances the mean shooter edge is under
`0.01` of a quality point and the mean defender edge under `0.01` of a block
share.

### The Goalkeeper Has No Edge, And That Is The Honest Answer

He is drawn from a pool of one, so there are no peers to deviate from. The only
anchor available is `strength.goalkeeper`, and subtracting a raw attribute from a
role-weighted department score compares two scales - which is what produced the
constant above. He stays causal: he is named before resolution, and the
department the conversion term reads was derived from him.

**Found, not fixed.** `match-team-exit.ts` promotes an outfield player into goal
after a dismissal or a forced injury exit and rewrites `canonicalRole`, but does
not recompute `strength`. An emergency keeper therefore still defends the goal as
well as the specialist he replaced. Closing it means recomputing team strength on
promotion, which is that module's job and not this step's. Both
`occasion-context.ts` and `aggregate-occasion-resolver.ts` say so where the term
would otherwise be missed.

### Which Simulation Paths Carry Player Attributes

`simulateSeason` has two team-context paths and only one of them sets
`incidentProfiles`. With `aiSelection` supplied it goes through
`buildAiSquadMatchTeamContext`, which does; without it, it goes through
`deriveTeamShapeAndStrength`, which does not, and both actor edges are then
exactly `0`.

Sorted, because the difference decides which measurements mean anything:

| Path | Profiles |
|---|---|
| career play - `progress-fixture.ts` via AI squad selection | yes |
| web and CLI live/preparation via `buildTacticTeamContext` | yes |
| `ten-season-report` - the A7 `goals_per_match_avg` instrument | yes |
| `calibration-report.ts` | **no** |
| `apps/cli simulate-season`, outside a setup override | **no** |
| the `simulate-season.test.ts` golden | **no** |

The monitor that matters is on the right side of that line, which is the point
worth checking before trusting any of it. The calibration report is not, and it
is worth knowing that the numbers it produces come from a population where
discipline, injury and both actor edges are attribute-neutral. That predates this
step - the same field has always driven discipline and injury - and is recorded
rather than decided.

It is also why the season golden moved only its scorer list: that fixture is on
the profile-less path, so the chances themselves could not change.

### The Audit Can Now Split The Flanks, And Deliberately Does Not

`crossShareOf` sums `chanceType: "cross"`, which covers both flanks, so the audit
measures how *wide* a shape played and never which side it favoured. The route is
on the event now, so the instrument exists. It is the measurement Step 04's open
flank reopen would need - `a route's defining phase carries 11.7% of its own
chain`, so a real `-12.8%` formation difference arrives as `-1.5%` - and it
belongs to that reopen, not here. `tactical-shape-audit.ts` records this where
the row is declared.

### `MatchStepEvent` Has More Than One Producer

The route was first made *required* on the non-goal step event and optional on
the goal one, on the reasoning that the only shot outcome skipping the route
model is a scored penalty. That reasoning was about `stepMatch`, and `stepMatch`
is not the only producer: `matchday-adapter.ts` rebuilds step events out of
persisted reports to score player ratings, and a report written before
match-event schema `8` carries no route at all. The engine typechecked; the web
did not, and only the full gate said so.

The engine-local type now mirrors the durable `ShotContext` exactly - optional in
both - because a shared vocabulary cannot promise something one of its producers
cannot supply. The stronger fact is still true and is asserted where it holds:
`step-match.test.ts` walks a full match and requires a route on every shot whose
chance type is not `dead_ball`.

Step 08 owns the save reset, after which no schema `7` report survives. The
optionality still stays, because the penalty case is permanent.

### Files Touched Beyond `Expected Files`

Each one was forced by a contract change, not chosen:

- `packages/domain/src/entities/match.entity.ts` - schema `7` to `8`.
- `packages/engine/src/match-engine/occasion-resolver.ts` - the resolver input is
  now `{ simulation, occasion }`.
- `packages/engine/src/match-engine/aggregate-occasion-resolver.test.ts` - the
  step says these tests must keep passing, and they build the resolver input
  directly. They now build it through `buildOccasionContext`, so they measure the
  chain a match actually runs.
- `packages/engine/src/match-engine/simulate-match.test.ts`,
  `player-match-rating.test.ts`, `packages/engine/src/career/match-availability-consequences.test.ts`
  - step-event and report literals that gained `route` or the new schema number.
- `packages/engine/src/use-cases/simulate-season.test.ts` - the season golden.
- `apps/web/src/features/matchday/matchday-adapter.ts` - the second producer of
  `MatchStepEvent`, which now carries the persisted route through. No UI reads it.

## Verification

```text
pnpm check                                    EXIT_REALE=0
Test Files  273 passed (273)
     Tests  1979 passed (1979)
```

The first full run was **red**, and on a modelling error rather than a mechanical
one. `route` had been made required on the non-goal step event; `apps/web`
typechecks last in the chain and was the only thing that said so. See the section
above. Two later runs were killed by the environment mid-suite and are not
evidence of anything; the run recorded here is the one that completed.

The season golden is the measurement that matters, because it is the only place
a whole season is compared field by field. **Every structural number is
byte-identical** - same champion on the same `50` points, same runner-up, same
bottom club, same `34` rounds and `306` fixtures, same shots and events in the
first and last of them. What moved is the top scorer list: the golden boot
changed hands within `club:test-02`, and second and third swapped on five goals
apiece.

That is precisely the signature this step should leave on a context with no
player attributes. Actors are selected before resolution and no longer keyed on a
shot type that did not exist yet, so a different team-mate is on the end of the
same chances - who scored moved, how many were created and how many went in did
not. The `simulate-match` golden moved by one field, `route: "direct"` where the
old event could only say `chanceType: "open_play"`, and by nothing else.

The `goals_per_match_avg` monitor (A7) is therefore untouched by this step at the
season level, which is what the zero-mean edge design is for. It is still Step 11's
deadline and Step 12's confirmation; nothing here re-ran `ten-season-report`, and
`No cohort runs anywhere else` binds.

`tactical-shape-audit.test.ts` passes unchanged, so every `TACTICAL_SHAPE_THRESHOLDS`
invariant still holds with actor edges live in that population.

### 2026-08-04 - docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/07-route-quality-causal-actors-and-explanation-facts.md

- Status: Done
- Outcome: one `OccasionContext` now carries the route, the four actors, the
  bounded actor edges and the assist decision, all settled before the resolver
  runs. `AggregateOccasionResolver` consumes it and remains the only outcome
  owner. The route is persisted on `ShotContext` at schema `8` and summarised in
  the explanation trace at schema `2` alongside shooter counts.
- Adopted solution: cut the shot-type/quality cycle by deciding execution from
  the shooter against the primary defender; anchor every actor edge on the
  selection-weighted mean of the pool the actor was drawn from so an absent
  profile yields exactly `0`; give the goalkeeper no edge rather than one built
  from two different scales.
- Verification: `pnpm check` green at `1979/1979`; season golden moved only its
  scorer list, every structural field identical.
- Follow-up: all three items recorded above are owned by **Step 07A**, created
  for them - emergency-goalkeeper strength is never recomputed, two
  `simulateSeason` paths carry no incident profiles (one of them feeds
  `pnpm cli balance-report`), and the audit cannot split cross share by flank.
  They were collected rather than scattered because they are one defect wearing
  three faces: the engine's evidence describes a world other than the one played.
- Next action: Step 07A, then Step 08.

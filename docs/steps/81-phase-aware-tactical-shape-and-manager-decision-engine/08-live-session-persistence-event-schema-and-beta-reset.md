# Step 08 - Live Session, Persistence, Event Schema And Beta Reset

## Status

Done 2026-08-04. Reopened and closed again on 2026-08-06 by Step 13's browser
gate; see below.

### Reopened 2026-08-06 - The Schema Bump Left Its Persistence QA Behind

This step moved the OPFS schema `22 -> 23` and did not move
`apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`, which asserted the shipped
version as a literal `22`. Step 13 is the first Phase 81 step whose Required
Checks include `pnpm web:visual:qa`, so this is where it surfaced.

**Nobody skipped a declared check.** No per-step check block in Steps 01-12 lists
the browser suite; only the phase-level block and Step 13 do. This step's own
checks were targeted vitest plus typecheck, and none of them reads that spec.
That is the finding worth keeping: a gate that lives only in the phase-level
block is a gate that runs once, at the end.

The stale literal hid a second and worse problem. The spec seeds a *future*
schema and requires the app to reject and preserve it. That fixture was version
`23`, so after the bump the "future" database was the shipped one - the assertion
would have been checking that the app rejects its own schema. Playwright stops a
test at the first failed expectation, so the `22` mismatch masked it and those
lines never ran.

#### What Was Changed

Only the spec. The schema, the migrations and the reset behaviour are as this
step shipped them; nothing about persistence was re-decided.

`SQLITE_CAREER_SCHEMA_VERSION` is already public through `@game/storage`, so the
three versions are now derived from it - beta at `-2`, shipped, future at `+1`,
with the marker string built from the future number - and passed into
`page.evaluate` rather than written twice. The next bump moves all three
together, and the future fixture cannot quietly stop being ahead of the app.

#### Verification

```text
pnpm --filter @game/web run typecheck   exit 0
pnpm web:visual:qa                      see Step 13's report
```

## Goal

Route pre-match, manual, and live team changes through the same tactical seam,
persist the final Phase 81 match/event facts losslessly, and reset incompatible
beta saves once.

## User-Facing Reason

A formation or role change during the match must influence only the football
that follows and must survive refresh without rerolling or changing meaning.

## What To Implement

- Make pre-match preparation, manual schedule, substitutions, formation
  changes, role changes, and tactic changes rebuild the same typed team
  context, intrinsic shape, and policy stamp.
- Preserve the invariant that a confirmed change at completed minute `N`
  affects minute `N + 1`.
- Verify pre-match and live application of the same change produce the same
  structural delta.
- Land the single context constructor taking an explicit squad rather than a
  club to derive one from (A1, A8). The caller decides which players will play;
  the constructor never reaches back into club ownership to find out. This is
  the seam a background driver uses for a non-selected club, and the seam
  Phase 82A later uses for a borrowed player.
- Finalize active-match state, match-report, event route, telemetry, and
  explanation persistence after Steps 02-07.
- Record match facts and statistics against the club a player was fielded by,
  not the club holding his contract (A8). Today the two always coincide, so this
  is a naming and sourcing decision with no behaviour change. It stops
  coinciding with Phase 82A's first loan, and by then the recorded history
  already exists: an appearance attributed to the parent club would have to be
  rewritten rather than extended. Add a test that fixes the attribution rule
  explicitly, so a later change to it fails loudly.
- Advance the supported beta save/schema/event versions as required and delete
  incompatible saves/databases through the canonical reset flow.
- Add JSON and SQLite/OPFS round-trip, resume, same-seed, no-reroll,
  idempotency, stale-policy rejection, and pre/post-command statistic tests.
- Remove old schema readers, optional legacy defaults, stale event cases, and
  fallback reconstruction.

## Clean-Code Requirements

- One context builder serves every driver and Adapter.
- Derived shape is either recomputed from canonical inputs or cached with an
  explicit validated policy stamp; there is no second career ledger.
- No persistence mapper casts an open string into a tactical or route union.
- Beta reset deletes compatibility code instead of adding migration branches.

## What NOT To Implement

- No AI or UI change.
- No retroactive statistic/event mutation.
- No separate live coefficient path.
- No beta migration, dual schema, or legacy fallback.
- No loan or registration model. A8 fixes where an appearance is attributed; it
  does not introduce a second club relationship.
- No context builder overload that still accepts a club and derives the squad
  itself. One signature, one caller responsibility.

## Expected Files

- `packages/domain/src/entities/match.entity.ts`
- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/match-engine/manual-tactic-change.ts`
- `packages/engine/src/match-engine/manual-tactic-change.test.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts` (2026-08-06 reopen)
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/match-engine/match-context.test.ts \
  packages/engine/src/match-engine/progressive-match-session.test.ts \
  packages/engine/src/match-engine/manual-tactic-change.test.ts \
  packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts \
  packages/engine/src/match-engine/create-match-report.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts \
  packages/storage/src/career-storage.contract.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## What Was Found

Three of the four planned areas were already correct and needed a test rather
than a change. The fourth was broken in a way nothing could have noticed.

### The route was never persisted (SQLite)

`ShotContext.route` arrived in Step 07 and `match_events` had no column for it.
Every shot played in a **web career** was written back without the way it came
down, while `matchday-adapter.ts` went on reading `event.shot.route` to rebuild
its step events and always found nothing there. The JSON path kept it for free,
because it stores the whole state, so the two backends silently disagreed.

Nothing caught it, and the reason is worth recording: the mapper fixture
contained no shot event at all, and no test had ever *loaded* a report back. The
insert-recorder test could not have caught it either - the column was simply
absent from the statement, so there was nothing to record. **Only a load can
prove a save.** `world-state-mapper.test.ts` now round-trips a played match
through a real in-memory SQLite over the shipped schema.

Both beta versions advanced and neither migrates: `SQLITE_CAREER_SCHEMA_VERSION`
`22 -> 23`, `CURRENT_CAREER_SAVE_SCHEMA_VERSION` `13 -> 14`. A database written
at `22` did not store the route, so the fact is *gone* rather than absent; there
is nothing for a migration to read.

The three tactical unions the mapper used to cast (`route`, `shotType`,
`chanceType`) are validated on read, so a foreign or corrupt row fails at the
boundary instead of travelling on into narration as a normal shot.

### A non-selected club was not an ordinary caller (A1)

The contract says a club the manager has not prepared reaches the engine through
the same constructor as his own. It did not. Both drivers - `matchday-adapter.ts`
and `apps/cli career/progression.ts` - assembled a `MatchTeamContext` **literal**
by hand for every other club, each with its own copy of the fallback eleven and
its own copy of `CAREER_DEFAULT_LINEUP_SIZE`.

That duplication is exactly how Step 07A's defect happened: one driver can
satisfy a new field of the context while the other quietly does not. Both now
call `buildUnpreparedTeamContext`, which takes an **explicit squad** and hands it
to `buildTacticTeamContext` like any other caller. The role order lives in one
place, and it is the place Step 09 will change.

One behaviour did change: a club that cannot field the required eleven now fails
with `insufficient_squad` instead of silently lining up nine men and simulating
anyway.

### Attribution was already fielded-by, with one hole (A8)

Participation sources the club from `side.initialContext.clubId`, and season
events from the fixture side. Both are the club that *fielded* the player, and
`simulateSeason` registers from the fielded lineup rather than from ownership.
So the rule held - except that `computeSeasonPlayerSummaryStats` had **two**
sources of truth for a row's club, and the wrong one won: a caller-supplied
registration club silently overrode the event's own side. The event now decides,
and a registration only names the club for a player with no events at all. The
two agree today, so no shipped number moves.

Two tests fix the rule where it can actually be broken, each using a player whose
contract club differs from the club fielding him - the shape Phase 82A's first
loan will make real.

A card is **not** club-attributed at all: injuries, suspensions and yellow-card
accumulation are keyed by `(player, competition)`. That is correct football - a
suspension travels with the player through a loan - and it is recorded here so
nobody later adds a parent-club card ledger believing one is missing.

### A6 had a gap the check did not cover

`apps/cli career/progression.ts` composed a lineup straight from `club.playerIds`
and was not in `LINEUP_COMPOSING_FILES`. Adding it surfaced a second direct read
in the same file's pre-match recovery. Both now use the accessor, and the check
covers eight files.

## Left For Step 09

`finalPlayerRegistrations` in `matchday-adapter.ts` recomposes the opponent's
eleven from the roster to register who played. It is correct today only because
every AI club fields the same fixed `4-4-2`, so recomposing reproduces exactly
what was fielded. **It stops being correct the moment Step 09 gives AI clubs real
selections**: the lineup that was fielded becomes a fact of the played match, and
`ProgressCareerFixtureAdvanced` has to carry it rather than let the adapter guess.
Both sites now go through `defaultLineupFromSquad`, so there is one rule to
replace rather than two.

## Expected Files Deviation

The list above was written before Steps 07, 07A and 07B and does not name where
this work lives. Recorded rather than silently absorbed:

- **Added**: `tactic-team-context.ts` + test and `match-engine/index.ts` (the one
  constructor lives beside `buildTacticTeamContext`, not in `match-context.ts`);
  `season-engine/player-stats.ts` + test and `career/player-participation.test.ts`
  (where attribution actually is); `balance/match-tactics-calibration.ts`
  (`isTacticalRoute` belongs with `TACTICAL_ROUTES`); `storage/save-metadata.ts`
  (the envelope version); `sqlite/world-state-mapper.test.ts` (the only file with
  a valid career fixture to load); `apps/cli career/progression.ts` and
  `scripts/check-squad-depth-accessor.ts` (the A6 gap).
- **Untouched**: `match.entity.ts`, `career-state.ts` + test, `match-context.ts` +
  test, `progressive-match-session.ts` + test, `manual-tactic-change.ts` + test,
  `simulate-match-with-manual-tactics.ts` + test, `create-match-report.ts` + test,
  `career-save-envelope.ts`, `sqlite-career-migrations.ts`,
  `career-storage.contract.test.ts`, `matchday-adapter.test.ts`. Each was already
  correct; the minute `N + 1` invariant in particular was already proven by
  `progressive-match-session.test.ts`, so it was verified rather than rewritten.

## Definition Of Done

- Pre-match, manual, and live changes use one tactical builder, and that builder
  takes an explicit squad from its caller.
- A test fixes the attribution rule: an appearance, goal, assist, and card
  belong to the club the player was fielded by.
- Minute `N + 1`, same-delta, reload, and deterministic replay invariants pass.
- Final route/event/shape facts round-trip losslessly.
- Incompatible beta saves are explicitly deleted and fresh careers work.
- No migration, legacy reader, duplicate ledger, or fallback reconstruction
  remains.
- Step 09 is the only next action.

### 2026-08-04 - docs/steps/81-.../08-live-session-persistence-event-schema-and-beta-reset.md
- Status: Done
- Outcome: One real defect, three confirmations. `ShotContext.route` had never
  been persisted by SQLite, so the whole web career path lost it on every save
  while the matchday adapter read it back and found nothing. A club the manager
  had not prepared was still a hand-built context literal in both drivers, each
  with its own copy of the fallback eleven. Attribution was already fielded-by
  except for one hole where a caller-supplied registration club overrode the
  event's own side. The `N + 1` invariant was already proven and was verified,
  not rewritten.
- Adopted solution: `match_events.route`, written and validated on read together
  with `shotType` and `chanceType`; OPFS schema `22 -> 23` and career envelope
  `13 -> 14`, both reset rather than migrated. `buildUnpreparedTeamContext` and
  `defaultLineupFromSquad` in `tactic-team-context.ts` give both drivers one
  constructor taking an explicit squad; a squad too small to field the required
  eleven now fails with `insufficient_squad` instead of lining up nine men.
  `apps/cli career/progression.ts` joined `check:squad-depth`, which found a
  second direct roster read in the same file.
- Verification: `pnpm check` green - lint, depcruise, localized text,
  squad-depth over eight files, tests, typecheck across all packages.
- Follow-up: Step 09 must make the fielded lineup a carried fact of a played
  match. `finalPlayerRegistrations` recomposes the opponent's eleven and is
  correct only while every AI club fields `4-4-2`; `ProgressCareerFixtureAdvanced`
  has to carry what was actually fielded once that stops being true.

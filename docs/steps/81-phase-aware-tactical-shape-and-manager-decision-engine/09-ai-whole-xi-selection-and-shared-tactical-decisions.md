# Step 09 - AI Whole-XI Selection And Shared Tactical Decisions

## Status

Done 2026-08-04, all gates green.

## Inherited From Step 05

**Two selection-ranking suitability scales exist and this step owns collapsing
them.** `suitabilityBonus(...)` in
`packages/engine/src/team-selection/ai-squad-selection.ts` scores
`2.4 / 1.2 / -3.5 / -1000`, while `SUITABILITY_SELECTION_BONUS` in
`packages/domain/src/tactics/position-suitability.ts` scores
`35 / 25 / 5 / -1000` for `scorePlayerForFormationSlot(...)`. They answer the
same question - how much better is a natural fit when *picking* a player - on
two different scales, so the AI and the manager-facing helper can rank the same
two candidates differently.

Step 05 did not touch them on purpose. It owns *execution*: the
`coordinationMultiplierBasisPointsBySuitability` ladder that changes what a
misplaced player contributes once he is on the pitch. That is a separate
concept and it is now in one place. Selection ranking is this step's, because
this step replaces AI selection behind one named Module. Whichever scale
survives, only one may.

Note that the execution ladder is *not* a third candidate: it is calibrated
content about coordinated play, not a selection heuristic, and reusing it as a
picking bonus would conflate the two again.

## Goal

Make AI lineup, formation, and live decisions consume the same role fit,
intrinsic shape, and relational matchup truth used for the manager.

## User-Facing Reason

Manager choices are only interesting when opponents select coherent teams,
notice match problems, and react without hidden advantages or a second set of
rules.

## What To Implement

- Audit the current feasibility-preserving greedy slot-order XI selection
  against deterministic whole-XI assignment cases. The Phase 80A guard only
  prevents a valid roster from reaching a dead end; it deliberately does not
  optimize the combined score of the selected XI.
- If the greedy result can be globally worse, replace it behind one named
  selection Module with a deterministic maximum-weight assignment and stable
  tie-breaks.
- Score candidate-slot fit from canonical role quality, suitability, fitness,
  availability, current prospect/usage policy, and the same tactical
  contribution facts; do not use stored hidden potential.
- Make every simulated opponent use a canonical formation and typed lineup
  rather than the current roster-index/default-role fallback.
- Hold that selection for every club in the world, not only the clubs the user
  faces (A2). The step's value is a coherent world, and the background-world
  work that follows this phase selects an XI for roughly 270 clubs per matchday
  through this same Module. Narrowing the scope to the user's opponents would
  leave a fallback path that the later work would then have to remove across
  every remaining club.
- Reach squad depth only through Step 02's named accessor (A6). This step is the
  largest consumer of squad composition in the phase, so it is where a direct
  `club.playerIds` read is most tempting and most expensive to undo: Phase 82A
  must later distinguish the players a club owns from the players it may field,
  and one accessor makes that one edit.
- Make AI formation and live commands evaluate the same intrinsic/relational
  facts plus existing manager style, match state, substitutions, and command
  constraints.
- Preserve bounded reaction frequency and the same minute `N + 1` command
  path.
- Remove the default opponent lineup fallback, duplicate AI balance scores,
  and greedy/feasibility-only helpers if superseded by the canonical global
  assignment.
- Add global-assignment counterexamples, identical-input determinism, squad
  shortage, goalkeeper, suitability, formation, stronger-team, and live
  reaction tests.
- Rerun the frozen Step 01 quality-versus-structure matrix after the canonical
  AI XI is selected. If a correct AI assignment changes realized quality enough
  to break a frozen band, do not weaken AI selection or the band: pause Step
  09, reopen Step 06, retune only its versioned policy coefficients, rerun Step
  06, and then return here.

## Clean-Code Requirements

- Do not expose a generic optimizer Interface. The Module is named for
  football XI assignment.
- AI consumes the shared evaluator and may add only explicitly owned style/
  match-state policy.
- One selected XI result owns reasons; do not recompute explanatory reasons in
  web or diagnostics.
- Delete obsolete fallback lineup builders and test fixtures.

## What NOT To Implement

- No machine learning, search tree, plugin strategy, or scouting advantage.
- No automatic manager recommendation or UI.
- No new AI tactic control.
- No transfer/squad-building rework.
- No background-fixture resolution. This step makes every club selectable; the
  work that follows decides when those clubs actually play.
- No selection path that reads `club.playerIds` directly, and no per-club
  special case that bypasses the canonical Module for non-opponents.

## Expected Files

- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-matchup.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/team-selection/index.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
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
  packages/engine/src/team-selection/ai-squad-selection.test.ts \
  packages/engine/src/team-selection/ai-in-game-decisions.test.ts \
  packages/engine/src/match-engine/progressive-match-session.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts \
  packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- AI XI selection is globally coherent on counterexamples and deterministic.
- Every club in the world reaches the engine with a canonical typed formation,
  proven on a club the user neither faces nor competes with.
- Squad depth is read through the named accessor everywhere, and the Step 01
  inventory of direct `club.playerIds` lineup readers is empty.
- AI and manager consume the same shape/matchup truth.
- Live AI changes use the canonical command path and minute boundary.
- The complete frozen quality-versus-structure matrix still passes with the
  canonical AI-selected XIs and positive paired-seed observations.
- No default roster-index lineup or duplicate tactical score remains.
- Step 10 is the only next action.

## What Was Found

### The greedy selector cost real team quality, and it is measured

The audit the step asked for was run against the shipped selector before anything
changed. Two defensive slots, `rb` then `cb-right`; a centre back who can also
play right back rated `15`, and a specialist right back rated `14.5`.

| Assignment | `rb` | `cb-right` | Total |
|---|---|---|---|
| Greedy, slot order | versatile `18.10` | specialist `11.35` | **`29.45`** |
| Best eleven | specialist `17.60` | versatile `17.75` | **`35.35`** |

Greedy asks "who is the best right back", not "which eleven is the best team".
Both are feasible, so the existing backtracking never triggers - it only prevents
dead ends, never a worse team. `5.9` points lost, with a right back playing
centre back for no reason. Replaced by `assignFootballXi(...)`, a minimum-cost
maximum-flow over slots and players that fills the shape first and maximizes
quality second, because an eleven with a hole in it is not a better team.

### The two suitability scales disagreed about more than ranking

The scale that survived is the AI selector's, `2.4 / 1.2 / -3.5`, moved into
`position-suitability.ts` and now read by both. The domain's `35 / 25 / 5` was
added to a `0-20` ability, so one suitability step was worth more than half the
entire ability range and positional fit alone settled every comparison.

That had a consequence nobody had noticed. `selectIncomingCandidate` permits a
substitution within `0.75`, `2` or `3` **ability points** of the outgoing player.
Those thresholds were compared against scores where changing suitability by one
step cost `10`, so **no adapted footballer could ever be a legal routine
substitute** - the numbers read like football policy and bound nothing. On the
shared scale a right wing-back now covers a tired right back, which is what the
thresholds were written to allow. One existing test asserted the old behaviour
and was rewritten around a bench that genuinely has no cover.

### Every club in the world now selects, and the fallback is gone

`buildUnpreparedTeamContext`, `defaultLineupFromSquad` and the fixed `4-4-2`
`defaultCanonicalRoleForSlot` are deleted. Both drivers previously composed a
context for all twenty clubs from their own copy of that fallback; they now
supply only the manager's own team and one AI policy.

`aiTeamSelectionByClubId` became `aiTeamSelection`: one policy, not a per-club
map. A map is an invitation to answer for the clubs the manager faces this
weekend and leave the rest of the league without an answer, which is the shape of
the fallback being removed (A2). It carries no formation either - a club lines up
in the catalog shape its own squad is built for.

Measured: choosing among all `23` shapes costs `383ms` per `270` clubs against
`123ms` for a fixed shape. `3.1x`, not `23x`, because a candidate's score depends
only on the slot's canonical role and channel, so each distinct question is
answered once per squad rather than once per shape. A back-three squad now fields
a back three; a squad of four centre backs no longer plays two of them at full
back to fill a shape nobody chose for it.

### Two producers of a `MatchTeamContext` had become two again

`buildAiSquadMatchTeamContext` wrote its own context literal beside
`buildTacticTeamContext`'s. That is exactly the duplication Step 07A's defect came
from - one producer satisfying a new field while the other quietly does not.
`assembleMatchTeamContext(...)` is now the only place that literal is written and
both call it.

The same problem existed one level up: the live web session builds its own kickoff
context instead of going through `progressNextCareerFixture`, so it would have
composed its own opponent and been free to disagree with the team the result was
later committed against. `selectCareerAiTeam(...)` is now the one door, used by
the fixture use case and by the web.

### The fielded eleven is a fact of the played match

Step 08 recorded that `finalPlayerRegistrations` recomposed the opponent's eleven
from its roster. `ProgressCareerFixtureAdvanced.fieldedLineups` carries it now.

The one case that cannot be carried is a reloaded page: `rehydrateReviewedResult`
rebuilds a reviewed result from durable state, and the opponent's eleven was never
saved. Re-selecting it would use a squad the played match has already changed and
present the result as history, so it is left empty and its footballers appear
through their events - joining the fields that function already returns empty.

### AI formation options have no production supplier

`selectFormationOption` ranks caller-supplied alternatives alphabetically, but
`formationOptions` is passed by tests only - nothing in the shipped game supplies
one. Making it shape-aware would mean building for a caller that does not exist
and inventing the tactical intent that chooses. That decision belongs to Step 14,
which owns formation as a counter-move; the live policy's other half - one shared
selection scale, the canonical command path, the minute `N+1` boundary - is done.

### The frozen Step 01 matrix is untouched, and it is structural

`tactical-shape-audit.ts` composes its lineups from explicit compositions and
never calls the selector, so neither the assignment nor the selection scale can
reach it. Suitability at *match* time is the Step 05 coordination ladder, which
this step did not touch. Verified rather than assumed: `50` tests, `30s` of real
paired-seed simulation, all bands passing.

## Reopened Within The Step

A review after the first green gate found four things. All four were fixed here
rather than carried.

### A club that lost both goalkeepers could not play at all

Nothing but a natural goalkeeper is even a *weak* fit for the role, so once
selection required a usable candidate per slot, a club with both keepers injured
or suspended could field no eleven in any of the twenty-three shapes and its
fixture failed with `invalid_ai_team_selection`. The deleted fallback used to put
whoever was first in the roster in goal, so this was a regression introduced by
this step, and the first test cohort asserted the refusal as if it were correct.

Selection now promotes an emergency keeper before kickoff, ranked on the same two
attributes `match-team-exit.ts` uses mid-match. His suitability is still recorded
as `invalid`, because it is.

**That is the last resort, and a review found the ordinary answer was missing.**
Real football does not put an outfielder in goal while a substitute keeper sits
on the bench: it takes an outfielder off and sends the keeper on. Three things
were wrong:

- A red card to the goalkeeper produced **no substitution at all**.
  `selectOutgoingCandidates` returns `[]` for a dismissal, so the policy went
  straight to promoting somebody already on the pitch and left the reserve keeper
  on the bench for the rest of the match. An *injured* keeper was already handled
  correctly, because that path does look at the bench - so the gap was specific
  to sendings-off.
- The promotion picked by `slotId.localeCompare(...)` and took the **last one
  alphabetically**. Not the best hands, not even the nearest player - the last
  slot name in the alphabet. The batch path in `match-team-exit.ts` had ranked
  the same decision by reflexes and handling since Step 07A; the live path now
  reads the same football fact, so a match cannot answer this two ways.
- The bench place for a goalkeeper was documented as a preference. It is an
  invariant and is now tested as one: the reserve keeper takes the first bench
  place ahead of every better footballer, because he is the only substitute who
  answers this question at all.

`reorganizeAfterDismissal(...)` now takes an outfielder off - from the front of
the pitch backwards, so a side down to ten gives up an attacker first - and sends
the substitute keeper on into the vacated goalkeeper slot. The canonical command
path already permitted exactly this: a dismissed player removed without
replacement and one ordinary substitution beside it are separately legal, and
substituting the dismissed player himself is the only thing barred. Nothing in
`domain` changed; the policy simply never emitted the command it was allowed to.

Promoting an outfielder survives only for the case that is genuinely last: no
substitute keeper, or no substitutions left.

### AI clubs never rotated, and the policy that says they should was inert

`recentUse` had no production supplier - only tests - so
`boundedRecentUseModifier` saw zero for every player and every AI club fielded
the same eleven every week for as long as a career lasted. It is now read from
the durable participation ledger. The window is the current development month,
because that is the granularity the ledger stores; "the last three matches" is
not a question it can answer. Minutes count whoever they were played for: A8
decides which club a match *fact* belongs to, but tiredness belongs to the legs.

### A tired defender could change a club's formation

Shape and eleven were chosen by the same score, and that score carries fitness,
recent workload and prospect upside. So a squad built for a back three could line
up as a back four for one week because a centre back was tired - and Step 14
cannot reward a counter-move against a shape that moves for reasons that are not
tactical. Shape is now chosen on a `structuralScore` of ability and positional
fit only; the eleven that fills it is still chosen on the full score.

### Every AI club played identical sliders - fixed outside the step's scope

**This exceeds `What NOT To Implement`, which says `No new AI tactic control`.**
It was implemented on explicit instruction after the limitation was reported, and
is recorded here rather than quietly folded in.

`deriveShapeTacticalDistribution(...)` reads three knobs off the shape the club
already chose: width from how many slots sit wide, directness from how few
midfielders there are to play through, risk from attackers against defenders.
`pressing` and `mentality` are untouched - no fact about a shape says how hard a
side presses, and mentality is a ladder the live policy already moves against
score and minute, so deriving it here would price one decision twice.

Every knob is a **deviation from the average curated shape**, measured from the
catalog rather than written down. That is what keeps it a model of variation
rather than a rebalance: the twenty-three shapes average back to the caller's
setup, so Step 06's balance point is untouched, and there is no tuned coefficient
in the file for content to own or for a later step to find has drifted.

`simulate-season` deliberately does **not** modulate: it is the instrument that
holds a shape and a tactic still in order to measure one of them.

**Measured, because a tactic change moves goals.** `pnpm cli ten-season-report`
reports `goals_per_match_avg: PASS value=2.78`, the same figure Step 07B recorded
before any of this step existed. Real AI selection, rotation, shape-derived
tactics and the emergency keeper together moved the A7 monitor by nothing.

That report also carries `clubs_without_natural_goalkeeper: PASS value=0` over
ten seasons, so the emergency-keeper path is protection against a case current
content does not yet produce, rather than cover for one it does. Phase 81B's
background fixtures widen the exposure by roughly two orders of magnitude.

### One more producer of a context literal, found while fixing the above

The claim that `assembleMatchTeamContext(...)` writes the only `MatchTeamContext`
literal was not true when it was written: `simulate-season.ts` had two more, in
`buildFixtureLineupOverrideContext` and its team-context builder. Both now route
through it, so the claim holds.

## Left For Step 10

- `selectFormationOption`'s alphabetical tie-break, once a real caller supplies
  formation options. Step 14 owns the football decision behind them.
- The opponent's fielded eleven is not durable, so a reloaded reviewed result
  shows only the footballers its events name. Persisting it is a save-schema
  change and no step owns it yet.

## Expected Files Deviation

Added, not listed:

- `packages/engine/src/team-selection/football-xi-assignment.ts` and its test -
  the named assignment Module. Putting it inside `ai-squad-selection.ts` would
  have pushed that file past `800` lines and mixed football policy with the
  assignment that consumes it.
- `packages/engine/src/career/career-ai-team-selection.ts` - the one door career
  AI selection goes through, needed because the live web path does not use
  `progressNextCareerFixture`.
- `packages/engine/src/career/progress-fixture.ts` and its test, and
  `packages/engine/src/match-engine/tactic-team-context.ts` and its test - the
  fallback eleven and the duplicated context literal both lived there.
- `packages/domain/src/tactics/position-suitability.ts` and its test - the
  surviving selection scale.
- `packages/engine/src/team-selection/shape-tactical-distribution.ts` and its
  test - the shape-derived tactic, which exceeds the step's stated scope on
  explicit instruction.
- `packages/engine/src/career/career-ai-team-selection.ts` also reads the
  participation ledger, so AI clubs rotate.
- `packages/engine/src/use-cases/simulate-season.ts` - two further
  `MatchTeamContext` literals, and the fixed-setup AI call site.
- `apps/cli/src/commands/career/progression.ts` - the second driver holding the
  fallback.
- `scripts/check-squad-depth-accessor.ts` - the new selection file composes a
  lineup and must be guarded (A6). Now `9` files.

Not touched: `packages/engine/src/match-engine/tactical-shape.ts`,
`tactical-matchup.ts`, `progressive-match-session.ts`,
`packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`. None
needed changing - the audit never selects, and the live session's command path
already was the canonical one.

### 2026-08-04 - docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/09-ai-whole-xi-selection-and-shared-tactical-decisions.md
- Status: Done
- Outcome: AI selection is one Module, one scale and one door; every club in the
  world reaches the engine with a real catalog shape and a typed eleven, and the
  fixed `4-4-2` fallback is deleted from both drivers.
- Adopted solution: `assignFootballXi(...)` minimum-cost maximum-flow behind
  `selectAiMatchSquad(...)`, which also chooses the club's shape;
  `selectCareerAiTeam(...)` as the single career entry point;
  `assembleMatchTeamContext(...)` as the single context literal;
  `ProgressCareerFixtureAdvanced.fieldedLineups` as the carried fact.
- Verification: full `pnpm check` green; frozen Step 01 matrix rerun and passing.
- Follow-up: Step 14 is unblocked - AI clubs no longer field one fixed shape.

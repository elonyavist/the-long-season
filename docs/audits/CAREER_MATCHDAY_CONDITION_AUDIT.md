# Career Matchday Condition Audit

Date: 2026-06-22
Phase: `41-career-matchday-consequences-and-condition-integration`
Status: Complete

## Purpose

Make career matchday consequences visible enough that the manager can understand
why the next lineup decision matters.

The focus is user fun, not a greener report. A player who keeps selecting the
same eleven should see a believable cost after matches. The game must expose
that cost without choosing a lineup, recommending rotation, or adding unrelated
systems.

## Step 01 - Phase 40 Output Review

Phase 40 closed with one core blocker before serious UI work:

- played career fixtures can be advanced and optionally explained;
- saved lineup and tactic can be persisted;
- the next selected-club fixture is visible;
- but condition/fatigue is still not a visible consequence in the career flow.

This hurts the manager fantasy because rotation, squad depth, and preparation
only become interesting when the squad state changes after matches.

### Existing Systems To Reuse

- `PlayerDynamicState` already stores player `fitness`, `form`, and `morale`.
- `packages/engine/src/player-state/fitness.ts` already provides deterministic
  fitness spend/recovery helpers.
- `progressNextCareerFixture` already simulates and applies exactly one
  selected-club fixture from a career save.
- Career CLI preparation already requires an explicit saved selected lineup and
  tactic before advancement.
- Career fixture explanation can already include structured condition-impact
  data when match contexts are built from tracked condition.

### Phase 41 Blocker In User Terms

After a match, the user currently sees a result but does not clearly see what
the match cost the squad.

That means the next matchday decision is weaker than it should be: there is no
visible pressure to ask whether the same eleven should play again, whether a
rested player should come in, or whether the selected lineup is becoming a
risk.

### Scope Boundary

Phase 41 must not add:

- injuries;
- morale;
- form;
- training;
- staff or medical systems;
- tactical advice;
- automatic rotation;
- automatic lineup or tactic selection;
- UI screens;
- new scoring or player-generation behavior.

The acceptable slice is narrow: one played career fixture spends deterministic
fitness for the explicit selected starters, persists that state, and reports the
facts compactly.

### Product Decision

No new product decision is needed.

The existing rule is enough: the user chooses who plays. The system should only
show the physical consequence of that choice.

### Step 01 Decision

Phase 41 can proceed to Step 02.

The next step should create a pure engine contract for career match condition
consequences before any career progression or CLI output is wired.

## Step 02 - Career Condition Consequence Contract

Step 02 added the pure condition consequence contract:

- `applyCareerFixtureConditionConsequences`;
- `ApplyCareerFixtureConditionConsequencesInput`;
- `ApplyCareerFixtureConditionConsequencesResult`;
- `CareerFixtureConditionChange`.

### Adopted Contract

The caller supplies:

- current `playerStates`;
- explicit `selectedStarterIds`;
- optional ordered `reportPlayerIds`;
- optional `FitnessRules`.

The helper returns:

- a copy-on-write `playerStates` lookup;
- ordered player-level changes with:
  - player ID;
  - before fitness;
  - after fitness;
  - delta;
  - started flag.

### User-Facing Reason

The manager needs to see that the players he selected paid a physical cost,
while players who did not start were preserved. This is the smallest useful
consequence that makes rotation feel meaningful without making the game choose
the rotation for the user.

### Technical Boundaries

- The helper reuses the existing deterministic fitness rules.
- It does not choose players.
- It does not apply cross-day recovery.
- It does not write saves.
- It does not change match outcomes.
- It does not render text.

### Step 02 Decision

The contract is ready to be wired into career fixture advancement in Step 03.

## Step 03 - Career Advance Condition Application

Step 03 wired the condition consequence contract into
`progressNextCareerFixture`.

### Adopted Behavior

When a selected-club career fixture is advanced:

1. the match is simulated from the pre-match team contexts;
2. the fixture result and match report are applied;
3. selected-club starters from the actual match context spend fitness;
4. selected-club non-starters preserve their fitness;
5. the returned career state persists the updated player states;
6. the result carries structured `conditionChanges` for later CLI output.

### Explanation Trace

When optional fixture explanation is requested, the selected-club side is now
marked as condition-tracked in the returned trace.

- If no selected starter was below full fitness before kickoff, effect is
  `neutral`.
- If at least one selected starter was below full fitness before kickoff, effect
  is `negative`.

This keeps the trace factual. It does not recommend rotation or infer a better
lineup.

### User-Facing Reason

The result of a played match now changes the next decision. Reusing the same
eleven will gradually be visible in the career save, which makes squad depth and
rotation meaningful.

### Step 03 Decision

The persisted consequence is ready. Step 04 should render the structured
condition changes compactly in the career CLI output.

## Step 04 - CLI Post-Match Condition Output

Step 04 exposed the persisted condition consequence in career CLI output.

### Output Added

Successful `career --advance-next-fixture` now prints:

- `Post-match condition`;
- selected starters with `before -> after (delta)`;
- rested first-team players when the selected first-team baseline can be
  identified.

Example from `phase41-check`:

- all selected starters moved from `100` to `92`;
- rested first-team players were `none` for the first-team lineup;
- `career --squad` then showed starters at `92` and reserves at `100`.

### Localization

The new output uses localization keys for all visible labels and was smoke
tested in Italian.

### User-Facing Reason

The manager now sees the consequence immediately after the result, then can
open the squad view and understand the next lineup decision from factual state.
The command still does not advise rotation or select players automatically.

### Step 04 Decision

The post-match output is compact enough for CLI smoke testing. Step 05 should
advance multiple fixtures to confirm the same lineup creates visible pressure
over time.

## Step 05 - Multi-Fixture Condition Smoke

Step 05 advanced the deterministic `phase41-check` save through repeated
selected-club fixtures with the same saved lineup and tactic.

### Commands Reviewed

```bash
pnpm cli career --save=phase41-check --summary
pnpm cli career --save=phase41-check --advance-next-fixture
pnpm cli career --save=phase41-check --advance-next-fixture --fixture-explanation
pnpm cli career --save=phase41-check --squad
```

### Observed Condition Progression

The selected starters moved:

- after first fixture: `100 -> 92`;
- after second fixture: `92 -> 84`;
- after third fixture: `84 -> 76`.

The non-selected squad players remained at `100`.

### Explanation Output

On the explained third fixture, the selected club showed:

```text
S.S. Perugia: tracked effect=negative affected=11
```

This is a useful matchday signal: the game does not tell the manager who to
pick, but it makes clear that the selected eleven are now carrying fatigue.

### Remaining Friction

- There is no between-fixture recovery yet in this career progression path.
- That is acceptable for Phase 41 because the goal was to make consequences
  visible, but the next core loop should decide how weekly recovery/calendar
  recovery belongs in career progression.

### Step 05 Decision

Phase 41 can close.

The condition consequence is visible enough that rotation becomes a real
manager decision instead of a cosmetic option.

## Step 06 - Phase Report And Next Decision

Phase 41 made career matchday consequences visible.

### What Now Works

- Career fixture advancement persists selected-club fitness changes.
- Selected starters pay a deterministic match cost.
- Non-selected players keep their fitness.
- Post-match CLI output shows who spent condition.
- `career --squad` shows the persisted squad state after the match.
- Optional fixture explanation can mark selected-club condition as tracked and
  negative when tired starters begin a match.

### Manager Understanding After A Match

After a played selected-club fixture, the manager can now answer:

- who played;
- what result happened;
- how much condition the starters spent;
- which first-team players rested, when applicable;
- what the next selected-club fixture is;
- whether repeated use of the same lineup is creating fatigue pressure.

This is a meaningful improvement for user fun because the next lineup decision
is now based on a changed squad state.

### Remaining Core Blocker

The loop is not yet ideal for a first serious UI prototype because career
fixture advancement does not apply between-fixture recovery.

Without recovery, the UI would show a one-way fitness drain across weekly
fixtures. That makes the consequence visible, but it is not yet football-
credible or fun over a longer playable loop.

### First UI Prototype Decision

Not yet.

The matchday consequence surface is now strong enough to justify one final
core-loop phase, but not enough to expose as the main UI loop before recovery is
integrated.

### Recommended Next Phase

Recommended next phase:

`42-career-weekly-recovery-and-matchday-readiness`

Purpose:

- apply deterministic calendar-day recovery before the next played career
  fixture;
- keep recovery factual and visible;
- preserve explicit user lineup/tactic choice;
- keep injuries, morale, training, staff, and medical systems out of scope;
- verify that repeated weekly matchdays create pressure without collapsing
  player condition unrealistically.

### Final Phase 41 Decision

Phase 41 is complete.

It fixed the Phase 40 blocker that career matches had no visible physical
consequence. The next blocker is recovery, not more reporting or UI polish.

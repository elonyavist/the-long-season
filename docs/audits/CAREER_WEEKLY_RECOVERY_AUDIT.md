# Career Weekly Recovery Audit

Date: 2026-06-22
Phase: `42-career-weekly-recovery-and-matchday-readiness`
Status: Complete

## Purpose

Make career matchday readiness credible after Phase 41 introduced visible
condition consequences.

The goal is user fun and football credibility. The manager should see the
physical rhythm of the season: a normal weekly gap should usually make repeated
selection plausible, while a short gap should still create a real selection
pressure. The game must expose that state without choosing the lineup, advising
rotation, or adding unrelated systems.

## Step 01 - Phase 41 Output Review

Phase 41 already provides the required consequence baseline:

- selected-club match preparation can persist a saved lineup and tactic;
- selected-club fixture advancement can simulate and apply one fixture;
- played fixture results and reports are persisted in the career save;
- selected starters spend deterministic fitness after the match;
- career CLI output can show compact post-match condition changes;
- `career --squad` can show the persisted player fitness state.

This is enough to make rotation meaningful, but it is incomplete as a playable
career loop because it currently only spends condition.

## Phase 42 Blocker In User Terms

The user can see that selected starters get tired, but the save does not yet
model recovery between selected-club fixtures.

That creates a one-way drain:

- after first selected fixture: `100 -> 92`;
- after second selected fixture: `92 -> 84`;
- after third selected fixture: `84 -> 76`.

That output is useful as evidence that Phase 41 works, but it is not a fair
season rhythm. Without recovery, the game would push the manager toward
rotation for the wrong reason: not because the calendar is congested, but
because a missing system is silently accumulating fatigue.

## Existing Systems To Reuse

- `DEFAULT_FITNESS_RULES` already defines the current deterministic fitness
  numbers.
- `recoverFitnessForPlayers` already applies day-based recovery in the engine.
- `progressNextCareerFixture` already advances exactly one selected-club
  fixture from a career save.
- Career `currentDate` and fixture dates already provide the day gap needed for
  recovery.
- Saved `matchPreparation` already gives the selected club's explicit lineup
  and tactic before matchday.

## Playability Target

Phase 42 should make this loop inspectable:

1. The manager saves a lineup and tactic.
2. The career save advances to the next selected-club fixture.
3. Before kickoff, selected-club players recover based on calendar days.
4. The match uses the recovered player state.
5. After the match, actual starters spend condition.
6. The career save persists the post-match state.
7. The CLI shows enough recovery/readiness facts to inspect the next decision.

This does not mean fatigue must always be dramatic. A normal seven-day lower
division rhythm can reasonably restore most players. The interesting pressure
should come from short gaps, repeated fixtures, future cups, injuries, and
manager choices, not from a missing recovery layer.

## Scope Boundary

Phase 42 must not add:

- UI;
- injuries;
- morale;
- form;
- training;
- staff, medical, or facilities modifiers;
- automatic lineup selection;
- automatic tactical advice;
- transfer, youth, or player generation changes;
- match scoring probability changes;
- table balance tuning.

The acceptable slice is narrow: apply deterministic date-based recovery before
selected-club fixture simulation, then spend fitness after the match.

## Step 01 Decision

Phase 42 can proceed to Step 02.

The next step should create a pure recovery contract that can be tested before
it is wired into career fixture advancement.

## Step 05 - Repeated Fixture Recovery Smoke

Step 05 advanced `phase42-check` through four selected-club fixtures after
saving the S.S. Perugia first-team lineup and balanced tactic.

### Commands Reviewed

```bash
pnpm cli career --save=phase42-check --seed=world-a --new-world-preview
pnpm cli career --save=phase42-check --set-lineup-demo=pro01-first-team
pnpm cli career --save=phase42-check --set-tactic-demo=pro01-balanced
pnpm cli career --save=phase42-check --advance-next-fixture
pnpm cli career --save=phase42-check --advance-next-fixture
pnpm cli career --save=phase42-check --advance-next-fixture
pnpm cli career --save=phase42-check --advance-next-fixture --fixture-explanation
pnpm cli career --save=phase42-check --squad
```

### Observed Recovery Trace

| Fixture | Date | Result | Recovery | Readiness before match | Post-match starter condition |
|---|---:|---|---:|---|---|
| `fixture:000003` | 2026-08-01 | U.S. Pisa 3-0 S.S. Perugia | 0 days | `100..100 -> 100..100` | `100 -> 92` |
| `fixture:000011` | 2026-08-08 | S.S. Perugia 3-0 A.S.D. Rimini | 7 days | `92..100 -> 100..100` | `100 -> 92` |
| `fixture:000019` | 2026-08-15 | Ascoli Calcio 1-1 S.S. Perugia | 7 days | `92..100 -> 100..100` | `100 -> 92` |
| `fixture:000029` | 2026-08-22 | U.S. Taranto 2-0 S.S. Perugia | 7 days | `92..100 -> 100..100` | `100 -> 92` |

### Explanation Trace

On the fourth fixture, the selected club showed:

```text
S.S. Perugia: tracked effect=neutral affected=0
```

That is correct for the current weekly calendar: the same first-choice lineup
recovers fully before kickoff, then spends condition after the match.

### Playability Interpretation

This is a healthy result for the current lower-division league rhythm.

- The one-way drain from Phase 41 is gone.
- A normal seven-day gap no longer punishes the user for using a stable eleven.
- The post-match consequence still exists and remains visible in `career --squad`.
- The current demo calendar does not yet create short-gap pressure.

That last point is not a Phase 42 blocker. It is a future scheduling/cups
finding: fatigue pressure should come from believable fixture congestion,
injuries, squad rotation decisions, and later competition structure, not from
making normal weekly league play artificially harsh.

### Step 05 Decision

Phase 42 can proceed to the final report.

No recovery tuning is needed from this smoke. The observed behavior supports
the manager fantasy better than the Phase 41 one-way drain.

## Step 06 - Phase Report And Next Decision

Phase 42 is complete.

### Adopted Recovery Solution

- `applyCareerWeeklyRecovery` provides a pure engine recovery contract.
- Career CLI progression recovers the selected-club roster before building match
  team contexts.
- The match therefore uses recovered player state.
- `progressNextCareerFixture` still applies post-match starter condition spend.
- The career save persists the post-match condition state.
- Career advance output now shows compact pre-match recovery facts before
  post-match condition changes.

### What The User Can Inspect Now

The current CLI loop can show:

- saved lineup;
- saved tactic;
- next selected-club fixture;
- pre-match recovery days;
- pre-match readiness range;
- match result;
- post-match starter condition cost;
- persisted squad condition after the match;
- optional fixture explanation with condition impact.

This is enough to verify the matchday readiness loop before putting it into UI.

### Remaining Fun Concerns

- The current demo league calendar is weekly and has no short-gap pressure.
- That is acceptable for normal league rhythm.
- Fixture congestion should come later from cups, calendar density, or schedule
  rules, not from harsh weekly fatigue tuning.
- The CLI is useful for verification but is not the final player experience.
- The next valuable step is to see this loop as a manager-facing screen.

### Next Recommended Phase

Recommend exactly one next phase:

`Phase 43 - Career Matchday UI Slice`

The next phase should not add new simulation systems. It should render the
existing career save, next fixture, saved lineup/tactic, readiness, advance
result, and post-match condition in a first minimal UI slice so we can judge
whether the loop feels playable to the user.

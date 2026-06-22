# Career Loop Playability Audit

Date: 2026-06-22
Phase: `40-career-loop-playability-audit-and-matchday-slice`
Status: In progress

## Purpose

Audit the current career loop as a manager journey before adding UI or more
career systems.

The focus is user playability: can a manager start a career, understand the
club, prepare a match, play it, read the result, and understand what to do next?
Math and reports are supporting diagnostics only.

## Step 01 - Phase 39 Output Review

Step 01 reviewed the Phase 39 fixture explanation output.

### Command Reviewed

```bash
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
```

Observed fixture:

- `fixture:000001 Ascoli Calcio 3-0 A.S.D. Rimini`;
- Ascoli scored on `3` of `5` shots with `4` shots on target;
- Rimini had `7` shots but only `1` shot on target;
- explanation sections rendered:
  - team strength;
  - tactic distribution;
  - lineup roles;
  - condition impact;
  - chance summary;
  - variance markers.

### Useful For Career Playability

- The explanation is factual and does not tell the manager what to do.
- The manager can see that the teams were close in overall strength, but Ascoli
  had better attacking strength and much better conversion in this match.
- Chance summary makes the score easier to accept: Rimini produced more shots
  but low quality/on-target output, while Ascoli converted its counters.
- Variance markers are useful because they frame the result without pretending
  the match was fully deterministic or fully deserved.
- The trace is structured enough to be reused by a future UI without embedding
  prose in engine/domain code.

### Career-Context Gaps

- The command is still a season simulation inspection, not a career-save
  matchday inspection.
- It does not show the selected club or whether the fixture belongs to the
  user's career.
- Condition is reported as `not tracked`, so it cannot yet explain fatigue in a
  played career fixture.
- Saved lineup and tactic preparation are not connected to the explanation.
- There is no post-match consequence in this output: no table movement, squad
  condition update, development impact, or next-action prompt.
- Player stats are useful, but there is no manager-facing bridge from those
  stats to the next matchday decision.

### Advice Boundary

The current trace stays on the correct side of the product boundary:

- acceptable: factual strengths, event totals, chance types, lineup-role counts,
  and variance markers;
- prohibited: automatic tactic recommendations, transfer hints, lineup advice,
  or hidden "best move" suggestions.

### Step 01 Decision

Phase 40 can continue with the existing trace data.

The trace is useful enough as a match understanding layer, but it must be
connected to career state before it can be considered a playable matchday
surface.

## Step 02 - Career Loop Playability Spec

Step 02 defines the minimum playable loop from the manager's viewpoint.

### Minimum Manager Journey

The smallest useful career loop is:

1. Create or load a career save.
2. See which club is selected and why it matters.
3. Inspect the selected club squad.
4. Understand player availability, condition, and obvious squad context.
5. Choose or confirm match preparation:
   - formation;
   - tactic;
   - lineup.
6. See the next selected-club fixture.
7. Play that fixture from the career save.
8. Review the result and key events.
9. Review factual match explanation without receiving automatic advice.
10. Review post-match consequences:
    - fixture/result stored;
    - table or season state advanced;
    - player condition changed if tracked;
    - next fixture/date clear.
11. Know the next manual decision the manager can take.

This is the minimum because it connects decision, match, consequence, and next
decision. A CLI command can be rough, but the loop must not feel like unrelated
debug tools.

### Playability Signals

| Signal | Status | Why it matters |
|---|---|---|
| Create deterministic career save | Supported | The user needs a stable world and selected club to care about. |
| Inspect selected club identity | Supported | Club names and save summary make the project feel concrete. |
| Inspect squad | Supported | The manager needs players before formation or match decisions matter. |
| Inspect fitness/condition | Fragmented | Fitness exists in some flows, but it is not yet consistently tied to career matchday explanation. |
| Confirm formation/tactic/lineup | Fragmented | Preparation persistence exists, but the current journey still needs verification as one continuous flow. |
| View next selected-club fixture | Supported | Career summary already exposes the next selected-club fixture. |
| Play next fixture from save | Supported | `career --advance-next-fixture` exists. |
| Understand why the match played out that way | Fragmented | Fixture explanation exists outside the career flow. |
| See post-match consequences | Fragmented | The result can be advanced, but the manager-facing consequence surface still needs smoke testing. |
| Continue toward next week/season | Unknown | Rollover and development exist, but the same-save journey needs verification. |

### Friction Signals

| Friction | Status | User-facing risk |
|---|---|---|
| Career commands feel like separate reports | Known risk | The player may not feel a coherent loop. |
| Match explanation is not attached to played career fixture | Known risk | The best explanation surface may be invisible in the actual career flow. |
| Condition impact can read as `unknown` | Known risk | Fatigue and rotation may feel disconnected from match outcomes. |
| Post-match "what now?" is unclear | Known risk | The loop can feel like a simulation endpoint rather than a management game. |
| Reports expose data without hierarchy | Known risk | Dense CLI output can hide the next meaningful decision. |

### Non-Prescriptive Boundary

The playable loop must tell the manager what happened and what state changed.
It must not decide:

- which tactic to use;
- which players to select;
- which player to buy or sell;
- which youth player to promote;
- whether to rotate.

Those are user decisions. The game should expose enough state for the decision
to be interesting.

### Step 02 Decision

The rest of Phase 40 should verify whether the existing career commands can be
used as one coherent loop.

If the loop is fragmented, the phase should fix only the smallest missing
matchday link or record it as the next blocker. It should not add another broad
system.

## Step 03 - Career State Matchday Readiness Audit

Step 03 verified whether the current career save can support pre-match
readiness.

### Commands Reviewed

```bash
pnpm cli career --save=phase40-check --seed=world-a --new-world-preview
pnpm cli career --save=phase40-check --summary
pnpm cli career --save=phase40-check --squad
```

The first parallel attempt to run `summary` and `squad` raced the save creation
and failed with `career save not found`; rerunning those commands after the
save existed passed. This is a check orchestration issue, not a gameplay issue.

### Observed Career State

- save: `save:phase40-check`;
- world seed: `world-a`;
- selected club: `S.S. Perugia`;
- generated squad size: `22`;
- current date: `2026-08-01`;
- current season: `season:demo-001`;
- transfer funds: `EUR 6000000.00`;
- next selected-club fixture:
  - `fixture:000003 2026-08-01 round 1: U.S. Pisa vs S.S. Perugia`;
- match preparation:
  - `none saved`.

Squad output shows:

- player names;
- age;
- position;
- role/current quality number;
- fitness;
- form;
- morale.

### Readiness Assessment

| Area | Status | Manager impact |
|---|---|---|
| Selected club identity | Supported | The manager knows the club project is `S.S. Perugia`. |
| Save/world identity | Supported | Seed, save ID, date, and season are clear. |
| Next fixture | Supported | The next selected-club fixture is explicit. |
| Squad availability | Supported | The squad list gives names, ages, positions, role value, fitness, form, and morale. |
| Fitness before match | Supported for initial state | All visible players start at `100`, so availability is clear for match one. |
| Saved preparation | Missing in this save | The summary explicitly says `none saved`, so the matchday ritual is not complete yet. |
| Formation/tactic/lineup confirmation | Fragmented | The user can inspect other commands, but this save does not yet show a confirmed setup. |

### Playability Finding

The career state is ready for a first matchday audit, but not yet a satisfying
matchday ritual.

The user can answer:

- which club am I managing?
- who is in my squad?
- what condition are they in?
- who do I play next?

The user cannot yet answer from the same summary:

- which formation is saved?
- which tactic is saved?
- which eleven are selected?
- whether the upcoming fixture will use the saved preparation.

### Step 03 Decision

This is not a blocker for Phase 40. Step 04 should verify whether playing the
next fixture can produce or connect match explanation from the career flow.

However, a future UI or matchday phase must make saved preparation visible
before match kickoff; otherwise the user will feel that the match starts from a
debug command rather than from their choices.

## Step 04 - Career Fixture Explanation Readiness

Step 04 checked whether the career fixture progression output is enough for a
matchday slice.

### Commands Reviewed Before Rework

```bash
pnpm cli career --save=phase40-check --set-lineup-demo=pro01-first-team
pnpm cli career --save=phase40-check --set-tactic-demo=pro01-balanced
pnpm cli career --save=phase40-check --summary
pnpm cli career --save=phase40-check --advance-next-fixture
```

Observed baseline:

- the first fixture advanced from the save;
- output showed status, fixture ID, result, save-written status, and next
  fixture;
- output did not show match explanation, chance summary, team strength, or
  condition impact.

### Rework Applied

The narrowest useful bridge was added:

```bash
pnpm cli career --save=phase40-check --advance-next-fixture --fixture-explanation
```

This flag:

- is available only with `--advance-next-fixture`;
- keeps default career advance output compact;
- does not change match probabilities;
- does not add tactical advice;
- does not write rendered explanation text to the save;
- uses engine-local structured trace data when explicitly requested.

Observed explained output for `fixture:000011`:

- result: `S.S. Perugia 3-0 A.S.D. Rimini`;
- S.S. Perugia strength: `ATT=11.75 MID=10.78 DEF=10.49 GK=12.51 OVR=11.01`;
- Rimini strength: `ATT=9.72 MID=8.62 DEF=8.99 GK=9.26 OVR=9.01`;
- S.S. Perugia chances: `13` opportunities, `13` shots, `7` on target,
  `3` goals;
- Rimini chances: `5` opportunities, `5` shots, `0` on target, `0` goals;
- variance markers: normal event volume, normal conversion.

### Remaining Gap

Condition impact still reads as `not tracked effect=unknown affected=0` because
this career advance path does not yet run a richer fatigue lifecycle through
career progression. That is acceptable for this step: the explanation is now
connected to the played career fixture, and future fatigue/matchday work can
make condition meaningful.

### Step 04 Decision

Career fixture explanation is ready for the Phase 40 matchday slice.

The career flow can now show:

- saved preparation before the match;
- played fixture result;
- optional factual explanation of the played fixture;
- next selected-club fixture.

The default career command remains compact, so the CLI does not become noisier
unless the user explicitly asks for the explanation.

## Step 05 - Season Rollover And Development Loop Smoke

Step 05 checked whether the same career save can be followed beyond one match.

### Commands Reviewed

```bash
pnpm cli career --save=phase40-check --summary
pnpm cli career --save=phase40-check --advance-next-fixture
pnpm cli career --save=phase40-check --development-report
pnpm cli career --save=phase40-check --youth-academy
pnpm cli career --save=phase40-check --rollover-season
```

### Observed Post-Match Continuity

The save could advance multiple selected-club fixtures:

- current date moved from `2026-08-01` to `2026-08-22`;
- next selected-club fixture retargeted to `fixture:000039`;
- saved lineup and tactic remained visible and retargeted after advancement;
- default advance output stayed compact.

This is a positive playability signal: the user can see the next match and keep
the same preparation without re-entering every choice.

### Development Report

The development report is readable as an inspection:

- seasons simulated: `7`;
- players reviewed: `22`;
- players improved: `13`;
- players declined: `10`;
- biggest improver: `Enrico Ruggieri`, age `17->23`, growth `18.53`;
- biggest decline: `Niklas Keller`, age `30->36`, decline `10.01`.

Manager value:

- it proves prospects and veterans can become stories over time;
- it helps judge whether long-term squad building will be fun.

Friction:

- it is explicitly `inspection only`, so it does not yet feel like a lived
  career consequence;
- it simulates a seven-season projection rather than the next immediate season
  transition.

### Youth Academy Report

The youth report is readable:

- selected club youth count: `11`;
- active world players: senior `396`, youth `198`, total `594`;
- selected-club youth players include age, nationality, position, ability band,
  development category, and academy status.

Manager value:

- the user can see that the club has a youth pipeline;
- youth count and age bands support future long-run squad refresh work.

Friction:

- nationalities currently show `unknown` in this output;
- youth status is visible, but there is no next decision in the current loop.

### Rollover Smoke

Rollover command returned an invalid state:

- status: invalid state;
- reason: current season is not complete;
- blocking fixture: `fixture:000001`;
- save written: no.

This is correct for the current save because a full season has not been played.
It is not a Step 05 blocker.

However, the message is a reminder that Phase 40 has only a matchday slice, not
a full season-playable loop.

### Step 05 Decision

The career can be followed beyond one match.

The current loop supports:

- persistent selected club;
- persistent preparation;
- repeated selected-club fixture advancement;
- optional match explanation;
- readable youth and development inspection.

The current loop does not yet support:

- a lived full-season rollover from the same interactive flow;
- immediate post-match condition consequences in the summary;
- a next-decision layer after youth/development reports.

These gaps should be considered next-phase/UI-loop design issues, not blockers
for closing Phase 40.

## Step 06 - Playability Friction Report And Next Decision

Step 06 closes Phase 40.

### Current Playable Loop

The current loop can now be exercised as:

1. Create a deterministic career world.
2. Inspect selected club, squad, condition, and next fixture.
3. Save a manual lineup.
4. Save a manual tactic.
5. Confirm saved match preparation in summary.
6. Advance the next selected-club fixture.
7. Optionally request factual match explanation for the played fixture.
8. See the next selected-club fixture.
9. Inspect development and youth reports as longer-term context.

This is a meaningful matchday slice. It is no longer just isolated CLI debug
output.

### Main Friction Points

1. Post-match condition is not yet a real career consequence.

   The explanation still reports condition as `not tracked effect=unknown`.
   This hurts fun because rotation, fatigue, and squad management are central to
   the manager fantasy.

2. The post-match summary is too thin.

   The result and next fixture are visible, but the manager does not yet see a
   compact "what changed?" view for squad condition, table context, or player
   consequences.

3. Full-season rollover is not reachable from the current small slice.

   This is acceptable for Phase 40, but UI should not pretend that the full
   season loop is already playable.

4. Youth/development reports are useful but still lab-style inspections.

   They prove long-term systems exist, but they are not yet connected to a
   weekly decision loop.

5. Save writes can race if independent CLI commands are run in parallel.

   This is not a gameplay blocker because the future UI will serialize user
   actions, but developer smoke commands should avoid parallel save writes.

### Blockers Versus Nice-To-Have

Blocker before a serious playable UI:

- career match advancement must produce visible condition/fatigue consequences
  for the selected club.

Nice-to-have before UI:

- richer post-match table context;
- automatic full-season lab runner from career save;
- nicer youth/development decision prompts;
- prettier match explanation formatting.

The blocker matters because it affects the user's weekly choices. The
nice-to-haves can wait because they improve presentation or depth but do not
invalidate the matchday loop.

### Ready For UI

The following surfaces are ready enough to be represented in a first UI
prototype after the blocker is handled:

- career summary;
- selected club identity;
- squad list;
- saved lineup;
- saved tactic;
- next fixture;
- fixture advancement result;
- optional factual match explanation;
- youth academy inspection;
- development inspection.

### Risky To Expose In UI Before Fixing

- condition/fatigue after played career fixtures;
- post-match "what changed?" summary;
- full-season rollover as a normal user flow.

If exposed too early, these would make the game feel like it has screens but no
managerial consequence.

### Recommended Next Phase

Recommended next phase:

`41-career-matchday-consequences-and-condition-integration`

Purpose:

- make career fixture advancement spend/recover selected-club player condition
  in a deterministic, visible way;
- show compact post-match condition consequences;
- keep the manager in control of future lineup decisions;
- keep fixture explanation factual and optional;
- avoid UI implementation until the matchday consequence loop feels real.

This recommendation is based on user fun: the matchday loop becomes more
interesting when playing the same eleven has a visible cost and the next lineup
decision matters.

### Final Phase 40 Decision

Phase 40 is complete.

The current career loop is close to playable, but not yet ready for UI as a
core gameplay surface. The next best step is one narrow core loop phase focused
on matchday consequences and condition integration.

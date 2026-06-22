# Match Engine And Calculator Quality Review

Date: 2026-06-22
Phase: `38-match-engine-and-calculator-quality-review`
Status: Complete

## Purpose

Review the match engine and calculator as a football system. The goal is not to
make reports greener; the goal is to understand whether results can be explained
with football reasons that would feel fair and fun to the user.

Phase 37 already proved structural long-run stability. Phase 38 asks whether the
current calculator produces credible causal explanations.

## Step 01 - Calculator Surface Map

This step maps the current surface only. It does not judge balance and does not
change behavior.

### Main Calculator Entry Points

- `deriveTeamStrength` in `packages/engine/src/match-engine/team-strength.ts`
  turns explicit lineup slots, player abilities, role weights, and optional
  player-state curves into attack, midfield, defense, goalkeeper, and overall
  strength.
- `buildTacticTeamContext` in
  `packages/engine/src/match-engine/tactic-team-context.ts` validates selected
  lineup and tactic data, maps selected slots to engine lineup slots, derives
  team strength, and maps tactic knobs to tactical distribution values.
- `stepMatch` in `packages/engine/src/match-engine/step-match.ts` advances one
  simulated minute, decides per-side opportunities, resolves shot outcomes, and
  attaches chance actors to the produced event.
- `AggregateOccasionResolver` in
  `packages/engine/src/match-engine/aggregate-occasion-resolver.ts` maps
  aggregate team strengths and configured conversion bands to goal, save, miss,
  or block outcomes.
- `selectChanceActors` in
  `packages/engine/src/match-engine/chance-actors.ts` chooses creator, shooter,
  primary defender, and goalkeeper from explicit lineups using a separate stable
  RNG stream.
- `simulateMatch` and `simulateMatchWithManualTactics` run the full match loop.
- `simulateSeason` generates the calendar, builds fixture match contexts,
  simulates every fixture, applies match reports, computes league table and
  season player summaries, and optionally applies the fitness lifecycle.
- `ten-season-report` and `balance-report` are the current batch observation
  surfaces.

### Main Inputs

- Player attributes on the 0-20 scale.
- Explicit selected lineup slots.
- Role weight profiles supplied by content/callers.
- Player dynamic states when state multiplier curves are supplied.
- Optional fitness/form/morale multiplier curves, currently used for fitness.
- Tactic setup values:
  - `directness`
  - `pressing`
  - `width`
  - `risk`
- `mentality` is currently validated setup data, but has no separate engine
  effect in `buildTacticTeamContext`.
- Team strength departments:
  - attack
  - midfield
  - defense
  - goalkeeper
  - overall
- Home advantage factor.
- Match-engine config:
  - base opportunity rate per minute;
  - max opportunity rate per minute;
  - conversion bands by opportunity quality;
  - tactical distribution caps;
  - minute count.
- Stable RNG streams:
  - match stream by seed and fixture ID;
  - chance-actors stream;
  - chance-actor-assist stream;
  - schedule stream at season level.

### Main Outputs

- Match score.
- Aggregate match stats:
  - opportunities;
  - shots;
  - shots on target;
  - goals.
- Structured match events:
  - goal;
  - save;
  - miss;
  - block.
- Event context:
  - minute;
  - side;
  - quality;
  - shot type;
  - chance type.
- Player IDs on events:
  - scorer;
  - assist;
  - creator;
  - shooter;
  - goalkeeper;
  - primary defender.
- Derived player match stats.
- Season player goal and summary stats.
- Fixture results.
- League table.
- Balance metrics.
- Long-run metrics and warning signals.

### Currently Explainable From Data

- Why one lineup has higher attack/midfield/defense/goalkeeper strength: role
  weights and player abilities are explicit.
- Why low fitness can reduce team strength when the lifecycle is enabled: the
  caller-supplied fitness curve is explicit.
- Why chance volume differs between teams: opportunity rate uses attack and
  midfield against defense, midfield, and goalkeeper with a visible home factor.
- Why chance quality differs between teams: opportunity quality uses aggregate
  attack/midfield versus defense/goalkeeper/midfield plus bounded random
  texture.
- Why a given event has named actors: actor selection uses explicit lineup role
  weights and separate deterministic RNG streams.
- Why a season table exists: all fixture results are generated and then passed
  through the deterministic league-table rules.

### Still Aggregate Or Opaque

- Opportunity resolution is aggregate. The current resolver does not yet model a
  true possession chain or nominal duel before deciding the outcome.
- Chance actors are attached after the aggregate outcome is resolved. They make
  events readable, but they do not yet cause the shot outcome in a duel model.
- `pressing` is carried in tactical distribution but does not currently affect
  the inspected `stepMatch` chance-type logic directly.
- `mentality` is validated but has no separate engine effect yet.
- Player condition beyond fitness, including form and morale, is supported by
  the team-strength hook but not currently active in normal fake content.
- There is no live tactical trace explaining a single fixture in natural
  language; current explanations require reading structured output and reports.
- There is no possession, cards, injuries, substitutions, weather, pitch, staff,
  training, or morale effect in the current match engine.

### Step 01 Decision

The current calculator surface is coherent for the implemented scope. It is a
two-layer aggregate model with named-event attribution:

1. team strength and tactics generate opportunity volume and chance context;
2. aggregate chance resolution decides outcome;
3. deterministic actor selection explains who appears in the event.

This is acceptable as a baseline for Phase 38 audits, but later steps must judge
whether the aggregate-to-named-event bridge feels credible enough for user fun.

## Step 02 - Team Strength Sensitivity Audit

Step 02 added deterministic sensitivity tests for the team-strength layer. These
tests do not change behavior; they make the current football assumptions
executable.

### Evidence

Focused test:

```bash
pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts
```

Result:

- 1 test file passed;
- 10 tests passed.

Full gate:

```bash
pnpm check
```

Result:

- 81 test files passed;
- 559 tests passed.

### Findings

- Striker-relevant improvements move the attacking department upward:
  finishing, composure, and pace increase attack strength.
- Defender-relevant improvements move the defensive department upward:
  tackling, positioning, and anticipation increase defense strength.
- Midfielder-relevant improvements move the midfield department upward:
  passing, vision, and stamina increase midfield strength.
- Goalkeeper-relevant improvements move the goalkeeper department upward:
  reflexes, handling, and goalkeeper positioning increase goalkeeper strength.
- Irrelevant cross-role attributes do not dominate role score:
  - attacker tackling does not improve attack strength;
  - defender finishing does not improve defense strength;
  - goalkeeper finishing/tackling does not improve goalkeeper strength.
- Fitness curves are bounded and explicit. The current fake-content curve can
  reduce strength, but it does not overwhelm base ability at normal condition
  values.

### Natural, Adapted, And Weak Roles

Natural/adapted/weak suitability is not currently a direct team-strength
penalty. It is handled before match calculation through formation-fit and lineup
selection surfaces. Once a player is assigned a `roleKey`, `deriveTeamStrength`
uses that role's weights and does not know whether the assignment was natural or
adapted.

This is acceptable for the current implementation, because the user currently
chooses the lineup explicitly. It is a future design lever rather than a current
bug: if adapted-role penalty becomes needed, it should be added as an explicit,
visible rule instead of hidden inside player attributes.

### Step 02 Decision

Team-strength sensitivity is directionally credible. The first calculator layer
supports user fun because relevant player improvements affect the expected
department and irrelevant attributes do not produce misleading strength.

No gameplay rework is needed from Step 02.

## Step 03 - Chance Generation And Conversion Audit

Step 03 added deterministic match-flow evidence for controlled strength
profiles. These tests do not tune probabilities; they verify that the current
aggregate resolver moves in football-plausible directions.

### Evidence

Focused test:

```bash
pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts
```

Result:

- 1 test file passed;
- 9 tests passed.

Full gate:

```bash
pnpm check
```

Result:

- 81 test files passed;
- 560 tests passed.

Strict balance:

```bash
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Result:

- status: PASS;
- goals per match: `3.102`;
- table points spread: `43.800`.

### Controlled Matchups Reviewed

The new deterministic flow test samples 200 fixtures per scenario:

- equal teams;
- clearly stronger home team;
- clearly stronger away team;
- strong attack against weak defense;
- weak attack against strong defense.

The test verifies that:

- both equal sides can create chances;
- stronger home teams create more home opportunities and goals than equal-team
  baselines;
- stronger home teams win more often than their weaker away opponents;
- stronger away teams create more away opportunities and win more often than
  their weaker home opponents;
- strong attack against weak defense creates more shots on target and goals than
  weak attack against strong defense.

### Findings

- Chance volume separation is visible. Attack and midfield strength against
  defense, midfield, and goalkeeper strength produces material opportunity
  differences.
- Conversion remains tied to opportunity quality and configured conversion
  bands. The model can still produce variance because each chance carries random
  texture and outcome rolls.
- Home advantage is present in the formula, but the controlled strong-away
  sample still produces away dominance when the away side is materially better.
  That is good for user fun: home advantage matters, but it is not a hidden win
  button.
- Save and block probabilities respond to aggregate defense/goalkeeper versus
  attack balance.
- The current model still lacks a richer per-opportunity trace. A future
  match-day UI would benefit from diagnostic context such as "chance created by
  attack-vs-defense edge", but that is visibility work, not a Step 03 blocker.

### Step 03 Decision

Chance generation and conversion are directionally credible for the current
aggregate scope. Stronger teams and stronger attacking profiles create better
match-flow outcomes without removing deterministic variance.

No gameplay rework is needed from Step 03. The main future improvement is
diagnostic visibility, not rate tuning.

## Step 04 - Causal Actor Selection Audit

Step 04 reviewed whether named players attached to match events are credible
within the current aggregate model.

### Evidence

Fixture inspection:

```bash
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001
```

Observed fixture:

- `Ascoli Calcio 3-0 A.S.D. Rimini`;
- goals credited to outfield Ascoli players;
- assists credited to outfield Ascoli players;
- saves credited to the defending goalkeeper;
- player stats table includes all starters and keeps saves on goalkeepers.

Long-run snapshot:

```bash
pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10
```

Result:

- status: PASS;
- failed worlds: 0;
- warning worlds: 11;
- warning signals: `story=10`, `monitor=1`;
- top assist p95: `15`;
- production warning max: `assists=15 top1=0.40 top3=0.53`.

Full gate:

```bash
pnpm check
```

Result:

- 81 test files passed;
- 560 tests passed.

### Findings

- Shooter and scorer selection favors attacking outfield players and excludes
  goalkeepers.
- Creator selection varies by chance type:
  - open play favors midfielders;
  - counters favor attackers;
  - crosses increase defender and attacker involvement;
  - dead balls keep a mixed outfield pool.
- Save events require a defending goalkeeper from the explicit `gk` lineup slot.
- Block events select a defending outfield player through defender-weighted
  selection.
- Assist credit remains optional and never duplicates the scorer.
- The current long-run evidence does not show impossible creator concentration.
  The remaining creator-related warning is a monitor, not a blocker.

### Current Limitation

Actor selection is coherent, but it still happens after aggregate chance outcome
resolution. That means:

- the scorer/shooter/creator/goalkeeper/defender names make the event readable;
- the named players are not yet part of a pre-outcome duel chain that causes the
  goal/save/miss/block.

This is not a current blocker because the user-facing event output is plausible,
but it is the key future improvement if the match-day experience needs deeper
causal storytelling.

### Step 04 Decision

Causal actor selection is credible enough for the current aggregate match
engine. It produces named events that feel coherent and avoids impossible role
assignments.

No gameplay rework is needed from Step 04. Future work should focus on richer
traceability or duel-chain modeling only when match-day presentation needs it.

## Step 05 - Tactic, Lineup, And Condition Effect Audit

Step 05 reviewed whether manager-facing choices currently affect output in a
visible but explainable way.

### Evidence

Balanced setup:

```bash
pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced
```

Observed selected-club result:

- selected club: `A.S.D. Matera`;
- role changes: none;
- final position: 7th;
- points: `55`;
- goals for/against: `63/50`;
- goal difference: `+13`.

Attacking setup:

```bash
pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking
```

Observed selected-club result:

- role changes: two midfielders moved to attacker roles;
- final position: 1st on tie-break;
- points: `63`;
- goals for/against: `65/47`;
- goal difference: `+18`.

Defensive setup:

```bash
pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive
```

Observed selected-club result:

- role changes: two attackers moved to midfielder roles;
- final position: 18th;
- points: `27`;
- goals for/against: `24/50`;
- goal difference: `-26`.

Rotated lineup fixture:

```bash
pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated
```

Observed fixture:

- `A.C. Parma 1-1 A.S.D. Matera`;
- lineup override applies to the requested fixture;
- the report lists selected starters, rested first-team players, replacements,
  and expected fitness impact.

Condition demo:

```bash
pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season
```

Observed selected-club condition:

- match cost: `8`;
- daily recovery: `5`;
- first-match starters drop to `92`;
- after 7 days before the next selected-club fixture they recover to `100`;
- final listed starters finish at `92`.

Full gate:

```bash
pnpm check
```

Result:

- 81 test files passed;
- 560 tests passed.

### Findings

- Manager-facing choices are visible. The same seed and selected club produce
  materially different season outcomes under balanced, attacking, and defensive
  profiles.
- The attacking profile improves the selected club substantially in this seed.
  That supports user agency, but it should not be interpreted as a pure tactic
  effect because the profile also changes lineup roles.
- The defensive profile is very costly in this seed. It dramatically reduces
  selected-club goals and points, which is useful evidence that role/tactic
  choices matter, but the profile may be too blunt for later real gameplay
  presets if presented as a normal season-long tactic.
- Lineup override output is manager-friendly: it shows selected starters, rested
  players, and condition consequences without making automatic choices for the
  user.
- Current condition effects are visible in reports but mild in a weekly
  schedule. Players recover to full fitness between most fixtures, so condition
  will matter more once fixture congestion, cups, injuries, or short rest are
  introduced.
- Role suitability remains mostly a preparation/inspection concept. Once a
  player is assigned a role key, the match engine calculates that role normally.
  A future out-of-position penalty should be explicit and visible if needed.
- Manual tactical changes remain user-declared. No automatic tactical decision
  was introduced.

### Step 05 Decision

Tactic, lineup, and condition effects support user agency in the current CLI
lab. The user can see that choices matter.

No immediate rework is required, but future work should separate three concepts
more clearly:

1. pure tactic knob effect;
2. role/lineup reshaping effect;
3. condition/fatigue effect under congested calendars.

That separation matters for fun because the manager should understand whether a
result changed because of the plan, the players selected, or the physical state
of the squad.

## Step 06 - Performance And Determinism Benchmark

Step 06 measured the current runtime profile and repeated a representative
seeded command to verify deterministic output.

### Evidence

One-season simulation:

```bash
/usr/bin/time -p pnpm cli simulate-season --seed=world-a
```

Observed runtime:

- `real 0.71`
- status: pass.

Long-run 50x10 report:

```bash
/usr/bin/time -p pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10
```

Observed runtime:

- `real 18.10`
- status: pass;
- failed worlds: `0`;
- warning worlds: `11`.

Strict balance report:

```bash
/usr/bin/time -p pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Observed runtime:

- `real 1.00`
- status: pass.

Representative deterministic output:

```bash
diff <(pnpm cli simulate-season --seed=world-a) <(pnpm cli simulate-season --seed=world-a)
```

Observed result:

- no diff output;
- exit code `0`.

Full gate:

```bash
pnpm check
```

Result:

- 81 test files passed;
- 560 tests passed.

### Findings

- Single-season CLI output is fast enough for current inspection workflows.
- Strict balance reporting is fast enough for normal development checks.
- The 50x10 long-run report is acceptable as an explicit batch command, but it
  is not an interactive UI action.
- The current implementation remains deterministic for representative seeded
  output.
- There is no evidence that optimization is needed before the next product
  decision. The more important near-term improvement is diagnostic clarity:
  managers should understand why a match changed, not merely get results faster.
- Larger gates such as 250x30 or beyond should remain explicit report jobs.
  They should not be hidden behind everyday commands or UI actions.

### Step 06 Decision

Optimization is not needed now. Current runtime is acceptable for development
checks, CLI inspection, and documented long-run reporting.

Future optimization may be useful before very large statistical gates become a
regular workflow, but there is no current blocker and no evidence supporting a
core-loop rewrite.

## Step 07 - Phase Report And Next Decision

Step 07 closes Phase 38. No behavior was changed in this final step.

### Summary Of Findings

- The calculator surface is coherent for the current scope. The engine is an
  aggregate match model with explicit team-strength inputs, tactical
  distribution, deterministic outcome resolution, and named event actors.
- Team-strength sensitivity is credible. Role-relevant attributes move the
  expected department, while irrelevant cross-role attributes do not dominate.
- Chance generation and conversion move in football-plausible directions.
  Stronger profiles create more opportunities, shots on target, goals, and
  wins without removing variance.
- Causal actor selection is plausible for the current aggregate model. Scorers,
  creators, goalkeepers, and defenders are selected from explicit lineups with
  role-aware weights.
- Tactic, lineup, and condition choices are visible and manager-driven. The
  current demo profiles are useful inspection surfaces, but they mix tactical
  knobs and role reshaping.
- Runtime is acceptable for current development and report workflows. Larger
  gates should remain explicit batch reports.
- Determinism remains intact for representative seeded output.

### Current Blockers

No current blocker was found that makes the match engine or calculator
unusable, unfair, or structurally harmful to user fun.

### Non-Blocking Limitations

- The engine is still aggregate-first. Named players explain events, but they
  do not yet cause outcomes through a possession or duel chain.
- `mentality` is validated setup data but has no independent engine effect yet.
- `pressing` is carried as tactical context but is not yet a clearly inspectable
  match-flow lever.
- Normal weekly schedules make condition effects mild because players usually
  recover before the next fixture.
- Current tactical demo profiles mix tactic changes with role/lineup reshaping,
  so they should not be used as proof of pure tactic effect.
- There is no compact match explanation trace for a manager-facing UI.

### Decision

The match engine and calculator are currently acceptable for continued product
work. A broad optimization or balance-tuning phase is not justified now.

The next high-value improvement, when we choose to work on the match engine
again, should be diagnostic clarity: a narrow match-explanation trace that helps
the user understand why a fixture changed. That would serve fun better than
making averages prettier, because it would make tactical, lineup, condition, and
player-quality effects readable.

### Recommended Next Direction

Do not start a match-engine rework immediately unless the next product goal is
match-day inspection or UI.

If the next phase remains engine-focused, the recommended narrow direction is:

- add an internal, language-agnostic match explanation trace;
- show which broad factor affected each fixture segment:
  - team strength;
  - player quality;
  - tactic distribution;
  - lineup/role choice;
  - condition;
  - randomness;
- keep it deterministic and report-oriented;
- avoid automatic advice or tactical decisions.

If the next product goal is broader career playability, the engine can be kept
as-is for now and the next phase can move back to career-loop/report work.

### Final Verification

Focused tests:

```bash
pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts packages/engine/src/match-engine/simulate-match.test.ts
```

Result:

- 2 test files passed;
- 19 tests passed.

Full gate:

```bash
pnpm check
```

Result:

- 81 test files passed;
- 560 tests passed.

Long-run report:

```bash
pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10
```

Result:

- status: pass;
- failed worlds: `0`;
- warning worlds: `11`;
- failing check counts: none.

Strict balance:

```bash
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Result:

- status: pass;
- goals per match: `3.102`;
- first-place points: `70.300`;
- table points spread: `43.800`.

Phase 38 is complete.

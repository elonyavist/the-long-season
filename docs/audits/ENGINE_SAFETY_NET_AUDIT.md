# Engine Safety Net Audit

Date: 2026-06-25
Phase: `62-engine-safety-net-and-deterministic-regression-gates`

## Purpose

This audit defines the minimum deterministic regression surface needed before
the next career-loop phases touch season advancement, player-state
consequences, and match balance.

The target is not mathematical neatness. The target is player trust: the same
save and seed must keep producing the same football world unless a future phase
intentionally changes the engine and updates the evidence with a clear product
reason.

## Existing Regression Surface

### `simulateSeason`

File: `packages/engine/src/use-cases/simulate-season.test.ts`

Already protected:

- one 18-team, 34-round season completes;
- 306 fixtures are produced and played;
- the same seed produces the same final table;
- no club plays twice in a round;
- final table contains every club once;
- player goal totals match table goals;
- player assist/save summaries match durable match events;
- setup overrides and fixture lineup overrides are deterministic;
- invalid override data fails clearly;
- optional fitness lifecycle spends and recovers fitness deterministically.

Current gap:

- there is no compact structured golden sentinel for one stable season. The
  repeatability tests protect same-input equality, but they do not tell a junior
  developer which important season facts changed after an engine edit.

Risk classification:

- deterministic repeat risk: low, already covered;
- football plausibility risk: medium, because table order and scorer/save
  leaders can drift silently;
- reporting-only risk: low, because this phase must not pin localized CLI text.

Minimum Phase 62 gate:

- add one small structured golden for a stable seed, including champion,
  bottom club, fixture count, selected top-table rows, and one fixture result.

Do not pin:

- full fixture objects;
- full player-stat lists;
- localized CLI output;
- every goal/assist/save leader, unless already available in a compact
  structured result without noisy generated names.

## `simulateMatch`

File: `packages/engine/src/match-engine/simulate-match.test.ts`

Already protected:

- same seed and fixture ID produce identical match output;
- one fixed match has a golden full-match result;
- JSON serialization remains deterministic;
- explanation trace does not affect score, events, or stats;
- different fixture IDs can create different outcomes;
- full time is reached;
- final score equals goal events;
- 1,000 deterministic matches complete;
- controlled strength profiles create directional match-flow separation;
- step-limit protection prevents infinite loops.

Current gap:

- low-scoring coverage exists through the current golden `0-0`, but it is not
  named as a football-plausibility edge case. There is also no explicit test
  that a deliberately no-op match config remains deterministic and finishes
  with kickoff/half-time/full-time only.

Risk classification:

- deterministic repeat risk: low;
- football plausibility risk: medium, because low-event matches must remain
  valid and not be "optimized away";
- career-loop drift risk: low at match level.

Minimum Phase 62 gate:

- add a named low-event/low-scoring regression test that uses existing config
  seams and does not change production probabilities.

Do not pin:

- exact aggregate percentages from large samples;
- every minute-level RNG decision outside the current compact golden.

## `stepMatch`

File: `packages/engine/src/match-engine/step-match.test.ts`

Already protected:

- one step advances exactly one minute;
- same seed/context produces the same events and state;
- stronger teams produce materially more output over a deterministic sample;
- home/away processing order is not permanently biased;
- goals, misses, saves, blocks, assists, creators, shooters, and primary
  defenders are attributed deterministically;
- input simulation state is not mutated.

Current gap:

- no explicit low-event/no-event minute test documents the expected event list
  when opportunity rates are zero.

Risk classification:

- deterministic repeat risk: low;
- football plausibility risk: medium, because no visible event in a minute is a
  normal match outcome and must remain supported;
- career-loop drift risk: low.

Minimum Phase 62 gate:

- add a no-op minute test with zero opportunity rates, proving that the minute
  advances, state is deterministic, and only kickoff appears at minute zero.

Do not pin:

- private RNG stream consumption details. The public result is enough.

## Career Fixture Progression

File: `packages/engine/src/career/progress-fixture.test.ts`

Already protected:

- the next selected-club fixture can be simulated and applied without mutating
  input;
- the same state and team contexts produce the same result;
- explanation trace does not change fixture progression;
- tired starters produce negative condition-impact explanation;
- caller-supplied recovered state is used as pre-match truth;
- no fixture and missing-team-context branches are explicit.

File: `apps/cli/src/commands/career.test.ts`

Already protected at adapter level:

- new career world creation;
- summary without mutation;
- dashboard smoke output;
- durable market application;
- localized output for selected career flows.

Current gap:

- the engine-level deterministic test compares whole results, but it does not
  pin a compact manager-facing fixture progression sentinel such as result,
  event count, condition deltas, and current date.

Risk classification:

- career-loop drift risk: medium, because Phase 63 will change advancement
  orchestration and needs a concise baseline;
- deterministic repeat risk: low;
- reporting-only risk: low.

Minimum Phase 62 gate:

- add one compact structured progression sentinel at engine level;
- avoid new CLI output unless required by a bug, because CLI prose is an adapter
  concern.

Do not pin:

- complete localized career command output;
- storage file formatting;
- future season-advancement behavior that does not exist yet.

## League Table And Player Stats

Already protected indirectly by `simulateSeason`:

- table rows exist for every club once;
- goal totals match player goals;
- assists and saves match durable events.

Current gap:

- table order and selected row totals are not compactly pinned for a stable
  season.

Minimum Phase 62 gate:

- cover this through the `simulateSeason` structured golden rather than adding
  a separate broad table snapshot.

## Long-Run And Balance Gates

Existing command surface:

- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm cli career --save=<id> --development-report`
- long-run report commands introduced by earlier phases.

Current gap:

- there is no single safety-net command pack telling future engine-changing
  phases which checks are fast local gates and which checks are confidence runs.

Risk classification:

- football plausibility risk: medium;
- reporting-only risk: medium if warnings are treated as numbers to suppress
  instead of design signals.

Minimum Phase 62 gate:

- create a command pack separating fast local checks from heavier confidence
  runs and stating that warnings require gameplay review before threshold
  tuning.

## Web Roadmap Constraint Check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked for this step. Phase
62 is an engine safety-net phase, not a web section. No web implementation task
is marked done here; the relevant roadmap authority for this phase is
`docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`.

## Step 01 Decision

Phase 62 should add exactly these gates:

1. A compact `simulateSeason` structured golden sentinel.
2. A named match-level low-event/low-scoring determinism test.
3. A `stepMatch` no-event minute determinism test.
4. A compact `progressNextCareerFixture` structured sentinel.
5. A documented long-run verification command pack.

Golden updates are allowed only when a future phase intentionally changes
simulation behavior for a documented gameplay reason. The update must explain
what changed, why the user experience improves or remains credible, and which
checks were rerun.

## Step 02 Golden Strategy

Added:

- `packages/engine/src/use-cases/simulate-season.test.ts`
  - `stable season seed produces a compact golden sentinel`

Pinned structured facts:

- round count;
- fixture count;
- champion row;
- runner-up row;
- bottom row;
- first and last fixture IDs, scores, event counts, and shot counts;
- top three player goal rows.

Intentionally not pinned:

- every fixture;
- every event;
- localized CLI output;
- generated display names;
- complete player summary tables.

Update protocol:

1. A future phase may update the sentinel only when the behavior change is
   intentional.
2. The update must cite the gameplay reason, not just "tests changed".
3. The reviewer should inspect whether the new champion/bottom/fixture facts
   still feel credible for the seed and input scale.
4. The focused season test and the relevant long-run command pack must be rerun.

Web roadmap constraint check:

- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked again. Step 02 is
  engine-only, so no web-section completion state was changed.

## Step 03 Match Edge-Case Strategy

Added:

- `packages/engine/src/match-engine/simulate-match.test.ts`
  - `zero-opportunity match stays deterministic and low-event`
- `packages/engine/src/match-engine/step-match.test.ts`
  - `zero-opportunity minute advances deterministically without visible events`

Protected user-facing behavior:

- a match can credibly have no generated chances when the configuration says no
  opportunities should be possible;
- the full-match driver still emits only structural match events
  (`kickoff`, `half_time`, `full_time`) in that case;
- a non-kickoff minute can advance without visible events;
- the result remains deterministic across identical seed/context input.

Intentionally not pinned:

- private RNG consumption;
- exact no-event behavior under normal non-zero production rates;
- probability tuning or conversion rates.

Web roadmap constraint check:

- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked again. Step 03 is
  engine-only, so no web-section completion state was changed.

## Step 04 Career Fixture Sentinel

Added:

- `packages/engine/src/career/progress-fixture.test.ts`
  - `progressNextCareerFixture keeps a compact deterministic progression sentinel`

Pinned structured facts:

- progressed fixture ID;
- match score;
- event count;
- home and away match stats;
- fixture result applied back into career state;
- unchanged current date;
- first three selected-club condition changes.

Adapter decision:

- no new CLI test was added. `apps/cli/src/commands/career.test.ts` already
  covers career save creation, summary, dashboard, and durable command smoke.
  The new regression value for this phase is at the engine boundary, where
  Phase 63 will change advancement orchestration.

Intentionally not pinned:

- localized career command prose;
- full persisted JSON file shape;
- complete match event list inside the career fixture smoke;
- future season-advancement behavior that does not exist yet.

Web roadmap constraint check:

- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked again. Step 04 is
  engine-only, so no web-section completion state was changed.

## Step 05 Command Pack

Added:

- `docs/audits/ENGINE_SAFETY_NET_COMMANDS.md`

The command pack defines:

- Node 24 setup;
- fast local engine gates;
- adapter smoke checks;
- balance/plausibility gates;
- heavier `ten-season-report` confidence and stress commands;
- full local closeout with `pnpm check` and `graphify update .`.

The document explicitly states that warnings are design signals. Future phases
should inspect whether a warning hurts football credibility or manager fun
before changing thresholds.

Web roadmap constraint check:

- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked again. Step 05 is
  engine-only, so no web-section completion state was changed.

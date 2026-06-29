# Career Advancement Path Audit

Date: 2026-06-25
Phase: `63-canonical-career-advancement-use-case`
Step: `01-current-advancement-path-audit.md`

## Purpose

Audit every current path that advances career time, season state, player
development, squad refresh, youth lifecycle, or transfer turnover before the
canonical season advancement Module is implemented.

The target architecture is one deep engine Module with a narrow Interface. CLI
and report code should become Adapters: they may load saves, create content
inputs, run batch loops, and render facts, but they should not own season
advancement order.

## Current paths

### Selected-club fixture advancement

Files:

- `apps/cli/src/commands/career/progression.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/career-weekly-recovery.ts`
- `packages/engine/src/career/career-condition-consequences.ts`

Current order:

1. CLI validates selected-club preparation.
2. CLI creates content config via `createFakeLeagueSystem`.
3. CLI finds the next selected-club fixture with `findNextCareerFixture`.
4. CLI applies pre-match recovery for selected-club players.
5. CLI builds match team contexts for selected club and default opponents.
6. Engine `progressNextCareerFixture` simulates the selected fixture.
7. Engine applies fixture result and match report.
8. Engine applies selected-starter condition consequences.
9. CLI retargets saved match preparation to the next selected-club fixture.

Classification:

- This is fixture-level advancement, not season advancement.
- It is allowed to remain outside the new season Module.
- The future season Module should not replay selected-club fixtures that require
  manager preparation.

Reason:

The selected-club fixture flow contains explicit manager decisions. Folding it
into an automatic season advancement Module would risk hidden manager choices,
which is forbidden by project rules and the phase README.

### CLI development report

Files:

- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/career/development-output.ts`

Current order:

1. Start from the loaded career save.
2. Run `developPlayersForSeason` seven times in memory.
3. Advance only a report-local date/season id between iterations.
4. Aggregate selected-club player growth/decline examples.
5. Return the original career state unchanged.

Classification:

- This is a diagnostic lab, not a durable season advancement path.
- It duplicates part of the development cadence and should migrate to the
  canonical Module only if it can remain inspection-only.

Required design decision for Step 02:

- The canonical Interface should support inspection/simulation of multiple
  advancement seasons without writing storage, or the development report should
  be explicitly documented as a separate forecast Adapter that does not mutate
  career state.

### CLI durable season rollover

Files:

- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/career/season-rollover-output.ts`
- `packages/engine/src/career/season-completion.ts`
- `packages/engine/src/career/next-season-calendar.ts`
- `packages/engine/src/career/player-season-rollover.ts`

Current order:

1. CLI calls engine `assessCareerSeasonCompletion`.
2. CLI calls engine `generateNextSeasonCalendar`.
3. CLI rebuilds the current-season fixture id list.
4. CLI gets table rules by calling `createFakeLeagueSystem`.
5. CLI computes the final table with `computeLeagueTable`.
6. CLI computes aggregate goals.
7. CLI merges next-season fixtures into the existing game state.
8. CLI archives the completed season in `seasonHistory`.
9. CLI clears `matchPreparation`.
10. CLI calls engine `rolloverPlayersForNextSeason` to set date, season id,
    fitness, form, and morale.

Classification:

- This is durable season advancement.
- It should move behind the canonical engine Module.

Problem:

The CLI currently owns the high-level season rollover order and must know too
many internal details. If a future web Adapter needs durable season rollover,
the same order would be reimplemented or imported through CLI code.

Required Module depth:

- The new Module should own completion validation, archive creation, next
  calendar merge, match-preparation clearing, player state rollover, and
  structured facts.

Content seam note:

- Current table rules come from `createFakeLeagueSystem`, which lives in
  `@game/content`. Engine cannot import content. Step 02 must decide whether
  table rules and next-season content inputs are provided to the engine Module
  as input.

### Career long-run runner

Files:

- `packages/simulation-tools/src/long-run/career-long-runner.ts`

Current order:

1. Simulation-tools derives a deterministic season seed.
2. Caller creates a season input.
3. Simulation-tools calls engine `simulateSeason`.
4. Caller applies post-season career refresh via `advanceCareerState`.
5. Simulation-tools stores result and refresh facts.

Classification:

- The runner owns the batch loop only.
- The runner is a useful Adapter seam and should remain.
- The `advanceCareerState` callback currently points to adapter-owned season
  refresh logic and should eventually call the canonical engine Module.

Why this seam is real:

- The CLI report and future automated gates both need the same loop shape.
- The long-run runner gives leverage without importing content or storage into
  `simulation-tools`.

### Ten-season report post-season refresh

Files:

- `apps/cli/src/commands/ten-season-report/report-data.ts`

Current order inside `advanceCareerForReport`:

1. Create a synthetic `developmentSeasonId`.
2. `developPlayersForSeason` for senior players.
3. `applyEndOfSeasonPlayerExits`.
4. `applyYouthAcademyLifecycle`.
5. Generate youth intake candidates with content helpers.
6. `applySeasonalYouthIntake`.
7. `promoteYouthCandidatesToSeniorSquads` with selected-club autopromotion
   disabled.
8. Generate senior intake candidates with content helpers.
9. `maintainCareerSquadShape`.
10. `simulateTransferTurnover`.
11. Build youth and senior refresh snapshots.
12. Manually advance career date by `365`.
13. Manually create a synthetic next season id.

Classification:

- This is the largest duplicate season advancement path.
- The orchestration order should move behind the canonical engine Module.
- Candidate generation can remain an Adapter concern because it comes from
  content and engine must not import content.

Problem:

`report-data.ts` currently owns the most important career refresh sequence. It
is an Adapter file, but it decides the order of development, exits, youth,
maintenance, transfers, and time movement. That weakens locality: a career
refresh bug can hide in report code instead of one engine Module.

Required Module depth:

- The new Module should accept already-generated intake candidates and youth
  intake candidates as input.
- The Module should return facts equivalent to the current
  `CareerLongRunRefreshSummary`.
- Report code should continue to calculate report metrics, but not refresh
  rules.

### Individual engine helpers

Files:

- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-exits.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-intake.ts`
- `packages/engine/src/career/youth-promotion.ts`
- `packages/engine/src/career/squad-maintenance.ts`
- `packages/engine/src/career/transfer-turnover.ts`
- `packages/engine/src/career/player-season-rollover.ts`
- `packages/engine/src/career/next-season-calendar.ts`
- `packages/engine/src/career/season-completion.ts`

Classification:

- These are valid lower-level engine Modules.
- They should remain as internal implementation pieces.
- Their public exports can remain for focused tests and fixture-level tooling,
  but season-level callers should prefer the canonical use-case once it exists.

## Current duplicate ownership

| Owner | Duplicate responsibility | Severity |
|---|---|---|
| `apps/cli/src/commands/career/season-labs.ts` | Durable rollover order, archive creation, calendar merge, player rollover | High |
| `apps/cli/src/commands/ten-season-report/report-data.ts` | Post-season development/exits/youth/maintenance/transfer order | High |
| `apps/cli/src/commands/career/season-labs.ts` | Seven-year development forecast loop | Medium |
| `packages/simulation-tools/src/long-run/career-long-runner.ts` | Batch loop only, no duplicate rules | Low/allowed |
| `apps/cli/src/commands/career/progression.ts` | Fixture-level preparation/recovery/composition | Low/allowed for now |

## Step 05 migration update

`apps/cli/src/commands/career/season-labs.ts` no longer owns durable rollover
order. `rolloverCareerSeason` now loads Adapter-owned table rules and calls
`advanceCareerOneSeason` in `completedSeason` mode, then formats the returned
state/facts through the existing CLI presentation path.

`buildCareerDevelopmentReport` no longer calls `developPlayersForSeason`
directly. It runs seven inspection-only `reportRefresh` advancements through
`advanceCareerOneSeason` and derives selected-club examples by comparing player
ability deltas between returned states. This preserves the report as an
Adapter concern while keeping advancement order in the engine Module.

Remaining duplicate ownership after Step 05:

| Owner | Duplicate responsibility | Status |
|---|---|---|
| `apps/cli/src/commands/ten-season-report/report-data.ts` | Post-season development/exits/youth/maintenance/transfer order | Still to migrate in Step 06 |
| `packages/simulation-tools/src/long-run/career-long-runner.ts` | Batch loop only, no duplicate rules | Allowed seam |
| `apps/cli/src/commands/career/progression.ts` | Fixture-level preparation/recovery/composition | Allowed fixture-level seam |

## Step 06 migration update

`apps/cli/src/commands/ten-season-report/report-data.ts` no longer calls
season-advancement subsystems directly. Its `advanceCareerForReport` callback
now calls `advanceCareerOneSeason` in `reportRefresh` mode, passes
Adapter-owned candidate providers for youth and senior intake, and derives
long-run refresh metrics from the returned structured facts.

The optional candidate-provider callbacks were added to the canonical
Interface because the report/content adapter must generate candidates from the
correct mid-pipeline state without importing content into the engine. This keeps
content generation in the Adapter and keeps lifecycle/intake/maintenance order
in the engine.

Remaining duplicate ownership after Step 06:

| Owner | Duplicate responsibility | Status |
|---|---|---|
| `packages/simulation-tools/src/long-run/career-long-runner.ts` | Batch loop only, no duplicate rules | Allowed seam |
| `apps/cli/src/commands/career/progression.ts` | Fixture-level preparation/recovery/composition | Allowed fixture-level seam |
| Engine subsystem tests | Direct helper calls for focused unit coverage | Allowed seam |

## Recommended canonical order

Step 02 should confirm this exact order, but the audit supports:

1. Validate current season completion when durable rollover is requested.
2. Build completed-season archive facts when fixture results are available.
3. Apply senior player development.
4. Apply end-of-season player exits.
5. Apply youth academy lifecycle.
6. Apply seasonal youth intake using Adapter-provided candidates.
7. Promote AI youth candidates to senior squads while preserving user-club
   manager control.
8. Maintain senior squad shape using Adapter-provided intake candidates.
9. Simulate transfer turnover.
10. Generate and merge next-season calendar when the flow is durable rollover.
11. Reset player dynamic states and move date/season id to the next season.
12. Clear or retarget match preparation according to the resulting season.
13. Return structured facts for reports and future UI.

## Interface questions for Step 02

1. Should the Module be named `advanceCareerOneSeason` or
   `advanceCareerSeason`?
2. Should durable rollover and report-only refresh be one Interface with a mode,
   or two thin wrappers around a private shared implementation?
3. Should the Module require `tableRules` as input to avoid importing content?
4. Should the Module accept `nextSeasonCalendar` as input, or own the existing
   engine `generateNextSeasonCalendar` call?
5. How should synthetic long-run season IDs be replaced with deterministic
   proper next-season IDs without changing report meaning?
6. Should the development report keep its seven-year forecast behavior, or
   become a repeated inspection-only use of the canonical Module?
7. Which structured facts are stable enough to expose now without creating a
   save schema change?

## Blockers

No blocker prevents Step 02.

The main design constraint is package direction: engine cannot import content,
so the canonical Module must receive content-derived inputs from an Adapter.

## Career web roadmap check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was checked. Phase 63 is
engine-scoped and does not complete or change a web section. The web roadmap's
binding constraints still apply: no UI-only state, no CLI prose parsing, and
future web advancement must consume structured facts from engine/read-model
seams rather than duplicate career rules.

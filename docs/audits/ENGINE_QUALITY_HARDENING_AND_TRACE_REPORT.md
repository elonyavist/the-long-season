# Engine Quality Hardening And Trace Report

Date: 2026-06-22
Phase: `39-engine-quality-hardening-and-match-explanation-trace`
Status: In progress

## Purpose

Harden the match engine code and add deterministic explanation traceability
without weakening user fun, football credibility, or deterministic behavior.

This phase starts from the Phase 38 decision: the current match engine and
calculator are acceptable for continued product work. The goal is therefore not
to tune scores or chase prettier aggregate numbers. The goal is to make the
engine easier to maintain and easier to explain.

## Step 01 - Phase 38 Baseline And Behavior Lock

Step 01 records representative behavior before any cleanup or trace work.

### Phase 38 Decision Summary

Phase 38 concluded:

- team-strength sensitivity is directionally credible;
- chance generation and conversion are directionally credible;
- causal actor selection is plausible for the current aggregate model;
- tactic, lineup, and condition effects are visible and manager-driven;
- performance is acceptable for current development and reporting workflows;
- no broad optimization or balance tuning is justified now.

Phase 39 may improve code quality and traceability, but it must not change
gameplay unless a later step proves and documents a narrow bug.

### One-Season Baseline

Command:

```bash
pnpm cli simulate-season --seed=world-a
```

Observed key output:

- competition: `Demo Third Division`;
- champion: `A.C. Lecco`;
- champion record: `34` played, `19` wins, `9` draws, `6` losses;
- champion goals: `75` for, `44` against, `+31` goal difference;
- champion points: `66`;
- top scorer: `Enrico Piazza (A.S.D. Cesena) - 20 goals`;
- top assist: `Giorgio Bellini (Virtus Trento) - 9 assists`;
- top goalkeeper saves: `Enrico D'Amico (Pro Palermo) - 81 saves`;
- best defense: `A.C. Lecco (GA 44)`;
- worst attack: `A.S.D. Trieste (GF 36)`.

### Fixture Baseline

Command:

```bash
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001
```

Observed key output:

- fixture: `fixture:000001 Ascoli Calcio 3-0 A.S.D. Rimini`;
- goals:
  - `21' Nico Rinaldi`, assist `Giorgio Mazza`;
  - `50' Dario Kovac`, assist `Matteo Pavan`;
  - `61' Nico Morandi`, assist `Enrico Rosati`;
- saves:
  - `45' Davide Valentini`;
  - `70' Marko Popovic`;
- player-stat leaders:
  - `Nico Rinaldi`: `1` goal, `2` shots, `2` shots on target;
  - `Nico Morandi`: `1` goal, `2` shots, `1` shot on target;
  - `Dario Kovac`: `1` goal, `1` shot, `1` shot on target;
  - `Matteo Pavan`, `Giorgio Mazza`, `Enrico Rosati`: `1` assist each.

### Strict Balance Baseline

Command:

```bash
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Observed key output:

- status: `PASS`;
- goals per match: `3.102`;
- home win rate: `0.433`;
- draw rate: `0.228`;
- away win rate: `0.339`;
- first-place points: `70.300`;
- last-place points: `26.500`;
- table points spread: `43.800`;
- upset proxy rate: `0.370`.

### Long-Run Baseline

Command:

```bash
pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10
```

Observed key output:

- status: `PASS`;
- failed worlds: `0`;
- warning worlds: `11`;
- total seasons: `500`;
- goals per match avg/p95: `2.820 / 2.900`;
- table spread avg/min: `39.95 / 33.80`;
- draw rate avg/max: `0.240 / 0.260`;
- champion streak max: `7`;
- top assist p95: `15`;
- failing check counts: `none`;
- signal check counts: `story=10`, `monitor=1`.

### Behavior Lock

The following outputs must remain stable for fixed seeds unless a later step
proves and documents a narrow bug:

- final table ordering for representative fixed-seed season commands;
- fixture score and event order for representative fixed-seed fixture commands;
- scorer, assist, shooter, goalkeeper, and defender attribution for fixed-seed
  fixture output;
- player match-stat aggregation for fixed-seed fixture output;
- strict balance pass/fail status;
- long-run pass/fail status;
- deterministic output when the same seeded command is repeated.

The following outputs may evolve without being a gameplay regression:

- added optional trace sections when explicitly requested;
- improved report wording;
- added diagnostics that do not change simulation behavior;
- localized labels for new CLI-visible diagnostics;
- internal cleanup that keeps fixed-seed behavior stable.

### Step 01 Verification

Commands run:

```bash
pnpm check
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001
pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Results:

- `pnpm check`: pass, 81 test files and 560 tests passed;
- one-season baseline: pass;
- fixture baseline: pass;
- long-run baseline: pass;
- strict balance baseline: pass.

### Step 01 Decision

The baseline is healthy and becomes the guardrail for the rest of Phase 39.

Cleanup and trace work may proceed only if they preserve these results or
explicitly document a narrow bug fix with a user-facing reason.

## Step 02 - Engine Code Quality Audit

Step 02 audited the current engine/match surface before cleanup. No behavior was
changed in this step.

### Required Scans

Cleanup-risk scan:

```bash
rg -n "TODO|FIXME|deprecated|compat|legacy|unused|Math.random|Object.values|Object.keys|Object.entries" packages/engine packages/simulation-tools apps/cli
```

Findings:

- `apps/cli/src/commands/simulate-season.ts` uses `Object.keys(counts).sort()`
  for presentation-only nationality summary output. This is acceptable because
  it sorts before rendering and is not engine simulation order.
- `packages/engine/src/career/squad-maintenance.ts` has local
  `unusedCandidates` variables. The name describes the candidate pool and is
  not unused code.
- `simulate-match-with-manual-tactics` comments/tests include the word
  `compatible`. These are not compatibility leftovers; they document that manual
  tactics preserve the default batch path.
- No `Math.random()` or forbidden engine runtime API was found by this scan.

Entrypoint scan:

```bash
rg -n "deriveTeamStrength|buildTacticTeamContext|stepMatch|simulateMatch|simulateMatchWithManualTactics|simulateSeason|computePlayerMatchStats" packages/engine
```

Findings:

- `simulateMatch` and `simulateMatchWithManualTactics` each own a very similar
  full-match loop:
  - derive match RNG;
  - validate `maxStepCount`;
  - create initial simulation;
  - repeatedly call `stepMatch`;
  - collect events;
  - return the same `SimulateMatchResult` shape;
  - throw the same `SimulateMatchError` when the guard is exceeded.
- The only meaningful difference is that manual tactics can transform the
  context before each step.

### Fix Now In Step 03

1. Extract a private/shared match-loop helper inside `packages/engine/src/match-engine/`
   so `simulateMatch` and `simulateMatchWithManualTactics` reuse one loop.

   User-facing reason:

   - future trace emission will need to attach to the match loop once;
   - duplicating the loop creates risk that trace, guard, or event behavior
     diverges between normal and manual-tactic fixtures.

   Expected files:

   - `packages/engine/src/match-engine/simulate-match.ts`
   - `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts`
   - optional new private engine helper under `packages/engine/src/match-engine/`
   - focused match-engine tests if needed.

   Regression checks:

   - `pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`
   - `pnpm cli simulate-season --seed=world-a`
   - `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001`
   - strict balance report.

2. Update stale comments in match-engine files that still describe durable
   match reports as a future step.

   User-facing reason:

   - stale comments are low-level documentation debt; they make future trace
     work more error-prone for developers reading the engine.

   Expected files:

   - `packages/engine/src/match-engine/simulate-match.ts`
   - `packages/engine/src/match-engine/step-match.ts`

### Leave As Acceptable

- `Object.keys(counts).sort()` in CLI identity presentation: sorted before
  rendering, not simulation order, not engine.
- `unusedCandidates` in squad maintenance: active local state, not dead code.
- `compatible` wording in manual-tactic tests/comments: documents a valid
  behavior guarantee for the manual tactic path.

## Step 03 - Safe Engine Cleanup Pass

Step 03 applied only the cleanup items approved by Step 02.

### Adopted Cleanup

- Added `packages/engine/src/match-engine/match-simulation-runner.ts` as the
  shared full-match loop used by both `simulateMatch` and
  `simulateMatchWithManualTactics`.
- Kept the public `simulateMatch` and `simulateMatchWithManualTactics`
  contracts stable.
- Preserved the manual-tactic path by giving the shared runner a deterministic
  `beforeStep` hook that can replace the match context for the next minute
  without consuming additional RNG.
- Updated stale match-engine comments so durable match reports are no longer
  described as future work.

### Gameplay Impact

No gameplay behavior was intentionally changed.

The cleanup only centralizes already-existing loop behavior:

- same match RNG derivation;
- same max-step guard;
- same `stepMatch` call order;
- same event collection order;
- same result shape;
- same manual tactic context schedule behavior.

This matters for user fun because future explanation trace emission can attach
to one coherent match loop instead of duplicating diagnostics between normal
and manual-tactic fixtures.

### Step 03 Verification

Commands run:

```bash
pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts
pnpm --filter @game/engine run typecheck
pnpm check
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Results:

- focused match-engine tests: pass, `15` tests passed;
- engine typecheck: pass;
- `pnpm check`: pass, `81` test files and `560` tests passed;
- one-season baseline: unchanged, `A.C. Lecco` champion with `66` points;
- fixture baseline: unchanged, `fixture:000001 Ascoli Calcio 3-0 A.S.D. Rimini`;
- strict balance baseline: pass, goals per match `3.102`.

### Step 03 Decision

The cleanup is accepted as behavior-preserving. Phase 39 can proceed to the
engine-local explanation trace contract.

## Step 04 - Match Explanation Trace Contract

Step 04 defined the explanation trace contract without emitting it from match
simulation.

### Contract Placement

The first contract is engine-local, not durable domain state.

Reason:

- the trace is currently an inspection and explanation aid for CLI/UI;
- match reports remain the durable source of truth for saved outcomes;
- no save or report schema needs to change until trace persistence is actually
  required.

### Adopted Contract

Added `packages/engine/src/match-engine/match-explanation-trace.ts` with:

- schema version `MATCH_EXPLANATION_TRACE_SCHEMA_VERSION`;
- stable factor keys:
  - `team_strength`;
  - `tactic_distribution`;
  - `lineup_roles`;
  - `condition_impact`;
  - `opportunity_context`;
  - `variance`;
- home and away team snapshots;
- strength snapshots;
- tactic snapshots;
- ordered lineup-role snapshots;
- condition-impact snapshots that can explicitly say `not_tracked`;
- opportunity and shot-context summaries;
- data-only variance markers.

The contract uses machine keys and numeric data only. It does not include
labels, prose, advice, hidden potential, or scouting information.

### Step 04 Verification

Commands run:

```bash
pnpm exec vitest run packages/engine/src/match-engine/match-explanation-trace.test.ts
pnpm --filter @game/engine run typecheck
pnpm check
```

Results:

- focused trace-contract tests: pass, `3` tests passed;
- engine typecheck: pass;
- first `pnpm check`: failed on a pre-existing content test timeout
  (`rare prodigies are possible across generated career worlds but not
  guaranteed`);
- focused rerun of that content test: pass in `2.36s`;
- second `pnpm check`: pass, `82` test files and `563` tests passed.

### Step 04 Decision

The trace contract is accepted. Phase 39 can proceed to optional trace emission,
which must not change match outcomes, event order, player stats, or RNG
consumption.

## Step 05 - Trace Emission Without Outcome Change

Step 05 added optional trace emission behind an explicit engine option.

### Adopted Emission Model

- `SimulateMatchOptions.includeExplanationTrace` controls whether a
  `SimulateMatchResult` includes `explanationTrace`.
- Default simulation output does not include trace data.
- `simulateMatchWithManualTactics` forwards the same option through both the
  no-change path and the segmented manual-tactic path.
- Trace construction uses only:
  - the initial match context;
  - final score;
  - final aggregate stats;
  - already-emitted step events.

No additional RNG is derived or consumed for trace data.

### Factors Explained

The emitted trace explains:

- starting team-strength snapshots;
- tactic distribution snapshots;
- ordered lineup role snapshots;
- condition impact availability, currently `not_tracked` for match contexts
  that only contain already-derived strengths;
- chance and shot-context summaries by stable machine key;
- compact data-only variance markers for event volume and conversion.

The trace remains aggregate. It does not explain full possession chains,
training effects, hidden potential, hidden scouting data, or tactical advice.

### Step 05 Verification

Commands run:

```bash
pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts packages/engine/src/match-engine/match-explanation-trace.test.ts
pnpm --filter @game/engine run typecheck
pnpm check
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Results:

- focused match-engine tests: pass, `21` tests passed;
- engine typecheck: pass;
- `pnpm check`: pass, `82` test files and `566` tests passed;
- one-season baseline: unchanged, `A.C. Lecco` champion with `66` points;
- fixture baseline: unchanged, `fixture:000001 Ascoli Calcio 3-0 A.S.D. Rimini`;
- strict balance baseline: pass, goals per match `3.102`.

### Step 05 Decision

Optional trace emission is accepted as behavior-preserving. Phase 39 can proceed
to CLI fixture explanation inspection.

## Step 06 - CLI Fixture Explanation Inspection

Step 06 exposed the optional trace through fixture-focused CLI inspection.

### Adopted CLI Surface

Added:

```bash
pnpm cli simulate-season --seed=<seed> --fixture=<fixtureId> --fixture-explanation
```

Rules:

- `--fixture-explanation` requires `--fixture=<fixtureId>`;
- default `--fixture` output remains unchanged;
- the explanation section is appended after fixture player stats only when the
  flag is present;
- output is factual data, not tactical advice.

### Rendered Sections

The CLI now renders localized compact sections for:

- team strength;
- tactic distribution;
- lineup roles;
- condition impact;
- chance summary;
- variance markers.

All new user-facing labels are cataloged in `@game/i18n` for `en`, `it`, `de`,
`es`, and `fr`.

### Step 06 Verification

Commands run:

```bash
pnpm --filter @game/cli run typecheck
pnpm --filter @game/i18n run typecheck
pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts
pnpm check
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Results:

- CLI typecheck: pass;
- i18n typecheck: pass;
- focused CLI/i18n tests: pass, `59` tests passed;
- `pnpm check`: pass, `82` test files and `569` tests passed;
- default fixture output: unchanged through player stats;
- fixture explanation output: appended trace section rendered;
- strict balance baseline: pass, goals per match `3.102`.

### Step 06 Decision

The fixture explanation view is accepted as an optional inspection tool. Phase
39 can proceed to the final regression gate and closeout report.

## Step 07 - Regression Gate And Phase Report

Step 07 closes Phase 39.

### What Was Cleaned Up

- The duplicated full-match loop was extracted into one shared runner.
- Normal match simulation and manual-tactic simulation now share the same loop,
  max-step guard, event collection, and optional trace hook.
- Stale comments about future durable match reports were updated.

This makes the engine easier to maintain because future diagnostics attach to
one loop instead of diverging across match paths.

### What The Trace Explains

The trace explains factual aggregate match shape:

- starting team-strength differences;
- tactic distribution inputs;
- ordered lineup role composition;
- whether condition impact was tracked;
- opportunity, shot, chance-type, and shot-type summaries;
- compact variance markers for event volume and conversion.

### What Remains Aggregate Or Opaque

The current trace intentionally does not explain:

- full possession chains;
- individual duel sequences;
- tactical advice;
- hidden potential;
- scouting information;
- morale/training history beyond already-derived match context;
- why the user should buy, sell, or select a player.

Those are future product decisions, not cleanup work for this phase.

### Final Regression Gate

Commands run:

```bash
pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts packages/engine/src/match-engine/match-explanation-trace.test.ts apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts
pnpm check
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
pnpm cli ten-season-report --seed-prefix=phase35-table-spread --worlds=50 --seasons=10
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Deterministic repeat check:

```bash
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
```

was run twice and compared byte-for-byte successfully.

Results:

- focused tests: pass, `5` files and `80` tests passed;
- `pnpm check`: pass, `82` test files and `569` tests passed;
- fixed-seed season: unchanged, `A.C. Lecco` champion with `66` points;
- fixed-seed fixture: unchanged, `Ascoli Calcio 3-0 A.S.D. Rimini`;
- fixture explanation: deterministic and appended only when requested;
- strict balance: pass, goals per match `3.102`;
- 50x10 long-run gate: pass, `0` failed worlds, `11` warning worlds.

### Final Decision

Phase 39 is complete.

The engine is cleaner and more explainable without changing gameplay behavior.
No immediate match-engine tuning is recommended. The next product direction
should be chosen explicitly from gameplay needs, not from prettier aggregate
math.
  behavior guarantee, not preserved dead compatibility.

### Future Phase Only

- `simulate-season.ts` is large at `894` lines, but splitting it safely is
  broader than this phase's match-loop/trace purpose. It should not be changed
  in Step 03.
- `apps/cli/src/commands/simulate-season.ts` is very large at `2410` lines, but
  CLI module splitting is outside this engine hardening step.
- Aggregate resolver and chance-type numeric weights are gameplay calculator
  behavior. They should not be moved or renamed in Step 03 because this phase
  explicitly avoids tuning.

### Step 02 Verification

Commands run:

```bash
rg -n "TODO|FIXME|deprecated|compat|legacy|unused|Math.random|Object.values|Object.keys|Object.entries" packages/engine packages/simulation-tools apps/cli
rg -n "deriveTeamStrength|buildTacticTeamContext|stepMatch|simulateMatch|simulateMatchWithManualTactics|simulateSeason|computePlayerMatchStats" packages/engine
pnpm check
```

Results:

- scans completed and are classified above;
- `pnpm check`: pass, 81 test files and 560 tests passed.

### Step 02 Decision

Step 03 is approved for one narrow behavior-preserving cleanup: extract the
duplicated match loop shared by `simulateMatch` and
`simulateMatchWithManualTactics`, plus stale-comment cleanup in the same files.

No tuning, performance optimization, CLI split, or large use-case split is
approved for Step 03.

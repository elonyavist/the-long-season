# Season Fitness Lifecycle

## Goal

Apply deterministic fitness spend and recovery during season simulation.

## Why we implement it this way

After pure fitness rules and strength impact are tested, the season can start carrying player-state consequences across fixtures. This is the first step where repeated selection should create a cost.

The integration must remain narrow. The current fake league uses fixed lineups, so this step is not about automatic rotation. It should simply prove that playing spends fitness, calendar days recover fitness, and subsequent fixture strength can be derived from current fitness.

Because this may affect tables and balance metrics, the implementation must be optional or configured clearly enough that default behavior can be inspected and calibrated.

## What to implement

- Extend `simulateSeason` input with an optional fitness lifecycle configuration or player-state lifecycle input.
- Carry a copy-on-write `playerStates` lookup during season simulation when the lifecycle is enabled.
- Before each fixture, derive home/away team contexts from the current player states and configured fitness curves.
- After each fixture, spend fitness for players who started.
- Between fixture dates, recover fitness by elapsed calendar days using existing `GameDate` values.
- Return enough state from `simulateSeason` to inspect final player fitness when lifecycle is enabled.
- Preserve default behavior when the lifecycle option is omitted, unless the active step explicitly decides to enable it for fake content and documents the balance impact.
- Add tests proving:
  - no lifecycle option preserves existing deterministic output;
  - lifecycle enabled decreases starters' fitness;
  - rest days recover fitness;
  - later fixture strength uses current fitness;
  - same seed plus same lifecycle input is deterministic.

## What NOT to implement

- Do not add CLI condition output in this step.
- Do not rotate lineups automatically.
- Do not add injuries, form, morale, player ratings, training, staff, tactical familiarity, substitutions, or match-day sessions.
- Do not mutate content player states in place.
- Do not change fixture generation, table rules, scoring conversion probabilities, or calibration target ranges.
- Do not implement career persistence or save/load.

## Allowed dependencies

- `engine -> domain, shared`
- `content -> domain, shared` only if fake content must expose lifecycle config.
- `apps/cli -> engine, content, storage, simulation-tools, shared` only if existing CLI/balance wiring must pass through lifecycle options.

## Expected files

- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/engine/src/player-state/fitness.ts`
- `packages/engine/src/player-state/fitness.test.ts` only if rule integration requires a small refinement.
- `packages/content/src/generators/league-system.ts` only if fake content exposes lifecycle config.
- `apps/cli/src/commands/balance-report.ts` only if balance-report inputs must preserve default behavior explicitly.
- `apps/cli/src/commands/simulate-season.ts` only if CLI season simulation inputs must preserve default behavior explicitly.
- `docs/PROJECT_STATUS.md`
- `docs/steps/10-player-dynamic-states/05-cli-condition-inspection.md` only if the returned inspection shape changes the next step scope.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm --filter @game/content run typecheck` if content changes.
- `pnpm --filter @game/cli run typecheck` if CLI wiring changes.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `simulateSeason` can run with deterministic fitness spend/recovery when explicitly enabled.
- Default no-lifecycle behavior remains deterministic and backward-compatible.
- The returned result exposes enough state for a later CLI condition inspection step.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker before moving on.
- `docs/PROJECT_STATUS.md` records observed output and metric impact.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only the optional season fitness lifecycle. Do not add CLI condition output or automatic rotation. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me whether season output or balance metrics changed, and stop.

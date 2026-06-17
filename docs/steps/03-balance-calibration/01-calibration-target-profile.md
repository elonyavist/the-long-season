# Calibration Target Profile

## Goal

Add a stricter `calibration-v1` target profile beside the broad default smoke targets, without changing match outcomes yet.

## Why we implement it this way

The Phase 2 report is technically passing but shows a useful balance signal:

- 20-season sample with `seed-prefix=test-balance`: `goals_per_match = 1.125`, `draw_rate = 0.426`.
- 3-season sample with `seed-prefix=balance-demo`: `goals_per_match = 1.127`, `draw_rate = 0.444`.

Those values are inside the broad smoke profile, but they are not a strong football calibration target. This step separates two concerns:

- `default`: wide smoke target that catches broken output.
- `calibration-v1`: stricter target that can fail until tuning catches up.

## What to implement

- Add a hand-authored `calibration-v1` target profile.
- Keep the existing broad `default` profile unchanged.
- Keep the existing `strict-fail-smoke` profile for CLI failure tests.
- Expose `calibration-v1` through `pnpm cli balance-report --target-profile=calibration-v1`.
- Document in tests that `calibration-v1` may fail before rate tuning.
- Do not change match-engine behavior in this step.

Suggested initial `calibration-v1` bands:

- `goals_per_match`: `2.000..3.200`
- `draw_rate`: `0.180..0.330`
- `home_win_rate`: `0.330..0.550`
- `away_win_rate`: `0.170..0.380`
- `first_place_points`: `66.000..90.000`
- `last_place_points`: `15.000..38.000`
- `upset_rate`: `0.150..0.450`

These are intentionally broad enough for early tuning but narrow enough to expose the current under-scoring/draw-heavy engine.

## What NOT to implement

- Do not tune `MatchEngineConfig`, opportunity rates, conversion bands, home advantage, or team strength.
- Do not change `simulateMatch`, `stepMatch`, `simulateSeason`, calendar generation, fixture application, or league-table sorting.
- Do not remove or narrow the broad `default` smoke targets.
- Do not add real-data imports or external benchmark files.
- Do not add UI or persistence.

## Allowed dependencies

- `packages/content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `packages/simulation-tools -> domain, engine, shared`

## Expected files

- `packages/content/src/balance/calibration-targets.ts`
- `apps/cli/src/commands/balance-report.ts`
- `apps/cli/src/commands/balance-report.test.ts`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/balance-report.test.ts packages/simulation-tools/src/calibration-report.test.ts`
- `pnpm check`
- `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=default --strict` exits `0`.
- `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=calibration-v1 --strict` is allowed to exit nonzero until tuning is done; record the observed output.

## Definition of Done

- CLI accepts `--target-profile=calibration-v1`.
- The broad default profile still passes the known Phase 2 smoke sample.
- The stricter profile makes the current balance gap visible.
- No simulation behavior changes in this step.
- `docs/PROJECT_STATUS.md` records the observed `calibration-v1` result and the next action.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Confirm this is the active step, or update `docs/PROJECT_STATUS.md` if this step is now active. Implement only `calibration-v1` target profile support. Do not tune the engine or fake match config. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

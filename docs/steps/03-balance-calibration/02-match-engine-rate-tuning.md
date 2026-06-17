# Match Engine Rate Tuning

## Goal

Tune the smallest existing match-rate surface so the fake season moves toward `calibration-v1` targets.

## Why we implement it this way

The first balance samples are stable but under-scoring and draw-heavy. Before adding richer match mechanics, the existing aggregate engine should be calibrated enough that season results are plausible at a macro level.

This step should tune only existing data/configuration first. Engine algorithm changes are allowed only if config-only tuning cannot move the metrics without breaking determinism or producing obviously artificial output.

## What to implement

- Run the `calibration-v1` report before changing values and record the baseline.
- Tune the smallest existing surface, preferably fake content `MatchEngineConfig`:
  - opportunity rates;
  - conversion bands;
  - home advantage only if home/away split needs it.
- Keep the tuning deterministic and data-driven.
- Add or adjust tests that lock reproducibility for the tuned sample.
- Record the after sample with the same seed prefix and season count.

## What NOT to implement

- Do not add player scorer attribution, assists, cards, injuries, substitutions, tactics UI, or nominal duel chains.
- Do not add new match-event variants unless the current engine already needs them for existing reports.
- Do not change season calendar, fixture application, league-table tie-breakers, storage, or CLI command shape beyond reporting what is necessary.
- Do not tune by weakening `calibration-v1` targets unless the previous step documented bad target assumptions.
- Do not use real datasets.

## Allowed dependencies

- `packages/content -> domain, shared`
- `packages/engine -> domain, shared` only if a documented config-only attempt is insufficient.
- `packages/simulation-tools -> domain, engine, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `packages/content/src/generators/league-system.ts`
- `packages/content/src/balance/calibration-targets.ts` only if a documented target lesson requires it.
- `apps/cli/src/commands/balance-report.test.ts` only if the CLI expected output or target profile behavior changes.
- `packages/engine/src/match-engine/*.ts` only if the adopted solution requires engine algorithm tuning.
- Relevant focused test files for any touched source file.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/engine run typecheck` if engine files are touched.
- `pnpm --filter @game/cli run typecheck`
- Focused Vitest tests for touched package files.
- `pnpm check`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `pnpm cli balance-report --seed-prefix=balance-demo --seasons=3 --target-profile=default --strict`

## Definition of Done

- The tuned sample moves materially toward `calibration-v1`.
- Default smoke targets still pass.
- Determinism and dependency boundaries still pass.
- Any remaining gap is recorded as the next calibration lesson.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only match-engine rate tuning for the fake deterministic season. Measure before and after with the required balance-report commands. Do not add player-level events, UI, persistence, or new gameplay systems. Update `docs/PROJECT_STATUS.md` and stop.

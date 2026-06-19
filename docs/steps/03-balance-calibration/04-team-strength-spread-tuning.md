# Team Strength Spread Tuning

## Goal

Tune the fake content team-strength spread so league tables become more credible while keeping the current scoring calibration.

## Why we implement it this way

The latest scoring rework moved `goals_per_match` to a healthier `2.773` over the deterministic 20-season `calibration-v1` batch. The remaining concern is table hierarchy: a single `demo-001` season can produce a champion with only `61` points over 34 matches, and the batch average first-place points is `66.500`, barely above the current `calibration-v1` minimum of `66.000`.

That points to a soft strong/weak separation rather than a scoring problem. This step should therefore tune fake content strength distribution before touching match algorithms, conversion probabilities, or target bands.

Current reference samples:

- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
  - `goals_per_match`: `2.773` — pass and close to the desired `~2.8`.
  - `first_place_points`: `66.500` — pass but barely above the lower bound.
  - `last_place_points`: `27.450` — pass.
  - `table_points_spread`: `39.050` — pass.
  - `upset_rate`: `0.383` — pass.
- `pnpm cli simulate-season --seed=demo-001`
  - Champion: `61` points from 34 matches.
  - Bottom club: `20` points from 34 matches.
  - Table spread: `41` points.

## What to implement

- Run the current reference commands before changing values and record the baseline.
- Tune only fake content team-strength distribution first:
  - generated player ability ranges;
  - club-to-club strength gradient;
  - lineup/role-weight inputs, only if they are the smallest credible surface.
- Keep the existing match scoring calibration intact:
  - do not change opportunity rates;
  - do not change conversion probabilities;
  - do not change home advantage.
- Prefer changes in `packages/content/src/generators/*` over engine changes.
- Keep the output deterministic for the same seed.
- Add or adjust focused tests only for touched files or changed CLI expectations.
- Record before/after samples in `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change engine algorithms.
- Do not change `calibration-v1` targets unless this step proves the target assumption is wrong and records why.
- Do not change match scoring conversion probabilities unless team-strength spread alone is insufficient and the reason is documented.
- Do not add player scorer attribution, assists, cards, injuries, substitutions, tactics UI, promotions, relegations, playoffs, cups, transfers, economy, facilities, or UI.
- Do not import, scrape, or copy real football datasets.
- Do not use real club, player, competition, stadium, or market identities.

## Allowed dependencies

- `packages/content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared` only if output expectations need focused test updates.
- `packages/simulation-tools -> domain, engine, shared` only if report metrics need a documented adjustment.
- `packages/engine -> domain, shared` only if a focused bug is found and documented before changing engine code.

## Expected files

- `packages/content/src/generators/league-system.ts`
- `packages/content/src/generators/fake-players.ts`
- Relevant focused test files for any touched source file.
- `apps/cli/src/commands/simulate-season.test.ts` only if CLI output expectations change.
- `apps/cli/src/commands/balance-report.test.ts` only if balance-report expectations change.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/content run typecheck`
- Focused Vitest tests for touched content/CLI files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `goals_per_match` remains close to the current scoring calibration and still passes `calibration-v1`.
- First-place points move away from the lower bound without producing an implausibly dominant champion.
- Last-place points, table points spread, and upset proxy remain plausible and pass `calibration-v1`.
- The adopted fake-content strength distribution is documented with before/after samples.
- No engine algorithm changes are made unless config/content-only tuning is documented as insufficient.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only team-strength spread tuning for fake deterministic content. Keep current scoring rates and conversion probabilities unchanged unless the step proves they are insufficient. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

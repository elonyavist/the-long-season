# CLI Fixture Player Stats V2

## Goal

Improve fixture-detail player-stat rendering so the CLI presents the now-complete current stat surface clearly.

## Why we implement it this way

Once per-player shot stats are complete, the CLI fixture detail should become the first reliable manual inspection view for a match. The output should stay compact and terminal-friendly, but it should no longer feel like a debug dump.

This step is presentation-only. It should consume existing season result data, durable reports, and `computePlayerMatchStats`; it should not create stats itself or change match logic.

## What to implement

- Improve the `--fixture=<fixtureId>` player-stat table.
- Include all registered lineup players for both teams if the existing CLI data can provide registrations without changing engine result shape.
- Keep compact columns, for example:
  - player;
  - club;
  - goals;
  - assists;
  - shots;
  - shots on target;
  - saves.
- Keep deterministic ordering:
  - meaningful contribution view if requested by the current code path;
  - stable player ID or lineup order as final tie-breaker.
- Keep event rendering readable and unchanged unless small alignment changes are necessary.
- Add CLI tests for output shape and deterministic ordering.

## What NOT to implement

- Do not add new stats beyond the current supported surface.
- Do not add season assist/save leaderboards; that is the next step.
- Do not add ratings, minutes, substitutions, cards, injuries, fatigue, xG, possession, passes, tackles, fouls, or tactical changes.
- Do not change match simulation, event attribution, calibration, fake content, or engine result semantics unless the current CLI data is insufficient and the step documents why.
- Do not add UI, storage, localization, or commentary prose.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `packages/engine -> domain, shared` only if the CLI needs a tiny exported helper or result shape already justified by this step.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts` only if existing result data is insufficient.
- `packages/engine/src/use-cases/simulate-season.test.ts` only if the use-case result changes.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/engine run typecheck` if engine files are touched.
- Focused Vitest tests for touched CLI/engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --round=1`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Fixture detail shows a readable player-stat table backed by `computePlayerMatchStats`.
- The table reflects complete current goal, assist, shot, shot-on-target, and save counts.
- Output remains deterministic and terminal-readable.
- Existing base season and round views remain stable.
- No new match logic, UI, storage, ratings, or management system is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only fixture player-stat CLI rendering improvements. Do not add new stats, match logic, event attribution, UI, storage, or calibration changes. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

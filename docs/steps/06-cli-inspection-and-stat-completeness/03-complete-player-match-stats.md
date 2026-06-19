# Complete Player Match Stats

## Goal

Update player match-stat derivation so shots and shots on target are counted from all durable shot events, not only goals.

## Why we implement it this way

After shot takers exist on durable shot outcome events, `computePlayerMatchStats` can become a complete source for the current stat surface. This should be a separate step from attribution because it changes derived-stat behavior, not event creation.

The stat helper should remain pure and report-derived. CLI, UI, and future save memory should consume derived rows instead of reparsing events independently.

## What to implement

- Update `computePlayerMatchStats` to count:
  - goals;
  - assists;
  - shots;
  - shots on target;
  - saves.
- Count shots from all durable shot outcome events that identify a shooter.
- Count shots on target from goals and saves, using durable event data.
- Keep saves credited to the defending goalkeeper.
- Preserve explicit zero-stat player registration behavior.
- Preserve deterministic sorting behavior.
- Add tests proving misses, blocks, saves, and goals all affect player shot stats correctly.

## What NOT to implement

- Do not add new event attribution in this step; shooter data must already exist from the previous step.
- Do not add season assist/save leaderboards yet.
- Do not add ratings, minutes played, substitutions, cards, injuries, fatigue, xG, possession, passes, tackles, fouls, or tactical changes.
- Do not change match simulation, scoring, calibration, fake content, or CLI output except if existing tests need fixture updates for the changed stat rows.
- Do not add UI, storage migration, save browsing, localization, or commentary prose.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/engine/src/season-engine/player-match-stats.ts`
- `packages/engine/src/season-engine/player-match-stats.test.ts`
- `apps/cli/src/commands/simulate-season.test.ts` only if CLI expected stat rows need fixture updates.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine/CLI files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `computePlayerMatchStats` derives complete current shot counts from durable match reports.
- Goals, assists, shots, shots on target, and saves are correct for the current durable event contract.
- Zero-stat registrations still work.
- Sorting remains deterministic.
- Existing season goal leaderboard remains correct.
- No ratings, UI, storage migration, or match outcome changes are added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only complete current player match-stat derivation from durable match reports. Do not change match simulation, event attribution, CLI presentation beyond necessary test updates, UI, storage, or calibration. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

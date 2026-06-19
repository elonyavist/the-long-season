# Player Match Stats

## Goal

Derive minimal per-player match statistics from durable match reports, using the event data added so far.

## Why we implement it this way

Season goal totals already exist, but match-level player contribution is still not available as a reusable engine output. After goal scorers, optional assists, and goalkeeper saves are represented in durable events, the engine can derive a compact player match-stat table without changing simulation behavior.

These stats should be derived from reports, not independently simulated. That keeps one source of truth and prepares later CLI, UI, ratings, and save-memory work.

## What to implement

- Add a pure engine helper that derives player match stats from one `MatchReport` plus fixture/team registration data.
- Track only data supported by existing durable events, for example:
  - goals;
  - assists;
  - shots;
  - shots on target;
  - saves.
- Include registered lineup players with zero stats when the helper input provides registrations.
- Sort output deterministically:
  - club side/order if relevant;
  - then meaningful stat order only when requested;
  - stable player ID as final tie-breaker.
- Add tests proving stats are derived from durable events, not from CLI text or engine-local events.

## What NOT to implement

- Do not add player ratings, minutes played, substitutions, fatigue, injuries, cards, fouls, passes, tackles, xG, or possession stats.
- Do not add season assist/save leaderboards yet unless this step explicitly documents a narrow helper needed for the next CLI step.
- Do not change match simulation, scoring, attribution, or calibration.
- Do not add UI, storage migration, save browsing, ticker prose, or localization.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/engine/src/season-engine/player-match-stats.ts`
- `packages/engine/src/season-engine/player-match-stats.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts` only if exposing match stats through the existing season result is necessary for the next CLI step.
- `packages/engine/src/use-cases/simulate-season.test.ts` only if the use-case result changes.
- `packages/engine/src/index.ts` only if the helper must be public.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --round=1`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Player match stats can be derived deterministically from durable match reports.
- Goals, assists, shots, shots on target, and saves are represented only when supported by current events.
- Registered zero-stat players can be included by explicit input.
- Existing season goal leaderboard remains correct.
- No ratings, substitutions, injuries, cards, UI, storage migration, or full duel chain is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only pure player match-stat derivation from durable match reports. Do not change simulation outcomes. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

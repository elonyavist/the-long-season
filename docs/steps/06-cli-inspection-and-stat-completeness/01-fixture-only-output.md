# Fixture Only Output

## Goal

Make `simulate-season --fixture=<fixtureId>` print a clean fixture-detail view without the full final table.

## Why we implement it this way

`simulate-season --fixture=<fixtureId>` currently works, but it prints the complete season table before the fixture detail. That is correct for the base season view and acceptable for `--round`, but it is noisy when the user is inspecting one match.

The narrowest improvement is presentation-only: when a fixture is explicitly requested, the CLI should render a fixture-focused header and the existing structured match detail, reusing the same simulated season result. This keeps the command useful for manual debugging without changing engine behavior or adding a new app surface.

## What to implement

- Adjust `simulate-season --fixture=<fixtureId>` output so it does not print the final table by default.
- Print a compact fixture-detail header, for example:

```txt
The Long Season fixture detail
Seed: demo-001
Fixture: fixture:000001
Competition: Demo Third Division

fixture:000001 PRO04 5-0 PRO18
```

- Keep `simulate-season --seed=<seed>` unchanged.
- Keep `simulate-season --round=<roundNumber>` unchanged unless a tiny parser/rendering adjustment is necessary.
- Reuse the existing single season simulation result; do not simulate a match or season twice.
- Preserve existing event and player-stat detail from Phase 5.
- Add tests proving fixture-only output omits `Final table:` and remains deterministic.

## What NOT to implement

- Do not add shooter attribution, complete player shot stats, assist/save leaderboards, ratings, cards, injuries, substitutions, minutes, xG, possession, or tactical changes.
- Do not add UI, storage browsing, persistence, localization, or commentary prose.
- Do not change match simulation, scoring, attribution, calendar generation, team strength, fake content, or calibration.
- Do not remove the current round output flow.
- Do not add a second simulation path.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- Focused Vitest tests for touched CLI files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --round=1`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `--fixture=<fixtureId>` prints a clean fixture-detail view without the full final table.
- Base season output still prints the final table, top scorer, best defense, and worst attack.
- Round output remains deterministic and readable.
- Fixture detail still includes structured events and player stats.
- Invalid fixture arguments still fail cleanly.
- No engine, domain, content, storage, UI, or simulation behavior changes are introduced.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only the clean fixture-only CLI output for `simulate-season --fixture=<fixtureId>`. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

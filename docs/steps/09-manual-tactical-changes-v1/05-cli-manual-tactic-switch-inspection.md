# CLI Manual Tactic Switch Inspection

## Goal

Expose a CLI inspection path for one fixture with an explicit user-declared tactical switch.

## Why we implement it this way

After the engine supports segmented fixture simulation, the user needs a concrete way to inspect the behavior. The CLI should make the timeline obvious: the manager starts with one saved profile and manually switches to another at a declared minute.

The command should remain a deterministic inspection tool, not a live match UI.

## What to implement

- Add explicit CLI arguments for manual fixture-level tactic switching.
- The command should require a fixture-focused context, for example:
  - `--fixture=<fixtureId>`
  - `--setup-demo=<initialProfile>`
  - `--manual-tactic-switch=<minute>:<profile>`
- Build the selected profiles through the saved tactic demo profile registry.
- Route the switch through the engine segmented fixture simulation path from the previous step.
- Print enough context to verify:
  - selected club;
  - initial profile;
  - manual switch minute and target profile;
  - profile timeline;
  - resulting fixture events and player stats.
- Preserve existing default season output, existing `--fixture` output, and existing setup-demo output when no manual switch is passed.
- Add focused CLI tests for parsing, invalid args, deterministic output, and output changed by the manual switch.

## What NOT to implement

- Do not add automatic tactical decisions based on score, minute, or match context.
- Do not add live interactive input, pause/resume, substitutions, team talks, tactical familiarity, fatigue, morale, injuries, cards, player ratings, possession, xG, UI, persistence, market, economy, staff, youth, facilities, or media.
- Do not add arbitrary tactic knobs in CLI if saved profiles are enough.
- Do not change default fake content, scoring calibration, balance targets, or team-strength formulas.
- Do not store rendered prose in domain events or reports.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `engine -> domain, shared` only if a small public export is needed.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/engine/src/index.ts` only if a public helper/export is needed.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- Focused Vitest tests for touched CLI files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- CLI can inspect one explicit manual tactic switch in one fixture.
- Output clearly shows that the user/caller selected the switch minute and target profile.
- Default season and fixture outputs remain available and deterministic.
- No automatic tactical decision system exists.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.
- Phase 09 can be closed or explicitly reworked before Phase 10 is documented.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the CLI inspection path for one explicit manual tactic switch. Do not add automatic tactical AI or live match sessions. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect in the CLI output, and stop.

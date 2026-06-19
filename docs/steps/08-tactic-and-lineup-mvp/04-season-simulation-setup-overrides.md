# Season Simulation Setup Overrides

## Goal

Allow deterministic season simulation to use caller-provided lineup/tactic setup overrides for selected clubs.

## Why we implement it this way

The builder step proves one selected setup can become a team context. This step wires that capability into the season use-case so a caller can simulate the same season with a changed setup for one or more clubs.

This is the first point where output may change. The implementation should prove the change is caused by the explicit setup override, not by hidden RNG drift or content mutation.

## What to implement

- Extend `simulateSeason` input with optional setup overrides keyed by stable club ID or explicit ordered override entries.
- Apply overrides when building match team contexts for fixtures.
- Keep default behavior unchanged when no override is provided.
- Ensure setup override order is explicit and deterministic.
- Add tests proving:
  - no override preserves existing default output;
  - one club override changes that club's lineup/tactical inputs deterministically;
  - invalid overrides fail clearly;
  - repeated runs with the same override produce identical output.
- Run CLI/balance checks to document observed impact.

## What NOT to implement

- Do not add CLI arguments in this step.
- Do not implement formation UI, live match commands, substitutions, player state costs, fatigue, morale, training, tactical familiarity, market, economy, persistence, or web/desktop code.
- Do not tune scoring rates, conversion bands, fake content, calibration targets, or role-weight formulas.
- Do not mutate content lineups or generated players.
- Do not add a career/run state.

## Allowed dependencies

- `engine -> domain, shared`
- `content -> domain, shared` only through existing test fixtures if needed.

## Expected files

- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/engine/src/index.ts`
- `packages/engine/src/match-engine/tactic-team-context.ts` only if integration requires a small builder refinement.
- `packages/engine/src/match-engine/tactic-team-context.test.ts` only if builder behavior changes.
- `docs/PROJECT_STATUS.md`
- `docs/steps/08-tactic-and-lineup-mvp/05-cli-tactic-lineup-inspection.md` only if CLI assumptions change.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `simulateSeason` supports explicit setup overrides without changing default behavior.
- Same seed plus same setup override is deterministic.
- Invalid overrides fail clearly.
- Balance report still passes or a blocker is documented.
- `docs/PROJECT_STATUS.md` records observed output impact and next action.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Wire selected setup overrides into `simulateSeason` only. Do not add CLI arguments or new gameplay systems. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what output changed, and stop.

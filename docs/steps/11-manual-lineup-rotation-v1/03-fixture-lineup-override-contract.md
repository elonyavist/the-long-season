# Fixture Lineup Override Contract

## Goal

Define the engine contract for applying an explicit user-selected lineup to one fixture.

## Why we implement it this way

The manager must be able to say: "for this fixture, use this lineup." The engine should not decide why the lineup was selected. It should only validate and apply the caller's explicit intent.

This step creates the narrow contract before wiring it through a full season. Keeping the contract engine-owned prevents CLI profile details from leaking into simulation internals.

## What to implement

- Add a narrow engine input contract for explicit fixture lineup overrides.
- The contract should identify:
  - fixture ID or fixture scope;
  - club ID whose lineup is overridden;
  - ordered lineup slots;
  - player lookup, role weights, and state curves needed to rebuild team context.
- Validate clearly:
  - missing fixture/team;
  - duplicate override for the same fixture/club;
  - wrong club for the fixture;
  - invalid lineup/player/role data.
- Keep the contract deterministic and serializable.
- Add focused engine tests for:
  - valid explicit override shape;
  - duplicate override rejection;
  - missing or invalid club/fixture rejection;
  - default no-override behavior unchanged.
- Document exported functions/types with TSDoc/JSDoc so a junior developer can understand the contract.

## What NOT to implement

- Do not wire the contract into full season simulation yet unless the step defines only a minimal internal helper required by tests.
- Do not add CLI options in this step.
- Do not implement automatic lineup selection or fatigue-aware recommendations.
- Do not add substitutions, bench events, injuries, suspensions, morale, form, training, UI, persistence, or career saves.
- Do not change match engine algorithms, scoring calibration, or fitness rules.
- Do not keep compatibility helpers without active callers or a documented short-term removal path.

## Allowed dependencies

- `engine -> domain, shared`

## Expected files

- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/engine/src/index.ts` only if a new public contract/export is needed.
- `docs/PROJECT_STATUS.md`
- `docs/steps/11-manual-lineup-rotation-v1/04-season-lineup-overrides.md` only if a lesson learned changes the next step.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Engine has a narrow, tested, explicit fixture lineup override contract.
- Default no-override season behavior remains unchanged.
- The contract represents user intent and does not contain automatic selection logic.
- Code is clear, typed, documented where useful, and has no unused helpers.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the engine contract needed for explicit fixture lineup overrides. Do not add CLI options or automatic lineup selection. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me whether default season output changed, and stop.

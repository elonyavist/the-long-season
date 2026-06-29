# 03 - Engine Advance Career Season Module

## Goal

Implement the canonical engine Module for season advancement using the contract from step 02.

This Module must orchestrate existing engine functions. It must not become a place for unrelated gameplay tuning.

## Expected files

- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/index.ts`
- `docs/audits/CAREER_ADVANCEMENT_INTERFACE_CONTRACT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Add the canonical season advancement Module.
2. Export the public Interface from `packages/engine/src/index.ts`.
3. Reuse existing engine helpers for:
   - fixture result application, if needed by current scope;
   - season rollover;
   - player development and aging;
   - player exits;
   - youth lifecycle and intake;
   - youth promotion;
   - squad maintenance;
   - transfer turnover.
4. Keep the Module pure from adapter concerns:
   - no file system access;
   - no CLI formatting;
   - no localization strings;
   - no React/web code.
5. Return structured facts describing what changed.
6. Use copy-on-write or equivalent defensive state handling so tests can prove the input is not mutated accidentally.
7. Add deterministic unit tests for:
   - same seed and same input produce the same output;
   - input state is not mutated;
   - invalid state returns a blocked/invalid result instead of partial advancement;
   - existing advancement subsystems are called in the documented order.

## What NOT to implement

- Do not change gameplay formulas unless required to preserve current behavior.
- Do not tune development, exits, transfers, youth generation, or squad maintenance.
- Do not change save schema.
- Do not add UI.
- Do not add CLI output in the engine.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts
pnpm --filter @game/engine run typecheck
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- active step path;
- implemented Module path;
- exported Interface;
- test result;
- any behavior intentionally preserved from the previous paths.

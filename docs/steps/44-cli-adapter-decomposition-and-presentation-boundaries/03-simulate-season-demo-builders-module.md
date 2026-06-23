# 03 - Simulate Season Demo Builders Module

## Goal

Move simulate-season demo builders out of the command adapter.

The current command supports many deterministic inspection profiles:

- setup demo;
- manual tactic switch;
- condition demo;
- lineup demo;
- market demo profile selection glue where still local to the command.

These are useful CLI labs, but they should not make the command entry point hard
to follow.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- new or existing file under `apps/cli/src/commands/simulate-season/`
- `apps/cli/src/commands/simulate-season/profile-keys.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `docs/audits/CLI_SIMULATE_SEASON_DECOMPOSITION_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read the Step 01 audit and Step 02 outcome.
- Extract demo construction into a named module, likely
  `demo-builders.ts` or smaller modules if the audit proves that is clearer.
- Preserve current profile keys and validation behavior.
- Preserve current setup/lineup/condition/manual-switch behavior.
- Keep user choice explicit:
  - no automatic lineup selection;
  - no automatic tactic switching based on score/minute;
  - no transfer or market recommendation behavior.
- Remove old local helper functions from `simulate-season.ts` when they become
  unused.
- Add useful TSDoc to extracted exported functions/types.

## What NOT to implement

- Do not add new demo profiles.
- Do not change existing profile definitions.
- Do not change fixture applicability rules.
- Do not change condition lifecycle rules.
- Do not move these demo builders into engine/content.
- Do not leave duplicate builder paths.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --condition-demo=pro01-season`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000003 --lineup-demo=pro01-rotated`
- `pnpm cli simulate-season --seed=world-a --setup-demo=pro01-balanced`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000003 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `git diff --check`

## Definition of Done

- Demo construction has a clear CLI module.
- `simulate-season.ts` reads as dispatch/composition rather than profile
  implementation.
- Current demo output and behavior remain stable.
- No duplicate or dead demo helpers remain.
- `docs/PROJECT_STATUS.md` points to Step 04 as the next active step.

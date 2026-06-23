# 03 - Career Advancement Deep Module

## Goal

Make career matchday advancement easier to follow by putting the core sequence behind one clear engine entry point or by documenting why the existing entry point is already sufficient.

The target is readability and sequencing safety:

1. find next selected-club fixture;
2. apply date-based recovery before the match;
3. require saved manager preparation;
4. build match contexts;
5. simulate fixture;
6. persist result into career state;
7. apply matchday condition consequences;
8. retarget or clear match preparation.

## Expected files

- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/progress-fixture.test.ts`
- optional new private helper under `packages/engine/src/career/`
- `packages/engine/src/index.ts`
- focused engine tests for touched files
- `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Read `docs/audits/ARCHITECTURE_PUBLIC_INTERFACE_REVIEW.md`.
- Inspect current career advancement code:
  - `packages/engine/src/career/progress-fixture.ts`
  - `packages/engine/src/career/next-fixture.ts`
  - `packages/engine/src/career/career-weekly-recovery.ts`
  - `packages/engine/src/career/career-condition-consequences.ts`
  - `apps/cli/src/commands/career/progression.ts`
- Identify the current public entry point used by CLI.
- If the sequence is already well-contained, improve names/comments/tests only.
- If the sequence is spread across CLI and engine, move only core deterministic sequencing into engine.
- Preserve package rules:
  - engine must not import content;
  - engine must not import storage;
  - engine must not import i18n;
  - engine must not import CLI.
- Keep content/config inputs caller-supplied.
- Keep return values structured and language-agnostic.
- Add TSDoc to any new exported function/type explaining:
  - when it is called;
  - what it mutates by copy;
  - what it refuses to do;
  - what the caller still owns.
- Remove redundant helpers if they become unused inside the step scope.
- Add focused tests that show the intended flow is traceable from one entry point.

## What NOT to implement

- Do not add UI.
- Do not add automatic lineup selection.
- Do not add tactical advice.
- Do not tune recovery, condition, scoring, or table balance.
- Do not create a new application package.
- Do not move storage or content into engine.
- Do not keep old wrappers without active callers.
- Do not broaden the scope into season rollover, market, youth, or player development.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts packages/engine/src/career/career-weekly-recovery.test.ts packages/engine/src/career/career-condition-consequences.test.ts`
- `pnpm check`
- `pnpm cli career --save=phase43-career --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase43-career --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase43-career --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase43-career --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase43-career --summary`
- `git diff --check`

## Definition of Done

- Career advancement has one obvious engine entry point for the current playable loop.
- A junior developer can follow the flow from the entry point through recovery, match simulation, condition spend, and preparation retargeting.
- Existing CLI behavior is preserved unless a documented bug is fixed.
- No forbidden dependency direction is introduced.
- `docs/PROJECT_STATUS.md` points to Step 04 as the next active step.

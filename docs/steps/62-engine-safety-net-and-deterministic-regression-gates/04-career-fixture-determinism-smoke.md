# Step 04 - Career Fixture Determinism Smoke

## Goal

Add a regression smoke around current career fixture progression so Phase 63 and
Phase 64 have a baseline before changing career orchestration and player-state
consequences.

## Expected files

- `packages/engine/src/career/progress-fixture.test.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/audits/ENGINE_SAFETY_NET_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Add or extend engine-level tests proving that progressing the same prepared
  fixture from the same state gives the same result and condition consequences.
- Add CLI smoke coverage only if the current CLI composition is the easiest
  place to prove save-driven repeatability.
- Pin structured facts:
  - fixture result;
  - report/event count where useful;
  - selected-club condition delta summary;
  - next current date or fixture status if already exposed.
- Keep the test focused on current behavior. Phase 63 will replace or deepen
  season advancement; this step only protects fixture progression.

## What NOT to implement

- Do not implement `advanceCareerOneSeason`.
- Do not add form/morale consequences.
- Do not add web persistence.
- Do not change career save schema.
- Do not add new CLI output unless a test needs an existing structured field.

## Required checks

```sh
nvm use 24
pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
git diff --check
```

## Definition of Done

- Current career fixture progression has deterministic repeat evidence.
- The smoke protects the manager-facing loop from accidental fixture or
  condition drift.
- Any CLI coverage remains Adapter-level and does not own engine rules.
- `docs/PROJECT_STATUS.md` records the adopted test surface.


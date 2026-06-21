# Step 06 - Durable Decision Continuity

## Goal

Prove that at least one manual user decision persists across career advancement.

## Context

The playable loop is only meaningful if decisions survive time passing. The safest first proof is an already-supported durable action, such as an accepted permanent transfer applied to a career save.

## Expected files

- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/career/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Use an existing supported manual action, preferably `--apply-market-demo=<profile>`, as the continuity proof.
- Verify the changed roster/budget is visible before advancing.
- Advance the next selected-club fixture.
- Verify the changed roster/budget remains visible after reload.
- Keep the check deterministic and focused.

## What NOT to implement

- Do not add a general market search UI.
- Do not add contract/wage negotiations.
- Do not add automatic transfer activity.
- Do not add new tactical or lineup persistence unless it is already documented as available and necessary.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- focused career CLI tests
- career CLI smoke covering create, apply transfer, summary, advance, inspect
- `pnpm check`

## Definition of Done

- A manual durable decision remains visible after career progression.
- The proof is automated by tests and demonstrated by CLI smoke commands.

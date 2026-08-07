# Step 08 - Squad Identity And Lateral Execution

## Status

Not started; requires Step 07 Done.

## Rescoped By Checkpoint A

**Squad generation left this step.** Checkpoint A falsified the mechanism this
step was written for: there are no ties for squad identity to break
(`tieDecidedShare` `0.0000`). Generating squad identities moved ahead to Step
03A, because every checkpoint after it would otherwise take its before-state on
a population already known to be broken.

What stays here is lateral execution, which genuinely depends on Step 05's
`lateralFocus` and Step 07's per-task execution and cannot move. **Do not
re-implement squad generation here.**

## Goal

Give generated clubs different football identities so AI formation follows
their players, while real executors determine the cost of lateral commitment.

## What To Implement

- Before changing generation, preregister in the Checkpoint C template the
  numeric relative targets for tie reduction, formation concentration, club
  stability and coverage warning deltas against Checkpoint A. Never choose them
  after seeing Step 08 output.
- Replace the single slot skeleton with deterministic budgeted squad archetypes.
- Make all ten primary roles reachable across real generated worlds without
  requiring every squad to contain all ten.
- Keep roster size, division quality, rarity budgets, and exceptional-player
  invariants unchanged.
- Let `strongestCatalogShape(...)` choose from actual fit; a declared football
  discriminator followed by canonical formation ID breaks a genuine tie, never
  catalog order.
- Consume Step 05 lateral focus through Step 07 task execution; do not add a
  second lateral field to formations or roles.
- Add reorder invariance and mirrored-player counterfactual tests.

## Expected Files

- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/player-role-identity.ts`
- `packages/content/src/generators/player-role-identity.test.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`
- `packages/engine/src/career/career-ai-team-selection.ts`
- `packages/engine/src/match-engine/tactical-task-execution.ts`
- `packages/engine/src/match-engine/opportunity-route.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `09-checkpoint-c-player-context.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/fake-players.test.ts
pnpm exec vitest run packages/content/src/generators/player-generation-quality.test.ts
pnpm exec vitest run packages/engine/src/team-selection/ai-squad-selection.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

Role and formation variety is caused by player fit rather than catalog order,
reordering the catalog changes no selection, lateral mirroring reverses the
expected side, existing generation-quality gates pass, and Step 09 is next.

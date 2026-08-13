# Step 08 - Squad Identity And Lateral Execution

## Status

Done: lateral player execution is canonical without another production field;
B2 remains `REFINE`. Step 09 is next.

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

- Keep Step 03A/A2 squad generation, ten-role reachability and formation
  selection unchanged; they are complete and must not be duplicated.
- Consume Step 05 lateral focus through Step 07 task execution; do not add a
  second lateral field to formations or roles.
- Add reorder invariance and mirrored-player counterfactual tests.

## Expected Files

- `packages/engine/src/match-engine/tactical-shape.test.ts`; prove swapping
  real player quality across a symmetric XI mirrors lateral execution;
- `packages/engine/src/match-engine/opportunity-route.test.ts`; prove the
  correct focus follows own execution and opponent weakness, then reverses
  under a complete mirror;
- `apps/cli/src/commands/simulation-report/tactical-agency-world.test.ts` only
  if the production-world reachability proof needs an additional causal row;
- `docs/audits/PHASE_81A_LATERAL_PLAYER_EXECUTION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`
- this step document
- `09-checkpoint-c-player-context.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/tactical-shape.test.ts
pnpm exec vitest run packages/engine/src/match-engine/opportunity-route.test.ts
pnpm cli simulation-report --profile=phase81a-b2-downstream-replication \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-b2-lateral-player-execution.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

Role and formation variety is caused by player fit rather than catalog order,
reordering the catalog changes no selection, lateral mirroring reverses the
expected side, existing generation-quality gates pass, and Step 09 is next.

## Result

Production already contains the complete chain after Step 07: real attributes
derive task execution, formation sides split those contributions into lateral
capacities, and `lateralFocus` reallocates the conserved route budget against
opponent coverage. A second multiplier would be duplicate football.

New causal tests prove that swapping player quality across a symmetric XI
mirrors capacities and reverses the productive focus when the opponent weakness
is mirrored. All `53` focused tests pass. The seven-worker B2 rerun is
semantically byte-identical to Step 07 after normalizing only hash and elapsed
metadata, and correctly stays `REFINE`. Step 09 is the only next action.

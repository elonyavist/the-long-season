# Step 06 - Checkpoint B: Structural Counter-Move Ceiling

## Status

**Closed.** Requires Steps 04-05 Done **and** the Step 05 exit run to restore
`concededExpectedGoalsReduction >= 0.08` and
`ownLossPerConcededReduction <= 2.0` on both A2 seed sets. Checkpoint A2's
conditional `GO` does not authorize this step by itself.

## Goal

Prove the model contains stable non-transitive Leverage before player-task,
manager, AI, or UI work begins.

## Analytic Gate

On the complete strategic-signature matrix:

- group only complete basis-point-identical signatures;
- freeze the normalized facts, scale/clamp rule, tie-breaks and material-arc
  threshold before reading matrix outcomes; none may use win share or best
  response identity;
- enumerate all effective contexts and cycles above that material threshold;
- require `R / N_eff >= 0.25`;
- require `best_response_ubiquity_multiple <= 4`;
- preserve all three original `no_dominant_*` readers and `0.55`;
- require at least one material cycle that survives the declared tactic
  variants and no analytically dominant row;
- report both tangent quantities when either fails.

## Cross-Validated Replay

Select at most `32` deterministic stratified contexts from signature distance,
covering every lateral focus and tactic profile. Freeze IDs and weights before
Monte Carlo. An explicit oracle selects best, exposed, and context-free policy
on one stream; an independent stream replays them.

Both the complete analytic enumeration and the replay are deterministically
sharded across exactly `7` workers inside this single isolated gate.

Targets:

- `counter_move_ceiling >= +0.045`;
- `counter_move_exposure <= -0.045`;
- context-free `|delta| <= 0.015` with interval compatible with zero.

The oracle measures model ceiling, never manager agency.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_B_STRUCTURAL_CEILING.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `07-player-task-execution.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b --workers=7
pnpm check
git diff --check
```

## Decision

GO opens Step 07. REFINE reopens only 04/05 without moving targets. STOP keeps
all downstream steps closed when the matrix remains transitively dominant or
the replay gain exists only on selection seeds.

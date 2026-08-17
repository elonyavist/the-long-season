# Step 12G - Route/Task Plan Execution Contract

## Status

**Done.** Amendment A10 freezes the route/task-quality mechanism, `300 bp`
bound and fresh G/H checkpoint before production code.

## Goal

Turn option B's named own-squad plan into route-specific execution rather than
a generic volume or strength bonus.

## Frozen Implementation

1. Carry an optional stable own-squad profile key with named match tactics;
   absence permanently means free-form/manual and remains bit-identical.
2. Extract the selector's capacity standardization into one pure engine module.
3. Derive attack and defence execution per canonical route directly from
   `TACTICAL_ROUTE_DEFINITION` and the versioned profile demand.
4. Centre every edge on `balanced`, clamp each side to `[-1,1]`, and add only
   `(attack - defence) * 300 bp` to the selected route's chance-quality edge.
5. Advance match-tactics content to v12/schema 10. Beta saves receive no
   compatibility reader or migration.
6. Add one locked G/H profile to `simulation-report`; remove it if rejected.

## What NOT To Implement

- opportunity-volume, control, team-strength or actor-quality multipliers;
- opponent facts in selection, result estimates or inferred profile identity;
- duplicated route/capacity mappings, precomputed fit fields or persisted edges;
- coefficient sweeps, target changes or another candidate after output;
- Step 13 chapters, preparation persistence or renewal claims.

## Expected Files

- `docs/audits/PHASE_81A_ROUTE_TASK_EXECUTION_AMENDMENT.md` **(new)**
- this step document
- `12h-route-task-plan-execution-and-checkpoint.md` **(new)**
- the phase `README.md`
- `docs/PROJECT_STATUS.md`
- `13-tactical-chapters-and-canonical-explanation.md`

## Required Checks

```bash
nvm use 24.19.0
git diff --check
```

## Definition Of Done

Formula, coefficient, derived capacity sets, neutral semantics, fresh population,
unchanged product bands and rejection rule are frozen before code.

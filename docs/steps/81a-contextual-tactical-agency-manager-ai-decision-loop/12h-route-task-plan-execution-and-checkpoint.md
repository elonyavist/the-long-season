# Step 12H - Route/Task Plan Execution And Checkpoint

## Status

**Ready.** Step 12G froze Amendment A10 before implementation.

## Goal

Implement the single route/task execution derivation and decide it on fresh G/H
populations without changing the frozen product target.

## What To Implement

- Carry the stable named profile key to match context; keep absent/manual exact.
- Share capacity standardization between selector and match.
- Derive route attack/defence execution from the canonical route definition and
  add its bounded edge only to selected-route chance quality.
- Validate every profile's derived attack/defence demand reachability.
- Add the locked G/H profile and report all point, xG, structural, replay and
  reachability facts.
- On GO retain the mechanism and open Step 13. On STOP remove the whole
  candidate and record the product failure; no dead profile or code remains.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/own-squad-plan-execution.ts` **(new)**
- `packages/engine/src/match-engine/own-squad-plan-execution.test.ts` **(new)**
- `packages/engine/src/match-engine/opportunity-route.ts`
- `packages/engine/src/match-engine/opportunity-route.test.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts`
- `packages/engine/src/team-selection/own-squad-tactical-policy.ts`
- `packages/engine/src/team-selection/own-squad-tactical-policy.test.ts`
- `packages/engine/src/career/career-ai-team-selection.ts`
- `packages/engine/src/career/career-ai-team-selection.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`
- `apps/cli/src/commands/simulation-report/own-squad-agency-section.ts`
- `apps/cli/src/commands/simulation-report/own-squad-agency-section.test.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/audits/PHASE_81A_ROUTE_TASK_EXECUTION.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `13-tactical-chapters-and-canonical-explanation.md`

## Required Checks

```bash
nvm use 24.16.0
pnpm exec vitest run \
  packages/domain/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/balance/match-tactics-calibration.test.ts \
  packages/engine/src/match-engine/own-squad-plan-execution.test.ts \
  packages/engine/src/match-engine/opportunity-route.test.ts \
  packages/engine/src/match-engine/step-match.test.ts \
  packages/engine/src/team-selection/own-squad-tactical-policy.test.ts \
  packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.test.ts \
  apps/cli/src/commands/simulation-report/own-squad-agency-section.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm cli simulation-report \
  --profile=phase81a-route-task-execution \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-route-task-execution.json
pnpm check
git diff --check
graphify update .
```

Run the fresh checkpoint and `pnpm check` separately.

## Definition Of Done

The named plan reaches selected-route quality through one canonical derivation;
manual/non-commit replay stays exact; positive and negative route edges are
reachable; G/H decide independently; and the final tree contains no rejected
candidate residue.

# Step 12H - Route/Task Plan Execution And Checkpoint

## Status

**Done: `STOP / RETHINK`.** Both fresh sets missed the frozen point magnitude;
the entire candidate was removed and shipped match tactics remain v11/schema 9.
The user then selected the smaller own-squad MVP as product option B. Step 12I
owns that explicit product amendment before Step 13 may open.

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
- `packages/engine/src/team-selection/ai-in-game-decisions.ts`. A lineup-only
  rebuild must retain the named plan, while an explicit live tactic change must
  become free-form; otherwise automatic substitutions silently disable the plan.
- `packages/engine/src/team-selection/ai-in-game-decisions.test.ts`
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
- `docs/audits/PHASE_81A_MVP_AGENCY_ACCEPTANCE_AMENDMENT.md` **(new)**. The
  rejected checkpoint forces the product boundary; this records the user's
  option-B decision without recasting the red gate as green.
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `12i-own-squad-mvp-acceptance.md` **(new)**
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

## Outcome

The checkpoint ran alone with exactly seven workers for `774,654 ms`, wrote
`simulation-out/phase81a-route-task-execution.json` with report hash
`a7e6c3b21d51889120c186529a76cd71`, and exited `1`.

| set | own-fit points | mismatch points | spread | own-fit net xG | mismatch net xG |
|---|---:|---:|---:|---:|---:|
| G | +1.0446 | +0.0960 | 0.9487 | +1.1289 | -0.5787 |
| H | +0.9353 | -0.1429 | 1.0781 | +1.3365 | -0.4192 |
| frozen target | +1.5..+6.0 | -6.0..-1.5 | >=3.0 | positive interval | negative interval |

The xG intervals exclude zero in the intended opposite directions, goal
difference moves materially, blind and non-commit remain neutral, replay is
exact, both route-edge signs are reachable, and every structural guardrail
holds. Points remain too small in both independent sets. `balanced` is absent
from canonical selections in both sets and `high_press` is absent in H, so the
fresh-population reachability reader is red as declared.

The `300 bp` coefficient was not raised, the target was not moved, and no third
candidate was introduced. Match context, calibration, report profile, labels,
tests and route/task execution code were all removed in the same step.

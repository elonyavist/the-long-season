# Step 12F - Canonical Own-Squad Plan Execution

## Status

**Done — `REFINE`; candidate rejected and removed.** The bounded link moved
canonical xG and goals in the intended directions but missed every frozen
season-point magnitude in both fresh sets. Step 13 stays closed on a product
decision; v11 remains the only shipped match-tactics content.

## Goal

Make the named own-squad plan a canonical match input, derive its execution
edge once from the current shape and versioned demands, and validate that right
and wrong choices translate in opposite xG and point directions.

## What To Implement

- Extend `MatchTacticalDistributionInput` with an optional stable own-squad
  profile key. Absence permanently means free-form/manual instructions, not a
  compatibility fallback.
- Named candidates attach their own profile key; free-form callers remain
  byte-identical.
- Extract complete-policy fit into one engine derivation shared by the selector
  and match. The match rederives chosen-minus-non-commit edge from shape,
  profile key, lateral focus and versioned content.
- Apply Step 12E's clamped `750`-basis-point edge only to the own opportunity-
  volume multiplier. Keep route conservation, exposure, strength and RNG order
  unchanged.
- Advance match-tactics schema to 10 and content to v12. Beta saves receive no
  migration, dual reader or compatibility default.
- Add fresh E/F profile execution through `simulation-report`; retain D2-C/D2-D
  as historical attribution only.

## What NOT To Implement

- opponent reads, result estimates, a precomputed fit field, inferred profile
  identity from slider equality, a strength multiplier or a hidden mismatch
  penalty;
- coefficient sweeps or a second candidate after output;
- historical career replay, renewal claims, Step 13 chapters or persistence
  schema work.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/own-squad-plan-fit.ts` **(new)**
- `packages/engine/src/match-engine/own-squad-plan-fit.test.ts` **(new)**
- `packages/engine/src/match-engine/opportunity-route.ts`
- `packages/engine/src/match-engine/opportunity-route.test.ts`
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
- `docs/audits/PHASE_81A_OWN_SQUAD_PLAN_EXECUTION.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `13-tactical-chapters-and-canonical-explanation.md`

## Required Checks

```bash
nvm use 24.16.0
pnpm exec vitest run \
  packages/engine/src/match-engine/own-squad-plan-fit.test.ts \
  packages/engine/src/match-engine/opportunity-route.test.ts \
  packages/engine/src/team-selection/own-squad-tactical-policy.test.ts \
  packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.test.ts \
  apps/cli/src/commands/simulation-report/own-squad-agency-section.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm cli simulation-report \
  --profile=phase81a-own-squad-plan-execution \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-own-squad-plan-execution.json
pnpm check
git diff --check
graphify update .
```

The targeted suite was green on the candidate before the fresh checkpoint ran.
The checkpoint and final-tree `pnpm check` ran separately. The profile command
is intentionally no longer runnable after rejection: its report is retained as
the immutable local artifact and summarized in
`PHASE_81A_OWN_SQUAD_PLAN_EXECUTION.md`; keeping a dead profile just to replay
a rejected model would violate the no-residue rule.

## Outcome

The fresh E/F population ran for `756,363 ms` on exactly seven workers and
wrote report hash `f748cfd6fb2cba6a0f18dfb4037caa08`.

| set | own-fit points | mismatch points | spread | own-fit xG | mismatch xG |
|---|---:|---:|---:|---:|---:|
| E | +0.3571 | -0.8259 | 1.1830 | +1.1399 | -1.0549 |
| F | +0.5580 | -0.2299 | 0.7879 | +1.0134 | -0.9535 |
| target | +1.5..+6.0 | -6.0..-1.5 | >=3.0 | directional | directional |

Goal difference also moves significantly in the intended direction in all four
arms, but the point effects and spreads remain below their frozen bands.
`goal_to_points_resolution` is the first failed translation reader in both
sets. Step 06C13 already rejected reducing coherent football variance, so that
label does not authorize a resolver change.

The candidate reached positive and negative execution edges `1,904` times
each, preserved non-commit replay exactly and retained all structural
guardrails. It was then removed in full: no schema v10, content v12, plan key,
volume multiplier, report profile, label, fixture or orphaned test remains.

Final-tree verification on Node `24.16.0`: `pnpm check` exited `0` with
`317` test files and `2,540` tests green, `902` modules free of dependency
violations, all four custom checks green and all workspace typechecks green.
`git diff --check` is clean, `PROJECT_STATUS.md` is exactly `300` lines and
`graphify update .` rebuilt the code-only graph after candidate removal.

The recommended product branch is to keep the meaningful point floor and design
a route/task-quality execution mechanism rather than increase the frozen
`750 bp` generic-volume coefficient. That is new product scope and requires an
explicit amendment before implementation.

## Definition Of Done

Both fresh sets decide independently under the frozen Step 12E rule; rejection
leaves the pre-step product bit-identical and no candidate residue remains. The
audit records the measured mechanism, failure and next product decision without
moving a coefficient or post-output target.

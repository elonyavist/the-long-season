# Step 12F - Canonical Own-Squad Plan Execution

## Status

**Ready.** Step 12E froze the bounded link and fresh verification population.

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
- `packages/engine/src/team-selection/own-squad-tactical-policy.ts`
- `packages/engine/src/team-selection/own-squad-tactical-policy.test.ts`
- `packages/engine/src/career/career-ai-team-selection.ts`
- `packages/engine/src/career/career-ai-team-selection.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
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

Run the fresh checkpoint and `pnpm check` separately.

## Definition Of Done

One profile identity and one fit derivation reach selection and match; free-form
and non-commit controls are bit-identical; positive and negative edges are
reachable on generated players; both fresh sets decide independently under the
frozen Step 12E rule; no dead old derivation remains.

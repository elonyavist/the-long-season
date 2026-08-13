# Step 10 - Manager Own-Squad Tactical Read

## Status

**Done.** This replaces the obsolete opponent-read step. Read
production before editing: the manager already has a canonical shape/tactic
consequence chain, so this step hardens that owner rather than creating a new
read model.

## Goal

Give the manager an honest, responsive reading of what the selected players,
roles, formation and currently configured fitness effect can execute before
kickoff, without opponent facts, hidden simulation or an optimal-command label.

## Production Truth To Preserve

`matchPreparationShapeReading(...)` builds the exact board XI through
`deriveTeamShapeAndStrength(...)`, including the shipped fitness-multiplier curve,
then normalizes its twelve canonical capacities against the ordinary reference.
`TacticalConsequenceReading` carries that engine fact and the selected tactic;
`buildTacticalConsequenceView(...)` derives at most three qualitative exposures,
overloads or emphases. The UI never recomputes a capacity and never ranks a
formation.

## What To Implement

- Keep `TacticalConsequenceReading` as the single manager read. Do not add an
  `OwnSquadRead` containing the same capacities under another name.
- Prove changing fitness through real `PlayerDynamicState` changes the same
  reading, while identical board/player facts reproduce it exactly.
- Preserve the production truth that form and morale are structurally supported
  by `PlayerStateMultiplierCurves` but deliberately neutral in shipped content.
  Activating them here without a frozen effect calibration would silently tune
  every match. This read must follow configured engine truth, not invent a UI-
  only consequence. Step 11 may consume only active state effects; form/morale
  activation needs its own calibrated gameplay step.
- Prove changing only opponent identity, formation or tactic cannot move the
  read because none is an input.
- Prove changing only the selected tactic changes tactic consequences but not
  the twelve player/shape capacities.
- Keep incomplete lineups as `not_observed` (`undefined`), never neutral or
  defaulted.
- Verify every qualitative consequence remains reachable on generated players
  through the existing real-data sweep. A new message requires a real reachable
  input before closeout.
- Keep the existing preparation UI localized and responsive. It shows facts and
  trade-offs, not "best", expected points or the AI's eventual fit score.
- Do not add `lateralFocus` persistence or change save/schema/envelope versions;
  Step 14 owns the single integration. The manager proxy in Checkpoint D can
  evaluate the in-memory focus vocabulary without pretending it is already a
  durable screen choice.

## Expected Files

- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `packages/ui/src/career/tactical-consequence-view.test.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`. The required full visual
  gate exposed a stale Market assumption from the already-shipped population:
  its unfiltered first page no longer guarantees an empty rating star. The test
  must select the real third-division population before checking that state;
  skipping the absent locator would make the contrast gate vacuous.
- `docs/PROJECT_STATUS.md`
- this step document
- `11-ai-own-squad-and-live-state-policy.md`

Production files may be added only if a failing test proves the existing chain
does not satisfy the contract; the ownership account must be written here first.
The focused test did instead expose a false premise in the original step:
normal content configures only fitness. The document and tests now pin that
truth rather than introducing uncalibrated form/morale multipliers.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  apps/web/src/features/match-preparation/match-preparation-adapter.test.ts \
  packages/ui/src/career/tactical-consequence-view.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

The read is canonical, opponent-free, sensitive to configured state,
deterministic,
not-observed when incomplete and free of recommendations; all real-data
reachability and product UI gates pass, persistence is untouched, and Step 11
is next.

## Outcome

- The canonical chain needed no production change and no second read model.
- Focused tests prove fitness sensitivity, deterministic replay, opponent-state
  invariance, tactic/shape isolation, incomplete-lineup `not_observed`, real-
  data reachability and qualitative output with no score or recommendation.
- The test-first pass found and corrected one false premise: shipped content
  configures fitness only. Raw form and morale remain neutral despite the
  engine's prepared curve seam; activating them is gameplay calibration, not
  presentation work.
- Step 11 is open and may optimize only effects the match actually consumes.

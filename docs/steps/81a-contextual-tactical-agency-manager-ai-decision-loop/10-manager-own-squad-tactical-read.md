# Step 10 - Manager Own-Squad Tactical Read

## Status

Ready after Amendment A7. This replaces the obsolete opponent-read step. Read
production before editing: the manager already has a canonical shape/tactic
consequence chain, so this step hardens that owner rather than creating a new
read model.

## Goal

Give the manager an honest, responsive reading of what the selected players,
roles, formation, current fitness, form and morale can execute before kickoff,
without opponent facts, hidden simulation or an optimal-command label.

## Production Truth To Preserve

`matchPreparationShapeReading(...)` builds the exact board XI through
`deriveTeamShapeAndStrength(...)`, including the shipped state-multiplier curves,
then normalizes its twelve canonical capacities against the ordinary reference.
`TacticalConsequenceReading` carries that engine fact and the selected tactic;
`buildTacticalConsequenceView(...)` derives at most three qualitative exposures,
overloads or emphases. The UI never recomputes a capacity and never ranks a
formation.

## What To Implement

- Keep `TacticalConsequenceReading` as the single manager read. Do not add an
  `OwnSquadRead` containing the same capacities under another name.
- Prove independently that changing fitness, form and morale through real
  `PlayerDynamicState` changes the same reading, while identical board/player
  facts reproduce it exactly.
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
- `docs/PROJECT_STATUS.md`
- this step document
- `11-ai-own-squad-and-live-state-policy.md`

Production files may be added only if a failing test proves the existing chain
does not satisfy the contract; the ownership account must be written here first.

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

The read is canonical, opponent-free, state-sensitive, deterministic,
not-observed when incomplete and free of recommendations; all real-data
reachability and product UI gates pass, persistence is untouched, and Step 11
is next.

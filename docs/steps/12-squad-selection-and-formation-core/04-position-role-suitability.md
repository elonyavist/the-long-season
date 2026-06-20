# Position Role Suitability

## Goal

Define how well a player fits a formation slot.

## Why we implement it this way

Formation choice should create real squad-building consequences. A player can be excellent overall but still wrong for a specific slot. A center back should not be a natural left back by default. A wing back can maybe adapt to full back or wide midfield. A striker should not satisfy an attacking midfielder slot unless explicitly modeled as adaptable.

This step creates the language needed to say: "you can play this formation, but these players are out of position."

## What to implement

- Add suitability categories, for example:
  - `natural`
  - `adapted`
  - `weak`
  - `invalid`
- Map domain player natural positions to formation slot position families.
- Add a deterministic suitability function that receives:
  - player natural positions;
  - formation slot requirement;
  - optional role key only if needed by current contracts.
- Define explicit adaptation rules:
  - full backs and wing backs can be related but not identical;
  - center backs cover center defensive slots better than wide defensive slots;
  - central midfielders, defensive midfielders, and attacking midfielders have directional adaptation;
  - wide midfielders and wingers have related but distinct suitability;
  - strikers are natural only for forward slots unless explicitly adapted.
- Add tests for representative cases:
  - a left back natural in `LB`;
  - a wing back adapted to `LB` or wide midfield;
  - a center back weak/invalid at full back;
  - a winger not equivalent to a central midfielder;
  - a striker not equivalent to an attacking midfielder.
- Document exported functions/types with TSDoc/JSDoc.

## What NOT to implement

- Do not compute full squad-fit reports yet.
- Do not change match strength calculation yet unless the step proves the existing role weight path needs a narrow extension.
- Do not add player growth, tactical familiarity, market, UI, persistence, training, morale, or form effects.
- Do not auto-select lineups.
- Do not make all positions broadly compatible just to avoid squad gaps; gaps are the point.

## Allowed dependencies

- Prefer `domain -> nothing` if using only player positions and formation slots.
- `engine -> domain, shared` only if suitability must live near match-strength logic.

## Expected files

- `packages/domain/src/tactics/position-suitability.ts`
- `packages/domain/src/tactics/position-suitability.test.ts`
- `packages/domain/src/tactics/index.ts`
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/12-squad-selection-and-formation-core/05-formation-squad-fit-report.md` only if a lesson learned changes the next step.

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- Focused Vitest tests for touched domain files.
- `pnpm check`

## Definition of Done

- The project can classify player-to-slot fit deterministically.
- Suitability is strict enough to expose real formation/squad gaps.
- No automatic lineup choice or market action is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only position/role suitability. Do not compute full squad-fit reports or add auto-selection. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

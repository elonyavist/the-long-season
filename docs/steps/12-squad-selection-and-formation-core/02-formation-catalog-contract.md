# Formation Catalog Contract

## Goal

Define a broad, curated, deterministic formation catalog with explicit slot requirements.

## Why we implement it this way

The user should choose recognizable formations from professional football, not drag players freely on a canvas. The catalog keeps the simulation balanced, makes the CLI/UI easier to explain, and lets the game report meaningful squad needs.

The important part is not only the formation name. A `4-4-2` must require full backs, wide midfielders, and two forwards. A `3-5-2` must represent a back three and wide channels. A `4-2-3-1` must need a lone striker and attacking midfield structure. Those slot requirements are what make squad building and future market decisions meaningful.

## What to implement

- Add formation catalog contracts in the appropriate package, likely `domain` if the shape is pure data.
- Add a curated formation key union/catalog covering:
  - `4-4-2`
  - `4-4-1-1`
  - `4-3-3`
  - `4-2-3-1`
  - `4-1-4-1`
  - `4-1-2-1-2`
  - `4-3-1-2`
  - `4-3-2-1`
  - `4-5-1`
  - `4-2-2-2`
  - `4-2-4`
  - `3-5-2`
  - `3-4-3`
  - `3-4-1-2`
  - `3-4-2-1`
  - `3-1-4-2`
  - `3-3-3-1`
  - `5-3-2`
  - `5-4-1`
  - `5-2-3`
  - `5-2-1-2`
  - `5-2-2-1`
- Each formation must define exactly 11 ordered slots.
- Each slot should define:
  - stable slot key;
  - line/depth group;
  - broad department;
  - required position family;
  - side/channel where relevant: left, right, center.
- Add validation tests for:
  - every formation has 11 slots;
  - every formation has exactly one goalkeeper slot;
  - every slot key is unique inside its formation;
  - every formation key is stable and deterministic;
  - no formation uses unrecognized position families.
- Export the public catalog if future engine/CLI steps need it.
- Document exported contracts with TSDoc/JSDoc.

## What NOT to implement

- Do not assign players to formations in this step.
- Do not compute squad fit, suitability, or market needs yet.
- Do not add free-form formation editing.
- Do not add tactical familiarity, instructions, training, morale, form, market, UI, persistence, or career saves.
- Do not change match engine algorithms or balance.
- Do not leave unused duplicate formation lists in multiple packages.

## Allowed dependencies

- `domain -> nothing`
- If implemented outside domain, obey the package dependency rules in `docs/PROJECT_RULES.md`.

## Expected files

- `packages/domain/src/tactics/formations.ts`
- `packages/domain/src/tactics/formations.test.ts`
- `packages/domain/src/tactics/index.ts` if needed
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/12-squad-selection-and-formation-core/03-squad-depth-contract.md` only if a lesson learned changes the next step.

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- Focused Vitest tests for touched domain files.
- `pnpm check`

## Definition of Done

- A broad curated formation catalog exists as deterministic structured data.
- Every formation has exactly 11 explicit slots and one goalkeeper.
- Formation data is reusable by later squad-fit and CLI steps.
- No player assignment, market, or auto-selection logic is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the curated formation catalog contract. Do not assign players, compute squad fit, or add market logic. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

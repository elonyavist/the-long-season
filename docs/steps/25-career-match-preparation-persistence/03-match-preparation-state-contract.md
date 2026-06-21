# Step 03 - Match Preparation State Contract

## Goal

Add a durable career-state contract for selected match preparation.

## Context

Lineup and tactic contracts already exist in domain. This step should reuse them and define the smallest persistence slice needed by the career save.

The contract should represent user choices, not automatic decisions.

## Expected files

- `packages/domain/src/**/*.ts`
- `packages/domain/src/**/*.test.ts`
- `packages/storage/src/**/*.ts`
- `packages/storage/src/**/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add a durable `matchPreparation` or equivalent field to `CareerState`.
- Store the selected club's current prepared lineup and tactic.
- Prefer a small shape such as:
  - selected club ID;
  - optional target fixture ID, if the current model can bind preparation to the next fixture safely;
  - `SelectedLineup`;
  - `TacticSetup`;
  - updated-at game date if already available from career state.
- Validate that referenced players belong to the selected club's current roster.
- Validate lineup domain rules through existing selected-lineup helpers.
- Validate tactic domain rules through existing tactic helpers.
- Update storage migration/tests if the career-state schema changes.
- Keep the state serializable and language-agnostic.

## What NOT to implement

- Do not add CLI commands.
- Do not infer or auto-generate a lineup.
- Do not add substitutions, benches, captains, set-piece takers, tactical familiarity, or training.
- Do not add per-opponent preparation logic.
- Do not advance fixtures in this step.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/storage run typecheck`
- focused domain/storage tests
- `pnpm check`

## Definition of Done

- Career state can persist a selected lineup and tactic.
- Invalid player references, duplicate lineup players, and invalid tactic values are rejected.
- Existing career saves can still load through the documented migration path.
- No presentation text is stored in domain or storage.

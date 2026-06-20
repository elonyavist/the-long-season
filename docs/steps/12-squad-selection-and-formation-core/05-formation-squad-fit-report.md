# Formation Squad Fit Report

## Goal

Report how well a squad fits a selected formation and what factual trade-offs it exposes.

## Why we implement it this way

This is the core of the user's request: the user should feel that changing formation changes how the squad fits, without the game telling the manager what to buy or sell.

Examples:

- A team built for a back three may not have proper left/right full backs for `4-4-2`.
- A team built around wing backs may have too many wide players for a narrow diamond.
- A team with one striker may not fit `3-5-2` without the manager deciding how to solve that constraint.
- A team with many central midfielders may fit `4-3-3` better than `4-4-2`.

This step should report problems and trade-offs. It should not solve them automatically.

## What to implement

- Add a formation squad-fit report function.
- Inputs should include:
  - formation catalog entry;
  - squad-depth data;
  - player lookup;
  - current player natural positions.
- Output should include:
  - formation key;
  - covered slots;
  - uncovered slots;
  - weak/adapted slots;
  - players who are natural fits;
  - players likely forced out of position;
  - depth by position family;
  - broad extra-depth groups;
  - squad-fit hint keys as factual data, not market advice.
- Squad-fit hint keys should be narrow and descriptive, for example:
  - `gap:left_full_back`
  - `gap:right_full_back`
  - `gap:center_back_depth`
  - `gap:defensive_midfielder`
  - `gap:attacking_midfielder`
  - `gap:wide_midfielder`
  - `gap:striker_depth`
  - `adapted_only:defensive_midfielder`
  - `adapted_only:attacking_midfielder`
  - `extra_depth:wide_players`
  - `extra_depth:center_backs`
- Add tests for squad shapes:
  - a back-three squad weak in full backs;
  - a wide-heavy squad weak in central attacking midfield;
  - a narrow squad weak in wide roles;
  - a balanced squad that covers a basic formation.
- Keep the report deterministic and sorted with stable tie-breakers.
- Document exported functions/types with TSDoc/JSDoc.

## What NOT to implement

- Do not buy, sell, recommend specific players, or create transfer actions.
- Do not auto-pick the best XI.
- Do not add scouting, contracts, wages, transfer windows, staff, youth, UI, persistence, or career saves.
- Do not render long prose inside engine/domain; if labels are needed, return stable keys.
- Do not change match simulation yet.

## Allowed dependencies

- `engine -> domain, shared` if the report lives in engine.
- `domain -> nothing` if the report can remain pure domain logic.

## Expected files

- `packages/engine/src/squad/formation-squad-fit.ts`
- `packages/engine/src/squad/formation-squad-fit.test.ts`
- `packages/engine/src/squad/index.ts` if needed
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/12-squad-selection-and-formation-core/06-cli-formation-fit-inspection.md` only if a lesson learned changes the next step.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm check`

## Definition of Done

- The engine can report how a squad fits or fails a selected formation.
- Reports expose coverage gaps, adapted-only coverage, and extra-depth groups as structured deterministic data.
- The report supports manager interpretation without implementing or prescribing the market.
- No automatic lineup or transfer action is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only formation squad-fit reporting. Do not add market actions, auto-selection, or CLI output yet. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

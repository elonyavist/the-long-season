# Squad Depth Contract

## Goal

Define the squad data shape needed to reason about starters, bench, reserves, and formation coverage.

## Why we implement it this way

The game needs to understand more than "11 players in a lineup." A club should have a squad, usually around 22 senior players in early fake content, and the user should choose 11 starters from that squad.

This is also the basis for future market logic. If a squad has no left back or right back, the game should be able to say that a back-four formation is poorly covered. If a squad has many wing backs or wide midfielders but few central creators, the game should be able to report that narrow central formations require recruitment.

## What to implement

- Add a narrow squad-depth contract:
  - selected club ID;
  - ordered squad player IDs;
  - starter player IDs;
  - bench/reserve player IDs;
  - optional unavailable player IDs only if current domain already supports the state cleanly.
- Add validation helpers for:
  - no duplicate squad players;
  - starters are inside the squad;
  - bench/reserves are inside the squad;
  - starters and bench/reserves do not overlap;
  - starter count is exactly 11 when validating a match lineup;
  - squad size can support a 22-player default fake club but should not hardcode only 22 forever.
- Keep this as data/validation only.
- Add focused tests.
- Document exported contracts with TSDoc/JSDoc.

## What NOT to implement

- Do not add formation slot assignment yet.
- Do not compute position suitability or squad-fit reports yet.
- Do not add transfer market, contracts, wages, injuries, suspensions, youth, staff, scouting, UI, persistence, or career saves.
- Do not auto-pick the best XI.
- Do not mutate existing fake content unless this step explicitly needs a squad size alignment and documents it.

## Allowed dependencies

- Prefer `domain -> nothing` for pure contracts.
- If implemented in engine, use `engine -> domain, shared`.

## Expected files

- `packages/domain/src/squad/squad-depth.ts`
- `packages/domain/src/squad/squad-depth.test.ts`
- `packages/domain/src/squad/index.ts` if needed
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/12-squad-selection-and-formation-core/04-position-role-suitability.md` only if a lesson learned changes the next step.

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- Focused Vitest tests for touched domain files.
- `pnpm check`

## Definition of Done

- The project has a clear squad-depth contract independent of CLI demos.
- The contract supports the future 22-player first-team squad concept.
- Validation prevents duplicates and impossible starter/bench overlap.
- No auto-selection or market logic is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the squad-depth contract and validation. Do not assign players to formation slots or add market logic. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

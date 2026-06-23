# 04 - Career Dashboard View Builder

## Goal

Build the first career dashboard view from existing career state and explicit
caller inputs.

The builder should concentrate first-screen data mapping in one readable Module
so future UI code does not duplicate career-summary and matchday-readiness
logic.

## Expected files

- `packages/ui/src/career/build-career-dashboard-view.ts`
- `packages/ui/src/career/build-career-dashboard-view.test.ts`
- `packages/ui/src/career/career-dashboard-view.ts`
- `packages/ui/src/index.ts`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a deterministic `buildCareerDashboardView` function.
- Accept explicit input data instead of loading saves internally.
- Keep storage IO outside the builder.
- Keep localization rendering outside the builder.
- Keep engine simulation outside the builder.
- Derive only first-screen facts from the current career state, such as:
  - selected club;
  - current date;
  - current season;
  - next selected-club fixture;
  - saved match preparation state;
  - selected-club roster and condition summary;
  - compact league table context;
  - available actions and blockers.
- Use stable sorting for lists and alerts.
- Add TSDoc for the exported builder and input/result types.
- Add focused tests for:
  - a new career save with no preparation;
  - a prepared save;
  - no next selected-club fixture;
  - low-condition starters;
  - deterministic output for the same input.

## What NOT to implement

- Do not read or write career saves.
- Do not simulate or advance fixtures.
- Do not add CLI rendering.
- Do not add React.
- Do not introduce hidden recommendations.
- Do not mutate the input career state.
- Do not change engine, content, storage, or save schema.

## Required checks

- `pnpm --filter @game/ui run typecheck`
- Focused tests for the dashboard builder.
- `pnpm check`
- `git diff --check`

## Definition of Done

- A single builder produces the first-screen dashboard view.
- The builder is deterministic, pure, and easy to trace.
- The builder hides first-screen mapping complexity behind a small interface.
- `docs/PROJECT_STATUS.md` records Step 04 as complete or blocked.

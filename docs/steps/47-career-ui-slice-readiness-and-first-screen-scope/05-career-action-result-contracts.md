# 05 - Career Action Result Contracts

## Goal

Define UI-facing action availability and result contracts for the first career
screen.

This step should prepare the future UI to show what the manager can do next and
how an action completed, without creating a web action runtime yet.

## Expected files

- `packages/ui/src/career/career-dashboard-actions.ts`
- `packages/ui/src/career/career-dashboard-actions.test.ts`
- `packages/ui/src/career/career-dashboard-view.ts`
- `packages/ui/src/index.ts`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Define action IDs for first-screen actions only, for example:
  - inspect squad;
  - inspect lineup;
  - inspect tactic;
  - prepare match;
  - advance next fixture;
  - inspect table.
- Define action availability status and blocker reasons as structured keys.
- Define a generic first-screen action result contract with:
  - action ID;
  - status;
  - changed save flag;
  - optional target IDs;
  - optional user-facing message key;
  - structured detail values.
- Keep the contract reusable by CLI smoke output and future UI.
- Add TSDoc to exported types and helpers.
- Add focused tests for available, unavailable, blocked, and completed result
  cases.
- Update the dashboard view contract only as needed to reference action
  availability.

## What NOT to implement

- Do not implement web button handlers.
- Do not execute career actions from `@game/ui`.
- Do not write saves.
- Do not advance fixtures.
- Do not add new gameplay actions beyond the first-screen scope.
- Do not add hardcoded user-facing prose.

## Required checks

- `pnpm --filter @game/ui run typecheck`
- Focused tests for action contracts.
- `pnpm check`
- `git diff --check`

## Definition of Done

- First-screen actions have stable structured IDs and statuses.
- UI and CLI can render action availability without duplicating rules.
- No action execution logic leaks into presentation contracts.
- `docs/PROJECT_STATUS.md` records Step 05 as complete or blocked.

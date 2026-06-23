# 04 - Continue Until Next Attention Stop

## Goal

Add a pure career-engine function that advances from the current career date to
the next manager-relevant attention stop.

This is the first implementation of the Football Manager style `Continue`
button. It should stop before the user loses agency.

## Expected files

- `packages/engine/src/career/continue-career.ts`
- `packages/engine/src/career/continue-career.test.ts`
- `packages/engine/src/career/index.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add a pure `continueCareerUntilAttention` function.
- Accept explicit inputs only:
  - current career date;
  - selected club ID;
  - fixture/calendar facts already available to the career state;
  - saved match preparation facts when available;
  - existing unresolved attention events when available.
- Return a structured result with:
  - start date;
  - stop date;
  - days advanced;
  - stop reason key;
  - attention events;
  - generated Inbox messages or message drafts only if Step 02 supports them;
  - no mutation.
- If an unresolved action-required event already exists, stop immediately.
- If the next selected-club fixture exists and preparation is missing, stop at
  the appropriate date with a match-preparation-required event.
- If preparation exists and matchday is reached, stop with a matchday-reached
  event.
- Use deterministic ordering and stable tie-breakers.
- Add TSDoc to exported functions/types.

## What NOT to implement

- Do not simulate or play the fixture.
- Do not advance all teams through fixtures.
- Do not write the career save.
- Do not create market offers, contract events, youth events, finance events, or
  random news.
- Do not auto-select lineup or tactic.
- Do not import UI, web, CLI, storage, browser APIs, or filesystem APIs.
- Do not use the real clock.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- Focused tests for `packages/engine/src/career/continue-career.test.ts`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Career continuation is deterministic and pure.
- The function stops on existing action-required events.
- The function stops on missing preparation before the next selected-club
  fixture.
- The function can report matchday readiness when preparation exists.
- `docs/PROJECT_STATUS.md` records Step 04 as complete or blocked.

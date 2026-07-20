# Implementation Steps

## Goal

Provide an open, incremental, and iterative execution guide for the project: one active step at a time, verified before moving on, with the ability to add or refine the next step group after current milestones are complete.

## Why we implement it this way

`requirements.md` requires scope discipline, not a dead end. The step system keeps implementation narrow while allowing the project to continue after `00-foundation`, `01-match-engine`, and `02-season-simulation`. Each step is a feedback loop: implement a small slice, test it, adjust the next step based on what was learned, then continue. Future work should become a documented step before code starts, without changing `docs/PROJECT_RULES.md`.

## What to implement

- Follow the mandatory execution loop:
  1. Read `docs/PROJECT_STATUS.md`.
  2. Choose the active step.
  3. Implement only that step.
  4. Run its required tests.
  5. If something is wrong, fix the current step or update the next relevant step document.
  6. Update `docs/PROJECT_STATUS.md` in a short entry with result, adopted solution, verification, and next action.
  7. Move to the next documented step only when the Definition of Done is satisfied.
- When the current sequence is complete, add the next numbered step group under `docs/steps/`.
- Whenever a step creates or generates domain IDs, use the shared `type:value` namespace convention and the specific domain constructor for that ID type.

## What NOT to implement

- Do not implement multiple step groups at once.
- Do not treat `99-future` as a permanent ban list.
- Do not change `docs/PROJECT_RULES.md` just to move to the next phase.
- Do not start code for a future feature before creating its step document.
- Do not carry a known broken assumption forward without updating the relevant step document.
- Do not expand the active step because a future step looks convenient.
- Do not leave project state only in chat messages; put it in `docs/PROJECT_STATUS.md`.

## Allowed dependencies

- None. This is documentation only.

## Expected files

- `docs/steps/README.md`
- Future step groups under `docs/steps/NN-step-name/` when their phase gate is reached.

## Required tests

- No tests.

## Definition of Done

- The project has a clear rule for continuing beyond the current step groups.
- The project still identifies exactly one active step at a time.
- The project has an explicit implement-test-learn-adjust loop.
- The mandatory execution loop is documented and short enough to follow during every step.
- Future steps know that domain IDs use the `type:value` namespace convention.
- `docs/PROJECT_STATUS.md` explains the current active step and project state to a new LLM or junior developer.
- Future phases can start without changing `docs/PROJECT_RULES.md`.

## Current Documented Phase

- `docs/steps/77-live-match-control-statistics-and-in-game-decisions/`
- Status: Complete. Steps 01-10 and the final phase gates pass; no later phase
  has been started.

## Claude Code task prompt

Read `docs/steps/README.md` and `docs/PROJECT_STATUS.md`, identify the single active step, implement only that step, run its checks, update `docs/PROJECT_STATUS.md`, and update the next step document with any lesson that changes future work. If all existing step groups are complete, create one next-step document before implementing new code.

# Phase 14 Findings Review

## Goal

Turn the Phase 14 audit findings into a concrete cleanup checklist for Phase 15.

## Why we implement it this way

Before touching code, the project should confirm that Phase 15 is not secretly becoming a feature phase. The audit found cleanup work, not a need for new gameplay systems.

This step anchors the scope:

- fix the deterministic engine-ordering rule violation;
- clean stale naming around factual squad-fit notes;
- improve CLI module locality;
- decide the fixture-state boundary before persistence/career work;
- preserve current observable behavior unless a later Phase 15 step explicitly documents a contract change.

## What to implement

- Read `docs/audits/ENGINE_CORE_AUDIT.md`.
- Confirm the Phase 15 cleanup checklist in `docs/PROJECT_STATUS.md`.
- Verify the current locations of the audit findings:
  - `Object.values()` inside engine season simulation;
  - stale `market` wording in CLI source comments or helper names;
  - large `simulate-season` CLI module;
  - fixture slice around `GameState`.
- Do not modify source code in this step unless a scan proves the documented finding location is wrong and the step document must be corrected.
- If any finding has already been fixed, update the later Phase 15 step document to avoid duplicate work.

## What NOT to implement

- Do not change engine behavior.
- Do not refactor CLI code yet.
- Do not modify domain state contracts yet.
- Do not add market, youth, persistence, UI, scouting, staff, economy, injuries, substitutions, form, morale, or training.
- Do not add new user-facing labels.
- Do not start Step 02.

## Allowed dependencies

- None. This is a documentation and verification step.

## Expected files

- `docs/PROJECT_STATUS.md`
- This step document only if the finding locations need correction.
- Later Phase 15 step documents only if a lesson learned changes their scope.

## Required tests/checks

- `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src`
- `rg -n "market|need|recommend|auto-select|automatic|best XI|best-XI" apps/cli/src packages apps docs/audits/ENGINE_CORE_AUDIT.md`
- `wc -l apps/cli/src/commands/simulate-season.ts`
- `rg -n "FixtureStateSlice|fixtureIds|fixturesById|fixtures" packages/domain/src packages/engine/src/use-cases`

## Definition of Done

- `docs/PROJECT_STATUS.md` records Phase 15 as active and Step 01 as complete or blocked.
- The cleanup checklist is clear enough for a junior developer or LLM to execute one step at a time.
- No feature code is introduced.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, `docs/audits/ENGINE_CORE_AUDIT.md`, and this step document. Confirm the Phase 15 cleanup checklist with the required scans, update `docs/PROJECT_STATUS.md`, and stop. Do not change source code unless the step document itself needs correction.

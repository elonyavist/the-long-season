# Manual Tactic Change Contract

## Goal

Define the minimal engine contract for applying explicit manager-selected tactic changes during a match.

## Why we implement it this way

The engine needs to know when a selected setup becomes active, but it must not decide why. The reason belongs to the user or later match-session command layer. This step creates a small deterministic contract for "from minute X, use this setup" without adding live UI or automatic tactical AI.

The contract should be useful for both batch fixture inspection and a future `MatchSession`.

## What to implement

- Add a small engine-side contract for manual tactic changes or tactical segments.
- Represent explicit caller intent:
  - club/side being changed;
  - minute from which the setup applies;
  - selected lineup/tactic or already-built team context, depending on the smallest clean boundary.
- Validate deterministic ordering:
  - minute must be in match range;
  - duplicate minute changes for the same side must fail clearly;
  - sorting must have stable tie-breakers.
- Keep the contract independent from CLI and content packages.
- Add focused engine tests for validation and deterministic ordering.
- Export only the minimal public types/helpers needed by later steps.

## What NOT to implement

- Do not simulate segmented matches yet unless the contract cannot be tested otherwise.
- Do not add automatic tactical decisions based on score/minute/context.
- Do not add live match sessions, pause/resume, substitutions, team talks, fatigue, morale, injuries, cards, UI, persistence, market, economy, staff, youth, facilities, or media.
- Do not change scoring rates, conversion probabilities, balance targets, fake content, or team-strength formulas.
- Do not store rendered prose in domain events or reports.

## Allowed dependencies

- `engine -> domain, shared`
- `domain -> nothing` only if a pure serializable domain type is truly needed.

## Expected files

- `packages/engine/src/match-engine/manual-tactic-change.ts`
- `packages/engine/src/match-engine/manual-tactic-change.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/index.ts` only if a public export is needed.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Engine has a minimal deterministic manual tactic-change contract.
- The contract describes explicit user/caller changes, not automatic decisions.
- Invalid or ambiguous change schedules fail clearly.
- No fixture output or match result behavior changes yet unless explicitly documented as necessary.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the minimal engine contract for explicit manual tactic changes. Do not implement segmented match simulation or automatic tactical AI. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect, and stop.

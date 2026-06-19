# Lineup And Tactic Builder

## Goal

Create engine helpers that validate selected lineup/tactic data and convert it into the existing match team context inputs.

## Why we implement it this way

After domain contracts exist, the engine needs one narrow interpretation layer. This layer should not simulate a season or expose CLI arguments yet. It should only prove that a selected lineup can become explicit lineup slots, team strength, and tactical distribution in the shape the existing match engine already understands.

This keeps the first tactic implementation testable without adding new match mechanics.

## What to implement

- Add an engine builder for one selected team setup.
- Validate selected lineups against available players:
  - every selected player exists;
  - no duplicate selected player IDs;
  - role keys can be resolved through caller-supplied role weights;
  - required lineup size is explicit and deterministic.
- Convert domain tactic setup into existing `MatchTacticalDistributionInput` values:
  - directness;
  - pressing;
  - width;
  - risk.
- Derive `TeamStrength` from the selected lineup using existing `deriveTeamStrength`.
- Return an engine team context compatible with current `MatchContext`/season simulation inputs.
- Add typed errors for invalid selected setup.
- Add focused tests for determinism, invalid data, and tactic distribution mapping.

## What NOT to implement

- Do not change `stepMatch`, `simulateMatch`, or `simulateSeason` yet.
- Do not add CLI arguments.
- Do not change match outcome probabilities, team-strength formulas, fake content, calibration targets, or balance thresholds.
- Do not add formation UI, live substitutions, tactical familiarity, player states, fatigue, morale, cards, injuries, market, economy, staff, youth, storage, or web/desktop code.

## Allowed dependencies

- `engine -> domain, shared`

## Expected files

- `packages/engine/src/match-engine/tactic-team-context.ts`
- `packages/engine/src/match-engine/tactic-team-context.test.ts`
- `packages/engine/src/match-engine/index.ts` only if the helper should be exported inside the match-engine surface.
- `packages/engine/src/index.ts` only if the helper should be public for later CLI/use-case steps.
- `docs/PROJECT_STATUS.md`
- `docs/steps/08-tactic-and-lineup-mvp/04-season-simulation-setup-overrides.md` only if builder behavior changes season integration scope.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/match-engine/tactic-team-context.test.ts`
- `pnpm check`

## Definition of Done

- Engine can build one valid match team context from selected lineup/tactic data.
- Invalid selected setup fails clearly through typed errors.
- The helper is deterministic and covered by focused tests.
- No season simulation, CLI output, match output, or balance behavior changes in this step.
- `docs/PROJECT_STATUS.md` records the adopted builder behavior and next action.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only the engine builder that converts selected lineup/tactic data into existing match team context inputs. Do not wire it into season simulation or CLI. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what to inspect, and stop.

# Tactic Domain Contracts

## Goal

Add minimal dependency-free domain contracts for selected lineups and tactical setup.

## Why we implement it this way

The user needs a way to express "these are my starters and this is how I want them to play" before the engine can apply any managerial choice. The contracts should live in `domain` because they are pure game data, not engine behavior, CLI rendering, or content generation.

This step should define only the smallest stable language for a lineup and tactic. Engine interpretation comes later.

## What to implement

- Add a minimal selected-lineup contract:
  - club ID;
  - ordered slots;
  - player ID per slot;
  - role key per slot.
- Add a minimal tactic setup contract:
  - mentality key or bounded numeric setting;
  - pressing;
  - directness;
  - width;
  - risk.
- Keep values serializable and language-agnostic.
- Add runtime validation where the existing domain style supports it, or document why validation stays in the engine builder step.
- Export the new contracts from `@game/domain`.
- Add focused tests for valid data, invalid duplicate players, missing players, unsupported/bad numeric values, and deterministic order preservation.

## What NOT to implement

- Do not apply tactics to team strength or match simulation yet.
- Do not add formations beyond the minimal selected slot/role shape unless the implementation proves it is required.
- Do not add tactical familiarity, training, morale, fatigue, live substitutions, set-piece takers, captain selection, player instructions, UI labels, localization, rendered text, or CLI commands.
- Do not change existing player, match, fixture, report, or season behavior.
- Do not change scoring/balance parameters.

## Allowed dependencies

- `domain -> nothing`

## Expected files

- `packages/domain/src/entities/tactic.entity.ts`
- `packages/domain/src/entities/tactic.entity.test.ts`
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/08-tactic-and-lineup-mvp/03-lineup-and-tactic-builder.md` only if domain decisions change builder scope.

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm exec vitest run packages/domain/src/entities/tactic.entity.test.ts`
- `pnpm check`

## Definition of Done

- Domain has serializable selected-lineup and tactic setup contracts.
- Contracts are dependency-free and exported from `@game/domain`.
- Invalid or ambiguous data is either rejected by focused domain helpers or explicitly deferred to the engine builder step.
- No engine, content, CLI, output, match result, or balance behavior changes in this step.
- `docs/PROJECT_STATUS.md` records the adopted contract shape and next action.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only dependency-free domain lineup/tactic contracts and focused tests. Do not apply tactics to simulation, content, or CLI. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me what to inspect, and stop.

# Step 05 - Potential Rarity And White-Fly Budget

## Goal

Separate current ability from potential and enforce deterministic rarity budgets for interesting, high, elite, and white-fly players.

## Context

Lower-division saves should contain stories: a rare baby prodigy, a strong veteran, or a third-division bomber who can help in second division. But these must be rare, budgeted, and measurable. Most interesting youth players should not become first-division stars.

## Expected files

- `packages/content/src/**/*.ts`
- `packages/content/src/**/*.test.ts`
- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define potential bands:
  - `ordinary`
  - `interesting`
  - `high`
  - `elite`
- Define rarity budget per division and season:
  - `elite`: `0..1`, often `0`;
  - `high`: roughly `2..5`;
  - `interesting`: common but not guaranteed to become strong;
  - `ordinary`: majority.
- Define white-fly rules for lower divisions:
  - rare high-current veteran or specialist;
  - rare high-potential young player;
  - never a broad league-wide inflation.
- Add tests that prove:
  - potential is not equal to current ability;
  - lower-division elite potential usually starts with contained current ability;
  - rarity budgets are deterministic and bounded;
  - generated leagues can include rare stories without flooding the world.

## What NOT to implement

- Do not expose exact hidden potential to user-facing CLI/UI.
- Do not make every club receive a high or elite prospect.
- Do not solve scouting fog-of-war.
- Do not add staff/facility effects.
- Do not change development yet.

## Required checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck`
- focused tests for touched content/simulation-tools files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Potential rarity is explicit, deterministic, and tested.
- Lower-division outliers are allowed but budgeted.
- Reports/tests can detect future potential inflation.

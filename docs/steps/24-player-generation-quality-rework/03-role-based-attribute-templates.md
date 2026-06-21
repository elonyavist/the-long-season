# Step 03 - Role-Based Attribute Templates

## Goal

Make generated attributes role-coherent.

## Context

The user should believe that a defender is a defender, an attacker is an attacker, and a goalkeeper follows a different model. Attribute generation must not randomly create high values in irrelevant skills unless a documented rare archetype permits it.

## Expected files

- `packages/content/src/generators/*.ts`
- `packages/content/src/generators/*.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define role templates for the currently generated football roles, including goalkeeper-specific handling.
- Classify attributes for each role as primary, secondary, support, low-priority, or capped.
- Add hard caps for role-irrelevant attributes, for example:
  - central defenders should not receive high finishing by ordinary generation;
  - attackers should not receive high tackling by ordinary generation;
  - goalkeepers should not be generated as outfield all-rounders.
- Keep role templates data-like and easy to extend when more roles are introduced.
- Add tests for role caps and role-primary emphasis.

## What NOT to implement

- Do not add new visible player attributes.
- Do not remove existing domain attributes.
- Do not add tactical role variants beyond what current generation needs.
- Do not add player growth.
- Do not add scouting fog-of-war.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused tests for touched content generator files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Role templates exist and are tested.
- Ordinary generation cannot produce obviously incoherent role spikes.
- Goalkeepers use a distinct template path.
- The next step can layer age and potential archetypes on top of role templates.

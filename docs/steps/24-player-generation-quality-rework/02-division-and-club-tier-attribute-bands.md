# Step 02 - Division And Club Tier Attribute Bands

## Goal

Introduce deterministic attribute bands by division and club tier.

## Context

A third-division title contender, a third-division survival club, a second-division playoff club, and a first-division top club cannot share the same broad attribute distribution. The generator needs explicit bands before role templates can become credible.

## Expected files

- `packages/content/src/generators/*.ts`
- `packages/content/src/generators/*.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define generation profiles for at least:
  - first division;
  - second division;
  - third division.
- Define club tiers inside a division, for example:
  - title contender;
  - playoff contender;
  - mid-table;
  - survival.
- Represent current-ability bands separately from potential bands.
- Keep third-division current-ability bands materially lower than second and first division.
- Make first-division top-club bands capable of producing elite values, but not uniformly across every attribute.
- Add tests proving the ordering:
  - first division is stronger than second;
  - second division is stronger than third;
  - top club tiers are stronger than lower tiers inside the same division.

## What NOT to implement

- Do not tune role-specific attribute caps yet.
- Do not implement growth or decline.
- Do not add rarity budgets yet.
- Do not change match simulation.
- Do not expose market needs or transfer recommendations.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused tests for touched content generator files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Division and club-tier bands are explicit and tested.
- Third-division current-ability ranges cannot accidentally match first-division top-club ranges.
- The next step can consume these bands for role-aware attribute templates.

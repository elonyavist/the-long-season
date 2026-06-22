# Step 03 - Role Attribute Classification And Hard Caps

## Goal

Create the role/archetype attribute classification data and hard-cap rules that prevent incoherent generated players.

## Context

Division and club strength can raise or lower player quality, but they must not break role logic. A first-division center back may be elite in defensive, physical, and mental core attributes, but he should not become a high-finishing striker profile. A striker may press and work hard, but he should not become a defensive midfielder profile.

## Expected files

- `packages/content/src/**/*.ts`
- `packages/content/src/**/*.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define data-like classification for every official role/archetype:
  - `coreForRole`
  - `secondaryForRole`
  - `allowedButLow`
  - `cappedOutOfRole`
- Add hard caps for incoherent attributes:
  - defenders: `technical.finishing` should normally cap around `10..11`;
  - attackers: defensive attributes should normally cap around `10..11`;
  - goalkeepers: outfield attributes should stay low and not affect goalkeeper quality;
  - midfield caps should differ by defensive, central, attacking, and wide roles.
- Make caps reusable by generation, development, and reports.
- Add tests for:
  - each official role has classification data;
  - every existing ability key is classified for each role/archetype;
  - hard caps are present for known risk attributes;
  - goalkeeper profile is separate.

## What NOT to implement

- Do not change generated player output yet unless a minimal data migration is required.
- Do not change player development yet.
- Do not change team-strength weights.
- Do not change match event attribution.
- Do not add new visible ability keys.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused tests for touched content role/classification files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Every official role/archetype has complete attribute classification.
- Hard caps are data-driven and reusable.
- Tests fail if future changes leave an ability unclassified or remove key caps.

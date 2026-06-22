# Step 04 - Division Age And Current Ability Bands

## Goal

Define deterministic current-ability bands by division, age group, role classification, and club tier.

## Context

The game starts from a lower-division climb. Third-division players should feel like third-division players, not compressed first-division players. Stronger teams in the same division can be better, but a strong third-division club must not routinely generate top first-division current ability.

## Expected files

- `packages/content/src/**/*.ts`
- `packages/content/src/**/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Encode the senior current-ability target bands:
  - third division:
    - core role `8..13` normal, `14..15` rare, `16+` exceptional;
    - secondary `6..11` normal, `12..13` rare;
    - out-of-role `1..8` normal, `9..11` maximum rare;
  - second division:
    - core role `10..15` normal, `16` rare, `17+` exceptional;
    - secondary `8..13` normal, `14` rare;
    - out-of-role `1..9` normal, `10..11` maximum rare;
  - first division:
    - core role `12..17` normal, `18..20` top player only;
    - secondary `9..15` normal, `16` rare;
    - out-of-role `1..10` normal, `11` maximum rare.
- Encode youth current-ability bands for at least third division:
  - age `15..17`;
  - age `18..19`.
- Make club tier a modifier inside the division, not a bypass around the division.
- Add tests for:
  - third-division current ability does not inflate broadly;
  - club-tier modifiers do not break hard caps;
  - older youth can be closer to senior level than younger youth;
  - same seed remains stable.

## What NOT to implement

- Do not implement potential rarity here.
- Do not change player development.
- Do not change youth academy counts here.
- Do not alter match balance to compensate.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused tests for touched content generation files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Current-ability bands are explicit and tested.
- Division is the main quality constraint.
- Club tier can create stronger/weaker clubs without generating impossible profiles.

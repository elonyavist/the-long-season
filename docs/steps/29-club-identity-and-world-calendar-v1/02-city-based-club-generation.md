# Step 02 - City-Based Club Generation

## Goal

Generate fictional club names from deterministic city pools.

## Context

Long-run reports need readable club identities. This step replaces placeholder-style generated club display names for new generated worlds.

## Expected files

- `packages/content/src/clubs/`
- `packages/content/src/generators/fake-clubs.ts`
- `packages/content/src/generators/fake-clubs.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add city pool data for Italy, England, Spain, Germany, and France.
- Generate fictional club names from country-appropriate weighted patterns: abbreviations, city suffixes, and real-world football identity words.
- Keep naming vocabularies country-specific; do not use one global suffix pool.
- Use country-flavoured fallback disambiguators only when a generated name is duplicated or blocked.
- Keep names deterministic by seed and club slot.
- Avoid duplicate names in the same league.
- Preserve stable club IDs.
- Add tests for determinism, variation, and duplicate avoidance.

## What NOT to implement

- Do not use real club names.
- Do not make names depend on locale.
- Do not alter player identity generation unless necessary.

## Required checks

- `pnpm --filter @game/content run typecheck`
- `pnpm exec vitest run packages/content/src/generators/fake-clubs.test.ts`
- `pnpm check`

## Definition of Done

- Generated club names are readable and fictional.
- Same seed produces same club names.
- Different seeds can produce different city mixes.

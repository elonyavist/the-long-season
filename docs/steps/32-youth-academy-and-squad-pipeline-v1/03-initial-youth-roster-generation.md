# Step 03 - Initial Youth Roster Generation

## Goal

Generate deterministic bounded youth rosters when a new career world is created.

## Context

The youth pipeline must start with enough players to be useful, but not enough to flood the world. The initial target is `8` youth players per club, aged `15..19`, generated with division-aware and role-coherent quality.

## Expected files

- `packages/content/src/`
- `packages/content/src/**/*.test.ts`
- `apps/cli/src/commands/career/`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Add deterministic youth generation for new career worlds.
- Use existing fictional identity, nationality, surname-variety, role-template, and division-band rules.
- Generate exactly the documented initial youth count unless the spec from Step 01 chooses a different bounded value.
- Age bands:
  - mostly `16..18`;
  - some `15`;
  - some `19`;
  - no player younger than `15` or older than `19`.
- Keep lower-division current ability low and potential uncertain.
- Budget rare high-potential youth outliers at league level.
- Attach generated youth players to youth rosters, not senior rosters.
- Update career preview/summary output only if needed, with localized labels.
- Add tests for determinism, youth count bounds, age range, role coherence, lower-division quality, and no duplicate names/IDs.

## What NOT to implement

- Do not add annual intake yet.
- Do not promote youth players.
- Do not expose exact hidden potential.
- Do not auto-fill senior squad gaps from youth yet.
- Do not create youth competitions.

## Required checks

- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused content/CLI/i18n tests
- `pnpm check`

## Definition of Done

- New career worlds include bounded youth rosters.
- Youth players are deterministic by world seed.
- Youth players are not added to first-team rosters by default.
- The generated world is not overpopulated.

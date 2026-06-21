# 03 - Generated Player Archetypes

## Goal

Define content-owned player archetypes used by new career world generation.

Archetypes are the generation rules that make a squad feel like a squad: first-team regulars, rotation players, veterans, prospects, and rare high-upside players. They are not UI labels, tactical roles, or scouting reports.

## What to implement

- Add content-owned archetype data for generated players, such as:
  - `first_team_regular`;
  - `rotation_player`;
  - `veteran`;
  - `prospect`;
  - `high_potential_prospect`;
  - `rare_wonderkid`.
- For each archetype, define deterministic generation ranges for:
  - age;
  - current ability level;
  - potential uplift;
  - likely squad role or depth role.
- Keep archetype keys stable and language-agnostic.
- Add focused tests that prove archetype definitions are valid, ordered, and deterministic-friendly.
- Add TSDoc/JSDoc comments for the archetype model.

## What NOT to implement

- Do not generate squads from these archetypes yet.
- Do not add visible scout reports.
- Do not expose exact potential as normal user-facing output.
- Do not add growth/decline simulation.
- Do not add youth intake.
- Do not add market valuation changes unless existing tests require adapting fixtures.
- Do not add UI labels unless a CLI-facing inspection in a later step needs them.

## Expected files

- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/player-archetypes.test.ts`
- `packages/content/src/index.ts` only if exports are needed by other packages or tests
- `docs/PROJECT_STATUS.md`
- `docs/steps/20-new-career-world-generation/04-seeded-squad-generation.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused content archetype tests
- `pnpm check`

## Definition of Done

- Generated player archetypes exist in content.
- Archetype data can support varied squads without changing engine algorithms.
- The model can later support youth intake and scouting without implementing those systems now.
- `docs/PROJECT_STATUS.md` records the adopted archetype set.

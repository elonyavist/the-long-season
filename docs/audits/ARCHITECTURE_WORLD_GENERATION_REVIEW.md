# Architecture World Generation Review

Date: 2026-06-22
Phase: `43-architecture-hardening-and-package-rework`
Step: `05-world-generation-module-deepening`

## Summary

World generation already has one practical content facade:

- `createFakeLeagueSystem` in `packages/content/src/generators/league-system.ts`.

This step keeps that entry point instead of adding a second wrapper. Adding a
new alias would make the code look cleaner superficially, but it would create
two public generation paths and increase confusion for a junior developer.

The adopted solution is:

- document `FakeLeagueSystem` as the coherent generated world bundle;
- document `createFakeLeagueSystem` as the preferred entry point for career
  worlds, simulation reports, and CLI simulation;
- add a focused contract test proving the facade returns club identities,
  generated squads, lineups, season metadata, table rules, match config, and
  role weights from one call;
- leave lower-level generators public for active tests and diagnostics.

No content tuning was performed.
No club IDs changed.
No player-generation bands, rarity budgets, names, or match config values were
changed.

## Current Top-Level Flow

`createFakeLeagueSystem({ worldSeed })` composes the generated world in this
order:

1. Generate deterministic club identities and stable club IDs with
   `generateFakeClubs`.
2. Generate senior players, player states, and default lineups for those club
   IDs with `generateFakePlayersForClubs`.
3. Attach fixed season metadata:
   - `season:demo-001`;
   - `competition:demo-third-division`;
   - start date `2026-08-01`.
4. Attach structural simulation configuration:
   - three-points-for-a-win table rules;
   - aggregate match-engine config;
   - role weights;
   - dynamic-state multiplier curves.

Career creation adds career-specific data outside this facade:

- `apps/cli/src/commands/career/scenarios.ts` converts the generated league
  bundle to a durable `CareerState`;
- it creates the calendar through the engine;
- it creates youth academies through `generateInitialYouthAcademies`;
- it writes career save metadata and market state.

That split is correct for now because content must not import engine or storage.

## Internal Generator Responsibilities

| File | Responsibility |
|---|---|
| `league-system.ts` | Top-level generated league facade plus content-owned config data. |
| `fake-clubs.ts` | Stable generated club IDs, city-based fictional names, club categories, and reputations. |
| `fake-players.ts` | Senior squad generation, default lineups, player identities, current ability, potential, roles, and states. |
| `initial-youth-academies.ts` | Initial youth academy generation for career saves. |
| `career-intake-players.ts` | Later-career intake players for squad refresh. |
| `player-role-templates.ts` | Role-specific ability shaping. |
| `player-role-attribute-classification.ts` | Role/attribute category rules used by generation quality checks. |
| `player-rarity-budget.ts` | Deterministic rarity budget allocation. |
| `player-current-ability-bands.ts` | Division/team-context current-ability banding. |

## Export Decision

No root export was removed in this step.

Reason:

- CLI inspection modes still use `FakeLeagueSystem` directly;
- tests still need lower-level generators to lock player-generation quality;
- long-run reports still consume content-specific types and source data;
- narrowing exports now would be a broad migration unrelated to this step.

Future narrowing should happen only after `simulate-season.ts` and
`ten-season-report.ts` are slimmed, because those files currently compose many
content details for inspection reports.

## Verification

Verification is recorded in `docs/PROJECT_STATUS.md` for this step.

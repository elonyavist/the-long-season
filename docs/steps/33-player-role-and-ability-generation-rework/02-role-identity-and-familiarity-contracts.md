# Step 02 - Role Identity And Familiarity Contracts

## Goal

Add or refine the domain/content contracts needed to represent player role identity and role familiarity without changing gameplay behavior yet.

## Context

The project needs to distinguish what a player is from where he can be used:

- `primaryRole` is the player's stable football identity.
- `archetype` describes the style inside that role.
- `naturalRoles`, `adaptedRoles`, and `weakRoles` describe lineup usability.
- `roleFamiliarity` can later improve when a player is used out of position.

The player should not randomly change primary role. A center back repeatedly used as full back can become more comfortable at full back, but the core identity and hard caps remain center-back driven.

## Expected files

- `packages/domain/src/entities/*.ts`
- `packages/domain/src/entities/*.test.ts`
- `packages/content/src/**/*.ts`
- `packages/content/src/**/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define the official role keys:
  - `goalkeeper`
  - `center_back`
  - `full_back`
  - `wing_back`
  - `defensive_midfielder`
  - `central_midfielder`
  - `attacking_midfielder`
  - `wide_midfielder`
  - `winger`
  - `striker`
- Define a small v1 archetype set for each role.
- Add or refine player role identity fields as needed:
  - `primaryRole`
  - `archetype`
  - `naturalRoles`
  - `adaptedRoles`
  - `weakRoles`
  - `roleFamiliarity`
- Keep existing formation-fit behavior compatible with the new model.
- Add validation tests:
  - every player has exactly one primary role;
  - goalkeeper role handling stays separate;
  - natural/adapted/weak roles are deterministic and non-duplicated;
  - role familiarity does not imply primary-role changes.

## What NOT to implement

- Do not implement role retraining.
- Do not change match-engine scoring.
- Do not change player development yet.
- Do not auto-pick lineups.
- Do not add UI.
- Do not expose hidden potential.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/content run typecheck`
- focused tests for touched domain/content files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Role identity and role familiarity can be represented explicitly.
- The model is deterministic and easy for formation fit, generation, and reports to consume.
- No dead old role helper remains if the new contract replaces it.

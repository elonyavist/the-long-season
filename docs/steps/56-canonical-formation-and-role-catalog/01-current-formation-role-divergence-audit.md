# 01 - Current Formation Role Divergence Audit

## Goal

Map every current place where formations, roles, slot labels, suitability, or
pitch coordinates are defined before changing code.

## Why

The user-facing problem is not only visual. If the project keeps multiple
formation catalogs or treats `DCD`, `CCS`, or `MEDD` as roles, tactics, lineup
selection, player generation, scouting, and future UI sections will drift.

## Expected Files

- `docs/audits/CANONICAL_FORMATION_ROLE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Review current formation and role ownership in:
  - `packages/domain/src/tactics/formations.ts`
  - `packages/domain/src/tactics/position-suitability.ts`
  - `packages/ui/src/career/career-match-preparation-view.ts`
  - `apps/web/src/features/match-preparation/tactical-pitch-layout.ts`
  - `apps/web/src/shared/lib/player-position-ordering.ts`
  - `packages/i18n/src/labels.ts`
- Record where the project currently duplicates formation facts.
- Record where side/channel is currently encoded in role-like keys.
- Record which web screens/tests must stay working.
- Define the exact migration order for the following steps.

## What NOT To Implement

- Do not edit production code in this step.
- Do not change labels, formations, pitch coordinates, or tests yet.
- Do not create a new role model yet.

## Required Checks

```sh
test -f docs/audits/CANONICAL_FORMATION_ROLE_AUDIT.md
git diff --check
```

## Definition Of Done

- The audit names every source of formation/role truth.
- The audit states which source should become canonical.
- The audit identifies all code paths that must be migrated later.
- `docs/PROJECT_STATUS.md` records the active step result.

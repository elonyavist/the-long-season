# 01 - Supplied Feature Audit And Integration Map

## Goal

Audit the supplied tactical feature and map exactly which parts can be adopted,
adapted, or rejected before any source code is copied into the web app.

## Expected Files

- `docs/audits/SHARED_TACTICAL_BOARD_FEATURE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Review all files under
  `feature_richiesta/the-long-season-tactics/src/features/tactics/`.
- Document the source feature modules:
  - `PitchView.tsx`;
  - `PitchMarkings.tsx`;
  - `PlayerToken.tsx`;
  - `SlotContextMenu.tsx`;
  - `geometry.ts`;
  - `roles.ts`;
  - `formations.ts`;
  - `suitability.ts`;
  - `display.ts`;
  - `tacticsStore.ts`;
  - `sampleSquad.ts`.
- Classify each module as:
  - copy/adapt;
  - reimplement against current game contracts;
  - reject because it duplicates Phase 56 domain ownership.
- Record all role-model mismatches, especially `REG`, `SP`, and `PC`.
- Record current web integration targets in `apps/web/src/features/match-preparation`.
- Record persistence targets in current match-preparation state/store.
- Record what must stay outside scope:
  - opponent board;
  - live matchday tactical changes;
  - full Tactics screen;
  - bench drag-and-drop.

## What NOT To Implement

- Do not copy source files yet.
- Do not change React components yet.
- Do not change domain contracts yet.
- Do not update CSS yet.

## Required Checks

```sh
nvm use 24
test -f docs/audits/SHARED_TACTICAL_BOARD_FEATURE_AUDIT.md
git diff --check
```

## Definition Of Done

- The audit states which supplied files are adopted and how.
- The audit states which supplied concepts are rejected or remapped.
- The audit confirms Phase 56 canonical roles remain the source of truth.
- The audit identifies the first safe code step.

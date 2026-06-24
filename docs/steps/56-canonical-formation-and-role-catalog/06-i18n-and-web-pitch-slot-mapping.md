# 06 - I18n And Web Pitch Slot Mapping

## Goal

Update localized labels and web pitch placement so role labels, slot labels, and
coordinates are consistent with the canonical contract.

## Expected Files

- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/features/match-preparation/tactical-pitch-layout.ts`
- `apps/web/src/features/match-preparation/tactical-pitch-layout.test.ts`
- `apps/web/src/features/match-preparation/TacticalPitchLineup.tsx`
- `apps/web/src/features/match-preparation/TacticalPitchLineup.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Add/adjust localized labels for:
  - canonical player roles;
  - formation slot abbreviations;
  - formation names.
- Add compact localized labels for match-preparation helper actions:
  - English: `Auto`, `Fill gaps`, `Clear`;
  - Italian: `Auto`, `Riempi`, `Svuota`;
  - German: `Auto`, `Füllen`, `Leeren`;
  - Spanish: `Auto`, `Rellenar`, `Vaciar`;
  - French: `Auto`, `Remplir`, `Vider`.
- Keep five supported languages complete with English fallback.
- Ensure the pitch maps slot side/channel to coordinates.
- Ensure all critical formations fit inside the pitch:
  - `4-4-2`;
  - `4-3-3`;
  - `4-2-3-1`;
  - `3-5-2`;
  - `3-6-1`;
  - `5-3-2`.
- Keep only an alert icon for empty/invalid slots; do not reintroduce verbose
  `missing` / `valid` text inside the pitch cards.

## What NOT To Implement

- Do not add drag-and-drop.
- Do not add visual-only fake roles.
- Do not reduce accessibility names to icons only.
- Do not hardcode visible labels in React.
- Do not use long button labels that break the compact tactical toolbar.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm exec vitest run packages/i18n/src/labels.test.ts apps/web/src/features/match-preparation/tactical-pitch-layout.test.ts apps/web/src/features/match-preparation/TacticalPitchLineup.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Localized role and slot labels are complete.
- Localized helper-action labels are complete in all supported languages.
- Pitch placement uses slot metadata consistently.
- Tests fail if a critical formation overlaps or exits the pitch.
- React components remain reusable for match preparation and future tactics.

# 04a - Manager-Triggered Selection Actions

## Goal

Add explicit lineup and bench helper actions to the tactical workspace while
preserving manager agency.

The user must be able to ask the game to help with selection, but the game must
not silently pick the team or override manager choices without a button press.

## Expected Files

- `packages/domain/src/tactics/position-suitability.ts`
- `packages/domain/src/tactics/position-suitability.test.ts`
- `packages/ui/src/career/career-match-preparation-view.ts`
- `packages/ui/src/career/career-match-preparation-view.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/TacticalPitchLineup.tsx`
- `apps/web/src/features/match-preparation/TacticalPitchLineup.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Add deterministic selection scoring based on:
  - player strength/current ability;
  - canonical role suitability;
  - slot side/channel suitability;
  - deterministic tie-breakers.
- Ensure the scoring supports this football rule:
  - a strong adapted player who can genuinely play the role can rank above a
    mediocre natural-fit player;
  - a weak or invalid fit must not beat a reasonable natural/adapted option.
- Add three compact manager-triggered UI actions:
  - English: `Auto`, `Fill gaps`, `Clear`;
  - Italian: `Auto`, `Riempi`, `Svuota`;
  - German: `Auto`, `Füllen`, `Leeren`;
  - Spanish: `Auto`, `Rellenar`, `Vaciar`;
  - French: `Auto`, `Remplir`, `Vider`.
- `Auto` fills both starting XI and bench from scratch for the selected
  formation.
- `Fill gaps` keeps current manager choices and fills only empty XI and bench
  slots.
- `Clear` removes current XI and bench selections.
- Apply the same deterministic ranking idea to bench selection, prioritizing:
  - goalkeeper cover;
  - defensive cover;
  - midfield cover;
  - attacking cover;
  - then strongest remaining players.
- Keep all actions reversible by the manager.
- Keep save-readiness and duplicate-player validation unchanged.

## What NOT To Implement

- Do not auto-select anything when the screen opens.
- Do not auto-select after changing formation unless the manager presses a
  helper action.
- Do not recommend a tactic.
- Do not recommend market actions.
- Do not add drag-and-drop.
- Do not add substitutions or matchday decisions.
- Do not hide the selected players from the normal manual select controls.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/domain run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm exec vitest run packages/domain/src/tactics/position-suitability.test.ts packages/ui/src/career/career-match-preparation-view.test.ts packages/i18n/src/labels.test.ts apps/web/src/features/match-preparation/TacticalPitchLineup.test.ts apps/web/src/features/match-preparation/match-preparation-demo.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- The three helper buttons exist and are localized.
- Helper actions run only after explicit manager input.
- `Auto` fills XI and bench deterministically.
- `Fill gaps` never overwrites existing manager selections.
- `Clear` removes XI and bench selections.
- Tests prove a high-quality adapted player can be selected above a mediocre
  natural-fit player for a valid adapted slot.
- Tests prove bench selection includes useful role coverage instead of only the
  strongest eight remaining players.

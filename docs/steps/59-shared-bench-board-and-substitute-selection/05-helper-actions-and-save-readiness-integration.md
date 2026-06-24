# 05 - Helper Actions And Save Readiness Integration

## Goal

Ensure the manager-triggered helper actions and save readiness treat XI and
bench as one coherent preparation workflow.

## Expected Files

- `apps/web/src/features/match-preparation/match-preparation-demo.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.test.ts`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `packages/ui/src/career/career-match-preparation-view.ts`
- `packages/ui/src/career/career-match-preparation-view.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Confirm `Auto` fills:
  1. valid starting XI;
  2. then all 8 bench slots;
  3. including at least one goalkeeper on the bench when possible.
- Confirm `Riempi` fills empty XI and bench slots without replacing already
  valid manager selections.
- Confirm `Svuota` clears XI and bench, preserving formation and tactic.
- Update match-preparation blockers and visible alert strip for missing bench
  goalkeeper.
- Keep helper actions explicit and button-driven.

## What NOT To Implement

- Do not add automatic background selection.
- Do not replace a valid manual selection unless the manager uses `Auto`.
- Do not hide blocker reasons.
- Do not add future substitution rules.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/ui run test -- career-match-preparation-view.test.ts
pnpm --filter @game/web run test -- match-preparation-demo.test.ts CareerMatchPreparationScreen.test.tsx
pnpm check
git diff --check
```

## Definition Of Done

- Helper actions behave exactly as product decisions state.
- A missing bench goalkeeper is visible as a blocker.
- Save readiness is still derived from read-model state, not ad hoc React
  conditions.

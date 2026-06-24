# 02 - Bench Read Model Validation And Ordering

## Goal

Make the bench read model enforce the football rules required by the new board
and expose deterministic candidate ordering inputs.

## Expected Files

- `packages/ui/src/career/career-match-preparation-view.ts`
- `packages/ui/src/career/career-match-preparation-view.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Add or confirm validation for:
  - 8 required bench slots;
  - missing bench slot;
  - duplicate bench player;
  - player selected in both XI and bench;
  - at least one goalkeeper in the bench.
- Add a blocker key for missing bench goalkeeper if it does not already exist.
- Ensure player option facts needed for ordering are available to the web
  adapter:
  - current ability or equivalent overall score;
  - fitness/form;
  - role/position order;
  - stable display identity.
- Update demo helper actions so:
  - `Auto` fills XI first, then bench;
  - `Riempi` fills missing XI and bench slots without reshuffling filled valid
    selections;
  - `Svuota` clears XI and bench.
- Keep ordering deterministic with stable tie-breakers.

## What NOT To Implement

- Do not add React components in this step.
- Do not change the tactical-board formation catalog.
- Do not add hidden automatic choices outside explicit helper actions.
- Do not change save persistence shape unless validation requires it.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/ui run test -- career-match-preparation-view.test.ts
pnpm --filter @game/web run test -- match-preparation-demo.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Missing bench goalkeeper blocks save readiness.
- Duplicate and XI/bench overlap behavior remains covered.
- Helper actions fill bench in a predictable, manager-triggered way.
- Candidate ordering inputs are available without parsing visible labels.

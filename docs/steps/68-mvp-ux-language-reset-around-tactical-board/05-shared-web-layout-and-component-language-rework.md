# 05 - Shared Web Layout And Component Language Rework

## Goal

Implement the approved shared layout and component language without changing
gameplay.

## Scope

Refactor shared web presentation around the approved static direction:

- shell layout primitives;
- panel and section hierarchy;
- button hierarchy;
- table visual language;
- alert/attention strip language;
- compact metadata rows;
- spacing and responsive constraints;
- accessible focus and keyboard behavior.

## Expected files

- `apps/web/src/styles/*.css`
- `apps/web/src/features/career-shell/CareerShell.tsx`
- `apps/web/src/features/career-shell/CareerShell.test.tsx`
- shared web UI files under `apps/web/src/shared/`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change engine/domain behavior.
- Do not add persistence.
- Do not rewrite the tactical board.
- Do not create unused shared components.
- Do not introduce visible hardcoded labels.

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/i18n run typecheck
pnpm exec vitest run packages/i18n/src/labels.test.ts
git diff --check
```

## Done when

- Shared chrome follows the approved UX language.
- Existing screens still render.
- New shared components have active callers.
- Focus states and accessible names remain intact.

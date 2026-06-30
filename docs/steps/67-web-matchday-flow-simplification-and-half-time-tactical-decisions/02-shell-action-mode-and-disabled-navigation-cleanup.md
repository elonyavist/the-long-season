# 02 - Shell Action Mode And Disabled Navigation Cleanup

## Goal

Make the career shell support focused modes so matchday and preparation do not
show unrelated global actions.

## Scope

Implement the smallest shell/read-model change needed to support:

- normal dashboard shell with Inbox/Posta visible;
- preparation shell with Inbox/Posta visible if still useful, but with no
  misleading global Continue;
- matchday shell with Inbox/Posta hidden and no ambiguous global Continue;
- future navigation sections still visible but not focusable available-looking
  buttons;
- current section state that does not falsely imply unavailable sections are
  open.

## Expected files

- `packages/ui/src/career/career-shell-view.ts`
- `packages/ui/src/career/career-shell-view.test.ts`
- `apps/web/src/features/career-shell/CareerShell.tsx`
- `apps/web/src/features/career-shell/CareerShell.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add new sections.
- Do not make disabled sections clickable.
- Do not remove the top navigation entirely.
- Do not change app persistence.
- Do not change dashboard/matchday business logic.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-shell-view.test.ts
pnpm exec vitest run apps/web/src/features/career-shell/CareerShell.test.tsx
pnpm exec vitest run packages/i18n/src/labels.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- Matchday can render without Inbox/Posta.
- Matchday can render without global shell Continue.
- Disabled future sections remain visible but do not behave like active buttons.
- Labels are localized in all supported languages.
- Existing shell behavior outside the scoped mode still works.

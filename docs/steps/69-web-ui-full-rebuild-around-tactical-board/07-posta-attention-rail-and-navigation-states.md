# 07 - Posta Attention Rail And Navigation States

## Goal

Make the right rail feel like a manager attention surface instead of a generic
side panel.

The user should understand whether there is mail/attention, what the next stop
is, and how Continue relates to the current screen.

## Scope

- Rebuild the Posta/attention summary inside `AppShell`.
- Keep the rail compact and persistent.
- Show unread/action-required state from existing Inbox read models.
- Make navigation active/disabled states visually consistent.
- Keep the central screen free from duplicated rail controls.

## What NOT to implement

- No full Inbox section.
- No message composition.
- No new attention categories.
- No persistence.
- No market/contract/youth mail generation.

## Expected files

- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/features/app-shell/AppShellPostaRail.tsx` if extracting this
  Module improves readability.
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/app-shell
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Inspect dashboard and match-preparation shell with attention states.

Acceptance:

- Posta/attention is visible but not noisy;
- Continue has a clear relationship to the next career stop;
- inactive navigation entries are understandable;
- there are no duplicated or conflicting primary actions.

Stop after this step for user approval before continuing.

## Definition of Done

- Rail and navigation states are visually coherent.
- No fake future section is implemented.
- Status and roadmap are updated.

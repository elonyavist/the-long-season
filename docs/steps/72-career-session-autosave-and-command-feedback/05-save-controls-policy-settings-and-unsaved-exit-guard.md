# Step 05 - Save Controls, Policy Settings, And Unsaved Exit Guard

## Status

Done.

## Goal

Expose the save lifecycle with a compact, understandable interface that gives
the manager control without adding persistent visual noise.

## Scope

- Add one compact shell save control on safe career screens.
- Show clean/unsaved status and the last durable save game date without turning
  the shell into a diagnostics panel.
- Add a small autosave policy menu with 7 days, 15 days, and manual only.
- Persist policy changes without committing dirty gameplay state.
- Remove or rename preparation copy that claims the preparation action saves
  when it now only confirms the plan and enters matchday.
- Disable manual save during active matchday with a concise accessible reason.
- Add an in-app main-menu guard with `Save and exit`, `Exit without saving`, and
  `Cancel` when the session is dirty.
- During matchday, omit/disable `Save and exit` and explain that unsaved match
  progress will be lost.
- Register native `beforeunload` only while dirty and remove it when clean or
  when the career closes.
- Localize all new labels and status copy.

## Expected files

- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/features/app-shell/CareerSaveControl.tsx`
- `apps/web/src/features/app-shell/CareerSaveControl.test.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.test.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/72-career-session-autosave-and-command-feedback/06-canonical-command-activity-and-async-runner.md` only if a lesson changes future scope.

## UX requirements

- One obvious `Save game` command, never several equivalent save buttons.
- Dirty/clean state is readable without relying on color alone.
- Autosave options are mutually exclusive and keyboard operable.
- The exit dialog traps focus, restores focus on cancel, and has a safe default.
- Matchday does not imply that an unsupported mid-match save is possible.
- Preparation has one football-oriented primary command, not a storage-oriented
  label.

## What NOT to implement

- No save manager, slot duplication, rename, export, import, or delete UI.
- No toast framework.
- No persistent modal state.
- No custom replacement for the browser's `beforeunload` confirmation text.
- No broad shell redesign.
- No fake successful status before storage confirms the commit.

## Required checks

```bash
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/features/app-shell apps/web/src/features/match-preparation apps/web/src/app/app.test.tsx packages/i18n/src/labels.test.ts
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- The manager can save manually and select autosave cadence from the shell.
- Policy changes do not save dirty gameplay.
- Preparation no longer misrepresents confirmation as a save.
- Dirty main-menu and browser exits are guarded.
- Matchday accurately communicates its no-save limitation.
- The controls meet keyboard, focus, and non-color accessibility requirements.
- No obsolete save wording or duplicate control remains.
- `docs/PROJECT_STATUS.md` records Step 05 Done and Step 06 as next.

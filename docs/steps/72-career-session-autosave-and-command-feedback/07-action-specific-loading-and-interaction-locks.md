# Step 07 - Action-Specific Loading And Interaction Locks

## Status

Done.

## Goal

Turn canonical command activity into immediate, restrained, accessible feedback
on every meaningful asynchronous action.

## Scope

- Add one reusable small command-activity indicator using the existing icon
  system and visual tokens.
- Show action-specific progress text on or beside the initiating control.
- Cover create/load career, Continue, manual save, autosave, policy update,
  preparation confirmation, start match, play first half, half-time decision,
  play second half, return to dashboard, and exit-after-save.
- Preserve button width/height and surrounding layout while labels change.
- Disable the initiating control and any conflicting mutation controls.
- Keep score, phase, tactical context, and current screen visible while work is
  pending.
- Add `aria-busy` to the affected region and one polite live region for command
  status.
- Preserve keyboard focus or move it only when the successful command changes
  screen.
- Respect `prefers-reduced-motion` and keep the indicator understandable without
  animation.
- Localize progress and error labels.

## Expected files

- `apps/web/src/features/shared/CommandActivityIndicator.tsx`
- `apps/web/src/features/shared/CommandActivityIndicator.test.tsx`
- `apps/web/src/features/app-entry/AppEntryScreen.tsx`
- `apps/web/src/features/app-entry/AppEntryScreen.test.tsx`
- `apps/web/src/features/app-shell/AppShell.tsx`
- `apps/web/src/features/app-shell/AppShell.test.tsx`
- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- `apps/web/src/features/dashboard/CareerDashboardScreen.test.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/72-career-session-autosave-and-command-feedback/08-playwright-save-cadence-loading-qa-and-phase-report.md` only if a lesson changes future scope.

## UX acceptance matrix

| Action | Required pending message |
| --- | --- |
| New career | Creating career |
| Load career | Loading career |
| Continue | Advancing career |
| Manual/autosave | Saving career |
| Confirm preparation | Confirming team |
| Start match | Starting match |
| First half | Playing first half |
| Half-time decision | Applying changes |
| Second half | Playing second half |
| Full-time acknowledgment | Returning to dashboard |

Italian labels must convey the same specific action rather than using one
generic `Caricamento` string everywhere.

## What NOT to implement

- No fullscreen loading takeover.
- No skeleton replacement for already available football context.
- No fake progress bar or percentage.
- No minimum display duration or artificial delay.
- No animated decoration unrelated to command status.
- No toast dependency or new icon package.
- No broad visual redesign.

## Required checks

```bash
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm depcruise
git diff --check
graphify update .
```

## Completion criteria

- Every listed action acknowledges the click immediately and specifically.
- No duplicate mutation can be triggered while pending.
- Loading labels do not resize or shift the primary controls.
- Assistive technology receives meaningful busy/status updates.
- Reduced-motion users retain equivalent status information.
- No old pending ref, duplicate loading flag, or generic fallback loader remains.
- `docs/PROJECT_STATUS.md` records Step 07 Done and Step 08 as next.

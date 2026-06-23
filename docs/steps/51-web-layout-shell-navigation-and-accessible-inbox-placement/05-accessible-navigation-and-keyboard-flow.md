# 05 - Accessible Navigation And Keyboard Flow

## Goal

Make the shell navigation, Continue action, Inbox rail, and central content
usable with keyboard navigation and clear focus behavior.

This step is about WCAG-oriented interaction quality, not visual decoration.

## Expected files

- `apps/web/src/App.tsx`
- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- `apps/web/src/styles/*`
- Focused `apps/web` tests
- `docs/audits/WEB_SHELL_KEYBOARD_ACCESSIBILITY_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Inspect tab order from main menu into dashboard shell.
- Ensure top navigation is reachable and understandable by keyboard.
- Ensure left Inbox rail is reachable and has an accessible name.
- Ensure Continue is reachable and has visible focus.
- Ensure focus is never hidden by sticky/fixed layout.
- Ensure disabled/unavailable controls expose disabled state clearly.
- Use `aria-current` or equivalent where the current nav item is visible.
- Use proper button elements for actions.
- Avoid keyboard traps.
- Record manual keyboard findings in
  `docs/audits/WEB_SHELL_KEYBOARD_ACCESSIBILITY_REVIEW.md`.

## What NOT to implement

- Do not add shortcut systems yet.
- Do not add modal/drawer behavior unless required by the current responsive
  layout and fully keyboard accessible.
- Do not add automated accessibility tooling unless needed and documented.
- Do not implement match preparation.

## Required checks

- `test -f docs/audits/WEB_SHELL_KEYBOARD_ACCESSIBILITY_REVIEW.md`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Keyboard traversal works through app entry, shell navigation, Continue, Inbox,
  and central content.
- Focus styling is visible and not obscured.
- Accessibility findings are recorded in an audit file.
- `docs/PROJECT_STATUS.md` identifies Step 06 as the next action.

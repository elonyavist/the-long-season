# 06 - Tailwind Foundation And CSS Reduction

## Goal

Start using Tailwind for common styling and reduce hand-written CSS where it is
now generic utility work.

This step must preserve the premium retro football identity.

## Expected files

- `apps/web/src/**/*.tsx`
- `apps/web/src/styles/*`
- `docs/audits/WEB_STYLING_SYSTEM_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Identify CSS that is generic spacing, grid, flex, typography, border, color,
  or sizing utility work.
- Move common utility styling into Tailwind classes where it improves
  readability.
- Keep custom CSS for:
  - retro theme tokens;
  - tactical pitch geometry;
  - complex responsive shell layout where utility classes become noisy;
  - bespoke visual effects that Tailwind does not express cleanly.
- Avoid giant class strings that become harder to read than CSS.
- Document what CSS remains and why.
- Keep localized labels and accessibility attributes intact.

## What NOT to implement

- Do not remove the retro-football identity.
- Do not convert every class blindly.
- Do not introduce Tailwind-only one-off noise.
- Do not change layout hierarchy unless needed to preserve current behavior.
- Do not add a component library.

## Required checks

- `test -f docs/audits/WEB_STYLING_SYSTEM_REVIEW.md`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- Tailwind is used for common styling in real screens.
- Remaining CSS is smaller or explicitly justified.
- Existing UI behavior and visual identity are preserved.
- `docs/PROJECT_STATUS.md` identifies Step 07 as the next action.

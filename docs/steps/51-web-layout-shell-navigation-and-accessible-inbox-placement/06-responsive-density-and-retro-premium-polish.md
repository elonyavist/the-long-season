# 06 - Responsive Density And Retro Premium Polish

## Goal

Polish the new shell so it preserves the premium retro direction while staying
readable, dense, and usable across desktop and narrow viewport screenshots.

This step should resolve spacing, hierarchy, and overflow issues introduced by
top navigation plus left Inbox placement.

## Expected files

- `apps/web/src/styles/*`
- `apps/web/src/screens/*`
- `apps/web/src/components/*`
- Focused `apps/web` tests, only if component behavior changes
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Review the shell at desktop and narrow widths.
- Keep the UI dense but not cramped.
- Ensure top navigation labels do not overlap.
- Ensure left Inbox rail does not starve central content.
- Ensure the central dashboard remains scan-friendly.
- Preserve color contrast and visible focus styles.
- Avoid one-note palette drift.
- Avoid decorative layout that hides useful data.
- Keep cards only for individual panels, not nested page sections.

## What NOT to implement

- Do not redesign the whole visual identity.
- Do not add images or generated artwork.
- Do not add animations unless they improve state clarity and are accessible.
- Do not implement new gameplay screens.
- Do not hide important information to make the layout look cleaner.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The shell is visually coherent with the premium retro direction.
- Desktop and narrow layouts are ready for Playwright visual QA.
- No obvious overflow, overlap, or clipped text remains.
- `docs/PROJECT_STATUS.md` identifies Step 07 as the next action.

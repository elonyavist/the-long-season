# 04 - Retro Premium Visual Foundation

## Goal

Define the first visual direction for the web prototype.

The goal is not a full design system. It is a coherent first visual layer that
can make the main menu and dashboard feel like a premium retro football manager.

## Expected files

- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`, only if shared component styles are
  needed now.
- `apps/web/src/styles/visual-assets.css`, only if the step adds lightweight
  CSS-backed visual assets.
- `apps/web/src/App.tsx` or `apps/web/src/app/App.tsx`
- `docs/audits/WEB_RETRO_PREMIUM_VISUAL_DIRECTION.md`
- focused web tests only if visual classes are contract-tested
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Define color tokens for a premium retro manager feel:
  - deep interface background;
  - paper/table surface;
  - muted borders;
  - restrained highlight color;
  - warning/blocker color;
  - positive/available color.
- Define typography tokens:
  - dense UI font stack;
  - optional retro display font stack using safe fallbacks;
  - accessible sizes.
- Define spacing and border tokens.
- Add a subtle app background/chrome treatment suitable for a football manager
  UI, not a marketing hero.
- Create `docs/audits/WEB_RETRO_PREMIUM_VISUAL_DIRECTION.md` describing:
  - palette;
  - typography;
  - density;
  - what visual assets are allowed now;
  - what remains for a later full art phase.
- Verify text does not rely on viewport-width font scaling.

## What NOT to implement

- Do not build a landing page.
- Do not add decorative gradient orbs, bokeh, or stock-like hero imagery.
- Do not add a full component library.
- Do not add animations unless essential and tested.
- Do not use negative letter spacing.
- Do not make a one-note palette.
- Do not add market/squad/tactic/match screens.

## Required checks

- `test -f docs/audits/WEB_RETRO_PREMIUM_VISUAL_DIRECTION.md`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run build`
- `pnpm check`
- Manual visual inspection of the running app at desktop and narrow viewport.
- `git diff --check`

## Definition of Done

- The app has a first coherent visual foundation.
- The visual direction is documented.
- The style layer is reusable by the main menu and dashboard steps.

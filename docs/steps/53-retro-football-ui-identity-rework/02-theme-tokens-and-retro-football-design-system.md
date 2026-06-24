# 02 - Theme Tokens And Retro Football Design System

## Goal

Rework the web visual foundation so later screens can share a coherent
retro-football identity.

This step should update tokens, base surfaces, typography, spacing, color, focus
states, and small reusable visual primitives before reworking full screens.

## Expected files

- `apps/web/src/styles/*`
- Focused `apps/web` tests only if behavior changes
- `docs/audits/WEB_RETRO_FOOTBALL_UI_IDENTITY_SCOPE.md` only if findings need
  correction
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Rework CSS variables for a football control-room palette:
  - dark football-office base;
  - pitch/lavagna green surfaces;
  - warm paper/ivory text;
  - muted gold accents;
  - brick red danger;
  - pitch green success;
  - club-color accent hooks where useful.
- Keep the palette restrained and avoid one-note green monotony.
- Improve typography and hierarchy for dense manager-game screens.
- Create visual patterns for:
  - top chrome;
  - operational panels;
  - tables/lists;
  - status chips;
  - focus rings;
  - tactical/pitch surfaces.
- Keep buttons and controls accessible and clear.
- Avoid decorative-only CSS that does not improve recognition or usability.

## What NOT to implement

- Do not rework full screen layouts yet.
- Do not add new gameplay data.
- Do not add external icon libraries unless explicitly justified.
- Do not add animation that distracts from decision-making.
- Do not use hardcoded visible labels in CSS/React.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The web app has a coherent retro-football visual foundation.
- Existing screens still render and pass checks.
- Focus and contrast remain suitable for WCAG 2.2 AA direction.
- `docs/PROJECT_STATUS.md` identifies Step 03 as the next action.

# 03 - Base Layout Foundation And Focus Language

## Goal

Create the base visual foundation used by the rebuilt web UI: reset, typography,
focus states, surface grammar, and subtle retro material.

This step should visibly improve the existing app entry and any still-existing
screens without changing their flow.

## Scope

- Rewrite or reduce base/layout CSS around the approved identity.
- Keep token names needed by the tactical board.
- Add a single, consistent focus style.
- Keep scanline/material effects subtle.
- Avoid a one-note palette and avoid decorative blobs/orbs.

## What NOT to implement

- No shell/sidebar yet.
- No dashboard layout rewrite.
- No matchday rewrite.
- No tactical-board behavior changes.
- No extra themes.

## Expected files

- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/index.css`
- `apps/web/src/styles/tactical-board.css` only if token compatibility requires
  a small adjustment.
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
git diff --check
```

## Visual check for the user

Inspect app entry and one career screen.

Acceptance:

- focus rings are visible and consistent;
- typography hierarchy feels deliberate;
- surfaces no longer look like generic SaaS cards;
- narrow width has no horizontal overflow;
- tactical board still keeps its approved look.

Stop after this step for user approval before continuing.

## Definition of Done

- Base styles are simpler and aligned with the spec.
- Tactical-board token compatibility is preserved.
- Tests/typecheck pass.
- Status and roadmap are updated.

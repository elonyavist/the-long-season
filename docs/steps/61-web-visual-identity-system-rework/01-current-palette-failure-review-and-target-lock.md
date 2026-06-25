# Step 01 - Current Palette Failure Review And Target Lock

## Goal

Turn the Phase 60 visual failure into a precise implementation target before
changing code.

This step must make the reason for the rework explicit: the current palette
system works technically but does not yet produce a premium football-management
screen.

## Expected files

- `docs/audits/WEB_PALETTE_ART_DIRECTION_AUDIT.md`
- `docs/audits/WEB_VISUAL_IDENTITY_TARGET.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Review the existing palette screenshots from `/tmp/the-long-season-phase60`
  if they are available.
- Use `WEB_PALETTE_ART_DIRECTION_AUDIT.md` as the starting point.
- Create `WEB_VISUAL_IDENTITY_TARGET.md` with:
  - visual goal;
  - approved genre references;
  - rejected visual patterns;
  - the target skin list;
  - the explicit field/SVG non-touch rule;
  - manual visual acceptance criteria.
- Decide which current palettes are salvageable and which should be removed.
- Do not modify code in this step.

## What NOT to implement

- Do not change CSS, React, i18n, tests, or palette code.
- Do not add screenshots unless the existing evidence is missing.
- Do not touch `apps/web/src/assets/campo-calcio.svg`.
- Do not invent a new UI section.

## Required checks

```sh
git diff --check
```

## Definition of Done

- The visual target is documented and concrete enough for implementation.
- The target explains why the old palettes are not acceptable.
- The target names the skins that should survive or replace the current set.
- The field/SVG non-touch rule is recorded.


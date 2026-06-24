# 06a - Pitch SVG Background Integration

## Goal

Use the provided football-pitch SVG as the tactical pitch background and adapt
the web layout so the whole field is visible.

The current pitch should stop relying on hand-drawn CSS field markings when a
real vector field asset is available. The SVG must improve the football feeling
without breaking slot placement, readability, or responsiveness.

## Source Asset

- Source file supplied by the user:
  `/Users/elianarducci/Downloads/campo_calcio.svg`

## Expected Files

- `apps/web/src/assets/campo-calcio.svg`
- `apps/web/src/features/match-preparation/TacticalPitchLineup.tsx`
- `apps/web/src/features/match-preparation/TacticalPitchLineup.test.ts`
- `apps/web/src/features/match-preparation/tactical-pitch-layout.ts`
- `apps/web/src/features/match-preparation/tactical-pitch-layout.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/tactics-workspace.spec.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Copy the supplied SVG into the web app source tree as
  `apps/web/src/assets/campo-calcio.svg`.
- Use the SVG as the visual field background for the tactical pitch.
- Preserve the existing slot grid semantics from the canonical formation
  catalog.
- Adapt pitch sizing so the whole SVG field is visible, including both penalty
  areas and touchlines.
- Keep formation slots inside the field for:
  - `4-4-2`;
  - `4-3-3`;
  - `4-2-3-1`;
  - `3-5-2`;
  - `3-6-1`;
  - `5-3-2`.
- Ensure the SVG is decorative for assistive technologies; accessible names
  must come from the pitch/slot controls, not from raw SVG text.
- Keep the slot cards readable over the SVG with the existing retro-football
  visual identity.

## What NOT To Implement

- Do not keep duplicate CSS-drawn field lines behind the SVG.
- Do not crop the SVG to make slot placement easier.
- Do not stretch the SVG in a way that distorts the field ratio.
- Do not add fake role labels to solve placement issues.
- Do not make the SVG file path depend on the user's Downloads folder at
  runtime.
- Do not add drag-and-drop.

## Required Checks

```sh
nvm use 24
test -f apps/web/src/assets/campo-calcio.svg
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/features/match-preparation/tactical-pitch-layout.test.ts apps/web/src/features/match-preparation/TacticalPitchLineup.test.ts
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/tactics-workspace.spec.ts
pnpm check
git diff --check
```

## Definition Of Done

- The tactical pitch uses `apps/web/src/assets/campo-calcio.svg`.
- The whole SVG field is visible in desktop and narrow Playwright screenshots.
- No slot overlaps, clips outside the pitch, or becomes unreadable over the SVG.
- CSS field-line duplication is removed.
- The implementation remains reusable for both match preparation and the future
  tactics screen.

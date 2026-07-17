# Step 07 - Playwright Visual Baseline And Pixel-Perfect Scorecard

## Status

Pending.

## Goal

Create one reproducible visual review pack and one cross-screen scorecard that
show the current product honestly before any remediation begins.

## Scope

- Use the deterministic fixture matrix from Step 01 to capture every current
  production surface and meaningful state.
- Capture at minimum:
  - `1440x900` desktop;
  - `1920x1080` wide desktop;
  - `390x844` narrow;
  - relevant focus-visible, loading, error, context-menu, dialog, `200%` zoom,
    and reduced-motion states.
- Record viewport, route/state, save fixture, command prerequisites, screenshot
  path, overflow result, and manual findings for every capture.
- Compare all screens for alignment, density, typography, control language,
  feedback, hierarchy, and football identity.
- Score every current surface from `1-5` across the eight Phase README quality
  lenses, with written evidence for every score below `4`.
- Create a cross-screen inconsistency matrix and identify systemic versus local
  findings.
- Review the pack manually; passing automated assertions alone is insufficient.

## Expected files

- `docs/audits/WEB_PIXEL_PERFECT_VISUAL_BASELINE_AND_SCORECARD.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/08-consolidated-findings-remediation-map-and-next-phase-decision.md` only if the baseline changes its assumptions.

## Screenshot output

Use a temporary structure similar to:

```text
/tmp/the-long-season-phase73a/
  app-entry/
  shell-dashboard/
  posta/
  match-preparation/
  matchday/
  shared-states/
```

The audit document records absolute screenshot paths and inspection results.
Generated screenshots are not committed in this step.

## What NOT to implement

- No snapshot-update workflow that accepts current regressions automatically.
- No production, test, CSS, or component changes.
- No score inflation to reach an arbitrary readiness percentage.
- No single desktop screenshot used as proof for responsive or accessible
  quality.
- No replacement tactical-board mockup.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_PIXEL_PERFECT_VISUAL_BASELINE_AND_SCORECARD.md
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
git diff --check
```

## Manual inspection

- Does the pack make cross-screen drift visible without opening the source?
- Are the lowest scores supported by concrete user-facing evidence?
- Is the tactical board still treated as the approved anchor rather than a
  target for arbitrary restyling?

## Completion criteria

- Every current surface and meaningful state has reproducible visual evidence.
- Desktop, wide, narrow, focus, zoom, loading, and reduced-motion evidence are
  represented where applicable.
- Every surface has eight evidence-backed quality scores.
- Systemic and local findings are clearly separated.
- `docs/PROJECT_STATUS.md` marks Step 07 Done and Step 08 active.

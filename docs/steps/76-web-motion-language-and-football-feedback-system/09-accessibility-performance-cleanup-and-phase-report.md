# Step 09 - Accessibility, Performance, Cleanup, And Phase Report

## Status

Done.

## Goal

Audit the complete Motion integration as one production system, remove migrated
presentation debt, and prove that movement improves usability and football
feeling without harming accessibility, performance, or architecture.

## User-Visible Outcome

- Current journeys feel responsive and coherent at desktop and narrow sizes.
- Reduced motion is complete, calm, and functionally identical.
- No screen jitters, grows during playback, loses focus, delays commands, or
  animates without a user-facing reason.
- Matchday carries the strongest motion hierarchy while the rest of the product
  remains restrained.

## Scope

1. Inventory every production Motion import and classify each consumer as
   `micro`, `transition`, or `narrative`.
2. Remove unused presets, wrappers, CSS keyframes, manual animation listeners,
   duplicate reduced-motion checks, and stale tests after proving replacement.
3. Verify only `apps/web` imports Motion and the shared provider loading policy
   remains intact.
4. Compare production bundle output with the Step 01 baseline and document the
   actual impact.
5. Run the complete product journey at desktop, wide, narrow, 200% text,
   keyboard, touch where applicable, and reduced motion.
6. Verify no horizontal page overflow, cumulative Matchday growth, unstable
   primary action, inaccessible off-screen control, or duplicate live-region
   announcement.
7. Review motion from a football/fun perspective: quiet management surfaces,
   clear attention, coherent tactics, and meaningful decisive events.
8. Complete `WEB_MOTION_SYSTEM_REPORT.md`, architecture, status, and both active
   roadmaps with exactly one next-phase recommendation.

## Implementation Contract

- Cleanup is evidence-based. Keep simple CSS hover/focus/color transitions that
  remain the clearest owner.
- A shared preset without a production caller is dead code and must be deleted.
- A production animation without a documented user-facing reason must be
  removed or changed to `none`.
- Do not hide required information or shorten readable product pacing merely to
  improve screenshot or bundle metrics.
- Fix issues in the narrowest owning Module; do not add broad `!important`
  overrides or viewport-specific duplicate trees.

## Expected Files

- production-used files under `apps/web/src/` touched by Steps 01-08 only where
  cleanup or correction is proven necessary
- focused web tests for corrected behavior
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `apps/web/package.json`
- `pnpm-lock.yaml`
- `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_RULES.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/README.md`
- `docs/steps/76-web-motion-language-and-football-feedback-system/README.md`
- this step document
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`

## What NOT To Implement

- No new screen, widget, event, command, gameplay rule, feature placeholder, or
  second motion system.
- No visual redesign outside a correction needed for stable animation.
- No bundle-size threshold invented after seeing the result.
- No deletion of current accessibility or interaction tests to make the gate
  pass.
- Do not start the next phase.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Review all evidence listed in the phase README.
- Compare normal and reduced-motion journeys side by side.
- Confirm Motion is absent from engine/domain/package behavior and that the
  tactical pitch visual itself was not changed.
- Confirm every remaining movement has a concise user-facing reason in the
  final report.

## Completion Criteria

- The motion Module is deep, small, production-used, and web-only.
- No migrated keyframe, duplicate reduced-motion path, unused preset, or dead
  wrapper remains.
- Bundle impact is measured and acceptable for the demonstrated value.
- Full checks and visual QA pass.
- Architecture, rules, phase index, status, roadmaps, and final report agree
  that Phase 76 is complete and name exactly one next phase.

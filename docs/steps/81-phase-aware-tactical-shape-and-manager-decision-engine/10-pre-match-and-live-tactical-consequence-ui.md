# Step 10 - Pre-Match And Live Tactical Consequence UI

## Status

Not started.

## Goal

Present a small, accessible, localized set of structured tactical consequences
before the match and after live changes without exposing formulas or choosing
the team for the manager.

## User-Facing Reason

The manager needs enough feedback to understand why a risky idea may work or
fail, while retaining responsibility for the decision.

## What To Implement

- Add framework-free `@game/ui` read models for a bounded set of qualitative
  tactical observations derived from canonical engine facts.
- Cover connection, overload, pressing cohesion, central/lateral exposure,
  box presence/protection, and transition protection as structured keys.
- Show at most the priority count frozen in Step 01; use deterministic ordering
  and tie-breaks.
- Integrate the observations into match preparation and the existing live/
  half-time tactical workspace without creating a new destination.
- Refresh live observations only after an accepted command has rebuilt the
  engine team state.
- Localize every visible label in Italian, English, German, Spanish, and
  French.
- Preserve keyboard operation, focus, narrow viewport, `200%` text, reduced
  motion, and color-independent meaning.
- Add desktop/narrow screenshots for ordinary, extreme, no-warning, changed,
  and reduced-motion states.

## Motion Classification

- Observation changes: `micro` only when it clarifies accepted command
  feedback.
- Initial static observations: `none`.
- Reduced motion preserves identical facts, focus, and final state.

## Clean-Code Requirements

- React renders read-model facts; it does not calculate shape or thresholds.
- Reuse existing alert/list primitives and motion policy where suitable.
- Delete obsolete preparation/live warning adapters or duplicate copy paths
  made redundant by the shared read model.
- No hardcoded visible strings and no screen-local priority mapping.

## What NOT To Implement

- No exact capacity numbers, percentages, formula tooltips, or “best formation”
  command.
- No new tactics route, assistant manager, tutorial, or scouting feature.
- No UI-only gameplay coefficient.
- No decorative animation.

## Expected Files

- `packages/ui/src/career/career-match-preparation-view.ts`
- `packages/ui/src/career/career-match-preparation-view.test.ts`
- `packages/ui/src/career/career-matchday-phase-view.ts`
- `packages/ui/src/career/career-matchday-phase-view.test.ts`
- `packages/ui/src/career/tactical-consequence-view.ts`
- `packages/ui/src/career/tactical-consequence-view.test.ts`
- `packages/ui/src/career/index.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/features/matchday/MatchdayTacticalWorkspace.tsx`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.test.tsx`
- `apps/web/src/visual-qa/current-product.spec.ts`
- shared web CSS/motion files only if the existing primitive requires a scoped
  extension, added to Expected Files before modification
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/ui/src/career/tactical-consequence-view.test.ts \
  packages/ui/src/career/career-match-preparation-view.test.ts \
  packages/ui/src/career/career-matchday-phase-view.test.ts \
  packages/i18n/src/labels.test.ts \
  apps/web/src/features/match-preparation/match-preparation-adapter.test.ts \
  apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts \
  apps/web/src/features/matchday/MatchdayHalfTimePhase.test.tsx
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm playwright test apps/web/src/visual-qa/current-product.spec.ts \
  --workers=1 --reporter=line
git diff --check
graphify update .
```

## Definition Of Done

- Preparation and live workspaces show the same canonical qualitative facts.
- Extreme choices are understandable without exposing formulas or solutions.
- Accepted live changes refresh observations; rejected changes do not.
- Localization, keyboard, focus, narrow, `200%`, normal/reduced-motion, and
  screenshot checks pass.
- React contains no tactical calculation or duplicate priority policy.
- Step 11 is the only next action.

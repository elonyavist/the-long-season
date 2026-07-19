# Step 08 - Responsive, Accessibility, And Motion Quality Pass

## Status

Ready.

## Goal

Verify and correct the complete Matchday rework as one accessible responsive
broadcast experience rather than a collection of individually passing slices.

## User-Visible Outcome

- Desktop and wide layouts use the full available Matchday content width.
- Narrow layout keeps score, current commentary, tabellino, tabs, ratings,
  tactical decisions, and actions reachable without horizontal page scroll.
- 200% text reflows without clipped club names, event facts, tabs, or controls.
- Keyboard focus follows the match journey and remains visible.
- Reduced motion removes decorative movement while keeping event meaning and
  readable timing.
- Loading, command failure, pause, and refresh states remain stable.

## Scope

1. Audit every Matchday phase at desktop `1440x900`, wide `1920x1080`, narrow
   `390x844`, and 200% text.
2. Verify tab, playback-control, tactical-board, return-action, skip-link, and
   screen-heading keyboard flows.
3. Verify score/commentary live-region announcements do not duplicate or
   overwhelm.
4. Verify `prefers-reduced-motion` for score/event transitions, goal treatment,
   tab changes, command feedback, and playback.
5. Correct contrast, target size, wrapping, min-content pressure, focus order,
   and stable dimensions in owning components.
6. Add visual regression assertions for no horizontal page overflow and no
   live vertical-growth regression.

## Implementation Contract

- This is a correction pass over current Phase 73C consumers, not a visual
  redesign or new feature step.
- Do not solve narrow layout by hiding required decisions or football facts.
- Internal scrolling is allowed only for a clearly bounded list with keyboard
  and touch reachability; the page may not scroll horizontally.
- Reduced motion changes presentation, not structured facts, commands, or
  checkpoint timing semantics.
- Fix ownership at the narrowest responsible component; do not add broad
  `!important` overrides or viewport-specific duplication.

## Expected Files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/MatchdayLivePhase.tsx`
- `apps/web/src/features/matchday/MatchdayPlaybackControls.tsx`
- `apps/web/src/features/matchday/MatchdayTabellino.tsx`
- `apps/web/src/features/matchday/MatchdayPhaseTabs.tsx`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayTeamRatings.tsx`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- corresponding focused test files under `apps/web/src/features/matchday/`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No new Matchday fact, command, tab, control, or career feature.
- No global font, palette, shell, pitch, or tactical-token redesign.
- No device-specific duplicate component tree.
- No hiding opponent ratings, tactical controls, or consequences to pass a
  screenshot.
- No screenshot-only CSS that breaks real interaction.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
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

- Capture every phase and tab at desktop, wide, narrow, 200% text, focus,
  paused, pending, failure, reduced-motion, event-light, and event-rich states.
- Use keyboard only for the complete pre-match -> half-time -> full-time ->
  Dashboard journey.
- Use touch emulation for tabs, controls, tactical menus, and bounded lists.
- Confirm no overlap, clipping, inaccessible off-screen action, horizontal page
  overflow, or unexplained layout jump.
- Confirm the tactical board still matches its approved baseline.

## Cleanup Boundary

Remove superseded media rules, one-off overrides, stale accessibility labels,
and obsolete Playwright workarounds once the current matrix passes. Do not
retain duplicate narrow markup.

## Completion Criteria

- The complete Matchday journey meets the documented WCAG 2.2 AA working
  target.
- Desktop, wide, narrow, and 200% text are coherent and usable.
- Motion settings preserve meaning and eliminate non-essential animation.
- Live playback causes neither horizontal overflow nor cumulative page growth.
- The user can inspect the final responsive experience before closeout.


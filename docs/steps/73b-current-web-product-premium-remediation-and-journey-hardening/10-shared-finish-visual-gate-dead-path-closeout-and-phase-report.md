# Step 10 - Shared Finish Visual Gate Dead Path Closeout And Phase Report

## Status

Done.

## Goal

Finish shared entry, dialog, feedback, and state presentation; make one
current-product Playwright command authoritative; then remove only presentation
paths proven superseded by Steps 01-09.

## Findings Closed

- Completion of `Q-P1-11` canonical current-product visual gate.
- Final cross-screen portion of `Q-P1-05` hierarchy.
- `Q-P2-03` shared component-language consistency.
- `Q-P2-04` app-entry product signal.
- `Q-P2-06` shared empty/loading/error/recovery consistency.
- `Q-P2-08` proven test-only production-looking paths.
- `Q-P2-10` historical visual-QA ownership.

## User-Visible Outcome

- App Entry, dialogs, pending feedback, empty states, errors, recovery, and all
  current screens belong to one restrained premium football product.
- App Entry signals the football-management world immediately without becoming
  a marketing landing page.
- Shared overlays and dialogs preserve context, focus, hierarchy, and recovery
  choices on desktop and narrow screens.
- One canonical browser command proves the complete current manager journey.

## Scope

1. Refine current App Entry, unsaved dialog, command feedback, and shared state
   presentation using the semantic contract from Step 02.
2. Complete `pnpm web:visual:qa` so it covers every current product surface,
   critical journey, and shared interaction state through real SQLite/OPFS.
3. Classify every historical visual spec as migrated, uniquely retained, or
   obsolete; delete only after its unique assertion exists in the canonical
   gate.
4. Re-run the Phase 73A selector/caller audit and remove only confirmed unused
   selector groups after all current screenshots pass.
5. Delete the three production-looking test-only tactical preparation paths if
   caller and replacement tests still prove them obsolete.
6. Re-capture the complete desktop/wide/narrow/focus/zoom/reduced-motion
   scorecard and review it manually.
7. Reconcile architecture, both roadmaps, project status, and one final phase
   report with exactly one next recommendation.

## Implementation Contract

- Score improvement is diagnostic evidence, not permission to game a numerical
  target or remove useful density.
- No historical spec, selector, helper, or source file is deleted from age,
  line count, naming, or duplication appearance alone.
- `campo-calcio.svg` and all approved tactical-board production behavior remain
  untouched.
- The canonical gate uses current real journeys; mock-only screenshots cannot
  replace SQLite/OPFS evidence.
- Shared polish does not create a design-system package or generic UI framework.
- The report recommends but does not start the next phase.

## Expected Files

- `package.json`
- `apps/web/package.json`
- `apps/web/src/features/app-entry/AppEntryScreen.tsx`
- `apps/web/src/features/app-entry/AppEntryScreen.test.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.test.tsx`
- `apps/web/src/features/shared/CommandActivityIndicator.tsx`
- `apps/web/src/features/shared/CommandActivityIndicator.test.tsx`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `apps/web/src/visual-qa/architecture-rework.spec.ts`
- `apps/web/src/visual-qa/career-session-autosave-and-loading.spec.ts`
- `apps/web/src/visual-qa/continue-inbox.spec.ts`
- `apps/web/src/visual-qa/inbox-decision-center.spec.test.ts`
- `apps/web/src/visual-qa/inbox-decision-center.spec.ts`
- `apps/web/src/visual-qa/interactive-matchday-flow.spec.ts`
- `apps/web/src/visual-qa/match-preparation.spec.ts`
- `apps/web/src/visual-qa/matchday-flow-simplification.spec.ts`
- `apps/web/src/visual-qa/matchday-information-architecture.spec.ts`
- `apps/web/src/visual-qa/matchday-playable-slice.spec.ts`
- `apps/web/src/visual-qa/retro-football-identity.spec.ts`
- `apps/web/src/visual-qa/shared-tactical-board.spec.ts`
- `apps/web/src/visual-qa/shell-accessibility.spec.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `apps/web/src/visual-qa/squad-list-responsive.spec.ts`
- `apps/web/src/visual-qa/tactics-workspace.spec.ts`
- `apps/web/src/visual-qa/web-career-persistence.spec.ts`
- `apps/web/src/visual-qa/web-ui-full-rebuild.spec.ts`
- `apps/web/src/features/match-preparation/TacticalPitchLineup.tsx`
- `apps/web/src/features/match-preparation/TacticalPitchLineup.test.ts`
- `apps/web/src/features/match-preparation/tactical-pitch-layout.ts`
- `apps/web/src/features/match-preparation/tactical-pitch-layout.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-adapters.ts`
- `apps/web/src/features/tactics-board/tactical-board-adapters.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/audits/WEB_PIXEL_PERFECT_VISUAL_BASELINE_AND_SCORECARD.md`
- `docs/audits/WEB_UI_UX_PREMIUM_REMEDIATION_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`

## What NOT To Implement

- No new career section, gameplay system, Posta category, or navigation target.
- No palette, font, pitch, tactical-board, or theme-picker redesign.
- No bundle optimization without measured user impact.
- No deletion of a unique current assertion or current production caller.
- No snapshot-only claim of premium quality without manual browser inspection.
- No Phase 74 implementation.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm depcruise
pnpm check
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Re-capture App Entry, Dashboard, Posta, Preparation, pre-match, first half,
  half-time, second half, full time, dialogs, pending, empty, error, recovery,
  focus, 200% text, and reduced-motion states.
- Review desktop `1440x900`, wide `1920x1080`, and narrow `390x844` contact
  sheets manually through all eight Phase 73A lenses.
- Verify one dominant task per screen, no raw IDs/fallback words, no unexpected
  horizontal overflow, and coherent keyboard/screen-change focus.
- Verify save cadence, dirty exit, refresh recovery, Posta lifecycle, Continue,
  Matchday checkpoints, and full-time commit through real SQLite/OPFS.
- Compare the tactical board pixel-for-pixel with the approved baseline.

## Cleanup Boundary

Delete historical runners, the confirmed unused selector groups, and the three
test-only production-looking paths only after caller scans and replacement
coverage are recorded in the report. If any path still has a unique current
caller or assertion, retain it and document why; do not force the count.

## Adopted Solution

- App Entry now carries one immediate football-formation signal and explicit
  loading, empty, failure, and recovery presentation without becoming a
  marketing page.
- The dirty-exit dialog and command activity feedback share the current
  semantic state and action hierarchy on desktop and narrow screens.
- `pnpm web:visual:qa` runs the authoritative current-product journey plus the
  unique SQLite/OPFS isolation and rollback proof.
- Every still-current historical browser assertion was migrated before the old
  runner was deleted. Only `current-product.spec.ts` and
  `sqlite-opfs-storage.spec.ts` remain.
- The obsolete `TacticalPitchLineup`, `tactical-pitch-layout`, and
  `tactical-board-adapters` paths and their tests were removed after caller and
  replacement coverage proved them unnecessary.
- Confirmed unused CSS selector groups were removed; a final production-caller
  scan reports no unused class selector.
- Architecture, scorecard, roadmaps, project status, and the final phase report
  now describe the current implementation rather than historical runners.

## Verification Result

- Node `24.16.0`;
- i18n tests pass;
- web typecheck and production build pass;
- web tests pass: `51` files, `211` tests;
- dependency-cruiser passes: `483` modules, `1,673` dependencies;
- full `pnpm check` passes: `163` files, `965` tests;
- canonical Playwright passes: `17/17` through real SQLite/OPFS;
- `87` product screenshots plus three contact sheets were manually reviewed;
- `git diff --check` and Graphify update pass.

## Lesson Learned

A release-quality browser gate should describe the accepted product, not retain
one runner per historical phase. Migration before deletion preserves unique
behavioral evidence while removing contradictory selectors and stale product
assumptions. Visual density is acceptable only when every remaining fact helps
the manager decide or understand the football story; narrow page length alone
is not a reason to delete useful information.

## Completion Criteria

- All 11 Phase 73A P1 findings have passing implementation evidence.
- One canonical current-product browser command is documented and green.
- Every current screen and shared state passes manual desktop/wide/narrow QA.
- App Entry and shared states match the current product language.
- Every removed path has replacement proof and no compatibility bridge remains.
- Tactical board, engine, persistence, save cadence, Posta, Continue, and
  deterministic Matchday remain unchanged.
- The final report records evidence, remaining Monitor items, manual inspection,
  and exactly one next-phase recommendation without starting it.

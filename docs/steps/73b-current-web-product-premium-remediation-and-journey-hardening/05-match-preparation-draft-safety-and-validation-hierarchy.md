# Step 05 - Match Preparation Draft Safety And Validation Hierarchy

## Status

Done.

## Goal

Prevent silent loss of non-empty match-preparation work and present only the
validation needed to confirm the plan, without changing the tactical board.

## Findings Closed

- `Q-P1-01` preparation draft safety.
- `Q-P1-05` flattened preparation hierarchy.
- `Q-P2-01` repeated readiness and blocker narration.

## User-Visible Outcome

- A changed XI, bench, formation, or tactic is visibly unsaved.
- Navigating away from a non-empty changed draft asks the manager to stay or
  discard; a complete valid plan may also be saved deliberately.
- Browser refresh/close uses truthful native dirty-exit protection.
- Cancel preserves the draft exactly; confirmed discard restores the loaded
  baseline; deliberate save restores the intended plan after reload.
- The board is the first football object and blockers appear once, adjacent to
  the confirmation action.

## Scope

1. Derive preparation draft dirty state by comparing the current board, bench,
   formation, and tactic draft with the loaded career baseline.
2. Connect that dirty state to the existing career-session unsaved contract
   without writing on every tactical action.
3. Guard in-app navigation with one accessible confirmation dialog.
4. Keep browser refresh/close protection active while the draft is dirty.
5. Define explicit Stay, Discard, and valid Save behavior with deterministic
   focus restoration.
6. Consolidate preparation readiness into one validation owner and remove
   repeated blocker narration.
7. Prove existing pointer, touch, keyboard, candidate-order, bench, goalkeeper,
   and no-duplicate board behavior unchanged.

## Implementation Contract

- Draft safety extends the current loaded `CareerSession`; it is not a second
  persistence mechanism.
- Temporary menu, hover, focus, active slot, and drag state are not durable.
- An incomplete draft cannot be persisted as a valid match plan.
- A complete draft is saved only through an explicit current command; normal
  manual and 7/15-day career commit semantics remain unchanged.
- The native browser warning is allowed for refresh/close because custom page
  dialogs cannot reliably intercept those exits.
- `campo-calcio.svg`, board geometry, tokens, role catalogs, suitability,
  candidate ordering, and interactions are immutable in this step.

## Expected Files

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/app/CareerAppFrame.tsx`
- `apps/web/src/app/CareerAppFrame.test.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.tsx`
- `apps/web/src/features/app-shell/UnsavedCareerDialog.test.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-career-loop.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/runtime/career-session.ts`
- `apps/web/src/runtime/career-session.test.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No localStorage, IndexedDB, temporary database, or per-action career save.
- No tactical-board source, SVG, geometry, role, suitability, or interaction
  redesign.
- No tactic effects, new formation, new validation rule, or match-engine change.
- No generalized form framework or global undo stack.
- No silent discard or silent write-through.

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

- Capture empty, partial, complete, invalid, dirty, dialog, pending, error,
  desktop, and narrow preparation states.
- Change one starter, one bench player, formation, and tactic independently;
  verify dirty state and exact cancel/discard/save outcomes.
- Verify refresh protection and saved-state recovery through real SQLite/OPFS.
- Verify keyboard focus enters and leaves the dialog correctly and the board
  remains fully operable by pointer, touch, long press, and keyboard.
- Compare tactical-board screenshots with the approved baseline.

## Cleanup Boundary

Remove draft mutation paths that bypass the session contract, repeated blocker
blocks, obsolete dirty selectors, and compatibility assertions replaced by the
new tested owner. Keep no temporary draft persistence bridge.

## Completion Criteria

- Non-empty preparation work cannot disappear silently.
- Every exit outcome is deliberate and refresh-safe.
- Saving remains explicit and career commit cadence is unchanged.
- Readiness appears once and the board remains the dominant football surface.
- Tactical-board visual and behavioral regression suites pass unchanged.
- No dead draft path, selector, dialog branch, or compatibility helper remains.

## Implemented Solution

- One structural draft fingerprint compares formation, normalized slots,
  assignments, ordered bench, and tactic with the loaded career baseline.
- Exact undo reconciles the draft back to clean; discard rehydrates the loaded
  baseline instead of approximating it.
- Dashboard, Posta, Continue, Matchday, and Main menu navigation share one
  accessible Stay/Discard guard. A complete valid plan additionally exposes
  explicit Save and continue; incomplete work can never be persisted as valid.
- Browser refresh/close participates in the same truthful dirty projection via
  the native unload warning.
- The runtime accepts preparation only at the existing explicit manual-save
  boundary. Tactical edits still perform zero per-action writes and do not
  change 7/15-day autosave cadence.
- Preparation now owns one blocker/success strip beside one confirmation
  command. Repeated context and readiness narration were removed.
- Narrow and 200% text layouts reflow the surrounding toolbar, board header,
  and bench grid without changing board source, SVG, geometry, tokens, roles,
  suitability, candidate order, or interactions.

## Verification Result

- Node `24.19.0`.
- i18n tests PASS.
- web tests PASS: 49 files / 208 tests.
- web typecheck and production build PASS.
- canonical Playwright PASS: 9/9 journeys, including empty, partial, complete,
  invalid, pending, error, native unload, Stay, Discard, explicit Save,
  SQLite/OPFS reload, desktop, narrow, and 200% text states. Captures are under
  `/tmp/the-long-season-phase73b/step-05/`.
- dependency-cruiser PASS: 498 modules / 1,759 dependencies.
- full `pnpm check` PASS: 162 files / 963 tests.

## Lesson Learned

Preparation safety is a session concern, not a reason for per-action
persistence. Structural comparison plus explicit commit/discard boundaries
keeps the football board immediate while making every exit truthful. Text zoom
also requires grid tracks and command labels to reflow; hiding overflow would
have passed a superficial screenshot while breaking real usability.

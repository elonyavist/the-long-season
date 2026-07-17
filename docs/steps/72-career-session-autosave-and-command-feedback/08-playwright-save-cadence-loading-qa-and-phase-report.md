# Step 08 - Playwright Save Cadence, Loading QA, And Phase Report

## Status

Done.

## Goal

Prove the complete save cadence and command-feedback experience in Chromium,
remove remaining obsolete code, reconcile architecture documentation, and close
the phase with one next recommendation.

## Scope

- Add desktop and narrow Playwright journeys for all save policies.
- Use controlled test latency to make each real pending state observable without
  adding production delays.
- Prove initial save, dirty session, manual save, 7-day autosave, 15-day
  autosave, manual-only mode, policy-only persistence, and matchday postponement.
- Prove refresh restores the last durable baseline and discards unsaved actions.
- Prove main-menu and browser-exit warnings.
- Prove manual save is unavailable during active matchday with clear reasoning.
- Prove every major action-specific loading state, interaction lock, and error
  recovery path.
- Inspect OPFS/SQLite ownership and write counts; do not use a fallback store.
- Run accessibility, narrow-overflow, focus, and reduced-motion checks.
- Scan for old write-through helpers, pending refs, duplicate dirty/loading
  state, dead policy branches, and unused production files.
- Update architecture and roadmaps with final ownership.
- Write visual QA and phase reports, including user-visible evidence and known
  non-blocking limitations.

## Expected files

- `apps/web/src/visual-qa/career-session-autosave-and-loading.spec.ts`
- `docs/audits/WEB_CAREER_SESSION_AUTOSAVE_AND_LOADING_VISUAL_QA.md`
- `docs/audits/WEB_CAREER_SESSION_AUTOSAVE_AND_COMMAND_FEEDBACK_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- Focused source/test files above only when QA reveals a Phase 72 regression.

## Required Playwright journeys

1. Create career, verify clean initial baseline, mutate, and manual save.
2. Select 7-day policy, advance across the 6/7-day boundary, and verify one
   safe-stop write.
3. Select 15-day policy and verify the 14/15-day boundary.
4. Select manual-only and verify no scheduled write.
5. Change policy while dirty and verify gameplay remains unsaved.
6. Become autosave-due during matchday and verify the write occurs only after
   return to dashboard/attention.
7. Reload with unsaved progress and verify the durable baseline is restored.
8. Exercise Save-and-exit, Exit-without-saving, Cancel, and active-match loss
   warning.
9. Hold each major command pending and verify its specific label, disabled
   controls, stable layout, `aria-busy`, and live status.
10. Force a save failure and verify the working session remains dirty and usable.

## What NOT to implement

- No production delay or QA-only branch in application behavior.
- No screenshot-only acceptance without behavioral assertions.
- No hidden recovery or alternate persistence to make refresh tests pass.
- No Inbox/Posta expansion.
- No unrelated visual cleanup or feature work.
- No deferred dead-code cleanup without an explicit blocker.

## Required checks

```bash
nvm use 24
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm --filter @game/i18n run typecheck
pnpm depcruise
pnpm check
node --experimental-strip-types apps/web/src/visual-qa/career-session-autosave-and-loading.spec.ts
git diff --check
graphify update .
```

## Completion criteria

- Playwright passes on desktop and narrow viewports.
- Screenshots show clear save status and command feedback without visual clutter
  or frozen-looking transitions.
- Behavioral assertions prove exact save cadence and safe-stop postponement.
- Accessibility checks cover busy state, focus, keyboard actions, dialog
  semantics, non-color status, and reduced motion.
- Source scans find no action-level save/reload helper, invisible pending ref,
  duplicate loading source, or unused save-policy path.
- `docs/ARCHITECTURE.md` explains session, durable baseline, commit cadence,
  command runner, and presentation ownership for a junior developer.
- Phase 72 is marked complete or blocked with evidence.
- Exactly one next phase is recommended:
  `Phase 73 - Inbox/Posta Decision Center And Career Attention Workflow`.

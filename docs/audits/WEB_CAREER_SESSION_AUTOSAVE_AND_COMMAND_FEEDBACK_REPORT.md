# Web Career Session Autosave And Command Feedback Report

Date: 2026-07-13  
Phase: `72-career-session-autosave-and-command-feedback`

## Outcome

Phase 72 is complete. A loaded browser career now has one in-memory working
session over one durable baseline. Normal gameplay commands no longer write and
reload SQLite after every action. The manager saves manually or through a
per-career 7-day/15-day policy; manual-only mode never schedules a commit.

Every meaningful asynchronous career command now acknowledges the click with a
specific localized label, restrained progress mark, interaction lock, and
accessible busy/live status while preserving the current football context.

## Final Ownership

```text
React screen action
  -> useCareerCommandRunner
       -> one Zustand CareerCommandActivity lock
       -> WebCareerRuntime command
            -> one loaded CareerSession working state
            -> deterministic engine/content transition
            -> manual or due safe-stop commit only
                 -> CareerStorage
                      -> SQLite WASM worker
                           -> OPFS
```

- `CareerSession` owns working state, durable baseline, dirty state, policy,
  persisted game date, and postponed-autosave state.
- `WebCareerRuntime` applies application use cases and commits only at explicit
  save boundaries. Its old invisible Promise queue was removed.
- `useCareerCommandRunner` and `career-ui-store` own the single observable
  asynchronous mutation lock.
- React screens render command status and disable conflicts; they do not infer
  loading from elapsed time or match playback flags.
- SQLite/OPFS remains the only browser career persistence owner.

## Save Semantics

- Career creation writes one initial baseline.
- Continue, preparation, first half, half-time decisions, second half, full
  time, and acknowledgment update working memory without action-level writes.
- Manual save commits the complete validated working state at a safe screen.
- Autosave is due from canonical in-game dates at 7 or 15 elapsed days.
- Manual-only mode never autosaves.
- A due autosave during matchday is postponed until a safe club stop.
- A policy change persists metadata only and never makes dirty gameplay clean.
- A failed save keeps the working session dirty and available.

## Command Feedback

The production command vocabulary contains only commands with current callers:
save discovery, create/load, Continue, manual save, policy update, preparation
confirmation, first half, second half, and dashboard return. There is no fake
autosave command, generic command bus, loading framework, timer, or invented
progress percentage.

One final Chromium gate exposed and fixed a Strict Mode discovery race: the
diagnostic mount could acquire the command lock and leave the effective mount
in `storage_loading`. Runtime creation now starts in the next microtask, so the
diagnostic mount cancels before opening SQLite or acquiring the lock.

## Verification Summary

- `pnpm check` passes across the monorepo with 151 test files and 899 tests.
- Storage, web, and i18n typechecks pass; the focused web suite passes with 161
  tests; the production web build and dependency cruise pass.
- Runtime tests prove exact save counts, zero action writes, manual-only
  behavior, 7-day autosave, postponed autosave, reload rollback, and failed-save
  dirty-state preservation.
- Storage tests prove policy migration and metadata-only policy updates.
- React/store tests prove the single pending command, duplicate rejection,
  action-specific labels, inert/disabled states, and error exposure.
- Playwright proves the full desktop/narrow user journey and OPFS ownership;
  details are in
  `docs/audits/WEB_CAREER_SESSION_AUTOSAVE_AND_LOADING_VISUAL_QA.md`.
- Source scans find no action save/reload helper, hidden pending ref, duplicate
  runtime queue, or alternate browser persistence path.

## Dead-Code Review

Deleted or absent after final scan:

- action-level save/reload helpers;
- preparation and matchday pending refs;
- runtime `commandTail` / `enqueueCommand` queue;
- duplicate dirty/loading booleans;
- IndexedDB/localStorage/sessionStorage/memory career fallbacks;
- unused autosave timer, queue, recovery slot, or storage table.

The Phase 71 active-match schema remains readable only for save compatibility;
Phase 72 does not write it as a hidden match recovery mechanism.

## Next Phase

Exactly one next phase is recommended:
`Phase 73 - Inbox/Posta Decision Center And Career Attention Workflow`.

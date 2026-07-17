# Step 01 - Current Write-Through And Feedback Audit

## Status

Done.

## Goal

Record the exact current save/write lifecycle and asynchronous command-feedback
gaps before changing production code.

## Scope

- Trace career creation, load, Continue, preparation, staged matchday,
  full-time commit, acknowledgment, and dashboard return through React,
  Zustand, `WebCareerRuntime`, `CareerStorage`, and SQLite/OPFS.
- Count durable writes and reloads in one complete current match journey.
- Identify every helper that couples gameplay mutation to persistence.
- Identify every pending ref, local flag, disabled control, and loading/error
  surface used by asynchronous career commands.
- Define the safe-stop matrix for dashboard, Posta/attention, preparation,
  pre-match, first half, half-time, second half, and full-time review.
- Confirm how autosave policy can be added to canonical per-career metadata
  without committing dirty gameplay state.
- Record the exact deletion ledger for later steps.
- Check constraints in `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`.

## Expected files

- `docs/audits/WEB_CAREER_SAVE_CADENCE_AND_COMMAND_FEEDBACK_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/steps/72-career-session-autosave-and-command-feedback/02-career-session-and-save-policy-contract.md` only if an audit lesson changes its future scope.

## Required audit contents

- Current call graph and ownership map.
- Write/reload count by user action.
- Current user-visible and invisible pending behavior.
- Safe-stop decision table.
- Storage/schema impact.
- Exact symbols and files to delete or replace.
- Risks to determinism, dirty-state integrity, and matchday continuity.
- Explicit confirmation that SQLite/OPFS remains the only browser persistence.

## What NOT to implement

- No source-code changes.
- No schema or package changes.
- No save policy, session store, loader, or UI control.
- No Inbox/Posta expansion.
- No speculative abstraction without a mapped current caller.

## Required checks

```bash
git diff --check
```

## Completion criteria

- Every current durable write and reload is accounted for.
- Every asynchronous career command and feedback gap is accounted for.
- The safe-stop policy is unambiguous.
- The deletion ledger is specific enough to prevent compatibility leftovers.
- `docs/PROJECT_STATUS.md` marks Step 01 Done and Step 02 as the next action.

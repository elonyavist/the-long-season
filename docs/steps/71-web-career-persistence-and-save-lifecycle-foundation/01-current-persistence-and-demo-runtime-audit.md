# 01 - Current Persistence And Demo Runtime Audit

## Goal

Define the exact migration from the current in-memory web prototype to one
durable browser career before installing SQLite or changing production code.

## Scope

- Map current ownership of:
  - `GameStorage`, `CareerStorage`, and their JSON adapters;
  - `CareerState` and current migration functions;
  - app entry, Zustand lifecycle state, dashboard, Continue, Posta,
    preparation, and staged matchday;
  - every production `Demo*`, `demo-*`, `WEB_DEMO_*`, and `hasDemoCareer`
    symbol participating in the web lifecycle.
- Apply the deletion test to overlapping storage and runtime Modules.
- Confirm the canonical product save seam and record why it is retained.
- Design the relational SQLite schema at table/foreign-key/order-column level.
- Decide and document the official SQLite VFS, worker bootstrap, Comlink seam,
  COOP/COEP configuration, and browser support behavior.
- Define exactly which state is committed at new career, preparation,
  pre-match, half-time, full time, and dashboard return.
- Produce a file-by-file replacement/deletion ledger for later steps.
- Update Step 02 if the audit finds a different ownership path.

## What NOT to implement

- No package installation.
- No TypeScript, SQL, React, Zustand, Vite, or CSS changes.
- No speculative tables for future systems.
- No fallback storage design.
- No Inbox/Posta expansion.

## Expected files

- `docs/audits/WEB_CAREER_PERSISTENCE_ARCHITECTURE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/02-canonical-career-storage-interface-and-package-seams.md`

## Required checks

```bash
git diff --check
```

## Manual inspection

Review the audit, especially:

- canonical storage interface;
- SQLite table plan;
- active-match checkpoint ownership;
- demo-code deletion ledger;
- absence of IndexedDB/localStorage fallback.

## Definition of Done

- Every current lifecycle source of truth is identified.
- The SQLite/OPFS integration path is implementable without violating package
  dependencies.
- The audit names the code that will be deleted, not just code to add.
- No unresolved architecture decision is silently passed to Step 02.


# Step 01 - Current Attention And Posta Audit

## Status

Ready.

## Goal

Record the current Continue, attention, Inbox persistence, routing, and Posta
presentation paths before replacing them.

## Scope

- Trace `Continue` from the shell command through Zustand, runtime, engine,
  session replacement, autosave, and route selection.
- Record every current stop reason, attention category, message category,
  action ID, status, and production caller.
- Prove where preparation and matchday currently create two message identities.
- Record whether messages are derived, durable, or only retained in UI state.
- Trace the current Posta rail position, selection behavior, action routing,
  localization, and narrow layout.
- Identify exact deletion/replacement targets for obsolete message constructors,
  screen branches, CSS, tests, and visual QA.
- Lock the agreed blocking/important/informational taxonomy, one-stop-per-date
  rule, lifecycle semantics, matchday policy, two-column UX, and calendar
  transition in an audit.

## Expected files

- `docs/audits/CAREER_ATTENTION_AND_POSTA_CURRENT_STATE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/02-canonical-attention-level-and-message-lifecycle-contract.md` only if the audit changes its assumptions.

## What NOT to implement

- No production source changes.
- No new message type, status, route, database table, or UI component.
- No visual mockup presented as implemented behavior.
- No speculative future-system category.

## Required checks

```bash
nvm use 24
test -f docs/audits/CAREER_ATTENTION_AND_POSTA_CURRENT_STATE_AUDIT.md
git diff --check
```

## Completion criteria

- Every current Continue and Posta owner is mapped.
- The audit distinguishes derived facts from durable lifecycle state.
- Every obsolete path has a named removal step.
- Product decisions from the Phase README are recorded without ambiguity.
- `docs/PROJECT_STATUS.md` marks Step 01 Done and Step 02 active.

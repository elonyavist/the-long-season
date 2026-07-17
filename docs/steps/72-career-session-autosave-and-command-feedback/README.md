# Phase 72 - Career Session Autosave And Command Feedback

## Goal

Replace the Phase 71 write-through browser lifecycle with a deliberate career
session model and make every meaningful asynchronous command visibly responsive.

At the end of this phase:

1. a new career is written once when it is created;
2. gameplay changes live in one in-memory working session;
3. the manager can save explicitly outside an active match;
4. autosave runs every 7 in-game days by default, with 15-day and manual-only
   policies available;
5. autosave waits for a safe career stop and never interrupts live matchday;
6. unsaved progress is clearly identified and protected by exit warnings;
7. actions such as starting a match, playing a half, saving, continuing, and
   returning to the dashboard expose immediate, action-specific feedback.

This phase deliberately precedes the Inbox/Posta decision-center expansion.
Durable storage is already present, but its cadence and command feedback must
first match the expected Football Manager-style experience.

## User-facing reason

Saving after every click makes the game feel like a form connected directly to
a database and removes the manager's control over the career lifecycle. At the
same time, an asynchronous action without visible feedback feels frozen even
when it is working correctly.

The intended experience is deliberate and trustworthy:

- normal decisions feel immediate because they update the working session;
- the manager understands whether progress is saved;
- manual and scheduled saves are explicit, bounded operations;
- a command always acknowledges the click and explains what is happening;
- errors preserve the current unsaved session instead of silently discarding it.

## Binding save semantics

- `CareerState` in the loaded `CareerSession` is the authoritative working
  state while the app is open.
- SQLite WASM on OPFS remains the only browser career persistence adapter.
- Creating a career writes its first durable baseline.
- After creation, only manual save and due autosave may commit gameplay state.
- Autosave policy is per career: `7 days`, `15 days`, or `manual only`.
- The default policy is `7 days`.
- Autosave cadence uses the canonical in-game `GameDate`, never wall-clock time.
- Autosave runs only at a safe stop: dashboard, Posta/attention stop, or match
  preparation before entering the live match.
- If autosave becomes due during matchday, it is postponed until the manager
  returns to a safe club screen.
- Pre-match, first half, half-time, second half, and full-time review do not
  write career progress.
- Reloading or closing before a save restores the last durable baseline. There
  is no hidden recovery database, shadow checkpoint, or alternate persistence.
- Changing autosave policy persists only that preference. It must not
  accidentally commit dirty gameplay state.
- Manual save is unavailable during an active match because partially saved
  match progress is explicitly out of scope.

## Binding unsaved-exit semantics

- Dirty state is derived from the career session, not duplicated in React.
- Browser refresh/close uses `beforeunload` only while the session is dirty.
- Returning to the main menu while dirty opens one accessible decision dialog:
  `Save and exit`, `Exit without saving`, or `Cancel`.
- During active matchday, `Save and exit` is unavailable and the dialog clearly
  states that unsaved match progress will be lost.
- Failed saves keep the working state dirty and available for retry.

## Binding command-feedback semantics

- One typed Zustand command-activity state is shared across career actions.
- One small application-level command runner owns duplicate-click protection,
  pending publication, success cleanup, and error cleanup.
- Every asynchronous action displays its own progress label, for example:
  `Starting match`, `Playing first half`, `Saving career`, or
  `Returning to dashboard`.
- The clicked control keeps stable dimensions, becomes unavailable while its
  command is running, and exposes a visible spinner or equivalent restrained
  progress mark.
- Related conflicting controls are disabled, while the current football
  context remains visible.
- `aria-busy`, a polite live region, keyboard focus continuity, and reduced
  motion are required.
- There are no fake delays, fake percentages, fullscreen decorative loaders,
  generic toast frameworks, or global command buses.

## Architecture target

```text
React screens
  -> one Zustand career-session and command snapshot
  -> WebCareerRuntime
       -> CareerSession working state
       -> pure engine/content commands
       -> explicit manual/autosave commit
            -> CareerStorage
                 -> SQLite/OPFS worker
```

The runtime coordinates application behavior; it does not own football rules.
The session owns the mutable working snapshot; it does not replace the durable
storage contract. Presentation reads command activity; it does not infer
loading from elapsed time.

## No-dead-code contract

- Every new production Module must have a production caller in the same step.
- The current action-level `saveAndReload` helpers and pending refs are deleted
  when their replacements become active.
- There is exactly one gameplay commit path after career creation.
- There is exactly one command-activity source of truth.
- No compatibility write-through path remains after session ownership lands.
- No unused autosave scheduler, timer, queue, recovery slot, or storage table is
  introduced.
- No future Inbox/Posta, cloud-save, export, rotation, or multi-slot behavior is
  scaffolded without a current caller.
- Comments explain ownership or non-obvious invariants; they do not narrate
  obvious assignments.

## Ordered steps

1. [01-current-write-through-and-feedback-audit.md](01-current-write-through-and-feedback-audit.md)
2. [02-career-session-and-save-policy-contract.md](02-career-session-and-save-policy-contract.md)
3. [03-session-owned-gameplay-commands-without-action-saves.md](03-session-owned-gameplay-commands-without-action-saves.md)
4. [04-manual-save-autosave-scheduler-and-safe-stops.md](04-manual-save-autosave-scheduler-and-safe-stops.md)
5. [05-save-controls-policy-settings-and-unsaved-exit-guard.md](05-save-controls-policy-settings-and-unsaved-exit-guard.md)
6. [06-canonical-command-activity-and-async-runner.md](06-canonical-command-activity-and-async-runner.md)
7. [07-action-specific-loading-and-interaction-locks.md](07-action-specific-loading-and-interaction-locks.md)
8. [08-playwright-save-cadence-loading-qa-and-phase-report.md](08-playwright-save-cadence-loading-qa-and-phase-report.md)

## Phase-level checks

- Focused runtime, store, storage, React, and i18n tests for each touched Module.
- Write-count tests proving gameplay actions do not persist individually.
- Boundary tests for 7-day, 15-day, manual-only, and postponed autosave.
- Reload tests proving unsaved changes return to the durable baseline.
- Failure tests proving save errors preserve dirty working state.
- `pnpm --filter @game/storage run typecheck`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm depcruise`
- `pnpm check`
- Playwright desktop and narrow QA for save cadence, exit warnings, loading,
  disabled states, errors, keyboard behavior, and reduced motion.
- `git diff --check`
- `graphify update .` after source changes.

Run `nvm use 24` before project commands and before every dependency change.

## What NOT to implement in this phase

- No Inbox/Posta category or decision-center expansion.
- No cloud saves, export/import, save rotation, or multiple autosave slots.
- No persistent mid-match recovery or hidden checkpoint database.
- No IndexedDB, localStorage, sessionStorage, or memory persistence fallback.
- No wall-clock autosave timer.
- No background save during live matchday.
- No generic command bus, queue framework, toast system, or loading framework.
- No fake delay, minimum spinner duration, or invented progress percentage.
- No broad redesign of the accepted shell, tactical board, or matchday layout.
- No engine, balance, market, finance, youth, staff, or content changes.

## Definition of Done

- Career creation writes one initial durable baseline.
- Gameplay actions update one working session without storage writes.
- Manual save commits the full validated working state at safe career screens.
- Autosave commits at the selected 7-day or 15-day cadence, or remains disabled
  under manual-only policy.
- Autosave due during matchday waits until the next safe stop.
- Reload before saving restores the last durable baseline.
- Dirty state, last saved state, policy, and save failures are understandable.
- Main-menu and browser-exit warnings prevent accidental progress loss.
- Every meaningful asynchronous career/matchday action gives immediate,
  accessible, action-specific feedback without layout shift.
- Replaced action-save helpers, reload chains, and invisible pending refs are
  deleted.
- There is no dead production code or alternate save/loading path.
- Playwright proves the experience on desktop and narrow viewports.
- `pnpm check` passes.
- The final report recommends exactly one next phase:
  `Phase 73 - Inbox/Posta Decision Center And Career Attention Workflow`.


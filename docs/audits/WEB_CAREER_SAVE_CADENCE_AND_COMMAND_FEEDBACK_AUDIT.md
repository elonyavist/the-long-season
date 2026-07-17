# Web Career Save Cadence And Command Feedback Audit

Date: 2026-07-13  
Phase: `72-career-session-autosave-and-command-feedback`  
Step: `01-current-write-through-and-feedback-audit`

## Purpose

This audit records the current browser save lifecycle before Phase 72 changes
ownership. The user-facing problem is not SQLite itself: Phase 71 correctly
made browser careers durable through SQLite WASM on OPFS. The problem is that
gameplay commands currently use durable storage as their working memory, and
several asynchronous commands provide no visible acknowledgement after a
click.

The target is one in-memory career session, one explicit commit path, and one
observable command-activity source. SQLite/OPFS remains the only browser
persistence adapter.

## Current Call Graph

```text
React action in App.tsx
  -> local pending ref (some match/preparation commands only)
  -> WebCareerRuntime command
       -> CareerStorage.loadCareer(saveId)
       -> pure engine/runtime transition
       -> CareerStorage.saveCareer(...)
       -> CareerStorage.loadCareer(saveId)
  -> Zustand receives the reloaded durable result
  -> React rerenders

CareerStorage
  -> web SQLite worker
  -> SqliteCareerStorage
  -> relational transaction in OPFS
```

`WebCareerRuntime.commandTail` serializes runtime promises, but it is not
observable by React. `App.tsx` also owns `preparationSavePendingRef` and
`matchdayCommandPendingRef`; these prevent some duplicate calls but do not
publish a loading label, `aria-busy`, or a disabled state to the clicked
control.

## Write And Reload Count

| User action | Durable writes | Durable loads | Current behavior |
|---|---:|---:|---|
| Create career | 1 | 1 | Creates the baseline, then reloads it. |
| Open existing career | 0 | 1 | Loads the selected save. |
| Continue | 1 | 2 | Loads, advances to attention, saves, then reloads. |
| Save preparation / enter pre-match | 1 | 2 | Loads, creates the active match checkpoint, saves, then reloads. |
| Play first half | 1 | 2 | Loads, progresses to half-time, saves the checkpoint, then reloads. |
| Apply half-time decision and finish match | 2 | 3 | Saves the decision checkpoint, reloads it, commits full time, saves again, then reloads. |
| Acknowledge full time / return to dashboard | 1 | 2 | Loads, retargets preparation, saves, then reloads. |

A complete new-career match journey with one Continue currently performs **7
writes and 12 loads**. Without the optional Continue command it still performs
6 writes and 10 loads. These writes are application-driven, not required by
the football engine.

## Current Ownership Map

| Concern | Current owner | Problem |
|---|---|---|
| Durable career graph | SQLite/OPFS through `CareerStorage` | Correct owner. |
| Working gameplay state | Repeated storage load results | Storage is acting as session memory. |
| Current web screen and drafts | Zustand `career-ui-store` | Correct presentation boundary, but descriptions assume every accepted result is already durable. |
| Runtime ordering | `WebCareerRuntime.commandTail` | Useful serialization, but invisible and duplicated by React refs. |
| Preparation duplicate-click guard | `App.preparationSavePendingRef` | Invisible mutable ref; controls remain visually active. |
| Matchday duplicate-click guard | `App.matchdayCommandPendingRef` | One ref covers several commands without action-specific feedback. |
| App-entry loading | Zustand `storageLifecycleStatus` | Visible, but only describes startup/load, not gameplay commands. |
| Match playback presentation | local matchday playback flags | Changes visible period immediately, before the runtime command resolves. |

## Feedback Gaps By Command

| Command | Current guard | Current visible feedback | Required replacement |
|---|---|---|---|
| Create/load career | store lifecycle state | Generic entry loading copy | Keep entry state, route through canonical command activity where career command ownership begins. |
| Continue | lifecycle state | Generic career loading screen | Action-specific `Continuing career` feedback without replacing the football context. |
| Save preparation / enter match | hidden ref | None | `Saving preparation` / `Opening match centre`, stable disabled control, busy region. |
| Start first half | hidden matchday ref plus local playback flag | Screen changes, but no operation acknowledgement | `Playing first half`, visible progress mark, conflicting actions locked. |
| Start second half / apply decision | hidden matchday ref plus local playback flag | Screen changes, but no operation acknowledgement | `Applying changes and playing second half`. |
| Finish match | hidden matchday ref | None | `Finalising match`. |
| Return to dashboard | hidden matchday ref | None | `Returning to dashboard`. |
| Manual save | absent | absent | `Saving career`, success/failure state without fake delay. |

## Safe-Stop Matrix

| Career location | Manual save | Autosave | Reason |
|---|---|---|---|
| Dashboard | Allowed | Allowed when due | Stable club-level state. |
| Posta / attention stop | Allowed | Allowed when due | The manager is stopped before resolving the decision. |
| Match preparation before entering pre-match | Allowed | Allowed when due | Lineup/tactic draft can be committed without partial match progress. |
| Pre-match match centre | Blocked | Postponed | An active match journey has started. |
| First half | Blocked | Postponed | Partial match progress must remain session-only. |
| Half-time | Blocked | Postponed | Substitutions and tactical decisions belong to the active match. |
| Second half | Blocked | Postponed | Partial match progress must remain session-only. |
| Full-time review | Blocked | Postponed | Consequences are visible, but the manager has not returned to a stable club screen. |
| Dashboard after acknowledgment | Allowed | Run if overdue | The completed match is now part of one stable working career snapshot. |

If autosave becomes due immediately before match entry, the prepared working
state is committed first and the active match then starts in memory. Reloading
during a live match intentionally restores that last durable pre-match
baseline. Phase 72 does not introduce mid-match recovery.

## Storage And Schema Impact

The smallest compatible policy contract is:

- autosave interval: `7`, `15`, or `null` (`null` means manual only);
- default for new and migrated saves: `7`;
- policy stored in `SaveMetadata`, not in `CareerState`;
- one narrow `CareerStorage.updateAutosavePolicy` operation;
- policy updates preserve the career graph and the gameplay `updatedAtISO`;
- the last persisted game date derives from
  `durableBaseline.gameState.calendar.currentDate`, so no duplicate date column
  or wall-clock cadence field is needed.

JSON requires a versioned envelope migration from the current V1 shape. SQLite
requires one additive migration after schema version 4 and must preserve the
existing policy during full graph replacement. The worker protocol and
relational mapper must carry the metadata field explicitly. No IndexedDB,
localStorage, sessionStorage, memory fallback, recovery table, or second
repository is permitted.

## Deletion And Replacement Ledger

| Step | Delete or replace | Replacement |
|---|---|---|
| 03 | `WebCareerRuntime.saveNamedCareer` and `saveAndReloadMatchday` action helpers | Session transitions returning working snapshots without storage writes. |
| 03 | Per-command `loadCareer -> mutate -> saveCareer -> loadCareer` chains | Runtime-owned loaded `CareerSession`. |
| 03 | Store language and methods that imply every gameplay update is durable | Session snapshot updates with explicit durable metadata only after commit. |
| 04 | Any remaining gameplay-call-site use of `saveCareer` | One manual/autosave commit function after initial creation. |
| 06 | `WebCareerRuntime.commandTail` and React pending refs | One typed command runner and one Zustand command-activity snapshot. |
| 07 | UI-local inference of command progress from match playback flags | Action-specific labels, stable disabled controls, `aria-busy`, and live-region feedback. |

Phase 71 active-match schema remains readable for save compatibility, but
Phase 72 removes its production write callers. It is not reused as a hidden
recovery path. Once no compatibility reader needs that schema, a future
explicit migration may remove it; deleting it inside this phase would make
existing Phase 71 saves unreadable and is therefore not valid cleanup.

## Risks And Required Tests

- **Dirty-state integrity:** policy updates must not make a dirty session clean
  or overwrite its working state.
- **Baseline aliasing:** durable and working snapshots must not share mutable
  references.
- **Date determinism:** due checks use canonical `GameDate`, never `Date.now()`.
- **Match continuity:** no save occurs between pre-match and dashboard return;
  due autosave survives as pending session state.
- **Failure recovery:** a failed commit leaves the complete working state dirty
  and retryable.
- **Duplicate commands:** one observable runner must reject or serialize a
  second conflicting command without a second engine transition.
- **Migration safety:** JSON V1 and SQLite schema 4 saves default to 7-day
  policy without changing their career graph.
- **Write count:** tests must prove ordinary gameplay commands perform zero
  storage writes after creation.

## Audit Decision

Proceed with Step 02. Introduce the metadata policy and real `CareerSession`
contract first, then remove write-through in Step 03. Do not add a scheduler,
loading UI, Inbox/Posta behavior, or alternate persistence during the contract
step.

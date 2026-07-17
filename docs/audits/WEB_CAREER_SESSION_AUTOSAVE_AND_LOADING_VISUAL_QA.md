# Web Career Session Autosave And Loading Visual QA

Date: 2026-07-13  
Phase: `72-career-session-autosave-and-command-feedback`  
Browser: Chromium through Playwright  
Node: `24.16.0`

## Scope

The direct Playwright journey exercises the real Vite application and the
SQLite WASM/OPFS adapter. It does not add production delays, test-only runtime
branches, alternate storage, or screenshot-only acceptance.

The script verifies:

- initial career creation and a clean durable baseline;
- 7-day, 15-day, and manual-only policy persistence;
- exact 6/7 and 14/15 cadence boundaries through `CareerSession`;
- policy changes that do not commit dirty gameplay;
- postponed autosave state during unsafe matchday phases;
- unsaved reload returning to the durable baseline;
- manual save, recoverable save failure, and dirty-state preservation;
- Cancel, Save and exit, Exit without saving, and active-match loss warning;
- specific pending feedback for creation, Continue, policy update, manual save,
  preparation confirmation, both match halves, and dashboard return;
- OPFS database ownership with no career data in IndexedDB or localStorage;
- keyboard focus in the native exit dialog, `aria-busy`, polite live status,
  reduced motion, and narrow horizontal-overflow protection.

## Screenshot Evidence

| Screenshot | Finding |
|---|---|
| `/tmp/the-long-season-phase72/01-pre-match-loading-desktop.png` | The score, fixture, phase rail, and save restriction remain visible while `Playing first half...` locks the command. |
| `/tmp/the-long-season-phase72/02-half-time-loading-desktop.png` | The tactical board, bench, first-half facts, and ratings remain visible while `Playing second half...` prevents conflicting edits. |
| `/tmp/the-long-season-phase72/03-saved-app-entry-desktop.png` | Save and exit returns to a usable app entry screen with the durable career available. |
| `/tmp/the-long-season-phase72/04-dashboard-loading-narrow.png` | `Advancing career...` remains legible at 390 px with no horizontal document overflow. |
| `/tmp/the-long-season-phase72/05-preparation-loading-narrow.png` | Confirmation feedback keeps the selected XI, bench, tactic, and save context visible without overlap. |

## Visual Findings

- Pending controls retain stable geometry; no button text causes layout shift.
- The initial generic disabled opacity made gold pending controls too faint.
  The final CSS keeps real pending buttons fully legible while ordinary disabled
  controls remain visually subdued.
- Desktop and narrow screens preserve football context instead of showing a
  fullscreen loader.
- The narrow layout is long by design, but it has no horizontal overflow,
  clipped command label, or unreachable control.

## Accessibility Findings

- One polite live region announces the active command.
- Relevant screen regions expose `aria-busy="true"`.
- Conflicting controls are disabled or placed in an inert subtree.
- The dirty-exit dialog receives focus on Cancel and restores control through
  explicit actions.
- Status is expressed with text and a spinner, not color alone.
- Under reduced motion the spinner becomes a static progress mark.

## Persistence Findings

- `the-long-season-careers.sqlite3` exists in OPFS and contains data after save.
- No career/save-named IndexedDB database is created.
- No career/save key is written to localStorage.
- Refresh before save restores the durable baseline; there is no hidden
  recovery snapshot.

## Non-Blocking Limitations

- Live match progress is intentionally not recoverable after refresh. The user
  receives an explicit loss warning before leaving matchday.
- Exact storage write counts and failed-write retry semantics are protected by
  deterministic runtime/storage unit tests; browser QA verifies user-visible
  policy and ownership rather than instrumenting private SQLite calls.


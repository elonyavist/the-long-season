# Web Inbox Decision Center Visual QA

Date: 2026-07-14  
Phase: `73-inbox-posta-decision-center-and-career-attention-workflow`  
Status: PASS

## Scope

Chromium exercised the production web runtime and SQLite WASM/OPFS storage,
not a mocked Posta screen. The journey covered creation, current-date message
delivery, list/detail navigation, lifecycle updates, preparation, match entry,
result delivery, manual save, 7/15-day autosave policies, refresh, normal
calendar movement, and reduced motion.

## Evidence

| Screenshot | Viewport | Evidence |
| --- | --- | --- |
| `/tmp/the-long-season-phase73/01-posta-decision-center-desktop.png` | 1440 x 960 | Blocking matchday message, rail awareness, filters, two-column workspace, structured football facts, and one primary action. |
| `/tmp/the-long-season-phase73/02-ready-matchday-message-desktop.png` | 1440 x 960 | The same fixture-scoped message after preparation, with the match-entry destination derived from readiness. |
| `/tmp/the-long-season-phase73/03-same-date-result-batch-desktop.png` | 1440 x 960 | Read matchday item and informational result coexist on one date without another blocking stop. |
| `/tmp/the-long-season-phase73/04-calendar-transition-desktop.png` | 1440 x 1109 | Existing dashboard context remains visible while the bounded calendar transition reports command progress. |
| `/tmp/the-long-season-phase73/05-reduced-motion-posta-desktop.png` | 1440 x 960 | Reduced motion reaches the coherent stop state without stepping animation. |
| `/tmp/the-long-season-phase73/06-posta-detail-narrow.png` | 390 x 1425 | Narrow detail route, explicit Back control, readable facts, and reachable primary action. |
| `/tmp/the-long-season-phase73/07-posta-list-narrow.png` | 390 x 1425 | Narrow message list and filters without horizontal overflow. |
| `/tmp/the-long-season-phase73/08-posta-text-zoom-narrow.png` | 390 x 2877 | Two-hundred-percent text rendering remains operable without horizontal overflow. |

## Accessibility Findings

- PASS: Posta is exposed as a named destination with list and detail regions.
- PASS: selected rows and filters expose state semantically; unread and
  attention meaning is not encoded by color alone.
- PASS: keyboard focus is visible and the narrow Back path returns focus to
  the selected message.
- PASS: command feedback uses the existing polite live announcement and keeps
  stable control geometry.
- PASS: desktop, narrow, and 200% text checks have no horizontal overflow.
- PASS: reduced motion bypasses decorative day stepping while preserving the
  same final date and destination.

## Product And Visual Findings

- The compact rail provides awareness without executing football decisions.
- The full destination reads as a dense manager workspace rather than a generic
  email client or nested-card dashboard.
- The blocking message answers why time stopped and exposes exactly one useful
  command. The result message is visibly informational and does not interrupt
  advancement.
- Same-date messages remain one coherent management moment and deterministic
  selection makes refresh behavior predictable.
- The short calendar movement adds feedback without pretending that the engine
  is progressing asynchronously.

## Verification

`pnpm exec playwright test apps/web/src/visual-qa/inbox-decision-center.spec.ts`
passed with 2 tests. The production journey also verified SQLite/OPFS reload,
manual save, 7-day autosave, 15-day deferred persistence, and dirty-session
rollback before save.


# Web Career Persistence Visual QA

Date: 2026-07-13  
Phase: `71-web-career-persistence-and-save-lifecycle-foundation`  
Step: `13-playwright-refresh-qa-architecture-and-phase-report`

## Scope

Chromium QA covers the complete durable browser career journey at `1440x960`
and `390x844`:

1. empty app entry;
2. create a career and see it in Continue;
3. refresh, explicitly load the selected save, and reach the dashboard;
4. save XI, bench, formation, board positions, and tactic;
5. refresh and restore pre-match;
6. play to half-time, refresh, restore the tactical decision, and move one
   outfield player;
7. complete full time, refresh, and restore the exact result;
8. return to the dashboard, refresh, and load the same career again;
9. abort the real SQLite worker bootstrap and verify focused recovery UI.

The executable specification is
`apps/web/src/visual-qa/web-career-persistence.spec.ts`. Screenshots are written
to `/tmp/the-long-season-phase71`.

## Results

- The available career survives every browser reload.
- Continue loads the selected durable save; refresh does not silently bypass
  the app entry decision.
- Preparation and the half-time checkpoint restore the current manager state.
- Full time restores the persisted score and structured report without running
  the fixture or its consequences a second time.
- The SQLite file `the-long-season-careers.sqlite3` exists in OPFS and has a
  non-zero byte size after the lifecycle.
- No career/save database is present in IndexedDB.
- No career/save key is present in localStorage or sessionStorage.
- Desktop and narrow pages have no horizontal document overflow at the tested
  decision states.
- The storage-unavailable alert receives focus, gives bounded localized copy,
  and exposes one explicit retry action.

## Defects Found And Fixed

The final browser journey exposed two architecture defects that unit-only QA did
not reveal:

1. A completed fixture was initially reconstructed as the next pre-match after
   refresh. The matchday adapter now prioritizes the persisted played fixture,
   restores `full_time`, and deterministically rebuilds ratings from structured
   report events.
2. A worker script bootstrap failure could leave the first Comlink request
   pending. The browser factory now observes worker `error` and `messageerror`,
   closes the failed worker, and returns a typed unavailable-storage failure.

Both fixes preserve the architecture: no synthetic browser test hook, fallback
storage, duplicated result, or cosmetic random rating was added.

## Visual Review

The dashboard, pre-match, half-time tactical board, full-time review, and
storage recovery remain coherent at both viewports. The half-time page is
necessarily tall on a narrow device, but content remains reachable and does not
clip horizontally. Storage recovery is prominent without replacing the fixed
product identity.

## Manual Inspection

Review these files in `/tmp/the-long-season-phase71`:

- `01-empty-app-entry-desktop.png` and `01-empty-app-entry-narrow.png`;
- `02-reloaded-dashboard-desktop.png`;
- `03-restored-pre-match-desktop.png`;
- `04-restored-half-time-desktop.png` and narrow counterpart;
- `05-restored-full-time-desktop.png` and narrow counterpart;
- `06-storage-unavailable-desktop.png` and narrow counterpart.

Then perform one manual cycle with DevTools Application storage open and verify
that only OPFS owns the career database.

Corrupt, future-schema, busy, quota, and write-failure branches are covered by
deterministic adapter/runtime/component tests. Browser visual QA intentionally
uses the real unavailable-worker path rather than a production test hook.

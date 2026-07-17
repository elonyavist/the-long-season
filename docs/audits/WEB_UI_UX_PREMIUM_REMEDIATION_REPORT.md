# Web UI/UX Premium Remediation Report

Date: 2026-07-16  
Phase: `73B-current-web-product-premium-remediation-and-journey-hardening`  
Status: Complete

## Outcome

Phase 73B closes the bounded remediation requested by the Phase 73A product
audit. The current browser loop is now one coherent, accessible football
management product from App Entry through Dashboard, Posta, preparation,
staged Matchday, full-time review, and return to the club.

The phase did not rewrite engine, persistence, save cadence, Posta lifecycle,
Continue semantics, deterministic Matchday, localization, or tactical-board
behavior. It removed presentation friction and obsolete paths only after the
current replacement was browser-proven.

## Manager Journey Improvements

1. The current task appears before repeated shell chrome on narrow screens.
2. Keyboard users can bypass navigation and receive focus on the visible screen
   heading only after a genuine top-level screen change.
3. Semantic danger, warning, success, selection, disabled, focus, and pending
   states are explicit and meet the documented contrast contract.
4. Dashboard presents one current manager task and omits raw IDs, diagnostic
   fallbacks, and duplicated readiness summaries.
5. Posta is one dense list/detail decision workspace; its active route no longer
   repeats the compact awareness rail.
6. Preparation drafts participate in truthful dirty-state protection, exact
   undo, Stay, Discard, native unload warning, and valid explicit Save.
7. Matchday no longer asks for clicks that only reveal predetermined half data.
   Start match presents the first half and stops at the real interval decision;
   interval confirmation presents the second half and stops at full time.
8. Half-time combines one concise first-half review with the unchanged shared
   tactical board, bench, formation change, substitutions, and one resume
   action.
9. Full time reads as one football story: result, decisive tabellino,
   selected-club ratings, meaningful player consequences, then one return.
10. App Entry, dialogs, loading, empty, error, recovery, and command feedback now
    use the same restrained premium football language as the career screens.

## Phase 73A P1 Closure

| Finding | Result | Evidence owner |
| --- | --- | --- |
| `Q-P1-01` preparation draft safety | Closed | structural draft comparison, dirty-exit dialog, unload guard, save/reload browser journey |
| `Q-P1-02` Matchday playback economy | Closed | bounded automatic first- and second-half presentation |
| `Q-P1-03` narrow task priority | Closed | compact narrow shell and current-product narrow screenshots |
| `Q-P1-04` technical content leaks | Closed | presenter-owned Dashboard and Matchday copy |
| `Q-P1-05` flattened hierarchy | Closed | semantic tokens plus screen-local composition |
| `Q-P1-06` missing bypass | Closed | localized skip command to the stable main landmark |
| `Q-P1-07` lost screen focus | Closed | genuine screen-change heading focus with same-screen focus preservation |
| `Q-P1-08` blocker contrast | Closed | browser-computed WCAG AA contrast assertion |
| `Q-P1-09` broad App composition | Closed | `CareerAppFrame` and focused presentation hook |
| `Q-P1-10` concentrated Matchday owner | Closed | live, half-time, and full-time phase components plus pure playback policy |
| `Q-P1-11` missing current visual gate | Closed | authoritative `pnpm web:visual:qa` command |

## Controlled Cleanup

The repository now retains only two browser specifications:

- `apps/web/src/visual-qa/current-product.spec.ts` owns the complete accepted
  journey, responsive states, accessibility, feedback, and tactical-board
  regression contract;
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts` owns the unique real
  SQLite/OPFS isolation, exact round-trip, and rollback proof.

Historical phase runners were deleted after their still-current assertions
were migrated. The following production-looking, test-only tactical paths were
also removed after current callers and replacement tests were verified:

- `apps/web/src/features/match-preparation/TacticalPitchLineup.tsx`;
- `apps/web/src/features/match-preparation/tactical-pitch-layout.ts`;
- `apps/web/src/features/tactics-board/tactical-board-adapters.ts`;
- their focused tests.

The current preparation and interval paths both use the shared normalized
`TacticalBoardPitch` directly. A final production-caller scan found no unused
CSS class selector. No compatibility bridge was retained.

## Verification

- Node `24.16.0`;
- i18n tests: pass;
- web typecheck: pass;
- web unit/component tests: `51` files, `211` tests, pass;
- web production build: pass;
- dependency rules: `483` modules and `1,673` dependencies, no violations;
- full repository check: `163` files and `965` tests, pass;
- canonical browser gate: `17/17`, pass through real SQLite/OPFS;
- visual evidence: `87` product screenshots and three reviewed contact sheets;
- `git diff --check`: pass;
- Graphify update: pass after final documentation reconciliation.

The browser evidence covers App Entry, Dashboard, Posta, preparation,
pre-match, both live halves, half-time, full time, dialog, pending, empty,
error, recovery, focus, `200%` text, reduced motion, keyboard, pointer, touch,
`1440x900`, `1920x1080`, and `390x844`.

## Monitor Items

- The narrow full-time review is deliberately long because its remaining facts
  are useful and ordered; it has no horizontal overflow, overlap, or unreachable
  command.
- Vite reports a large JavaScript chunk. It remains a Monitor item until startup
  or interaction measurements demonstrate user-visible cost.
- Disabled future sections remain orientation only. They must not become active
  until their engine-backed workflow exists.

## Next Recommendation

Document and then execute exactly `Phase 74 - Player Generation And Model
Consolidation Cleanup`, preserving the now-authoritative web product gate while
consolidating player-model truth. This report does not start Phase 74.

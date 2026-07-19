# Matchday Broadcast Workspace Rework Report

Date: 2026-07-17  
Phase: `73c-matchday-broadcast-workspace-and-tabbed-review-rework`  
Status: Complete  
Decision: Pass

## Outcome

Phase 73C replaces the remaining report-like Matchday presentation with one
coherent football-broadcast workspace. The manager now follows the score, the
current incident, the compact match record, the interval decision, and the
post-match review without reading a growing event log or scanning simultaneous
diagnostic cards.

The phase changes presentation and interaction ownership only. Match truth,
ratings, deterministic checkpoints, career persistence, manual and scheduled
save cadence, Posta/Continue, localization, and the approved tactical board are
unchanged.

## Current Manager Journey

1. Pre-match uses the full career content outlet. The scoreboard owns fixture
   identity, score, side, progress, confirmation, and the only Start match
   command; the repeated Ready, Fixture, and Venue card is gone.
2. Start match computes the existing first-half checkpoint once, then presents
   its structured events through bounded holds. Pause/Resume and `1x`/`2x`/`4x`
   affect presentation only.
3. One polite live commentary line replaces its current incident in place. It
   never accumulates into a scrolling feed or changes page height.
4. A compact two-sided tabellino remains below the score. Goals lead the visual
   hierarchy; real substitutions and quieter supported incidents remain
   secondary. Empty match records are omitted.
5. Half time stops on the only live manager decision. Summary, Tactics, Your
   team, and Opponent tabs separate review from action while preserving the
   complete shared board, bench, formation, and substitution workflow.
6. One valid Start second half command presents the second half under the same
   bounded policy and stops at the durable full-time checkpoint.
7. Full time keeps the result and tabellino stable above Your team, Opponent,
   and Consequences tabs. One Return to Dashboard command closes the review.

## UX And Fun Review

- **Decision clarity:** every checkpoint exposes one primary command only when
  the manager can make a meaningful progression decision.
- **Football hierarchy:** score, current moment, match record, ratings, and
  tactical action read in match order rather than as a generic dashboard.
- **Pace:** routine events move quickly, significant events remain readable,
  and goals receive the longest restrained hold without becoming arcade-like.
- **Agency:** the interval combines current performance evidence with the real
  editable formation and bench instead of presenting a disconnected report.
- **Review value:** both clubs' ratings and durable selected-club consequences
  are available without forcing every fact into one long page.
- **No invented drama:** penalties, cards, injuries, and other unsupported
  incidents are absent until a real structured producer and lifecycle exist.

## Visual Review

Manual inspection covered the real SQLite/OPFS journey at desktop, wide, and
narrow widths. The accepted visual evidence is under:

`/tmp/the-long-season-phase73c/step-08/`

Key reviewed states include:

- `60-matchday-pre-match.png`: one full-width pre-match hierarchy;
- `64-first-half-goal-hold.png`: dominant but restrained goal moment;
- `66-half-time-arrival.png`: concise Summary and interval signals;
- `67a-half-time-tactics-narrow.png`: usable shared board after a real tactical
  edit;
- `74-full-time-event-rich.png`: final result, tabellino, and focused review;
- `74e-full-time-opponent.png` and `74f-full-time-consequences.png`: complete
  post-match tab coverage.

The route shows no horizontal page overflow, overlapping controls, cumulative
live-feed growth, or second page-level rail. Matchday uses all width provided by
the unchanged career shell.

## Accessibility And Responsive Review

- Half-time and full-time tabs use tablist/tab/tabpanel semantics, roving focus,
  arrow keys, Home/End, Enter, and Space.
- Playback controls have stable accessible names, visible focus, and explicit
  selected speed state.
- Commentary uses one stable polite live region, preventing repeated or
  duplicate announcements.
- Checkpoint changes move focus to the visible Matchday heading; same-screen
  controls retain interaction focus.
- Narrow and 200% text layouts reflow without horizontal scrolling or clipped
  football facts.
- Reduced motion removes interpolation and non-essential emphasis while keeping
  the same deterministic checkpoint facts and readable event moments.
- Pointer, touch, long-press, keyboard, and narrow tactical-board behavior stay
  covered by the canonical browser gate.

## Architecture And Ownership

| Owner | Responsibility |
| --- | --- |
| `career-matchday-presenter.ts` | Projects structured checkpoint facts into one current commentary moment, compact tabellino rows, and team/opponent rating rows. |
| `matchday-playback.ts` | Pure presentation policy and bounded frame projection for both halves; no persisted cursor or new match truth. |
| `MatchdayLivePhase.tsx` | Stable score/commentary/playback composition shared by both halves. |
| `MatchdayPlaybackControls.tsx` | Ephemeral Pause/Resume and speed controls. |
| `MatchdayTabellino.tsx` | Compact two-sided match record for currently supported incidents. |
| `MatchdayPhaseTabs.tsx` | Accessible reusable interval/full-time tab behavior, with no game facts. |
| `MatchdayTeamRatings.tsx` | Shared scan-friendly selected-team/opponent ratings view. |
| `MatchdayHalfTimePhase.tsx` | Four-tab interval composition and the existing real tactical/substitution decision. |
| `MatchdayFullTimePhase.tsx` | Three-tab final review and one Dashboard exit. |
| `CareerMatchdayScreen.tsx` | Five-state route, command boundaries, cancel-safe playback lifecycle, and phase-local focus. |

Engine/domain remain the sole owners of structured match facts. SQLite/OPFS
persists only the existing career and staged checkpoint truth. Pause, speed,
active tab, animation, and playback position remain ephemeral React state.

## Defect Found During The Gate

A real half-time board edit correctly dirtied match preparation, but the screen
then reused pre-match blocker copy and replaced Start second half with Prepare
match. That was a lifecycle bug: once the match is at half time, pre-match
readiness is no longer the governing validation contract.

The screen now evaluates saved-lineup/tactic blockers only during `pre_match`.
At half time, the dedicated tactical workspace validation and substitution
rules are authoritative. The canonical browser journey now performs a real
normalized board movement before starting the second half, and a focused test
guards this boundary.

## Dead-Code Closeout

Removed after replacement coverage:

- the old two-select `HalfTimeSubstitutionPanel` fallback;
- its player-option formatter;
- its dedicated CSS selectors;
- its outgoing/incoming/apply/player-option labels in all five languages;
- the obsolete localization assertion.

The typed `WebHalfTimeSubstitutionPanel` contract is intentionally retained. It
has current production callers: the screen presentation hook builds it, the
half-time workspace uses its change count, history, and validation, board
assignment invokes the current substitution command, and the career UI store
applies the durable staged change. Removing it would delete current behavior,
not dead code.

`sqlite-opfs-storage.spec.ts` is also retained because it owns unique isolation,
round-trip, and rollback evidence not duplicated by the visual journey.

No accumulating live feed, duplicated lower pre-match summary, parallel
full-time report, reveal-only manager click, compatibility wrapper, inert event
kind, or hidden tactical fallback remains in the current Matchday path.

## Dependency And Code-Quality Review

- No dependency was added.
- Dependency-cruiser passes across `498` modules and `1,721` dependencies.
- Focused components own one current repeated or independently testable
  responsibility; no generic match-viewer framework or second state machine was
  introduced.
- Playback cancellation covers pause, speed change, phase change, failure, and
  unmount.
- The canonical browser specification owns current Matchday behavior;
  SQLite/OPFS keeps only its unique storage proof.
- The approved pitch SVG, normalized geometry, role catalog, suitability,
  tokens, drag zones, bench rules, and no-duplicate behavior are unchanged.

## Verification

- Node `24.16.0`;
- i18n tests: pass;
- web tests: `56` files and `235` tests, pass;
- web typecheck: pass;
- web production build: pass;
- dependency rules: `498` modules and `1,721` dependencies, no violations;
- full repository check: `168` files and `991` tests, pass;
- canonical browser gate: `18/18`, pass through real SQLite/OPFS;
- browser coverage: pre-match, both halves, ordinary/significant/goal holds,
  Pause/Resume, all speeds, all interval/final tabs, a real tactical change,
  refresh at each durable checkpoint, command failure, return to Dashboard,
  desktop, wide, narrow, 200% text, keyboard, touch, and reduced motion;
- `git diff --check`: pass;
- Graphify update: pass after final documentation reconciliation.

## Residual Risk

- Vite still reports the existing large JavaScript chunk warning (`878.53 kB`
  minified). It remains a Monitor item because this phase added no dependency
  and no measured Matchday startup or interaction regression.
- Browser visual evidence currently targets Chromium. Semantic component tests,
  type checks, and deterministic engine/repository tests remain browser-neutral.
- Cards, penalties, injuries, extra time, and shootouts intentionally remain
  absent. They require real engine facts and lifecycle ownership before any
  Matchday presentation work.

## Manual Product Inspection

The product owner should inspect:

1. the pre-match first viewport and its single Start match command;
2. an ordinary event, a paused goal hold, and speed switching during each half;
3. all four interval tabs, including one board edit and a bench substitution;
4. all three full-time tabs at desktop and narrow widths;
5. 200% text and reduced-motion states for readability and focus continuity.

## Next Recommendation

Document and then execute exactly `Phase 74 - Player Generation And Model
Consolidation Cleanup`, preserving the authoritative current-product browser
gate while consolidating player-model truth. This report does not start Phase
74.

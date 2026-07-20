# Career Web Section Roadmap

Date: 2026-06-24
Current baseline: Phase 73 Inbox/Posta decision centre, audit-only Phase 73A,
bounded Phase 73B premium remediation, and user-requested Phase 73C Matchday
broadcast rework are complete.
Phase 69's single fixed web identity supersedes the earlier three-skin
experiment. Phase 74 documentation is complete after the bounded Phase 73C
interposition; Steps 01-09 are complete and Step 10 is active.

## Supersession Note - 2026-06-25

From Phase 62 onward, the phase order in this web-section roadmap is superseded
by `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`.

This document remains binding as the quality bar for web sections: no dead
screens, no UI-only state, no CLI prose parsing, Playwright screenshot QA,
accessibility notes, and section-level dependency/code-quality/architecture/
UI-UX/fun review.

The updated operational order is now engine and playability first:

1. engine safety net;
2. canonical career advancement use-case;
3. player-state consequences;
4. web matchday;
5. web persistence;
6. Inbox/Posta.

The old Phase 62 Inbox/Posta recommendation is intentionally delayed until the
web has real matchday and persistence events to route and resolve.

## Product Quality Audit Interposition Note - 2026-07-15

Completed Phase 73 provides enough real browser product to review the web app
as one experience rather than as isolated feature slices. Before starting the
already-roadmapped Phase 74, the user has scheduled:

- `Phase 73A - Web Product UI/UX Quality Audit And Premium Design Baseline`.

Phase 73A is audit-only. It inventories current surfaces and states, measures
critical journeys, reviews information architecture and visual language,
checks accessibility/responsive/interaction states, audits presentation/CSS
ownership, and produces a Playwright-backed cross-screen scorecard plus one
remediation decision.

This interposition does not renumber or replace Phase 74. It must not change
production React, TypeScript, CSS, SVG, localization, runtime, engine, storage,
tests, or dependencies. Its final report may recommend exactly one bounded
Phase 73B remediation sequence when evidence shows P0/P1 product debt, or may
return directly to Phase 74.

Detailed documentation:

- `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/`

Phase 73A result:

- Step 01 complete: `WEB_PRODUCT_SURFACE_AND_STATE_INVENTORY.md` maps the five
  reachable screen states, shared shell and tactical board, meaningful
  substates, deterministic browser recipes, commands, owners, style
  concentration signals, and existing QA evidence. Disabled future navigation
  is kept separate from current defects.
- Step 02 complete: `WEB_CRITICAL_JOURNEY_AND_ACTION_ECONOMY_AUDIT.md`
  measures every current MVP journey, preserves the bounded outer career
  rhythm, and records two P1 findings: silent preparation-draft loss and two
  mandatory Matchday reveal clicks without manager decisions.
- Step 03 complete: `WEB_INFORMATION_ARCHITECTURE_AND_CONTENT_HIERARCHY_AUDIT.md`
  locks each screen purpose and first-viewport contract, records narrow shell
  displacement and technical identity/fallback leaks as P1, and maps every
  duplicate fact to a bounded keep/combine/move/remove disposition.
- Step 04 complete: `WEB_PREMIUM_VISUAL_SYSTEM_AND_COMPONENT_LANGUAGE_AUDIT.md`
  preserves the fixed navy/cream/gold identity and tactical board, but records
  one P1 hierarchy defect plus undefined-token, component-state, typography,
  spacing, and semantic-color P2 debt. It defines a minimum premium component
  contract tied to comprehension rather than taste.
- Step 05 complete: required desktop, wide, narrow, keyboard, focus, 200% text
  zoom, loading, error, dialog, pointer/touch, contrast, and reduced-motion
  evidence preserves the current no-overflow and async-feedback strengths while
  recording four P1 and two P2 findings without changing production code.
- Step 06 complete: `WEB_FRONTEND_PRESENTATION_ARCHITECTURE_AND_CSS_AUDIT.md`
  confirms healthy package boundaries and maps current app, runtime, Zustand,
  presenter, screen, shared UI, CSS, localization, and visual-QA ownership. It
  records P1 remediation for App composition, phase-local Matchday ownership,
  and one executable current visual gate; 43 production-unused selectors,
  three test-preserved Modules, and store/CSS/documentation drift remain
  bounded P2 work rather than grounds for a rewrite.
- Step 07 complete: 56 manually reviewed screenshots cover every current
  primary surface plus wide, narrow, focus, loading, error, menu, dialog,
  `200%` text, and reduced-motion states. No horizontal page overflow was
  measured. The cross-screen score is `3.59/5`: purpose and feedback are
  strengths, while hierarchy, accessibility/responsive task priority, and
  presentation maintainability prevent a premium readiness claim.
- Step 08 complete: `WEB_PRODUCT_UI_UX_QUALITY_AUDIT.md` deduplicates the
  evidence into 11 P1 findings, 10 P2 findings, and four Monitor items. The
  dependency-ordered `WEB_UI_UX_PREMIUM_REMEDIATION_MAP.md` defines ten
  browser-visible slices, each with a deletion boundary and regression gate.
- Final decision: execute exactly `Phase 73B - Current Web Product Premium
  Remediation And Journey Hardening` before Phase 74. There is no evidence for
  a rewrite. Phase 74 remains reserved and unchanged.
- Preserved baseline: structured facts, `@game/ui`, SQLite/OPFS, session/save
  cadence, Dashboard/Continue/Posta rhythm, command feedback, staged matchday,
  localization, and the complete tactical board/pitch contract.
- Final gate: Node 24 web typecheck/test/build, dependency-cruiser, full
  `pnpm check` (160 files, 946 tests), and `git diff --check` pass. The existing
  large-chunk build warning remains a Monitor item pending measured user impact.

Detailed remediation map:

- `docs/roadmaps/WEB_UI_UX_PREMIUM_REMEDIATION_MAP.md`

Phase 73B completion status:

- The complete phase contract and ten ordered browser-visible steps are at
  `docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/`.
- All ten steps are complete. The canonical `pnpm web:visual:qa` gate covers the
  real SQLite/OPFS App Entry -> Dashboard -> Posta -> Preparation -> Matchday
  journey at desktop and narrow widths. The shell provides a localized skip
  command, visible-heading focus only on top-level screen changes, compact
  narrow navigation, zoom/reduced-motion checks, and first-viewport task proof.
- Semantic state, Dashboard/App composition, and Posta now have one explicit
  hierarchy and ownership contract. Preparation drafts are structurally
  compared with the loaded baseline, participate in dirty-exit protection,
  support exact Stay/Discard and valid explicit Save, and perform no per-action
  persistence. One validation strip now sits beside one confirmation command;
  the approved tactical board remains unchanged and reflows at 200% text.
- Matchday now uses one shared bounded presentation policy from Start match to
  half time and from the interval decision to full time. Both reveal-only
  commands are absent, reduced motion reaches the same canonical facts, full
  time remains a deliberate review, and refresh performs no hidden save.
- Half-time now adds one presenter-derived review and one compact player-signal
  hierarchy before the unchanged shared tactical workspace. Score, minute,
  phase, shape, change count, validation, and resume action each have one owner;
  event-light, narrow, reduced-motion, and 200% text states are browser-proven.
- Full time now presents result, decisive structured tabellino, selected-club
  ratings, and meaningful merged player consequences in that order. Routine
  team-wide result reasons and normal match fatigue are not repeated per
  player; one Return to Dashboard command closes the idempotent review.
- Step 10 completed the shared-state finish, manually reviewed `87` product
  screenshots plus three contact sheets, migrated every still-current browser
  assertion, removed historical runners and three proven test-only tactical
  paths, and found no unused production CSS class selector.
- The authoritative gate now consists only of `current-product.spec.ts` and the
  unique `sqlite-opfs-storage.spec.ts`; it passes `17/17` through real
  SQLite/OPFS.
- Every step preserves the tactical board and removes replaced presentation
  code in the same bounded scope.
- At Phase 73B close, the single next recommendation was the already-reserved
  `Phase 74 - Player Generation And Model Consolidation Cleanup`. The later
  user-requested Phase 73C interposition below supersedes only that immediate
  order. Phase 74 remains unchanged and not started.

## Matchday Broadcast Interposition Note - 2026-07-17

After Phase 73B completed, direct product review found that Matchday still
behaved too much like a growing event report. The user explicitly scheduled:

- `Phase 73C - Matchday Broadcast Workspace And Tabbed Review Rework`.

Phase 73C is a browser-visible presentation interposition. It gives Matchday
100% of the content space beside the existing persistent career menu, removes
duplicated pre-match metadata, replaces the accumulating live event list with
one stable commentary line, adds presentation-only playback controls and
event-priority holds, places a compact tabellino under the score, and uses
accessible tabs for half-time and full-time detail.

Locked preservation:

- no match-engine, rating, balance, or event-generation change;
- no unsupported penalty/card/injury placeholder or inert future branch;
- no persistence of playback, speed, pause, or tab state;
- no global shell/sidebar redesign;
- no tactical-board, pitch SVG, geometry, role, suitability, or interaction
  change;
- no Phase 74 implementation.

Detailed documentation:

- `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/`

Progress:

- Step 01 complete: Matchday explicitly owns the whole shell content outlet,
  the sidebar contract is unchanged, and the redundant pre-match Ready,
  Fixture, and Venue card and labels are deleted. The scoreboard now carries
  the only fixture summary and one Start match command.
- Step 02 complete: one pure structured-event policy now controls opening,
  routine, significant, and goal holds for both halves. Pause/Resume and
  `1x`/`2x`/`4x` are ephemeral, accessible presentation controls; timer
  cancellation covers pause, speed, phase, command failure, and unmount.
- Step 02 verification: Node 24.16.0; i18n/web tests (53 files / 223 tests),
  web typecheck/build, canonical Playwright 18/18 with real SQLite/OPFS,
  desktop/narrow playback screenshots, diff check, and Graphify update all
  pass.
- Step 03 complete: one bounded localized commentary line now replaces the
  accumulated live feed without changing page height. The sampled frame
  exposes the structured event responsible for its highest hold priority;
  goals use one restrained readable state, while routine incidents remain
  quieter and Pause/Resume freezes the exact visible line.
- Step 03 verification: Node 24.16.0; i18n/web tests (53 files / 225 tests),
  web typecheck/build, canonical Playwright 18/18 with real SQLite/OPFS, and
  manually reviewed commentary screenshots all pass.
- Step 04 complete: one presenter contract and one compact component now own
  the chronological home/away tabellino beneath the commentary. It renders
  only current goals and real applied substitutions, bounds keyboard-reachable
  overflow, disappears for an event-free match, and replaces the old live,
  half-time, and full-time incident lists without future placeholder branches.
- Step 04 verification: Node 24.16.0; i18n tests, web tests (54 files / 229
  tests), typecheck/build, canonical Playwright 18/18 with real SQLite/OPFS,
  screenshot review, diff check, and Graphify update all pass.
- Step 05 complete: half time now opens on one concise Summary inside an
  accessible four-tab shell. Existing player attention facts, validation, and
  substitution count have one owner; the old signals card is deleted, tab
  state remains ephemeral, and the shared tactical board is unchanged.
- Step 05 verification: Node 24.16.0; i18n tests, web tests (55 files / 231
  tests), typecheck/build, canonical Playwright 18/18 with real SQLite/OPFS,
  event-rich/event-light wide and narrow screenshot review, and diff check all
  pass.
- Step 06 complete: Tactics now owns the unchanged shared board and live draft;
  Your team and Opponent reuse one responsive observed-facts rating
  composition with deterministic active-first ordering. Tab changes preserve
  unsaved tactical work and no horizontal page scroll is introduced.
- Step 06 verification: Node 24.16.0; i18n/web tests (56 files / 233 tests),
  web typecheck/build, canonical Playwright 18/18 with real SQLite/OPFS,
  dependency-cruiser, full `pnpm check` (168 files / 989 tests), screenshot
  review, diff check, and Graphify update all pass.
- Step 07 complete: full time keeps the final score, commentary, and tabellino
  stable above Your team, Opponent, and Consequences tabs. Both clubs reuse
  one final-rating composition, only meaningful durable changes appear, and
  one Dashboard exit remains.
- Step 07 verification: Node 24.16.0; i18n/web tests (56 files / 234 tests),
  web typecheck/build, canonical Playwright 18/18 with real SQLite/OPFS,
  dependency-cruiser, full `pnpm check` (168 files / 990 tests), all required
  final-review screenshots, diff check, and Graphify update pass.
- Step 08 complete: the complete Matchday route now reflows at desktop, wide,
  narrow, and useful 200% text; checkpoint focus follows the visible heading;
  the resting skip link remains off canvas; touch, keyboard, reduced motion,
  live commentary, tabs, playback controls, and tabellino facts pass the
  canonical browser matrix without horizontal overflow or cumulative growth.
- Step 08 verification: Node 24.16.0; i18n/web tests (56 files / 234 tests), web
  typecheck/build, canonical Playwright 18/18 with real SQLite/OPFS,
  dependency-cruiser, full `pnpm check` (168 files / 990 tests), desktop/wide/
  narrow/200%-text/touch/keyboard/reduced-motion screenshots, diff check, and
  Graphify update pass.
- Step 09 complete: the canonical real SQLite/OPFS journey now proves the full
  broadcast lifecycle, all interval/final tabs, one real half-time tactical
  change, checkpoint refresh, command failure, responsive/accessibility/motion
  states, and return to Dashboard. The obsolete two-select interval fallback,
  formatter, styles, labels, and assertion were deleted; the current typed
  substitution contract remains because the board, change history, validation,
  store command, and persistence use it.
- Step 09 verification: Node 24.16.0; i18n tests; web tests (56 files / 235
  tests); web typecheck/build; dependency-cruiser (498 modules / 1,721
  dependencies); full `pnpm check` (168 files / 991 tests); canonical
  Playwright 18/18 with real SQLite/OPFS; desktop/wide/narrow/200%-text/
  keyboard/touch/reduced-motion screenshot review; diff check; and Graphify
  update all pass.
- Final report:
  `docs/audits/MATCHDAY_BROADCAST_WORKSPACE_REWORK_REPORT.md`.

## Phase 74 Player-Model Consolidation Note - 2026-07-17

Phase 74 is now fully documented at:

- `docs/steps/74-player-generation-and-model-consolidation-cleanup/`.

Its eleven ordered steps first lock a deterministic player baseline, then
consolidate ability semantics, role profiles/caps, construction, senior and
youth generation, development, lifecycle, market/report/web consumers, and
save compatibility before a 250-world x 30-season release gate.

The web boundary is explicit:

- web adapters may consume canonical player facts but may not own a duplicate
  ability or potential formula;
- the tactical board, its suitability levels, geometry, interactions, and
  current Matchday journey remain unchanged;
- there is no Squad UI, player-detail UI, Market UI, or hidden-potential
  exposure in Phase 74;
- the future Squad screen follows only after the consolidated model and save
  compatibility pass.

Status: Complete. Canonical ability semantics and role profiles now
exist in domain, every new senior player crosses one validated construction
boundary, and initial senior plus later-career intake assembly share one
content-owned seam without sharing generation policy. Initial and seasonal
youth use that same assembly seam, and a deterministic division budget limits
youth rarity to 2-5 high and 0-1 elite prospects while preserving exact academy
structure. Development and lifecycle consumers now use explicit role measures,
with raw averages retained only where documented compatibility requires them.
Market, CLI reports, and the web preparation adapter now consume canonical role
facts while tactical suitability and every board interaction remain separate
and unchanged. JSON plus SQLite/OPFS compatibility normalize historical role
identity deterministically without a schema bump, and the complete
current-product browser gate is order-independent. Step 11 closes the phase
with zero structural player-model failures over 250 worlds x 30 seasons,
strict balance PASS, deleted duplicate formulas, an architecture trace, and an
explicit classification of two retained out-of-scope global failures.

## UX Rebuild Supersession Note - 2026-07-01

Phase 68 reset the first-MVP UX language and identified the tactical board as
the only approved visual anchor. The approved implementation direction is now
`Phase 69 - Web UI Full Rebuild Around Tactical Board`, based on
`docs/superpowers/specs/2026-06-30-web-ui-redesign-design.md`.

Phase 69 temporarily takes priority over adding new career sections. Each Phase
69 step must produce one browser-visible slice for user review before the next
step starts. This is intentional: the product should not continue accumulating
screens on top of a rejected UI language.

Phase 69 keeps this roadmap's quality bar binding:

- no dead screens;
- no UI-only data;
- no CLI prose parsing;
- Playwright desktop/narrow screenshot QA;
- accessibility notes;
- dependency/code-quality/architecture/UI-UX/fun review before closeout.

Phase 69 progress:

- Step 01 complete: app entry now has a single fixed identity, no user-facing
  theme picker, and retained language/currency preferences.
- Step 01 browser evidence: `/tmp/the-long-season-phase69-step01/app-entry-desktop.png`
  and `/tmp/the-long-season-phase69-step01/app-entry-narrow.png`.
- Step 01 hover rework evidence:
  `/tmp/the-long-season-phase69-step01/app-entry-new-career-hover.png`.
- Step 02 complete: tactical-board and bench-board chrome CSS is isolated in
  `apps/web/src/styles/tactical-board.css`; tactical-board logic and pitch
  markings were not modified.
- Step 02 browser evidence:
  `/tmp/the-long-season-phase69-step02/tactical-board-desktop.png`,
  `/tmp/the-long-season-phase69-step02/tactical-board-context-menu-desktop.png`,
  and `/tmp/the-long-season-phase69-step02/tactical-board-narrow.png`.
- Step 03 complete: base layout, typography hierarchy, global focus language,
  subtle scanline/grid material, and app-entry spacing were tightened without
  starting the shell/sidebar/dashboard rebuild.
- Step 03 browser evidence:
  `/tmp/the-long-season-phase69-step03/app-entry-desktop.png`,
  `/tmp/the-long-season-phase69-step03/app-entry-narrow.png`,
  `/tmp/the-long-season-phase69-step03/app-entry-focus-new-career.png`,
  `/tmp/the-long-season-phase69-step03/career-screen-desktop.png`, and
  `/tmp/the-long-season-phase69-step03/career-screen-narrow.png`.
- Step 04 complete: shared player row, squad table, and player-detail primitives
  were tightened in place without touching dashboard, shell, matchday, or
  tactical-board logic.
- Step 04 browser evidence:
  `/tmp/the-long-season-phase69-step04/match-preparation-desktop.png`,
  `/tmp/the-long-season-phase69-step04/match-preparation-narrow-after-table-min-width.png`,
  `/tmp/the-long-season-phase69-step04/squad-table-desktop.png`, and
  `/tmp/the-long-season-phase69-step04/player-detail-desktop.png`.
- Step 05 complete: the career shell now uses a persistent left sidebar,
  central content outlet, and attention/action rail. The old `CareerShell`
  import path is a compatibility bridge to the new `features/app-shell`
  implementation so existing screens can move incrementally without duplicated
  chrome.
- Step 05 browser evidence:
  `/tmp/the-long-season-phase69-step05/shell-dashboard-desktop-v2.png`,
  `/tmp/the-long-season-phase69-step05/shell-preparation-desktop-v2.png`, and
  `/tmp/the-long-season-phase69-step05/shell-preparation-narrow-v2.png`.
- Step 06 complete: the dashboard central panel is now a command centre with
  one dominant primary action, compact next-fixture/preparation facts,
  attention blockers near the top, and a short real-fact signal row. Technical
  save/world-seed output and fixture ids were removed from the dashboard body.
- Step 06 browser evidence:
  `/tmp/the-long-season-phase69-step06/dashboard-command-centre-desktop.png`
  and `/tmp/the-long-season-phase69-step06/dashboard-command-centre-narrow.png`.
- Step 07 complete: the shell Posta/attention rail is now compact and backed
  only by existing Inbox read-model facts, the separate next-action card was
  removed, current navigation uses `aria-current` without being marked disabled,
  and unavailable future sections have a calmer disabled state.
- Step 07 browser evidence:
  `/tmp/the-long-season-phase69-step07/posta-rail-dashboard-desktop.png`,
  `/tmp/the-long-season-phase69-step07/posta-rail-preparation-desktop.png`, and
  `/tmp/the-long-season-phase69-step07/posta-rail-preparation-narrow.png`.
- Step 08 complete: match preparation now uses a board-first workspace. The
  shared tactical board dominates the left column, the bench sits directly below
  it, and squad/detail/tactic facts live together in a right-side decision
  panel. Tactical-board and bench behavior were not changed.
- Step 08 browser evidence:
  `/tmp/the-long-season-phase69-step08/match-preparation-board-first-desktop.png`
  and
  `/tmp/the-long-season-phase69-step08/match-preparation-board-first-narrow.png`.
- Step 09 complete: match preparation now keeps squad, tactic, and player
  detail in localized right-panel tabs backed by existing read-model facts.
  Blockers sit closer to the single primary save action, and focusing a player
  opens the Detail tab instead of adding another stacked panel.
- Step 09 browser evidence:
  `/tmp/the-long-season-phase69-step09/desktop-squad.png`,
  `/tmp/the-long-season-phase69-step09/desktop-tactic.png`,
  `/tmp/the-long-season-phase69-step09/desktop-detail.png`,
  `/tmp/the-long-season-phase69-step09/narrow-squad.png`,
  `/tmp/the-long-season-phase69-step09/narrow-tactic.png`, and
  `/tmp/the-long-season-phase69-step09/narrow-detail.png`.
- Step 10 complete: matchday now opens on a broadcast-style pre-match centre
  backed by the existing phase read model. The frame prioritizes phase, round,
  dominant score, live line, one primary command, and the phase rail before
  lower-priority event/player facts. Full-time consequences remain hidden before
  full time.
- Step 10 browser evidence:
  `/tmp/the-long-season-phase69-step10/matchday-pre-match-desktop.png` and
  `/tmp/the-long-season-phase69-step10/matchday-pre-match-narrow.png`.
- Step 11 complete: matchday half-time now becomes a board-first decision
  screen. The shared tactical board and bench remain the main workspace, first-
  half highlights and player signals sit in compact side cards, the generic
  Timeline/player-table report layout is suppressed during half-time, and the
  broadcast frame keeps one primary `Start second half` command.
- Step 11 browser evidence:
  `/tmp/the-long-season-phase69-step11/matchday-half-time-desktop.png` and
  `/tmp/the-long-season-phase69-step11/matchday-half-time-narrow.png`.
- Step 12 complete: matchday full-time is now a compact result review. The
  broadcast frame keeps the dominant score and one `Continue` command, while the
  body separates the final summary, decisive-event cards, final ratings, and
  post-match condition/form/morale consequences. The raw Timeline layout is not
  used at full time.
- Step 12 browser evidence:
  `/tmp/the-long-season-phase69-step12/matchday-full-time-desktop.png` and
  `/tmp/the-long-season-phase69-step12/matchday-full-time-narrow.png`.
- Step 13 complete: removed legacy web UI code left behind by the rebuild. The
  old `features/career-shell` bridge/inbox panel and stale tests are gone,
  screens import `features/app-shell/AppShell` directly, rejected theme-palette
  modules/specs/i18n keys are deleted, and unused legacy dashboard/report CSS
  selectors were removed without touching tactical-board CSS or behavior.
- Step 13 browser evidence:
  `/tmp/the-long-season-phase69-step13/01-app-entry-desktop.png`,
  `/tmp/the-long-season-phase69-step13/02-dashboard-desktop.png`,
  `/tmp/the-long-season-phase69-step13/03-match-preparation-desktop.png`,
  `/tmp/the-long-season-phase69-step13/04-pre-match-desktop.png`,
  `/tmp/the-long-season-phase69-step13/05-half-time-desktop.png`,
  `/tmp/the-long-season-phase69-step13/06-full-time-desktop.png`, and
  `/tmp/the-long-season-phase69-step13/07-full-time-narrow.png`.
- Step 14 complete: final visual QA, accessibility checks, architecture
  reconciliation, phase report, and one next-phase recommendation are complete.
- Step 14 browser evidence:
  `/tmp/the-long-season-phase69/app-entry-desktop.png`,
  `/tmp/the-long-season-phase69/dashboard-desktop.png`,
  `/tmp/the-long-season-phase69/match-preparation-desktop.png`,
  `/tmp/the-long-season-phase69/pre-match-desktop.png`,
  `/tmp/the-long-season-phase69/half-time-desktop.png`,
  `/tmp/the-long-season-phase69/full-time-desktop.png`,
  `/tmp/the-long-season-phase69/app-entry-narrow.png`,
  `/tmp/the-long-season-phase69/dashboard-narrow.png`,
  `/tmp/the-long-season-phase69/match-preparation-narrow.png`,
  `/tmp/the-long-season-phase69/pre-match-narrow.png`,
  `/tmp/the-long-season-phase69/half-time-narrow.png`, and
  `/tmp/the-long-season-phase69/full-time-narrow.png`.
- Phase 69 is complete. Product review on 2026-07-07 rejected the current
  matchday information architecture as too scattered and report-like.
- The next recommended phase is now
  `Phase 70 - Web Matchday Information Architecture And Live Flow Rework`.
  Persistence remains important, but should wait until matchday has a coherent
  live flow worth preserving.
- Phase 70 documentation exists at
  `docs/steps/70-web-matchday-information-architecture-and-live-flow-rework/`.
- Phase 70 Step 01 complete: the current matchday IA failure is documented in
  `docs/audits/MATCHDAY_INFORMATION_ARCHITECTURE_AUDIT.md`. The next step must
  define event priority and tabellino/view-model contracts before changing the
  React layout.
- Phase 70 Step 02 complete: `apps/web/src/features/matchday/career-matchday-presenter.ts`
  now derives compact score-header facts, passive phase markers, primary
  commands, and tabellino/live-feed event priority groups from existing
  structured matchday facts. The next step can consume this contract in the
  compact score header and phase indicator without adding prose parsing or fake
  event types.
- Phase 70 Step 03 complete: the matchday top frame now consumes the presenter
  through a compact score header, passive non-clickable phase indicators, and
  one primary action slot. The separate bulky context strip and visible
  technical labels `Live line` / `Next command` were removed so the next steps
  can focus on each phase body.
- Phase 70 Step 04 complete: ready pre-match is now a confirmation-only screen
  with compact fixture context and one `Start match` command. Empty event,
  highlight, player-stat, and tactical-board panels are suppressed before
  kickoff.
- Phase 70 Step 05 complete: kickoff now opens a first-half live review screen
  before the half-time decision state. It reuses the structured staged
  half-time facts, applies the presenter event hierarchy, shows goals before
  lower-priority live-feed details, and exposes exactly one `Play to half-time`
  command without adding fake engine facts or persistence.
- Phase 70 Step 06 complete: half-time now starts with the first-half story
  and tabellino, then places the tactical board and bench as the main decision
  workspace with selected-club watch-list/key-contributor signals beside it.
  Generic repeated context panels were removed; the only primary command
  remains `Start second half`.
- Phase 70 Step 07 complete: the second half is now a visible live-pressure
  screen before full time. It reuses full-time structured facts through
  browser-only playback, preserves prior first-half goals as context, shows
  second-half events and selected-club pressure, and keeps exactly one
  `Play to full time` command without tactical controls or early full-time
  consequences.
- Phase 70 Step 08 complete: full time is now ordered as match tabellino,
  player ratings, then post-match consequences. Goals are visually stronger
  than secondary structured facts, the primary action is explicitly
  `Return to dashboard`, and live-only controls are absent from the final
  review.
- Phase 70 Step 09 complete: matchday copy and accessibility were tightened
  around football-facing language. The local fixture label, passive phase
  progress, player-ratings table, and event-card accessible names are localized
  in all supported languages; phase indicators remain non-clickable status
  markers, and event meaning is visible through text rather than color alone.
- Phase 70 Step 10 complete: Playwright desktop/narrow visual QA now covers the
  full five-state matchday flow and writes
  `docs/audits/WEB_MATCHDAY_INFORMATION_ARCHITECTURE_VISUAL_QA.md` plus
  screenshots under `/tmp/the-long-season-phase70`. The final report
  `docs/audits/WEB_MATCHDAY_INFORMATION_ARCHITECTURE_REWORK_REPORT.md`
  documents the accepted state, residual UX risks, and the single next
  recommendation.
- Phase 70 is complete. The next recommended phase is
  `Phase 71 - Web Career Persistence And Save Lifecycle Foundation`.
  Matchday is now coherent enough to preserve; adding more web sections before
  durable career saves would create demo-only UI and dead-code risk.
- Product review after Phase 70 identified one contained pre-persistence UI
  correction: the shared match-preparation squad list still forces horizontal
  scrolling and gives secondary preferred-foot/status prose too much space.
  `Phase 69 Step 04a - Responsive Squad List Information Rework` is documented
  as a targeted follow-up. The step is implemented: the list now uses
  number/name, canonical position, age, current condition, and compact
  language-independent starting-XI/bench icons; preferred foot stays in player
  detail, department filters and five
  deterministic sorts are available, and desktop/narrow Playwright checks
  prove vertical-only scrolling with no horizontal overflow. Product visual
  acceptance is complete and the persistence phase may start; tactical-board
  and matchday behavior remain unchanged.
- Phase 71 documentation exists at
  `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/`.
  Step 01 is complete: `WEB_CAREER_PERSISTENCE_ARCHITECTURE_AUDIT.md` keeps
  `CareerStorage` as the canonical manager-career seam, adopts the official
  `opfs` VFS in one custom worker with Comlink and COOP/COEP, defines the
  relational schema and atomic lifecycle commit points, and names every demo
  runtime Module to delete. Step 02 is active and first isolates the
  browser-safe interface from the Node JSON adapter. IndexedDB, localStorage,
  sessionStorage, silent memory fallback, and persisted rendered prose remain
  excluded.
- Step 02 complete: `CareerStorage` and save envelopes are browser-safe,
  `JsonCareerStorage` alone owns Node imports, deterministic `listCareers` is
  covered, and the obsolete combined module is deleted. Step 03 is active and
  moves staged-match resume truth into a domain checkpoint.
- Step 03 complete: `CareerState` can now own a validated unfinished
  regulation-match checkpoint, while pure engine adapters capture, restore, and
  finish it. A JSON-serialized half-time checkpoint produces the exact same
  final report, ratings, and staged state as uninterrupted progression without
  persisting an RNG object or activating extra time/penalties. Step 04 is active
  and introduces the official SQLite WASM/OPFS worker boundary.
- Step 04 complete: the web app now uses the official SQLite WASM package through
  a dedicated Comlink worker and direct `OpfsDb`, with COOP/COEP headers, typed
  failures, migration version 1, and a real-browser save/reopen/load/list/delete
  proof. No IndexedDB, localStorage, sessionStorage, or memory fallback exists.
  Step 05 is active and expands the immutable migration ledger plus one
  worker-delegated package mapper to round-trip the ordered world state.
- Step 05 complete: immutable migration version 2 and the package-owned world
  mapper now preserve explicit player/club/fixture orders, player identities,
  optional role facts, all current/potential attributes, dynamic state, roster
  ownership, fixtures, and compact results. Focused tests and a real OPFS test
  prove exact reconstruction, two-save isolation, and rollback after an
  in-transaction constraint failure. Step 06 is active and completes every
  remaining durable career system plus rich reports and active-match state.
- Step 06 complete: immutable migration version 3 now stores career-world
  metadata, market and transfer state, youth lifecycle, ordered season history,
  match preparation, rich structured reports, and unfinished active-match
  checkpoints in explicit relational tables. Shared lifecycle contract tests
  and a real OPFS round trip prove deterministic ordering, transactional
  replacement rollback, complete reconstruction, and identical full-time
  completion from the source and restored half-time checkpoint. Step 07 is
  active and replaces the production web demo lifecycle with durable
  new/list/load commands.
- Step 07 complete: `hasDemoCareer` is removed. A small application runtime
  creates a seeded generated world from existing content and engine Modules,
  writes and reloads it through canonical SQLite storage before opening the
  dashboard, and lists/loads real saves asynchronously. The app entry exposes
  loading, empty, selected-save, loading-career, and storage-error states in all
  five languages; preferences remain outside career data. Chromium proved a
  fresh create-write-open-return-list-Continue flow. Step 08 is active and
  rehydrates dashboard, Continue, and Posta from the loaded state.
- Step 08 complete: dashboard facts now derive from the loaded `CareerState`,
  canonical Continue persists before publishing the next snapshot, and Posta
  is deterministically reconstructed from durable attention facts. Focused
  tests, build, dependency rules, and Chromium create/reload/list/load evidence
  pass. Step 09 is active and moves the complete match-preparation workspace
  from its final demo owner to the durable career command.
- Step 09 complete: match preparation now uses the loaded career roster and
  keeps its unsaved draft in Zustand, while an explicit runtime command writes
  and reloads formation, normalized board slots, XI, bench, and tactic through
  relational SQLite schema version 4. OPFS and Chromium refresh evidence prove
  exact durable rehydration.
- Step 10 complete: production matchday now derives club, fixture, roster, XI,
  bench, tactic, and staged progress from the loaded durable career. Pre-match,
  half-time, and manager decisions are transactional checkpoints; full time
  commits the exact staged report once, clears the checkpoint atomically, and
  remains reconstructable until the manager acknowledges the review. Step 11
  is active and removes the replaced demo lifecycle Modules and wrappers.
- Step 11 complete: obsolete dashboard, Continue, preparation, and matchday demo
  lifecycle Modules are deleted. Production screens now follow one loaded-career
  path, while deterministic setup builders are isolated under test fixtures.
- Step 12 complete: storage and migration failures use stable typed codes and
  localized recovery copy. Startup failures stay on app entry; failed writes
  during a career preserve the active screen and unsaved manager draft. Retry
  recreates the SQLite/OPFS runtime, and no raw browser/SQL prose, fallback
  storage, or destructive automatic reset is exposed.
- Step 13 and Phase 71 complete: Chromium desktop/narrow QA proves durable
  create/list/load, explicit Continue after refresh, preparation, pre-match,
  half-time tactical recovery, full-time review, dashboard return, non-empty
  OPFS SQLite ownership, and focused unavailable-storage recovery. The final
  architecture and quality reports originally recommended Inbox/Posta next.
- Product review superseded that order after observing two lifecycle problems:
  gameplay actions currently write through to SQLite too often, and meaningful
  asynchronous commands do not expose observable loading feedback. Phase 72 is
  therefore `Career Session Autosave And Command Feedback`; Inbox/Posta moves
  to Phase 73. Detailed Phase 72 documentation exists at
  `docs/steps/72-career-session-autosave-and-command-feedback/`. Step 01 is
  complete: the audit records 7 writes and 12 loads in a complete journey,
  defines safe stops and deletion targets, and makes Step 02 the active policy
  and session contract. Step 02 is complete with JSON/SQLite migration,
  policy-only persistence, runtime session ownership, and Zustand status
  projection. Step 03 is complete: every gameplay command is session-owned,
  a complete match journey writes zero times, and reload restores the durable
  baseline. Step 04 is complete: manual save and due autosave share one
  validated full-session commit, 7/15-day cadence uses game dates, manual-only
  never schedules, live matchday postpones writes, safe return commits once,
  and failures retain dirty work. Step 05 is complete: one compact shell control
  exposes clean/dirty state, persisted game date, 7/15/manual policy, accurate
  no-save matchday guidance, and dirty main-menu/browser exit guards; preparation
  now confirms the plan instead of claiming an action save. Step 06 is complete:
  one typed Zustand activity snapshot and one application runner publish pending
  state synchronously, reject conflicting mutations, preserve bounded failures,
  and replace hidden refs and repeated Promise orchestration across every real
  asynchronous career command. Nested autosave remains part of its parent safe-
  stop command and synchronous half-time edits do not receive dead command IDs.
  Step 07 is complete: every real asynchronous action exposes specific visible
  progress at its initiating surface, one polite live announcement, stable
  control geometry, reduced-motion-safe feedback, and one global conflict lock
  while retaining the current football context. Synchronous half-time edits
  remain immediate and do not receive fake loading states. Step 08 and Phase 72
  are complete: Chromium proves all save policies, dirty reload, manual save,
  recoverable failure, every exit choice, active-match protection, command
  feedback, reduced motion, narrow overflow safety, and exclusive SQLite/OPFS
  ownership. Final QA also removed the duplicate runtime Promise queue and
  fixed Strict Mode discovery ownership.
- Phase 73 documentation is now complete at
  `docs/steps/73-inbox-posta-decision-center-and-career-attention-workflow/`.
  Its locked flow evaluates canonical days, stops only for blocking or
  important attention, batches every message on the stop date, and opens the
  highest-priority message. Matchday is one blocking item whose action changes
  from `Prepare match` to `Go to match`; preparation is not a second stop.
  Posta keeps a compact left rail and adds a dense two-column list/detail
  outlet with narrow list-to-detail navigation. Read, acknowledged, and
  resolved are separate durable states, current-season messages clear on
  rollover, and the visible calendar transition is bounded, accelerates after
  seven days, and respects reduced motion. All eleven steps are complete; final
  production SQLite/OPFS evidence is recorded in
  `docs/audits/WEB_INBOX_DECISION_CENTER_VISUAL_QA.md` and
  `docs/audits/INBOX_POSTA_DECISION_CENTER_REPORT.md`.
- The Phase 73 future-extension register must remain visible for market,
  player contracts, finances, youth academy, and staff. None may produce Posta
  content until its real workflow exposes structured facts, attention policy,
  resolution condition, destination screen, and persistence owner. This is a
  documentation obligation, not production scaffolding. Step 01 is complete:
  `docs/audits/CAREER_ATTENTION_AND_POSTA_CURRENT_STATE_AUDIT.md` proves that
  current messages are derived from the latest Continue result, that
  preparation and match entry use two unstable identities, and that no durable
  read/acknowledged/resolved owner exists. The audit names every deletion and
  replacement step. Step 02 is complete: domain and engine now
  expose one `matchday` identity per fixture, the canonical
  blocking/important/informational levels, independent read/acknowledged/
  resolved lifecycle facts, functional source data, structured readiness
  blockers, and a readiness-derived primary destination. Step 03 is complete:
  the pure use case now scans explicit `GameDate` values,
  delivers informational messages without stopping, batches every message on
  the first attention date, rejects duplicate IDs, and selects deterministically
  by level and stable ID. The web runtime supplies the real matchday boundary
  and readiness facts. Step 04 is complete: validated `CareerState` owns one
  ordered current-season Inbox, SQLite schema v6 stores messages, blockers, and
  actions relationally, legacy JSON defaults to an empty Inbox, and season
  rollover clears prior messages. Step 05 is complete: one pure engine
  lifecycle path deduplicates delivery, refreshes blockers and destinations
  without resetting lifecycle, opens idempotently, acknowledges important
  attention only after open, and resolves blocking matchday attention only
  from a played linked fixture. The web runtime applies these operations to the
  dirty working session with no immediate storage write. Step 06 is complete:
  Posta now has a production route backed by the durable current-season Inbox,
  framework-free list/detail read models, exact filters, deterministic
  selection, central lifecycle opening, and shell/rail navigation that no
  longer executes football actions directly. Step 07 is complete: the compact
  left rail is awareness-only, the dedicated Posta route uses a dense
  football-management list/detail hierarchy without a permanent third column,
  and narrow screens use an explicit Back flow. Step 08 is complete: one
  fixture-scoped matchday message now retains its identity while
  real lineup, bench, and tactic readiness change the sole destination from
  `Prepare match` to `Go to match`; opponent, competition, round, venue, and
  readiness are structured detail facts; load and repeated Continue refresh in
  place; and only the played fixture resolves the blocker. Step 09 is complete:
  a committed played fixture creates at most one informational result summary,
  a real season archive creates one important rollover review, and ordinary
  player-state changes do not create notification noise. The binding future
  workflow register is
  `docs/audits/CAREER_INBOX_FUTURE_MESSAGE_EXTENSION_MATRIX.md`; market,
  contracts, finances, youth, and staff remain documentation-only until their
  real workflows exist. Step 10 is complete: one pure UTC date plan runs inside
  the existing command lock, caps long presentation at 1.8 seconds, respects
  reduced motion, updates the visible shell date, and delays destination
  routing until the stop date. Step 11 is complete: browser accessibility,
  persistence, no-dead-code cleanup, and phase evidence pass. The next global
  phase is `Phase 73A - Web Product UI/UX Quality Audit And Premium Design
  Baseline`; Phase 74 remains reserved and the unnumbered Squad Screen backlog
  remains deferred.

## Goal

Build the career web experience one section at a time without creating dead
screens, weak abstractions, or UI that is not backed by useful manager
decisions.

The roadmap has two equal goals:

1. Make the game fun for the user.
2. Keep the engine and application architecture clean, deterministic, and easy
   to extend.

Every section must earn its place by giving the manager a real decision,
explaining the game state better, or improving the engine behind the decision.

## Phase Completion Standard

Each phase in this roadmap should almost complete the section it owns before the
project moves to the next section.

"Almost complete" means the section is not a thin placeholder and not just a
visual shell. It should include the main user journey, the core decisions, the
required read models, the browser UI, and enough validation to prove that the
section can survive future extension without being rewritten immediately.

At the end of every phase, run a section review before recommending the next
phase:

1. **Dependency review**
   Check package boundaries, imports, ownership, and whether any logic belongs
   in `domain`, `engine`, `ui`, `apps/web`, or another package.
2. **Code quality review**
   Check whether files are becoming too large, duplicated, unclear, unused, or
   hard to follow for a junior developer.
3. **Architecture review**
   Check whether the section is open to extension but closed to careless local
   changes, and whether the current abstractions are justified by real usage.
4. **UI/UX review**
   Check layout hierarchy, keyboard flow, accessibility, responsive behavior,
   text clarity, and whether critical decisions are visible in the first useful
   viewport.
5. **Fun review**
   Ask whether the section makes the career more engaging, gives the manager
   meaningful agency, creates tension, or improves long-term football stories.
6. **Improvement decision**
   If the section can be materially improved before moving on, prefer improving
   it inside the phase instead of carrying weak work forward. If the improvement
   is clearly future scope, document the reason and the exact future phase.

Do not close a phase just because the minimum UI renders. Close it only when the
section is strong enough that the next section can build on it without relying
on dead code, placeholder behavior, or known poor user experience.

## Non-Negotiable Rules

- Do not build a decorative screen before the underlying decision or read model
  exists.
- Do not add UI-only data that cannot later map to real career state.
- Do not parse CLI output to feed the web UI.
- Do not create automatic manager choices unless a phase explicitly requires
  AI behavior for non-user clubs.
- Do not hide core blockers at the bottom of a long dashboard.
- Do not create reusable abstractions until two real sections need them.
- Keep `@game/ui` framework-free and language-agnostic.
- Keep `apps/web` as the browser adapter.
- Keep engine rules out of React components.
- Run Playwright desktop and narrow screenshot QA for every browser-rendered
  phase.

## Dashboard Attention Placement Decision

The dashboard must not bury critical state such as:

- `Attention required`;
- `Blockers`;
- missing lineup;
- missing tactic;
- next action needed before Continue.

Those items should become part of the top dashboard decision area or the left
Inbox/Posta rail. They can still have detailed panels, but the first viewport
must tell the user what is stopping progression and what action resolves it.

This matters because the main dashboard is not a report page. It is the
manager's control room.

## Section Dependency Model

Each future section should follow this order:

1. **Engine/domain readiness**
   Confirm the underlying concept exists and is deterministic.
2. **UI read model**
   Add or extend `@game/ui` with language-agnostic facts and action state.
3. **Web adapter**
   Build a React screen from the read model, not from CLI prose.
4. **Decision loop**
   The screen must let the user understand or resolve a real career decision.
5. **QA**
   Run typecheck, tests, dependency rules, `pnpm check`, Playwright screenshots,
   and accessibility notes.
6. **Fun review**
   Ask whether the section improves agency, clarity, tension, or long-term
   story quality.

## Phase Roadmap

### Phase 52 - Web Match Preparation Slice

Primary dependency: Phase 51 shell.

Purpose:

- Let the user resolve the current dashboard blocker:
  - missing saved lineup;
  - missing saved tactic.

Minimum useful scope:

- Show next fixture context.
- Show selected club condition.
- Let the user choose or save a valid lineup from existing available data.
- Let the user choose or save a tactic from existing profiles.
- Return to dashboard with blockers cleared.

What must not happen:

- No full drag-and-drop editor yet.
- No automatic best XI.
- No hidden tactic recommendations.
- No market/squad-needs advice.

Why this is first:

The current career loop stops because match preparation is missing. The first
real UI section must let the user solve that stop.

### Phase 53 - Retro Football UI Identity Rework

Primary dependency: Phase 52 match-preparation slice.

Purpose:

- Rework the current web UI into a serious football-management identity before
  expanding the product with more sections.
- Replace the generic dashboard/SaaS feeling with a Championship Manager /
  Scudetto-inspired club control room.

Minimum useful scope:

- Retro-football theme tokens and surface language.
- Shell/topbar/navigation rework.
- Left Inbox/Posta rail visual rework.
- Dashboard control-room rework.
- Match-preparation rework with a vertical tactical pitch and compact squad
  list.
- Playwright desktop/narrow visual QA and accessibility notes.

What must not happen:

- No new gameplay systems.
- No full Inbox decision center yet.
- No real squad, tactics, market, finance, youth, staff, archive, or calendar
  sections.
- No UI-only data that cannot later map to career state.
- No hardcoded visible labels.

Why this is now:

The current web slice works, but the visual language does not yet feel enough
like football management. Fixing the identity first prevents every future
section from inheriting a weak dashboard style.

### Phase 54 - Tactics And Match Preparation Workspace Completion

Primary dependency: Phase 52 match-preparation slice, Phase 53 visual identity,
and the reusable tactical components extracted after Phase 53 review.

Purpose:

- Complete the tactical match-preparation workspace before other career sections
  depend on it.
- Let the user manually choose formation, starting XI, bench, and tactic.

Minimum useful scope:

- formation catalog;
- formation selector;
- formation-specific vertical pitch slots;
- manual starting XI selection;
- manual 8-player bench selection;
- duplicate validation across XI and bench;
- tactic profile selection;
- save readiness tied to formation, XI, bench, and tactic;
- dashboard/Inbox/Continue integration;
- Playwright desktop/narrow visual QA.

Engine/read-model dependencies:

- `@game/ui` match-preparation contract;
- formation catalog;
- position suitability ordering;
- web preparation demo adapter/state.

Current progress:

- Step 01 scope audit complete.
- Step 02 formation catalog and preparation contract complete.
- Step 03 web preparation state and formation switching complete.
- Step 04 tactical component boundaries complete.
- Step 05 starting XI and bench selection flow complete.
- Step 06 tactic profile and save readiness integration complete.
- Step 07 dashboard, Inbox/Posta, and Continue readiness complete.
- Step 08 responsive accessibility and visual QA complete.
- Step 09 section quality report and next-phase decision complete.

Final result:

- Phase 54 is complete.
- The tactical workspace is strong enough for Inbox/Posta to route attention
  events into it.
- Previous recommendation: `Phase 55 - Inbox/Posta Decision Center`.
- Superseded recommendation: insert
  `Phase 55 - Web Architecture State And Styling Foundation` first.
- Current roadmap correction: Inbox/Posta Decision Center now follows the
  canonical formation/role cleanup and shared tactical board foundation as
  Phase 58.

What must not happen:

- No automatic best XI.
- No automatic bench fill.
- No tactic recommendation.
- No drag-and-drop unless specifically justified later.
- No substitutions during match.
- No market/squad-needs advice.

Why this is now:

Inbox/Posta can route to match preparation only if match preparation is already a
strong, reusable tactical workspace. Otherwise Inbox would be built on top of an
incomplete decision screen.

### Phase 55 - Web Architecture State And Styling Foundation

Primary dependency: Phase 54 tactical workspace and the current web prototype
showing enough state/styling complexity to justify a foundation pass.

Purpose:

- Make the web app structure readable, maintainable, and open to future
  sections before Inbox, Squad, Calendar, Market, Finance, Youth, Staff, and
  Archive multiply current complexity.

Minimum useful scope:

- Current web architecture audit.
- Feature-first folder map.
- Zustand state store for existing browser state.
- Tailwind setup for common utility styling.
- File migration without behavior changes.
- CSS reduction where Tailwind improves readability.
- Browser regression QA.
- Architecture documentation update.

Engine/read-model dependencies:

- `@game/ui` remains the framework-free read-model source.
- `apps/web` remains the browser adapter.
- Zustand must not own engine rules.
- Tailwind must not replace bespoke tactical pitch logic where custom CSS is
  clearer.

What must not happen:

- No Inbox/Posta Decision Center implementation.
- No new gameplay systems.
- No UI redesign beyond preserving current behavior.
- No dead wrapper Modules or unused future-feature folders.
- No duplicated React state and Zustand state for the same concept.

Why this is now:

The current UI already works, but `App.tsx`, broad folders, and hand-written CSS
are becoming weak seams. A foundation pass now prevents every future career
section from inheriting the same structural friction.

Current progress:

- Step 01 current web architecture audit complete.
- Step 02 folder map and migration plan complete.
- Step 03 Zustand and Tailwind tooling installed with Node 24 and verified.
- Step 04 career UI state moved into one focused Zustand store.
- Step 05 feature-first folder migration complete.
- Step 06 Tailwind foundation and conservative CSS reduction complete.
- Step 07 regression visual QA and accessibility pass complete.
- Step 08 architecture/state/styling report complete.

Final result:

- Phase 55 is complete.
- The web app now has feature-first folders, one focused Zustand store, a
  Tailwind entry point, documented custom-CSS boundaries, updated architecture
  docs, and Phase 55 Playwright QA screenshots.
- Superseded recommendation: `Phase 56 - Inbox/Posta Decision Center`.
- Adopted next phase: `Phase 56 - Canonical Formation And Role Catalog`.

### Phase 56 - Canonical Formation And Role Catalog

Primary dependency: Phase 54 tactical workspace, Phase 55 web architecture
foundation, and the user decision that player roles are limited to one
canonical list.

Purpose:

- Define one source of truth for player roles, formation slots, side/channel
  metadata, and pitch placement before building more tactical or Inbox-routed
  UI.
- Prevent future drift between domain formations, UI read models, i18n labels,
  select ordering, and web pitch coordinates.

Minimum useful scope:

- canonical 12-role domain contract;
- domain formation catalog rewritten around canonical roles plus slot metadata;
- suitability and player-option ordering using role first and slot metadata
  second;
- explicit manager-triggered selection helpers: `Auto`, `Fill gaps`, and
  `Clear`;
- `@game/ui` formation facts derived from domain or an explicitly documented
  boundary;
- localized role/slot labels in all supported languages;
- web pitch mapping that keeps critical formations inside the field;
- supplied SVG football-pitch background integrated without clipping;
- Playwright QA for critical formations.

What must not happen:

- No Inbox/Posta Decision Center implementation.
- No hidden automatic best XI or best bench; helper selection only runs after
  explicit manager input.
- No drag-and-drop.
- No new match-engine probability tuning.
- No duplicated formation catalog if the domain catalog can serve the same need.

Why this is now:

The tactical workspace revealed a modelling issue: player roles, slot labels,
and pitch coordinates were too easy to confuse. The game needs a stable
football grammar before Inbox/Posta and future tactics screens route more user
decisions into this area.

Current progress:

- Step 01 current formation/role divergence audit complete.
- Step 02 canonical role contract complete.
- Step 03 domain formation catalog rewrite complete.
- Step 04 position suitability and selection ordering complete.
- Step 04a manager-triggered selection actions complete.
- Step 05 UI read model derives from domain catalog complete.
- Step 06 i18n and web pitch slot mapping complete.
- Step 06a pitch SVG background integration complete.
- Step 07 regression visual QA and accessibility complete.
- Step 08 phase report and next-phase decision complete.

Final result:

- Phase 56 is complete.
- The canonical player-role list is owned by domain.
- Formation slots are derived from the domain catalog in `@game/ui`.
- Web match preparation consumes that read model and renders it over the
  supplied SVG pitch background.
- `Auto`, `Fill gaps`, and `Clear` are explicit manager-triggered helpers, not
  hidden automation.
- Playwright QA covers critical desktop/narrow tactical layouts and helper
  keyboard reachability.
- Recommended next phase: `Phase 57 - Shared Tactical Board And Tactics Screen Foundation`.

### Phase 57 - Shared Tactical Board And Tactics Screen Foundation

Primary dependency: Phase 56 canonical formation/role catalog, Phase 55 web
architecture foundation, Phase 54 tactical workspace, and the supplied tactical
board reference in `feature_richiesta/the-long-season-tactics/`.

Purpose:

- Replace the current static match-preparation pitch with a reusable tactical
  board built on normalized coordinates, canonical roles, constrained movement
  zones, real squad data, role-fit feedback, and durable preparation state.
- Make the same board ready for the future Tactics screen and matchday
  read-only usage without introducing a second tactical model.

Minimum useful scope:

- audit and map the supplied feature into the current architecture;
- canonical board role-code and geometry contract;
- shared board state and adapters;
- pitch markings and player tokens using game design tokens;
- drag zones, context menu, and touch long-press interactions;
- real squad mapping and role suitability;
- match-preparation replacement and persistence;
- Playwright desktop/narrow/touch-style QA and accessibility notes;
- final report with exactly one next-phase recommendation.

What must not happen:

- No Inbox/Posta Decision Center implementation.
- No full Tactics section screen yet.
- No opponent mirrored board.
- No live matchday tactical changes.
- No bench drag/drop.
- No non-canonical roles.
- No pixel coordinates in state.
- No duplicate formation catalog.
- No hidden automatic lineup decisions.

Why this is now:

The match-preparation workspace still feels too static and too far from a
Football Manager / Championship Manager tactical board. Before the Inbox/Posta
routes more decisions into match preparation, the board itself needs to be a
stable shared component with correct football semantics, good interaction, and
clean persistence.

Current progress:

- Step 01 supplied feature audit and integration map complete.
- Step 02 canonical board role and geometry contract complete.
- Step 03 shared tactical board state and adapters complete.
- Step 04 pitch markings, token, and visual board shell complete.
- Step 05 drag zone, context menu, and touch long-press interactions complete.
- Step 06 real squad mapping and role suitability complete.
- Step 07 match-preparation replacement and persistence complete.
- Step 08 regression visual QA, accessibility, and touch complete.
- Step 09 phase report, architecture update, roadmap update, and next-phase
  decision complete.

Final result:

- Phase 57 is complete.
- The shared tactical board is now the reusable tactical surface for match
  preparation, the future Tactics screen, and future read-only matchday display.
- The board uses normalized coordinates, canonical roles, movement zones, real
  squad mapping, derived suitability, active drag zones, right-click and
  long-press menus, and persistence-ready draft state.
- Match preparation now uses the shared board while keeping the separate
  8-player bench, tactic profile, save readiness, dashboard blockers,
  Inbox/Posta blocker resolution, and Continue flow.
- Playwright QA covers desktop, narrow, keyboard, drag, clamp, goalkeeper,
  role-change, candidate filtering, suitability, and touch-style long-press
  behavior.
- Superseded recommendation: `Phase 58 - Inbox/Posta Decision Center`.
- Adopted next phase:
  `Phase 58 - Match Preparation Tactical Workspace UX Rework`.

### Phase 58 - Match Preparation Tactical Workspace UX Rework

Primary dependency: Phase 57 shared tactical board foundation and the user
review that the current match-preparation screen still has too much empty
space, weak contextual density, inconsistent bench picking, and a sticky
context menu.

Purpose:

- Make the tactical workspace feel like a serious Championship Manager /
  Scudetto preparation screen before Inbox/Posta routes more decisions into it.
- Fix the interaction and ranking issues surfaced by real visual review.

Minimum useful scope:

- compact match header;
- compact blocker/attention strip;
- board toolbar containing formation and explicit helper actions;
- context-menu dismissal on pitch click, outside click, `Esc`, and completed
  actions;
- candidate ordering by role suitability, current ability, fitness, then stable
  identity;
- shared candidate row for XI and bench pickers;
- bench visual parity with XI slot assignment while keeping 8 explicit reserve
  slots;
- improved spacing for three `CC` and three `DC` lines;
- desktop/narrow Playwright screenshot QA and accessibility notes.

What must not happen:

- No Inbox/Posta Decision Center implementation.
- No full Tactics route.
- No bench drag/drop.
- No hidden automatic lineup or bench choices.
- No decorative redesign that does not improve manager decisions.

Why this is now:

The tactical board is technically ready, but the match-preparation screen is a
core user-facing decision surface. If it feels sparse, inconsistent, or sticky,
Inbox/Posta would simply route the manager into a weak experience. Fix the
workspace first, then resume Inbox/Posta.

Current progress:

- Step 01 current UX issue audit and target layout complete.
- Step 02 compact match header and alert strip complete.
- Step 03 context menu dismissal and candidate ranking complete.
- Step 04 shared player candidate row and picker contract complete.
- Step 05 bench selection visual parity complete.
- Step 06 board spacing density and toolbar polish complete.
- Step 07 responsive accessibility and visual QA complete.
- Step 08 phase report and next-phase decision complete.

Final result:

- Phase 58 is complete.
- The match-preparation tactical workspace has compact first-viewport context,
  compact blockers, board-local controls, dismissible context menus,
  suitability-ranked candidates, shared XI/bench candidate rows, explicit bench
  parity, central-line spacing coverage, and desktop/narrow Playwright QA.
- Previous recommendation: `Phase 59 - Inbox/Posta Decision Center`.
- Superseded recommendation: insert
  `Phase 59 - Shared Bench Board And Substitute Selection` first, because the
  bench is still a core match-preparation decision surface and Inbox/Posta
  should route into a stronger section.

### Phase 59 - Shared Bench Board And Substitute Selection

Primary dependency: Phase 57 shared tactical board foundation and Phase 58
match-preparation tactical workspace UX rework.

Purpose:

- Make the bench feel like a real tactical selection surface instead of a
  secondary picker.
- Use the same add/remove contextual language as the XI board while keeping
  bench behavior simpler and safer.

Minimum useful scope:

- 8 fixed substitute slots `S1` to `S8`;
- compact green mini-board without pitch stripes;
- empty slots with `+`;
- filled slots with number, surname, and role;
- add menu for empty slots;
- remove action for filled slots;
- candidate ordering by overall/current ability, form, position order, then
  stable identity;
- validation for max 8, all slots filled, no duplicates, no XI overlap, and at
  least one goalkeeper;
- `Auto` fills XI first, then bench;
- `Riempi` fills XI and bench gaps;
- `Svuota` clears XI and bench;
- desktop/narrow Playwright screenshot QA and accessibility notes.

What must not happen:

- No Inbox/Posta Decision Center implementation.
- No bench drag/drop.
- No bench role changes.
- No promote-to-XI shortcut.
- No hidden automatic choices outside explicit helper actions.
- No duplicate bench picker implementations.

Why this is now:

The panchina is part of the match-preparation core. If substitutes remain a
separate weak picker, the section still feels unfinished. Completing the bench
now gives the future Inbox/Posta flow a stronger destination when it stops the
manager for match preparation.

Current progress:

- Phase 59 README and ordered step documents are ready.
- Step 01 current bench flow audit and target contract complete.
- Step 02 bench read-model validation and ordering complete.
- Step 03 shared bench board component foundation complete.
- Step 04 bench context menu and candidate picker complete.
- Step 05 helper actions and save readiness integration complete.
- Step 06 match-preparation replacement and dead-code cleanup complete.
- Step 07 responsive accessibility and visual QA complete.
- Step 08 phase report and next-phase decision complete.
- Phase 59 is complete.

Recommended next phase after completion:

- `Phase 60 - Web Theme Palette And User Color Preferences`.

### Phase 60 - Web Theme Palette And User Color Preferences

Primary dependency: Phase 55 web architecture foundation, Phase 53 retro
football UI identity, Phase 57 shared tactical board, and Phase 59 shared bench
board.

Purpose:

- Let the user choose from a controlled set of football-manager-friendly UI
  color tones without turning the game into a generic skin system.
- Keep field surfaces and semantic colors stable while making app chrome,
  panels, tables, buttons, navigation, and non-semantic accents configurable.

Minimum useful scope:

- audit current color tokens and hardcoded colors;
- define one typed theme-palette contract;
- support nine palettes:
  - `classic-green`;
  - `nocturne-navy`;
  - `dugout-navy`;
  - `heritage-cream`;
  - `azzurri-office`;
  - `violet-director`;
  - `programme-ivory`;
  - `clubhouse-sage`;
  - `touchline-stone`;
- add theme choice to web display preferences;
- expose a compact settings palette picker with swatches;
- apply palettes through CSS variables;
- keep tactical pitch grass, `campo-calcio.svg`, role suitability, blocker
  severity, and fitness arrows non-themeable;
- run desktop/narrow visual QA for all palettes.

What must not happen:

- No Inbox/Posta Decision Center implementation.
- No arbitrary image skins, decorative backgrounds, or heavy gradients.
- No field/pitch recoloring through user preferences.
- No theming of semantic status colors.
- No palettes that are too dark to read comfortably.

Why this is now:

The next web sections will multiply chrome, panels, tables, and action states.
Adding a bounded palette system now prevents hardcoded visual drift before
Inbox/Posta, Squad, Calendar, Market, and Finances screens expand the UI.

Current progress:

- Phase 60 README and ordered step documents are ready.
- Step 01 current color token and hardcoded audit complete.
- Step 02 theme palette contract and boundaries complete.
- Step 03 theme preference state and read model complete.
- Step 04 CSS variable theme application complete.
- Step 05 settings palette picker UI complete.
- Step 06 hardcoded color cleanup and non-theme exceptions complete.
- Step 07 contrast visual QA and accessibility complete.
- Step 08 phase report and next-phase decision complete.
- Phase 60 is complete.

Recommended next phase:

- `Phase 61 - Web Visual Identity System Rework`.

### Phase 61 - Web Visual Identity System Rework

Primary dependency: Phase 60 theme palette preferences, Phase 53 retro football
UI identity, Phase 55 styling foundation, and
`docs/audits/WEB_PALETTE_ART_DIRECTION_AUDIT.md`.

Purpose:

- Replace the weak Phase 60 palette result with a coherent retro-premium
  football-management visual identity system.
- Reduce or replace decorative color variants with a small number of believable
  skins.
- Fix token taxonomy and component surface hierarchy before more web sections
  inherit the current visual problems.

Minimum useful scope:

- current palette failure review and target lock;
- skin contract and visual-token taxonomy;
- palette reduction and deterministic preference fallback for removed ids;
- dark-skin surface hierarchy rework;
- light-skin surface hierarchy rework;
- settings picker/i18n/test update;
- screenshot QA plus manual art-direction acceptance;
- architecture and roadmap update.

What must not happen:

- No Inbox/Posta Decision Center implementation.
- No new gameplay systems.
- No field/pitch recoloring through user preferences.
- No changes to `apps/web/src/assets/campo-calcio.svg`.
- No theming of role suitability, fitness, danger, success, or warning
  semantics.
- No palette kept just to preserve the old count of nine.

Why this is now:

The current palette system is technically wired, but the screens look
amateurish and do not yet feel like a premium retro football-management game.
Continuing with Inbox, Squad, Market, or Finance would spread that visual debt
across every future screen.

Current progress:

- Phase 61 README and ordered step documents are ready.
- Step 01 current palette failure review and target lock complete.
- Step 02 skin contract and token taxonomy complete.
- Step 03 palette reduction and preference migration complete.
- Step 04 dark-skin surface hierarchy rework complete.
- Step 05 light-skin surface hierarchy rework complete.
- Step 06 settings picker localization and tests complete.
- Step 07 visual QA and art-direction gate complete.
- Step 08 phase report and next-phase decision complete.
- Phase 61 is complete.

Recommended next phase after completion:

- `Phase 62 - Inbox/Posta Decision Center`.

### Phase 62 - Inbox/Posta Decision Center

Primary dependency: Phase 55 web architecture foundation, Phase 54 tactical
workspace, Phase 56 canonical formation/role catalog, Phase 57 shared tactical
board foundation, Phase 58 tactical workspace UX rework, Phase 59 shared bench
board, Phase 60 theme palette preferences, Phase 61 visual identity system
rework, and at least one resolvable attention event.

Purpose:

- Turn Inbox/Posta into the structured place where career advancement stops are
  explained and resolved.

Minimum useful scope:

- Message list in the left rail.
- Message detail in the central outlet.
- Action-required state.
- Mark read/unread if useful.
- Link attention messages to the relevant section.

Stop categories to support progressively:

- match preparation required;
- matchday reached;
- transfer response;
- contract decision;
- youth player aging out;
- squad registration issue;
- staff/economics later.

What must not happen:

- No generic news feed.
- No prose-only mail system without structured event IDs.
- No hidden automatic resolution.

### Phase 63 - Squad Screen

Primary dependency: match-preparation needs real player selection pressure.

Purpose:

- Make the user understand the squad and make better selection/rotation
  decisions.

Minimum useful scope:

- Senior squad table.
- Role/position.
- Age.
- condition/readiness.
- current level bands where appropriate.
- potential visibility only according to current game rules.
- simple filters by department and status.

Engine/read-model dependencies:

- senior roster state;
- player condition state;
- role/ability generation already exists;
- no scouting fog expansion unless documented later.

What must not happen:

- No fake squad recommendations.
- No hidden market needs.
- No sortable table logic duplicated in multiple components.

### Phase 64 - Calendar And Fixtures

Primary dependency: Continue loop and fixture dates.

Purpose:

- Make time progression understandable.

Minimum useful scope:

- Calendar list/month view for selected club.
- Next fixture.
- recent results.
- round/date labels.
- link fixture to preparation or matchday.

Engine/read-model dependencies:

- calendar generation;
- fixture state;
- career current date;
- selected club fixture lookup.

What must not happen:

- No decorative calendar that cannot drive Continue.
- No duplicate fixture computation in web.

### Phase 65 - Matchday Flow

Primary dependency: match preparation plus fixture advancement.

Purpose:

- Close the first satisfying gameplay loop:
  dashboard -> prepare -> matchday -> result -> consequences -> next stop.

Minimum useful scope:

- pre-match summary;
- play/advance fixture;
- result summary;
- key events;
- condition consequences;
- table impact where available.

Engine/read-model dependencies:

- career fixture progression;
- match reports;
- condition consequences;
- explanation trace where useful.

What must not happen:

- No full 2D/3D match viewer.
- No animation-heavy match screen before the result loop is excellent.

Current progress:

- Complete through the superseding operational Phase 65
  `web-matchday-playable-slice`.
- The browser can prepare the selected club, Continue to matchday, open the
  matchday screen from Inbox/Posta, play the fixture through the real engine
  path, inspect result/consequence facts, and return to an updated dashboard.
- Product rework decision: the Phase 65 result screen is technically playable
  but still feels too much like a log/report. The operational next phase is now
  `Phase 66 - Interactive Matchday Flow And Half-Time Decisions` from
  `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`, not the old Market
  UI row below.
- Persistence should wait until this interactive matchday experience is worth
  preserving.
- Phase 66 Step 01 audit is complete: the existing result screen should be
  treated as evidence, not the target experience. The next implementation seam
  is staged match-engine progression below `progressNextCareerFixture`.
- Phase 66 Step 02 is complete: the engine now exposes a deterministic staged
  regulation-time contract that can stop at half-time and continue to full time
  without activating future extra-time or penalty behavior.
- Phase 66 Step 03 is complete: staged snapshots now include deterministic
  player ratings derived from structured events, with no random or prose-based
  match evaluation.
- Phase 66 Step 04 is complete: selected-club half-time substitutions are now
  explicit manager-declared facts that update the second-half staged context.
- Phase 66 Step 05 is complete: `@game/ui` now has a phase-aware matchday read
  model for scoreboard, timeline, ratings, half-time actions, and full-time-only
  consequences.
- Phase 66 Step 06 is complete: the web demo adapter and Zustand store can now
  progress matchday from pre-match to half-time, accept explicit substitutions,
  continue to full time, and update dashboard-compatible career facts.
- Phase 66 Step 07 is complete: the matchday screen now renders a phase-aware
  match centre with dominant scoreboard, period rail, event cards, useful
  player rating/condition/contribution rows, localized labels, and
  full-time-only consequences instead of a raw log-like report.
- Phase 66 Step 08 is complete: the half-time screen now exposes selected-club
  substitution decisions from structured lineup/bench facts, shows rating and
  condition context for the first-half decision, rejects invalid changes with
  localized feedback, and records applied substitutions without adding team
  talks, opponent choices, persistence, or full tactical-board editing.
- Phase 66 Step 09 is complete: dashboard Continue now routes directly to the
  match centre when matchday is reached, the dashboard exposes a clear "Go to
  match" primary action, Inbox/Posta remains accurate as an attention record,
  and the app shell passes phase-aware matchday facts plus half-time callbacks
  into the browser match centre.
- Phase 66 Step 10 is complete: Playwright QA now covers desktop and narrow
  interactive matchday flow from dashboard/preparation to pre-match, half-time,
  substitution, full time, and dashboard return. QA fixed narrow player rows,
  removed a duplicate half-time no-op action, and documented that the match
  centre no longer reads as a raw log table.
- Phase 66 final report is complete, but the follow-up button/click-flow review
  supersedes the immediate persistence recommendation. The operational next
  web-product step is now `Phase 67 - Web Matchday Flow Simplification And
  Half-Time Tactical Decisions`; persistence should wait until duplicated
  buttons, dead dashboard actions, shell noise, and half-time tactical decisions
  are cleaned up.

### Phase 67 - Web Matchday Flow Simplification And Half-Time Tactical Decisions

Primary dependency: Phase 66 interactive matchday flow.

Purpose:

- Reduce matchday friction and make the web match path feel like a focused
  football-manager flow before persistence.

Minimum useful scope:

- audit current button surface and click count;
- hide Inbox/Posta and ambiguous global Continue during matchday;
- keep future navigation visible but non-clickable;
- remove available dashboard actions that do not have real screens or handlers;
- make dashboard expose exactly one primary next action;
- replace bottom preparation save with top-level "Save and go to match";
- keep explicit pre-match "Start match";
- make half-time a required tactical decision stop with substitutions and full
  formation/board changes;
- make full-time use one final "Continue";
- prove desktop/narrow flow with Playwright and record final click count.

What must not happen:

- No persistence.
- No live replay.
- No team talks.
- No opponent tactical board.
- No new market/finance/youth sections.

Current progress:

- Step 01 is complete: `MATCHDAY_FLOW_SIMPLIFICATION_AUDIT.md` records the
  current cold/warm click paths, visible button surface, dead dashboard actions,
  duplicate actions, shell noise, Inbox/Posta visibility during matchday, and
  the accepted target flow. The target is one primary action per screen, no
  available dead controls, `Save and go to match` from preparation, explicit
  `Start match`, a useful half-time tactical stop, and final `Continue` back to
  a clean dashboard.
- Step 02 is complete: the shell read model now has focused modes for standard,
  preparation, and matchday contexts. Matchday mode can render without
  Inbox/Posta or global Continue, preparation mode can suppress global Continue,
  and disabled future navigation items remain visible as non-interactive
  navigation text rather than available-looking buttons.
- Step 03 is complete: the dashboard read model now emits only real current
  actions (`prepare_match` when it resolves preparation blockers and
  `advance_next_fixture` when matchday can be opened), while the web dashboard
  removes the duplicated lower action list so the user sees one primary next
  action.
- Step 04 is complete: match preparation now exposes a top-level `Save and go
  to match` CTA, removes the old bottom `Save preparation` duplicate, suppresses
  the shell global Continue in preparation mode, and routes a complete saved
  setup directly into the explicit pre-match state without auto-starting the
  match.
- Step 05 is complete: the phase-aware matchday read model now exposes exactly
  one primary action per phase, the matchday shell hides Inbox/Posta and global
  Continue, the matchday header no longer shows a duplicate Dashboard route, and
  full time returns through a single localized `Continue` action that clears
  stale attention text before opening the dashboard.
- Step 06 is complete: domain now owns a structured selected-club half-time
  tactical decision plan with validation facts for invalid setup, empty XI
  slots, duplicate players, missing goalkeeper, bench overlap, and substitution
  limits. The staged engine can consume that validated plan for the second-half
  selected-club lineup while preserving existing substitution-only behavior and
  carrying the applied plan through full-time snapshots.
- Step 07 is complete: half-time now uses the shared tactical board and fixed
  bench board as the decision workspace. The web app passes the current
  preparation draft into matchday, lets the manager adjust formation, XI,
  player roles, slot positions, and bench assignments at the break, and feeds
  those choices into the structured half-time tactical plan before starting the
  second half. Validation issues are localized from structured fact keys, and
  the old two-select substitution panel remains only as a fallback.
- Step 08 is complete: browser QA drove the simplified dashboard-to-full-time
  path on desktop and narrow viewports, generated screenshots for dashboard,
  preparation, pre-match, half-time, full-time, and dashboard-after-match, and
  recorded a maximum flow count of 8 clicks with no horizontal overflow,
  no matchday Inbox/Posta rail, no global matchday Continue, and no dead
  dashboard action buttons.
- Step 09 is complete: `MATCHDAY_FLOW_SIMPLIFICATION_REPORT.md` closes the
  phase with the final click-flow evidence, removed/renamed/contextual action
  list, shell-mode explanation, dashboard/preparation/matchday entry points,
  Playwright screenshot findings, residual UX risks, and the next-phase
  decision.

Final decision:

- Phase 67 is complete.
- Superseded decision: the original recommendation was `Phase 68 - Web Career
  Persistence And Save Adapter`.
- Product review rejected the broader first-MVP UX language after Phase 67.
  Persistence is postponed again because it would make a weak experience
  durable.
- The next web phase is now `Phase 68 - MVP UX Language Reset Around Tactical
  Board`.

### Phase 68 - MVP UX Language Reset Around Tactical Board

Primary dependency: Phase 67 matchday flow simplification.

Purpose:

- Reset the first MVP web UX language around the one approved surface: the
  tactical board.

User-facing reason:

- The tactical board is the first screen element that feels close to the desired
  football-manager quality. The rest of the MVP must be redesigned around that
  anchor before more systems or persistence are added.

Minimum useful scope:

- audit why the current shell, dashboard, Inbox/Posta, preparation chrome, and
  matchday UX are rejected;
- formally lock the tactical board as the approved visual anchor;
- define the first MVP UX language and screen hierarchy;
- define first MVP information architecture and manager flow;
- create static direction for main menu, dashboard, Inbox/Posta, match
  preparation, and matchday before app-wide implementation;
- rework shared layout/components only after the static direction is accepted;
- rework dashboard and Inbox/Posta into a command centre;
- rework match preparation around the approved board without replacing it;
- rework matchday so it no longer feels like a log/debug report;
- prove the result with Playwright desktop/narrow visual QA and accessibility
  checks.

What must not happen:

- No persistence/localStorage/save adapter.
- No new market, finance, youth, staff, archive, facilities, or squad feature
  expansion.
- No tactical-board replacement.
- No live replay or new match-engine behavior.
- No new palette explosion.
- No app code after the static direction step unless the direction is accepted
  or the blocker is documented.

Definition of Done:

- The current UX failure is documented honestly.
- The tactical board is preserved as the visual anchor.
- The first MVP UX language and information architecture are explicit.
- Static direction is accepted before source rework continues.
- Dashboard, Inbox/Posta, preparation, and matchday no longer feel like debug
  tables or generic SaaS surfaces.
- Final report states whether persistence can resume or another UX pass is
  required.

### Future Web Backlog - Market UI MVP

Primary dependency: squad screen and basic finances/budget visibility.

Purpose:

- Let the user pursue clear squad improvement stories.

Minimum useful scope:

- inspect possible targets from known generated world data;
- make permanent transfer offer;
- see budget impact;
- see player willingness result;
- accepted/rejected outcome;
- update squad if transfer is applied.

Engine/read-model dependencies:

- market MVP permanent transfers;
- career transfer persistence;
- player willingness;
- budget state.

What must not happen:

- No loans yet unless a later phase requires them.
- No auctions.
- No complex add-ons.
- No scouting fog unless specifically designed.

### Future Web Backlog - Finances Foundation

Primary dependency: market starts needing real budget context.

Purpose:

- Make money meaningful without turning the first UI into accounting.

Minimum useful scope:

- transfer budget;
- wage budget placeholder or first real wage model if documented;
- basic income/cost summary;
- currency preference rendering;
- clear warnings only when they change manager decisions.

Future economics:

- ticket price;
- stadium;
- sponsorship;
- annual wages;
- contracts.

What must not happen:

- No fake financial complexity just to fill a screen.
- No economy values that do not affect decisions.

### Future Web Backlog - Youth UI

Primary dependency: squad screen and youth lifecycle.

Purpose:

- Make youth development a long-term story source.

Minimum useful scope:

- youth academy list;
- age 15-19 status;
- prospect tier visible according to current rules;
- aging-out alerts;
- manual promotion for user club;
- release/sell/keep decision placeholders only if backed by state.

Engine/read-model dependencies:

- youth academy and pipeline;
- season rollover;
- development model;
- rarity budgets.

What must not happen:

- No automatic promotion for the user.
- No overpopulation of youth players.
- No guaranteed wonderkid pipeline.

### Future Web Backlog - Staff Foundation

Primary dependency: player development, youth, condition, and market need staff
effects to matter.

Purpose:

- Introduce staff only when staff changes real outcomes.

Minimum useful scope:

- staff roles only if they affect a modeled system:
  - training/development;
  - youth intake;
  - recovery/condition;
  - scouting/market information.

What must not happen:

- No staff screen made of names and no effects.
- No staff attributes without engine usage.

### Future Web Backlog - Archive And History

Primary dependency: at least one completed playable season loop.

Purpose:

- Preserve career memory and make long saves emotionally valuable.

Minimum useful scope:

- season history;
- final tables;
- selected club record;
- player season stats;
- transfers history;
- key match reports.

Engine/storage dependencies:

- durable historical snapshots;
- season rollover;
- match reports;
- transfer records.

What must not happen:

- No static archive without persisted events.
- No history screen that reconstructs unreliable facts from current state only.

### Future Web Backlog - Main Dashboard Consolidation

Primary dependency: enough real sections exist to summarize.

Purpose:

- Rebuild the dashboard as the actual manager control room.

Minimum useful scope:

- top attention strip;
- next fixture/preparation state;
- condition risks;
- squad alerts;
- Inbox/Posta summary;
- calendar context;
- market/youth/finance alerts only if implemented;
- one clear Continue action.

Important layout rule:

Critical blockers and attention items must be in the first viewport, not buried
below secondary report cards.

What must not happen:

- No "everything dashboard" that duplicates every section.
- No decorative stat cards that do not drive decisions.

### Phase 76 - Web Motion Language And Football Feedback System

Primary dependency: the complete current browser journey through Phase 75.

Purpose:

- Introduce one shared Motion-for-React presentation seam before new sections
  multiply screen-local transitions and loading feedback.
- Improve responsiveness, spatial continuity, and football-event hierarchy
  without changing engine facts, career commands, persistence, or the approved
  tactical board.

Minimum useful scope:

- web-only bundle-conscious Motion provider and semantic presets;
- immediate command feedback;
- restrained shell, dialog, Continue, Posta, and Dashboard transitions;
- tactical assignment and substitution continuity;
- Matchday commentary, score, decisive-event, half-time, and full-time
  choreography;
- complete reduced-motion, keyboard, responsive, performance, and dead-code
  QA.

What must not happen:

- No animation as gameplay logic or persistence state.
- No movement without a feedback, orientation, continuity, or football-story
  reason.
- No animated background, broad visual redesign, tactical-board rewrite,
  unsupported event animation, or second motion system.

Definition of Done:

- Every current browser journey uses one coherent motion language where useful,
  remains correct with reduced motion, and passes the authoritative Playwright
  gate without layout growth, overflow, focus loss, or dead animation code.

Completion:

- Steps 01-09 are complete. Motion remains web-only, all current presets have
  production consumers, the canonical browser gate passes in normal and
  reduced-motion modes, and the final evidence is recorded in
  `docs/audits/WEB_MOTION_SYSTEM_REPORT.md`.
- Phase 77 is now the single documented next phase. Squad remains the next
  section after the live Matchday contract is complete.

### Phase 77 - Live Match Control, Statistics And In-Game Decisions

Primary dependency: complete Phase 76 motion language, Phase 75 player
lifecycle, and the deterministic Matchday/career commit path.

Purpose:

- Replace half-at-once Matchday progression with one deterministic live minute
  session shared by batch and interactive drivers.
- Give the manager real pause, substitution, role, formation, and team-
  instruction decisions backed by the approved tactical board.
- Present causal live statistics, incidents, ratings, condition, and
  consequences with a premium football-broadcast hierarchy.

Minimum useful scope:

- `pre_match`, `first_half`, `half_time`, `second_half`, and `full_time` live
  states;
- `1x`, `2x`, `4x`, unlimited manual pause, and automatic injury/red-card/
  half-time decision pauses;
- real possession, shots, shots on target, xG, corners, fouls, cards, saves,
  goals, condition, and ratings;
- deterministic selected-club and opponent substitutions/tactical changes;
- shared-board drag/drop plus click/tap/keyboard alternatives;
- cumulative tabellino, `Partita`/`Statistiche`/`Tattica`, and full-time team
  tabs;
- durable injury/suspension/Posta consequences at completed-fixture commit;
- 50 deterministic worlds across one complete season plus full visual and
  accessibility QA.

What must not happen:

- No second simulator, cosmetic statistic, UI-owned football rule, per-minute
  storage write, or live recovery checkpoint.
- No extra time, shootout, cup branch, substitution-window limit, pass model,
  offside model, 2D/3D viewer, or unsupported event placeholder.
- No second tactical board, drag-only command, hidden role conversion, runtime
  LLM, or decorative animation layer.

Definition of Done:

- One deterministic minute session drives batch and live Matchday.
- Every visible fact and decision has one tested engine/domain owner.
- The complete browser journey is usable at desktop/narrow widths, 200% text,
  keyboard, touch, and reduced motion.
- The `50 worlds x 1 season` gate passes without structural match, statistic,
  discipline, injury, or substitution failure.
- Steps 01-10 and the final report are complete before Squad or Market starts.

Progress:

- Step 01 is complete: live phases, session/team facts, manager commands,
  structured incidents/statistics/consequences, and the current competition's
  substitution and yellow-card rules now have one tested domain contract.
- Step 02 is complete: batch and staged progression now share one canonical
  one-minute session, arbitrary pauses expose no future facts, and presentation
  cadence cannot alter deterministic output.
- Step 03 is complete: the minute engine now owns causal possession, shots,
  shots on target, xG, corners, saves, goals, on-pitch condition, and one
  incremental rating ledger shared by live and final projections. Control
  affects chance creation only, while fixed-seed coverage proves that lower-
  possession counterattacking wins remain possible.
- Step 04 is complete: deterministic fouls, penalties, cards, and injuries now
  flow from minute causality into typed pauses, immediate dismissals or forced
  exits, durable injury dates, competition-scoped suspensions, yellow totals,
  later selection exclusion, structured Posta, and SQLite schema version `8`.
- Step 05 is complete: one compact deterministic opponent policy now handles
  forced injury, dismissal recovery, low condition, poor performance, score,
  and minute context through the same validated live command path as the
  manager. Substitutions and bounded tactical changes emit structured facts,
  stable tie-breaks preserve reproducibility, and the half-time-only AI seam
  has been removed.
- Step 06 is complete: the browser now drives one memory-only canonical minute
  session with `1x`/`2x`/`4x`, manual pause, real decision pauses, immediate
  command feedback, and no per-minute career/ Posta/persistence rebuild. The
  fixture remains unpublished at full time until `Continua`; refresh restarts
  the unfinished match from the durable pre-match boundary. Minor injuries no
  longer force a decision pause: only a red card or injury requiring
  substitution blocks live play, while penalty award/outcome and goals receive
  bounded narrative holds.
- Step 07 is complete: `Partita`, `Statistiche`, and `Tattica` now consume one
  cumulative structured live projection. The stable broadcast header keeps one
  current commentary line, the tabellino retains both halves, and comparative
  bars expose only causal engine metrics. Penalty award/outcome and goals use
  bounded narrative holds; red cards and forced injuries remain decision
  pauses. Browser QA also proved that a carried plan now removes unavailable
  players before the next fixture without replacing them silently.
- Step 08 is complete: the approved shared board now owns paused live
  substitutions, starter exchanges, formation and role changes, suitability
  destinations, forced-exit display, fixed bench identity, and accessible
  click/tap/keyboard parity. Outgoing players cannot re-enter and live edits
  remain typed, reversible, and memory-only until accepted.
- Step 08 verification: Node 24.16.0; web tests (`59` files / `254` tests),
  web typecheck/build, canonical Playwright `19/19`, dependency-cruiser (`573`
  modules / `2,094` dependencies), diff check, and Graphify update pass.
- Step 09 is complete. Career-wide state, table, availability, Posta, and
  attention remain unchanged at every minute and at the initial full-time
  projection. One cached canonical preview feeds the three review tabs, and
  one `Continua` command commits those facts atomically; a due autosave failure
  leaves the review retryable without duplicate consequences.
- Step 09 verification: Node 24 engine/UI/i18n/web suites PASS (web `59` files /
  `256` tests); Playwright PASS (`19/19`); web typecheck/build,
  dependency-cruiser (`573` modules / `2,097` dependencies), and diff check
  PASS.
- Step 10 is complete: superseded staged, half-time-only, and durable
  unfinished-match paths are removed; SQLite schema version `9` owns the clean
  beta reset; canonical Motion/accessibility QA passes `19/19`; and the
  repeated `50 worlds x 1 season` gate completes `15,300` fixtures with zero
  invariant failure and stable hash
  `396aaed146613af94950c0a6365b548e`, with `3.156` goals per match and
  `0.186` penalties awarded per match inside the unchanged calibration gate.
- Phase 77 is complete. Final ownership, distributions, accepted anomalies,
  residual risks, and manual checks are recorded in
  `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`.

## Dependency Summary

Recommended order:

1. Phase 52 - Web Match Preparation Slice
2. Phase 53 - Retro Football UI Identity Rework
3. Phase 54 - Tactics And Match Preparation Workspace Completion
4. Phase 55 - Web Architecture State And Styling Foundation
5. Phase 56 - Canonical Formation And Role Catalog
6. Phase 57 - Shared Tactical Board And Tactics Screen Foundation
7. Phase 58 - Match Preparation Tactical Workspace UX Rework
8. Phase 59 - Shared Bench Board And Substitute Selection
9. Phase 60 - Web Theme Palette And User Color Preferences
10. Phase 61 - Web Visual Identity System Rework
11. Phase 62+ engine/playability safety and advancement phases, as documented
    in `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
12. Phase 67 - Web Matchday Flow Simplification And Half-Time Tactical Decisions
13. Phase 68 - MVP UX Language Reset Around Tactical Board
14. Phase 70 - Web Matchday Information Architecture And Live Flow Rework
15. Phase 71 - Web Career Persistence And Save Lifecycle Foundation - complete
16. Phase 72 - Career Session Autosave And Command Feedback - complete
17. Phase 73 - Inbox/Posta Decision Center And Career Attention Workflow - complete
18. Phase 73A - Web Product UI/UX Quality Audit And Premium Design Baseline - complete
19. Phase 73B - Current Web Product Premium Remediation And Journey Hardening - complete
20. Phase 73C - Matchday Broadcast Workspace And Tabbed Review Rework - complete
21. Phase 74 - Player Generation And Model Consolidation Cleanup - complete
22. Phase 75 - Player Generation, Potential And Development Lifecycle Rework - complete; no web UI implementation in this phase
23. Phase 76 - Web Motion Language And Football Feedback System - complete
24. Phase 77 - Live Match Control, Statistics And In-Game Decisions - complete
25. Future Web Backlog - Squad Screen And Player Memory Foundation
26. Future Web Backlog - Calendar And Fixtures
27. Future Web Backlog - Market UI MVP
28. Future Web Backlog - Finances Foundation
29. Future Web Backlog - Youth UI
30. Future Web Backlog - Staff Foundation
31. Future Web Backlog - Archive And History
32. Future Web Backlog - Main Dashboard Consolidation

This order is intentionally linear:

- Match preparation resolves the current blocker.
- Retro-football identity comes before more sections so future screens inherit
  the right football-management language.
- Web architecture hardening comes before Inbox so future sections do not build
  on scattered state or uncontrolled styling.
- Canonical roles and the shared tactical board come before Inbox so attention
  messages can route to a strong, reusable football decision screen.
- Tactical workspace UX rework comes before Inbox because the manager must land
  on a dense, clear, consistent preparation screen when a message routes there.
- Theme palettes come before Inbox so the next UI sections inherit one bounded
  color system instead of accumulating hardcoded visual variants.
- Visual identity rework corrects Phase 60 before the next sections inherit bad
  skin and token decisions.
- Career session cadence and command feedback follow persistence so the manager
  controls when progress is committed and never mistakes real asynchronous work
  for a frozen interface.
- Inbox/Posta follows the session correction so its future decisions mutate one
  working career and stop at intentional save boundaries.
- Inbox becomes valuable once there are real decisions, a strong shell, a
  maintainable web foundation, and a credible visual system.
- Phase 73A audits the complete current loop before another feature is added;
  Phase 73B resolves its evidence-backed trust, hierarchy, accessibility,
  action-economy, and ownership findings without a rewrite.
- Phase 73C completes the user-reviewed Matchday information hierarchy before
  the roadmap returns to the reserved player-model cleanup.
- Phase 75 follows the Phase 74 consolidation because future Squad, Youth, and
  Market screens need one credible source for reachable potential, real-minute
  development, role familiarity, decline, and lifecycle facts. It is now
  complete and deliberately added no player-detail UI of its own.
- Phase 76 establishes one accessible, bundle-conscious motion language before
  new Squad, Calendar, Market, Finance, Youth, Staff, and Archive sections can
  accumulate disconnected animation and command-feedback conventions.
- Phase 77 follows immediately because live substitutions, tactical commands,
  causal statistics, incidents, and AI reactions are engine/product behavior,
  not a visual polish pass. Closing this loop prevents future Squad and Market
  screens from depending on half-time-only or cosmetic Matchday assumptions.
- Squad and tactics are needed before matchday feels like a user choice.
- Calendar/fixtures make Continue understandable.
- Matchday closes the first loop.
- Market, finances, youth, and staff become meaningful after the core loop is
  playable.
- Archive becomes valuable after there is history worth preserving.
- Dashboard should be consolidated again last, after it knows what real
  sections exist.

## Phase Entry Gate

Before starting any phase in this roadmap, answer:

1. What decision does this give the user?
2. Which engine/domain state backs the decision?
3. Which `@game/ui` read model should exist before React code?
4. What should Playwright prove?
5. What is explicitly out of scope?
6. What would count as dead code for this phase?

If any answer is weak, write an audit/spec step first and do not code yet.

## Phase Exit Gate

A phase is complete only when:

- it improves a real manager decision or engine quality;
- it has no known dead code or unused helpers;
- it does not duplicate engine rules in the web app;
- it has deterministic tests for non-trivial logic;
- browser-visible output has Playwright screenshot QA;
- accessibility findings are documented;
- dependency, code-quality, architecture, UI/UX, and fun reviews are documented;
- any obvious improvement to code quality or user experience is either completed
  in the phase or explicitly assigned to a future phase with a reason;
- `pnpm check` passes;
- the next phase recommendation is exactly one phase.

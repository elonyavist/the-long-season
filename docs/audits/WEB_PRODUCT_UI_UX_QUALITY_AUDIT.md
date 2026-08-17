# Web Product UI/UX Quality Audit

Date: 2026-07-15  
Phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Decision: bounded Phase 73B remediation required before Phase 74

## Executive Verdict

The current web product is a credible functional MVP slice, not yet a premium
football-management product.

The product already has a coherent real loop:

1. create or load a durable career;
2. understand the next club decision from Dashboard or Posta;
3. prepare an XI, bench, formation, and tactic on the tactical board;
4. play a staged deterministic match with a real half-time decision;
5. inspect structured result, ratings, and consequences;
6. return to the club, save manually, or advance until attention.

That loop works on production SQLite/OPFS storage, uses structured engine facts,
provides contextual command feedback, and remains free from horizontal page
overflow in the reviewed states. The cross-screen score is `3.59/5`, with no
`P0` finding.

The product is not ready to move directly into another broad system because 11
`P1` findings materially affect trust, efficiency, accessibility, hierarchy,
or the safety of future UI work. They are bounded and incremental. The evidence
does not support deleting or rewriting the web app.

Exactly one next phase is recommended:

> **Phase 73B - Current Web Product Premium Remediation And Journey Hardening**

Phase 74 remains reserved as `Player Generation And Model Consolidation
Cleanup`; Phase 73B is inserted before it and does not renumber or replace it.

## Coverage

Phase 73A reviewed:

- App Entry: empty, saved, loading, error, recovery, locale stress;
- persistent career shell: navigation, current club, Posta awareness, save,
  dirty state, exit protection, desktop and narrow order;
- Dashboard: unprepared, ready/post-match, Continue, attention, loading;
- Posta: blocking and informational messages, filters, list/detail, narrow Back,
  empty filter, text zoom, read and result lifecycle;
- Match Preparation: empty and complete plans, tactical board, bench, squad,
  candidate/context menus, detail, tactic, validation, confirmation;
- Matchday: pre-match, first half, half-time, second half, full time, ratings,
  events, tactical changes, consequences, return;
- shared states: hover, focus, pending, reduced motion, save/storage errors,
  dialogs, and command conflict behavior;
- frontend ownership: App, Zustand, runtime, presenters, screens, shared UI,
  CSS, i18n, visual QA, and package dependencies.

The evidence pack contains 56 current screenshots under
`/tmp/the-long-season-phase73a/`. The complete scorecard and capture registry
are in `WEB_PIXEL_PERFECT_VISUAL_BASELINE_AND_SCORECARD.md`.

## Product Strengths To Preserve

Remediation must not regress or replace these working foundations:

- deterministic engine and domain facts remain independent of React and prose;
- framework-free `@game/ui` read models remain the presentation contract;
- SQLite/OPFS and the career session remain the only browser persistence path;
- manual save and 7/15-day autosave semantics remain unchanged;
- one typed asynchronous command activity prevents conflicting mutations;
- Dashboard remains the operational home;
- Continue remains the calendar rhythm;
- Posta remains current-season decision context and history, not bureaucracy;
- one real destination can be entered from Dashboard or its Posta explanation;
- the tactical board, pitch asset, normalized geometry, player tokens,
  suitability, context menus, formation, and fixed bench remain the approved
  football visual anchor;
- Matchday remains staged around a genuine half-time decision;
- loading, error, reduced-motion, storage recovery, and dirty-exit behavior
  remain explicit;
- localization remains typed and no visible copy is hardcoded;
- no unsupported market, contract, finance, youth, or staff messages are added
  before those workflows exist.

## Highest-Impact Product Findings

The central problem is not the navy/cream/gold palette. It is prioritization.
The interface often gives persistent chrome, repeated frames, fallbacks, and
supporting facts the same visual weight as the football decision.

The user-facing consequences are concrete:

- a narrow-screen manager sees the full shell before the task they selected;
- a keyboard manager repeats shell controls and loses context after screen
  changes;
- a prepared team can be lost by refresh without an unsaved-progress warning;
- live match flow asks for clicks that reveal reports but make no decision;
- Dashboard and Matchday expose internal or fallback values that make valid
  career states look unfinished;
- broad App and Matchday ownership makes precise visual remediation risky;
- historical visual scripts cannot currently provide one trustworthy release
  statement.

## Canonical P1 Register

Duplicate findings from Steps 02-07 are consolidated below. Existing IDs are
listed for traceability; the `Q-*` ID is canonical for remediation planning.

| ID | User-facing impact | Reproducible evidence | Surfaces/journeys | Owner | Bounded direction | Regression/manual gate | Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Q-P1-01` Draft safety (`JRN-01`) | A manager can prepare 19 players and a tactic, refresh, and silently lose all work. | Current draft probe: `11+8+Balanced -> refresh -> 0+0+none`, session remains `dirty=false`. | preparation, refresh, exit, save lifecycle | preparation draft state, career session, App command composition | make a non-empty preparation draft participate in unsaved-progress semantics; preserve explicit confirmation and autosave cadence | browser: draft, refresh/exit warning, cancel, save-and-exit, reload; persistence/unit tests | before visual preparation cleanup |
| `Q-P1-02` Match playback economy (`JRN-02`) | Two clicks do not make decisions and make the match feel like stepped reports. | Pre-match to Dashboard requires Start, Play to half-time, Start second half, Play to full time, Return; the two Play commands reveal already-produced stages. | Matchday first/second half journey | Matchday playback presentation over existing staged engine checkpoints | automatically present bounded playback to half-time/full-time, retain Start, half-time decision, final acknowledgement, and optional skip only if meaningful | current staged match browser journey; verify no engine resimulation or hidden decision | after current phase contract is isolated; before Matchday polish |
| `Q-P1-03` Narrow task priority (`IA-01`, `RESP-01`) | The manager sees navigation and duplicate awareness before the current football task. | At 390px the shell ends near y=588; Posta/preparation/Matchday task content begins below the first viewport; P06 at 200% reaches 2919px. | all career screens, especially Posta, preparation, Matchday | AppShell, shell read model, layout CSS, feature narrow order | compact narrow chrome and place `main`/current action before secondary orientation without hiding destinations | 390x844 and 200% screenshots, keyboard order, no horizontal overflow | coordinate with bypass/focus; shell before screen-local changes |
| `Q-P1-04` Technical content leaks (`IA-02`) | Raw IDs and fallback words make the football world look incomplete or untrusted. | Dashboard/Matchday render `fixture:*`, `season:*`, `unknown`, `none`, `missing`, mixed `tabellino`. | Dashboard, preparation, Matchday full time, career context | `@game/ui` presenters/read models, web adapters, i18n | omit unavailable modules, derive named football facts, and reserve diagnostic identity for recovery/logs | presenter tests plus desktop/narrow screenshots in every valid empty/post-match state | read-model fixes before CSS hiding; preserve structured facts |
| `Q-P1-05` Flattened operational hierarchy (`VIS-01`) | The eye cannot distinguish decision, support, and navigation quickly; the product feels panel-built. | Oversized operational H1s and bordered nested surfaces across D01, P01, T04, M06, M11; scorecard `IH=3.3`, `VC=3.4`. | shell and every primary screen | shared page/surface typography and feature layout CSS | define operational heading and surface tiers, remove redundant framing, keep app-entry identity scale and tactical board unchanged | full desktop/wide/narrow scorecard; one dominant current task per viewport | token contract first; apply by current screen, not global rewrite |
| `Q-P1-06` No bypass (`A11Y-01`) | Keyboard users traverse repeated shell controls before every task. | No skip-to-main control; current primary Dashboard action is fourth focus stop and Posta action seventh. | every career screen | AppShell and shared main landmark | add keyboard-visible bypass to a stable active-main target | keyboard-only full journey, focus screenshot, WCAG 2.4.1 review | implement with narrow shell contract |
| `Q-P1-07` Lost screen focus (`A11Y-02`) | SPA transitions are not reliably announced and the next Tab restarts in shell chrome. | After New career, Inbox, Prepare, and Confirm transitions `document.activeElement` is `body`. | entry -> Dashboard -> Posta -> preparation -> Matchday | App screen composition and shared screen-focus boundary | focus the active heading/main only on genuine screen changes; do not steal focus on same-screen updates | keyboard browser route matrix and screen-reader-oriented focus inspection | requires explicit current screen composition seam |
| `Q-P1-08` Blocking contrast (`A11Y-03`) | The text explaining why play cannot continue is harder to read for low-vision users. | Computed blocker foreground/background contrast is `3.97:1` at normal text size. | Dashboard and preparation blockers | semantic danger tokens and real blocker consumers | correct foreground/background pair and verify normal, alert, selected, disabled states | computed contrast >= 4.5:1 plus visual state screenshots | token correction before hierarchy styling |
| `Q-P1-09` Broad App composition (`ARCH-01`) | Shared shell/focus/command fixes can regress unrelated persistence or dirty-work behavior. | `App.tsx`: 630 lines, 44 store selections, 39 hooks, repeated career wrappers, broad screen prop surfaces. | all browser journeys | `apps/web/src/app/App.tsx` and existing app hooks | extract only repeated current career frame and named command/view composition; keep routing explicit and runtime in app layer | app/store/command/save tests and canonical entry-to-career Playwright | canonical visual gate and focus contract first |
| `Q-P1-10` Concentrated Matchday owner (`ARCH-02`) | Pixel-perfect changes to the flagship screen require broad edits and can regress unrelated phases. | 1,458-line screen plus 1,519-line adapter own five phases, fallbacks, tactics, events, ratings, consequences. | all Matchday phases | Matchday adapter, presenter, screen | make one current phase contract mandatory, remove proven unreachable fallback, then extract existing phase compositions one at a time | adapter/screen/checkpoint/ratings/half-time tests and full staged browser journey | current visual gate; phase contract before playback change |
| `Q-P1-11` No canonical visual release gate (`QA-01`) | A green command does not prove the current whole product remains responsive, accessible, or interaction-complete. | 17 scripts/5,222 lines, mixed runners, stale selectors, no package command; Step 07 needed a custom traversal. | all browser surfaces | web visual QA ownership and package scripts | establish one documented current Playwright command; migrate unique current assertions before archiving superseded scripts | command reproduces current fixture matrix, desktop/narrow, focus, zoom, reduced motion, tactical pointer/touch | first Phase 73B safety seam; cleanup only after migration |

## Canonical P2 Register

These findings should be addressed only when their owner is already being
changed for a `P1`, or after all `P1` gates pass.

| ID | Impact and evidence | Owner/direction | Gate and sequence |
| --- | --- | --- | --- |
| `Q-P2-01` Repeated readiness/content | Dashboard, preparation, Posta, and Matchday repeat blockers, shape, phase, score, or change facts. | choose one owner per fact in current presenter/screen; preserve durable Posta history | update beside `Q-P1-04`/`Q-P1-05`; screenshot before/after content inventory |
| `Q-P2-02` Passive/future affordance | Disabled future navigation and passive Matchday progress retain button-like rectangles. | demote without deleting roadmap orientation; distinguish process from control | shell/Matchday browser state and pointer/focus inspection |
| `Q-P2-03` Token and component-state drift | Three used CSS variables are undefined; hover/selected/disabled and semantic colors are recreated locally. | define/remove tokens and normalize by semantic role, not one universal component | computed-style contract plus all shared states; before broad visual hierarchy work |
| `Q-P2-04` Typography/spacing exceptions | 102 literal sizes and broad serif/mono usage obscure intentional exceptions. | keep tactical geometry local; use named chrome roles and a documented exception policy | desktop/narrow/200% visual review; do not change pitch geometry |
| `Q-P2-05` Target size | compact Matchday target is about 18px high; conformance currently depends on spacing/label exceptions. | encode and test >=24px effective target or valid spacing exception | pointer/keyboard geometry check while Matchday is already changing |
| `Q-P2-06` Historical QA drift | persistence selector and tactical candidate expectation are stale before unique assertions execute. | migrate current selectors/assertions into `Q-P1-11`; never change production behavior to satisfy stale fixtures | canonical suite green before deleting any historical runner |
| `Q-P2-07` Store ownership drift (`STATE-01`) | store imports feature adapters while features import store; command activity is prop-driven and reselected. | choose one command-presentation input and one feature draft mutation owner | store plus isolated pending/failure screen tests after App seam exists |
| `Q-P2-08` CSS/dead-path debt (`CSS-01`, `DEAD-01`) | 43 production-unused selectors and three production-looking test-only tactical paths can mislead contributors. | remove source, dedicated tests, docs, and selectors only with canonical replacement coverage | after `Q-P1-11`, board/dashboard coverage, and owner-specific visible slice |
| `Q-P2-09` Active Posta duplication | the Posta route repeats its current subject/count in the shell awareness card. | hide compact awareness only while Posta is active; keep it elsewhere | desktop/narrow Posta list/detail evidence; pair with shell slice |
| `Q-P2-10` Shared visual finish | app entry has weak football-world signal; dirty dialog geometry differs from screen grammar. | refine only after hierarchy contract, using current identity and shared feedback owner | entry/dialog desktop/narrow/focus screenshots; no decorative fake workflow |

## Monitor Register

| ID | Why it is monitored, not scheduled now | Change gate |
| --- | --- | --- |
| `Q-MON-01` Dashboard and Posta share the same real workflow destination | This is useful context, not duplication: Dashboard is operational home; Continue can land on Posta explanation. | change only if users cannot identify which command owns the decision or commands diverge |
| `Q-MON-02` Localization source is 5,559 lines | It has one typed owner, coherent tests, and no proven user/runtime cost. | split only after measurable merge, loading, or ownership pain |
| `Q-MON-03` Future market/contract/finance/youth/staff Posta | Absence is intentional because those workflows do not exist. Placeholder messages would be dead product code. | use `CAREER_INBOX_FUTURE_MESSAGE_EXTENSION_MATRIX.md` only when a real workflow and resolution condition exist |
| `Q-MON-04` Initial production bundle warning | Build reports a large main chunk, but this audit measured no startup delay or interaction impact. | profile real load/interaction timing before scheduling performance work |

## Accessibility And Responsive Verdict

The reviewed product has semantic landmarks, keyboard-operable native controls,
visible focus, native dialog behavior, contextual loading/error feedback,
reduced-motion handling, text that remains available at `200%`, and no measured
horizontal page overflow.

It does not yet satisfy the Phase 73A WCAG 2.2 AA target because:

- repeated shell content has no bypass;
- genuine screen changes leave focus on `body`;
- blocker text measures 3.97:1 rather than 4.5:1;
- narrow layouts preserve width but place the current task after persistent
  navigation and awareness.

These are release-significant `P1` issues, not optional visual polish.

## Frontend Maintainability Verdict

The monorepo and package boundaries are healthy. `pnpm depcruise` passes across
492 modules and 1,721 dependencies. Engine, UI read models, storage, runtime,
React, and i18n have real separation. Rewriting the package architecture would
discard useful boundaries without addressing the visible hierarchy defects.

Risk is concentrated inside `apps/web`:

- App composition is broad;
- Matchday presentation is concentrated;
- global CSS ownership exceeds current callers;
- visual QA is historical rather than canonical;
- a small number of superseded paths remain test-preserved;
- architecture prose currently overstates App/store thinness.

The safe path is extraction behind current behavior and current screenshots,
not speculative abstraction. Every replacement must remove its superseded
source, test, selector, and documentation in the same bounded slice.

## Tactical-Board Preservation Statement

Phase 73B must not change `campo-calcio.svg`, replace the pitch, move normalized
coordinates into pixels/state, duplicate role/formation catalogs, or weaken
pointer, touch, keyboard, suitability, candidate, context-menu, or bench rules.

Allowed work around the board is limited to:

- improving the surrounding screen hierarchy;
- reducing duplicate readiness framing;
- making narrow access faster;
- preserving the board while Matchday phase owners are extracted;
- repairing current browser evidence without changing ranking behavior.

## Deferred And Future Scope

The following are not defects in the current UI and are not Phase 73B scope:

- playable Squad, Calendar, Fixtures, Market, Finances, Youth, Staff, Archive,
  facilities, or economy screens;
- transfer, contract, finance, youth, or staff Posta content;
- new tactics, player attributes, match simulation tuning, extra time, cups, or
  penalties;
- another theme, palette, font replacement, UI framework, router, state store,
  icon package, or design-system package;
- runtime or build-time LLM behavior;
- replacement tactical-board art;
- Phase 74 player-generation/model cleanup.

## Manual Inspection Checklist For Phase 73B

Every Phase 73B slice must be inspectable in the browser before the next slice:

- the current manager question is visible in the first useful viewport;
- there is one dominant action only when a decision is required;
- keyboard users can bypass repeated chrome and land on the changed task;
- focus moves on screen changes but not on same-screen updates;
- normal text and semantic status combinations meet WCAG AA contrast;
- no raw IDs, backend fallback words, or mixed-locale football terms appear;
- desktop `1440x900`, wide `1920x1080`, and narrow `390x844` have no overlap,
  clipping, unreachable action, or horizontal page overflow;
- `200%` text and reduced motion retain the complete decision;
- pending, disabled, error, recovery, selected, menu, and dialog states remain
  intentional;
- current persistence, autosave, dirty-exit, Posta, and staged-match behavior
  remains deterministic;
- the tactical board is visually and behaviorally unchanged unless a separate
  explicit product decision authorizes a change;
- removed source/test/CSS/documentation has current replacement coverage.

## Exactly One Next Phase

**Recommend Phase 73B - Current Web Product Premium Remediation And Journey
Hardening.**

Reason:

- there are no P0 blockers and no evidence for a rewrite;
- 11 P1 findings materially affect the current playable loop;
- several P1s are prerequisites for safely changing the flagship Matchday and
  adding future sections;
- remediation can be incremental and browser-visible;
- direct Phase 74 work would leave a known accessibility failure, silent draft
  loss, non-decision match clicks, and no canonical browser gate in the product
  the user is actively testing.

The dependency-ordered implementation outline is documented in
`docs/roadmaps/WEB_UI_UX_PREMIUM_REMEDIATION_MAP.md`. This audit does not start
Phase 73B.

## Phase Gate Verification

Final verification ran with Node `v24.19.0`:

- required consolidated audit and remediation-map files: PASS;
- web typecheck: PASS;
- web test: PASS, 47 files and 193 tests;
- web production build: PASS;
- dependency-cruiser: PASS, 492 modules and 1,721 dependencies with no
  violations;
- full `pnpm check`: PASS, including lint, dependency rules, localized text,
  160 test files with 946 tests, and every workspace typecheck;
- `git diff --check`: PASS.

The build retains the already-classified main-chunk size warning. It remains
`Q-MON-04` because Phase 73A found no measured loading or interaction impact;
the warning is not a license for speculative code splitting.

Phase 73A changed documentation only. The working tree already contained the
completed implementation from earlier phases; this audit did not modify
production source, tests, CSS, translations, dependencies, runtime, engine,
storage, or the tactical-board asset.

## Evidence Index

- `docs/audits/WEB_PRODUCT_SURFACE_AND_STATE_INVENTORY.md`
- `docs/audits/WEB_CRITICAL_JOURNEY_AND_ACTION_ECONOMY_AUDIT.md`
- `docs/audits/WEB_INFORMATION_ARCHITECTURE_AND_CONTENT_HIERARCHY_AUDIT.md`
- `docs/audits/WEB_PREMIUM_VISUAL_SYSTEM_AND_COMPONENT_LANGUAGE_AUDIT.md`
- `docs/audits/WEB_ACCESSIBILITY_RESPONSIVE_AND_INTERACTION_STATE_AUDIT.md`
- `docs/audits/WEB_FRONTEND_PRESENTATION_ARCHITECTURE_AND_CSS_AUDIT.md`
- `docs/audits/WEB_PIXEL_PERFECT_VISUAL_BASELINE_AND_SCORECARD.md`

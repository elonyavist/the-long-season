# Web Frontend Presentation Architecture And CSS Audit

Date: 2026-07-15  
Phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Status: current-product audit; no production changes

## Executive Result

The web application has sound package boundaries and several good local
ownership examples, but its presentation layer is not yet safe enough for a
broad premium UI remediation.

The dependency gate passes across 492 modules and 1,721 dependencies. React
does not own engine rules or direct SQLite/OPFS calls, `@game/ui` remains
framework-free, the durable web runtime is distinct from Zustand, Posta is
split into presenter/list/detail components, and the tactical board is a real
shared interaction surface. These boundaries must be preserved.

The main risk is inside `apps/web`, not between packages:

1. `App.tsx` has become a 630-line composition and command coordinator with 44
   store selections, 39 React hook calls, repeated career framing, and very
   broad screen prop surfaces;
2. Matchday presentation is concentrated in a 1,458-line screen and a
   1,519-line adapter, with current and compatibility view paths living beside
   all five match phases;
3. visual QA consists of 17 phase-specific browser scripts totaling 5,222
   lines, with mixed execution styles, historical selectors, no package script,
   and no single current premium baseline;
4. styling is effectively a 4,656-line global semantic-CSS system despite a
   Tailwind import, and 43 declared `tls-*` classes have no literal production
   caller;
5. three production-looking tactical modules are reachable only from their
   historical tests, while one dashboard presentation contract exposes fields
   consumed only by its test.

There is no P0. Three P1 maintainability findings must be addressed before a
large cross-screen visual rework: composition ownership, matchday
decomposition, and one executable current visual baseline. Four P2 findings
cover state ownership, CSS ownership, confirmed superseded paths, and
documentation drift. Localization size is a Monitor item, not a current
architecture defect.

## Evidence And Method

The audit used Node 24.19.0, Graphify queries, source/import tracing,
Dependency Cruiser, exact production-caller scans, stylesheet metrics,
existing unit tests, historical browser runners, and the Phase 73A Steps 01-05
product evidence.

The following measurements are signals, not verdicts:

| Area | Signal |
| --- | ---: |
| TS/TSX/CSS across web, UI, and i18n scope | 36,234 lines |
| Global web CSS | 4,656 lines |
| `components.css` | 3,319 lines |
| `layout.css` | 707 lines |
| Unique declared `tls-*` classes | 288 |
| Exact `tls-*` classes with no production literal caller | 43 |
| Phase-specific visual QA scripts | 17 files / 5,222 lines |
| `App.tsx` | 630 lines / 22 imports |
| `career-ui-store.ts` | 579 lines |
| `CareerMatchdayScreen.tsx` | 1,458 lines / 19 imports / 48 local functions |
| `matchday-adapter.ts` | 1,519 lines / 15 exported contracts or functions |
| `CareerMatchPreparationScreen.tsx` | 567 lines / 20 imports |
| `labels.ts` | 5,559 lines |

Large files were classified only after tracing responsibilities, callers, and
regression coverage.

## Current Dependency Direction

The intended and observed primary path is:

```text
React screen
  -> web presenter / web feature adapter
  -> @game/ui structured read model
  -> web-career-runtime
  -> engine use case
  -> domain facts

web-career-runtime
  -> @game/storage
  -> SQLite WASM / OPFS adapter
```

Presentation copy is resolved through `@game/i18n`; engine and domain emit
structured facts only. The tactical board reads canonical role/formation data
through current web and UI contracts and stores normalized coordinates in its
own draft model.

`pnpm depcruise` reports:

```text
no dependency violations found (492 modules, 1721 dependencies cruised)
```

This is a strong architectural invariant. Phase 73B must not solve
presentation coupling by moving React, translation prose, browser APIs, or
storage access into engine/domain packages.

## Ownership Map

### App Entry

```text
main.tsx
  -> app/App.tsx
  -> createWebCareerStorage / web-career-runtime
  -> app-entry-view-model
  -> AppEntryScreen
  -> global tokens/base/components CSS
```

The route is easy to find. The screen is small, view-model driven, and has
focused unit tests. The only global-state reach-through is command activity.

Junior traceability: Good.

### Dashboard

```text
App active CareerState
  -> buildCareerDashboard
  -> @game/ui CareerDashboardView
  -> presentCareerDashboard
  -> CareerDashboardScreen
  -> AppShell
  -> components.css + layout.css
```

The football readiness rules remain outside React. The screen is readable,
but its presenter returns `sectionIds` and `actions` that production never
reads. The screen also reaches into the global store for command activity even
though the composition root already reads that state.

Junior traceability: Good for data; Moderate for command and visual ownership.

### Posta

```text
CareerState durable inbox facts
  -> web-career-runtime lifecycle commands
  -> @game/ui buildCareerInboxView
  -> career-inbox-presenter
  -> CareerInboxScreen
  -> InboxMessageList + InboxMessageDetail
  -> AppShell
```

Posta is the best current decomposition reference. Durable lifecycle remains
outside React, selection/filtering has an explicit presenter, and list/detail
composition follows the user's decision task. It has focused component,
presenter, runtime, store, and current Playwright coverage.

Junior traceability: Good.

### Match Preparation

```text
CareerState + persisted preparation
  -> match-preparation-adapter
  -> @game/ui CareerMatchPreparationView
  -> Zustand MatchPreparationDraft
  -> CareerMatchPreparationScreen
  -> TacticalBoardPitch / TacticalBenchBoard
  -> SquadSelectionTable / PlayerFactPanel
```

The approved tactical board is a genuine shared component and its normalized
geometry is correctly isolated. The screen still coordinates board, bench,
squad, tactic, detail tabs, validation, shell composition, and command state.
Its prop contract contains 18 data/callback concerns. This is substantial but
bounded compared with Matchday.

Junior traceability: Moderate.

### Matchday

```text
CareerState + durable match checkpoint
  -> matchday-adapter
  -> @game/ui CareerMatchdayView + CareerMatchdayPhaseView
  -> career-matchday-presenter
  -> CareerMatchdayScreen
  -> shared tactical board during half-time
```

The adapter correctly owns staged engine progression and does not resimulate
the result. The problem is presentation concentration: one screen owns
pre-match, first half, half-time, second half, full time, score/header,
timeline, ratings, consequences, tactical changes, legacy fallback rendering,
and many local formatting components. The adapter simultaneously owns durable
checkpoint mapping, UI contracts, role/player rows, phase views, and engine
translation.

Junior traceability: Poor. A junior must hold parallel `view`, `phaseView`,
half-time panel, preparation view, and tactical draft contracts in mind before
changing one visible match phase.

## App Composition And Zustand

### Composition Root

`App.tsx` still respects the runtime/storage boundary, but it no longer matches
its documented description as a thin root:

- 44 `useCareerUiStore` calls select data and actions individually;
- 39 React hook calls coordinate runtime, view construction, transitions,
  session overrides, command callbacks, and dialog state;
- four career render branches repeat `CareerSaveLifecycleProvider`,
  `AppShellStorageRecoveryProvider`, and the unsaved-exit dialog;
- Matchday receives roughly 18 data and callback concerns;
- preparation receives roughly 18 data and callback concerns;
- screen branch JSX has visible indentation drift, increasing review cost even
  though behavior remains valid.

The repeated career frame is current duplication with four callers, so a
bounded extraction is justified. A new generic router, dependency-injection
container, or speculative application framework is not.

### Store Ownership

`career-ui-store.ts` owns several valid ephemeral browser concerns:

- preferences and selected screen;
- storage lifecycle and recoverable failure state;
- loaded working career snapshot/session status;
- one asynchronous command activity;
- calendar presentation state;
- Posta selection/filter;
- match-preparation draft;
- matchday state.

It does not own engine rules or persistence cadence. However, the folder-level
direction is unclear:

- the store imports match-preparation and matchday feature adapters;
- App Entry, Dashboard, AppShell, preparation, and Matchday import the store;
- some screens receive command callbacks by props but obtain command activity
  directly from the store.

This is not a module cycle and Dependency Cruiser correctly allows it, but it
makes "presentational screen" an inaccurate mental model. Isolated rendering
and visual QA require hidden global state setup.

Do not split the store merely because it is 579 lines. The bounded correction
is to choose one current ownership direction for command presentation and
feature draft actions, then prove it through existing screen/store tests.

## Presenter And Screen Contracts

### Healthy Patterns

- Posta presenter + list/detail components separate decisions from rendering.
- `@game/ui` read models are structured and framework-free.
- `career-matchday-presenter.ts` derives visual ordering without simulating.
- shared tactical board components own real repeated behavior.
- `CommandActivityIndicator` centralizes accessible async feedback.

### Contract Drift

`CareerDashboardPresentation.sectionIds` and `.actions` are returned by the
presenter and asserted by its test, but are not read by
`CareerDashboardScreen`. This is a small confirmed dead read-model surface,
not evidence that the underlying `@game/ui` dashboard actions are dead.

`CareerMatchdayScreen` accepts both `CareerMatchdayView` and optional
`CareerMatchdayPhaseView`. In the production App branch, both are built from
the same `matchdayState`, so `phaseView ?? legacyPhaseViewFromMatchdayView(view)`
uses the legacy fallback only when the screen is rendered outside the current
composition path. The fallback has test value, but no production caller was
found.

The two-select `HalfTimeSubstitutionPanel` is another compatibility path. The
current App supplies the preparation view and tactical draft when the staged
state is coherent, so the shared tactical board is the normal production path.
Unlike the phase fallback, this branch may still protect incomplete/restored
state. It must not be deleted until the restoration invariant has focused
coverage.

The first-half and second-half projection helpers are active behavior for the
current reveal flow; they are not dead merely because they derive earlier
phase views.

## CSS Ownership

### What The Product Actually Uses

The stylesheet entry imports Tailwind, tokens, base, layout, tactical-board,
and components CSS. Production JSX uses one Tailwind utility (`m-0`) and an
otherwise semantic `tls-*` vocabulary. Therefore the real current system is:

```text
global tokens
  + global base/layout CSS
  + global tactical-board CSS
  + one global feature/component stylesheet
  + Tailwind preflight and one utility
```

Calling this a Tailwind-owned presentation architecture would be inaccurate.
The dependency may still supply useful preflight behavior, so it is not
classified as dead without a controlled removal comparison.

### Positive CSS Properties

- no `!important` declarations;
- most color, type, spacing, border, and elevation choices use tokens;
- tactical geometry uses normalized state and isolated conversion helpers;
- the current inline popover style is geometry/placement state, not visual
  theme leakage;
- data and ARIA selectors express real interaction states;
- the tactical-board stylesheet is a coherent ownership island and must be
  preserved.

### Coupling And Cleanup Evidence

`components.css` is 3,319 lines and contains historical Dashboard,
preparation, Matchday, Posta, save, and shell generations in one cascade.
Changing a shared-looking selector requires a repository-wide search rather
than a feature-local check. Responsive overrides for several features are
grouped near the end, away from their base declarations.

An exact scan across 56 production TS/TSX files found 43 declared classes with
no literal production caller. No dynamic `tls-*` construction was found.

Layout candidates:

```text
tls-app-shell-empty
tls-app-shell-message
tls-app-shell-message-action
tls-app-shell-message-actions
tls-app-shell-message-date
tls-app-shell-message-list
tls-app-shell-message-meta
tls-app-shell-next-action
tls-career-shell-actions
tls-career-shell-body
tls-career-shell-content
tls-career-shell-context
tls-career-shell-header
tls-career-shell-inbox-rail
tls-career-shell-nav
tls-career-shell-operations
```

Component candidates:

```text
tls-career-shell-continue
tls-career-shell-inbox-rail
tls-career-shell-menu
tls-career-shell-nav-item
tls-dashboard-action
tls-dashboard-actions
tls-dashboard-blockers
tls-dashboard-card
tls-dashboard-command-center
tls-dashboard-inbox
tls-dashboard-inbox-action
tls-dashboard-inbox-actions
tls-dashboard-inbox-badge
tls-dashboard-inbox-counts
tls-dashboard-inbox-header
tls-dashboard-inbox-led
tls-dashboard-inbox-list
tls-dashboard-inbox-message
tls-dashboard-inbox-meta
tls-dashboard-inbox-related
tls-dashboard-inbox-title
tls-dashboard-shell
tls-match-centre-grid
tls-matchday-action-row
tls-matchday-dashboard
tls-matchday-delta-list
tls-matchday-events
tls-preparation-save
```

`tls-career-shell-inbox-rail` exists in both layout and component styles,
illustrating historical ownership overlap. Several candidates are still named
by old visual scripts, which proves those scripts are historical callers, not
that the selectors have current product value.

The Step 04 audit separately records undefined tokens and literal sizing
exceptions. This step does not duplicate those visual findings; it identifies
the ownership boundary needed to fix them safely.

## Confirmed Superseded Source Paths

Production reachability and caller scans distinguish these categories.

### Confirmed Production-Unreachable, Test-Preserved

| Path | Production caller | Test caller | Classification |
| --- | --- | --- | --- |
| `features/match-preparation/TacticalPitchLineup.tsx` | None | `TacticalPitchLineup.test.ts` | Superseded by shared tactical board |
| `features/match-preparation/tactical-pitch-layout.ts` | Legacy component only | focused layout test | Superseded grid geometry |
| `features/tactics-board/tactical-board-adapters.ts` | None | focused adapter test | Unused compatibility adapter |

`docs/ARCHITECTURE.md` already labels the first two as legacy and says not to
build new work on them. A later cleanup should remove source, dedicated tests,
legacy asset references that become unreachable, and the obsolete
architecture entries in one change. It must preserve all current shared-board
tests and screenshots.

### Intentional Test Infrastructure

`apps/web/src/test-fixtures/career-fixture.ts` is not production reachable by
design. It is a test fixture, not dead application code.

### Compatibility Requiring Proof Before Deletion

- `legacyPhaseViewFromMatchdayView`;
- the simplified half-time substitution fallback;
- Tailwind preflight/dependencies;
- historical visual scripts that still provide unique interaction or
  persistence checks.

These must not be removed based on line count or naming alone.

## Visual QA Ownership

The repository contains strong browser knowledge but no single executable
current visual contract:

- 17 phase-specific `.spec.ts` files total 5,222 lines;
- some are Playwright Test suites, while others are standalone Chromium
  scripts with their own server lifecycle;
- each owns a different port and `/tmp/the-long-season-phaseXX` directory;
- `apps/web/package.json` has no visual-QA script and excludes the directory
  from its normal test command;
- historical scripts still wait for removed classes such as
  `tls-dashboard-command-center`, `tls-matchday-dashboard`, and
  `tls-preparation-save`;
- the shared-board runner currently stops on an obsolete candidate-order
  expectation before later pointer/touch assertions.

Current unique contracts do exist and should seed one canonical suite:

- Phase 73 Posta decision and durable lifecycle;
- Phase 72 save cadence, loading, error, and dirty-exit behavior;
- SQLite/OPFS refresh and recovery;
- Phase 70 matchday information architecture;
- shared tactical-board keyboard, pointer, touch, clamp, and context-menu
  behavior;
- app entry, Dashboard, preparation, and narrow no-overflow screenshots.

Historical scripts should be classified assertion by assertion after the
canonical suite covers their still-current behavior. Deleting all of them at
once would discard valuable regression knowledge; keeping all of them as an
implicit gate makes current QA non-executable.

## Localization Ownership

`packages/i18n/src/labels.ts` is 5,559 lines, but it remains a coherent,
type-checked single source for current locales. React resolves message keys;
engine/domain emit structured reason keys and facts; no runtime LLM prose is
introduced.

The file size increases merge and review cost, but there is no demonstrated
runtime defect or duplicate locale owner. Splitting by locale or feature is a
Monitor item to revisit only when a bounded migration can preserve key
completeness and translator tests. It is not a Phase 73B prerequisite.

## Findings

### ARCH-01 - The composition root owns too many current application concerns

- Severity: P1.
- Evidence: 630 lines, 44 store selections, 39 hooks, four repeated career
  wrappers, and two screen prop surfaces of roughly 18 concerns.
- User impact: shared fixes such as focus routing, skip navigation, command
  state, and narrow shell behavior are harder to apply consistently. A visual
  change can regress save recovery or dirty-work behavior through unrelated
  branch edits.
- Junior impact: the documented "thin composition root" is not what a reader
  encounters.
- Bounded remediation: extract the repeated current career frame and current
  command/view composition into named, tested seams. Keep routing explicit and
  keep the runtime handle in the app layer. Do not add a generic router or DI
  framework.
- Regression coverage: `app.test.tsx`, command-runner tests, AppShell tests,
  save/recovery tests, and one canonical entry-to-career browser journey.

### ARCH-02 - Matchday presentation cannot be changed phase by phase safely

- Severity: P1.
- Evidence: 1,458-line screen with 48 local functions plus 1,519-line adapter;
  five visible phases, compatibility fallbacks, tactical editing, ratings,
  events, and consequences share those two Modules.
- User impact: the most emotionally important product surface is expensive to
  simplify and easy to regress. Pixel-perfect work becomes a broad code review
  instead of a phase-local change.
- Junior impact: current and compatibility contracts are difficult to
  distinguish.
- Bounded remediation: first make one current matchday presentation contract
  mandatory in production; then extract the existing five phase compositions
  and repeated score/event/player primitives without changing engine flow.
  Split adapter responsibilities only along existing durable checkpoint,
  player-row, and phase-view seams. Preserve the tactical board.
- Regression coverage: matchday adapter and screen tests, Phase 70 current
  journey, staged persistence tests, ratings tests, and half-time board tests.

### QA-01 - Visual QA is rich but not a runnable current baseline

- Severity: P1.
- Evidence: 17 scripts, 5,222 lines, mixed runners, no package command, stale
  selectors, and a tactical script that fails before current interaction
  assertions.
- User impact: a "pass" does not mean the whole current product remains
  premium, responsive, or interaction-complete.
- Bounded remediation: create one documented current Playwright command and a
  small canonical journey matrix. Migrate unique current assertions before
  archiving superseded phase scripts. Keep deterministic SQLite/OPFS setup and
  screenshot output outside the repository.
- Regression coverage: the canonical suite is the coverage; Step 07 defines
  its initial scorecard and screenshot set.

### STATE-01 - Store and feature ownership is bidirectional at folder level

- Severity: P2.
- Evidence: the store imports feature adapters while five feature/shell
  components import the store; command activity is both selected in App and
  reselected by screens.
- User impact: visual components need hidden global setup and can diverge in
  loading/disabled behavior.
- Bounded remediation: choose one command-presentation input path and one
  owner for feature draft mutations. Do not split Zustand by topic without a
  current consumer boundary.
- Regression coverage: store tests plus isolated screen tests for pending and
  failed command states.

### CSS-01 - Global CSS ownership is broader than the current product

- Severity: P2.
- Evidence: 3,319-line component stylesheet; 43 exact classes without a
  production caller; one class owned in both layout and components; responsive
  overrides separated from base declarations.
- User impact: hover, focus, disabled, and responsive refinements can drift
  across unrelated surfaces.
- Bounded remediation: delete confirmed stale selector groups with their
  superseded components/tests, then move only current feature rules beside
  current ownership boundaries. Keep shared tokens/base/layout and the
  tactical-board stylesheet distinct. Do not introduce a new design-system
  package.
- Regression coverage: computed-state probes from Step 04, current screenshots,
  and no-overflow/focus checks.

### DEAD-01 - Superseded tactical and presenter paths remain executable only in tests

- Severity: P2.
- Evidence: three production-looking Modules have no production caller;
  Dashboard presenter fields are test-only; architecture already calls the old
  tactical pitch legacy.
- User impact: contributors can accidentally extend the wrong tactical system
  or preserve fields that no screen needs.
- Bounded remediation: remove each source path together with its dedicated
  tests and documentation only after canonical current coverage is green.
- Regression coverage: shared tactical-board unit/browser tests and Dashboard
  presenter/screen tests.

### DOC-01 - Architecture documentation overstates current thinness

- Severity: P2.
- Evidence: `ARCHITECTURE.md` describes `App.tsx` as thin and the Zustand store
  as focused, but current ownership metrics and bidirectional feature imports
  no longer support those adjectives.
- User impact: new contributors follow an inaccurate map and place new logic
  in already concentrated Modules.
- Bounded remediation: update architecture descriptions when the bounded
  extraction lands, documenting actual current seams rather than an intended
  end state.

### I18N-01 - Localization source is large but remains coherent

- Severity: Monitor.
- Evidence: 5,559-line typed labels source with one owner and passing key tests.
- Decision: do not split in the immediate remediation. Reassess when locale
  changes show real merge, loading, or ownership cost.

## Incremental Remediation Order

The order is deliberately conservative and does not authorize implementation
inside Phase 73A.

1. Establish the current Playwright baseline first. A refactor without a
   runnable current visual contract would be architecture work without product
   safety.
2. Add shared shell accessibility ownership for skip navigation and route
   focus, then capture it in the canonical journey.
3. Extract only the repeated career frame and command/view composition already
   repeated in `App.tsx`; rerun persistence, dirty-exit, and command tests.
4. Normalize command activity ownership so screens are either prop-driven or
   intentionally store-connected, not both.
5. Make the current matchday phase contract explicit and remove the proven
   production-unreachable phase fallback after isolated tests migrate.
6. Extract existing Matchday phase compositions one at a time, preserving
   engine commands, persistence checkpoints, and visible behavior.
7. Remove the confirmed legacy tactical Modules, test-only Dashboard fields,
   and their dedicated tests/documentation after current board/dashboard
   coverage passes.
8. Delete the 43 confirmed stale selector classes in bounded feature groups,
   then place current feature CSS by real ownership. Do not modify the pitch
   SVG or the approved tactical-board visual contract.
9. Re-run the full scorecard before considering another product section.

This order is closed to unrelated refactors and open to extending current
feature boundaries through explicit read models and components.

## Regression Boundary Map

| Proposed boundary | Minimum existing proof to preserve |
| --- | --- |
| Career frame / App composition | app, command runner, store, shell, save control, unsaved dialog, SQLite browser journey |
| Command activity ownership | CommandActivityIndicator, entry, Dashboard, preparation, Matchday pending/error tests |
| Matchday phase composition | adapter, screen, `@game/ui` phase builder, staged checkpoint, ratings, Phase 70 browser journey |
| Tactical legacy deletion | all current tactical-board unit tests plus pointer/touch/keyboard browser assertions |
| Dashboard presenter cleanup | Dashboard presenter and screen tests plus current Dashboard screenshot |
| CSS stale deletion | Step 04 component states, Step 05 reflow/focus, canonical screenshots |
| Visual QA consolidation | unique current persistence, Posta, tactical, preparation, Matchday, reduced-motion assertions |

## Junior Developer Walkthrough

A junior should use these current entry points:

1. Start at `apps/web/src/main.tsx`, then `apps/web/src/app/App.tsx`.
2. For career mutations, follow a named callback from App to
   `use-career-command-runner.ts`, then `web-career-runtime.ts`.
3. For durable save behavior, continue into `career-session.ts` and the
   storage adapter; do not write storage code in React.
4. For a screen's football facts, follow its web adapter to the `@game/ui`
   builder before changing React.
5. For Posta UI, follow presenter -> screen -> list/detail; use this as the
   clearest current example.
6. For tactics, use `TacticalBoardPitch`, normalized geometry, roles,
   formations, suitability, and board state. Do not use
   `TacticalPitchLineup` or `tactical-pitch-layout`.
7. For Matchday, begin at `matchday-adapter.ts`, then the `@game/ui` phase view,
   presenter, and screen. Expect high current complexity until remediation.
8. For styling, search the rendered `tls-*` class across all styles because
   current ownership is global. Do not assume the Tailwind import means the
   component is utility-styled.

## Preserved Strengths

The following should not be rewritten during remediation:

- domain/engine structured-fact purity;
- `@game/ui` framework-free read models;
- runtime-owned persistence and save cadence;
- SQLite/OPFS storage boundary;
- one observable asynchronous command seam;
- Posta presenter/list/detail decomposition;
- shared tactical board, normalized geometry, and role suitability;
- tokenized fixed visual skin;
- reduced-motion and native-dialog behavior;
- deterministic test fixtures and browser storage setup.

## Step 07 Handoff

The Playwright scorecard must establish a current, canonical visual truth
before any architecture or CSS cleanup is authorized. It should score all
primary states from the Step 01 inventory, include the Step 05 accessibility
risks, preserve the tactical board, and explicitly mark which historical
visual scripts are current contracts versus superseded evidence.

The architecture audit changes no Step 07 scope assumption. No Step 07
document update is required.

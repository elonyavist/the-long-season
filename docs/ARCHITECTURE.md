# The Long Season Architecture

Last updated: 2026-07-06

## Purpose

This document explains the current project structure for a developer joining the
codebase. It focuses on package responsibilities, important files, entry points,
and the paths to follow when debugging the main flows.

It is not a function-by-function API reference. Source code and focused tests
remain the source of truth for exact behavior.

## Package Graph

Dependency direction is intentionally one-way:

```text
apps/cli
  -> @game/storage
  -> @game/content
  -> @game/simulation-tools
  -> @game/engine
  -> @game/i18n
  -> @game/ui
  -> @game/shared

apps/web
  -> @game/engine
  -> @game/i18n
  -> @game/ui
  -> @game/shared

@game/simulation-tools -> @game/engine -> @game/domain
@game/content          -> @game/domain
@game/storage          -> @game/domain
@game/engine           -> @game/shared
@game/content          -> @game/shared
@game/storage          -> @game/shared
@game/i18n             -> no project package
@game/ui               -> @game/domain
@game/domain           -> no project package
@game/shared           -> no project package
```

Why this matters:

- `domain` stays pure and language-agnostic.
- `engine` owns deterministic rules and must not know storage, content, CLI, or
  i18n.
- `content` generates fake/world data and must not import engine rules.
- `storage` persists data and must not simulate anything.
- `simulation-tools` owns report models and diagnostic meaning, but not
  localized text or fake content.
- `ui` owns language-agnostic app/career read models and action contracts. It
  may import domain contracts/catalogs for shared football grammar, but must not
  know React, browser APIs, storage, CLI, engine, content, or i18n.
- `apps/cli` is the outer adapter. It can compose packages, parse commands,
  persist saves, render localized output, and smoke-test UI read models.
- `apps/web` is the browser adapter. It renders localized React screens from
  structured UI read models, coordinates application commands through one
  runtime, and persists careers through the browser storage adapter. It must
  not parse CLI output or reimplement domain or engine rules.

`pnpm depcruise` enforces the package direction.

## Package Responsibilities

| Package | Owns | Must Not Own |
|---|---|---|
| `packages/domain` | IDs, entities, value objects, career/game/youth state, career Inbox/attention contracts, squad contracts, tactic contracts. | RNG, storage, rendering, generated content, engine decisions. |
| `packages/shared` | Deterministic technical helpers: RNG, date conversion, assertions, errors, number utilities. | Football concepts or presentation text. |
| `packages/engine` | Match simulation, season simulation, career fixture progression, Continue-until-attention logic, development, squad/youth lifecycle, market rules, table calculation. | Content generation, JSON storage, CLI output, localized labels. |
| `packages/content` | Deterministic fake clubs, players, youth academies, identities, nationality data, generation bands, calibration targets. | Engine algorithms, save writes, UI/CLI rendering. |
| `packages/storage` | Browser-safe storage contracts, save envelopes, immutable relational migrations, SQLite career mapping, and the Node JSON adapter. | Gameplay decisions or generated content. |
| `packages/simulation-tools` | Balance reports, long-run runners, player/club/youth stability reports, anomaly semantics. | Fake content, storage, localized prose, CLI formatting. |
| `packages/i18n` | Supported languages, translation keys, fallback translation rendering. | Simulation logic or package imports. |
| `packages/ui` | UI-facing read-model contracts, app-entry/dashboard/Inbox/match-preparation/matchday view contracts, action availability/result contracts, pure dashboard, Inbox, shell, match-preparation, and matchday phase builders. It may derive read-model formation facts from `packages/domain` catalogs. | React, browser APIs, storage, CLI rendering, localization prose, engine/content simulation, save writes. |
| `apps/cli` | Command parsing, package composition, save IO, localized console output, smoke/lab commands. | Core gameplay rules or reusable diagnostic semantics. |
| `apps/web` | Vite React shell, localized entry/dashboard/preparation/matchday screens, Zustand draft state, one durable career runtime, SQLite WASM/OPFS worker composition, Posta/attention presentation, and browser visual QA. | Engine rules, direct storage calls from React, CLI parsing, economics, hidden recommendations, rejected visual-skin systems, parallel demo career owners. |

## Main Entry Points

| Area | Entry Point |
|---|---|
| CLI app | `apps/cli/src/index.ts` |
| CLI doctor | `apps/cli/src/commands/doctor.ts` |
| Simulate one season | `apps/cli/src/commands/simulate-season.ts` |
| Career command | `apps/cli/src/commands/career.ts` |
| Long-run report command | `apps/cli/src/commands/ten-season-report.ts` |
| Generated world facade | `packages/content/src/generators/league-system.ts` via `createFakeLeagueSystem` |
| Season simulation use-case | `packages/engine/src/use-cases/simulate-season.ts` |
| Career fixture progression | `packages/engine/src/career/progress-fixture.ts` via `progressNextCareerFixture` |
| Post-match player-state consequences | `packages/engine/src/career/career-match-state-consequences.ts` via `applyCareerMatchStateConsequences` |
| Career Continue loop | `packages/engine/src/career/continue-career.ts` via `continueCareerUntilAttention` |
| Match simulation | `packages/engine/src/match-engine/simulate-match.ts` |
| Staged matchday progression | `packages/engine/src/match-engine/staged-match-progression.ts` |
| Player match ratings | `packages/engine/src/match-engine/player-match-rating.ts` |
| Half-time tactical decision contract | `packages/domain/src/match/half-time-tactical-decision.ts` |
| Half-time substitutions | `packages/engine/src/match-engine/half-time-substitutions.ts` |
| Manual tactic segments | `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts` |
| Team strength | `packages/engine/src/match-engine/team-strength.ts` |
| Calendar generation | `packages/engine/src/season-engine/calendar.ts` |
| League table | `packages/engine/src/season-engine/league-table.ts` |
| Career storage interface | `packages/storage/src/career-storage.interface.ts` |
| Node JSON career storage | `packages/storage/src/json-career-storage.ts` |
| Browser SQLite mapping | `packages/storage/src/sqlite/career-state-mapper.ts` |
| Long-run anomaly semantics | `packages/simulation-tools/src/long-run/anomaly-scoring.ts` |
| Localization labels | `packages/i18n/src/labels.ts` |
| UI read-model package | `packages/ui/src/index.ts` |
| App entry view contract | `packages/ui/src/app/app-entry-view.ts` |
| Career dashboard view builder | `packages/ui/src/career/build-career-dashboard-view.ts` |
| Career Inbox view builder | `packages/ui/src/career/career-inbox-view.ts` |
| Career shell/navigation view builder | `packages/ui/src/career/career-shell-view.ts` |
| Career match-preparation view builder | `packages/ui/src/career/career-match-preparation-view.ts` |
| Career matchday phase view builder | `packages/ui/src/career/career-matchday-phase-view.ts` |
| Web app | `apps/web/src/main.tsx` |
| Web React root | `apps/web/src/app/App.tsx` |
| Web durable career runtime | `apps/web/src/runtime/web-career-runtime.ts` |
| Web SQLite/OPFS composition | `apps/web/src/infrastructure/persistence/create-web-career-storage.ts` |
| Web career UI store | `apps/web/src/stores/career-ui-store.ts` |
| Web app-entry screen | `apps/web/src/features/app-entry/AppEntryScreen.tsx` |
| Web dashboard screen | `apps/web/src/features/dashboard/CareerDashboardScreen.tsx` |
| Web match-preparation screen | `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx` |
| Web dashboard adapter | `apps/web/src/features/dashboard/build-career-dashboard.ts` |
| Web match-preparation adapter | `apps/web/src/features/match-preparation/match-preparation-adapter.ts` |
| Web matchday checkpoint adapter | `apps/web/src/features/matchday/matchday-adapter.ts` |
| Web matchday presenter | `apps/web/src/features/matchday/career-matchday-presenter.ts` |
| Web matchday screen | `apps/web/src/features/matchday/CareerMatchdayScreen.tsx` |
| Web app shell | `apps/web/src/features/app-shell/AppShell.tsx` |
| Web Posta rail | `apps/web/src/features/app-shell/AppShellPostaRail.tsx` |
| Web current-product visual and journey QA | `apps/web/src/visual-qa/current-product.spec.ts` |
| Web SQLite/OPFS persistence QA | `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts` |

## Important Files By Area

### Domain

- `packages/domain/src/entities/*`
  Contains core entities such as players, clubs, fixtures, competitions, and
  reports. These files define shape, not behavior-heavy orchestration.
- `packages/domain/src/state/*`
  Contains durable game/career/youth state contracts.
- `packages/domain/src/career/*`
  Contains durable language-agnostic career attention and Inbox/Posta contracts.
  These are domain data contracts, not presentation text or UI behavior.
- `packages/domain/src/tactics/player-roles.ts`
  Canonical football role contract. It defines the 12 player roles supported by
  the game: goalkeeper, full backs, center back, defensive midfielder, central
  midfielder, wide midfielders, attacking midfielder, wingers, and striker.
  Side/channel labels such as right/left/center belong to formation slots, not
  to extra player-role names.
- `packages/domain/src/tactics/formations.ts`
  Canonical formation catalog. Each formation slot has a stable slot key, a
  canonical `playerRole`, department, side/channel metadata, and a compatibility
  `positionFamily` alias for current callers. This is the source of truth for
  tactical shape; do not duplicate the formation slot arrays in UI or web code.
- `packages/domain/src/tactics/position-suitability.ts`
  Slot-fit scoring and suitability rules. Use these helpers when ranking player
  options for a formation slot so a strong adapted player can beat a weak
  natural fit without hiding real weak/invalid coverage.
- `packages/domain/src/value-objects/*`
  Contains branded IDs and values.
- `packages/domain/src/index.ts`
  Public domain entry point. Broad by design.

Domain files must not contain localized labels, random generation, storage, or
simulation algorithms.

### Shared

- `packages/shared/src/rng.ts`
  Deterministic RNG streams. Use this instead of runtime randomness.
- `packages/shared/src/date-utils.ts`
  Pure date conversion helpers. Use this instead of JavaScript `Date` in engine.
- `packages/shared/src/assert.ts`, `errors.ts`, `number-utils.ts`
  Small technical utilities.

Shared files must stay free from football concepts.

### Engine

- `packages/engine/src/match-engine/step-match.ts`
  One-minute match stepping and event generation. Large and gameplay-critical.
- `packages/engine/src/match-engine/chance-actors.ts`
  Chooses shooter, creator, defender, and goalkeeper for events.
- `packages/engine/src/match-engine/create-match-report.ts`
  Converts simulation output into durable domain match reports.
- `packages/engine/src/match-engine/match-explanation-trace.ts`
  Produces structured explanation data for debugging fixture outcomes.
- `packages/engine/src/match-engine/staged-match-progression.ts`
  Deterministic interactive-matchday progression. It creates an initial staged
  match state, progresses from pre-match to half-time, applies continuation to
  full time, and keeps future extra-time/penalty phases as inactive structural
  values until cup rules exist. It does not persist browser state or make
  selected-club decisions.
- `packages/engine/src/match-engine/player-match-rating.ts`
  Derives deterministic live/final player rating facts from structured match
  events and stats. Ratings are not random cosmetic values and do not parse
  prose.
- `packages/engine/src/match-engine/half-time-substitutions.ts`
  Validates and applies manager-declared selected-club half-time substitutions
  against the staged match context. It checks phase, pitch membership, bench
  membership, duplicate players, and the conservative v1 substitution cap.
- `packages/engine/src/use-cases/simulate-season.ts`
  Simulates a full season from app/content-provided inputs.
- `packages/engine/src/career/progress-fixture.ts`
  Stable career matchday advancement entry point. Caller owns preparation and
  recovered state before calling this function.
- `packages/engine/src/career/career-match-state-consequences.ts`
  Pure selected-club post-match player-state Module. It applies bounded `form`
  and `morale` consequences to ordered selected-club starters from durable
  `MatchReport` facts such as result, clean sheet, heavy loss, goals, assists,
  and goalkeeper saves. It returns copy-on-write player states plus structured
  reason-key facts for CLI/web presentation. It does not spend fitness, render
  labels, infer advice, model bench dissatisfaction, or tune match outcomes.
- `packages/engine/src/career/advance-career-season.ts`
  Canonical season-level career advancement entry point. It owns deterministic
  season refresh order for completed-season rollover and report-only refresh:
  validation/archive, development, exits, youth lifecycle, intake, promotion,
  squad maintenance, transfer turnover, calendar merge, and player rollover.
  Callers provide content-generated candidates and table/calendar inputs.
- `packages/engine/src/career/continue-career.ts`
  Pure canonical-day Continue rule. It orders same-date messages by attention
  level and stable ID, stops only for blocking or important attention, and
  returns the complete first stop-date batch without playing a fixture or
  writing a save.
- `packages/engine/src/career/career-inbox-lifecycle.ts`
  Current-season Posta lifecycle use cases. Delivery is idempotent, opening
  marks read, important acknowledgement requires an opened message, blocking
  resolution is derived from fixture facts, and played fixtures/season rollover
  create only the supported structured summaries.
- `packages/engine/src/career/player-development.ts`
  Growth and aging model. Large but coherent.
- `packages/engine/src/career/squad-maintenance.ts`,
  `transfer-turnover.ts`, `youth-lifecycle.ts`, `youth-intake.ts`,
  `youth-promotion.ts`
  Career refresh and youth pipeline logic.
- `packages/engine/src/index.ts`
  Public engine entry point. It is broad today; future narrowing should happen
  only after adapters consume deeper use-cases.

Engine files must not import content, storage, CLI, or i18n.

### Content

- `packages/content/src/generators/league-system.ts`
  Generated-world facade. Prefer `createFakeLeagueSystem` when a caller needs a
  coherent generated world bundle.
- `packages/content/src/generators/fake-clubs.ts`
  Stable club IDs and fictional city-based club identities.
- `packages/content/src/generators/fake-players.ts`
  Senior squad, identities, roles, ability, potential, lineup, and state
  generation.
- `packages/content/src/generators/initial-youth-academies.ts`
  Initial youth academy generation for career saves.
- `packages/content/src/generators/career-intake-players.ts`
  Later-career intake players used by long-run refresh.
- `packages/content/src/generators/player-role-templates.ts`
  Role-based ability shaping rules.
- `packages/content/src/generators/player-role-attribute-classification.ts`
  Role/attribute classification rules.
- `packages/content/src/identity/*`
  Name cultures, nationality distribution, flag metadata.
- `packages/content/src/index.ts`
  Public content entry point.

Content must not import engine. It emits data/config that engine callers can
adapt.

### Storage

- `packages/storage/src/career-storage.interface.ts`
  Browser-safe canonical manager-career persistence contract. Both production
  adapters implement this interface; callers do not depend on filesystem,
  SQLite, OPFS, or worker details.
- `packages/storage/src/career-save-envelope.ts`
  Versioned JSON save envelope validation and migration used by the Node
  adapter.
- `packages/storage/src/json-career-storage.ts`
  Node/CLI JSON career adapter. This is the only career adapter that imports
  Node filesystem and path APIs.
- `packages/storage/src/sqlite/sqlite-career-storage.ts`
  Browser-facing `CareerStorage` implementation over a narrow worker port. It
  owns typed error mapping and delegates SQL execution to the web worker.
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
  Ordered immutable relational migrations. Browser schema version 6 is the
  current version and includes tactical preparation, match checkpoints, and
  current-season Posta messages with ordered blockers and actions.
- `packages/storage/src/sqlite/career-state-mapper.ts`
  Relational write/read mapping for career systems, match reports,
  preparation, active match checkpoints, and durable Inbox lifecycle.
- `packages/storage/src/sqlite/world-state-mapper.ts`
  Relational write/read mapping for ordered clubs, players, abilities, dynamic
  state, rosters, fixtures, and fixture results.
- `packages/storage/src/json-game-storage.ts`
  Older game-state JSON storage.
- `packages/storage/src/migrate-save.ts`
  Save migration logic.
- `packages/storage/src/save-metadata.ts`
  Save listing metadata.

Storage must not simulate matches or generate content.

### Simulation Tools

- `packages/simulation-tools/src/calibration-report.ts`
  Balance calibration report model.
- `packages/simulation-tools/src/long-run/long-runner.ts`
  Generic long-run season runner.
- `packages/simulation-tools/src/long-run/career-long-runner.ts`
  Career-aware long-run runner.
- `packages/simulation-tools/src/long-run/player-evolution.ts`
  Player growth/decline and production report model.
- `packages/simulation-tools/src/long-run/club-stability.ts`
  Club stability and squad refresh report model.
- `packages/simulation-tools/src/long-run/youth-stability.ts`
  Youth population/lifecycle report model.
- `packages/simulation-tools/src/long-run/anomaly-scoring.ts`
  Warning/failure semantics and shared PASS/WARN/FAIL severity helpers.

Simulation tools may define report models and thresholds. They must not render
localized CLI text or import generated content.

### UI Read Models

- `packages/ui/src/index.ts`
  Public UI read-model entry point. Future adapters should import from this
  file instead of deep paths.
- `packages/ui/src/app/app-entry-view.ts`
  Main-menu/app-entry view contract: new career, continue career, settings,
  selected language, supported languages, selected currency, supported
  currencies, and app-entry actions.
- `packages/ui/src/app/app-entry-actions.ts`
  App-entry action availability and generic UI action result contracts.
- `packages/ui/src/career/career-dashboard-view.ts`
  First post-load career dashboard view contract. It stores IDs, status keys,
  numeric facts, and display names already present in save/content data; it does
  not store rendered sentences.
- `packages/ui/src/career/career-dashboard-actions.ts`
  Career-dashboard action availability and result contracts for inspect squad,
  inspect lineup, inspect tactic, prepare match, advance fixture, and inspect
  table.
- `packages/ui/src/career/build-career-dashboard-view.ts`
  Pure builder that maps already-loaded save facts into a dashboard view. It
  owns preparation blockers, condition summary, table/recent-match presence,
  alert keys, and action availability.
- `packages/ui/src/career/career-inbox-view.ts`
  Pure Inbox/Posta read-model builder. It derives the compact rail plus exact
  `All`, `To handle`, and `Unread` list/detail views, deterministic selection,
  lifecycle meaning, counts, blockers, actions, and structured football facts.
  It keeps prose as translation keys and contains no React or command logic.
- `packages/ui/src/career/career-shell-view.ts`
  Pure shell/navigation view builder. It defines stable career section keys,
  current-section state, disabled future-section state, central content section,
  Inbox rail summary state, and focused shell modes for standard, preparation,
  and matchday contexts without React or browser dependencies.
- `packages/ui/src/career/career-match-preparation-view.ts`
  Pure match-preparation view builder. It accepts explicit fixture, selected
  club, formation, lineup slot, bench slot, player option, tactic profile, and
  saved-state facts, then derives missing-slot, duplicate-player, bench-overlap,
  missing-bench-goalkeeper, missing-tactic, blocker, status, and save-action
  state. Its exposed formation facts are adapted from the domain formation
  catalog, so UI and tactical engine grammar cannot drift. It exposes
  manager-triggered selection helper actions as action state only; it does not
  run those actions, choose players, recommend tactics, persist state, localize
  prose, or run the engine.
- `packages/ui/src/career/career-matchday-view.ts`
  Pure matchday read-model builder. It accepts already-built fixture, report,
  preparation, condition, form, morale, and next-stop facts, then derives
  blocked, ready-to-play, played, and unavailable matchday states. It owns the
  web-ready event rows, player-stat rows, consequence rows, score outcome, and
  action availability, but does not simulate the match, localize labels, parse
  CLI output, or persist career state.
- `packages/ui/src/career/career-matchday-phase-view.ts`
  Pure phase-aware matchday read-model builder for the interactive web match
  centre. It derives scoreboard, period rail, timeline rows, highlight cards,
  player rating rows, half-time action availability, single phase-primary
  actions, and full-time-only consequences from structured facts.

UI read-model files are not the web UI. They exist so CLI smoke output and the
future web adapter can consume the same structured facts without parsing console
text or importing engine internals.

### Web App

- `apps/web/src/main.tsx`
  Browser entry point. It mounts React and imports the global visual foundation.
- `apps/web/src/app/App.tsx`
  Current browser composition root. It owns browser-runtime lifecycle, command
  wiring, and explicit top-level screen selection. It does not own engine rules,
  build screen read models inline, or repeat loaded-career providers. Keep this
  ownership explicit; do not replace it with a generic router, screen registry,
  command bus, or dependency-injection container.
- `apps/web/src/app/CareerAppFrame.tsx`
  Bounded composition seam for every loaded-career destination. It owns the save
  lifecycle provider, storage-recovery boundary, and one dirty-exit dialog. It is
  intentionally not a router or generic page framework; `App.tsx` remains the
  visible entry point for tracing runtime and navigation behavior.
- `apps/web/src/app/use-career-screen-presentations.ts`
  Focused React hook that memoizes pure Dashboard, Posta, preparation, tactical,
  and Matchday presentation derivation from the current career snapshot. It
  never issues commands, changes routing, reads storage, or moves domain logic
  into React.
- `apps/web/src/app/preferences.ts`
  Web-only preference model for language and display currency. Currency remains
  a display preference, not an economics rule.
- `apps/web/src/app/translation.ts`
  Thin adapter over `@game/i18n` for React components.
- `apps/web/src/stores/career-ui-store.ts`
  Single Zustand owner for browser UI/session snapshots: current screen,
  language/currency preferences, durable save metadata, loaded working career,
  bounded session status, last Continue result, match drafts, and observable
  command activity. Match-preparation mutations are reconciled structurally
  against the loaded baseline, exact undo returns to clean, and confirmed
  discard reconstructs the baseline draft. The store does not own engine
  rules, storage, save cadence, or duplicate `@game/ui` read-model
  calculations. Phase 73A found folder-level
  coupling because the store imports feature adapters while features consume
  the store, plus mixed command-activity delivery. Treat those as bounded
  ownership debt, not permission to add another store or event bus.
- `apps/web/src/runtime/career-session.ts`
  Owns one loaded career's durable baseline and mutable working snapshot. It
  derives dirty state, persisted game date, 7-day/15-day/manual-only policy,
  and postponed autosave state from canonical game dates. The web projection
  may include a structurally dirty preparation draft so navigation and native
  unload protection remain truthful without changing the durable cadence. It
  has no timer, browser API, React state, or alternate recovery persistence.
- `apps/web/src/runtime/web-career-runtime.ts`
  Canonical browser application boundary. It creates/lists/loads careers,
  applies Continue, Posta lifecycle, and staged matchday commands to the loaded
  `CareerSession`, refreshes due facts without a write-through save, and reaches
  storage only for creation, policy metadata, manual save, or due autosave at a
  safe stop. Explicit manual save may receive one complete validated
  preparation payload and commits it through the same session boundary;
  incomplete drafts and individual tactical edits never write storage. React
  and Zustand do not call storage directly.
- `apps/web/src/features/inbox/career-inbox-presenter.ts`
  Adapts durable messages plus current fixture/report/archive facts into the
  pure `@game/ui` Posta inputs. It does not determine attention, mutate
  lifecycle, or fabricate future workflow messages.
- `apps/web/src/features/inbox/CareerInboxScreen.tsx`
  Production Posta destination. Desktop uses a dense list/detail workspace;
  narrow layouts use explicit list-to-detail navigation with a Back action.
  Filter and selection state are ephemeral and never become career facts.
- `apps/web/src/features/inbox/calendar-advance-transition.ts`
  Pure presentation plan for canonical dates. It shows the first seven days,
  samples longer ranges within 1.8 seconds, and bypasses stepping under reduced
  motion without changing the destination or engine result.
- `apps/web/src/app/use-career-command-runner.ts`
  The single asynchronous mutation runner. It acquires the typed Zustand
  command lock before work, rejects conflicts, publishes successful session
  state before clearing activity, and exposes bounded storage failures. It is
  deliberately not a queue, event bus, or generic command framework.
- `apps/web/src/features/shared/CommandActivityIndicator.tsx`
  Stateless visible progress label and polite live-region presenter used by
  current command controls. Screens retain their football context, expose
  `aria-busy`, and lock only conflicting interactions.
- `apps/web/src/features/app-shell/CareerSaveControl.tsx`
  Renders clean/dirty state, last persisted game date, manual save, and the
  per-career autosave policy. It consumes session facts and callbacks; it does
  not calculate due dates or write storage.
- `apps/web/src/features/app-shell/UnsavedCareerDialog.tsx`
  Native accessible dirty-exit decision surface. Career exit retains its safe
  Save/Exit/Cancel contract. Preparation navigation uses Stay and Discard, plus
  Save and continue only for a complete valid plan; focus and pending behavior
  remain owned by the same dialog rather than a second modal system.
- `apps/web/src/infrastructure/persistence/create-web-career-storage.ts`
  Browser storage adapter using the dedicated Comlink worker and official
  SQLite WASM OPFS VFS. It provides no IndexedDB, localStorage, sessionStorage,
  or in-memory fallback.
- `apps/web/src/features/app-entry/app-entry-view-model.ts`
  Builds the app-entry read model from `@game/ui` contracts.
- `apps/web/src/features/app-entry/AppEntryScreen.tsx`
  Localized main menu with New career, Continue career, language/currency
  settings, and the fixed first-MVP visual identity.
- `apps/web/src/features/dashboard/build-career-dashboard.ts`
  Maps one loaded `CareerState` into the pure dashboard read model. It derives
  the next fixture, preparation readiness, selected-club condition, and recent
  result without persistence or fabricated fallback facts.
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
  Creates the editable browser draft from loaded career facts, applies explicit
  manager selection commands, preserves normalized board geometry, derives a
  stable dirty fingerprint against the loaded baseline, reconciles exact undo,
  and emits a validated durable preparation payload. Unsaved edits remain UI
  state until an explicit runtime command commits and reloads them.
- `apps/web/src/features/matchday/matchday-adapter.ts`
  Rebuilds the matchday screen from the loaded career and optional durable
  checkpoint. A completed fixture is reconstructed from its persisted
  structured report, including deterministic player ratings derived from those
  facts, so refresh never re-simulates the match or invents cosmetic values.
- `apps/web/src/shared/lib/player-position-ordering.ts`
  Web-side tactical ordering helper for selectable player options. It keeps
  natural slot fits first, adapted fits next, weak/emergency fits last, and
  sorts broad role views by football position order rather than localized role
  text. It also exposes raw fit tiers used by tactical-board suitability.
- `apps/web/src/features/tactics-board/tactical-board-types.ts`
  Shared tactical-board contracts. Slots use normalized coordinates, display
  role codes, canonical roles, lock state, and optional player assignment.
- `apps/web/src/features/tactics-board/tactical-board-roles.ts`
  Board display-role catalog, role movement zones, department metadata, and
  position-based role-change options. It maps compact board codes such as `ED`
  and `AD` back to the canonical role grammar.
- `apps/web/src/features/tactics-board/tactical-board-geometry.ts`
  The only place where normalized coordinates are projected into the SVG
  `0 0 800 1170` viewBox. State must not store pixel coordinates.
- `apps/web/src/features/tactics-board/tactical-board-formations.ts`
  Adapts `@game/ui` formation facts into board presets and derives the current
  shape from actual slot roles. It must not duplicate domain formation arrays or
  import raw domain contracts in browser code.
- `apps/web/src/features/tactics-board/tactical-board-state.ts`
  Pure board draft operations: create, load base formation, move slot, change
  role, clear assignment, assign player, and extract lineup selections.
- `apps/web/src/features/tactics-board/tactical-board-squad.ts`
  Maps current match-preparation player options into board-ready player facts:
  id, number, surname, form trend, primary role, alternative roles, current
  ability, and suitability by role.
- `apps/web/src/features/tactics-board/tactical-board-suitability.ts`
  Derives the five visual suitability levels from existing player-position fit
  tiers and provides deterministic assignment ordering for XI and bench
  pickers. Suitability is computed when needed, not persisted as mutable state.
- `apps/web/src/features/tactics-board/tactical-board-bench.ts`
  Fixed substitute-bench contract for the shared tactical workspace. It owns the
  eight `bench:01` through `bench:08` slot ids and their label-key mapping.
- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.tsx`
  Controlled reusable tactical surface. It renders the vertical pitch, player
  tokens, empty slots, active drag zones, context menu, long-press menu, and
  delegates all state changes through callbacks. Context menus close on outside
  click, pitch-background click, `Esc`, and completed actions.
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.tsx`
  Controlled reusable substitute surface. It renders the compact green bench
  board, fixed `S1`-`S8` slots, player/add tokens, bench-only add/remove menu,
  available-player filtering, outside/Escape menu dismissal, and delegates
  assignment/removal through callbacks. It is shared by match preparation and
  the future Tactics screen.
- `apps/web/src/features/tactics-board/components/TacticalBoardPitchMarkings.tsx`
  Game-owned SVG pitch markings adapted from the supplied reference feature.
  This is now the shared tactical-board pitch surface; it is separate from the
  older static SVG-background pitch.
- `apps/web/src/features/dashboard/career-dashboard-presenter.ts`
  Reduces the dashboard read model to one current manager task, its real primary
  blockers, and optional supporting facts. Technical identifiers remain in the
  underlying read model for diagnostics but are not valid product copy.
- `apps/web/src/features/app-shell/AppShell.tsx`
  Rebuilt localized career shell. It owns the persistent left navigation,
  central selected-content outlet, right action/context rail, Main menu command,
  optional Continue command, current-section state, and selected-club identity
  chrome. It is the direct shell used by dashboard, match preparation, and
  matchday screens.
- `apps/web/src/features/app-shell/AppShellPostaRail.tsx`
  Compact localized Posta/attention rail for manager messages. It shows counts,
  unread/action-required state, priority/status badges, related labels, and
  message actions. It is not a full mail client.
- `apps/web/src/assets/campo-calcio.svg`
  Football-pitch background supplied by the user and owned by the web app at
  runtime. Do not reference the user's Downloads folder from code and do not use
  the asset as a source of tactical-board slot coordinates.
- `apps/web/src/shared/ui/SquadSelectionTable.tsx`
  Reusable fixed-height, sortable squad-picking table. It owns table sort state
  and sorts broad roles by tactical position order, not localized role text.
  Match preparation uses it now; tactics and squad selection can reuse it.
- `apps/web/src/shared/ui/PlayerCandidateRow.tsx`
  Reusable dense player-candidate row for tactical assignment surfaces. It is
  presentational only and renders shirt number, surname, role, compact fitness
  percentage, optional foot, and suitability tone without importing feature
  state or engine rules.
- `apps/web/src/shared/ui/PlayerFactPanel.tsx`
  Reusable compact selected-player fact panel for tactical squad surfaces.
- `apps/web/src/shared/lib/match-preparation-labels.ts`
  Shared label/format helpers for tactical player facts. It keeps localized
  status, role, fitness, age, and foot formatting out of screen components.
- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
  Operational home for one current manager question. It renders one dominant
  action for attention, unprepared, ready, or post-match state, followed only by
  available football context. It receives command activity explicitly from
  `App.tsx`, does not read Zustand behind its props, and omits unavailable facts
  instead of exposing `fixture:*`, `season:*`, `unknown`, `none`, or `missing`.
  Continue and Posta awareness remain in `AppShell`; detailed preparation and
  message explanations remain owned by their dedicated screens.
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
  Editable match-preparation tactical workspace. It orchestrates compact
  next-fixture context, one dirty marker, one validation strip beside the sole
  confirmation command, board-local
  formation/helper controls, reusable tactical pitch, reusable squad-selection
  table, reusable selected-player detail panel, shared tactical bench board,
  and tactic profile radios from structured read-model data. Navigation safety
  and persistence stay outside the screen; the approved board remains the
  dominant football object.
- `apps/web/src/features/matchday/matchday-adapter.ts`
  Rebuilds matchday exclusively from the loaded save's fixture, clubs, roster,
  XI, bench, tactic, and durable staged checkpoint. It creates pre-match and
  half-time checkpoints, maps half-time decisions, commits the exact staged
  report without resimulation, and builds the mandatory phase-aware read model
  consumed by the current web screen. Production callers no longer derive a
  fallback phase from the older summary view.
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
  Pure browser-side presenter for matchday information architecture. It derives
  compact score-header facts, passive phase progress, one primary command, and
  ordered tabellino/live-feed event groups from existing structured matchday
  facts. At full time it also derives selected-club ratings, deterministic
  outcome state, and presentation-relevant merged player consequences while
  omitting routine duplicate team facts. Reveal-only phase actions are excluded
  from its manager-action type, so the screen can expose only decisions or
  navigation. It does not simulate, localize prose, persist data, or invent
  match events.
- `apps/web/src/features/matchday/matchday-playback.ts`
  Pure, bounded presentation policy over already-computed half-time and
  full-time checkpoints. It groups each period's real events into immutable
  frames, derives intermediate scores only from revealed structured goals,
  restores the exact checkpoint score at closing, and collapses interpolation
  for reduced motion. It owns no engine mutation, save write, interval, or
  durable playback cursor.
- `apps/web/src/features/matchday/MatchdayLivePhase.tsx`
  Focused live-period composition shared by match playback. It renders the
  current score context, structured event hierarchy, and polite live status
  from presenter facts without adding football outcomes or technical IDs.
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.tsx`
  Composition-only interval workspace. It orders presenter-derived decisive
  events and selected-club player signals before the existing shared tactical
  board and bench, owns one validation strip, and exposes the existing resume
  callback only when the draft is valid. It does not own match simulation,
  tactical rules, persistence, board geometry, or player suitability.
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
  Composition-only full-time football review. It orders decisive structured
  incidents, selected-club ratings, and meaningful durable player consequences
  after the dominant result, omits unavailable optional facts, and exposes no
  secondary exit or technical diagnostic table. It does not derive engine
  outcomes, commit results, or persist review state.
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
  Localized five-state match centre. It renders pre-match confirmation,
  bounded first-half playback after one explicit Start match command, the real
  half-time tactical decision, bounded second-half playback after confirmation,
  and full-time review from the phase-aware `@game/ui` matchday read model plus
  the web presenter. One screen-level presentation controller keeps shell and
  centre on the same visible phase. Presentation timing uses one cleared timeout
  per immutable frame, stops automatically at both canonical checkpoints, and
  never checkpoints or persists separately. Half-time and full time delegate
  their complete body compositions to `MatchdayHalfTimePhase` and
  `MatchdayFullTimePhase`, while the screen header remains the single
  score/minute/phase/action owner. Full time is ordered as tabellino, selected-
  club ratings, then meaningful consequences; half-time is the only editable
  tactical workspace. It does not own engine rules.
- `apps/web/src/visual-qa/current-product.spec.ts`
  Authoritative Playwright QA for the current browser product. It covers App
  Entry lifecycle states; Dashboard, Posta, preparation, staged Matchday, and
  full-time return; dirty draft recovery; command feedback; desktop, wide,
  narrow, focus, `200%` text, and reduced-motion behavior; and the approved
  tactical-board interactions including assignment order, duplicate prevention,
  goalkeeper lock, movement clamp, role change, menu dismissal, keyboard, and
  touch long press. Step 10 evidence is written under
  `/tmp/the-long-season-phase73b/step-10`.
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
  Focused Playwright proof for the unique browser persistence boundary. It
  round-trips isolated ordered career worlds through SQLite WASM on OPFS and
  proves failed replacement rollback. Together with `current-product.spec.ts`
  it forms the complete `pnpm web:visual:qa` release gate.
- `apps/web/src/styles/*`
  Premium retro visual foundation: tokens, base chrome, layout, and component
  styles, including the rebuilt app shell, Posta/attention rail, dashboard,
  match-preparation tactical workspace, shared candidate rows, compact squad
  list, central outlets, matchday centre, and the shared tactical board. Tactical
  pitch grass, football-surface foreground text, semantic severity, suitability,
  and form colors remain stable.

The web app now owns a durable browser career lifecycle. New/list/load,
Continue, match preparation, staged matchday, full-time commit, and review
acknowledgement all pass through `WebCareerRuntime` and canonical SQLite/OPFS
storage. UI preferences remain separate. Squad detail and economics remain
future product sections, not persistence placeholders.

On browser startup, `createWebCareerStorage` creates one dedicated Comlink
worker. The worker alone opens SQLite's official OPFS VFS, applies migrations,
owns the connection, and runs SQL transactions. The package-owned relational
mappers reconstruct and validate `CareerState`; React and Zustand never execute
SQL or call storage directly. Worker bootstrap errors are observed before the
first RPC can hang and become a typed `storage_unavailable` state with explicit
retry. There is no IndexedDB, localStorage, sessionStorage, or in-memory career
fallback.

Refresh intentionally returns to app entry. The manager explicitly selects a
durable save through Continue, after which the runtime restores the latest
meaningful decision checkpoint: saved pre-match preparation, half-time state,
or the completed full-time review. Full time is committed once in one storage
transaction; subsequent loads derive presentation from the durable fixture
report and do not apply football consequences again.

### Formation-To-Pitch Flow

Follow this path when debugging a tactical shape or shared board behavior:

1. `packages/domain/src/tactics/player-roles.ts`
   defines the only valid player roles.
2. `packages/domain/src/tactics/formations.ts`
   defines which canonical player role each formation slot requires and which
   side/channel that slot occupies.
3. `packages/domain/src/tactics/position-suitability.ts`
   scores how well a player can cover a specific slot role.
4. `packages/ui/src/career/career-match-preparation-view.ts`
   adapts the domain formation catalog into language-agnostic view facts.
5. `apps/web/src/features/tactics-board/tactical-board-formations.ts`
   adapts the `@game/ui` formation facts into board presets and derives the
   current shape from actual board slot roles.
6. `apps/web/src/features/tactics-board/tactical-board-state.ts`
   owns pure slot movement, role change, clearing, and assignment operations for
   a persistence-ready board draft.
7. `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
   rebuilds selections from the loaded career and executes explicit manager
   helper actions: `Auto`, `Fill gaps`, and `Clear`, while carrying the shared
   `TacticalBoardDraft`.
8. `apps/web/src/shared/lib/player-position-ordering.ts`
   orders player options by slot fit and current ability, not by localized role
   text, and feeds tactical-board suitability tiers.
9. `apps/web/src/features/tactics-board/tactical-board-squad.ts`
   maps current match-preparation player facts into board players.
10. `apps/web/src/features/tactics-board/components/TacticalBoardPitch.tsx`
    renders the shared controlled tactical surface.
11. `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
    mounts the board and wires callbacks to the current preparation store.

If a future Tactics screen needs a tactical surface, reuse steps 5 through 10
rather than creating a second formation catalog or second board component. If a
future matchday screen needs tactical display only, mount `TacticalBoardPitch`
in read-only mode with the same slot/player facts and omit mutation callbacks.

### CLI

- `apps/cli/src/index.ts`
  Command dispatcher.
- `apps/cli/src/commands/simulate-season.ts`
  Simulated-season command adapter. It composes generated content, runs the
  season, chooses the requested inspection mode, and delegates output to
  dedicated modules under `commands/simulate-season/`.
- `apps/cli/src/commands/simulate-season/parse-args.ts`
  Simulated-season argument parsing, validation, help output, and parsed command
  shape.
- `apps/cli/src/commands/simulate-season/demo-builders.ts`
  CLI-owned setup, lineup, condition, and fixture-scoped inspection builders.
- `apps/cli/src/commands/simulate-season/season-summary-output.ts`
  Default season summary, final table, top-player summaries, best/worst teams,
  and round fixture/scorer output.
- `apps/cli/src/commands/simulate-season/fixture-detail-output.ts`
  Fixture detail, event, all-starter player-stat, scorer, and explanation-trace
  output.
- `apps/cli/src/commands/simulate-season/demo-output.ts`
  Setup, condition, lineup, fixture-lineup, and manual tactic switch inspection
  output.
- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`
  Identity review and player-generation quality report output.
- `apps/cli/src/commands/simulate-season/formation-fit-output.ts`
  Formation-fit inspection output.
- `apps/cli/src/commands/simulate-season/market-demo-output.ts`
  Market-demo inspection output.
- `apps/cli/src/commands/career.ts`
  Career command storage/dispatch adapter.
- `apps/cli/src/commands/career/scenarios.ts`
  New-world and market-demo career state construction.
- `apps/cli/src/commands/career/progression.ts`
  Builds caller-owned matchday contexts and calls engine career advancement.
- `apps/cli/src/commands/career/preparation.ts`
  Persists selected lineup/tactic demo preparation.
- `apps/cli/src/commands/career/season-labs.ts`
  In-memory development report and season rollover lab helpers.
- `apps/cli/src/commands/career/format.ts`
  Shared career presentation helpers for labels, money, fixture lines, metadata,
  stable ordering, and compact player/club labels.
- `apps/cli/src/commands/career/overview-output.ts`
  New-world preview, career summary, and career inspect output.
- `apps/cli/src/commands/career/dashboard-output.ts`
  Read-only career dashboard smoke output. It adapts a loaded career save into
  `@game/ui` dashboard input, then renders the resulting view through i18n
  labels. This is a CLI adapter, not the source of dashboard readiness logic.
- `apps/cli/src/commands/career/preparation-output.ts`
  Saved lineup, saved tactic, and persisted match-preparation output.
- `apps/cli/src/commands/career/matchday-output.ts`
  Save-driven fixture advancement, condition consequences, recovery, and optional
  explanation-trace output.
- `apps/cli/src/commands/career/roster-output.ts`
  Selected squad and youth-academy inspection output.
- `apps/cli/src/commands/career/development-output.ts`
  Multi-season player development report output.
- `apps/cli/src/commands/career/market-output.ts`
  Permanent-transfer apply output.
- `apps/cli/src/commands/career/season-rollover-output.ts`
  Season rollover output.
- `apps/cli/src/commands/ten-season-report.ts`
  Long-run report command adapter. It parses arguments, chooses single-world or
  multi-world mode, creates the translator, writes optional report artifacts,
  and delegates report facts/rendering to `commands/ten-season-report/`.
- `apps/cli/src/commands/ten-season-report/report-data.ts`
  CLI-local long-run report facts boundary. It creates generated worlds,
  report-only career state, career long-run runs, post-season refresh snapshots,
  single-world report bundles, multi-world gate summaries, warning-key counts,
  and signal-kind grouping.
- `apps/cli/src/commands/ten-season-report/single-world-output.ts`
  Single-world ten-season report output: season summaries, player evolution,
  strength hierarchy, club stability, youth stability, and anomaly rows.
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
  Multi-world gate output: terminal summary, worst-world compact rows, signal
  guide, and Markdown report artifact.
- `apps/cli/src/commands/fake-season-input.ts`
  Converts `FakeLeagueSystem` into engine `simulateSeason` input.

CLI code can compose packages. It should not become the home for reusable engine
rules or diagnostic semantics.

### I18n

- `packages/i18n/src/language.ts`
  Supported language parsing and fallback contract.
- `packages/i18n/src/labels.ts`
  Translation key catalog and label values.

User-facing CLI/UI labels belong here when they are reusable presentation text.
Simulation packages should not hardcode UI/CLI labels.

## How To Trace Main Flows

### Simulate One Season

1. CLI enters through `apps/cli/src/index.ts`.
2. `simulate-season` args are parsed in
   `apps/cli/src/commands/simulate-season/parse-args.ts`.
3. `apps/cli/src/commands/simulate-season.ts` creates content with
   `createFakeLeagueSystem`.
4. `apps/cli/src/commands/fake-season-input.ts` converts content into engine
   season input.
5. `packages/engine/src/use-cases/simulate-season.ts` runs the season.
6. CLI renders table, stats, fixture detail, or inspection output.
   Simulate-season output is split by family under
   `apps/cli/src/commands/simulate-season/`.

### Create Or Load A Career Save

1. CLI enters `apps/cli/src/commands/career.ts`.
2. Args are parsed by `career/parse-career-args.ts`.
3. New worlds are built through `createFakeLeagueSystem` and
   `career/scenarios.ts`.
4. Career saves are written/read by `JsonCareerStorage`.
5. Career output is rendered by `career/format.ts`.

### Prepare A Match

1. User-facing CLI preparation commands enter `career.ts`.
2. `career/preparation.ts` persists selected lineup or tactic preparation.
3. The save stores preparation data; engine does not choose lineups or tactics
   automatically for the user.

### Advance A Career Fixture

1. CLI enters `career.ts` with `--advance-next-fixture`.
2. `career/progression.ts` applies caller-owned recovery/preparation context.
3. It builds match-ready `MatchTeamContext`s.
4. It calls `progressNextCareerFixture` in engine.
5. Engine simulates exactly the next selected-club fixture, applies fixture
   result, spends selected-starter condition, applies selected-starter
   `form`/`morale` consequences, and returns a copied career state plus
   structured consequence facts.
6. CLI writes the save and renders output.

### Generate A World

1. Call `createFakeLeagueSystem({ worldSeed })`.
2. Club identities come from `fake-clubs.ts`.
3. Senior squads and lineups come from `fake-players.ts`.
4. Career creation adds youth academies in `career/scenarios.ts`.
5. Calendar generation remains in engine because it is a rule, not content data.

### Run Long-Run Diagnostics

1. CLI enters `ten-season-report.ts`.
2. `ten-season-report.ts` parses args and creates the translator.
3. `ten-season-report/report-data.ts` builds fake content, in-memory career
   state, and app/content-specific report refresh callbacks.
4. Those callbacks call `advanceCareerOneSeason` in `reportRefresh` mode.
5. `runCareerLongRunSimulation` in simulation-tools runs the season loop.
6. Simulation-tools builds player, club, youth, and anomaly report models.
7. `report-data.ts` summarizes single-world or multi-world report facts.
8. `single-world-output.ts` or `gate-output.ts` renders localized console
   output. `gate-output.ts` also renders optional Markdown.

### Render Localized CLI Output

1. CLI parses `--lang`.
2. `createTranslator` from `@game/i18n` builds a translator.
3. CLI format modules call translation keys and inject values.
4. Engine/content/simulation-tools return structured facts, not localized prose.

## Common Debugging Paths

| Problem | Start Here |
|---|---|
| Season table looks wrong | `apps/cli/src/commands/simulate-season.ts`, then `packages/engine/src/use-cases/simulate-season.ts`, then `league-table.ts`. |
| One fixture result looks wrong | Run `simulate-season --fixture=<id> --fixture-explanation`, then inspect `match-explanation-trace.ts`, `step-match.ts`, and `chance-actors.ts`. |
| Career match did not use expected lineup/tactic | `career/preparation.ts`, `career/progression.ts`, then `progress-fixture.ts`. |
| Player condition changed unexpectedly | `career/progression.ts`, `career-weekly-recovery.ts`, `career-condition-consequences.ts`, then `progress-fixture.ts`. |
| Generated players look unrealistic | `fake-players.ts`, role template/classification files, player-generation tests, and the player-generation report CLI. |
| Club names look repetitive | `fake-clubs.ts` and `clubs/club-identity-source-data.ts`. |
| Long-run warnings are unclear | Start with `apps/cli/src/commands/ten-season-report/gate-output.ts`, then `ten-season-report/report-data.ts` signal grouping, then `simulation-tools/src/long-run/anomaly-scoring.ts` and `youth-stability.ts`. |
| Save cannot be read | `JsonCareerStorage`, save schema in domain, and storage tests. |
| Translation is missing | `packages/i18n/src/labels.ts` and localized presentation text check. |

## Remaining Large Files

These files are known and intentionally not fully split in Phase 43:

- `apps/cli/src/commands/simulate-season.ts`
  Improved in Phase 44. It is still the command adapter for many inspection
  modes, but season, fixture, demo, generated-inspection, formation-fit, and
  market output now live in dedicated modules.
- `apps/cli/src/commands/ten-season-report.ts`
  Improved in Phase 46. The command adapter is now narrow; the remaining large
  file is `apps/cli/src/commands/ten-season-report/report-data.ts`, which still
  owns report-only career refresh, row builders, gate aggregation, and signal
  grouping. Split only around real concept boundaries.
- `apps/cli/src/commands/career/format.ts`
  Large but presentation-only. Split by output family when adding UI-facing
  presentation contracts.
- `packages/engine/src/use-cases/simulate-season.ts`
  Large and core. Split only with careful golden tests.
- `packages/engine/src/career/player-development.ts`
  Large but coherent. Split curve/config helpers only if readability improves
  without tuning behavior.

## Rules For Adding Future Code

1. Start from the package that owns the concept.
2. Keep engine deterministic and language-agnostic.
3. Keep content generation out of engine.
4. Keep save IO out of engine and content.
5. Put reusable diagnostic semantics in simulation-tools, not CLI.
6. Put reusable presentation labels in i18n, not engine/content.
7. Prefer one clear entry point over many shallow helper paths.
8. Add TSDoc to exported functions/types that define flow or contracts.
9. Avoid compatibility leftovers and dead wrappers.
10. Run focused tests plus `pnpm check` before marking a step complete.

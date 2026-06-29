# Career Web Section Roadmap

Date: 2026-06-24
Current baseline: Phase 61 web visual identity system rework complete; the
accepted three-skin system is ready for future web sections.

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

### Phase 66 - Market UI MVP

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

### Phase 67 - Finances Foundation

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

### Phase 68 - Youth UI

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

### Phase 69 - Staff Foundation

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

### Phase 70 - Archive And History

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

### Phase 71 - Main Dashboard Consolidation

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
11. Phase 62 - Inbox/Posta Decision Center
12. Phase 63 - Squad Screen
13. Phase 64 - Calendar And Fixtures
14. Phase 65 - Matchday Flow
15. Phase 66 - Market UI MVP
16. Phase 67 - Finances Foundation
17. Phase 68 - Youth UI
18. Phase 69 - Staff Foundation
19. Phase 70 - Archive And History
20. Phase 71 - Main Dashboard Consolidation

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
- Inbox becomes valuable once there are real decisions, a strong shell, a
  maintainable web foundation, and a credible visual system.
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

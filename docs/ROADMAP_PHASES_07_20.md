# Roadmap Hypothesis — Phases 07-20

This document is an orientation map, not an implementation plan.

The binding implementation plan remains the step-by-step system under `docs/steps/`.
Before any phase below becomes active, it must be converted into a documented step group with the same structure used by previous phases.

## Mandatory Phase Gate

Before starting every new phase:

1. Review `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, and the completed phase docs.
2. Check whether the current project output is good enough to build on.
3. Identify whether the previous phase needs rework, balance tuning, cleanup, or clearer documentation.
4. If rework is needed, document and complete that rework before opening the next phase.
5. If the current state is good enough, create the next phase docs and only then implement one step at a time.

Each phase must answer:

- What can the user/developer verify now?
- What feels wrong, unclear, or too brittle?
- What should be improved before adding more scope?
- What is the smallest next step that moves the project toward a playable manager game?

## Current Position

Phases 00-11 established:

- deterministic foundation and package boundaries;
- aggregate match simulation;
- season simulation and league table;
- balance calibration;
- player-visible goals, assists, saves, shots, and fixture inspection;
- causal player context for creators and defenders where the current engine supports it;
- selected lineup and tactic setup contracts;
- season setup overrides;
- saved tactic demo profiles;
- explicit user-declared manual tactic switching for one inspected fixture;
- player fitness consequences;
- explicit manual lineup rotation for one fixture;
- CLI output good enough to inspect one season, one fixture, one deterministic tactic/lineup setup, one manual tactical profile timeline, condition impact, and one manual lineup override.

The project is still not a playable career. It is a deterministic football simulation core with useful CLI inspection.

The next broad objective is to turn the simulator into a rough but playable manager game without hardcoding presentation text into the simulation core. Phase 12 consolidated the tactical/squad core: formations, squad depth, positional fit, and factual squad-fit notes. Phase 13 added localization foundations for all current user-facing output before market/youth work multiplies the amount of text. Phase 14 completed the audit gate and recommended a narrow Phase 15 cleanup before adding larger career systems.

## Phase 07 — Match Engine Causal V1

Goal: make match events feel more causally connected to players instead of only plausibly attributed.

Possible scope:

- introduce a minimal nominal occasion resolver;
- identify chance creator, shooter, defender, and goalkeeper where the current engine can support it;
- preserve current scoring calibration as much as possible;
- add batch metrics for scorer/assist/shot distribution by role or department;
- keep output structured and language-agnostic.

Do not include:

- full possession chains;
- cards, injuries, penalties, substitutions, or fatigue;
- live match sessions;
- UI or storage work.

Phase gate question:

- Are match reports now credible enough that a player can start caring about individual footballers?

## Phase 08 — Tactic And Lineup MVP

Goal: give the user the first real managerial lever.

Possible scope:

- define minimal formation and lineup domain contracts;
- allow a selected lineup instead of fixed generated lineups;
- support basic role assignment;
- expose simple tactical inputs such as mentality, pressing, directness, width, and risk;
- add CLI commands or arguments to inspect and run simulations with chosen tactical setup.

Do not include:

- full tactical UI;
- training, tactical familiarity, or advanced instructions;
- market, contracts, staff, or youth;
- live substitutions unless a later phase explicitly opens match sessions.

Phase gate question:

- If the user changes lineup or tactics, does the output change in a believable and testable way?

## Phase 09 — Manual Tactical Changes V1

Goal: model the manager's tactical arsenal: multiple prepared setups, with manual in-match switching chosen by the user.

Possible scope:

- review Phase 08 output and decide whether the first demo setup is only a proof of override or a believable tactic;
- add a tiny set of deterministic saved tactic profiles, such as balanced, attacking, and defensive;
- define a match-segment or manual tactic-change contract where the caller chooses the minute and profile;
- allow fixture-level simulation to apply one manual switch at a declared minute;
- expose CLI inspection that prints the selected profile timeline, such as `0-45 balanced`, `46-90 attacking`.

Do not include:

- automatic tactical AI that changes setup based on score, minute, or context;
- live interactive match sessions;
- substitutions, team talks, fatigue, morale, cards, injuries, or tactical familiarity;
- React UI, persistence, career saves, market, economy, staff, youth, facilities, or media.

Phase gate question:

- Can a user/developer verify that a manager-chosen tactical switch changes one fixture deterministically without the system choosing for them?

## Phase 10 — Player Dynamic States

Goal: introduce consequences across matches.

Possible scope:

- implement fitness/fatigue first;
- add form only after fatigue is stable;
- add morale only after form is stable;
- apply capped multipliers to team strength or role score;
- recover state over calendar days;
- prove with tests and balance reports that the system does not dominate player quality.

Do not include:

- injuries;
- staff effects;
- training systems;
- player growth;
- team talks or media effects.

Phase gate question:

- Does repeated selection now have a meaningful cost without making the simulator unstable?

## Phase 11 — Manual Lineup Rotation V1

Goal: let the manager manually choose different lineups for selected fixtures and inspect fitness/result consequences.

Completed scope:

- review Phase 10 condition output;
- add deterministic PRO01 first-team and rotated lineup profiles;
- extend fake content with real reserve players while preserving default 11-player lineups;
- define and apply explicit fixture lineup overrides in `simulateSeason`;
- expose CLI fixture lineup inspection through `--fixture=<fixtureId> --lineup-demo=<profile>`;
- keep the user in control and avoid automatic rotation.

Do not include:

- UI;
- market;
- automatic rotation;
- free-form lineup editor;
- substitutions, injuries, form, morale, tactical familiarity, or career saves.

Phase gate question:

- Can a user/developer verify that selected starters and rested players change one fixture deterministically?

## Phase 12 — Squad Selection And Formation Core

Goal: make formation choice and squad shape a core manager decision.

Possible scope:

- add a broad curated formation catalog for common major-league shapes;
- define squad-depth contracts for roughly 22-player senior squads;
- define starters, bench/reserve groups, and validation;
- classify player-to-slot suitability as natural/adapted/weak/invalid;
- report formation fit, coverage gaps, weak depth, extra-depth groups, and factual squad-fit notes;
- expose CLI inspection that shows whether a squad fits `4-4-2`, `4-3-3`, `3-5-2`, `3-4-3`, narrow shapes, and other catalog formations.

Do not include:

- transfer execution;
- contracts, agents, wages, scouting, staff, youth, UI, persistence, or career saves;
- automatic best-XI selection;
- free-form formation editor;
- tactical familiarity, form, morale, injuries, or substitutions.

Phase gate question:

- Does changing formation expose believable squad-fit trade-offs without telling the manager what market action to take?

## Phase 13 — Localization Foundation

Goal: introduce deterministic localization for the five supported languages before more user-facing systems are added.

Possible scope:

- define `it`, `en`, `de`, `es`, and `fr` as supported languages;
- set English as the deterministic fallback;
- keep domain/engine keys language-agnostic and untranslated;
- create a localization package/layer for presentation text;
- review all current CLI-visible output from Phases 00-12, including season reports, balance reports, fixture events, player stats, tactic/lineup/condition output, formation-fit output, and user-facing errors;
- add the current user-facing message surface to the catalog;
- implement `it/en` first if needed for momentum;
- expose CLI `--lang=<code>` for current CLI output;
- complete `de/es/fr` for the same message catalog before closing the phase;
- add enforcement so new presentation code does not introduce hardcoded user-facing strings;
- align `requirements.md` and `docs/PROJECT_RULES.md` so labels useful to CLI or UI remain localization keys in future phases.

Do not include:

- UI or visual design;
- market, youth, economy, contracts, scouting, staff, persistence, or career saves;
- runtime machine translation or network dependencies;
- translating domain/engine keys or storing prose in simulation reports;
- converting structured event output into long narrative commentary.

Phase gate question:

- Can current CLI output, including game events and reports, be shown in the supported languages from stable message keys while simulation data remains unchanged?

## Phase 14 — Engine Audit And Core Quality Review

Goal: audit the current core before opening market, youth, economy, persistence, or career systems.

Possible scope:

- architecture boundary audit;
- determinism audit;
- match engine audit;
- season engine audit;
- tactic, lineup, and formation audit;
- code quality, dead code, and naming audit;
- final audit report with score, findings, blockers, strengths, and next-phase recommendation.

Do not include:

- feature implementation;
- market, youth, scouting, economy, contracts, UI, persistence, or career saves;
- balance tuning;
- automatic lineup/tactic/market recommendations;
- source refactors unless a documented blocker makes the audit impossible.

Phase gate question:

- Is the current engine/core solid enough to support market or youth work, or does it need a focused rework phase first?

## Phase 15 — Core Cleanup Before Career Systems

Goal: close the Phase 14 audit findings before market, youth, persistence, or career state expands the project.

Possible scope:

- remove the engine `Object.values()` order-risk in fixture-lineup overrides;
- clean stale internal wording that still frames factual squad-fit notes as market advice;
- split the large CLI `simulate-season` module into smaller private modules;
- decide whether fixture state should move into `GameState` before career/persistence;
- write a cleanup report with the next-phase recommendation.

Do not include:

- market, youth, scouting, economy, contracts, persistence UI, or career saves;
- match balance tuning;
- new manager-facing recommendations;
- automatic best XI, automatic rotation, or automatic tactical switching.

Phase gate question:

- Is the current deterministic core clean enough to support market/youth work without carrying known audit findings forward?

## Phase 16 — Minimal Transfer Market MVP

Goal: allow basic squad change driven by explicit user action and the manager's own interpretation of squad fit.

Possible scope:

- create a deterministic free-agent or transfer pool;
- allow simple signings with explicit user confirmation;
- add basic player value or wage cost only if needed for trade-offs;
- use Phase 12 formation and squad-fit facts to let the manager judge why a signing might help, without auto-signing;
- update squad-depth and formation-fit reports after manual squad changes.

Do not include:

- complex contracts, agents, loans, installments, sell-on clauses, deadline day, scouting fog, staff, UI, or persistence beyond the active step;
- automatic buying/selling;
- economy simulation larger than the market MVP requires.

Phase gate question:

- Can the user manually improve a weak squad with a visible trade-off?

## Phase 17 — Youth / Prospects Pipeline

Goal: introduce young players as a long-term squad-building alternative to market spending.

Possible scope:

- add a small deterministic youth/prospect pool;
- tag prospects by role/position family;
- expose youth candidates against selected formations and squad-fit facts;
- allow manual promotion to senior squad only if scoped;
- keep development/growth minimal or defer it to a later growth phase.

Do not include:

- full academy management;
- complex growth curves;
- staff/facility modifiers;
- scouting fog;
- loans or youth contracts unless a step explicitly opens them.

Phase gate question:

- Can young players become a meaningful answer to squad gaps without replacing the market?

## Phase 18 — Board, Objectives, And Run Failure

Goal: create real stakes.

Possible scope:

- define season objectives;
- track board confidence;
- add basic sacking conditions;
- add basic bankruptcy or financial failure condition if economy supports it;
- record completed or failed run outcome in a minimal archive structure.

Do not include:

- full president persona;
- event-card system;
- media interaction;
- cross-run career profile unless explicitly promoted.

Phase gate question:

- Can the run now be lost for sporting or financial reasons?

## Phase 19 — Multi-Division And Promotion/Relegation

Goal: make "the climb" mechanically real.

Possible scope:

- add at least two connected fake divisions;
- move clubs between divisions at season end;
- generate next-season calendars after promotion/relegation;
- preserve club state across seasons;
- show category changes in CLI.

Do not include:

- five countries;
- cups;
- playoffs unless needed for the chosen division model;
- continental competitions.

Phase gate question:

- Can the user's club climb or fall between divisions across seasons?

## Phase 20 — Player Growth And Aging V1

Goal: make multi-season squad building matter.

Possible scope:

- add age and growth profile usage if not already sufficient in domain;
- apply monthly or season-end growth;
- apply aging/decline;
- use minutes or appearances as a growth input if available;
- expose before/after player development in CLI.

Do not include:

- youth intake;
- training facilities;
- staff modifiers;
- loans;
- complex potential scouting.

Phase gate question:

- Do young and old players create meaningful long-term roster decisions?

## Beyond Phase 20 — Scouting And Fog Minimum

Goal: make player information imperfect.

Possible scope:

- add scouting knowledge state;
- expose visible ability ranges instead of true values for unknown players;
- add a simple observe-player action;
- make market decisions optionally depend on knowledge;
- keep true values available only for tests/debug.

Do not include:

- full staff system;
- scout travel regions;
- opponent reports;
- deep fog UI.

Phase gate question:

- Does imperfect information make recruitment more interesting without becoming tedious?

## Later Candidate — Match Day Session CLI

Goal: create a resumable, interactive match driver over the same match engine.

Possible scope:

- add `MatchSession`;
- step through a match with auto-pause conditions;
- expose live score, ticker events, and live stats;
- allow manual tactical commands using the Phase 09 model;
- serialize enough state to resume a match if required by the step.

Do not include:

- React match UI;
- substitutions unless explicitly scoped;
- team talks unless tactical commands are already stable;
- full commentary prose.

Phase gate question:

- Is watching and stepping through a match more tense than only seeing final output?

## Later Candidate — UI Contract And Selectors

Goal: prepare the browser app boundary without building a full UI too early.

Possible scope:

- define engine selectors for squad, table, calendar, fixture, tactic, and finance views;
- define command/query boundary for future UI and worker calls;
- create snapshot types that avoid exposing full mutable `GameState`;
- document worker/runtime responsibilities.

Do not include:

- React screens beyond test harnesses if not needed;
- styling system;
- SQLite;
- Tauri.

Phase gate question:

- Is the engine ready to be driven by a UI without leaking internals or duplicating logic?

## Strategic Reading

Phases 07-09 made match output player-readable and tactically controllable from CLI.

Phases 10-12 made manager choices around fitness, lineup, formation, and squad shape meaningful before persistence.

Phases 13-16 should protect presentation quality with localization, then make squad planning, market action, and youth options meaningful.

Phases 17-20 should add run failure, promotion/relegation, growth, and imperfect information.

UI and match-day session work should come only after the gameplay loop is already worth presenting. A Web Shell MVP should come after the core manager loop unless the roadmap is explicitly revised.

This roadmap should be revised after every completed phase. It is better to rework a weak phase than to add a new system on top of it.

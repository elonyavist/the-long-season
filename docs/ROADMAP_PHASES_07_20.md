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

The next broad objective is to turn the simulator into a rough but playable manager game before investing in UI, SQLite, Tauri, localization, or launch work. Phase 12 deliberately pauses career persistence work to consolidate the tactical/squad core: formations, squad depth, positional fit, and the squad-building needs that will later drive the market.

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
- report formation fit, missing positions, weak depth, surplus groups, and future market-need hints;
- expose CLI inspection that shows whether a squad fits `4-4-2`, `4-3-3`, `3-5-2`, `3-4-3`, narrow shapes, and other catalog formations.

Do not include:

- transfer execution;
- contracts, agents, wages, scouting, staff, youth, UI, persistence, or career saves;
- automatic best-XI selection;
- free-form formation editor;
- tactical familiarity, form, morale, injuries, or substitutions.

Phase gate question:

- Does changing formation expose believable squad gaps and future recruitment needs?

## Phase 13 — Career Loop CLI MVP

Goal: turn one-off season simulation into a rough playable run.

Possible scope:

- start a new career with one selected club;
- persist current date, current season, fixtures, table source data, and club context;
- add `continue` or `advance` behavior;
- expose next fixture, current table, recent results, squad fit, and season summary;
- simulate one matchday at a time;
- end a season and start the next one in a minimal deterministic way.

Do not include:

- UI;
- SQLite;
- full market;
- economy beyond what is explicitly documented for the phase;
- promotion/relegation beyond what is explicitly documented for the phase;
- long-term career profile.

Phase gate question:

- Can someone play through a rough season from CLI while making explicit lineup/formation decisions?

## Phase 14 — Mature JSON Run Persistence

Goal: make the CLI career loop saveable and reloadable.

Possible scope:

- formalize the run save shape;
- use the existing `GameStorage` boundary more completely;
- add save/load/list/delete CLI commands for career saves;
- add minimal save schema migration tests;
- keep JSON storage as the only implementation.

Do not include:

- SQLite, OPFS, IndexedDB, or Tauri filesystem APIs;
- web save browser;
- cloud saves;
- full compatibility policy beyond the current major prototype.

Phase gate question:

- Can a run be saved, closed, loaded, and continued deterministically?

## Phase 15 — Contracts And Economy Base

Goal: make the club financially real enough for the "poverty as design" pillar to start existing.

Possible scope:

- add player contracts with wage, expiry, and basic status;
- add club balance and wage budget;
- apply simple monthly wages;
- add basic matchday revenue;
- add simple sponsor income;
- expose finance summary from CLI.

Do not include:

- advanced clauses;
- agent negotiations;
- transfer installments;
- facilities;
- financial crisis full cascade unless split into a later step.

Phase gate question:

- Does the player have to think about money before making squad decisions?

## Phase 16 — Minimal Market

Goal: allow basic squad change driven by squad/formation needs.

Possible scope:

- create a free-agent pool;
- allow simple signings with wage cost;
- allow simple cash transfers;
- add transfer windows;
- create minimal AI acceptance rules;
- add deterministic market CLI commands.
- use Phase 12 squad-fit reports to explain why a transfer is useful, without auto-buying players.

Do not include:

- loans;
- sell-on clauses;
- agent personas;
- deadline day;
- player exchange anti-exploit beyond a minimal guard;
- scouting-driven perceived value unless Phase 18 is pulled earlier.

Phase gate question:

- Can the user improve a weak squad with limited money, and does every deal feel like a trade-off?

## Phase 17 — Board, Objectives, And Run Failure

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

## Phase 18 — Multi-Division And Promotion/Relegation

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

## Phase 19 — Player Growth And Aging V1

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

## Phase 20 — Scouting And Fog Minimum

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

Phases 10-12 should make manager choices around fitness, lineup, formation, and squad shape meaningful before persistence.

Phases 13-16 should make the prototype playable, persistent, and economically risky.

Phases 17-20 should add run failure, promotion/relegation, growth, and imperfect information.

UI and match-day session work should come only after the gameplay loop is already worth presenting. A Web Shell MVP should come after the core manager loop unless the roadmap is explicitly revised.

This roadmap should be revised after every completed phase. It is better to rework a weak phase than to add a new system on top of it.

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

Phases 00-06 established:

- deterministic foundation and package boundaries;
- aggregate match simulation;
- season simulation and league table;
- balance calibration;
- player-visible goals, assists, saves, shots, and fixture inspection;
- CLI output good enough to inspect one season and one fixture.

The project is still not a playable career. It is a deterministic football simulation core with useful CLI inspection.

The next broad objective is to turn the simulator into a rough but playable career loop before investing in UI, SQLite, Tauri, localization, or launch work.

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

## Phase 09 — Player Dynamic States

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

## Phase 10 — Career Loop CLI MVP

Goal: turn one-off season simulation into a rough playable run.

Possible scope:

- start a new career with one selected club;
- persist current date, current season, fixtures, table source data, and club context;
- add `continue` or `advance` behavior;
- expose next fixture, current table, recent results, and season summary;
- simulate one matchday at a time;
- end a season and start the next one in a minimal deterministic way.

Do not include:

- UI;
- SQLite;
- market;
- economy;
- promotion/relegation beyond what is explicitly documented for the phase;
- long-term career profile.

Phase gate question:

- Can someone play through a rough season from CLI without using only batch simulation?

## Phase 11 — Mature JSON Run Persistence

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

## Phase 12 — Contracts And Economy Base

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

## Phase 13 — Minimal Market

Goal: allow basic squad change.

Possible scope:

- create a free-agent pool;
- allow simple signings with wage cost;
- allow simple cash transfers;
- add transfer windows;
- create minimal AI acceptance rules;
- add deterministic market CLI commands.

Do not include:

- loans;
- sell-on clauses;
- agent personas;
- deadline day;
- player exchange anti-exploit beyond a minimal guard;
- scouting-driven perceived value unless Phase 17 is pulled earlier.

Phase gate question:

- Can the user improve a weak squad with limited money, and does every deal feel like a trade-off?

## Phase 14 — Board, Objectives, And Run Failure

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

## Phase 15 — Multi-Division And Promotion/Relegation

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

## Phase 16 — Player Growth And Aging V1

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

## Phase 17 — Scouting And Fog Minimum

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

## Phase 18 — Match Day Session CLI

Goal: create a resumable, interactive match driver over the same match engine.

Possible scope:

- add `MatchSession`;
- step through a match with auto-pause conditions;
- expose live score, ticker events, and live stats;
- allow a minimal tactical command if Phase 08 supports it;
- serialize enough state to resume a match if required by the step.

Do not include:

- React match UI;
- substitutions unless explicitly scoped;
- team talks unless tactical commands are already stable;
- full commentary prose.

Phase gate question:

- Is watching and stepping through a match more tense than only seeing final output?

## Phase 19 — UI Contract And Selectors

Goal: prepare the browser app boundary without building a full UI too early.

Possible scope:

- define engine selectors for squad, table, calendar, fixture, and finance views;
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

## Phase 20 — Web Shell MVP

Goal: create the first rough browser shell around an already playable loop.

Possible scope:

- create `apps/web` with React and Vite;
- add simple navigation tabs;
- display squad, table, calendar, and fixture detail from selectors;
- add a `Continue` action;
- keep styling minimal but consistent with the retro direction;
- keep data in memory or JSON-backed development flow unless the active step explicitly adds persistence.

Do not include:

- full premium art pass;
- SQLite/OPFS unless Phase 20 is explicitly re-scoped after review;
- Tauri;
- localization packs;
- modding editor;
- store/demo work.

Phase gate question:

- Does the same playable loop become clearer and more engaging when viewed through a minimal UI?

## Strategic Reading

Phases 07-10 should make the CLI prototype playable.

Phases 11-15 should make the prototype persistent, risky, and recognizable as a climb.

Phases 16-18 should add long-term attachment and match-day tension.

Phases 19-20 should move to UI only after the gameplay loop is already worth presenting.

This roadmap should be revised after every completed phase. It is better to rework a weak phase than to add a new system on top of it.

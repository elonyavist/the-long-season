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

## Phase 16 — Career Systems Dependency Map

Goal: map the dependencies between market, career state, economy, calendar, scouting, youth, and persistence before implementing the next feature phase.

Possible scope:

- review `docs/market-roadmap/` against the current project state;
- identify shared career-state seams needed by market, youth, economy, calendar, and persistence;
- identify budget/economy dependencies before transfers, wages, and installments;
- identify calendar/season-transition dependencies before loans, windows, registration, and contracts;
- identify scouting/youth/market overlap around visible player data, potential, development, and loans;
- produce `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`;
- decide the next real implementation phase.

Do not include:

- market implementation;
- youth implementation;
- persistence changes;
- economy, contracts, wages, loans, scouting, UI, or source refactors;
- converting the full market roadmap into `docs/steps/`.

Phase gate question:

- Can we name the next implementation phase without accidentally building market on missing shared career systems?

## Phase 17 Candidate — Market MVP Permanent Transfers

Goal: create the first manual transfer-market loop.

Possible scope:

- define market state, transfer intent, transfer feasibility, player valuation, and club budget contracts;
- create a deterministic market/player pool;
- validate permanent transfers through buying-club capacity, selling-side availability, and player willingness;
- prevent unrealistic moves such as a first-division star striker accepting a normal third-division destination;
- expose CLI market list/inspect and transfer preview/apply demo;
- show updated squad and formation fit after a valid operation.

Do not include:

- loans, contracts, wages, installments, player exchanges, AI bids, scouting fog, transfer windows, or career persistence;
- automatic signings, hidden best-buy suggestions, or squad-needs recommendations.

Phase gate question:

- Can the manager manually change the squad through a believable permanent transfer while the game explains affordability, seller acceptance, and player willingness?

## Phase 18 Candidate — Career State And Transfer Persistence

Goal: make market actions persist in a career state.

Possible scope:

- define minimal career state or a documented career slice over current game state;
- persist squads, budgets, market-modified player ownership, and transfer history;
- save/load a market-modified demo career;
- inspect changed squad, changed budget, and transfer history after reload.

Do not include:

- loans, contracts, wages, future financial commitments, AI market behavior, transfer windows, or full UI.

Phase gate question:

- Can a transfer change persist and be inspected later without recomputing or losing deterministic market state?

## Phase 19 Candidate — Loans MVP

Goal: add simple manual loans, especially for young players and lower-division squad building.

Possible scope:

- add `TransferKind: "loan"`;
- model owner club and temporary club;
- validate player and parent-club willingness;
- make young/fringe players more open to lower-division minutes;
- return players to owner club at loan end;
- expose CLI loan preview/apply inspection.

Do not include:

- buy options, buy obligations, recall clauses, loan penalties, wage-share detail, or automatic loan placement.

Phase gate question:

- Can a young first-division player plausibly accept a lower-division loan while a star senior player rejects an unrealistic loan destination?

## Phase 20 Candidate — Contracts And Wages

Goal: add the first economic layer that makes player willingness and squad building more realistic.

Possible scope:

- add wage, contract length/end, and owning-club contract data;
- separate wage budget from transfer budget;
- validate wage affordability;
- let player willingness consider wage, sporting level, role/minutes, age, and ambition;
- expose accepted/rejected transfer cases with structured reasons.

Do not include:

- bonuses, agent fees, release clauses, sell-on clauses, appearance/goal bonuses, or deep negotiation.

Phase gate question:

- Can a transfer fail for wage reasons even when the fee is affordable, and can player willingness feel credible without becoming too complex?

## Beyond Phase 20 Candidate — Scouting And Information Quality

Goal: make market information imperfect without making recruitment tedious.

Possible scope:

- add scouting knowledge for market players;
- expose visible ability/potential ranges instead of exact values for unknown players;
- add scouting confidence levels;
- add a deterministic observe-player action;
- keep true values testable while presentation uses visible ranges.

Do not include:

- full staff networks, geographic scout assignments, opponent reports, deep scouting UI, or hidden non-seeded randomness.

Phase gate question:

- Can the manager make recruitment decisions with partial information while deterministic tests still verify true values?

## Later Candidate — Market Roadmap Continuation

The detailed market roadmap lives in `docs/market-roadmap/`.

Planned market continuation, if the dependency map confirms this order:

- Phase 21: AI club market behavior.
- Phase 22: negotiation v1.
- Phase 23: transfer windows and registration.
- Phase 24: structured transfer deals with only one-player exchange and simple installments.
- Phase 25: market balance and economy review.

Explicitly removed from the near-term market plan:

- sell-on percentages;
- appearance/goal bonuses;
- complex loan buy options or obligations;
- multiple-player exchanges;
- highly legalistic clauses.

Youth/prospects, board/run failure, promotion/relegation, and player growth should be reconsidered after the first market arc is stable enough to support long-term career play.

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

Phases 13-15 protected presentation quality and cleaned the core before career systems.

Phase 16 should prevent false linearity by mapping shared career-system dependencies before the first market implementation.

After Phase 16, the project should either build market MVP or insert a shared foundation phase first, depending on `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`.

Youth/prospects should come after the first market arc is stable, because youth loans, promotion to senior squads, and development all depend on the market/career state being coherent.

UI and match-day session work should come only after the gameplay loop is already worth presenting. A Web Shell MVP should come after the core manager loop unless the roadmap is explicitly revised.

This roadmap should be revised after every completed phase. It is better to rework a weak phase than to add a new system on top of it.

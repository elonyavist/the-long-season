# Career Web Section Roadmap

Date: 2026-06-23
Current baseline: Phase 51 complete.

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

### Phase 53 - Inbox/Posta Decision Center

Primary dependency: Phase 52 or at least one resolvable attention event.

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

### Phase 54 - Squad Screen

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

### Phase 55 - Tactics Screen

Primary dependency: Phase 52 basic tactic saving.

Purpose:

- Let the user choose how the team plays, not just which players start.

Minimum useful scope:

- Formation selection.
- Mentality.
- pressing/directness/width/risk.
- saved tactic profiles.
- clear compatibility warnings as factual information, not advice.

Engine/read-model dependencies:

- existing tactic contracts;
- formation catalog;
- position suitability.

What must not happen:

- No automatic tactic switching.
- No "best tactic" button.
- No opaque bonuses.

### Phase 56 - Calendar And Fixtures

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

### Phase 57 - Matchday Flow

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

### Phase 58 - Market UI MVP

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

### Phase 59 - Finances Foundation

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

### Phase 60 - Youth UI

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

### Phase 61 - Staff Foundation

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

### Phase 62 - Archive And History

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

### Phase 63 - Main Dashboard Rework

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
2. Phase 53 - Inbox/Posta Decision Center
3. Phase 54 - Squad Screen
4. Phase 55 - Tactics Screen
5. Phase 56 - Calendar And Fixtures
6. Phase 57 - Matchday Flow
7. Phase 58 - Market UI MVP
8. Phase 59 - Finances Foundation
9. Phase 60 - Youth UI
10. Phase 61 - Staff Foundation
11. Phase 62 - Archive And History
12. Phase 63 - Main Dashboard Rework

This order is intentionally linear:

- Match preparation resolves the current blocker.
- Inbox becomes valuable once there are real decisions.
- Squad and tactics are needed before matchday feels like a user choice.
- Calendar/fixtures make Continue understandable.
- Matchday closes the first loop.
- Market, finances, youth, and staff become meaningful after the core loop is
  playable.
- Archive becomes valuable after there is history worth preserving.
- Dashboard should be reworked last, after it knows what real sections exist.

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

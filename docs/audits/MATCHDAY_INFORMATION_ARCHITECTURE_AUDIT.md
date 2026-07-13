# Matchday Information Architecture Audit

Date: 2026-07-07
Phase: `70-web-matchday-information-architecture-and-live-flow-rework`
Step: `01-current-matchday-information-architecture-audit`

## Purpose

This audit converts the product review into a concrete matchday information
architecture contract before changing React, CSS, engine, or localization code.

The current matchday is technically connected to structured facts, but the
screen still feels like a report console: score, action, phase, context,
timeline, highlights, ratings, and consequences compete for attention instead
of forming a football match flow.

The goal of Phase 70 is not to hide data. The goal is to make the match feel
like the emotional payoff of preparation by showing the right facts at the
right moment.

## Current Problems

### 1. The screen has too many simultaneous jobs

The current match centre tries to be:

- a scoreboard;
- a command panel;
- a phase navigator;
- a fixture context strip;
- a live event feed;
- a highlights panel;
- a player ratings table;
- a half-time tactical workspace;
- a full-time consequences report.

Those are valid facts, but not valid all at once. The result is a scattered
screen where the manager has to work out what matters.

### 2. Debug-like labels leak into the user experience

Labels such as `Live line`, `Next command`, raw `Period`, raw `Minute`, and
`Next stop` are useful developer vocabulary but weak football vocabulary. They
make the match feel like a state-machine report rather than a football event.

The UI should translate these facts into football-facing hierarchy:

- score and phase;
- match story;
- manager action;
- player signals;
- post-match consequences.

### 3. Phase indicators look like controls

The existing phase rail is large and button-like. Product direction is that
phase labels are visual progress indicators only. They should reassure the
manager where they are in the match, not invite clicks.

### 4. Events are split into competing panels

`timelineEvents` and `keyEventCards` currently appear as separate surfaces in
some phases. That creates duplication and makes goals compete with misses,
saves, and other lower-priority events.

Phase 70 should use one event hierarchy:

- goals are the dominant tabellino items;
- penalties, cards, injuries, and substitutions appear only if real structured
  facts exist;
- saves, misses, blocks, and errors can support live tension, but should be
  visually quieter than goals;
- no empty event panel is shown when no event exists.

### 5. Full time starts with report metrics instead of tabellino

Full time currently summarizes final score, key-event count, player-row count,
and next stop before the football story. That is backwards for the user.

Full time must start with:

1. final score and result state;
2. tabellino;
3. player ratings;
4. consequences;
5. one clear return to dashboard action.

### 6. The tactical board appears in the right idea but needs strict ownership

The tactical board is the approved visual anchor, but matchday should not turn
every phase into a tactical editor.

The tactical board belongs only to decision phases where the manager can
actually change something:

- half-time: editable board and bench decisions are in scope;
- pre-match matchday screen: no tactical editing, only confirmation;
- first half and second half live screens: no tactical board unless a future
  pause/decision phase explicitly allows it;
- full time: no tactical board.

## Structured Facts Available Today

The current code already provides enough structured data for the rework:

- `CareerMatchdayPhaseView.phase` for the five match phases.
- `scoreboard.homeGoals`, `scoreboard.awayGoals`, and selected-club score
  state for score hierarchy.
- `fixture` facts: home club, away club, round, selected side.
- `timelineEvents` with minute, kind, club, player, optional secondary player,
  and `cardPriority`.
- `keyEventCards`, currently derived from major events.
- `playerRows` with rating, condition, role, status, goals, assists, shots,
  shots on target, saves, and blocks.
- `conditionChanges` and `playerStateChanges`, already hidden before full time
  by the UI read model.
- `actions`, one per phase in the current phase read model.
- Half-time tactical board draft, bench slots, and substitution facts.

These facts should be recomposed. They do not require fake engine events or
browser persistence.

## Missing Or Not Yet Supported Facts

The tabellino contract can mention these categories, but the UI must render them
only when real structured facts exist:

- penalties;
- yellow/red cards;
- injuries;
- substitutions outside the already-supported half-time substitution facts;
- extra time;
- penalty shootout.

No placeholder row should be created just to make the layout look complete.

## Target Phase Contract

| Phase | Single job | Primary action | Main facts | Must not show |
|---|---|---|---|---|
| Pre-match | Confirm the prepared fixture and start. | Start match. | Teams, score 0-0, round, readiness if relevant. | Tactical board, empty timeline, player stats, consequences, debug context strip. |
| First half | Follow the first-half story. | Continue to half-time. | Score, minute/progress, live event hierarchy, player signals only when useful. | Tactical board, full-time ratings table, consequences, raw context diagnostics. |
| Half-time | Make manager decisions before restart. | Start second half. | Score at 45, first-half tabellino, provisional ratings/condition, editable tactical board and bench. | Full-time consequences, generic report panels, fake advice, opponent board. |
| Second half | Follow the second-half pressure. | Continue to full time. | Score, minute/progress, live event hierarchy, late pressure signals. | Tactical board, full-time consequences, duplicated first-half panels. |
| Full time | Review result and return to career. | Return to dashboard. | Final score, tabellino first, player ratings second, consequences after. | Generic `Continue` ambiguity, raw next-stop diagnostics, empty event/stat panels. |

## Information To Remove

- `Live line` label as a visible heading.
- `Next command` label as a visible heading.
- Large button-like phase tabs.
- Raw context strip rows for period/minute/venue when those facts already exist
  in the compact header.
- Full-time fact cards such as player-row count or next-stop diagnostic.
- Empty `Key events`, `Highlights`, or `Player stats` panels.
- Full-time consequences outside full time.
- Any display that makes `fixture:000003`, raw save IDs, or technical route
  names feel like primary match content.

## Information To Merge

- Fixture round, teams, selected side, and current minute should merge into a
  compact score header.
- Timeline and key events should merge into one event hierarchy/tabellino
  surface.
- Phase and primary action should sit in one compact match-flow header, not in
  separate competing panels.
- Full-time result and result state should be part of the score/header area,
  while detailed consequences move below ratings.

## Information To Demote

- Misses, saves, blocks, and errors should support live texture but not compete
  visually with goals.
- Round and venue are secondary context, not the centre of the page.
- Player contribution details belong in the rating rows/cards, not in a giant
  first-viewport table.
- Consequences are important after the match but should not interrupt live
  match phases.

## Design Rules For The Rework

1. One phase, one job, one primary action.
2. Show football hierarchy before technical state.
3. Render only facts that exist.
4. Goals lead the tabellino visually.
5. Phase indicators are progress markers, not navigation buttons.
6. The half-time tactical board is the only editable tactical surface in this
   phase.
7. Full time starts with tabellino and ratings, not consequence diagnostics.
8. The manager should need fewer decisions, not more, to understand what to do.

## Step 01 Decision

Proceed to Step 02 by defining the event priority and view-model contract before
rewriting the React layout. The screen has enough structured facts today; the
next risk is presentation hierarchy, not engine truth.

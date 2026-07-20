# Phase 77 - Live Match Control, Statistics And In-Game Decisions

## Status

Complete. Steps 01-10 and all phase-level gates pass.

## Goal

Turn the former staged Matchday into a real live football-management loop:
the same deterministic engine advances one minute at a time, publishes causal
statistics and meaningful player signals, pauses for real manager decisions,
accepts substitutions and tactical changes, and finishes with durable career
consequences.

## User-Facing Outcome

- The match clock progresses through first half, half time, second half, and
  full time without precomputing the whole half.
- The manager can use `1x`, `2x`, or `4x`, pause after the current minute, and
  make substitutions or tactical changes while play is stopped.
- Mandatory injuries, optional injury decisions, selected-club red cards, and
  half time stop the match automatically when the manager must act.
- `Partita` presents the score, current commentary, cumulative tabellino, and a
  compact possession/shots/xG comparison.
- `Statistiche` presents real comparative match facts: possession, shots,
  shots on target, xG, corners, fouls, yellow cards, red cards, saves, and
  goals.
- `Tattica` reuses the approved tactical board. Dragging between the XI and
  bench creates a pending substitution; moving starters changes their tactical
  assignment; moving outside a natural role zone explains the adaptation.
- Live ratings and condition react to structured facts rather than cosmetic
  random updates.
- The opponent makes deterministic substitutions and tactical changes under
  the same football constraints.
- Full time consolidates the result, ratings, condition, injuries,
  suspensions, morale, and form before one `Continua` command returns to the
  Dashboard.

## Entry Gate

1. Phase 76 is complete and its web motion, reduced-motion, accessibility, and
   product gates pass.
2. Phase 75 is complete and its player lifecycle gate passes.
3. The current tactical board remains the only pitch/bench implementation.
4. The current career session persists through SQLite/OPFS and retains manual
   or 7/15-day save cadence.
5. The phase starts from the deterministic match engine, career fixture flow,
   and structured match events; it does not introduce a second simulator.

## Locked Product Decisions

### Match session and time

- The engine advances exactly one minute at a time from the current state.
- Choices made at minute `N` affect minute `N + 1` onward only.
- Match phases are `pre_match`, `first_half`, `half_time`, `second_half`, and
  `full_time`.
- Extra time, penalties, cup substitutions, concussion substitutes, and cup
  branches remain absent until a real playable competition needs them.
- Playback speed changes presentation cadence only. It never skips facts,
  changes RNG use, or changes the result.
- Manual pause is unlimited and becomes effective at the end of the current
  minute.

### Recovery and persistence

- Live in-progress match state is memory-only.
- No per-minute, per-event, or pause-time storage writes are allowed.
- A refresh or crash returns to the last explicit/autosave boundary; an
  unfinished match starts again from minute zero, matching the current product
  save policy.
- Match commands become durable career facts only when the completed fixture
  is committed.

### Automatic pauses and narrative holds

- Automatic decision pauses exist for an injury that requires substitution, a
  selected-club red card (including a second yellow), and half time. Knocks and
  minor injuries remain visible facts but do not interrupt play; the manager
  may pause manually.
- Only a penalty award, the suspense before its structured outcome, and a goal
  receive a bounded narrative hold. They resume automatically because no
  manager decision is required.
- Ordinary shots, saves, fouls, yellow cards, and other non-blocking incidents
  never interrupt or slow the minute-by-minute story.
- A goal receives a small distinctive animation and a hold of about two
  seconds, not a blocking celebration sequence.
- Red-card and injury presentation is brief; the decision pause has no timeout.

### Manager commands

- While the clock runs, the tactical board is view-only.
- While paused, the manager may substitute players, exchange starter slots,
  change formation, change roles/positions, and change the existing pressing,
  risk, width, and directness instructions.
- Pending changes are reversible before application.
- With no pending changes, the primary action is `Riprendi partita`.
- With pending changes, the primary action is `Applica e riprendi` and the
  secondary action is `Annulla modifiche`.
- Applied changes affect the current match only and do not overwrite the saved
  default tactic for future fixtures.

### Substitution and dismissal rules

- The current playable league allows at most five substitutions.
- Substitution windows are deliberately not limited in this product slice;
  pauses remain unlimited.
- A substituted player cannot re-enter.
- Dragging a bench player onto a starter, or a starter onto a bench player,
  creates a pending substitution.
- The outgoing player occupies the incoming player's bench slot and is shown
  disabled with a clear unavailable label.
- A dismissed player moves to a compact `Fuori` area and can never be replaced
  to restore eleven players.
- A forced injury with no legal substitute leaves the club with ten players.
- Goalkeepers stay fixed to goalkeeper role/area but remain replaceable.

### Tactical adaptation

- A non-goalkeeper may be dragged outside the current role zone while paused.
- Natural destinations are green, credible adaptations amber, and strongly
  unsuitable destinations red; text and role labels always accompany color.
- Dropping in another role zone opens a compact anchored popover above the
  player with sensible roles, suitability, and consequence.
- Confirming changes slot/role and engine suitability; cancelling, clicking
  outside, or pressing Escape restores the previous position.
- A strong adaptable player may outperform a mediocre specialist. A truly
  unsuitable assignment receives a coherent engine penalty.

### Statistics, ratings, and football causality

- Every visible statistic is derived from the engine state and structured
  events at the current minute. No cosmetic values are permitted.
- Possession is derived per minute from midfield quality, instructions, score,
  condition, and numerical advantage. It affects control and chance creation,
  not shot conversion.
- xG comes from actual chance quality. Pass completion and offsides remain out
  of scope because there is no credible pass or defensive-line model yet.
- Fouls and cards use current tackling, composure, determination, fatigue,
  pressing/risk, and action/zone danger. No new aggression or discipline
  attribute is added in this phase.
- Live ratings change only after meaningful facts such as goals, assists,
  errors, saves, shots, cards, and role-relevant contributions. Final ratings
  consolidate the same calculation.

### Injuries and discipline

- Injuries use four levels: `knock`, `minor`, `moderate`, and `serious`.
- A knock can continue with a temporary penalty.
- A minor injury lets the manager continue or substitute; continuing shows an
  understandable risk signal and applies deterministic condition/performance
  cost plus aggravation risk.
- Moderate and serious injuries force the player off.
- Injury duration and return date are deterministic and use the existing
  physical/fragility model.
- Red cards and double yellows produce durable suspension consequences.
- Yellow accumulation and thresholds belong to competition rules, not web
  code.
- Suspended or injured-unavailable players cannot be selected for the next
  fixture, and important diagnoses/suspensions create structured Posta items.

### Matchday information architecture

- Live tabs are `Partita`, `Statistiche`, and `Tattica`.
- An injury or selected-club red-card decision opens `Tattica` automatically.
- `Partita` keeps score, one current commentary line, cumulative tabellino, and
  compact possession/shots/xG comparison visible.
- The tabellino retains first-half incidents during the second half and shows
  only goals, penalties, cards, injuries, and substitutions in chronological
  two-team columns.
- Goals receive the strongest hierarchy. Other incidents are quieter and use
  specific colored icons plus text.
- `Statistiche` uses comparative bars rather than a wide table.
- Full-time tabs are `Riepilogo`, `La tua squadra`, and `Avversario`.
- Selected-club consequences are integrated into its team tab. Opponent detail
  exposes only observable/public facts, never hidden morale.

### Motion and accessibility

- Motion uses the Phase 76 web-only semantic system and never drives engine
  progression, commands, storage, or correctness.
- Ordinary commentary is quick, important events are readable, and decisions
  remain stopped until explicit user input.
- Reduced motion preserves the same facts, holds, command availability, and
  destinations without decorative transforms.
- Every drag/drop workflow has click/tap and keyboard alternatives.
- Color is never the only indication of role suitability, card type, injury,
  availability, rating, or state.

## Ordered Steps

1. [01-live-match-domain-contract-and-competition-rules.md](01-live-match-domain-contract-and-competition-rules.md) - Done
2. [02-progressive-minute-engine-and-match-session-state.md](02-progressive-minute-engine-and-match-session-state.md) - Done
3. [03-causal-team-statistics-and-live-rating-projection.md](03-causal-team-statistics-and-live-rating-projection.md) - Done
4. [04-fouls-cards-injuries-and-disciplinary-lifecycle.md](04-fouls-cards-injuries-and-disciplinary-lifecycle.md) - Done
5. [05-deterministic-ai-in-game-decisions.md](05-deterministic-ai-in-game-decisions.md) - Done
6. [06-web-live-pause-command-and-session-orchestration.md](06-web-live-pause-command-and-session-orchestration.md) - Done
7. [07-match-and-statistics-broadcast-tabs.md](07-match-and-statistics-broadcast-tabs.md) - Done
8. [08-shared-live-tactical-board-drag-drop-and-substitutions.md](08-shared-live-tactical-board-drag-drop-and-substitutions.md) - Done
9. [09-full-time-team-review-and-career-consequences.md](09-full-time-team-review-and-career-consequences.md) - Done
10. [10-motion-accessibility-long-run-gate-cleanup-and-phase-report.md](10-motion-accessibility-long-run-gate-cleanup-and-phase-report.md) - Done

## Phase-Level Checks

Run with Node 24:

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/ui run test
pnpm --filter @game/storage run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

The final engine gate must run 50 deterministic worlds for one complete season
and report possession, shots, xG, fouls, cards, injuries, and substitutions,
including same-seed reproducibility and structural invariants.

## Phase-Level Visual Evidence

The final report must include manually inspected desktop, narrow, keyboard,
touch, 200%-text, and reduced-motion evidence for:

- pre-match to live first half;
- `1x`, `2x`, `4x`, manual pause, and resume;
- cumulative first/second-half tabellino;
- ordinary, important, goal, penalty, card, and injury presentation;
- `Partita`, `Statistiche`, and `Tattica` tabs;
- injury and red-card automatic decision pauses;
- drag/drop and accessible substitution fallback;
- formation, role, and team-instruction changes;
- disabled outgoing player and `Fuori` area;
- half-time decisions;
- full-time tabs and `Continua` return to Dashboard;
- refresh during a match returning safely to the last save boundary.

## What NOT To Implement

- No second match simulator, precomputed hidden half, cosmetic statistics, or
  UI-owned football rules.
- No per-minute persistence, live checkpoint recovery, autosave cadence change,
  or new save button behavior.
- No extra time, penalty shootout, cup branch, substitution-window rule,
  concussion substitute, VAR, pass network, offsides, weather, 2D/3D viewer,
  audio, crowd simulation, or new player aggression/discipline attribute.
- No separate tactical board, bench, role catalog, suitability calculation, or
  drag system.
- No runtime LLM or generated prose in engine/domain state.
- No infinite event log, wide statistics table, hidden opponent morale, or
  decorative animation layer.
- No dormant command, event type, UI tab, config field, helper, compatibility
  reader, or future-competition branch.
- Do not start Squad, Market, Finance, Youth, Staff, Archive, or the next phase.

## Definition Of Done

- One deterministic minute engine powers batch simulation and the interactive
  Matchday session.
- Manager and AI decisions affect only future minutes and obey the documented
  competition/substitution constraints.
- All live and final statistics, ratings, events, injuries, cards, and
  consequences derive from structured facts with tested ownership.
- The approved board supports live tactical decisions with drag/drop and an
  equivalent accessible workflow.
- Matchday is understandable at every phase, has one clear primary command,
  uses bounded football-specific Motion, and remains stable at desktop/narrow
  widths and 200% text.
- The 50-world one-season gate, package tests, typechecks, build, Playwright,
  dependency rules, full `pnpm check`, diff check, and Graphify update pass.
- Dead superseded staged/half-time-only paths are removed after all callers
  move to the canonical session.
- The final report records distributions, anomalies, visual evidence, removed
  code, residual risks, and exactly one next-phase recommendation.

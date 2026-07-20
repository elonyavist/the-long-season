# Live Match Control Report

Date: 2026-07-20  
Phase: `77-live-match-control-statistics-and-in-game-decisions`  
Status: Complete. Steps 01-10 and the final release gates pass.

## Product Rule

The live match is one deterministic football simulation, not a browser effect.
The engine will advance one minute at a time; React will only decide when to
request the next minute and how to present structured facts. Manual commands
accepted after minute `N` can affect minute `N + 1` onward, never facts already
emitted.

## Step 01 Contract Baseline

The domain now defines:

- `LiveMatchPhase`: exactly `pre_match`, `first_half`, `half_time`,
  `second_half`, and `full_time`;
- a memory-only `LiveMatchSession` snapshot with phase, minute, run state,
  pause reason, pending decision, score, cumulative statistics, both tactical
  team states, events, and applied substitutions;
- normalized tactical lineup slots, fixed bench slots, unavailable players,
  substitutions used, current formation, and current tactic;
- typed pause, resume, and atomic team-change commands;
- structured rejection facts for wrong phase/state/side, duplicate or
  unavailable players, no re-entry, goalkeeper movement, dismissal, injury,
  substitution mismatch, and maximum substitutions;
- cumulative home/away possession, shots, shots on target, xG, corners, fouls,
  yellows, reds, saves, and goals;
- foul, card, penalty, injury, and substitution event facts containing no
  presentation text;
- four injury severities and the minimum durable injury/suspension consequence
  facts to be resolved in Step 04;
- competition-owned maximum substitutions, substitution-window policy,
  re-entry policy, and yellow accumulation threshold.

The current `Demo Third Division` content owns these rules:

| Rule | Value |
|---|---:|
| Maximum substitutions | `5` |
| Substitution-window limit | `null` (deliberately unlimited) |
| Player re-entry | `false` |
| Yellow accumulation threshold | `5` |

Manual pauses are intentionally not a competition rule and have no counter or
maximum. Repeated pause/resume validation is therefore unlimited by contract.

## Canonical Ownership At Phase Close

| Responsibility | Canonical owner | Removed parallel path |
|---|---|---|
| Minute progression and RNG cursor | `progressive-match-session.ts` | `staged-match-progression.ts` |
| Live score/statistics/condition/rating facts | `live-match-projection.ts` plus the engine simulation state | UI-derived and checkpoint-derived match facts |
| Manager team changes | `live-match-command.ts` validated by `progressive-match-session.ts` | `HalfTimeTacticalDecisionPlan` and `half-time-substitutions.ts` |
| Opponent reactions | `ai-in-game-decisions.ts` | `ai-half-time-substitution.ts` |
| Browser orchestration | private `WebLiveMatchdaySession` in `WebCareerRuntime` | durable `ActiveMatchCheckpoint` and `WebStagedMatchdayProgress` |
| Tactical interaction | the existing shared tactical board | half-time-only selectors or a second Matchday board |
| Full-time career publication | cached completion preview plus one runtime `Continua` | per-minute, per-event, pause-time, and initial-full-time publication |
| Browser durability | SQLite/OPFS schema version `9` for completed career facts only | active-match tables and checkpoint mapping |

`MatchReport`, batch `MatchEvent`, and compact batch statistics remain active
durable/report contracts rather than compatibility leftovers. They are
projected from the same completed engine state and therefore are not a second
simulator.

## Invariants Locked Before Engine Work

- A player appears at most once across XI, bench, and unavailable lists.
- The current XI contains one goalkeeper. The goalkeeper slot, role, and board
  area cannot move; the player may be substituted.
- XI size is between seven and eleven, allowing real dismissals without a fake
  replacement.
- A substituted-out player cannot re-enter under current competition rules.
- Dismissed and injury-unavailable players cannot be selected.
- A team cannot exceed five substitutions; substitution windows are not
  counted.
- Current score equals cumulative goal statistics.
- Recorded possession is either `0/0` before play or totals `1`.
- Shots on target cannot exceed shots.
- Running state is possible only during first or second half with no pending
  decision; every paused state has an explicit reason.
- No live type contains rendered prose, browser timing, persistence policy, or
  future cup phases.

## Step 01 Verification

- Focused domain/content tests: `13/13` pass.
- Domain, content, engine, storage, and web TypeScript callers compile after the
  contract split.
- No engine behavior, storage schema, runtime command, or React surface changed.
- Step 02 is the only next implementation step.

## Step 02 Canonical Minute Session

The engine now owns one `ProgressiveMatchSessionState` around the existing
one-minute `stepMatch` operation. It contains only facts through the latest
completed minute: current phase, pause state and reason, score, cumulative
events and statistics, current team contexts, bench/unavailable facts, and
accepted substitutions. Its RNG cursor remains caller-owned and memory-only.

The same operation now powers:

- `runMatchSimulation`, which requests minutes through full time for batch
  season and CLI callers;
- interactive Matchday, which can request exactly one minute, pause at
  any completed boundary, apply one already-validated grouped team change,
  and resume from the next minute.

The temporary staged career adapter used while callers migrated was deleted in
Step 10; it is not a supported third driver.

Confirmed changes after minute `N` replace only the current team context and
availability facts. Events through `N` remain immutable, and the changed
lineup/tactic is first consumed by minute `N + 1`. Presentation cadence is not
part of engine state: grouping the same one-minute calls as `1x`, `2x`, or
`4x` produces byte-equivalent football facts.

### Step 02 Verification

- Full engine suite: `53` files and `357` tests pass.
- Focused progressive/staged/batch/career suite: `6` files and `41` tests pass.
- Engine and simulation-tools typechecks pass.
- Dependency-cruiser passes with `548` modules and `1,982` dependencies.
- `git diff --check` and `graphify update .` pass.
- No timer, browser import, storage write, speed field, incident policy, or
  future phase was introduced.
- Step 03 is the only next implementation step.

## Step 03 Causal Statistics, Condition, And Ratings

The minute engine now records causal live telemetry alongside the existing
compact batch statistics. Every new simulation starts with this telemetry;
the temporary optional bridge used during migration was removed with the
legacy staged adapter.

### Control And Possession

Each completed minute derives home and away control units from midfield
quality, tactics, score pressure, current on-pitch condition, numerical
advantage, and the existing home factor. Possession is the normalized share of
the accumulated units and remains bounded to prevent impossible domination.
Control modifies only opportunity creation. Shot conversion stays wholly in
the occasion resolver, so a lower-possession counterattacking side can still
win without a hidden result correction.

### Shot And Match Facts

- shots, shots on target, goals, and defending saves advance once per resolved
  occasion;
- xG is the resolver's calibrated conversion probability for that actual shot
  and is accumulated exactly once;
- blocked and high-quality saved shots can produce corners without consuming
  another random value;
- fouls and cards remain honest zero-capable fields until Step 04 emits their
  incidents;
- current score and causal goal totals are asserted to agree in the live
  projection.

The durable report event shape deliberately does not duplicate partial
xG/corner fields. The canonical progressive state carries the complete causal
aggregate and the completed report projects only durable facts at full time.

### Condition And Ratings

Only current on-pitch players spend match-relative condition. Workload reacts
to pressing and risk, with a lower goalkeeper cost, and never mutates career
condition during minute simulation.

`PlayerMatchRatingLedger` is now the single incremental contribution owner for
both provisional and final ratings. It consumes structured goals, assists,
shots, saves, blocks, misses, and chance creation without random per-minute
noise or score-only bonuses. Empty increments preserve the previous rating;
real contributions change it deterministically.

### Step 03 Verification

- Full engine suite: `53` files and `361` tests pass.
- Focused causal statistics/ratings suite: `4` files and `41` tests pass.
- Simulation-tools suite: `7` files and `31` tests pass through the root Vitest
  runner because that package has no standalone `test` script.
- Engine and simulation-tools typechecks pass.
- Dependency-cruiser passes with `551` modules and `1,999` dependencies.
- Fixed-seed tests cover statistical bounds, score/event agreement, condition,
  numerical advantage, stable empty-minute ratings, contribution changes, and
  a deterministic low-possession win.
- Existing fixed-seed gameplay sentinels were intentionally updated after the
  causal control model changed opportunity volume; no target score is encoded
  in production logic.
- Step 04 is the only next implementation step.

## Step 04 Incident And Availability Lifecycle

The minute engine now resolves fouls, penalties, yellow cards, second-yellow
dismissals, direct reds, and four injury severities from structured match
context. Incident probability uses current condition, physical and mental
attributes, tactical intensity, action danger, and pitch zone. Resolution is
deterministic and writes the same event facts consumed by statistics, pauses,
career consequences, and later presentation.

### Match Decisions

- a dismissal removes the player immediately without creating a replacement;
- a knock or minor injury can create a typed continue/substitute decision;
- moderate and serious injuries force the player off and expose a replacement
  opportunity only when a legal substitute remains;
- continuing an affected player changes only later condition/performance and
  aggravation risk;
- numerical advantage is recalculated from the current XI before later
  minutes.

### Durable Consequences

Completed-fixture commit is the single owner of career availability mutation.
It derives bounded injury return dates, competition-scoped red-card and
second-yellow suspensions, yellow-card accumulation, and ban consumption. The
selected club receives structured important Posta messages for diagnoses and
suspensions. Future match preparation and AI selection use these same durable
facts, while an already-played fixture keeps its historically valid saved
preparation.

SQLite schema version `8` stores injuries, suspensions, yellow totals, and the
complete structured incident fields. JSON and SQLite mapping round-trip the
facts without a compatibility reader; the beta reset policy rejects older
SQLite saves instead of carrying dead migration behavior.

### Step 04 Verification

- Domain, engine, and storage test suites pass on Node 24.
- Domain, engine, and storage typechecks pass.
- Dependency-cruiser passes with `558` modules and `2,035` dependencies.
- Focused coverage includes knocks, forced injuries, direct reds, second
  yellows, yellow accumulation, ban consumption, unavailable-player selection,
  Posta production, and JSON/SQLite round trips.
- `git diff --check` and `graphify update .` pass.
- No medical centre, staff system, web presentation, AI reaction, VAR, or live
  match persistence was introduced.
- Step 05 is the only next implementation step.

## Step 05 Deterministic AI Decisions

The opponent now uses one compact in-game decision policy instead of a separate
half-time substitution helper. At explicit stopped-minute boundaries it reads
only structured football facts: forced or minor injury, dismissal, current
condition, provisional rating, score delta, and minute. Forced incidents are
resolved first; tactical opportunism cannot conceal an unresolved injury.

### Shared Command Ownership

- replacements are ranked by canonical position suitability, role current
  ability, current condition, and stable player ID;
- no-reentry, bench eligibility, goalkeeper invariants, and the competition's
  five-substitution maximum are enforced by `validateLiveMatchCommand`;
- complete formation alternatives are supplied by the canonical board owner,
  so the policy never invents a parallel coordinate catalog;
- accepted commands pass through `applyValidatedLiveMatchCommand`, which emits
  structured substitution, formation, role, and tactic-change facts;
- the superseded `ai-half-time-substitution` implementation and tests are
  deleted and have no remaining active reference.

### Step 05 Verification

- Engine suite: `55` files and `370` tests pass on Node 24.
- Simulation-tools suite: `7` files and `31` tests pass.
- Engine typecheck passes.
- Dependency-cruiser passes with `558` modules and `2,034` dependencies.
- Fixed fixtures cover forced injury, dismissal recovery, trailing response,
  lead protection, stable same-state decisions, no material change, and an
  exhausted substitution allowance.
- Step 04 gameplay sentinels now intentionally include deterministic discipline
  events; no production formula was altered while aligning those expectations.
- `git diff --check` passes and Step 06 is the only next implementation step.

## Step 06 Browser Session And Publication Boundary

The web runtime now owns one private, memory-only progressive match session.
React requests the next completed minute and receives only a read-only
projection; it does not own the RNG cursor, command legality, phase truth, or
career mutation. `1x`, `2x`, and `4x` change only request cadence. Manual pause
becomes effective on a completed minute and can be repeated without a limit.

### Interruption Taxonomy

- a penalty award, penalty-outcome suspense, and a goal may receive a bounded
  narrative hold without changing engine state;
- a selected-club red card and an injury that requires substitution create a
  real decision pause with no timeout;
- knocks and minor injuries remain structured visible facts but do not stop
  play automatically;
- ordinary shots, saves, fouls, yellow cards, and other non-blocking facts keep
  the selected playback cadence.

This distinction removes the old minor-injury decision branch rather than
leaving a dormant command. The manager can still pause manually and substitute
after seeing the incident.

### Career Ownership

No minute, event, manual pause, or bounded hold writes storage or reconstructs
Dashboard/Posta presentation. At full time the completed report remains in the
private live session. Only the explicit `Continua` command commits the played
fixture, applies consequences, rebuilds attention/Posta, and publishes the new
career state. Refreshing before that command reloads the last durable boundary
and starts the fixture again from pre-match.

### Step 06 Verification

- Web tests pass: `57` files and `239` tests.
- UI tests pass: `10` files and `59` tests.
- Full Playwright product gate passes: `19/19`, including both halves, manual
  pause/speed, reduced motion, 200% text, refresh behavior, full-time review,
  and a second fixture without a false storage failure.
- Web typecheck and production build pass; the existing chunk-size advisory is
  unchanged.
- Dependency-cruiser passes with `558` modules and `2,032` dependencies.
- `git diff --check` and `graphify update .` pass.
- Step 07 is the only next implementation step.

## Step 07 Broadcast And Statistics Surface

The live browser now reads one presentation-ready projection of cumulative
engine facts. `Partita` owns the dominant score, one replacing commentary line,
the complete two-half tabellino, and compact possession/shots/xG. `Statistiche`
owns the full home/away comparison without a wide table. `Tattica` remains the
single route to the approved tactical workspace.

### Interruption And Publication Guarantees

- penalty award, penalty outcome, and goal are the only bounded narrative
  holds;
- selected-club red card and injury requiring substitution remain real engine
  decision pauses;
- ordinary shots, saves, fouls, yellows, and minor injuries retain playback
  cadence;
- no live render rebuilds career attention, Posta, or storage;
- the completed report remains memory-only until full-time `Continua`.

The browser gate exposed one adjacent correctness issue: a suspension created
by the completed fixture could remain inside the carried next-fixture plan and
be rejected only at persistence time. The upcoming draft now clears only those
invalid XI/bench assignments, preserves all valid choices and geometry,
excludes unavailable candidates, and leaves replacement to explicit
`Auto`/`Riempi`. The just-completed fixture keeps its historical selection
until its review is acknowledged.

### Step 07 Verification

- Web suite passes: `59` files and `248` tests.
- UI suite passes: `10` files and `59` tests.
- Full Playwright product gate passes: `19/19`, including normal/reduced motion,
  desktop/narrow/200% text, both halves, cumulative incidents, and a second
  fixture after a real suspension.
- Web typecheck and production build pass; the existing bundle-size advisory
  remains unchanged.
- Dependency-cruiser passes with `565` modules and `2,068` dependencies.
- `git diff --check` and `graphify update .` pass.
- Step 08 is the only next implementation step.

## Step 08 Shared Live Tactical Workspace

The approved tactical board is now the sole paused-match command surface. XI,
bench, fixed slot identity, role catalog, suitability, formation transform,
drag/drop, click/tap fallback, and keyboard behavior remain shared with match
preparation. Matchday adds only current-session constraints: five changes,
no re-entry, disabled outgoing players, dismissed/forced-exit display, and
reversible pending commands.

### Step 08 Verification

- Web suite: `59` files and `254` tests pass.
- Full Playwright product gate: `19/19` pass across desktop, narrow, touch,
  keyboard, 200% text, and reduced motion.
- Web typecheck/build and dependency-cruiser pass.
- No second board, role catalog, suitability formula, or drag system exists.
- Step 09 is the only next implementation step.

## Step 09 Full-Time Review And Publication Boundary

Full time is projected from one cached canonical completion preview held by the
private live session. The preview supplies final statistics, ratings,
condition, form/morale, injury, and suspension facts without marking the
fixture played, resolving Posta, updating the table, or writing storage. The
review opens on `Riepilogo`; `La tua squadra` integrates private selected-club
consequences into rating rows, while `Avversario` exposes only observable facts.

The single `Continua` command reuses the cached result, applies every broader
career fact once, rebuilds attention/Posta once, and clears the live session
only after an optional due autosave succeeds. A failed due autosave restores
the prior working state and preserves the complete review for an explicit
retry.

### Step 09 Verification

- Engine, UI, i18n, and web suites pass; web reports `59` files and `256` tests.
- Web typecheck and production build pass.
- Dependency-cruiser passes with `573` modules and `2,097` dependencies.
- Canonical Playwright passes `19/19`, including full-time privacy, tab
  keyboard flow, narrow/zoom/reduced-motion layouts, SQLite/OPFS, refresh, and
  the second-fixture preparation regression.
- `git diff --check` passes.
- Step 10 is the only next implementation step.

## Step 10 Release Gate And Cleanup

### Deterministic Season Evidence

The canonical gate ran twice with seed prefix `phase77-final-gate`, `50`
worlds, and one complete `306`-fixture season per world. Both runs completed
all `15,300` fixtures with zero invariant failure and produced the same stable
hash:

`396aaed146613af94950c0a6365b548e`

| Distribution | Mean | Min | P50 | P95 | Max |
|---|---:|---:|---:|---:|---:|
| Goals per team | `1.578` | `0` | `1` | `4` | `10` |
| Shots per team | `8.386` | `0` | `8` | `13` | `22` |
| Shots on target per team | `3.469` | `0` | `3` | `7` | `14` |
| xG per team | `1.590` | `0` | `1.510` | `2.815` | `6.630` |
| Possession share | `50.000%` | `35.045%` | `49.999%` | `56.176%` | `64.955%` |
| Corners per team | `0.511` | `0` | `0` | `2` | `6` |
| Fouls per team | `10.735` | `0` | `11` | `16` | `24` |
| Yellow cards per team | `2.902` | `0` | `3` | `5` | `10` |
| Red cards per team | `0.105` | `0` | `0` | `1` | `3` |
| Penalties awarded per match | `0.186` | `0` | `0` | `1` | `3` |
| Penalty goals per match | `0.128` | `0` | `0` | `1` | `3` |
| Saves per team | `1.891` | `0` | `2` | `4` | `11` |
| Substitutions per team | `3.024` | `1` | `3` | `3` | `5` |
| AI decisions per team | `4.140` | `4` | `4` | `5` | `8` |
| AI applied changes per team | `3.145` | `2` | `3` | `4` | `7` |
| Player rating | `6.141` | `4.7` | `6.0` | `7.1` | `10.0` |

Injury incidence per fixture remained bounded and ordered by severity:
`knock 0.150`, `minor 0.116`, `moderate 0.052`, `serious 0.038`.
League stories also remained variable: home/draw/away rates were
`0.436 / 0.229 / 0.335`; champion points averaged `68.24` (`59`-`77`), bottom
points averaged `27.20` (`19`-`35`), and table spread averaged `41.04`
(`26`-`52`).

Every fixture satisfied score/event agreement, possession total, xG/shot
coherence, card/dismissal consistency, maximum-five substitutions, no re-entry,
legal goalkeeper coverage, unique player placement, and exactly-once completed
fixture publication.

The gate also exposed one batch-only goalkeeper edge case: a forced goalkeeper
exit could leave the next minute without a valid goalkeeper actor before an
interactive replacement existed. The engine now assigns temporary emergency
goalkeeper ownership to the strongest remaining goalkeeper profile. This keeps
ten-player and no-re-entry semantics intact; live Matchday still stops for the
manager's explicit injury decision.

### Football Interpretation

- The initial closeout exposed `3.41` goals per match and failed the existing
  strict calibration profile. The gate was not loosened. The generated-world
  opportunity rate moved from `0.090` to `0.085`, while a dangerous foul now
  becomes a penalty through a `0.30` secondary gate instead of `0.46`. The
  repeated result is `3.156` goals per match, `0.186` penalties awarded per
  match, and `0.128` penalty goals per match: lively, reproducible, and inside
  the existing football target without suppressing cards or penalty
  conversion.
- AI decision count can exceed substitutions because one boundary may include
  formation, role, or instruction changes. The substitution distribution stays
  within the real competition limit and therefore the larger decision maximum
  is not an illegal-change signal.
- A rare `10.0` rating is accepted as an exceptional match outcome. Ratings are
  still derived from structured contribution facts and the P95 remains `7.1`.
- The one-season gate proves match-loop integrity and football causality. It
  deliberately does not replace the Phase 75 multi-season player/squad
  lifecycle gate.

### Removed Code

The closeout deletes the retired active-match checkpoint domain and engine
Modules, their SQLite mapping/tables, staged progression, half-time-only
manager substitution contracts, and half-time-only AI selection. Exports,
tests, CLI callers, web adapters, and storage fixtures now point only to the
progressive minute session or completed durable match reports. SQLite schema
version `9` establishes a clean beta reset boundary rather than retaining a
compatibility reader for obsolete unfinished-match data.

### Visual And Accessibility Evidence

The authoritative Playwright gate passes `19/19` on the real SQLite/OPFS app.
It covers desktop, wide, narrow, touch, keyboard, 200% text, reduced motion,
first and second half, manual pause and all speeds, cumulative tabellino,
statistics, tactical decisions, full-time review, refresh/restart behavior,
due-save failure recovery, and a second fixture after availability changes.

The final Node 24 monorepo gate passes `189/189` test files and `1,133/1,133`
tests. Lint, localized presentation text, every workspace typecheck,
dependency-cruiser (`570` modules and `2,064` dependencies), production build,
`git diff --check`, and Graphify all pass.

The broadcast strip has a stable desktop height so ordinary and goal commentary
cannot grow the page as text changes. Narrow and zoomed layouts release that
height constraint to preserve complete readable text. Drag/drop has click/tap
and keyboard parity, tabs expose correct semantics and roving focus, live
updates use bounded announcements, focus returns after transient surfaces,
and color-coded suitability, incidents, condition, and availability always
retain text or icon meaning. Reduced motion removes transforms while preserving
the same facts, holds, decisions, and destinations.

Manually inspected evidence includes the first-half opening and first-goal hold
under `/tmp/the-long-season-phase76/`, plus the complete desktop/narrow phase
journey generated by `current-product.spec.ts`. No horizontal page overflow,
cumulative commentary feed, clipped tabellino, unstable score header, or
drag-only command remains.

### Residual Risks

- The production build still reports the existing large-chunk advisory. Motion
  remains lazily consumed and no Phase 77 correctness or interaction depends on
  animation, but future section work should avoid enlarging the initial web
  bundle without measurement.
- Match balance should continue to be judged by football stories over larger
  cohorts; the closeout intentionally does not tune valid outliers merely to
  narrow a report.
- Extra time, shootouts, cup-specific substitutions, pass completion, offsides,
  VAR, and a visual match viewer remain absent until real gameplay rules require
  them. There are no dormant placeholders for those systems.

### Manual Product Inspection

Inspect one full selected-club journey with ordinary play, a goal, a penalty,
a selected-club red card, and a forced injury; verify that only real manager
decisions stop indefinitely. Repeat the paused substitution/role-adaptation
flow with mouse, touch, and keyboard, then confirm full-time `Continua` returns
to a coherent Dashboard and that refreshing an unfinished match restarts it
from minute zero.

### Next-Phase Recommendation

Proceed only with `Phase 78 - Market UI MVP With Budget Visibility`, preserving
the completed live-match ownership and first satisfying its documented Squad
screen dependency. Do not extend Matchday through market placeholders.

# Phase 81 - Phase-Aware Tactical Shape And Manager Decision Engine Design Contract

Date: 2026-07-31  
Status: Accepted for implementation after Phase 80C  
Scope owner: Phase 81 only

## Product Intent

The Long Season must not clone Football Manager or simulate twenty-two
independent agents every fraction of a second. It must make the manager's
football decisions matter in a credible, deterministic, explainable aggregate
match engine.

The same lineup, formation, role, suitability, and tactic decision must affect:

- the pre-match calculation;
- the next simulated minute after a confirmed live change;
- the AI's own selection and in-match choices;
- the structured explanation shown to the manager;
- bounded diagnostics and the final long-run evidence.

The engine must produce the correct *kind* of consequence. A `3-1-6` is not
forbidden and does not receive a named penalty. It has excessive final-third
occupation, weak connections, and exposed transition protection; the opponent
determines how strongly those properties are punished or exploited.

## Verified Current Finding

The current engine compresses the selected XI into four department averages:

```text
attack / midfield / defense / goalkeeper
```

`averageDepartment(...)` returns `total / count` for every non-empty
department. With equal-quality players, a `4-4-2` and a `3-1-6` therefore
produce identical `TeamStrength`, overall strength, possession inputs,
opportunity rate, quality, and outcome probabilities. Formation shape becomes
visible only in the degenerate case where a department is empty and its mean
falls to zero.

The `2-0-8` example is secondary:

- raw opportunity rates are approximately `0.0983` versus `0.0664`;
- possession is bounded to `18..82%`, not the unclamped approximately `1%`;
- with equal tactics and `directness = 0.5`, the complete opportunity volumes
  are approximately `0.1175` versus `0.0594`, a ratio of about `1.98`;
- the consequence still flows through one zero midfield scalar rather than
  coverage, connection, saturation, or transition structure.

Other verified facts:

- the web Adapter collapses canonical roles into `gk`, `defender`,
  `midfielder`, and `attacker`;
- `FormationLine`, `FormationPositionFamily`, and `FormationSide` already
  exist as domain unions but do not reach match calculation;
- natural/adapted/weak/invalid suitability is used for selection, not match
  execution;
- role weights already create an implicit attribute-based cost when a player
  is used in a different role;
- `mentality` is validated but not mapped;
- opportunity and outcome are resolved before chance actors are selected;
- confirmed live changes already replace the team context for minute `N + 1`.

## Locked Architecture

### 1. Keep The Aggregate Per-Minute Engine

`stepMatch` remains the minimum deterministic unit. The phase does not add:

- a real-time physics engine;
- one autonomous agent per player;
- per-pass persisted events;
- continuous spatial coordinates;
- an event for every simulated tick;
- a second match engine for interactive play.

Batch and interactive drivers continue to use the same engine.

### 2. Separate Quality, Intrinsic Shape, And Relational Matchup

Three concepts remain distinct:

1. `TeamStrength` describes player quality available to the selected roles.
2. The intrinsic tactical-shape Module describes what one side can do without
   knowing its opponent.
3. The relational matchup Module compares the side's own phase chain and the
   opponent's complementary capacities.

The intrinsic result is not a global formation score and does not say that one
formation is universally better. It exposes bounded capacities in three
families:

- in possession: build-up, central progression, left/right progression, and
  final-third/box presence;
- out of possession: pressing cohesion, central coverage, left/right
  coverage, and box protection;
- transitions: counter threat and rest defence.

Exact internal cells or zones are an Implementation choice. A `3 x 5` grid may
be used internally if evidence supports it, but zone count, cell IDs, and UI
coordinates are not frozen into the public Interface in this phase.

The relational matchup owns:

- own-chain bottlenecks such as build-up to progression to final-third entry;
- attack-versus-defence comparisons by phase and channel;
- transition threat versus rest defence;
- the effective opportunity route and its bounded volume/quality effects.

### 2a. Lock The Quality-Versus-Structure Hierarchy Before Coefficients

Shape must matter without becoming a universal equalizer. The product
hierarchy is:

1. At equal player quality, a coherent ordinary shape has a material but
   bounded aggregate advantage over a structurally incoherent extreme shape.
2. A severe structural mismatch may overturn a modest player-quality
   advantage; otherwise the manager's formation decision remains cosmetic.
3. A generated First Division title contender remains the aggregate favourite
   against a generated Third Division mid-table side when the stronger team
   uses `3-1-6` and the weaker team uses a coherent `4-4-2`. Individual
   deterministic seeds may still produce an upset.
4. No formation or tactic guarantees a result, and no scenario creates a hard
   result override.

Step 01 measures the post-Phase-80A generated strength distributions and
freezes numeric paired-seed bands for opportunity volume, xG, and
win/draw/loss share that encode this hierarchy before Step 03 writes
coefficients. This is a product gate, not calibration to post-change output.

Step 06 is the first step allowed to claim that the gameplay defect is fixed.
It runs the frozen end-to-end hierarchy matrix immediately after the new route
model becomes canonical. Step 12 only monitors that the already-passing
hierarchy survives twenty seasons; it is not the first balance evaluation.

### 3. Use Typed Domain Vocabulary

Match calculation receives typed domain facts:

- `FormationLine`;
- `FormationPositionFamily`;
- `FormationSide`;
- `CanonicalPlayerRole`;
- position suitability.

These facts must not cross the seam as open strings. Every exhaustive mapping
uses total `switch`/`Record` ownership and a `never` guard where appropriate.
A future formation line, position family, role, suitability state, or
opportunity route must create a compile-time failure at every exhaustive owner.

`slotId` remains identity, not tactical semantics. No parser may recover line,
side, role, or position family from a slot string.

### 4. Diminishing Returns, Not Named Formation Penalties

Additional players contributing to the same task have diminishing marginal
value. Step 01 freezes the admissible mathematical shape and the numeric
product outcome bands, not invented coefficients. Step 03 writes the initial
versioned coefficients. Steps 03-05 may verify and refine headless structural
facts; Step 06 may tune coefficients only against the already-frozen outcome
bands while integrating production behaviour. The policy version freezes when
Step 06 closes, before the later integrated diagnostics and longitudinal run.
Thresholds may never move to accommodate observed output.

The engine must not contain:

- `if formation === "3-1-6"` logic;
- an `attackerCount > N` punishment;
- a formation allowlist;
- a universal balance bonus;
- a special underdog/result correction.

Extreme and ordinary shapes use the same contribution and matchup functions.

### 5. Suitability Adds Coordination Only

The role-score path already evaluates the player's real attributes with the
destination role weights. Phase 81 must not multiply the complete score again
for being out of position.

Suitability may affect only facts not already represented by those weights:

- coordinated positioning;
- decision timing;
- occupation of the expected line/channel;
- contribution to pressing, coverage, and connections;
- bounded execution error/variance where explicitly configured.

Tests must prove both:

- a weak/invalid fit is meaningfully different from a natural fit when
  attributes are otherwise equal;
- the player is not penalized twice across every technical and physical
  contribution.

### 6. Current Tactic Inputs Gain Football Semantics

Phase 81 uses the current tactic contract. It does not add another tactics
screen or speculative sliders.

- `directness` changes route dependence and turnover exposure.
- `pressing` changes advanced recovery pressure only when shape is coherent.
- `width` changes central/lateral route preference and coverage distances.
- `risk` changes attempt frequency and loss exposure, not raw player strength.
- `mentality` controls commitment/trade-off between presence and protection
  and interacts with score/minute state.

No tactic input is a universal bonus. Every attacking benefit has a credible
cost or prerequisite.

### 7. Opportunities Remain Aggregate But Become Phase-Aware

The first behavioural slice changes opportunity origin and volume:

```text
recovery/build-up -> progression -> final-third entry -> shot opportunity
```

The engine chooses a structured route from canonical shape, tactics, match
state, and deterministic RNG. Route facts replace the current texture-based
inference of `cross`/`counter` where that inference becomes obsolete.

The existing aggregate occasion resolver remains the starting Implementation,
then receives route-derived quality and actors through one explicit
`OccasionContext`. The phase does not model a complete pass chain.

### 8. Actors Become Causal Without Becoming Agents

Creator, shooter, primary defender, and goalkeeper are selected before the
occasion is resolved. Their relevant attributes may contribute boundedly to
route quality and resolution.

The phase must remove the obsolete post-resolution attribution path. It must
not introduce:

- autonomous player decisions;
- a generic duel framework;
- an event bus;
- one durable event for every nominal action;
- duplicated aggregate and actor outcome owners.

Structured match events remain sparse and language-agnostic.

### 9. Pre-Match And Live Changes Share One Seam

The same team-context builder and tactical-shape Implementation serves:

- saved pre-match preparation;
- substitutions;
- formation changes;
- role changes;
- tactic changes;
- AI team setup and live commands;
- batch simulation.

A confirmed change at completed minute `N` affects minute `N + 1` only.
Nothing rewrites earlier statistics or events. There is no React-only effect,
preview-only coefficient, or separate live-match formula.

### 10. Derived Shape Is Not Career Truth

Formation slot facts and tactic choices are canonical inputs. Shape profiles
and matchups are derived simulation facts.

- Do not add a second durable career ledger for shape.
- If a derived profile is cached inside serializable match state for the hot
  loop, validation must prove it was created by the current stamped policy.
- Active-match persistence and structured event schema changes receive one
  explicit beta reset after the final Phase 81 shape/route contract is known.
- No beta migration, dual reader, optional legacy field, or fallback
  reconstruction survives.

### 11. AI Uses The Same Truth

AI selection and live decisions use the same role fit, intrinsic shape, and
relational matchup facts available to the engine. AI must not use a second
magic balance score.

The current greedy slot-order selection is audited. If it can return a worse
whole-XI assignment than a deterministic global assignment, replace it behind
one named selection Module with stable tie-breaks. Do not add a generic
optimizer/plugin registry.

Step 09 reruns the frozen quality-versus-structure matrix after canonical AI
XI selection because assignment changes realized on-pitch quality. A correct
assignment must never be weakened to fit the bands: if the hierarchy alone
regresses, reopen Step 06 and retune only its versioned coefficients against
the unchanged bands; if assignment is wrong, reopen Step 09.

### 12. Manager Explanation Is Structured And Non-Prescriptive

Engine/domain emit structured facts and keys only. `@game/ui` projects a small
number of qualitative observations such as:

- weak central connection;
- exposed transition protection;
- left-side overload;
- pressing without compact support.

The UI must not expose formulas, exact capacity numbers, or an automatically
optimal formation. It helps the manager understand consequences without
playing the game for them.

## Clean Code And Local Refactor Contract

Every Phase 81 step must leave its owned Modules deeper than it found them.

- New or materially modified exported functions/types receive useful
  JSDoc/TSDoc explaining football meaning, invariants, determinism, and error
  modes for a junior developer.
- Names use domain language. Do not add generic `utils`, `helpers`, `manager`,
  `processor`, or boolean-flag functions when a specific concept exists.
- One fact has one owner. Do not duplicate mappings, route formulas, tactic
  coefficients, shape calculations, or suitability rules across engine, web,
  UI, AI, and diagnostics.
- Delete obsolete adapters, fallbacks, branches, fixtures, and tests in the
  same step that makes them redundant.
- If an encountered refactor belongs to the active Module and is needed for a
  coherent implementation, add the file explicitly to that step's Expected
  Files before modifying it and complete the refactor.
- If it is outside the active Module or would broaden product behaviour, record
  it in `docs/PROJECT_STATUS.md` and the next relevant step rather than mixing
  an unbounded cleanup into the current step.
- Do not retain compatibility code for beta saves.
- Do not create a shallow pass-through Module merely to make a function easy to
  mock. The Interface is the test surface; internal Implementation details stay
  local.
- No known dead code, duplicated calculation, open-string tactical mapping,
  stale compatibility path, or obsolete test fixture may remain undocumented
  at step close.

## Diagnostic Contract

Step 01 freezes exact seeds, denominators, observations, and thresholds before
behaviour changes. At minimum, bounded diagnostics cover:

- equal-quality `4-4-2` versus `3-1-6`;
- equal-quality `4-4-2` versus `2-0-8`;
- `4-4-2` versus `8-0-2`;
- no central connection;
- left/right overload;
- natural versus adapted/weak/invalid assignments;
- coherent versus incoherent high pressing;
- direct play with and without connection support;
- the same pre-match change applied live at a fixed minute;
- a materially stronger team using an imperfect shape;
- a generated First Division title contender using `3-1-6` against a generated
  Third Division mid-table side using coherent `4-4-2`;
- a modest quality advantage that a severe structural mismatch is allowed to
  overturn.

Every scenario must record positive observations. Required invariants include:

- `3-1-6` is not bit-identical to `4-4-2`;
- extra occupants have positive but diminishing contribution;
- empty and thin connections remain distinct;
- tactic benefits have visible costs/prerequisites;
- live deltas affect only post-command minutes;
- pre-match and live rebuilding produce the same structural delta;
- no shape produces `NaN`, negative probability, or an unclamped multiplier;
- stronger players remain meaningful and shape does not become a universal
  equalizer;
- the frozen quality-versus-structure hierarchy passes at Step 06 with
  positive paired-seed observations;
- deterministic replay reproduces route, event, statistic, and result facts.

Thresholds cannot be weakened after implementation output is observed.

## Longitudinal Ownership

Phase 80C closes on bounded race diagnostics and hands control to Phase 81.
Phase 81 Step 12 becomes the sole owner of the deferred checkpointed `50 x 20`
because it is the last accepted rework before that evidence:

```bash
pnpm cli ten-season-report \
  --seed-prefix=phase81-tactical-shape-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase81-tactical-shape-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
```

The identical command runs twice. The second run must reuse valid checkpoints
and reproduce report facts. Phase 79 Step 14 remains Reopened, paused, unrun,
and unclaimed until Phase 81 closes.

## Explicit Non-Goals

- No Football Manager clone.
- No 22-agent or continuous-spatial simulation.
- No new tactics destination or new tactic sliders.
- No training, staff, weather, referee, morale, team-talk, or tactical
  familiarity expansion.
- No named penalty for an extreme formation.
- No UI-owned gameplay rule.
- No exact tactical-capacity numbers exposed to the manager.
- No generic optimizer, event bus, strategy registry, plugin system, or
  speculative extension hierarchy.
- No beta migration or legacy compatibility.
- No long run before Step 12.
- No Phase 79 Step 14/15 implementation.

## Phase Exit

Phase 81 is complete only when:

- typed shape facts survive every Adapter without open-string recovery;
- intrinsic shape and relational matchup are separate, deterministic Modules;
- `3-1-6` and `4-4-2` are no longer equivalent;
- suitability changes coordinated execution without a blanket double penalty;
- all current tactic inputs, including mentality, have explicit bounded
  semantics;
- opportunity route, quality, and actor causality share one owner;
- pre-match, live, AI, batch, persistence, diagnostics, and UI consume the same
  truth;
- obsolete four-role-collapse, texture-only chance inference, and
  post-resolution actor paths are removed where superseded;
- bounded gates pass with positive observations;
- browser QA proves understandable pre-match and live consequences;
- `pnpm check`, build, dependency, persistence, deterministic replay, diff,
  and Graphify gates pass;
- the checkpointed `50 x 20` completes and replays with exactly seven workers;
- Phase 79 receives a truthful handoff without claiming its separate
  release-scale gate.

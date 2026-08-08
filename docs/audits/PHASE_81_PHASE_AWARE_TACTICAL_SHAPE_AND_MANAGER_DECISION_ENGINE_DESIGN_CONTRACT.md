# Phase 81 - Phase-Aware Tactical Shape And Manager Decision Engine Design Contract

- Date: 2026-07-31, amended 2026-08-02 and 2026-08-03
- Status: Accepted for implementation after Phase 80A
- Scope owner: Phase 81 only

The 2026-08-02 phase-order amendment moves this phase ahead of the market work,
renumbered Phase 82A and Phase 82B. Nine amendments (A1-A9) are recorded in the
phase README; three sections below are updated by them: the longitudinal
ownership, the carried goal-rate monitor, and the seams left for the
background-world work. The rationale and declared costs are in
`docs/the-long-season-mondo-vivo.pdf`, section 11.

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

Step 01 measured all of this rather than restating it. The recorded numbers are
in `docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md`; the frozen contract they
produce is in `Step 01 Frozen Baseline` below.

### The Reachable Shape Population

An earlier version of this contract treated `3-1-6`, `2-0-8`, and `8-0-2` as
diagnostic constructs, on the grounds that `FORMATION_KEYS` contains `23` named
presets and none of the three is among them. That was wrong, and Step 01
corrected it against the code.

The preset is only where a lineup starts. On the tactical board the goalkeeper
is the one locked slot (`locked: role === "POR"` in
`apps/web/src/features/tactics-board/tactical-board-formations.ts`); each of the
other ten reaches every outfield role by drag, because
`TACTICAL_BOARD_ROLE_DESTINATIONS` tiles the whole pitch with role zones. No
validator caps how many slots share a department: the preparation blockers in
`packages/ui/src/career/career-match-preparation-view.ts` cover empty slots,
duplicates, unavailable players, and the bench goalkeeper only, while
`createSelectedLineup` and `buildTacticTeamContext` add no shape rule at all.

A manager can therefore field `3-1-6`, `2-0-8`, `8-0-2`, or `0-0-10`. These are
manager choices, not probes, and none of them is exempt from any gate.

Because the engine reads role keys rather than a formation name, the shape input
it can observe is the triple `(defenders, midfielders, attackers)` over the ten
outfield slots. The reachable population is exactly the `66` triples summing to
ten. The `23` presets collapse onto only `10` of them, so the presets describe
where managers start, never the population a gate runs over.

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
model becomes canonical. Step 15 only monitors that the already-passing
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

## Step 01 Frozen Baseline

Measured on 2026-08-02 by `pnpm cli simulation-report --profile=phase81-tactical-shape`, over quality bands
taken from the generated three-division world seed
`phase81-tactical-shape-baseline`. No gameplay behaviour changed.

### What The Engine Currently Sees

| Fact | Value |
| --- | --- |
| Reachable department compositions | `66` |
| Distinct `TeamStrength` values across them | `7` |
| Compositions that populate all four departments | `36`, all byte-identical |
| Compositions reachable from a named preset | `10` |

`4-4-2` and `3-1-6` are not merely close: run on the same seeds and the same
fixture identities they produce byte-identical results. The only structural
signal the engine has today is whether a department is *empty*, and every
empty-midfield shape sits exactly on the `0.18` possession floor.

The consequence is a cliff, not a curve. A manager can move slots freely among
populated departments with no effect whatsoever, and falls off a cliff the
moment a department empties. That is the defect Steps 02-06 remove.

### Tactics Are In The Same State

Step 01 measured the tactic knobs the same way, at the reference shape, against
the same shape playing a neutral tactic. Over `800` paired-seed matches each,
every profile landed between `0.4644` and `0.5156` win share - all of it inside
the `0.0477` noise floor. High pressing, direct play, flank overload, high risk,
and a full low block are, in outcome terms, the same tactic.

Chance type is the exception, and it is worse than no effect: it is a knob
threshold rather than a route. `deriveChanceType` returns `cross` only when
`width > 0.25` and `counter` only when `directness > 0.35 || risk > 0.35`, so a
low block produced `6247` open-play chances and exactly zero crosses and zero
counters. A manager who lowers width past a hidden line does not shift a
distribution, he deletes a category.

This is recorded here because Step 06 owns both facts, and because a phase
report that fixed shape while leaving tactics inert would be measuring half the
manager's decision.

### Frozen Thresholds

Fixed before any behaviour change, and never re-derived from output. They live
in code as `TACTICAL_SHAPE_THRESHOLDS` so a later step cannot quietly move one.

| Invariant | Frozen threshold | Step 01 measurement |
| --- | --- | --- |
| `bounded_structural_swing` | best shape's gain over the reference shape `<= 0.75 x` the division-tier edge | `0.169` (PASS) |
| `no_dominant_composition` | no composition stays above `0.55` against every single opponent | `0.375` (PASS) |
| `no_dominant_tactic` | no tactic profile averages above `0.55` against the other profiles | added by Step 06 |
| `no_dominant_formation` | no curated formation averages above `0.55` against the other formations | added by Step 14 |
| `incoherence_costs_a_division_tier` | worst-shape deficit `>= 1 x` the division-tier edge | amended by A9 |
| `quality_hierarchy_survives_extreme_shape` | contender win share `>= 0.55` with at least `1` upset | `0.925` with `30/800` upsets (PASS) |
| `empty_department_possession_clamp` | every share inside `[0.18, 0.82]`, every empty-midfield shape on the floor | `0.18` across all `11` (PASS) |
| `distinguishable_coherent_and_incoherent_shape` | equal-quality `4-4-2` and `3-1-6` must differ | `not_evaluated` |

Three entries deserve their reason recorded rather than inferred.

`incoherence_costs_a_division_tier` replaced `asymmetric_incoherence_cost`
(worst-shape deficit / best-shape surplus `>= 2`) under **A9** on 2026-08-03.
The original asserted two things at once and only *incoherence costs a lot* is a
rule the engine must obey; *coherence pays little* is a consequence of the
reference `4-4-2` already being the optimum of a population of ten central
clones, which is why the denominator never existed. The surplus measured
`0.0431` at Step 01 and `0.0156` after Step 06's calibration, always inside the
`0.0477` noise floor, so the ratio was `not_evaluated` at every calibration ever
run. The claim survives as two one-sided bounds against the division-tier edge:
coherence may gain at most `0.75` of a tier, incoherence must cost at least `1`.
Nothing was widened - a ratio with no denominator became a bound on a quantity
that has one - and `not_evaluated` is still never reported as a pass.

`no_dominant_tactic` was added by Step 06 as the twin of the shape gate. It
reads the *mean* against the other profiles where the shape gate reads the worst
single matchup, because six tactic profiles are all legal selections on one
eleven - so the mean is the expected value of choosing blind - while the `66`
compositions are mostly self-destructive and a mean there measures how badly the
broken shapes lose.

`no_dominant_formation` was added by Step 14 and **reuses the same `0.55`**; no
number was introduced. It reads the mean for the tactic gate's reason - all `23`
curated shapes are legal selections - and it exists because until Step 14 the
formation population had a versus-reference *column* and no matrix, so the one
claim the phase makes about every other population was structurally unaskable
about the one a manager picks from. The population is the whole catalog rather
than the eight axis-isolating shapes the versus-reference table measures: a shape
that beats the field from outside a subset is invisible to that subset.

`distinguishable_coherent_and_incoherent_shape` is the invariant this whole
phase exists to satisfy, so it cannot pass at Step 01 by construction. It
records the starting point - `7` distinct strengths across `66` compositions -
and names Step 03 as the step that introduces intrinsic shape and Step 06 as
the first step able to satisfy it.

### The Yardstick

One division tier of squad quality is worth `0.2521` win share at identical
shape (median first-division squad against median second-division squad), and
every claim that structure must not outweigh quality is measured against that
number and no other. It read `0.255` over `800` paired-seed matches until
Step 07B measured it over `2100`; the thresholds that depend on it are expressed
as fractions of the tier edge and the audit reads the measured value in the same
run, so nothing needed amending.

### Open - What Should Setting Up Be Worth Against Having Better Players? (2026-08-04)

Step 07B put every manager decision on one scale, at `2100` matches a row against
one `0.0295` noise floor:

| Decision | Edge over an even contest |
|---|---|
| fielding a broken shape (`0-0-10`) | `0.4852` |
| one division tier of squad quality | `0.2521` |
| a modest squad-quality gap | `0.1886` |
| tactic sliders, best setting against worst | `0.0858` |
| an adjacent squad-quality gap, two top clubs | `0.0467` |
| best structural shape gain (`3-5-2`) | `0.0312` |
| worst curated formation (`4-3-2-1`) | `0.0305` |
| a standout attacker at equal squad quality | `0.0098`, unresolved |

Two facts in that table are a product decision this contract has never taken.

**The ratio.** Between two comparable top clubs, an adjacent squad-quality gap is
worth `0.0467` and the formation decision is worth `0.0305`, so *how a manager
sets up* is worth roughly two thirds of *having better players* - about `1.5x`,
not `10x`. For a management game that may be exactly the intended promise. It is
currently an emergent number rather than a chosen one, and nobody reading it
today could say which.

**The one-sidedness.** Seven of the eight curated formations sit below the
reference and none is meaningfully above it, so the formation decision can cost a
manager and cannot pay him. The tactic gate states the same asymmetry by design -
"an extreme may cost a manager, never pay one" - so this is consistent rather
than accidental. The open question is whether it is *complete*: a manager who
sets up well is currently not rewarded, only spared. Whether a good decision
should ever pay, and by how much, is the other half of the same decision.

Neither is a coefficient to tune. Both are targets to choose, and the numbers to
choose against now exist.

**Answered for formation, and given a step (2026-08-04).** Step 14 takes the
target at `~0.047` win share - about five league points a season, beside the
`0.0467` adjacent squad gap - and states it as a *counter-move* reward rather
than an absolute one, because a formation with the highest win share against the
field is the answer and `no_dominant_composition` forbids the answer existing.

It is blocked, and the blocker is not procedural. **Every AI-controlled club in
the game fields a fixed `4-4-2`** - `matchday-adapter.ts`, `career/progression.ts`,
`ten-season-report`, `live-match-control-report-data.ts` and
the `tactical-shape-section.ts` audit bridge all hardcode it - so a counter-move reward built
today would mean "countering `4-4-2` pays", which is a single right answer against
the only opponent that exists. Step 09 owns giving opponents real formations.
Nothing about this target may be implemented before it has.

Tactics and compositions are **not** in the same position and need no equivalent
step: their best response already gains `+0.0327` and `+0.0312` above an even
contest, clears the noise floor, and collapses to `+0.0033` against its own
counter. That is the rock-paper-scissors this contract wanted, working.

**Measured and refused, 2026-08-06 (Step 14).** The target is not reachable and
the contract now records why rather than carrying it forward a second time.

Step 14 built the formation-versus-formation matrix the audit never had, over the
whole `23`-shape catalog rather than the eight axis-isolating shapes, and
measured it on two seed prefixes. The counter-move reward, with the best response
*chosen* on the matrix and *replayed* on a separate seed stream so a `23`-way
maximum cannot manufacture one, is **`0.0064`** and **`0.0117`** against a
`0.0295` cell floor. Unresolvable on both.

The lever this contract pointed at - Step 04's route chain weighting - was built
analytically and swept over `57` configurations of every coefficient the matchup
model has. **Every one produced a strictly transitive matrix.** The cause is not
the routes: over the `23` shapes the ranking by route advantage tracks the
ranking by *mean capacity*, so a shape better at attacking centrally is also
better at defending centrally and there is no trade-off for a counter to exploit.
A route model amplifies a difference; it cannot create a trade-off.

So the one-sidedness above is now measured rather than inferred, and it is
smaller than it looked: `4-2-3-1` averages `0.5184` and `0.5210` against the
field on the two prefixes - reproducible, and outside the `0.0129` row-mean floor
- so picking the best shape blind *is* worth about `0.02`, roughly `1.5` league
points a season. That is an absolute reward, which is precisely what this
contract forbids rewarding further.

The two open questions at the top of this section are therefore still open, and
the answer given on 2026-08-04 is withdrawn: `~0.047` as a counter-move is not a
target this engine can be tuned to. Reaching it needs a lopsided population
*and* conserved capacities, together. Step 14's handoff names both.

### Population Condition (A4)

The bands above are conditioned on a **single-country** population. With five
countries, "first division" and "third division" stop denoting one quality
scale, so the tier edge, the quality bands, and every threshold expressed as a
fraction of the tier edge must be re-derived by whoever introduces the wider
world. They may not be carried over silently.

### Measurement Discipline

The dominance matrix and the named scenarios use different denominators on
purpose. The `66 x 66` matrix answers a shape question - is any composition a
free win button - and reads a *minimum* across a whole row, so it needs breadth
rather than precision inside one cell. The named scenarios and the
versus-reference column feed numeric invariants, so they run at higher
precision and the report records the resulting noise floor beside them. A later
step that reports a structural effect smaller than that floor has measured
nothing.

## Carried Goal-Rate Monitor

Phase 80A Step 09 cannot close on its own. All `32` of its player-model gates
pass over a deterministic `750 x 3` cohort, but its report stays `FAIL` on a
single monitor: `goals_per_match_avg` records `36/634/80` pass/warn/fail with
every failure on the high side. Match scoring is outside that phase's
player-model scope, and its contract forbids repairing the result by moving a
threshold or a denominator.

Phase 81 accepts that monitor unchanged (A7). The threshold, denominator, and
`monitor` severity class all stay exactly as inherited: the transfer changes the
owner, not the severity. Step 06 is the first step able to move it, because it
owns how many opportunities exist and how they convert; Step 13 is the deadline;
Step 15 confirms it at cohort scale.

The monitor may not be carried a second time. If Step 13 finds it still out of
band, the fix is reopening Step 06, not naming a third owner - a transfer that
can be repeated indefinitely is a way of never fixing the defect.

Step 01 accepted the transfer on 2026-08-02 and recorded `36/634/80` over `750`
worlds as this phase's **starting point, not an accepted result**. Nothing about
the monitor changed at Step 01: the threshold, the denominator, and the
`monitor` severity class are byte-identical to the ones Phase 80A published, and
Step 01 ran no cohort of its own. The tactical-shape baseline deliberately does
not touch it either, because the baseline changes no behaviour and a monitor
that moved during a no-op step would mean the step was not a no-op.

### Open - The Mover Is Step 07, Not Step 06 (2026-08-04)

Step 07B ran `pnpm cli ten-season-report` at three commits to find out which step
had actually moved the monitor:

| Commit | `goals_per_match_avg` | `table_points_spread_avg` |
|---|---|---|
| `a62ced4` - before Step 07 | `2.74` | `42.0` |
| `c1f3bda` - Step 07 committed | `2.78` | `40.1` |
| `465013c` - Step 07A committed | `2.78` | `40.1` |

`a62ced4` reproduces Step 06's recorded numbers exactly, so the command, the
seeds and the world are stable and a difference between rows is the engine
changing rather than the measurement. **Step 07 owns the entire movement and
Step 07A owns none of it.**

That was not foreseeable when this section was written. The rule names Step 06
"because it owns how many opportunities exist and how they convert", which was
true and is still true - and Step 07 then put actor edges on the same chain, so
it moves the goal rate too. There are now two steps that can, and the rule
assumes one.

**The anti-pattern the rule guards against is still right.** A monitor whose
owner can be transferred again and again is never fixed, so "do not name a third
owner" must not be read as loosened by this. The decision is narrower: if Step 13
finds the monitor out of band, is Step 06 still the correct thing to reopen when
the step that last moved it is Step 07?

Step 07B recorded the measurement and deliberately changed no rule. This is for
the contract to answer before Step 13.

## Lineup-Composing Readers Of `Club.playerIds` (A6)

Step 02 introduces one named squad-depth accessor and Step 09 must satisfy an
absence assertion against it, so Step 01 recorded what that accessor replaces.

Across production code, excluding tests and fixtures, `115` sites in `45` files
read a club roster off `Club.playerIds`. They fall into three groups, and only
the first is A6's target.

**Group 1 - composes a lineup or a bench that reaches the match engine.** These
are the paths Step 02's accessor must own, and the ones Step 09 asserts are
gone:

- `packages/engine/src/career/progress-fixture.ts` - the selected club's
  selectable set, and the home/away rosters registered for match ratings;
- `apps/web/src/features/matchday/matchday-adapter.ts` - the selected club's
  live roster and `defaultOpponentLineupFromRoster(club.playerIds)` for the
  opponent XI;
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts` - the
  squad offered to the tactical board;
- `apps/cli/src/commands/career/preparation.ts` -
  `buildFirstTeamSelectedLineup(...)`;
- `apps/cli/src/commands/career/matchday-output.ts` - a raw `slice(0, 11)`;
- `apps/cli/src/commands/fake-season-input.ts` - `genericLineupForClub(...)`;
- `apps/cli/src/commands/live-match-control-report-data.ts` - the eight-player
  bench.

**Group 2 - measures squad depth for a market or structural decision.** Phase
82A redefines these against selectable rather than owned depth, and that phase
owns them, not this one: `ai-market-lifecycle.ts`, `senior-squad-replenishment.ts`,
`squad-maintenance.ts`, `player-exits.ts`, `transfer-player-negotiation.ts`,
`transfer-feasibility.ts`, `career-market-catalog.ts`, `ai-contract-lifecycle.ts`.

**Group 3 - owns or persists the roster itself.** These are ownership truth and
must keep reading the stored field: `senior-squad-transfer.ts`,
`world-state-mapper.ts`, and the content generators.

`packages/engine/src/team-selection/ai-squad-selection.ts` already takes
`playerIds` as an input rather than reading a club, so it is at the seam
Step 09 needs and requires no migration.

## Longitudinal Ownership

Phase 81 Step 15 owns this phase's checkpointed `50 x 20`:

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
and reproduce report facts.

This cohort is engine evidence only. It observes a world without postures,
loans, or competitive races, because that behaviour arrives in Phases 82A and
82B, which now follow this phase. Phase 82B Step 09 owns a second checkpointed
`50 x 20` over the competitive market. Two runs are an accepted cost of the
phase order, and neither substitutes for the other; the Phase 81 report must say
so explicitly so the numbers are not later reused out of scope.

Phase 79 Step 14 remains Reopened, paused, unrun, and unclaimed.

## Seams Left For The Background World

This phase does not build the background world, but it decides how expensive
that world will be to build. Four seams are contract, not implementation
detail, and each exists because the alternative is a second migration:

- one named squad-depth accessor, so Phase 82A redefines fieldable-versus-owned
  in a single place rather than across every current reader (A6);
- a context constructor that accepts an explicit squad instead of deriving one
  from a club, which is the same seam a borrowed player needs (A1, A8);
- a non-selected club treated as an ordinary caller of that constructor, not a
  special case bolted on afterwards (A1);
- a match RNG keyed strictly by `(worldSeed, fixtureId)`, which makes order,
  timing, and scheduling irrelevant to a result and is what later allows
  background fixtures to be resolved in any order, in blocks, or on a worker
  (A5).

Match facts additionally attribute to the club a player was fielded by rather
than the club holding his contract (A8). Today the two coincide; they stop
coinciding at the first loan, and by then the history already exists.

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
- No long run before Step 15.
- No loan, posture, competitive-race, or free-agent behaviour: Phases 82A and
  82B own it and it does not exist yet.
- No background-world simulator, multi-country topology, or aggregate result
  producer. This phase builds the seams and stops.
- No contract-duration or market-density change; that is Phase 81B
  that follows.
- No new direct reader of `club.playerIds` in a lineup-composing path.
- No weakening or second transfer of the carried `goals_per_match_avg` monitor.
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
- the carried `goals_per_match_avg` monitor is inside its unchanged band by
  Step 13 and stays there at cohort scale;
- squad depth is reached through one named accessor, the context constructor
  takes an explicit squad, and match facts attribute to the club a player was
  fielded by;
- the checkpointed `50 x 20` completes and replays with exactly seven workers,
  and its report states that it observed no loans and no races;
- Phase 81B receives a truthful background-world handoff naming the contract-duration
  representation change, the background-fixture resolution point, and the
  simulate-match command, while Phase 79 Step 14 stays unrun and unclaimed.

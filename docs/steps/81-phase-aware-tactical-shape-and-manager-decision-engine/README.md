# Phase 81 - Phase-Aware Tactical Shape And Manager Decision Engine

## Status

**Done 2026-08-07.** All fifteen steps are complete. The closing report is
`docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_ENGINE_REPORT.md` and Phase 81A
is the only next owner.

Two things closed as recorded rather than as claimed, and both are in that report:
Step 14's formation counter-move target, withdrawn on measurement, and Step 15's
tactical structural observation line, not met because the long-run report fields
one formation for every club. Nothing was re-thresholded to make either read as
delivered.

The carried `goals_per_match_avg` monitor is **closed at cohort scale** - mean
`2.670`, p95 `2.740`, band `2.3 .. 3.0` unchanged, failing in `0` of `50` worlds
over `1000` seasons - against the `36/634/80` inherited from Phase 80A.

The phase was originally planned under an accepted product/architecture contract,
and next in order.

The 2026-08-02 phase-order decision moves this phase ahead of the market work,
which is renumbered Phase 82A (incoming offers, postures, loans) and Phase 82B
(competitive race). Two facts drove it. Phase 80A cannot close because
`goals_per_match_avg` fails high on `80` of `750` worlds and match scoring is
outside its player-model scope; this phase owns match scoring, and Step 06
replaces the opportunity generation that produces those goals, so a narrow
pre-fix would calibrate code Step 06 removes. Separately, Steps 02, 08, and 09
build the seams a background-world simulator needs, and running the market work
first would multiply their migration surface across 270 clubs.

The rationale, the measured evidence, and the declared costs are recorded in
`docs/the-long-season-mondo-vivo.pdf`, section 11.

## Goal

Make the manager's pre-match and in-game football decisions causally meaningful
without cloning Football Manager: preserve the deterministic aggregate
per-minute engine, add typed intrinsic tactical shape plus relational matchup,
make opportunities phase-aware, and use the same truth for live play, AI,
explanation, diagnostics, and persistence.

The governing contract is:

- `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`

## Entry Gate

- Phase 80 is Done and Phase 80A is Done.
- Phase 80A closed by carrying its unchanged `goals_per_match_avg` monitor
  failure to this phase under an explicit ownership decision. The monitor was
  not weakened, its denominator was not changed, and its result was not
  suppressed; it changed owner, not severity.
- Phases 82A and 82B are Planned and deliberately not started. Loans, postures,
  and competitive races do not exist yet, and no step of this phase may assume
  them.
- The current match engine still reproduces the Step 01 baseline, including
  equal-quality `4-4-2` and `3-1-6` equivalence.
- Phase 79 Step 14 remains Reopened, paused, unrun, and unclaimed.

## Locked Decisions

- Keep one deterministic, aggregate, per-minute match engine.
- `TeamStrength` remains player quality; it is not tactical shape.
- One intrinsic Module derives phase/channel capacities for a single side.
- One relational Module compares the side's own phase chain and the opponent's
  complementary capacities.
- Shape emits no universal formation score and no named extreme-formation
  penalty.
- `FormationLine`, `FormationPositionFamily`, `FormationSide`,
  `CanonicalPlayerRole`, and suitability cross the seam as domain unions, not
  strings.
- Suitability modifies coordinated execution only; role weights already own
  the destination-role attribute effect.
- Current directness, pressing, width, risk, and mentality gain explicit
  bounded football semantics. No new tactic control is added.
- Opportunities gain a structured aggregate route; there is no complete pass
  chain.
- Chance actors are selected before outcome and contribute causally without
  becoming autonomous agents.
- Pre-match, live, AI, and batch paths rebuild through the same team-context
  seam.
- Shape/matchup are derived simulation facts, not a second career ledger.
- One beta reset removes incompatible active-match/event state; no migration
  or compatibility branch remains.
- UI shows qualitative structured consequences, not formulas or an optimal
  answer.
- Phase 81 Step 15 alone owns this phase's checkpointed `50 x 20` with exactly
  seven workers. It observes the accepted match engine and a world without
  loans or races, so it is engine evidence only; Phase 82B Step 09 owns the
  separate market cohort.

## Accepted Amendments

Eight amendments accepted on 2026-08-02 with the phase order. Five carry the
background-world requirements forward so no seam is built twice; three are new
and come from the market work moving after this phase.

- **A1 - background driver is a first-class consumer** (Steps 02, 08). Building
  a match context for a club the user has not selected is a named case of the
  single constructor, not an afterthought. Naming it now costs one contract
  line; discovering it later costs a second migration.
- **A2 - XI selection covers every club** (Step 09). The canonical selection and
  typed formation hold for all clubs in the world, not only the user's
  opponents. Stated explicitly so the step cannot be narrowed in scope.
- **A3 - per-component measurement.** Deferred to the background-world phase on
  2026-08-02, now numbered Phase 81B. The
  bench that reports cost per tick by component exists to size the background
  world, and that is Phase 81B's work; building the instrument here would
  measure a cost this phase does not yet spend. Phase 81B Step 04 owns it.
  Recorded so the requirement is not lost, not because this phase does it.
- **A4 - quality bands are population-conditioned** (Step 01 and the contract).
  The frozen quality-versus-structure bands hold for a single-country
  population. With five countries, "first division" and "third division" stop
  denoting one quality scale, and the bands must be re-derived rather than
  carried over silently.
- **A5 - match RNG derives from `(worldSeed, fixtureId)`** (Step 06). Step 06
  already introduces a dedicated stream for routes, which is the right moment to
  fix the key. Order, timing, and scheduling then cannot affect a result, which
  is what later makes background fixtures safe to resolve in any order.
- **A6 - one named squad-depth accessor** (Steps 02, 09). No production path in
  this phase composes a lineup by reading `club.playerIds` directly. Step 09
  selects an XI for every club in the world, and Phase 82A must later separate
  ownership from selectability because a loaned player is fielded by a club that
  does not own him. With one accessor that is one definition; without it, it is
  33 current readers multiplied across 270 clubs.
- **A7 - this phase owns `goals_per_match_avg`** (Steps 01, 11, 12, and the
  Definition of Done). Step 01 freezes current behaviour as a regression
  baseline, which would otherwise freeze the out-of-band goal rate along with
  it. The monitor is carried in unchanged from Phase 80A and must be inside its
  predeclared band by Step 13.

  **Discharged at Step 13 on 2026-08-06**, `20/0/0` pass/warn/fail over twenty
  worlds of ten seasons, mean `2.760`, against the inherited `36/634/80`.
  Threshold, denominator and severity class are exactly as inherited and no owner
  was reopened, so the recorded disagreement about whether Step 06 or Step 07
  owns the movement is moot and stays unresolved on purpose. Step 15 still
  confirms it at cohort scale; if it is out of band there, the question returns
  with it.
- **A8 - contexts take an explicit squad; match facts record who played**
  (Step 08). The context constructor accepts the players who will play rather
  than deriving them from a club, and recorded match facts and statistics
  attribute to the club a player was fielded by, not to the club that owns his
  contract. Without this, Phase 82A's first loan corrupts the statistical
  history rather than extending it.
- **A9 - the asymmetry is two bounds, not a ratio** (Steps 01, 06, 11, and the
  contract's frozen-threshold table). Accepted 2026-08-03, after Step 06.
  `asymmetric_incoherence_cost` divided the worst shape's deficit by the best
  shape's surplus and demanded `>= 2`. It asserted two different things at once,
  and only one of them is a rule the engine must obey. *Incoherence costs a lot*
  is a rule. *Coherence pays little* is not: it is a consequence of the reference
  `4-4-2` already being the optimum of a population of ten central clones, which
  is exactly why the denominator does not exist. The surplus measured `0.0431`
  at Step 01, `0.0288` before Step 06's calibration and `0.0156` after it -
  always inside the `0.0477` noise floor, at every calibration anyone measured -
  so the invariant reported `not_evaluated` from the day it was written and
  would have done so forever. Satisfying it literally would have required
  asserting that some department count beats a balanced one at identical
  players, which is not true football.

  It is replaced by `incoherence_costs_a_division_tier`: the worst shape's
  deficit against the reference must be at least `1 x` the division-tier edge.
  Paired with the unchanged `bounded_structural_swing` at `0.75 x`, the two
  one-sided bounds carry the whole original claim - incoherence costs at least
  `1.33x` what coherence may pay - while both halves are measured against a
  quantity that exists. **Nothing is widened**: a ratio with no denominator is
  replaced by a bound on a quantity that has one, and `not_evaluated` is still
  never reported as a pass. Left standing, the hole would eventually have been
  closed by relaxing something, which is the failure this amendment prevents.
  `docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md` keeps the retired invariant
  as Step 01 recorded it; it is the before-state and is not regenerated.

- **A10 - one inspection run is permitted before Step 15, and it is never
  evidence** (Step 11 and Step 12). `No cohort before Step 15` stays as written and
  is not weakened: it exists so a smaller run cannot be cited as balance
  measurement and then contradict the real cohort.

  What it did not anticipate is that the phase would rebuild *who does what* on
  the pitch and close without anyone ever looking at a league table. An
  aggregate cannot show that: `goals_per_match_avg` reads the same whether
  strikers or centre backs scored. A scorer chart with roles shows it in one
  glance, and the cost of finding that out at Step 15 is the whole phase.

  The amendment permits exactly one run of `20 x 5` under a hard condition: **no
  calibration value may change because of it, no band may be widened by it, and
  no document may cite its numbers as balance evidence.** A defect it makes
  visible is investigated and handed to the step that owns the behaviour. Step
  **15** remains the only statistical cohort Phase 81 closes on, unchanged in
  seed, scale, workers and command. If the condition cannot hold, the run does
  not happen and the charts wait for Step 15.

  Two clarifications the run itself forced, both recorded rather than worked
  around:

  - **`20 x 5`, not `5 x 20`.** Club ability spread falls from `6.04` to `2.92`
    across twenty seasons, so a long horizon measures a world whose clubs have
    stopped being unequal and reports it as a match-engine result. Twenty
    independent squad generations read early beat five read late. The long
    horizon is Step 15's question and Step 15 is powered for it.
  - **A world that cannot be simulated to the end is excluded and declared.**
    `no seed excepted, no season excluded` was written to stop an inconvenient
    result being dropped, and it still forbids exactly that. It does not require
    reporting nothing when a world *crashes*: those worlds are counted, named,
    and their cause printed in the report, with the selection effect stated. A
    silent drop remains forbidden.

## Ordered Steps

1. `01-reproducible-extreme-shape-baseline-and-frozen-contract.md`
2. `02-typed-tactical-slot-context-and-collapse-removal.md`
3. `03-intrinsic-tactical-shape-profile-and-diminishing-returns.md`
4. `04-relational-phase-matchup-and-route-capacity.md`
5. `05-position-suitability-coordination-without-double-penalty.md`
6. `06-phase-aware-control-opportunity-routes-and-tactic-semantics.md`
7. `07-route-quality-causal-actors-and-explanation-facts.md`
8. `08-live-session-persistence-event-schema-and-beta-reset.md`
9. `09-ai-whole-xi-selection-and-shared-tactical-decisions.md`
10. `10-pre-match-and-live-tactical-consequence-ui.md`
11. `11-season-recap-instrument-and-football-plausibility-gates.md`
12. `12-hundred-season-engine-inspection.md`
13. `13-non-vacuous-tactical-diagnostics-and-integrated-gates.md`
14. `14-formation-as-a-counter-move.md`
15. `15-checkpointed-50x20-phase-report-and-mvp-handoff.md`

File order is execution order. The two new steps sit at `11` and `12` for a
reason, and it is not tidiness.

**Step 13's entry gate requires that no known work remains**, so it cannot
precede them. It is also the deadline for the carried `goals_per_match_avg`
monitor, and its own review says that a monitor still out of band reopens Step
06 - a decision nobody should take having never looked at a league table. Its
gates read invariants, and invariants stay green while centre backs top the
scoring chart.

**Step 14** had to raise formation from `0.0312` to `~0.047` as a counter-move
reward, and it cannot judge whether it succeeded without a baseline showing
which shapes clubs actually field and how those shapes finish. Step 12 is that
baseline, and afterwards it is the instrument that says whether Step 14 improved
the football or only the number.

**It did not raise it, and the reason is recorded rather than retried.** Step 14
built the formation-versus-formation matrix, measured the counter-move reward on
two seed prefixes at `0.0064` and `0.0117` against a `0.0295` floor, and swept
the lever it was told to pull over `57` configurations without ever producing a
non-transitive matrix. The target is withdrawn, not deferred; its successor needs
a lopsided population and conserved capacities together.

## Validation Ladder

- Step 01 freezes exact current behaviour, denominators, thresholds, ownership,
  and absence assertions without gameplay changes. It also accepts the carried
  `goals_per_match_avg` monitor as this phase's own (A7), records its inherited
  `36/634/80` distribution as the starting point rather than as an acceptable
  one, and states the single-country condition on the quality bands (A4).
- Step 02 carries typed football facts into the match and removes the web
  four-way collapse. It also names the background driver as a first-class
  consumer (A1) and introduces the single squad-depth accessor (A6).
- Step 03 derives intrinsic shape with diminishing returns. It is a headless
  structural milestone and makes no gameplay-fix claim.
- Step 04 derives relational phase/channel matchups without final result logic.
  It is also headless and leaves match results unchanged.
- Step 05 adds suitability only to coordination contributions and is the last
  headless milestone before production behaviour changes.
- Step 06 replaces scalar/texture-only opportunity generation with structured
  phase-aware routes, completes current tactic semantics, and is the first
  end-to-end gameplay gate for the frozen quality-versus-structure hierarchy.
  It fixes the match RNG key as `(worldSeed, fixtureId)` (A5) and is the first
  step that can move `goals_per_match_avg`, because it owns how many
  opportunities exist and how they convert.
- Step 07 makes route quality and actors causal while retaining an aggregate
  resolver.
- Step 08 gives live changes the same path, persists final facts once, and
  resets incompatible beta saves. It also lands the single context constructor
  taking an explicit squad, and records match facts by the club a player was
  fielded by (A8).
- Step 09 migrates AI selection and decisions onto the same evaluator and
  immediately re-proves the frozen quality-versus-structure matrix with the
  canonical AI-selected XIs. Its selection covers every club in the world (A2)
  and reaches squad depth only through the named accessor (A6).
- Step 10 presents small qualitative consequences through `@game/ui` and web.
- Step 11 turns the facts a season already produces into four football charts -
  table, scorers with role, assists with role, shapes fielded - each with a band
  declared in advance that it can fail. It adds no simulation.
- Step 12 runs one hundred seasons through them under A10 and reads the result,
  `20` worlds by `5` seasons, with a per-club shape the report path never had.
  It is the first point in the phase where a person looks at a league table and
  a scorer chart and recognises the sport, and it changes nothing.
- Step 13 runs bounded positive-denominator diagnostics, browser QA, absence
  checks, and the integrated repository gate. It is the deadline for the carried
  `goals_per_match_avg` monitor (A7), and it now judges an engine somebody has
  already looked at. **Done 2026-08-06.** Every frozen invariant passes on three
  populations; A7 is discharged at `20/0/0` and is not carried a third time; the
  web four-role collapse was found live and fixed in Step 02, reopened; and the
  step's own A6 Definition-of-Done line is recorded as not met rather than
  claimed. Its main result is for Step 14: the structural shape gain is not
  reproducible across seed populations.
- Step 14 then owns formation as a counter-move, with Step 12's shape usage and
  finishing positions as its baseline. **Done 2026-08-06**, with its own central
  target recorded as not met. It adds the formation-versus-formation matrix and
  the `no_dominant_formation` gate - which reuses the existing `0.55` and passes
  at `0.5184` and `0.5210` with `0 of 23` shapes uncountered - fixes the
  forced-shape crash Step 12 handed it, and proves by sweep that the route
  weighting it was permitted to change is the wrong lever. Nothing was
  re-thresholded to make the target read as delivered.
- Step 15 alone runs/replays the checkpointed `50 x 20`, confirms the carried
  monitor inside its band at cohort scale, writes the phase report, and hands
  control to Phase 81A. Phase 79's own Step 14 stays Reopened, paused, and
  unclaimed.

## Mandatory Per-Step Loop

For every step:

- reread `docs/PROJECT_STATUS.md`, this README, the active step in full, and
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`;
- modify only Expected Files plus `docs/PROJECT_STATUS.md` and a permitted
  next-step lesson;
- if a necessary local refactor file is discovered, add it to the active
  step's Expected Files and explain the ownership before modifying it;
- remove obsolete code and fixtures made redundant by the step;
- add useful JSDoc/TSDoc to new or materially modified exported functions and
  types;
- run focused checks, fix failures, update the step/status/roadmap, and only
  then advance;
- keep all later steps Not started.

## Phase-Level Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

The longitudinal command runs only in Step 15.

## Clean-Code Gate

- No dead code, obsolete helper, duplicated formula, open-string tactical
  mapping, compatibility fallback, or redundant fixture remains undocumented.
- No generic utility Module is introduced where a football concept owns the
  behaviour.
- Engine, AI, diagnostics, UI, and web do not duplicate shape/matchup rules.
- The Interface stays smaller than its Implementation and is the test surface.
- Refactors remain local to the active owner; unrelated cleanup is documented
  and scheduled rather than mixed silently into a step.
- Nothing is orphaned by a change. When a step removes or replaces a behaviour,
  the helpers, props, fixtures, translation keys, and tests that existed only to
  serve it go with it in the same step. This gate has already caught real drift
  in Phase 80: an unreachable navigation label kept in five locales, and a prop
  that survived only to route one dead branch.
- No fallback stands in for a missing case. Domain unions are handled by total
  mappings with an exhaustiveness guard, so adding a case fails the build
  instead of silently taking a default.

## What NOT To Implement

- No autonomous-player, real-time physics, or continuous-coordinate engine.
- No named formation penalties or whitelists.
- No new tactic settings, training/familiarity system, weather, staff, morale,
  or team talks.
- No React-owned gameplay calculation.
- No full pass-chain or generic duel framework.
- No generic strategy/plugin registry or event bus.
- No beta compatibility.
- No cohort before Step 15. The single `20 x 5` inspection run A10 permits is
  not one: it produces no evidence and may change nothing.
- No loan, posture, competitive-race, or free-agent-negotiation behaviour. Those
  belong to Phases 82A and 82B and do not exist yet.
- No background-world simulator, multi-country topology, or aggregate result
  producer. This phase builds the seams they will use and stops there.
- No contract-duration or market-density change: that is Phase 81B
  that follows this phase.
- No new direct reader of `club.playerIds` in a lineup-composing path (A6).
- No weakening of the carried `goals_per_match_avg` monitor: its threshold,
  denominator, and severity class stay exactly as inherited (A7).
- No Phase 79 Step 14/15 implementation.

## Definition Of Done

- Manager formation, lineup, role, suitability, and tactic choices have
  deterministic, football-readable effects before and during the match.
- Equal-quality `3-1-6` and `4-4-2` are structurally and statistically
  distinguishable without named penalties.
- Severe incoherence may overturn only a modest quality advantage; a generated
  First Division title contender remains the aggregate favourite over a
  generated Third Division mid-table side under the frozen extreme-shape
  handicap, while individual upsets remain possible.
- Intrinsic shape and relational matchup have separate deep Modules.
- Typed domain facts cross all seams exhaustively.
- Opportunity routes, quality, actors, events, and explanations remain
  coherent.
- AI and manager use the same tactical truth.
- Live changes affect minute `N + 1` only and survive reload without reroll.
- Bounded diagnostics cannot pass on zero observations.
- Clean-code, repository, browser, persistence, determinism, dependency, diff,
  and Graphify gates pass.
- The carried `goals_per_match_avg` monitor sits inside its unchanged
  predeclared band by Step 13 and stays there at cohort scale in Step 15. If it
  does not, the phase does not close: the failure is neither re-scoped again nor
  absorbed by adjusting the band.
- Per-component tick costs are measured and reported for match engine, context
  construction, career application, market, development, and persistence.
- Squad depth is reached through one named accessor, and no lineup-composing
  path reads `club.playerIds` directly.
- Match facts and statistics attribute to the club a player was fielded by, so
  Phase 82A can introduce loans without rewriting recorded history.
- This phase's `50 x 20` completes and replays with 50 stable shards and exactly
  seven workers, and the report states plainly that it observed no loans and no
  races and is therefore not market evidence.
- Phase 81B receives a truthful background-world handoff naming the contract-duration
  representation change, the background-fixture resolution point, and the
  simulate-match command.
- Phase 79 Step 14 remains separately unrun and unclaimed.

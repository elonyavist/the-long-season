# Step 06 - Phase-Aware Control, Opportunity Routes And Tactic Semantics

## Status

In progress. The step runs in three internal blocks so the repository is
compiling and tested at every pause, rather than broken half-way through a
migration that touches four packages.

| Block | What it delivers | State |
|---|---|---|
| 1 - context migration | `shape` and the calibration become required, every composition root supplies them | Done 2026-08-03, all gates green |
| 2 - route model | `opportunity-route.ts`, route-driven chance volume and type, shape-driven possession, the five tactic semantics, telemetry | Not started |
| 3 - calibration | frozen matrices, dominance gate, `goals_per_match_avg` | Not started |

### Block 1 - Adopted Solution

**One scoring pass produces both readings.** Six places built a
`MatchTeamContext` and each called `deriveTeamStrength` separately. Adding a
second call for intrinsic shape beside each of them would have been six chances
for the two to describe different lineups, so `deriveTeamShapeAndStrength(...)`
in `tactic-team-context.ts` now returns `{ strength, shape }` from one call to
`deriveLineupSlotScores`, and every producer spreads it. This is Step 03's
"nothing derives per-slot quality a second time" made structural.

**The calibration travels on `MatchContext`, not only on the builders.** The
minute loop reads the calibration numbers directly - how hard a bottleneck
bites, how far a tactic knob may move a route - so a context that lacked them
could not be simulated. It sits beside `engineConfig` for the same reason that
field exists: a context must be enough to simulate a match without reaching for
content.

**A shape stamped with the wrong policy is refused.** Both team shapes must
carry `context.matchTacticsCalibration.version`, checked in
`assertValidMatchContext`. A shape derived under an older calibration is
silently wrong rather than obviously broken - its numbers still look valid - so
the stamp is the only cheap evidence that the context was assembled from one
policy.

**`SimulateSeasonTeamInput` now carries the squad instead of a precomputed
strength.** `strength` was a stored derivable, which the project rules forbid,
and every production caller already derived it from the lineup immediately
before handing it over. Worse, once shape came from the lineup and strength came
from the caller, the two could describe different elevens. `players` and
`roleWeights` are now required and `strength` is gone; a new optional
`playerStates` preserves the one thing the precomputed value carried that the
lineup did not - a caller's static condition when no fitness lifecycle runs.

### Block 1 - Scope Corrections Found Against The Code

**The inherited eleven-file list was not the real one.** Some of those files
never build a context; others that do were missing. The actual producers are
`buildTacticTeamContext`, `buildAiSquadMatchTeamContext`, three private builders
in `use-cases/simulate-season.ts`, `buildTacticalShapeTeamContext` in the audit
tool, and the two default-opponent fallbacks in the web adapter and the CLI
career command. `apps/cli/src/commands/tactical-shape-report-data.ts` was absent
from the list and does build one.

**`FakeLeagueSystem` restated three fields of `FakeGameplayConfig` instead of
extending it**, so adding the calibration to the gameplay bundle would have left
the league facade without it. It now extends the interface and the three copied
fields are gone.

**Curves without states used to be an accepted no-op and briefly stopped being
one.** `SimulateSeasonTeamInput.stateMultiplierCurves` may be supplied by a
caller who has not enabled the fitness lifecycle; `deriveTeamStrength` rejects
curves with no states. `dynamicStateInputs(...)` now passes the curves only
alongside the states they read, which is what the existing "inactive
fitness-ready team data preserves default output" test demands.

**The season fixture claimed a strength no lineup could produce.** Its clubs
fielded a goalkeeper and a striker while asserting all four departments at the
club rating. Derived honestly, that eleven has no defence and no midfield, and a
season where nobody has either is not one the route model can be measured
against. The fixture now fields one slot per department. Every table row, score,
and shot count in the golden sentinel survived unchanged; only the scorer
attribution and one event count moved, because there are now four candidate
actors per side instead of two.

### Block 1 - Verification

```text
pnpm exec vitest run (whole repository)     269 files, 1909 tests passed
pnpm lint                                   exit 0
pnpm depcruise                              no violations (805 modules, 3244 dependencies)
typecheck, all 10 workspaces                exit 0
git diff --check                            clean
```

### Block 2 - Design Settled Before Writing It

Recorded here so the shape of the model is a decision, not something rebuilt
from memory. Contract section 6 locks what each knob means; this is how those
five sentences become code.

**Every knob gets exactly one benefit and exactly one cost, both typed.** Two
total mappings live in domain beside `TACTICAL_ROUTE_DEFINITION`, because "which
route does pressing favour" is football vocabulary, not a tuned number:

| knob | favours | exposes | why the cost is credible |
|---|---|---|---|
| `directness` | `direct`, `transition` | `transition` | skipping midfield gives the ball back higher up |
| `pressing` | `transition` | `transition` | a line pushed up is a line that can be run behind |
| `width` | `left`, `right` | `central` | stretching wide empties the middle |
| `risk` | none | `transition` | more attempts, more turnovers, no route preference |

`mentality` is not a route knob. It sets a commitment level on a five-step
ladder that scales own chance volume and the `transition` the opponent is
offered, and it is the one input that reads score and minute state.

Content owns only magnitudes: how far a knob at its cap may tilt route
preference, move own volume, and raise what it exposes, plus the commitment
ladder and how far a goal of deficit bends it. Which route each knob touches
stays typed code, exactly as Step 04 kept the route definitions out of content.

**Routes replace both current inference paths.** `deriveOpportunityRate`'s
strength Bernoulli and `deriveChanceType`'s `deterministicShotTexture` both go.
A minute picks one route per side from bounded weights on a dedicated RNG
stream; the chosen route decides whether a chance exists, its type, and the
quality bias handed to the aggregate resolver. Route to chance type is a total
typed mapping: flanks produce `cross`, `transition` produces `counter`, `central`
and `direct` produce `open_play`. Set pieces stay with the discipline model.

**Possession stops being `strength.midfield`.** Control blends department
strength with the shape's own build-up, central progression, and pressing
cohesion contested by the opponent, so an empty midfield department is no longer
the only way to express a broken connection. The share content owns is one
number.

**Pressing is multiplied exactly once.** Step 04 already contests build-up
through `pressing_cohesion`. This step scales that capacity by the pressing
knob before the matchup runs; it does not add a second pressing term afterwards.

## Inherited From Step 03

Two obligations were deliberately left here rather than done early. Both are
recorded against the code as it stands after Step 03.

**No tactic input touches the intrinsic shape profile, and none may be added
there.** Step 03's text asked for "current tactics where intrinsically
relevant". The answer, measured against the design contract, is *none of the
five*. Contract section 6 gives each knob an owner in this step, and each of
those owners reads the intrinsic profile: pressing changes advanced recovery
pressure *only when shape is coherent*, so it multiplies `pressing_cohesion`
here. Had Step 03 also folded pressing into `pressing_cohesion`, this step
would square it. The same argument holds for width against the lateral
capacities. The profile answers "what can this shape do"; this step answers
"what does the manager do with it", and the multiplication happens exactly
once, here.

**`MatchTeamContext.shape` is optional and this step makes it required.**
Step 03 derives the profile inside `buildTacticTeamContext` when the caller
supplies `matchTacticsCalibration`, and omits it otherwise. That is not a
fallback - there is no default calibration and no invented profile - but it is
temporary. This step consumes the profile in the route model, so it must
migrate every production context constructor to pass the calibration and then
make both the input and the field required:

- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/career/progression.ts`
- `apps/cli/src/commands/fake-season-input.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/live-match-control-report-data.ts`

Add them to this step's Expected Files when it starts. The engine imports no
content, so each of these is a composition root that must select the
calibration explicitly.

## Inherited From Step 04

**Pressing currently dominates the named bottleneck, and this step owns the
number that decides it.** With the shipped
`pressingContestWeightBasisPoints: 5000`, an ordinary shape's contested
build-up lands near `0.39` while every other capacity sits near `0.52`, so
`build_up` is the reported bottleneck on almost every route for almost every
balanced shape. It correctly switches to the genuinely broken phase when one
exists - `8-0-2` reports `central_progression` - so the diagnostic
discriminates where it matters, and playing out under pressure being the
hardest phase is defensible football. It was left alone at Step 04 because that
step tunes nothing: this step tunes coefficients against the frozen bands, and
the qualitative consequence surface reads the bottleneck. If "your build-up is
the problem" is the answer for every shape, the number is too high, not the
explanation.

**Step 04's measured route matrix**, on the shipped calibration at equal
quality, is the baseline this step must not regress:

| attacker vs defender | central | left/right | direct | transition |
| --- | --- | --- | --- | --- |
| `4-4-2` vs `4-4-2` | `0.445` | `0.446` | `0.440` | `0.499` |
| `4-4-2` vs `3-1-6` | `0.446` | `0.559` | `0.441` | `0.498` |
| `3-1-6` vs `4-4-2` | `0.443` | `0.443` | `0.445` | `0.524` |
| `4-4-2` vs `8-0-2` | `0.446` | `0.487` | `0.442` | `0.474` |
| `8-0-2` vs `4-4-2` | `0.411` | `0.432` | `0.443` | `0.478` |

## Goal

Use tactical matchup facts to derive possession/control and structured
opportunity routes while giving every current tactic input explicit bounded
football semantics.

## User-Facing Reason

Directness, pressing, width, risk, and mentality should change how a team tries
to play and what it exposes, not merely shift opaque scalar coefficients.

## What To Implement

- Introduce one typed aggregate opportunity-route union with total mappings.
- Replace the direct attack/midfield-versus-defence Bernoulli input with route
  capacities derived from the relational matchup.
- Preserve one bounded per-side opportunity decision per simulated minute.
- Derive route choice from shape, opponent, score/minute state, tactics, and a
  dedicated deterministic RNG stream.
- Fix the match RNG key as `(worldSeed, fixtureId)` and nothing else (A5). This
  step already introduces a dedicated stream for routes, so it is the right
  place to state the rule for the whole match. The consequence is required
  later: with the key anchored to the fixture, order, timing, and scheduling
  cannot affect a result, which is what makes background fixtures safe to
  resolve in any order, in blocks, or on a worker.
- Implement the locked semantics for directness, pressing, width, risk, and
  mentality. Every benefit has a cost or shape prerequisite.
- Replace texture-only cross/counter inference where route truth now owns it.
- Keep possession bounded and explicitly derived; prevent zero-midfield from
  becoming the only representation of broken connection.
- Extend structured telemetry with route attempts/successes/turnovers needed by
  diagnostics and later UI, without persisting per-tick events.
- Add deterministic, mirror, clamp, route-frequency, extreme-shape, tactic
  trade-off, score-state, and stronger-team tests.
- Run the exact paired-seed quality-versus-structure matrix frozen in Step 01.
  This step, not Step 11 or Step 12, owns the first end-to-end proof that:
  - equal-quality coherent and incoherent shapes produce a material but bounded
    difference in match opportunity/xG facts;
  - severe incoherence can overturn a modest quality advantage;
  - the generated First Division title contender remains the aggregate
    favourite over the generated Third Division mid-table side despite the
    accepted `3-1-6` versus coherent `4-4-2` handicap.
- Prove the three structure-versus-quality invariants frozen in Step 01, because
  this is the step whose coefficients decide them: the bounded swing against one
  division tier of quality, the full shape-versus-shape matrix showing no
  dominant shape, and the asymmetry that makes incoherence cost more than
  coherence pays. Report the matrix in full. If any shape holds a positive
  expected win share against the whole population, the coefficients are wrong
  here; do not widen an invariant to accommodate them.
- Tune only versioned policy coefficients needed to satisfy those frozen
  product bands. Do not change a scenario, seed, denominator, threshold, or
  hierarchy. Freeze the resulting policy version when this step closes.
- Measure `goals_per_match_avg` against the band carried in from Phase 80A
  (A7). This step owns how many opportunities exist and how they convert, so it
  is the first step whose coefficients can move the monitor. Record the measured
  value here even though Step 11 is the deadline: an out-of-band reading at this
  point is diagnosable, whereas the same reading discovered at Step 11 is a
  regression across five intervening steps.

## Clean-Code Requirements

- One Module owns route selection and route-to-chance semantics.
- Delete superseded scalar/texture helpers and their fixtures in this step.
- Do not leave both old and new opportunity formulas selectable through a
  boolean or compatibility mode.
- Keep coefficient data in the versioned policy and football semantics in
  typed engine code.

## What NOT To Implement

- No final route-quality/actor integration; Step 07 owns it.
- No complete pass chain or per-pass event.
- No new tactic control or UI.
- No result scripting or universal balance bonus.
- No scoring-rate correction applied outside the route model. The carried
  monitor is satisfied by the structure this step introduces, never by a
  post-hoc goal multiplier.
- No RNG input beyond `(worldSeed, fixtureId)`: not wall-clock time, not
  iteration order, not a per-session counter.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/match-engine/opportunity-route.ts`
- `packages/engine/src/match-engine/opportunity-route.test.ts`
- `packages/engine/src/match-engine/match-control.ts`
- `packages/engine/src/match-engine/match-control.test.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/step-match.test.ts`
- `packages/engine/src/match-engine/match-simulation-state.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

Added during block 1, because making `shape` and the calibration required is
this step's own obligation and every producer of a `MatchTeamContext` is inside
that obligation:

- `packages/engine/src/match-engine/match-context.ts` - owns the field that
  becomes required and the policy-version invariant.
- `packages/engine/src/match-engine/tactic-team-context.ts` - owns the builder
  input that becomes required, and now owns the shared
  `deriveTeamShapeAndStrength(...)`.
- `packages/engine/src/team-selection/ai-squad-selection.ts` - builds a context
  for every AI side.
- `packages/engine/src/use-cases/simulate-season.ts` - builds three, and owned
  the stored `strength` that had to go with them.
- `packages/engine/src/career/progress-fixture.ts` - threads the calibration to
  the AI builder and into the simulated context.
- `packages/simulation-tools/src/calibration-report.ts` - read the stored season
  strength that block 1 removed.
- `packages/content/src/generators/gameplay-config.ts` and
  `packages/content/src/generators/league-system.ts` - content is the
  composition root that decides which calibration version travels with a world.
- `apps/web/src/features/matchday/matchday-adapter.ts`,
  `apps/cli/src/commands/simulate-season.ts`,
  `apps/cli/src/commands/career/progression.ts`,
  `apps/cli/src/commands/fake-season-input.ts`,
  `apps/cli/src/commands/live-match-control-report-data.ts`,
  `apps/cli/src/commands/tactical-shape-report-data.ts`,
  `apps/cli/src/commands/ten-season-report/report-data.ts` - the composition
  roots named by the inherited migration list, plus the report command that list
  missed.
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts` and
  `packages/simulation-tools/src/test-fixtures/{match-tactics-calibration,season-team-input}.ts`
  - new shared test fixtures. Three engine tests already carried near-identical
  private calibrations; they now share one. Simulation tools may not import
  content, so that package needs its own copy - one per package boundary is what
  the dependency rule forces, and the validation those numbers must satisfy
  still lives once, in domain.
- The test files of every module above.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/schemas/match-tactics-calibration.schema.test.ts \
  packages/engine/src/match-engine/opportunity-route.test.ts \
  packages/engine/src/match-engine/match-control.test.ts \
  packages/engine/src/match-engine/step-match.test.ts \
  packages/engine/src/match-engine/match-explanation-trace.test.ts \
  packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Opportunities have a typed structured route.
- All current tactic inputs, including mentality, have bounded trade-offs.
- `3-1-6`, `2-0-8`, overload, pressing, and direct-play scenarios move route
  facts in predeclared directions.
- The frozen quality-versus-structure matrix passes with positive paired-seed
  observations and all numeric opportunity, xG, and outcome-share bands.
- The three structure-versus-quality invariants hold: the maximum structural
  swing stays below one division tier of quality, no shape holds a positive
  expected win share against the whole opponent population, and incoherence
  costs more than coherence pays. The full shape-versus-shape matrix is
  recorded.
- The final policy version is frozen for Steps 07-12; later evidence may reopen
  this owning step but may not weaken the bands.
- This is the first step allowed to claim the original gameplay defect fixed;
  later steps preserve rather than discover that balance.
- Old texture-only chance-type and scalar-only opportunity owners are removed
  where superseded.
- Deterministic replay and clamps pass, and identical `(worldSeed, fixtureId)`
  pairs reproduce identical results regardless of resolution order.
- The measured `goals_per_match_avg` is recorded against the carried band, with
  its distance from the inherited `36/634/80` starting point stated either way.
- Step 07 is the only next action.

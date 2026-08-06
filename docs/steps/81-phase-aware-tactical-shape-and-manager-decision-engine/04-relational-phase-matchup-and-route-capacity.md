# Step 04 - Relational Phase Matchup And Route Capacity

## Status

Done on 2026-08-03. One reopen candidate is recorded below, raised by Step 06's
measurements and not acted on there because it changes this step's frozen model
rather than a coefficient.

### Reopen Candidate - A Route's Defining Phase Carries `11.7%` Of Its Chain

Step 06 measured the real `FORMATION_CATALOG` population and found that the
decision a manager actually makes - which formation to field - moves the game
about a third as much as dragging one tactic slider does. Cross share spans
`0.3254` to `0.3851` across every formation and `0.2562` to `0.4639` from the
`width` slider alone on one of them. Win share across formations spans `0.030`,
*inside* the `0.0477` measurement noise floor.

The cause is this step's chain, and it is arithmetic rather than tuning.
`chainCapacity` is `65%` weakest link plus `35%` average. On a flank route the
weakest link is the contested build-up, which every formation shares and which
therefore carries no formation identity at all, so the capacity that *defines*
the route - `left_progression` - reaches the chain only through the average, as
one of three links: `0.35 / 3 = 11.7%`. A real `4-3-2-1` has `12.8%` less
lateral progression than a `4-4-2` and the route receives `1.5%` of it.

Step 06 verified that no coefficient fixes this. Raising
`chainBottleneckWeightBasisPoints` makes it *worse* - the `4-3-2-1` flank delta
falls from `-1.7%` to `-0.1%` at `8500` - because the weight lands on the shared
link. Lowering `pressingContestWeightBasisPoints` helps only where it flips
which link is weakest, which is a discontinuity and not a mechanism to tune on.

The shape of a fix, if this is reopened: give each route's defining phase a
declared share of the non-bottleneck part instead of an equal third, so a flank
route reads flank quality, a central route reads central progression, and
`direct` and `transition` read what they are about. That is a change to
`TACTICAL_ROUTE_DEFINITION`, which this step deliberately keeps as typed code -
so it is a model decision for the phase contract, not content tuning.

### Adopted Solution

`packages/engine/src/match-engine/tactical-matchup.ts` compares two intrinsic
profiles and produces five named routes - `central`, `left`, `right`, `direct`,
`transition` - each with a bounded capacity, its own chain value, the
opponent's resistance, and **the phase that limited it**. Step 01 froze no
route set, so the five named in this step's own text are the set.

Three ideas, and nothing else:

1. **A route is a chain, and a chain is worth its weakest link.** Six forwards
   do not help if nothing reaches them. `chainBottleneckWeightBasisPoints`
   decides how sharply the weakest phase dominates, and validation refuses any
   value below half, where the average would take over and a dead phase would
   stop mattering.
2. **Pressing bites into build-up, and only build-up.** That is the whole of
   "pressing pays only when shape is coherent": `pressing_cohesion` is itself a
   shape capacity, so an incoherent press is a weak press. It is also why the
   two routes that skip build-up - `direct` and `transition` - are what a
   pressed side falls back on.
3. **Resistance is a chain too**, because the attacker exploits the weakest
   defensive phase. One formula serves both sides rather than two that can
   disagree.

The route definitions are typed code (`TACTICAL_ROUTE_DEFINITION`), not
content: content owns how hard a bottleneck bites, never whether a route down
your left meets the opponent's right. `TACTICAL_SHAPE_CAPACITY_MIRROR` is the
one place that fact is written, and both the mirror invariant and the flank
matchup read it.

Measured on the shipped calibration at equal quality:

| attacker vs defender | central | left/right | direct | transition |
| --- | --- | --- | --- | --- |
| `4-4-2` vs `4-4-2` | `0.445` | `0.446` | `0.440` | `0.499` |
| `4-4-2` vs `3-1-6` | `0.446` | `0.559` | `0.441` | `0.498` |
| `3-1-6` vs `4-4-2` | `0.443` | `0.443` | `0.445` | `0.524` |
| `4-4-2` vs `8-0-2` | `0.446` | `0.487` | `0.442` | `0.474` |
| `8-0-2` vs `4-4-2` | `0.411` | `0.432` | `0.443` | `0.478` |
| `8-0-2` vs `3-1-6` | `0.410` | `0.542` | `0.444` | `0.476` |

The football reads correctly in both directions. A `4-4-2` attacks `3-1-6`'s
flanks at `0.559` against a `0.446` baseline, while `3-1-6` gets nothing extra
down the flanks and instead gains on the counter (`0.524`). `8-0-2` reports
`central_progression` as its own bottleneck, cannot progress at `0.411`, and
its best remaining route is `direct` - going long is genuinely the way out of a
shape with no midfield. Even `8-0-2`, which can barely attack, still exploits
`3-1-6`'s open flanks at `0.542`.

**No match result changed.** The matchup is consumed only by the explanation
trace, and only when a caller supplies both shapes and the calibration.

### Scope Corrections Found Against The Code

**The chain blend does not zero a route with one dead phase, and that is the
design.** A first draft of the flank test asserted that a lineup with nobody on
the left produces a left-route capacity of exactly `0`. It does not: the blend
is `bottleneckWeight x weakest + (1 - bottleneckWeight) x average`, so a dead
phase collapses the route without deleting it. That is deliberate and
documented - a pure minimum would mean one missing phase removes a route
outright, and a long ball down an unoccupied flank is still a thing that
happens. The test was corrected to assert what the code actually promises: the
dead flank drops below `0.6x` the live one, stays above zero, and names
`left_progression` as the reason. A separate test covers the real
divide-by-zero case, where a profile with no capacity anywhere yields zeroes
rather than `NaN`.

**Two engine test fixtures outside this step's list needed the new section.**
`tactic-team-context.test.ts` builds a `MatchTacticsCalibrationConfig`, so
adding `tacticalMatchup` to that type made the file stop compiling. The change
is one mechanical field, not behaviour; the file is listed below with that
reason.

### Verification

```text
domain + content + engine focused suites   6 files, 73 tests passed
pnpm --filter @game/domain  typecheck      exit 0
pnpm --filter @game/content typecheck      exit 0
pnpm --filter @game/engine  typecheck      exit 0
pnpm depcruise                             no violations (802 modules, 3209 dependencies)
git diff --check                           clean
```

Two typecheck failures were found and fixed during the run, both in tests: an
`as const` route tuple narrowed `Array.includes` to its own literal members, and
a type-only import was missing. No production code was involved.

### Blocker / Lesson

None blocking. One observation recorded in Step 06, which owns the coefficient:
with `pressingContestWeightBasisPoints: 5000`, `build_up` is the named
bottleneck for almost every route of almost every balanced shape, because a
contested build-up lands near `0.39` while everything else sits near `0.52`. It
still switches correctly when a shape is genuinely broken, so the diagnostic
discriminates where it matters, and Step 04 tunes nothing by contract. If the
qualitative consequence surface ends up saying "your build-up is the problem"
about every shape, the number is too high.

### Next Action

Step 05.

## Goal

Compare two intrinsic profiles through own-chain bottlenecks and complementary
opponent capacities, without yet changing match outcomes.

## User-Facing Reason

A formation has strengths and weaknesses, but their match impact depends on
what the opponent presses, protects, concedes, and leaves open.

This remains a headless structural milestone. A green Step 04 proves that the
relational explanation is coherent, not that the user-visible match defect has
already been fixed.

## What To Implement

- Implement one pure relational tactical-matchup Module.
- Compare own build-up/progression/final-third chains and the opponent's
  pressing, channel coverage, box protection, counter threat, and rest
  defence.
- Produce named bounded route capacities for central, left, right, direct, and
  transition paths, or the exact route set frozen by Step 01.
- Keep attack and defence views complementary and deterministic under side
  reversal.
- Use explicit bottleneck/combination math from versioned policy; do not hide
  semantics inside a generic scoring registry.
- Add tests for ordinary symmetry, flank overload, `3-1-6`, `2-0-8`, `8-0-2`,
  coherent/incoherent pressing, stronger-team quality, and no `NaN`/negative
  or unclamped value.
- Expose matchup facts through the match explanation trace for diagnostics
  only; production opportunity behaviour remains unchanged until Step 06.

## Clean-Code Requirements

- Intrinsic shape never imports or calls relational matchup.
- One relational Module owns every attack-versus-defence comparison.
- Tests cross the public Interface; do not assert private arithmetic line by
  line when an invariant covers it.
- Remove any superseded diagnostic-only matchup calculation rather than
  retaining two owners.

## What NOT To Implement

- No chance-volume, quality, actor, score, UI, or AI behaviour change.
- No global formation ranking.
- No opponent data cached in intrinsic shape.
- No random value.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/match-engine/tactical-matchup.ts`
- `packages/engine/src/match-engine/tactical-matchup.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/match-engine/tactic-team-context.test.ts` - added during
  the step. Its fixture builds a whole `MatchTacticsCalibrationConfig`, so
  adding the `tacticalMatchup` section to that type stopped the file
  compiling. One mechanical field, no behaviour.
- `docs/PROJECT_STATUS.md`
- `docs/steps/81-.../06-phase-aware-control-opportunity-routes-and-tactic-semantics.md`
  - the pressing-weight observation and the measured route matrix.

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` was listed and is not modified:
this step is headless and adds no browser-visible surface.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/balance/match-tactics-calibration.test.ts \
  packages/content/src/schemas/match-tactics-calibration.schema.test.ts \
  packages/engine/src/match-engine/tactical-shape.test.ts \
  packages/engine/src/match-engine/tactical-matchup.test.ts \
  packages/engine/src/match-engine/match-explanation-trace.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Intrinsic and relational Modules are separate and deterministic.
- Each supported route has a bounded named capacity.
- Own-chain bottlenecks and opponent resistance both affect matchup facts.
- Side/channel mirror invariants pass.
- Match results remain unchanged in this step.
- No end-to-end gameplay-fix claim is made before Step 06 consumes the matchup.
- Step 05 is the only next action.

## 2026-08-04 - The Flank Reopen Now Has An Instrument, And A Surprise

Step 07A built what this step's open question always needed. Step 07 put the
route on the shot event, so the audit no longer has to read `chanceType: "cross"`
- which covers both flanks - and can count `left` apart from `right`.
`TacticalShapeFormationRow` carries `routes` and a `flankAsymmetry` of
`|left - right| / (left + right)`.

**The measurement does not say what this reopen assumed.** Over the curated
formation population:

| Formation | left | right | asymmetry |
|---|---|---|---|
| `4-4-2` | `19` | `23` | `0.0952` |
| `4-3-3` | `18` | `13` | `0.1613` |
| `3-5-2` | `23` | `15` | `0.2105` |
| `4-3-2-1` | `19` | `15` | `0.1176` |
| `4-2-4` | `21` | `25` | `0.0870` |
| `3-4-3` | `12` | `18` | `0.2000` |
| `4-5-1` | `16` | `18` | `0.0588` |
| `5-4-1` | `22` | `19` | `0.0732` |

Mean `0.126`, against a sampling noise floor near `1 / sqrt(35)` = `0.17` at the
roughly `35` flank chances each row is built from. Every row sits inside it.

And it must. This step's calibration enforces **left/right mirror symmetry**, and
every curated formation fields the same shape on both flanks, so the *expected*
asymmetry of this population is exactly zero. The numbers above are noise around
a true zero, and no amount of extra seeds will turn them into a structural
finding.

**What that means for the reopen.** The recorded claim - a route's defining phase
carries `11.7%` of its own chain, so a real `-12.8%` flank difference arrives as
`-1.5%` - cannot be checked against this population at all, because this
population has no flank difference to attenuate. Deciding the reopen needs a
deliberately lopsided side first: a winger on one flank only, or one flank
fielded at a higher quality band. Choosing that population is a decision for this
step, not for the gate that measures it, and Step 07A deliberately did not make
it.

`tactical-shape-audit.test.ts` states all of this where it can be broken.

## 2026-08-06 - The Reopen Candidate Is Answered, And The Answer Is No

Step 14 owns "make formation a counter-move", and the lever its own document
named is this reopen: give each route's defining phase a declared share of the
non-bottleneck part instead of an equal third. Step 14 built that fix as an
analytic model over the production `deriveTacticalShapeProfile` capacities - the
same arithmetic `chainCapacity` performs, with one added weight - and swept it
rather than shipping it.

**The fix works as described and does not produce a counter-move.** Weighting the
defining phase by `emphasis` against `1` for the other links, normalised so
`emphasis = 1` reproduces today exactly:

| Population | knobs | pairwise spread | best-response gain | 3-cycles |
|---|---|---|---|---|
| 8 measured shapes | shipped | `0.0164` | `0.0061` | `0` |
| 8 measured shapes | emphasis `3` | `0.0178` | `0.0069` | `0` |
| 8 measured shapes | emphasis `12` | `0.0187` | `0.0074` | `0` |
| 23 curated shapes | shipped | `0.0813` | `0.0166` | `0` |

`57` configurations were swept - `chainBottleneckWeightBasisPoints` from `0` to
`8000`, emphasis `1` to `8`, `routeSelectionSharpness` `1` to `6`, and the
pressing contest weight from `0` to `7500`. **Every one of them produced a
strictly transitive matrix.** Emphasis saturates because the bottleneck weight
caps what the average part can ever be worth: at `6500` the defining phase
cannot exceed `35%` of its chain however it is weighted inside that share.

The reason is not the chain. It is that the capacities themselves are not
conserved: over the `23` curated shapes the ranking by mean advantage tracks the
ranking by *mean capacity*, `4-2-3-1` topping both and `3-3-3-1` bottoming both.
A shape that is better at attacking centrally is also better at defending
centrally, because both are built from the same eleven contributions through the
same diminishing ladder, so there is no trade-off for a counter to exploit. A
route model can only amplify a difference that exists; the difference here is one
axis, and amplifying one axis widens a gap rather than creating a cycle.

**So this reopen is closed as answered, not as done.** Nothing in
`TACTICAL_ROUTE_DEFINITION` changed. The recorded `11.7%` arithmetic is still
exactly right and still explains why formation is flat; what it does not support
is the conclusion that fixing it would make formation a decision. The population
question the 2026-08-04 note raised - a deliberately lopsided side - stays open
and is now the *only* live candidate, because left against right is the one axis
where this model's capacities genuinely trade off against each other.

Whoever picks that up owns two things together: the lopsided population and the
conservation question above. Fixing the second without the first would only make
one formation win by more.

# Step 04 - Relational Phase Matchup And Route Capacity

## Status

Done on 2026-08-03.

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

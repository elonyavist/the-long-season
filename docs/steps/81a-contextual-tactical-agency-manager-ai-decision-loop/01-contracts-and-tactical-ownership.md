# Step 01 - Contracts And Tactical Ownership

## Status

**Done 2026-08-07.** Step 02 is the only next action.

## Goal

Remove duplicated tactical ownership and freeze the successor contracts without
changing match outcomes or RNG consumption.

## User-Facing Reason

Later choices cannot be trusted or explained while the minute engine and the
post-match trace calculate different football.

## Entry Gate

- Phase 81 report and Phase 81A design contract read in full.
- Graphify `explain` and `affected --depth 2` refreshed for the owned symbols.

## What To Implement

- Remove dead `OpportunityRoutePlan.controlCapacity`; do not preserve it for
  compatibility.
- Move only the positive magnitudes of `controlWeight(...)` into the one
  versioned match-tactics calibration asset, validated by
  `isBasisPointShare(...)`. Keep increase/decrease direction in one total typed
  football mapping beside `TACTIC_KNOB_FAVOURED_ROUTES` and
  `TACTIC_KNOB_EXPOSED_ROUTE`; do not add a signed content field or widen the
  share validator. Content stores positive magnitudes `1200 / 400 / 300 / 800`;
  typed code maps pressing/risk/width to `increase` and directness to `decrease`.
  Preserve the exact double result and prove replay identity.
- Make explanation snapshots consume the actual opportunity plan used by the
  minute; correct the false JSDoc.
- Record the future contracts for strategic signatures, opponent reads,
  chapters, preparation, and their single Step 14 persistence integration. Add
  a typed Interface only when this step gives it a real production consumer;
  leave no anticipatory export.
- Prove match outcomes, events, ordering, and RNG consumption identical to the
  before-state. Trace changes only where the old parallel model was wrong.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/engine/src/match-engine/opportunity-route.ts`
- `packages/engine/src/match-engine/opportunity-route.test.ts`
- `packages/engine/src/match-engine/match-control.ts`
- `packages/engine/src/match-engine/match-control.test.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts`
- `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `02-real-career-before-state.md`

### Ownership Of The Four Files Added To This List

The asset gained one field, and three files exist only to keep a consumer of
that asset honest. None of them is a widening of scope; each would fail to
compile or fail its own gate if it were left out.

- `packages/content/src/schemas/match-tactics-calibration.schema.ts` is the
  `strictObject` that refuses an unknown or missing key in the shipped file. A
  new field that the schema does not name is a field the shipped asset may not
  carry.
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts` and
  `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`
  build `MatchTacticsCalibrationConfig` literals and stop type-checking without
  the field. Their two policies are deliberately different and stay that way:
  the engine fixture must **not** track shipped numbers, the simulation-tools
  fixture must, and both comments already say why.

`packages/engine/src/match-engine/step-match.ts`, `step-match.test.ts`, and
`packages/engine/src/match-engine/index.ts` were listed and are **untouched**.
Removing a field nothing read and adding one the trace reads needed no change
there, and `deriveControlCapacity(...)` was module-private, so nothing left the
barrel.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/opportunity-route.test.ts
pnpm exec vitest run packages/engine/src/match-engine/match-control.test.ts
pnpm exec vitest run packages/engine/src/match-engine/match-explanation-trace.test.ts
pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement

No conservation, new route behaviour, lateral focus, AI evaluator, UI, career
schema change, or threshold tuning.

## Definition Of Done

One Module owns the minute plan, no dead field or hardcoded duplicate remains,
the trace reads that plan, paired replay is outcome/RNG-identical, and Step 02 is
the only next action.

---

## Adopted Solution

### 1. `controlCapacity` removed, `bottleneckByRoute` put in its place

`OpportunityRoutePlan.controlCapacity` had **zero production readers** - one
write at `opportunity-route.ts:166`, one assertion in its own test, nothing
else - and `deriveControlCapacity(...)` was byte-for-byte the live formula in
`match-control.ts` `onTheBallQuality(...)`. The two differed only in spelling:
`1 + lean` against `0.5 + intensity`, which are the same number because
`lean = intensity - 0.5`. Both the field and the private function are gone.

The plan gained `bottleneckByRoute` in the same change, and that is not a swap
of one dead field for another - it has a real consumer in this step. It is also
the one fact the plan could not otherwise carry: a route reports a single
bounded capacity, and *which* of its phases was the weak link is knowable only
inside the chain that produced it. Everything else the trace needs is derivable
from what the plan already holds, so nothing else was added.

### 2. The four control coefficients now live in the versioned asset

`controlWeight(...)` carried `0.12 / 0.04 / 0.03 / -0.08` as literals, which
meant one stamped calibration version could not describe what a career's tactics
actually did. Content now stores unsigned magnitudes and typed code owns the
sign:

```text
content  controlBasisPointsByKnob = { directness: 800, pressing: 1200, width: 300, risk: 400 }
domain   TACTIC_KNOB_CONTROL_DIRECTION = { directness: decrease, pressing/width/risk: increase }
```

`isBasisPointShare(...)` is unchanged and unwidened; no signed content field was
added. Validation gained one rule of the same kind as `knob_without_a_cost`: a
knob declared to move control must price that movement above zero, or the
football is written down and never applied. The new error code is
`invalid_control_magnitude`.

### The exactness argument, which is a proof and not a measurement

The step required the double result to survive. It does, for three reasons that
compose, and all three are asserted in `match-control.test.ts`:

1. IEEE754 division is correctly rounded, so `1200 / 10_000` **is** the double
   nearest `0.12` - the same double the literal parsed to. Likewise `400`,
   `300`, `800`.
2. Negation is exact and `a - b` is defined as `a + (-b)`, so pushing the sign
   into the magnitude cannot move a bit.
3. The four terms are added in the order they were always added in.

Point 3 is why `controlWeight(...)` still writes the sum out instead of looping
over `TACTIC_KNOBS`, and the code says so. **Floating-point addition is not
associative**: a grid of `13845841` reachable intensity combinations was walked
before choosing, and `4237513` of them - `30.6%` - land on a different double
when the same four terms are summed in `TACTIC_KNOBS` order, by up to
`4.44e-16`. That is far below any football, but Checkpoint A's first job is a
paired before/after replay proving outcomes and RNG consumption invariant, and a
one-ulp drift is exactly the kind of finding that would cost a reviewer a day
for no reason. `signedControlMagnitudes(...)` walks `TACTIC_KNOBS` and is
therefore total; the caller applies the record in its own written order, because
addition order is arithmetic rather than football and belongs beside the
arithmetic.

### 3. The trace reads the plan the minute was played with

`createRouteSnapshots(...)` called `deriveTacticalMatchup(...)` on the two raw
shapes while its JSDoc promised *"The same derivation runs inside the minute
loop"*. It applied **no tactic at all**. A side told to go wide read back the
flank capacity of a side that had been told nothing, so the explanation
contradicted the football the minutes had resolved. It now calls
`deriveOpportunityRoutePlan(...)` - the same function `routePlanFor(...)` uses -
and reads `capacityByRoute` and `bottleneckByRoute` off the result. The JSDoc
now says what the code does, including what it still cannot do.

The plan is built at kickoff state, and that is not an approximation of the
rows: `goalDifference` moves `volumeMultiplier` only, and capacity does not read
it. What the rows genuinely cannot show is a mid-match tactic change, because
`createMatchExplanationTrace(...)` receives one context. Chapters are Step 13's
and the false claim has been removed rather than restated.

The trace schema version stays `2`. The rows carry the same fields with truer
values; no structure changed, so an artificial bump would be a beta reset this
phase has already promised to Step 14.

### 4. The asset version stays `match-tactics-calibration-v1`

The asset gained a field but describes identical football, exactly. A career
stamped `v1` before this step and one stamped after it play the same match, so
the stamp is still truthful and `deriveTeamShapeAndStrength(...)`'s
policy-version equality still means what it says. Bumping would have been an
artificial break, which the beta rules refuse.

## Verification

```text
pnpm exec vitest run opportunity-route.test.ts match-control.test.ts
  match-tactics-calibration.test.ts                     3 files, 65 tests, exit 0
pnpm exec vitest run match-explanation-trace.test.ts
  step-match.test.ts                                    2 files, 30 tests, exit 0
pnpm check                                              exit 0
git diff --check                                        exit 0
graphify update .                                       ok
```

Non-vacuity of what was added, each proven by a test that fails without the
production change:

- `invalid_control_magnitude` fires for **every** knob in `TACTIC_KNOBS`, not
  for a hand-built one.
- Both branches of `TACTIC_KNOB_CONTROL_DIRECTION` are reached by shipped
  football: `decrease` by directness, `increase` by the other three.
- Changing **only** `controlBasisPointsByKnob` in the asset changes the minute's
  possession share, which was unreachable while the numbers were literals.
- The trace's flank row moves when only the width instruction moves, and the
  opponent's central row moves with it - the exposure arriving from the other
  side's setup, which the old bare matchup could not express.

## Contracts Recorded For Later Steps

Nothing below is in the code. Each enters with its first real consumer, and no
anticipatory type or export was left behind.

### Frozen product targets

| Quantity | Target | Owner |
|---|---:|---|
| Clearly correct contextual read | `>= +0.045` win share | B ceiling (oracle), D realized |
| Clearly wrong committed read | `<= -0.045` win share | B exposure, D realized |
| Context-free / non-commitment | `\|delta\| <= 0.015`, interval compatible with zero | B and D |

`0.045` sits just under the measured adjacent-top-club gap (`0.0467`), above the
paired noise floor (`0.0295`), and far below a division tier (`0.2521`). A
larger sample lowers the floor and therefore tightens the gate; it never moves
the target.

### AI formation policy

The AI keeps choosing its formation from **its own squad** through
`selectCareerAiTeam(...)` and `strongestCatalogShape(...)`. Opponent context
changes the tactical plan inside that shape, not the shape. This is a declared
**temporary policy asymmetry** and it carries its own exploit gate at Checkpoint
D: the fixed-formation policy must not be beatable by one universal human
response. `no_dominant_formation` alone does not answer that question.

### What a post-match decision means

It never touches the match just played. It is a preparation priority consumed by
the **next** match - marginal recovery, plan rehearsal, or opponent study - where
choosing one gives up the other two. Base physiological recovery stays with
`applyCareerWeeklyRecovery(...)`; the new owner holds only the discretionary
share, so nothing is quietly duplicated or cancelled.

### Strategic signatures (Step 05 declares, Step 06 freezes)

A signature is the complete set of analytic facts the minute plan consumes -
allocations, resistances, volume, quality, control, exposures - each turned into
a dimensionless quantity by a versioned scale and clamp, then stored as
`round(normalized * 10_000)`. No raw `float64` and no ad-hoc decimal rounding
enters the identity. Only exactly-identical signatures group. The rule, the
scales, the components and the tie-breaks are written into the checkpoint report
**before** outcomes are read, and none may use win share or best-response
identity.

### `OpponentRead` (Step 10 builds, Step 11 shares)

**Historical contract, deferred by Amendment A7 after Checkpoint C.** The
interface remains the required future seam, but the active MVP Steps 10-12 use
only the manager/AI club's own squad and current match state. No production
caller is authorized by this paragraph.

Six named, total components: `formation_history`, `route_history`,
`pressing_risk_history`, `lateral_history`, `half_time_change_history`,
`sample_confidence`. Checkpoint D preregisters the **five**-component profile and
records `formation_history: not_observed` - a declared information set, not
missing instrumentation. Manager and AI read the same Interface with the same
facts and the same latency; pre-match uses only previous observed matches and
live uses only what is visible by the same decision window.

### Chapters (Step 13)

Segments of the current session cut at `AppliedLiveMatchCommandFact` boundaries.
Each keeps minute range, decision applied, routes tried and completed, volume and
quality, control, cost conceded, relevant physical state. Chapters must
reconcile to the match totals, and a change at minute `m` may not rewrite what
came before it.

### The single persistence integration (Step 14)

`lateralFocus`, fielded opponent shape, chapter boundaries and raw chapter facts,
and the preparation decision with its expiry all become durable **once**, in Step
14, under this phase's only incompatible beta reset. Steps 05, 10 and 13 build
canonical in-memory and `MatchReport` facts and advance no version. No migration,
dual reader, legacy field or compatibility default survives, and a career created
after that reset must load through Checkpoints E and F.

## Lesson For Step 02

The trace is now honest about the plan but still describes **one** context per
match. Step 02's before-state runner reads the career path, not the trace, so
this does not block it - but any future claim that "the trace explains the match"
is still false for a match with a mid-match tactic change, and Step 13 owns that.

Recorded in `02-real-career-before-state.md`: the calibration asset now carries
`controlBasisPointsByKnob`, and the before-state report must record the
calibration **version** it was measured under alongside its population, because
this is the first phase where a tactic magnitude can move without an engine
change.

## Next Action

Step 02, real-career before-state. No later Phase 81A step and no Phase 81B work
may start before its Definition of Done.

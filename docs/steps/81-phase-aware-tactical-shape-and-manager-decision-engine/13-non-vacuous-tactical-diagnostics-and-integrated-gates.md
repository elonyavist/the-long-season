# Step 13 - Non-Vacuous Tactical Diagnostics And Integrated Gates

## Status

Done on 2026-08-06.

### Adopted Solution

No instrument was built. The Step 01 report already measures every frozen
invariant, so this step ran it on **three** populations rather than one, ran the
eight absence checks, measured the carried monitor on a declared career
population, and ran the gates.

Three populations because one cannot tell a bound that holds from a bound that
happened to hold on a seed. Two share a seed prefix and differ in sample size;
two share a sample size and differ in seed prefix. That second pair is what
produced the step's main finding, and it cost one extra run.

Three gates found live defects. Two were fixed in the steps that own them, which
is what this step's review rules require: **Step 02 reopened** for the web
four-role collapse, bringing `scripts/check-role-department-owner.ts` into
`pnpm check` with it, and **Step 08 reopened** for a persistence spec left
asserting a superseded schema version.

The third is fixed here, because `docs/PROJECT_STATUS.md` had already parked it
on this step by name: the `200%` text overflow in desktop match preparation. One
stylesheet declaration and one visual-QA case, and the case came first - the
combination that fails had no coverage, so it was measured before anything was
changed. That is the only production change this step owns, and it is
presentation, not gameplay.

### What Was Found

Full numbers in `docs/audits/PHASE_81_TACTICAL_SHAPE_BOUNDED_DIAGNOSTICS.md`.

- **F1 - the small effect does not reproduce; the large ones do.** Same code,
  same `1050` scenario pairs, seed prefix the only difference: the division-tier
  edge, the `0-0-10` deficit and the quality hierarchy agree to within `0.01`,
  while the best structural shape gain moves `0.0312 -> 0.0095`, losing two
  thirds of itself under a `0.0295` noise floor. Every reading ever taken of that
  quantity spans `0.0095..0.0431`. **Owner: Step 14**, which must raise it to
  `~0.047` and cannot verify that on one prefix.
- **F2 - one bound passes on a quantity indistinguishable from zero.**
  `bounded_structural_swing` is satisfied because there is almost nothing to
  bound. Correct, one-sided, worth keeping, currently not constraining anything.
  **Owner: Step 14.** No threshold touched.
- **F3 - `no_dominant_tactic` downside**, reported as required: `low_block`
  `0.4394` against the field, `flank_overload` strongest at `0.5356`, under the
  `0.55` ceiling. **Why** is the useful half: `low_block` creates `22.6%` fewer
  opportunities than neutral and concedes only `1.7%` fewer, and no profile
  concedes meaningfully less than neutral. Defending is currently a way to have
  fewer chances, not to face fewer - which is also why a floor threshold would be
  the wrong answer. **Recommended to Step 06, not tuned.**
- **F4 - the web four-role collapse was live, and was four copies, not one.**
  A wing-back was a defender on one screen and a midfielder on another; a winger
  was a midfielder in all four while market and contract code called him an
  attacker. **Fixed in Step 02, reopened.**
- **F5 - the A6 absence assertion enumerates nine files and three
  lineup-composing paths sit outside it.** Nothing behaves differently today,
  because `fieldablePlayerIds` is still `return club.playerIds`; the cost is that
  the loan change it exists to make single-definition becomes four.
  **This step's Definition of Done line on A6 is therefore not met**, and that is
  stated rather than worked around. **Owner: Step 02.**
- **F6 - `measure: "role" | "legacy_raw"`** is written and read nowhere. Player
  model, so Phases 79/80A, not this one. Recorded with file, owner and reason;
  it threatens neither correctness nor duplication, so it does not block phase
  completion.
- **F7 - a Phase 80A player-economy gate is red on this step's career
  population.** `young_stored_ceiling_six_stock_arrival_category_placement`:
  `22` violations over `261` observations in `13` of `20` worlds, while Phase 80A
  closed with all `32` player-model gates green on its `750 x 3`. Whether that is
  seed sensitivity or drift is not something this phase can say. **Unowned, and
  it needs an owner before Phase 81 closes**, alongside Step 12's F2.
- **F8 - desktop match preparation overflowed at 200% text**, the item
  `docs/PROJECT_STATUS.md` parked here. Measured before it was touched: the
  squad panel sat at `736px` starting at `x=1681` in a `1441px` viewport, its
  `23rem` track floor pushed off-screen while the `1180px` breakpoint stayed
  silent, because `rem` floors grow with text size and `px` breakpoints do not.
  Fixed by capping both floors against the board's own width; the case is now
  covered by a test that did not exist.
- **F10 - `incoherence_costs_a_division_tier` has moved since Step 06 recorded
  it**, `1.8313 -> 1.9246..1.9469`. Across this step's three populations sample
  size moves it by `0.019` and seed prefix by `0.003`, so a `0.093` move is a
  change in the engine rather than in the population - most likely Steps 07/07A,
  which altered the shot chain afterwards. It moved **further above** its `1 x`
  floor, so it is more margin, not less. Nothing re-frozen; recorded because a
  gate that drifts by four times its own population noise is worth knowing about
  before Step 14 moves the engine again.
- **F9 - the browser gate had been failing since Step 08.** The persistence spec
  asserted OPFS schema `22` after Step 08 shipped `23`, and that mismatch masked
  a second defect: the spec's "future" fixture was also `23`, so it had stopped
  being ahead of the app and its rejection assertion never ran. **Fixed in Step
  08, reopened**, with the three versions now derived from
  `SQLITE_CAREER_SCHEMA_VERSION`. Nobody skipped a check - **no per-step block in
  Steps 01-12 lists `pnpm web:visual:qa`**, only the phase-level block and this
  step, so a gate written once at phase level runs once, at the end.

### Carried Monitor (A7) - Discharged

`20` worlds x `10` seasons, `pass/warn/fail = 20/0/0`, mean `2.760`, p95 `2.840`,
against a band of pass `2.3..3.0` and the inherited `36/634/80` over `750`
worlds. Threshold, denominator and severity class untouched. Step 06 is not
reopened, so the ownership disagreement `docs/PROJECT_STATUS.md` recorded - rule
says Step 06, movement happened at Step 07 - never has to be resolved. It stays
written down because Step 15 can bring it straight back.

### Blocker / Lesson

Two, both about the same thing: a number that has been quoted for several steps
had never been measured twice.

`0.0312` sits in `docs/PROJECT_STATUS.md`'s table of manager decisions that
*actually count, measured*, beside `0.2521` for a division tier. One of those two
reproduces across seed populations and the other moves by `0.0217`. Running the
same command twice with a different prefix was enough to tell them apart, and no
step before this one had done it - including the steps that set the target Step
14 is now measured against.

The second: Step 02 wrote a careful paragraph explaining why it was keeping a
collapse, and the paragraph named one copy when there were four. The reasoning
was fine. Nobody had counted.

### Next Action

Step 14, which now knows that its baseline is population-specific.

## Handoff

### 2026-08-06 - docs/steps/81-.../13-non-vacuous-tactical-diagnostics-and-integrated-gates.md

- Status: Done. Six Definition-of-Done lines met, one met under a stated reading,
  one recorded as not met.
- Outcome: every frozen tactical invariant passes on three populations with a
  positive denominator; the carried `goals_per_match_avg` monitor is discharged
  at `20/0/0` against the inherited `36/634/80`; nine findings, three of which
  were live defects that gates had never run against.
- Adopted solution: no instrument was built. The Step 01 report was run on three
  populations instead of one - two sharing a prefix and differing in sample size,
  two sharing a sample size and differing in prefix - which is what separated the
  effects that reproduce from the one that does not.
- Verification: `pnpm check` exit `0` (`284` files, `2164` tests, depcruise clean
  over `837` modules); web build exit `0`; `pnpm web:visual:qa` exit `1` on first
  run and `0` after the two defects it found were fixed in their owning steps,
  `38` passed; `git diff --check` clean; `graphify update .` run.
- Follow-up, in the order the next steps need it:
  - **Step 14** owns F1 and F2. Its `0.0312` baseline reads `0.0095` on a second
    seed prefix, so its own reward must be measured on at least two and reported
    at the smaller. It also inherits the flat-defence result: raising formation
    to `~0.047` is harder while no setting reduces what it concedes.
  - **Step 06** owns F3's recommendation and nothing more. Step 13 tuned nothing.
  - **Step 02** owns F5: make the A6 assertion discover lineup-composing files
    rather than enumerate nine of them.
  - **Two findings still have no owner**: Step 12's F2 and this step's F7. Both
    need one before Phase 81 closes, and neither belongs to Phase 81.
  - **A process defect, for whoever owns the phase contract**: the phase-level
    check block lists gates the per-step blocks do not, and only the per-step
    blocks are executed. That is how the browser suite went five steps without
    running.

## Entry Gate

- Phase 81 Steps 01-12 are Done, so the recap has already shown what the engine
  actually produces before this step judges it.
- All behaviour thresholds were frozen in Step 01.
- No known production, persistence, AI, UI, or cleanup work remains.

## Goal

Run bounded tactical diagnostics and complete repository/browser/absence gates
without weakening thresholds or starting the longitudinal cohort.

## What To Implement

- Run the exact Step 01 scenario matrix with positive observations for every
  shape, tactic, suitability, live, AI, and stronger-team comparison.
- Compare post-change results to the frozen definitions and thresholds.
- Verify route distributions, possession, shots, xG, turnover/transition
  facts, quality, score outcomes, and live pre/post-command windows tell the
  same causal story.
- Prove `3-1-6` is no longer bit-identical to `4-4-2` and no result comes from
  a named formation branch.
- Prove diminishing returns, suitability no-double-penalty, tactic trade-offs,
  stronger-player relevance, AI parity, actor causality, persistence, and
  deterministic replay.
- Evaluate the carried `goals_per_match_avg` monitor against its unchanged
  band (A7). This step is its deadline. The monitor arrived from Phase 80A
  Step 09 at `36/634/80` pass/warn/fail with every failure high; it must now be
  inside band on this step's population. Report the measured distribution
  whatever it shows.
- Run absence checks for the web four-role collapse, default roster-index
  opponent lineup, obsolete scalar/texture route inference, post-resolution
  actor attribution, duplicate shape/matchup calculations, direct
  `club.playerIds` reads in lineup-composing paths, compatibility readers, and
  dead fixtures.
- Run full repository, build, dependency, browser/accessibility, diff, and
  Graphify gates.
- Write the bounded diagnostic report with failures/warnings/observation counts
  and manual inspection findings.

## Clean-Code Review

- Apply the deletion test to every new Module and record why its Interface
  earns its Implementation.
- If a gate exposes local dead code, duplication, or a structural defect,
  reopen the owning earlier step, add the affected files to that step's
  Expected Files, fix and retest there, then return to this gate.
- If the frozen quality-versus-structure hierarchy regresses while AI
  assignment itself remains correct, reopen Step 06 and retune only its
  versioned policy coefficients against the unchanged bands. If AI assignment
  is incorrect, reopen Step 09 instead. Step 13 performs neither fix.
- If the carried `goals_per_match_avg` monitor is still out of band, reopen
  Step 06, which owns opportunity volume and conversion, and fix it there. Do
  not widen the band, do not reclassify the monitor's severity, and do not
  transfer it to a third owner: it has already been carried once, and carrying
  it again would make the transfer a way of never fixing it.
- Step 06 has already acted on it, so expect a different starting point than
  Phase 80A's. On `pnpm cli ten-season-report` it moved `3.08` warn, to `2.97`
  pass once a knob offset stopped inflating every match, to `2.98` after the
  shot chain was reordered around the keeper, to `2.74` pass once the route
  reached the shot and the whole chain was recalibrated onto real shot volume
  and real conversion, with `table_points_spread_avg` at `42.0` and the whole
  anomaly score green. Nothing about any band, denominator or severity changed. That is the ten-season report
  and not this step's population, so it is evidence that the owner acted, never
  a substitute for measuring it here.
- **`asymmetric_incoherence_cost` no longer exists and this step must not look
  for it.** Step 06 escalated it, the phase contract accepted the split as
  amendment **A9** on 2026-08-03, and Step 01 - which froze it - was reopened to
  carry it into code. It is replaced by `incoherence_costs_a_division_tier`:
  the worst shape's deficit against the reference must be at least `1 x` the
  division-tier edge, measured at `1.8313` PASS. Paired with the unchanged
  `bounded_structural_swing` at `0.75 x`, the two one-sided bounds carry the
  whole original claim against a yardstick that exists. Evaluate it here like
  any other invariant, on this step's own population. Nothing was widened, so a
  regression against these numbers is a real regression.
- Step 06 also recorded that one tactic slider decides about three times what the
  formation decides, measured on the real formation population the audit now
  reports. If that is to change it is Step 04's `TACTICAL_ROUTE_DEFINITION` that
  has to change, not a coefficient; this step reports it, it does not fix it.
- **`no_dominant_tactic` is new and its downside is deliberately unbounded.**
  Step 06 block 4 added it as the twin of `no_dominant_composition` - no profile
  may average above `0.55` against the other five - and it passes at `0.5317`
  over `12000` matches. It is one-sided on purpose: a knob pushed to an extreme
  may cost a manager, it may never pay one, and a two-sided band would assert
  that every setting is worth about the same, which is the decorative-slider
  defect written as a rule. What the gate therefore does not bound, and this
  step must report rather than quietly pass over: `high_risk` sits at `0.4642`
  and `low_block` at `0.4487`, both below neutral by more than the `0.0477`
  noise floor, and `low_block` never beats anybody - its best matchup is
  `0.4625`. Both are every relevant knob at an extreme at once, which no manager
  fields, and both improved from `0.4788` and `0.4106`. Bounding them needs a
  claim nobody has made yet: what a deliberately conservative setup should be
  worth against an equal side. Recommend, do not tune, and do not add a floor
  threshold here.
- If a cleanup is truly outside scope, document its exact file/owner/reason and
  block phase completion when it threatens correctness or duplication.
- Do not accept “used only by tests” as proof that a production compatibility
  path is live.

## What NOT To Implement

- No production fix or coefficient tuning in this step.
- No threshold relaxation, warning suppression, seed exception, or empty-gate
  pass.
- No `50 x 20`; Step 15 alone owns it.
- No new product feature.

## Expected Files

The first four were permitted and **not modified**. The instrument Step 01 built
answers every frozen invariant with a positive denominator on three populations,
so changing it to run this step would have meant changing the thing being
measured. Recorded because an untouched expected file is a result, not an
oversight.

- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `apps/cli/src/commands/tactical-shape-report.ts`
- `apps/cli/src/commands/tactical-shape-report.test.ts`
- `docs/audits/PHASE_81_TACTICAL_SHAPE_BOUNDED_DIAGNOSTICS.md`
- `docs/audits/README.md`
- `docs/steps/81-.../02-typed-tactical-slot-context-and-collapse-removal.md`
  (reopened by this step's absence check; that production change lives there)
- `docs/steps/81-.../08-live-session-persistence-event-schema-and-beta-reset.md`
  (reopened by this step's browser gate; that spec change lives there)
- `apps/web/src/styles/components.css` and
  `apps/web/src/visual-qa/current-product.spec.ts` - added here because
  `docs/PROJECT_STATUS.md` parked the `200%` text overflow on this step by name.
  The spec change comes first: the case had no coverage, so it was measured
  before the stylesheet was touched.
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this phase README
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

Two corrections were made to this block on 2026-08-06, both recorded rather than
applied silently. Neither reduces what is measured.

- **`--samples=400` names no option.** The command Step 01 built exposes
  `--paired-seeds` (dominance cells, default `8`) and `--scenario-paired-seeds`
  (default `1050`). `400` is the scenario count Step 01 froze and the one every
  number quoted in this document's review section was measured at, so
  `--scenario-paired-seeds=400` is what `--samples=400` meant. It is run at
  `400` *and* at the current `1050` default, because a bound that holds only at
  one sample size is not a bound.
- **The generated markdown is not this step's report.** The command emits the
  Step 01 baseline document, which contains no absence check, no monitor and no
  finding. `PHASE_81_TACTICAL_SHAPE_BOUNDED_DIAGNOSTICS.md` is written by this
  step and quotes it; the raw generated files go to the git-ignored
  `simulation-out/`, exactly as Step 12 handled its per-season detail.

The A7 command is new here. Step 13 is the monitor's deadline and its Definition
of Done asks for a *distribution*, which one world cannot produce; `20 x 10` is
the smallest population that can, and it is far below the `50 x 20` Step 15 owns
and the `750` that nobody re-runs before it. The declared worker count is
omitted on purpose: `--workers` is only accepted with `--checkpoint-dir`, and a
direct multi-world batch already takes the canonical seven from
`resolveSimulationWorkerCount`.

```bash
nvm use 24
pnpm cli tactical-shape-report \
  --seed-prefix=phase81-bounded \
  --scenario-paired-seeds=400 \
  --report-output=simulation-out/phase81-bounded-400.md
pnpm cli tactical-shape-report \
  --seed-prefix=phase81-bounded \
  --report-output=simulation-out/phase81-bounded-1050.md
pnpm cli tactical-shape-report \
  --report-output=simulation-out/phase81-default-1050.md
pnpm cli ten-season-report \
  --report-kind=long-run-gate \
  --seed-prefix=phase81-a7 \
  --worlds=20 \
  --seasons=10
node scripts/check-role-department-owner.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

Assessed on 2026-08-06. Six of eight met, one met with a stated reading, one not.

| Line | Result |
| --- | --- |
| Every frozen diagnostic has positive observations and passes | met, on three populations |
| Bounded reports show coherent football consequences | met, and the incoherence it exposes is reported: no tactic meaningfully reduces what it concedes |
| Repository, build, browser, accessibility, persistence, deterministic, dependency, diff and Graphify gates pass | met, after two of them were fixed in their owning steps |
| Carried monitor inside band, distribution recorded beside `36/634/80` | met, `20/0/0` |
| All planned obsolete paths absent, **including every direct `club.playerIds` read in a lineup-composing path** | **not met** - F5 names three, and the assertion that should have caught them enumerates nine files |
| No known local dead code or duplicate owner remains | met inside this phase; F6 records one out-of-phase dead discriminant with its owner |
| Step 14 is the only next action | met |
| No longitudinal cohort has run | met **as `no 50 x 20`**, which is what the phase forbids. The A7 measurement is `20` worlds x `10` seasons - a multi-world run, and the smallest one that can produce the distribution this step's own Definition of Done demands. It produced no balance evidence and changed nothing |

- Every frozen tactical diagnostic has positive observations and passes.
- Bounded reports show coherent football consequences, not only changed
  numbers.
- Repository, build, browser, accessibility, persistence, deterministic,
  dependency, diff, and Graphify gates pass.
- The carried `goals_per_match_avg` monitor is inside its unchanged band, and
  the measured distribution is recorded next to the inherited `36/634/80`.
- All planned obsolete paths are absent, including every direct
  `club.playerIds` read in a lineup-composing path.
- No known local dead code or duplicate owner remains.
- Step 14 is the only next action; no longitudinal cohort has run.

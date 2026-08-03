# Step 11 - Non-Vacuous Tactical Diagnostics And Integrated Gates

## Status

Not started.

## Entry Gate

- Phase 81 Steps 01-10 are Done.
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
  is incorrect, reopen Step 09 instead. Step 11 performs neither fix.
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
- **This step reports `asymmetric_incoherence_cost` and recommends; the phase
  contract decides.** `TACTICAL_SHAPE_THRESHOLDS` exists so no step can move a
  frozen threshold by itself, and this step forbids itself threshold changes
  besides. Step 06 ran the frozen matrix and it is still `not_evaluated`, with
  the surplus at `0.0288` against a `0.0477` noise floor, having never left it at
  any setting. The reason is structural: in a population of ten central clones a
  balanced `4-4-2` is the optimum, so no composition can beat the reference by
  more than noise, and making one do so would assert football that is not true.
- Step 06's recommendation, carried here with its evidence: **split the
  invariant and assert the half that is a design claim.** It states two things
  at once - incoherence costs a lot, coherence pays little - and only the first
  is a rule the engine must obey; the second is a consequence of the reference
  shape already being optimal, which is why the denominator does not exist.
  Assert instead that **incoherence costs at least one division tier of squad
  quality**: true today at `0.4831` against a tier edge of `0.2638`, a `1.83x`
  margin, and it protects the thing the product needs, which is that setting up
  badly hurts. The `2` is not widened; a ratio with no denominator is replaced
  by a one-sided bound on a quantity that exists. Leaving it `not_evaluated`
  forever leaves a hole a later reader will close by relaxing something, and
  re-expressing the surplus against the whole population makes it computable but
  not meaningful - almost all of the best shape's `0.6615` field average comes
  from beating broken shapes, and `3-5-2` against `4-4-2` stays about `0.01`.
  Do not widen the threshold, and do not report `not_evaluated` as a pass.
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
- No `50 x 20`; Step 12 alone owns it.
- No new product feature.

## Expected Files

- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `apps/cli/src/commands/tactical-shape-report.ts`
- `apps/cli/src/commands/tactical-shape-report.test.ts`
- `docs/audits/PHASE_81_TACTICAL_SHAPE_BOUNDED_DIAGNOSTICS.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this phase README
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm cli tactical-shape-report \
  --seed-prefix=phase81-bounded \
  --samples=400 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_BOUNDED_DIAGNOSTICS.md
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

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
- Step 12 is the only next action; no longitudinal cohort has run.

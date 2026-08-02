# Step 06 - Phase-Aware Control, Opportunity Routes And Tactic Semantics

## Status

Not started.

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

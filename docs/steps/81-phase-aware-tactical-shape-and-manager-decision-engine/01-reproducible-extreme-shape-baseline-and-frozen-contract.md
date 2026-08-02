# Step 01 - Reproducible Extreme-Shape Baseline And Frozen Contract

## Status

Not started.

## Goal

Freeze the current match-engine behaviour, the Phase 81 policy vocabulary,
positive denominators, and predeclared directional thresholds before changing
gameplay.

## User-Facing Reason

The manager must be able to trust that changing shape changes football
behaviour for a reason. A baseline prevents later coefficient tuning from
being mistaken for a structural fix.

## What To Implement

- Create one deterministic tactical-shape audit Module and reproducible CLI
  report path.
- Measure equal-quality `4-4-2`, `3-1-6`, `2-0-8`, and `8-0-2` contexts under
  identical tactics, state, home status, and seeds.
- Record raw `TeamStrength`, control, possession, opportunity rate, complete
  opportunity volume, quality, route/chance-type distribution, xG, shots, and
  results.
- Prove the current `4-4-2`/`3-1-6` bit-equivalence and record the bounded
  `2-0-8` calculation including the `18..82%` possession clamp.
- Add baseline scenarios for flank overload, natural/adapted/weak/invalid fit,
  high pressing, direct play, fixed-minute live changes, and stronger-team
  imperfect shape.
- Measure the actual post-Phase-80A generated strength distributions for a
  First Division title contender, adjacent/modest quality gaps, and a Third
  Division mid-table club without changing generation.
- Freeze a paired-seed quality-versus-structure matrix that requires:
  - a material but bounded coherent-shape advantage at equal quality;
  - permission for severe structural mismatch to overturn only a modest
    quality advantage;
  - the generated First Division title contender to remain the aggregate
    favourite against the generated Third Division mid-table side even when
    using `3-1-6` against coherent `4-4-2`;
  - individual deterministic upsets to remain possible.
- Record numeric opportunity-volume, xG, and win/draw/loss bands for those
  scenarios before any match-tactics coefficient exists.
- Freeze post-change definitions, minimum observations, directional
  invariants, numeric tolerances where needed, exact seeds, and failure versus
  warning semantics before Step 02.
- Inventory every current owner of lineup tactical semantics, role collapse,
  match context, opportunity generation, chance actors, AI selection, live
  rebuild, persistence, diagnostics, and presentation.
- Record exact obsolete-path absence assertions expected after later steps.
- Accept the `goals_per_match_avg` monitor carried in from Phase 80A Step 09
  (A7). Record its inherited `36/634/80` pass/warn/fail distribution over `750`
  worlds as this phase's starting point, restate its threshold, denominator, and
  `monitor` severity class exactly as inherited, and name Step 06 as the first
  step able to move it and Step 11 as its deadline. The inherited distribution
  is recorded as a starting point, never as an accepted one.
- State the per-component measurement contract (A3): the bench reports cost per
  tick separated into match engine, context construction, career application,
  market, development, and persistence. Record today's per-component values so
  Step 11 has a comparison rather than an isolated number.
- Record that the frozen quality-versus-structure bands are conditioned on a
  single-country population (A4). With five countries, division names stop
  denoting one quality scale and these bands must be re-derived by whoever
  introduces the wider world, not carried over.
- Inventory every production path that reads `club.playerIds` to compose a
  lineup, as the surface that Step 02's named squad-depth accessor replaces
  (A6). The inventory is the absence assertion Step 09 must satisfy.
- Change no production gameplay behaviour.

## Clean-Code Requirements

- The diagnostic Module owns scenario construction once; tests and CLI must not
  duplicate formation fixtures or formulas.
- Use named scenario IDs and typed result rows, not positional tuples or
  boolean mode flags.
- Add JSDoc/TSDoc to exported diagnostic contracts and explain why zero
  observations cannot pass.
- If an existing tactical report can be deepened cleanly, reuse it; do not add
  a second shallow command that prints the same facts.

## What NOT To Implement

- No match-engine, tactic, AI, UI, storage, or balance behaviour change.
- No post-change threshold chosen after looking at post-change output.
- No named formation penalty.
- No long run.

## Expected Files

- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/tactical-shape-report.ts`
- `apps/cli/src/commands/tactical-shape-report.test.ts`
- `apps/cli/src/index.ts`
- `apps/cli/package.json`
- `docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md`
- `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if the inventory changes its scope

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts \
  apps/cli/src/commands/tactical-shape-report.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- The baseline is reproducible and shows `4-4-2`/`3-1-6` equivalence.
- The `2-0-8` calculation includes control and possession clamps.
- The quality-versus-structure hierarchy has post-Phase-80A generated-team
  fixtures, paired seeds, positive denominators, and numeric bands frozen
  before coefficient work.
- Every future gate has a positive denominator or explicit `not_evaluated`.
- Thresholds and exact scenarios are frozen before behaviour changes.
- The carried `goals_per_match_avg` monitor is recorded with its unchanged
  threshold, denominator, severity class, inherited distribution, owning step,
  and deadline.
- Per-component tick costs are measured and recorded as the pre-change baseline.
- The single-country condition on the quality bands is written down.
- All semantic owners and planned obsolete paths are inventoried, including
  every current lineup-composing reader of `club.playerIds`.
- Step 02 is the only next action.

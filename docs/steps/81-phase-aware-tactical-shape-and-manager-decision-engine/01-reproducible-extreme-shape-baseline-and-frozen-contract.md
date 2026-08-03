# Step 01 - Reproducible Extreme-Shape Baseline And Frozen Contract

## Status

Done on 2026-08-02.

### Adopted Solution

One deterministic content-free audit Module,
`packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`, plus a
`tactical-shape-report` CLI command whose adapter measures quality bands from
the generated three-division world. The Module owns scenario construction once;
the test and the CLI build no formation fixtures of their own.

The population is the `66` reachable department compositions rather than the
`23` named presets, after the presets-only framing was found wrong against the
board code. `TACTICAL_SHAPE_THRESHOLDS` holds every frozen number in code.

### Verification

```text
pnpm exec vitest run packages/simulation-tools/src/tactical-shape/tactical-shape-audit.test.ts apps/cli/src/commands/tactical-shape-report.test.ts
  Test Files  2 passed (2)
       Tests  41 passed (41)
pnpm --filter @game/simulation-tools run typecheck   exit 0
pnpm --filter @game/cli run typecheck                exit 0
pnpm depcruise    no dependency violations found (789 modules, 3131 dependencies cruised)
git diff --check  clean
```

The frozen baseline is `docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md`,
regenerated with `pnpm cli tactical-shape-report --report-output=...` in about
`77` seconds.

### What The Baseline Recorded

- `66` reachable compositions collapse onto `7` distinct `TeamStrength` values;
  the `36` that populate all four departments are byte-identical.
- `4-4-2` and `3-1-6` produce byte-identical *results* on a shared seed and
  fixture identity, not merely similar ones.
- All `11` empty-midfield shapes sit exactly on the `0.18` possession floor.
- One division tier of squad quality is worth `0.255` win share at identical
  shape, over `800` paired-seed matches. That is the yardstick for every
  structure-versus-quality claim.
- The best shape gains `0.0431` over the reference, inside the `0.0477`
  measurement noise floor: structure currently buys nothing.
- Tactics buy nothing either. Every profile lands between `0.4644` and `0.5156`
  win share against the neutral one at identical shape, all inside the same
  noise floor. `low_block` produces `6247` open-play chances and exactly zero
  crosses and counters, because chance type comes from a knob threshold rather
  than from a route.
- Four invariants pass, two are `not_evaluated` with their reason recorded.

### What Step 01 Did Not Measure

Three items in `What To Implement` cannot be measured before Steps 03-06 exist,
and are recorded as absent rather than quietly dropped:

- **Natural/adapted/weak/invalid fit.** Suitability never reaches match
  execution today, so there is nothing to measure. Step 05 owns it and must
  record its own before/after.
- **Fixed-minute live changes.** A confirmed live change rebuilds the same team
  context through the same builder, so at Step 01 it is bit-identical to the
  pre-match path by construction. Step 08 owns it.
- **Per-component tick costs.** Deferred to Phase 81A Step 04 by amendment A3 on
  2026-08-02. Building the bench here would measure a cost this phase does not
  yet spend.

Flank overload, high pressing, direct play, and stronger-team imperfect shape
*are* covered, by the tactic-profile table and the quality-versus-structure
scenarios respectively.

### Blocker / Lesson

The presets-only framing of the exploit surface was wrong and was corrected
against the code. Only the goalkeeper slot is locked; every other slot reaches
any outfield role by drag, and no validator caps a department. Extreme shapes
are manager choices, so no gate may exempt them.

### Next Action

Step 02.

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
- Record that the extreme shapes are reachable manager choices, not diagnostic
  constructs. `FORMATION_KEYS` contains `23` named presets and none of `3-1-6`,
  `2-0-8`, or `8-0-2` is among them, but the preset is only where a lineup
  starts. On the tactical board the goalkeeper is the one locked slot
  (`locked: role === "POR"`); each of the other ten reaches every outfield role
  by drag through `TACTICAL_BOARD_ROLE_DESTINATIONS`, whose zones tile the whole
  pitch. No validator caps how many slots share a department: the preparation
  blockers cover empty slots, duplicates, unavailable players, and the bench
  goalkeeper only, while `createSelectedLineup` and `buildTacticTeamContext` add
  no shape rule. A manager can therefore field `3-1-6`, `2-0-8`, `8-0-2`, or
  even `0-0-10`, and `deriveTeamStrength` accepts it because it reads role keys
  rather than a formation name.
- Define the dominance population as the reachable department-composition space
  rather than the named presets. The engine's shape input is the triple
  `(defenders, midfielders, attackers)` over the ten outfield slots, so the
  reachable population is exactly the `66` triples summing to ten, with the `23`
  presets occupying a subset of them. The exploit gate is the full `66 x 66`
  paired-seed matrix. No composition is exempt: the extreme shapes are members
  of that population, not probes standing beside it. The preset compositions are
  reported separately as the shapes most managers start from, never as the gate.
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
- Freeze three invariants that bound how far structure may beat quality. The
  accepted product rule is that squad building must stay the primary way to win;
  a formation trick may not substitute for it. These are gates, not guidance:
  - **Bounded swing.** The largest aggregate outcome swing any shape choice can
    produce, at equal player quality, must be smaller than the swing produced by
    one division tier of squad quality. Measure both in the same unit -
    win-share over paired seeds - so the comparison is arithmetic rather than
    rhetorical. Structure that outweighs a tier of quality means the manager can
    skip the transfer market.
  - **No dominant shape.** Run every reachable department composition against
    every other over paired seeds and require that no composition stays ahead of
    *every* opponent. A shape that is never behind is a free win button, and it
    is the single failure mode a human player will find fastest. The gate reads
    the minimum of each row, not its mean: the reachable population contains
    self-destructive shapes such as `0-0-10`, and a mean would let their presence
    manufacture a false positive for any sane shape. Record the full `66 x 66`
    matrix, not a summary: dominance shows as a row, and a summary hides it.
  - **Asymmetric effect.** Incoherence must cost more than coherence pays.
    A coherent ordinary shape is the baseline, not a bonus; the mechanism exists
    to punish structural nonsense, not to reward a clever answer that quality
    cannot match. State the intended ratio numerically before coefficients
    exist.
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
- The three structure-versus-quality invariants are frozen with numeric values
  and their measurement method, including the full shape-versus-shape matrix
  that proves no dominant shape exists.
- The single-country condition on the quality bands is written down.
- All semantic owners and planned obsolete paths are inventoried, including
  every current lineup-composing reader of `club.playerIds`.
- Step 02 is the only next action.

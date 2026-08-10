# Step 06B18 - A6 Register And Evaluator Hardening

## Status

**Planned.** Authorized by Design Contract Amendment A6 on 2026-08-10 and
revised the same day after cross-review. This step changes no gameplay, no
coefficient and no target value derived from game output. It makes the
register and the evaluator say one unambiguous thing each, then proves on the
cached L5.4 projections that every consolidation is verdict-neutral.

One scope limit, frozen here: "no literal outside the register" applies to
the historical player/table targets, not to every structural threshold in
the project. Applied literally it would widen this step without bound.

## Goal

Remove every dual definition, dead bound and hidden literal from the frozen
target register and the checkpoint evaluator, so that 06B19's ablation
measures against an instrument with exactly one reading.

## What To Implement

1. **One leader gate.** Replace the `generatedLeaderShareSeasonTen
   {min 0.30}` / `openingLeaderShareSeasonTen {max 0.50}` pair with a single
   `careerGeneratedLeaderShareSeasonTen {min 0.50, max 1}` register entry.
   The report stores the four origin counts and this one gate value; the
   opening share is derived, never stored beside it. The consolidation
   changes no historical verdict: any run failing the old pair fails the new
   gate and vice versa.
2. **One band definition.** The register's exact `p10..p90` values are the
   only gates. Every rounded prose band (`72..88` first) is presentation.
   Sweep all First-Division bands for the same rounding drift and note the
   rule at the register head.
3. **Register the hidden literals; freeze the two new gates without reading
   them.** The age-drift bound `2.0` moves from the evaluator into the
   register. `appearance share {0.48, 0.58}` and `distinct users per
   club-season {26, 31}` become versioned register entries with formulas
   frozen here:
   - `appearanceShare = total appearances / (34 x player-seasons with at
     least one appearance)`;
   - `distinctUsers = mean, over First-Division club-seasons, of distinct
     playerIds actually fielded for that club`; a mid-season transfer
     belongs to both club-season counts;
   - First Division only, all declared seasons and worlds.
   These two gates are **`not_evaluated` in this step**: the cached fact
   rows enumerate only players still fieldable in the club at season end
   (`playerSeasonFacts(...)`), so appearances by departed players are absent
   and a transferred player counts in one club only. No approximated cache
   reading is permitted. Their first reading happens in L6.1's fresh
   combined arm and is never counted as a regression. Leading scorer
   `20.5..32.3` and leading creator `9..18` are annotated diagnostic-only in
   the register file and the Big Five baseline.
4. **One origin derivation.** A single shared function owns
   `opening = opening_senior + opening_academy`, `generated =
   annual_academy_intake + annual_senior_intake`, `unknown` excluded from the
   denominator and forcing `REFINE`. `generational-succession.ts` imports it
   instead of deriving its own `!isCareerGenerated(...)` cohort.
5. **Superseded representation.** `generation_input_signature` is exposed as
   `superseded` with a reference to the L4.5/L4.6 supersession, never as a
   plain nested failure and never re-inserted into the gate. The uncommented
   filters in `evaluateIntegratedPlayerWorldCheckpoint(...)` (signature and
   `carried_formation`) each get the comment that names their owner: the
   first the L4.6 supersession, the second the dedup with the formation lane.
   A nested failure that is neither a rolled-up gate nor an explicit
   `superseded` entry becomes impossible by construction.
6. **Documentation supersessions.** 06B14 notes that its `0.25..1.75` bounds
   were superseded by 06B15B/06B15D. The lower-division baseline and 06B10A
   record the account of the 3. Liga corpus (preregistered `2010/11..2024/25`
   / `35` seasons, frozen `2014/15..2024/25` / `31`): why the four seasons
   dropped, without adding or removing data now.
7. **Verdict-neutrality proof, isolated.** Re-evaluate the cached L5.4 world
   projections under the hardened register through a distinct command,
   profile, cache directory and output path - the original L5.4 artifact is
   never overwritten. Assert: same checkpoint decision `REFINE`, same failed
   families modulo the declared consolidations (the leader pair collapses to
   one key; the two new gates report `not_evaluated`). Record the mapping in
   this document.

## Expected Files

- `apps/cli/src/commands/simulation-report/historical-simulation-targets.ts`
- `apps/cli/src/commands/simulation-report/historical-simulation-targets.test.ts`
- `apps/cli/src/commands/simulation-report/owner-attribution.ts`
- `apps/cli/src/commands/simulation-report/owner-attribution.test.ts`
- `apps/cli/src/commands/simulation-report/generational-succession.ts`
- `apps/cli/src/commands/simulation-report/generational-succession.test.ts`
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`
- `docs/audits/PHASE_81A_BIG_FIVE_STATISTICAL_BASELINE.md` (diagnostic-only
  annotations)
- `docs/audits/PHASE_81A_LOWER_DIVISION_STATISTICAL_BASELINE.md` (3. Liga
  account)
- `docs/steps/81a-contextual-tactical-agency-manager-ai-decision-loop/06b10a-lower-division-baselines-and-target-register.md`
  (corpus account cross-reference)
- `docs/steps/81a-contextual-tactical-agency-manager-ai-decision-loop/06b14-player-task-actor-allocation-correction.md`
  (supersession note)
- `docs/PROJECT_STATUS.md`
- this step document
- `06b19-renewal-ablation-and-funnel-attribution.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run apps/cli/src/commands/simulation-report/historical-simulation-targets.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/owner-attribution.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/generational-succession.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/career-sections.test.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement

No gameplay change, no engine or content coefficient, no new simulation
cohort, no target value chosen or adjusted from game output, no approximated
cache reading of the two new gates, no removal of the four-origin diagnostic
taxonomy, no re-insertion of the superseded signature into any gate, no
overwrite of the original L5.4 artifact.

## Definition Of Done

The register has no dead bound, no dual definition and no historical literal
living outside it; every nested failure is either rolled up or explicitly
`superseded`; the isolated cached L5.4 re-evaluation reproduces `REFINE` with
the declared key mapping and the two new gates at `not_evaluated`; 06B19 is
the only next action.

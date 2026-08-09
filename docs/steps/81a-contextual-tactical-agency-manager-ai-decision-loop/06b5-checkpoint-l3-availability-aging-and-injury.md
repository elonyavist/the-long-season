# Step 06B5 - Checkpoint L3: Availability, Aging And Match Injury

## Status

**Done (2026-08-08): `GO`.** The final `7 x 2` held every local lifecycle,
recovery, injury and carried substitution gate. Step 06B6 is open.

## Frozen Population

Two independent views run with exactly seven workers:

1. a paired generated-player matrix over ages `24`, `30`, `32`, `34`, identical
   roles/abilities and rest intervals `2`, `3`, `4`, `7` days;
2. `7` fresh worlds x `2` seasons under seed prefix
   `phase81a-availability-aging-l3-v1`.

The matrix proves the curve. The worlds prove real selection, availability and
reachability. Neither can substitute for the other.

Before execution, the career age buckets are fixed as `under_24`, `24_29`,
`30_32`, and `33_plus`, using `completedPlayerAge(...)` on the fixture date.
“No age group is guaranteed an injury” means that each bucket's time-loss
injury count is strictly below its positive-minute appearance count; it does
not mean every individual player must be followed as a separate cohort.

The two matrix sets are also fixed before execution: the seven curve-selection
seeds `phase81a-recovery-reachability-01..07` and seven fresh validation seeds
`phase81a-recovery-validation-01..07`. No seed may be added after output.
Each world's controlled matrix uses the outfield player whose weighted
stamina/agility/strength resilience is closest to the neutral midpoint `10`,
with player ID as the final tie-breaker. The high-resilience seven-day bound
uses that world's highest-resilience outfielder. Both selectors read generated
inputs only, never recovery output.

## Frozen Gates

- every Step 06B3 structural invariant holds;
- all Step 06B4 controlled bounds hold inside and outside the curve-selection
  seeds;
- unavailable selected starters and consequence mismatches are exactly `0`;
- all `7/7` worlds exercise non-zero recent use and at least one time-loss
  match injury;
- time-loss match injuries fall within `20..50` per `1000` player match-hours,
  a broad band around the published `36` reference;
- no age group owns zero injury reachability and no age group is guaranteed an
  injury;
- mean substitutions and first-substitution timing remain inside L2 bands;
- at least one generated high-resilience `33+` player in the declared real-data
  search beats a lower-resilience `30-32` player's recovery;
- carried scoring, formation, stable-ID and deterministic gates remain green.

The injury band reads time-loss consequences, not knocks, and records that the
game does not simulate training exposure.

### Instrument Correction After First Execution

The first artifact exposed that L3 had composed the whole L2 decision, which in
turn composes L1's opening gate. That opening gate requires zero catalog ties
and zero out-of-position slots across season-one selections; after 06B3, real
injuries and suspensions deliberately force later selections away from the
opening XI. It is not the carried gate written above.

L3 therefore keeps every local L2 substitution/minute failure and L1's
longitudinal formation/stable-ID failures, while reporting the complete old
opening decision diagnostically. This correction changes no threshold and did
not change the first outcome: injury incidence and the pooled substitution mean
already forced `REFINE` independently.

## Decision

- **GO:** curve and real-world lifecycle gates pass; open Step 06B6.
- **REFINE:** a local availability/recovery owner fails; reopen only 06B3 or
  06B4 as named by the paired result.
- **STOP / RETHINK:** credible rotation requires direct age penalties or a
  second injury simulator.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`; the locked `7 x 2`, seed prefix and seven-worker
  refusal are executable contract, not prose only
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test; they
  own the matrix, career facts and L3 decision without copying recovery or
  injury formulas
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`; its
  earlier seven-seed inversion loop is removed when the checkpoint matrix takes
  ownership, so two tests do not maintain the same population independently
- `packages/engine/src/use-cases/simulate-season.ts` and test. The exact
  availability/recent-use inputs consumed at kickoff are not reconstructible
  from final season state, so the existing fielded-team fact gains one compact
  diagnostic. It changes no selection behaviour and is not persisted.
- `packages/i18n/src/labels.ts`; the locked profile must remain discoverable in
  all five supported CLI languages
- reachability audit in `packages/simulation-tools` only if it consumes engine
  facts and contains no duplicate recovery formula
- `docs/audits/PHASE_81A_CHECKPOINT_L3_AVAILABILITY_AGING_INJURY.md` **(new)**
- `docs/audits/README.md`
- this step document
- `docs/PROJECT_STATUS.md`
- `06b6-checkpoint-l4-generational-succession-attribution.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-availability-aging-l3-7x2 --workers=7 --format=json --report-output=simulation-out/phase81a-availability-aging-l3-7x2.json
pnpm check
git diff --check
graphify update .
```

The checkpoint and repository gate run alone.

## Definition Of Done

The paired and career populations have a recorded decision, real-data
reachability and explicit limits. Only `GO` opens generational attribution.

## Final Result

The accepted run recorded `9,101` time-loss injuries over `420,667.4667`
player match-hours (`21.6347/1000h`), mean substitutions `3.827381`, median
first change minute `60`, and zero unavailable selections, consequence
mismatches, reconciliation failures or rule-limit violations. Both controlled
recovery bounds and generated-veteran inversion held. The complete refinement
chain is owned by Steps 06B5A/06B5B and the accepted evidence by
`PHASE_81A_CHECKPOINT_L3_AVAILABILITY_AGING_INJURY.md`.

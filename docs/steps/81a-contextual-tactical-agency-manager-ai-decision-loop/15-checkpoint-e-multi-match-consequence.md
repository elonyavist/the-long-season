# Step 15 - Checkpoint E: Multi-Match Consequence

## Status

Not started; requires Steps 13-14 Done.

## Goal

Prove explanation and post-match preparation produce contextual multi-match
consequences rather than a universally optimal new stat.

## Experiment

Run paired mini-seasons with identical world/match seeds and intermediate
save/load using four policies: contextual informed, always recovery, always
rehearsal, always study.

Run a second paired ablation on the same declared worlds: full six-component
`OpponentRead` versus the identical read with only `formation_history` masked.
Hold every other fact, action set, seed, XI, and opponent constant.

Targets:

- each option wins at least one preregistered reachable cluster;
- no fixed policy dominates all clusters;
- correct next-match preparation `>= +0.045`;
- clearly wrong preparation `<= -0.045`;
- chapters identify the mechanism;
- no duplicate fitness/morale/use/preparation truth;
- no permanent accumulation or RNG realignment;
- reload reproduces output;
- the Step 14 post-reset career remains loadable with no second storage version
  change;
- full six-component realized agency/exposure/non-commit still meet
  `+0.045 / -0.045 / |delta| <= 0.015`;
- historical formation changes confidence or the chosen plan in at least one
  preregistered real context;
- in stable, sufficient-history clusters its incremental win-share delta over
  the masked read is at least `+0.015`;
- in volatile or insufficient-history clusters it remains `not_observed` and
  masking it changes win share by at most `0.015`.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_E_MULTI_MATCH_CONSEQUENCE.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `16-integrated-cohort-and-phase-closeout.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-e --workers=7
pnpm web:visual:qa
pnpm check
git diff --check
```

## Decision

- **GO:** preparation and formation-history ablation pass; open Step 16.
- **REFINE:** chapter/preparation failure reopens 13/14. Formation-history
  reachability or calibration failure reopens 10/14; repeat D only if the
  five-component masked path changes, otherwise repeat E directly.
- **STOP / RETHINK:** record universal, duplicated, permanent, or non-material
  preparation, or a sixth component that cannot be made contextual without
  hidden information; leave Phase 81B closed.

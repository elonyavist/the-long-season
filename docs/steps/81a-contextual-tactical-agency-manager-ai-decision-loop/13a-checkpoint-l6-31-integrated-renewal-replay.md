# Step 13A — Checkpoint L6.31 Integrated Renewal Replay

## Status

**Done: `GO` in-sample and out-of-sample.** Fresh current-engine facts retain
the stationary runway's material ready-replacement and generated-leader gains,
with exact immediate purity and no new integrated failure. Step 14 is next.

## Goal

Prove that the already-adopted stationary routine-youth runway still improves
generational renewal when replayed from fresh facts through the complete current
career engine. This is regression acceptance, not a new calibration run.

## Frozen Contract

Run the four existing L6.31 profiles again on the current tree:

- in-sample control and candidate;
- out-of-sample control and candidate;
- seven worlds, ten seasons and exactly seven workers in every arm;
- all career sections at diagnostic detail.

The seeds and material targets remain those frozen before L6.31 implementation.
They are deliberately reused because this checkpoint asks whether later engine
work preserved an accepted paired effect; it makes no new out-of-sample efficacy
claim. The cache identity advances from `facts-v2` to `facts-v3` before any run,
so no historical world fact can satisfy this checkpoint.

The candidate must still clear, in both sets:

- generation stationary-capable share `>= 0.48` and `5/7` worlds;
- season-ten stationary-ready delta `>= +0.08`, intended direction in `5/7`;
- ceiling-gap reduction `>= 0.08`, intended direction in `5/7`;
- generated-leader delta `>= +0.03`, intended direction in `5/7`;
- immediate potential-only purity, zero reconciliation failure and no newly
  failing integrated gate relative to its paired control.

No threshold, seed, role target, lane share or gameplay owner changes after
output. `GO` promotes the existing product decision into the current integrated
baseline. `REFINE` reopens only the owner named by paired facts. Structural or
reconciliation failure is `STOP / RETHINK`.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`. Advance all four
  existing L6.31 profiles to one shared fresh-facts identity and make candidate
  comparisons read the matching fresh control cache.
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`. Its existing
  profile contract pins population, seeds and workers; add an assertion only if
  that public planning surface changes. Cache directories remain an internal
  total mapping in `report-registry.ts`, not a second exported API for a test.
- `docs/audits/PHASE_81A_CHECKPOINT_L6_31_INTEGRATED_REPLAY.md` **(new,
  generated outcome recorded after all four runs)**.
- `docs/audits/README.md`.
- `docs/PROJECT_STATUS.md`.
- this phase `README.md`.
- this step document.
- `14-post-match-preparation-choice.md` only if the outcome changes its entry
  gate.

No content, engine, domain, storage, UI, web, threshold or i18n edit belongs to
this checkpoint.

## Commands

```sh
nvm use 24.16.0
pnpm cli simulation-report --profile=phase81a-routine-youth-runway-l6-31-control-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-l6-31-integrated-control-7x10.json
pnpm cli simulation-report --profile=phase81a-routine-youth-runway-l6-31-candidate-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-l6-31-integrated-candidate-7x10.json
pnpm cli simulation-report --profile=phase81a-routine-youth-runway-l6-31-oos-control-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-l6-31-integrated-oos-control-7x10.json
pnpm cli simulation-report --profile=phase81a-routine-youth-runway-l6-31-oos-candidate-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-l6-31-integrated-oos-candidate-7x10.json
```

Each gate runs alone. A candidate starts only after its corresponding control
has completed and written the exact comparison cache. Never pipe a command or
interpret a timeout as correctness.

## Definition Of Done

All four arms come from `facts-v3`, reconcile, retain seven effective workers
and produce a paired verdict under the unchanged gates. The audit records raw
control/candidate values and per-world direction counts. `pnpm check`,
`git diff --check` and Graphify close the step.

## Outcome

| Measure | In-sample delta | OOS delta | World direction |
| --- | ---: | ---: | ---: |
| stationary-ready share | `+0.1106` | `+0.1057` | `7/7`, `7/7` |
| ceiling-gap reduction | `0.1648` | `0.1707` | `7/7`, `7/7` |
| generated-leader share | `+0.0690` | `+0.0500` | `6/7`, `6/7` |

Candidate generation-capable share is `0.5365` in-sample and `0.5219` OOS,
with `6/7` capable worlds in each. Immediate purity is `144/144` and `147/147`;
both pairs have zero structural/reconciliation failure and no new integrated
red. The OOS canonical JSON rebuild is byte-identical. The complete evidence is
in `PHASE_81A_CHECKPOINT_L6_31_INTEGRATED_REPLAY.md`.

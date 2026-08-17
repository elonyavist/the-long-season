# Step 00 - Product Contract, Requirements And Frozen Baseline

## Status

Not started. Documentation and measurement only.

## Goal

Turn the accepted product discussion into the canonical requirement and freeze
all populations, formulas, thresholds, profile IDs and supersession rules before
production implementation.

## What To Implement

- Read the final Phase 81A/L6.43B artifacts and record exact populations and
  limitations. Preserve the old-model evidence; do not reinterpret it as a
  target for the replacement.
- Amend `requirements.md` in one coherent pass:
  - replace the rule forbidding a stable hidden modifier with latent trajectory
    semantics;
  - replace true mutable per-attribute potential with latent prime plus derived
    reachable path;
  - replace P50/upper room scaling with probability-based absolute forecast;
  - remove special five/six stock/top-up as generation truth;
  - preserve global `1..6` half-stars and define six stars as extraordinary
    derived forecast;
  - record `10-11`, `12-13`, `14`, `15`, `16+` bands;
  - record `3:2:1` high-tail allocation and age-37 retirement;
  - record AI intents and no hidden oracle.
- Write one numeric register under this folder or `docs/audits/` and make it the
  sole owner of Phase 81B thresholds.
- Register the exact metric IDs, formulas, populations, non-vacuity rules and
  failure owners declared in
  [`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md).
  A numeric target always points to one metric ID; changing the formula creates
  a new metric ID instead of reinterpreting the old result.
- Use `simulation-report` to measure the unchanged baseline for:
  - ability pyramid by division/origin/age/role;
  - forecast class counts and realized outcomes where judgeable;
  - intake/exits/active stock;
  - top-performer ages and appearance shares;
  - AI need/transfer outcomes;
  - free-agent opening stock, inflow, attributed AI signings and closing stock,
    with one unique player-transition denominator rather than repeated
    evaluation events;
  - D1 historical target bands and D2/D3 opening-shape controls;
  - role/formation diversity monitors.
- Freeze exact seed prefixes and profile contracts for A-F.
- Register the executable locked baseline profile through the canonical report
  registry. A-F are frozen here as document contracts; their owning checkpoint
  steps add the executable registry entries only after their sections exist,
  without changing ID, seeds, worlds, seasons or worker contract.
- Freeze probability-to-star mapping hypotheses before forecast code.
- Freeze soft/hard interpretation of every gate. No unlabeled diagnostic may
  become binding after output is read.
- Record supersession of Phase 81A diagnostic categories. Old artifacts remain
  historical evidence and are never rewritten.
- Record which former Phase 81B responsibilities moved here and which remain
  in Phase 81C. Free-agent candidate selection moves here; contract expiry,
  background fixtures, `simulate-match` and complete-world evidence do not.
- Amend the Phase 81C entry gate after the product contract is accepted. Phase
  82A/82B remain transitively blocked behind Phase 81C.

## What NOT To Implement

- No domain, generation, engine, storage, market or UI code.
- No gameplay behavior in report instrumentation. Baseline facts must observe
  canonical producers and preserve gameplay/RNG continuity.
- No threshold derived from post-change data.
- No new report command or simulator.
- No deletion of old diagnostics yet.

## Expected Files

- `requirements.md`
- `docs/audits/PHASE_81B_PLAYER_TRAJECTORY_BASELINE.md` (new)
- `docs/audits/PHASE_81B_NUMERIC_REGISTER.md` (new)
- `docs/audits/README.md`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test only
  for baseline facts that are non-derivable at report time
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test only to
  assemble the baseline diagnostic from canonical facts
- an existing attribution/target reader under the canonical simulation-report
  folder only when the baseline reuses its semantics unchanged
- `packages/simulation-tools/src/modular-report/report-contract.ts` and test
  only if baseline profile metadata requires a canonical contract extension
- `docs/steps/81c-season-clock-contracts-and-complete-domestic-world/README.md`
- `docs/steps/81b-player-career-trajectory-population-and-recruitment-engine/README.md`
- `docs/steps/81b-player-career-trajectory-population-and-recruitment-engine/DESIGN_CONTRACT.md`
- `docs/steps/81b-player-career-trajectory-population-and-recruitment-engine/VALIDATION_PROTOCOL.md`
- `docs/steps/81b-player-career-trajectory-population-and-recruitment-engine/IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`
- this step document
- `docs/PROJECT_STATUS.md`

Before editing any listed phase document, confirm its current path and status;
the code/current tree wins over this draft.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --help

# Run alone; preserve the actual command exit code without a pipe.
pnpm cli simulation-report \
  --profile=phase81b-player-model-baseline-7x15-v1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-baseline-7x15-v1.json

test -f docs/audits/PHASE_81B_PLAYER_TRAJECTORY_BASELINE.md
test -f docs/audits/PHASE_81B_NUMERIC_REGISTER.md
git diff --check
graphify update .
```

Baseline runs use exactly seven workers where possible and run alone. Record
actual commands and exit codes in the audit.

The baseline audit must record the declared seven seed strings, all metric
populations and limitations, duration, profile/config versions, artifact hash
and the structural reconciliations in the central register. A baseline with an
empty required population or failed reconciliation is `STOP_INSTRUMENT`; it
does not authorize Step 01.

## Definition Of Done

- Requirements express one coherent model with no true-potential contradiction.
- Every later gate refers to one numeric register.
- A-F IDs, seeds, populations and profile dimensions are immutable before
  implementation. The baseline profile is executable now; A-F executable
  entries are added by their owning checkpoint without changing those frozen
  dimensions.
- Existing evidence is preserved with population/limitations.
- Phase 81C/82A/82B cannot start over obsolete semantics.
- Step 01 is the only next action.

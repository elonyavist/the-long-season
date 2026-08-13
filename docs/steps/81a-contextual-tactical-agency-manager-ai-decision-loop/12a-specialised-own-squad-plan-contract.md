# Step 12A - Specialised Own-Squad Plan Contract

## Status

**Done on 2026-08-13.** Product option B was explicitly accepted. Amendment A8,
the exact plan rows and two untouched D2 populations are frozen before code.

## Goal

Replace the falsified generic own-squad premise with six concrete football
plans, two untouched D2 populations and a powered historical lane without
moving the original season-point targets.

## What To Implement

- Record Amendment A8 in the phase design contract and the dedicated audit.
- Freeze the exact plan vocabulary, tactic inputs, conserved demand rows,
  commitment thresholds, fresh seeds and D2 gates.
- Keep AI opponent-free and preserve the manager's access to the same plans.
- Keep renewal mandatory but explicitly unevaluated until the final integrated
  `7 x 10`.

## What NOT To Implement

- No production, content, schema, report, UI or test changes.
- No simulation run, coefficient search or inspection of the D2 seed sets.
- No direct result bonus and no reinterpretation of Checkpoint D.

## Expected Files

- `docs/audits/PHASE_81A_SPECIALISED_OWN_SQUAD_PLANS_AMENDMENT.md` **(new)**
- `docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md`
- `docs/audits/README.md`
- the phase `README.md`
- `docs/PROJECT_STATUS.md`
- this step document
- `12b-specialised-own-squad-plan-implementation.md` **(new)**
- `12c-checkpoint-d2-specialised-own-squad-agency.md` **(new)**
- `13-tactical-chapters-and-canonical-explanation.md`

## Required Checks

```bash
nvm use 24
git diff --check
test "$(wc -l < docs/PROJECT_STATUS.md)" -le 300
```

## Definition Of Done

The product decision and every numeric/content choice needed by implementation
are frozen before code or D2 output exists; Step 12B is the only next step.

## Outcome

Six named football plans replace the generic product meaning without changing
the original point bands. D2 owns fresh C/D sets and a five-season historical
lane; no seed was generated or inspected. Step 12B is open.

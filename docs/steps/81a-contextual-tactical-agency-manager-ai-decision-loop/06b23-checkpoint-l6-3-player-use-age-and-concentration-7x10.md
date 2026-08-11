# Step 06B23 - Checkpoint L6.3 Player Use, Age And Concentration 7 x 10

## Status

Done - valid `REFINE`; Step 06B22 reopens for shooter-propensity refinement.

## User-Facing Reason

Step 06B22 replaced the numerical actor response with a football rule. This
checkpoint now asks whether ten-season careers distribute minutes, goals and
assists credibly across the squad and across ages. It changes no gameplay and
cannot tune the structural rule after reading its output.

## Frozen Population

- only entrypoint: `pnpm cli simulation-report`;
- profile: `phase81a-integrated-l6-3-7x10`;
- seed prefix: `phase81a-integrated-l6-3-v1`, unused by earlier checkpoints;
- exactly `7` worlds, `10` seasons and `7` workers;
- all three divisions simulated; historical player gates read First Division
  exactly as the register defines them;
- all canonical career sections, standard detail, JSON output;
- the profile reuses the complete hardened L6.2 reader, including standings,
  formations, renewal architecture and upset guardrails. Reuse is deliberate:
  a new player-only evaluator could hide a regression caused by naming a
  different causal shooter.

No world, season, seed, target or reader may be changed after execution begins.

## Frozen Focus Register

The exact versioned bands already owned by
`HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS` remain the only numeric gates:

| Family | Metric | Frozen band |
|---|---|---:|
| minutes | age-33+ starts mean | `12..17` |
| minutes | age-33+ minutes mean | `1100..1500` |
| minutes | appearance share | `0.48..0.58` |
| minutes | distinct users per club-season | `26..31` |
| concentration | top-ten scorer mean | `14.5..18.5` |
| concentration | top-ten assist mean | `8..10.5` |
| age | scorer mean age | `25.5..28.5` |
| age | assist mean age | `25..28.5` |
| age | age-33+ scorer share | `0..0.12` |
| age | age-33+ assist share | `0..0.12` |

Exceptional age-33+ leader reachability and zero reconciliation remain binding.
Early-to-late scorer and assist drift retain the integrated `0..2` band. The
season-ten generated-leader share, formation identity, replacement capacity,
standings and historical upset results remain full-register guardrails, but are
reported separately from the three focus families.

Shooter/creator ability-to-nomination correlations and the Big Five
leading-scorer/creator means remain diagnostics. They cannot be promoted to a
gate after the run.

## Decision Rules

- **GO:** all focus metrics, drift, exceptional-veteran reachability,
  reconciliation and inherited structural guardrails pass. Open 06B25.
- **REFINE:** facts reconcile but one or more focus or inherited gates fail.
  Record the exact family. 06B24 may be written only as an attribution step or
  for an owner demonstrated by those facts; this run alone never authorizes an
  guessed gameplay coefficient.
- **STOP / RETHINK:** missing facts, nonzero reconciliation, fallback selection,
  unavailable selected players, profile drift, a changed evaluator, or a new
  simulation path.

Opposite movements between fresh L6.2 and L6.3 populations are descriptive,
not causal: the seeds are different. Causal attribution requires a paired
counterfactual, never subtraction between these two reports.

## What NOT To Implement

- no player, fatigue, injury, selection, development or actor gameplay change;
- no new metric formula, target or report simulator;
- no cached L6.2 replay presented as post-06B22 evidence;
- no HTML yet: L6.4 owns the final inspectable desktop view;
- no hierarchy or upset retune.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`: locked fresh
  profile using the existing complete L6.2 checkpoint reader;
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`: prove the
  `7 x 10 x 7`, seed, complete-section and override-refusal contract;
- `packages/i18n/src/labels.ts`: profile title and description in all five
  supported languages;
- this step document, the Phase README, `docs/PROJECT_STATUS.md`, the generated
  audit under `docs/audits/` and its index;
- Step 06B24 only after the outcome, and only if its owner/scope is earned.

## Required Verification And Command

```bash
nvm use 24
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-integrated-l6-3-7x10 \
  --format=json \
  --report-output=simulation-out/phase81a-integrated-l6-3-7x10.json
git diff --check
graphify update .
```

The simulation command runs alone. Exit `1` is a valid canonical `REFINE`, not
a crash; structural failures and reconciliation determine whether it is usable.

## Outcome

The locked run completed in approximately `13m 30s`, exit `1`, with report hash
`81b7527a1c360af041d23504dc536d8e`, zero reconciliation, zero fallback and zero
unavailable selections. The full record is
`PHASE_81A_CHECKPOINT_L6_3_PLAYER_USE_AGE_AND_CONCENTRATION.md`.

Creator allocation remains healthy: correlation `0.3197`, top-ten assists
`10.25`. Shooter ability becomes visible (`0.2065`), but top-ten goals jump to
`37.38`. The attempted reuse of final-third tactical capacity as individual
shot propensity is therefore rejected. Tactical-capacity rows describe how a
shape produces football, not how its already-produced shots divide between
players.

Minutes, age, generated leaders, formation retention and local replacement
also remain red. Standings and all five broad upset lanes pass; exact
first-versus-last non-loss is narrowly high (`30/102`) and remains a real frozen
guardrail failure, not a licence to retune hierarchy.

## Next Action

06B22 reopens through a documented substep that separates shooter propensity
from tactical capacity and preserves the green creator path. It must establish
the new structural source before implementation; another response divisor is
forbidden.

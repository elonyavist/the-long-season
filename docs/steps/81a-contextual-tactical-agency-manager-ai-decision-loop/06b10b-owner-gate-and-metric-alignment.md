# Step 06B10B - Owner Gate And Metric Alignment

## Status

Done on 2026-08-09. L5.1 now fails closed and consumes the exact integrated-L5
formation retention metric plus explicit leader-age facts.

## Goal

Make L5.1 fail closed and ensure every reader measures the exact red product
metric before another long run.

## Implementation Contract

- `evaluateOwnerAttributionCheckpoint(...)` returns `OWNER_IDENTIFIED` only
  when every red family has one non-`not_attributed` owner and reconciliation is
  zero;
- leader volume, leader age and actor allocation are separate facts;
- club identity reuses the canonical four-replicated-formation reader that
  produced `0.8905`, never a second modal approximation;
- table diagnostics retain the complete strength-gap distribution required by
  the paired attribution;
- tests prove each `not_attributed` branch produces a non-passing process exit
  on real reachable data.

## What NOT To Implement

- no threshold movement;
- no gameplay correction;
- no duplicated formation-retention formula;
- no second simulator or reconstructed event.

## Expected Files

- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and tests;
- the canonical existing formation-retention reader and its tests, if sharing
  it requires extraction;
- `career-sections.ts`, registry/planner tests only when the profile contract
  changes;
- this step, phase README, project status.

## Exit

Focused real-data reachability, `pnpm check` and a no-gameplay-drift replay must
pass before attribution steps start.

## Recorded Outcome

- zero reconciliation plus any `not_attributed` owner returns `REFINE`;
- `OWNER_IDENTIFIED` requires all four non-empty owners;
- scorer/assist mean age, `33+` shares and exceptional-observation count are
  derived from the same top-ten rows as production;
- the duplicate modal retention formula was deleted. Career orchestration now
  passes the canonical `fourReplicatedFormationRetentionShare` from
  `evaluateLeagueDiversityCheckpoint(...)`;
- no engine behaviour, event or RNG changed.

## Verification

- focused career/owner suite: `13/13`;
- `pnpm check`: exit `0`, run alone; `302` files, `2,309` tests, `874` modules
  and `3,603` dependencies clean;
- all custom checks and typechecks green.

Next: 06B10C performs paired table-hierarchy attribution.

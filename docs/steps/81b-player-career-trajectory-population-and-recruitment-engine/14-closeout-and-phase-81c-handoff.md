# Step 14 - Closeout And Phase 81C Handoff

## Status

Blocked behind Checkpoint F review.

## Goal

Close Phase 81B with no residue, publish the final evidence and make Phase 81C
consume the new recruitment, player-development and forecast Interfaces.

## What To Implement

- Record final phase report with:
  - thesis and implemented architecture;
  - all A-F decisions, populations, commands, exits and hashes;
  - final numeric register/version;
  - remaining monitors and their owners;
  - manual HTML findings and accepted narrative variance.
- Update phase README/status and audit index.
- Update `docs/steps/README.md` and `docs/PROJECT_STATUS.md` within 300 lines.
- Amend Phase 81C:
  - entry requires Phase 81B GO;
  - contract/calendar work reuses the canonical recruitment and free-agent
    signing policy rather than replacing it;
  - complete-world reports consume public assessment and player trajectory
    outcomes without hidden truth or renderer formulas;
  - its 750 x 10 remains blocked until its background-world contract is
    executable and its bounded canary is green.
- Amend Phase 82A/82B only where their existing draft still names obsolete
  potential or free-agent semantics. They remain blocked behind Phase 81C.
- Verify exactly one beta reset occurred.
- Run deletion manifest:
  - no production `Player.potential`;
  - no special five/six allocation/top-up;
  - no remaining-reachable-room ratchet;
  - no old public projection policy fields;
  - no analysis oracle/switch past removal owner;
  - no unused export/helper/fixture/config/i18n/report module.
- Rebuild Graphify and inspect affected topology for orphaned Modules.
- Run repository and web closeout gates.
- Do not start Phase 81C.

## What NOT To Implement

- No new gameplay feature or calibration.
- No loans/races.
- No archival rewrite of old evidence.
- No commit unless explicitly authorized by the user.

## Expected Files

- `docs/audits/PHASE_81B_LATENT_CAREER_TRAJECTORY_REPORT.md`
- `docs/audits/README.md`
- this phase README and this step
- `docs/steps/README.md`
- `docs/PROJECT_STATUS.md`
- Phase 81C README and first-step handoff document
- Phase 82A/82B README only where obsolete Interface language must be removed
- only cleanup files named by the deletion manifest
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only to mark the final profile
  versions and link immutable audit outcomes; formulas/targets do not move

## Required Checks

```bash
nvm use 24
pnpm check
pnpm web:visual:qa
pnpm check:single-report-entrypoint
pnpm depcruise
git diff --check
graphify update .
```

Record actual counts, not remembered totals.

## Definition Of Done

- Phase report and all checkpoint evidence are indexed.
- Requirements/status/phase order agree.
- No old model or dead analysis path remains.
- Exactly one beta reset is proven.
- JSON/SQLite, CLI/web parity, deterministic simulation and web QA pass.
- Phase 81C has a precise new entry Interface but remains unstarted; Phase
  82A/82B remain transitively blocked.

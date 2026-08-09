# Step 06B7G3 - Checkpoint L4.6: Development Funnel Retry

## Status

Done with `REFINE`; the development curve reached parity but leaderboard
renewal remained red, assigning the next correction to dated match load.

## Goal

Measure whether real senior academy call-up minutes close the ten-season
development and renewal gap before changing growth, retirement or generation.

## Locked Population

- the seven L4 canary seeds, ten seasons, three competitions;
- exactly seven workers and a fresh checkpoint cache;
- the L4.4 behavioural targets remain unchanged;
- L4.5 is the structural population gate. The intentionally changed role-plan
  signature is recorded but is not compared to the superseded L4.3 signature.

## Decision

- **GO:** at least `5/7` worlds reach development parity, opening-senior
  survival is `<= 0.60`, opening leaderboard share is `<= 0.50`, generated
  leaderboard share is `0.30..0.60`, and every world has a generated leader.
- **REFINE:** a named existing owner is identified by the canonical funnel
  facts; change only that owner and repeat.
- **STOP / RETHINK:** no existing owner explains the failure.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`, fresh cache only;
- this document, L4.5, Step 06B7G2A, phase README and `docs/PROJECT_STATUS.md`;
- `docs/audits/PHASE_81A_CHECKPOINT_L4_6_DEVELOPMENT_FUNNEL.md` **(new)**.

## Required Command

```bash
source "$HOME/.nvm/nvm.sh"
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-development-renewal-l4-4-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-development-funnel-l4-6-7x10.json
```

The command runs alone. Its frozen L4.4 evaluator is expected to retain the
historical signature failure; L4.6 reads only the unchanged behavioural gates
after the separately recorded L4.5 structural `GO`.

## Definition Of Done

The behavioural retry has one canonical hash and a named outcome. No target or
engine coefficient changes inside this checkpoint.

## Recorded Result

Canonical hash `ac9c885697e984f62d2b49d0165e4570`, development parity
`7/7`, active opening-senior survival `0.548100`, opening-origin leader share
`0.792857`, career-generated leader share `0.207143`, and a generated leader in
every world. Ability ordering/range remained exact. Decision: `REFINE`; Step
06B7G5 owns dated match load and recovery, never a direct age outcome penalty.

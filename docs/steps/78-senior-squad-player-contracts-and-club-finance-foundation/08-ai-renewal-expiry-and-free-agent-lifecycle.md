# Step 08 - AI Renewal, Expiry And Free-Agent Lifecycle

## Status

Ready.

## Goal

Let every AI club manage renewals, releases, expiries, and free agents through
the same contract and finance rules without collapsing its squad.

## User-Visible Outcome

Other clubs keep changing credibly over seasons: useful players renew, surplus
players can leave, and expired contracts create a real free-agent pool.

## Scope

1. Add one deterministic AI renewal/release policy using age, level, potential,
   role depth, agreed status, wage demand, remaining term, cash, and wage
   budget.
2. Start AI talks early enough for delayed responses and counters to matter.
3. Resolve accepted AI terms through the canonical negotiation application.
4. End expired contracts and remove club ownership exactly once.
5. Derive free agents from world ownership and active-contract truth.
6. Protect minimum senior squad and goalkeeper/department structure using the
   existing squad-maintenance/intake owners rather than a second generator.
7. Keep the selected club entirely outside AI decisions.
8. Emit structured lifecycle/history facts for later Squad/Market surfaces.
9. Persist the now runtime-active contract-negotiation state and explicit
   Inbox Continue policy losslessly through JSON and SQLite/OPFS.
10. Advance the clean beta persistence baseline once, rejecting the previous
    schema rather than synthesizing negotiations or message policy during
    load.

## Implementation Contract

- AI receives no privileged affordability or contract shortcut.
- Stable ordering and seeded decisions make every season reproducible.
- A player cannot be both free agent and club-owned.
- Emergency squad repair must use an existing real lifecycle path and be
  reported; it may not invent silent placeholder contracts.

## Expected Files

- new focused AI contract lifecycle Modules/tests under
  `packages/engine/src/career/`
- current squad maintenance, intake, turnover, and season rollover Modules/tests
- current contract negotiation/application Modules/tests
- current career-world/state validation/tests
- current simulation-tools fixtures only where required for multi-season proof
- current JSON/envelope and SQLite schema, migrations, mappers, repositories,
  workers, and focused round-trip/reset tests required to persist active
  negotiation state and explicit Inbox Continue policy
- current web persistence lifecycle tests only where required to prove a
  pending selected-club decision survives save and reload
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No selected-club automation, transfer-market target search, loan, regen-only
  rescue, or hidden budget exemption.
- No manager/personality/staff simulation.
- No UI.
- No compatibility mapper, lazy default, synthesized negotiation, or inferred
  Continue policy for the superseded beta schema.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run test
pnpm --filter @game/storage run typecheck
pnpm --filter @game/simulation-tools run test
pnpm --filter @game/web run test
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Review one season of AI renewals/releases for the weakest, median, and
  strongest clubs.
- Inspect released players and verify their former club, contract history, and
  free-agent status agree.
- Save and reload a pending selected-club response and blocking counteroffer;
  confirm negotiation identity, due date, terms, and Continue policy are
  unchanged.

## Completion Criteria

- AI contract decisions are deterministic, affordable, and structurally safe.
- Expiry and free agency are real ownership transitions.
- No selected-club decision is automated.
- Runtime-active negotiations and explicit Inbox Continue policy round-trip
  losslessly through the new clean beta persistence baseline.
- Step 09 remains the only next implementation step.

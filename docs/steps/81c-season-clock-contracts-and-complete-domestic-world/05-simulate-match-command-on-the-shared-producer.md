# Step 05 - Simulate-Match Workflow On The Shared Producer

## Status

Blocked behind Step 04.

## Goal

Expose one developer/player workflow for simulating a match through the exact
producer used by automatic domestic fixtures.

## What To Implement

- Add `simulate-match` as a workflow command, not a report entrypoint. All
  reusable diagnostics remain modules/profiles under `simulation-report`.
- Build kickoff context through the same club, XI, formation, tactic,
  availability and RNG owners used by Step 04.
- Route automatic and interactive kickoff through one producer. No command-
  specific match formula or background wrapper with different semantics.
- Prove paired kickoff equivalence for score/events/RNG consumption when no
  human intervention occurs.
- Keep later human tactical/substitution decisions outside that equivalence;
  differences after an explicit intervention are expected and attributable.
- Render user-facing CLI text through i18n in all five supported languages.
- Ensure report-entrypoint enforcement still finds only `simulation-report`.

## What NOT To Implement

- No second `*-report` command or compatibility alias.
- No background-fixture reconstruction from command output.
- No hidden AI information or fixed formation.
- No new live-match gameplay feature beyond exposing the existing producer.

## Expected Files

- shared match/kickoff producer and tests named by Step 04/Graphify
- CLI workflow command/parser/index/tests and i18n labels
- background automatic caller only if needed to consume the shared producer
- single-report-entrypoint enforcement tests when command classification needs
  an explicit allow-list update
- this step and Step 06; `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm check
pnpm check:single-report-entrypoint
git diff --check
graphify update .
```

## Definition Of Done

- One kickoff/match producer serves automatic and interactive paths.
- Paired no-intervention executions are identical.
- Intervention differences begin only at the recorded decision boundary.
- No report command, parser, formatter or legacy wrapper was introduced.
- Step 06 is the only next action.


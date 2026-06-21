# Phase 17 Review And Next Phase Decision

## Goal

Finalize Phase 17 by documenting what the market MVP can do, what remains out of scope, and whether the next phase should be career persistence.

## Why we implement it this way

The first market MVP is intentionally non-persistent. The project needs a clear handoff before moving to durable career state, otherwise the market can become a demo-only branch that is hard to integrate later.

The final report should be useful to both an LLM and a junior developer: it should name the contracts, explain the constraints, list checks, and say exactly what the user should inspect.

## What to implement

- Create `docs/audits/MARKET_MVP_REPORT.md`.
- Summarize each Phase 17 step:
  - adopted contract or Module;
  - expected files changed;
  - verification result;
  - remaining risk.
- Confirm that Phase 17 did not add:
  - persistence;
  - loans;
  - contracts/wages;
  - transfer windows;
  - scouting fog;
  - AI market behavior;
  - installments/player exchanges.
- Recommend the next phase:
  - expected recommendation is `Phase 18 — Career State And Transfer Persistence`;
  - if a blocker remains, document it instead.
- Update `docs/PROJECT_STATUS.md` to mark Phase 17 complete or blocked.
- Do not create Phase 18 docs unless explicitly asked after this phase.

## What NOT to implement

- Do not implement new market behavior.
- Do not add persistence.
- Do not create Phase 18 docs.
- Do not hide known market limitations.
- Do not change source code unless a tiny documentation correction is needed for truthfulness.
- Do not alter balance tuning.

## Allowed dependencies

- Documentation-only step unless a tiny correction is required and documented.

## Expected files

- `docs/audits/MARKET_MVP_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent`
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-star-rejected`
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `rg -n "@game/storage|JsonGameStorage|saveGame|loadGame|writeFile|readFile" packages/engine/src/market apps/cli/src/commands/simulate-season*`
- `rg -n "loan|wage|contract|installment|exchange|sell-on|window|registration|scout|fog|agent|negotiation" packages/domain/src/entities/transfer.entity.ts packages/engine/src/market apps/cli/src/commands/simulate-season*`

Out-of-scope scans may match documentation comments or tests only if the report explains why they are not implementation branches.

## Definition of Done

- `docs/audits/MARKET_MVP_REPORT.md` exists and summarizes Phase 17.
- Phase 17 is marked complete or blocked in `docs/PROJECT_STATUS.md`.
- The next phase recommendation is explicit.
- The user knows exactly which CLI commands to inspect.
- No Phase 18 implementation or documentation starts.

## Claude Code task prompt

Read the required project docs, all completed Phase 17 step outcomes, and this step document. Create `docs/audits/MARKET_MVP_REPORT.md`, run the final checks, update `docs/PROJECT_STATUS.md` with the Phase 17 result and next-phase recommendation, then stop. Do not create Phase 18 docs unless explicitly asked.

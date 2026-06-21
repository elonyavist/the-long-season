# 01 - Phase 17 Output Review

## Goal

Review the permanent-transfer MVP output and confirm the persistence scope before writing career-state code.

The purpose of this step is to prevent Phase 18 from becoming a broad career-system implementation. The only product question to answer here is: what must become durable so a completed permanent transfer can matter after the command ends?

## What to review

- `docs/audits/MARKET_MVP_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/market-roadmap/README.md`
- Phase 17 step documents
- Existing storage package capabilities
- Existing market/domain contracts
- Existing CLI market demo output

## What to decide

- Which fields belong in the first minimal `CareerState`.
- Which Phase 17 transfer result fields must become durable.
- How selected-club context is represented.
- How transfer budgets are persisted without introducing a full economy.
- How transfer history is stored for inspection.
- Which save identifier/path convention the CLI should use in this phase.

## What NOT to implement

- Do not implement career-state code in this step unless the step document is explicitly updated first.
- Do not add loans.
- Do not add contracts or wages.
- Do not add transfer windows.
- Do not add scouting fog.
- Do not add AI market behavior.
- Do not add youth systems.
- Do not add automatic lineup, tactic, or market decisions.
- Do not add UI.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md` only if the review changes the next step scope.

## Required checks

- `test -f docs/audits/MARKET_MVP_REPORT.md`
- `test -f docs/steps/18-career-state-and-transfer-persistence/02-career-state-contract.md`
- `rg -n "career|Career|persistent|persist|transfer history|selected club|budget|playable|loop" docs/audits docs/PROJECT_STATUS.md docs/market-roadmap docs/steps/17-market-mvp-permanent-transfers`

## Definition of Done

- The minimal durable career scope is confirmed.
- Any lesson that affects the next step is written into the next step document.
- `docs/PROJECT_STATUS.md` is updated with the review result and next action.


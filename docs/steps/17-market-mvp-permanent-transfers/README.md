# Market MVP Permanent Transfers Steps

## Goal

Add the first manager-driven transfer-market slice: permanent transfers only, deterministic, in-memory, and inspectable from the CLI.

This phase turns existing squad/formation facts into the first manual squad-building action without pretending that the full career economy exists.

## Why we implement it this way

Phase 16 decided that market MVP can start now only if it stays narrow:

- no durable career persistence;
- no loans;
- no contracts or wages;
- no transfer windows or registration;
- no scouting fog;
- no AI club market behavior;
- no installments, sell-on clauses, or player exchanges.

The project already has enough stable foundations for this first slice: `GameState`, `Club.playerIds`, `Money`, player abilities/potential, birth dates, club category/reputation, and squad/formation inspection.

The market MVP should introduce reusable market Interfaces now, so future persistence, loans, scouting, contracts, and AI can build on them instead of rewriting them.

## What to implement

- Review the Phase 16 dependency map before coding.
- Add dependency-free domain contracts for permanent transfer intent, market state, club transfer budget, feasibility result, rejection reason codes, and transfer preview/apply result.
- Add deterministic player valuation v1:
  - true-data based;
  - uses `Money`;
  - no perceived/scouted value yet;
  - no rendered prose.
- Add deterministic player willingness v1:
  - rejects unrealistic sporting downgrades;
  - allows plausible moves for role/category/reputation reasons;
  - emits structured reason keys/data only.
- Add transfer feasibility and in-memory apply preview:
  - validates buyer, seller, target player, budget, ownership, valuation, and willingness;
  - returns copy-on-write preview state;
  - does not write saves.
- Add CLI inspection for a deterministic fake-content market demo.
- Finish with a Phase 17 review report and a decision on Phase 18.

## What NOT to implement

- Do not implement career persistence or save/load commands.
- Do not modify storage.
- Do not add loans.
- Do not add contracts, wages, agents, bonuses, sell-on clauses, player exchanges, installments, release clauses, or free agents.
- Do not add transfer windows, deadline day, registration rules, or season-transition behavior.
- Do not add scouting fog, visible ranges, staff, youth intake, player growth, or development promises.
- Do not add AI club buying/selling.
- Do not add automatic squad planning, automatic recommendations, or auto-buy behavior.
- Do not render user-facing market text outside the localization layer.
- Do not keep unused compatibility helpers, dead branches, or future-only enum values.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `i18n -> presentation/localization only`
- `apps/cli -> engine, content, storage, simulation-tools, shared, i18n`

No new runtime dependencies.

## Expected files

- `docs/steps/17-market-mvp-permanent-transfers/01-phase-16-dependency-review.md`
- `docs/steps/17-market-mvp-permanent-transfers/02-market-domain-contracts.md`
- `docs/steps/17-market-mvp-permanent-transfers/03-player-valuation-v1.md`
- `docs/steps/17-market-mvp-permanent-transfers/04-player-willingness-v1.md`
- `docs/steps/17-market-mvp-permanent-transfers/05-transfer-feasibility-and-apply-preview.md`
- `docs/steps/17-market-mvp-permanent-transfers/06-cli-market-inspection.md`
- `docs/steps/17-market-mvp-permanent-transfers/07-phase-17-review-and-next-phase-decision.md`
- Future phase output: `docs/audits/MARKET_MVP_REPORT.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.
- Final phase verification should run `pnpm check` plus the CLI smokes listed in the final step.

## Definition of Done

- Permanent-transfer domain contracts exist and are dependency-free.
- Player valuation v1 is deterministic, tested, and uses `Money`.
- Player willingness v1 rejects obviously unrealistic moves with structured reasons.
- Transfer feasibility combines ownership, budget, valuation, and willingness without persistence.
- In-memory apply preview moves one player between club rosters without mutating the original state.
- CLI can inspect at least one accepted and one rejected deterministic market scenario.
- User-facing market output is localized.
- `docs/audits/MARKET_MVP_REPORT.md` records the result and next-phase recommendation.
- `docs/PROJECT_STATUS.md` marks Phase 17 complete or blocked and identifies the next action.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, `docs/audits/CAREER_SYSTEMS_DEPENDENCY_MAP.md`, and `docs/steps/17-market-mvp-permanent-transfers/01-phase-16-dependency-review.md`. Confirm the Phase 17 scope from Phase 16 before implementing market code. Update `docs/PROJECT_STATUS.md` and stop after this step unless executing the whole phase prompt.

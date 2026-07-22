# Phase 78 - Senior Squad, Player Contracts And Club Finance Foundation

## Status

In progress. Steps 01-14 are Done and Step 15 is active.

## Goal

Complete the first credible senior-squad management surface and the football
systems it depends on: persistent shirt numbers, active player contracts,
contract negotiation, wage and transfer budgets, club cash, contract expiry,
deterministic AI renewals, and one canonical formation shared by Squad,
Tactics, preparation, and Matchday.

This phase replaces the previously reserved Market Phase 78. Market moves to
Phase 79 because a transfer must land in a real squad, create a real contract,
and affect real finances instead of ending in a market-only dead end.

## User-Facing Outcome

The manager can:

- inspect the complete senior squad in one dense, sortable table;
- understand number, role, age, condition, morale, selection, availability,
  value, current level, and potential assessment without horizontal scrolling;
- open a full-screen player profile with exact current attributes, role fit,
  value, contract terms, wage, agreed status, and contract history;
- place or remove a player from the current XI through an explicit slot choice;
- reuse exactly the same current formation in Tactics, preparation, and the
  next Matchday;
- keep injured or suspended players visibly selected until manually replaced,
  while kickoff correctly remains blocked;
- offer a renewal, receive an answer or counteroffer after game days, and make
  the resulting decision through Posta;
- see contract and payroll decisions consume real club money and wage budget.

## Entry Gate

- Phase 77 is complete and owns the canonical live-match and full-time commit
  paths.
- Phase 75 owns current ability, reachable potential, development, and decline.
- Browser careers persist through the SQLite/OPFS session boundary.
- Posta and Continue already support structured attention and blocking
  decisions.
- The shared tactical board is the only approved XI and bench editor.
- The user explicitly accepted invalidating every current beta save so all
  clubs start with coherent contracts and finances.

## Locked Product Decisions

### Squad And Tactics

- Squad and Tactics remain separate top-level sidebar sections. They are not
  nested tabs pretending to be separate screens.
- Both sections edit one canonical current match plan. Preparation and
  Matchday consume that same plan.
- The completed match does not clear the plan. The next fixture starts from
  the previous XI, bench, formation, roles, and tactic.
- Injury or suspension never silently removes or replaces a selected player.
  The plan remains visible and stale; fixture eligibility blocks kickoff until
  the manager acts.
- If the XI is complete, `Field` opens an explicit replacement choice. Slots
  are ranked by canonical role suitability, but no player is removed without
  confirmation.
- Youth stays in its own future section. This phase presents the senior squad
  only.

### Senior Squad Table

The default desktop table is:

`# | Role | Player | Condition | Morale | Status | Value | Level | Potential | Action`

- Condition is the current percentage.
- Morale uses an accessible directional indicator and text alternative.
- Status combines selection (`XI`, `Bench`, or unselected) and availability
  (`Available`, `Injured`, or `Suspended`) instead of hiding one dimension.
- Value uses the selected currency preference and integer minor-unit money.
- Level and Potential are coarse club-relative assessments. Exact hidden
  potential is never rendered.
- A contract with fewer than eight months remaining adds one small contract
  alert beside the name, with an accessible tooltip and non-color cue.
- Wage and full contract terms stay in the player profile.
- The table has no horizontal scroll at supported viewports or 200% text.

### Player Profile

- Clicking a player opens one full-screen accessible overlay.
- Exact current `1..20` attributes are visible by technical, mental, physical,
  and goalkeeper groups where applicable.
- Raw current-ability and potential-ability numbers remain diagnostics only.
- Potential is shown as a bounded club assessment, without fake scout
  precision before a staff/scouting system exists.
- The profile includes current roles and suitability, condition, morale,
  availability, value, persistent shirt number, active contract, annual wage,
  agreed squad status, bonuses, expiry, and factual contract history.
- The overlay traps focus, closes explicitly and with Escape, restores focus to
  the originating row, and follows the Phase 76 motion language.

### Contracts

- Every senior player has exactly one active club contract or is a free agent.
- Contracts are separate career entities, not permanent fields on `Player`.
- Every active contract has a stable namespaced ID, club, player, professional
  or youth type, start date, end date, annual base wage, agreed squad status,
  signing bonus, appearance bonus, and role-relevant goal or clean-sheet bonus.
- Terms that have no current gameplay consumer are forbidden. There are no
  option years, agents, release clauses, loan clauses, promotion clauses, or
  legalistic add-ons in this phase.
- Renewal negotiations advance in game time. A player may accept, reject, or
  counter after a deterministic response delay.
- A counteroffer or deadline decision stops Continue through structured Posta.
- The selected club never renews, releases, or replaces a player silently.
- AI clubs negotiate, renew, release, and protect squad structure through one
  deterministic policy using the same affordability and contract rules.
- Expiry ends club ownership and produces a free agent unless a completed new
  contract already exists.
- Transfers terminate the seller contract and create the buyer contract.
- Youth conversion and release use the same active-contract invariant.

### Club Finances

- Every club starts with a cash balance, transfer budget, annual wage budget,
  committed annual wages, and an ordered finance ledger.
- Generation uses division/category, reputation, roster quality, and current
  contracts. It does not give every club the same numbers.
- Real Phase 78 income is limited to opening capital, competition-owned season
  distributions, and transfer proceeds.
- Real Phase 78 costs are transfer fees, signing bonuses, annual base wages,
  appearance bonuses, goal bonuses, and clean-sheet bonuses.
- Contract and transfer commands cannot spend unavailable cash or wage budget.
- Finance entries are idempotent and are applied at canonical annual-payroll,
  contract, transfer, or full-time commit boundaries, never at UI render time.
- Stadium, tickets, sponsors, TV negotiation, facilities, loans, debt,
  bankruptcy, and a broad Finances screen remain out of scope until they have
  real workflows.

### Save Reset

- All existing beta browser and CLI saves are invalidated.
- There is no compatibility mapper, optional default, or partial migration for
  pre-Phase-78 careers.
- The new clean baseline must generate contracts, registrations, and finances
  for every club before the career can be persisted.
- The app explains the beta reset clearly and routes the user to New Career;
  it must not show a generic storage failure.

## Architecture And Ownership

- `@game/domain` owns contract, registration, finance, negotiation, history,
  and validation vocabulary.
- `@game/content` owns deterministic starting contract, number, and club-
  finance generation policy from real world-generation inputs.
- `@game/engine` owns negotiation, payroll, bonuses, expiry, AI decisions,
  valuation integration, plan eligibility, and lifecycle transitions.
- `@game/storage` persists the complete new baseline losslessly and rejects the
  retired beta schema cleanly.
- `@game/ui` projects framework-free Squad, player-profile, contract, finance,
  and plan-action read models.
- `apps/web` owns routing, transient table/filter/modal state, explicit manager
  commands, accessible presentation, and semantic Motion only.
- No package-wide balance/config container is introduced. Each policy stays
  beside its single engine/content owner and has tests that explain the values.

## Ordered Steps

1. `01-current-ownership-and-gap-audit.md`
2. `02-shirt-number-and-player-contract-world-generation.md`
3. `03-club-finance-and-budget-world-generation.md`
4. `04-clean-beta-save-reset-and-persistence-contract.md`
5. `05-payroll-bonuses-and-finance-ledger-lifecycle.md`
6. `06-contract-demand-offer-and-negotiation-engine.md`
7. `07-selected-club-contract-posta-and-continue-workflow.md`
8. `08-ai-renewal-expiry-and-free-agent-lifecycle.md`
9. `09-transfer-youth-valuation-and-contract-history-integration.md`
10. `10-durable-match-plan-and-fixture-eligibility-separation.md`
11. `11-squad-player-profile-and-contract-read-models.md`
12. `12-senior-squad-table-and-navigation-workspace.md`
13. `13-explicit-lineup-selection-and-tactics-synchronization.md`
14. `14-full-screen-player-profile-and-renewal-workspace.md`
15. `15-contract-finance-and-squad-long-run-gates.md`

The former Step 16 final cleanup is intentionally moved into the last step of
Phase 79. That integrated closeout must inspect the complete Squad, contracts,
finance, Market, Posta, persistence, and browser journey once the transfer loop
actually exists, instead of certifying the same boundaries twice.

## Phase-Level Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/content run test
pnpm --filter @game/engine run test
pnpm --filter @game/storage run test
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

Step 15 also runs the documented `50 worlds x 10 seasons`, `250 worlds x 30
seasons`, and accepted beta-scale sharded long-run sample, with repeated
structured hashes where reproducibility is asserted. The operational
`10,000 worlds x 50 seasons` release-scale gate remains available but is not a
Phase 78 completion requirement.

## What NOT To Implement

- No Market target browser, loans, installments, auctions, or scouting fog.
- No broad Finances page, ticket price, sponsor, stadium, facility, debt, or
  bankruptcy workflow.
- No Youth or Staff UI.
- No agents, personalities, promises, contract option years, or clauses without
  a current deterministic consumer.
- No automatic selected-club renewal, release, lineup replacement, or injury/
  suspension cleanup.
- No exact hidden potential in browser output.
- No second tactical board, second match plan, UI-owned suitability formula, or
  duplicate table sorting implementation.
- No runtime LLM, generated rendered prose in domain/engine, or animation-owned
  command completion.
- No old-save compatibility branch, dead helper, dormant API, or placeholder
  screen.

## Definition Of Done

- Every generated club has coherent finances, unique senior shirt numbers, and
  exactly one active contract per owned senior player.
- Contract offers, delayed replies, counteroffers, acceptance, rejection,
  renewal, expiry, release, free agency, transfer, youth conversion, payroll,
  and bonuses are deterministic and durable.
- Posta and Continue stop only for real selected-club contract decisions.
- The current plan survives matches and remains visibly stale when a selected
  player is unavailable; kickoff rejects the plan until the manager acts.
- Squad, Tactics, preparation, and Matchday use one canonical plan.
- The Squad table and full-screen profile satisfy the locked information,
  accessibility, responsive, motion, and no-horizontal-scroll contracts.
- Old beta saves are rejected/reset intentionally without generic storage
  errors or compatibility code.
- Long-run gates show no duplicate active contract, orphan ownership, expired
  active contract, duplicate shirt number, unfunded command, missing payroll,
  structurally collapsed roster, or same-seed divergence.
- Phase 78 closes at Step 15 with its structural evidence and exactly one next
  phase: Phase 79. Cross-phase dead-code, architecture, accessibility, and
  browser closeout is owned once by the final Phase 79 step.

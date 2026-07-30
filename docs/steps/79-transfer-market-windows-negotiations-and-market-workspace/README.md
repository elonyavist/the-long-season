# Phase 79 - Transfer Market Windows, Negotiations And Market Workspace

## Status

In progress. Steps 01-13 are Done, Step 14 is Reopened and paused, and Step 15
is not started. The user-requested Phase 79A, 79B, and 79C interpositions are
complete; Phase 79D is also complete by explicit product decision.

The market-active `50 x 20` diagnostic kept every Phase 79 structural invariant
clean but exposed near-absent permanent transfers, systematic free-agent
accumulation, and maximum-only wage-warning semantics. These findings are owned
by
`docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/`.
Phase 79A returned here after its repeated `50 x 20` with zero owned structural
failure; it does not replace the required release-scale closeout gate.

Phase 79B delivered the bounded Squad/Market player-workspace redesign and
durable career-statistics archive requested after direct browser review. It
did not run, replace, weaken, or claim this phase's release gate, and returned
control to Step 14 before later interpositions.

Phase 79C delivered the global `1..6` rating, canonical three-division world,
source-backed public-value/wage/economy calibration, promotion/relegation, and
non-vacuous market diagnostics. Its bounded `10 x 10` passed with zero failed
worlds, minimum squad `18`, and zero structural or rating-cap violations. It
did not run or claim this phase's release-scale gate and returned control to
Step 14 before Phase 79D.

Phase 79D corrected the post-79C exceptional-generation, derived public
potential range, range-aware prospect value, effective-rarity, annual-intake,
display-safe upper-cap, asking/offer/counter/completed-fee spread, and
zero-observation defects. Its focused checks, repository verification, build,
and browser QA pass. Its direct `50 x 20` was stopped, produced no report, and
is not claimed as evidence. Step 14 remains paused while Phase 80 reworks are
documented and executed. Their final validation must
run a resumable `50 x 20` with exactly `7` workers. The later release-scale
evidence remains unrun and unclaimed.

## Goal

Turn the existing transfer, contract, and finance foundations into one complete
permanent-transfer loop that is understandable, time-bound, financially safe,
and useful to the manager. The phase adds real market windows, club and player
negotiations, preliminary agreements in the final six contract months,
deterministic AI behavior, Posta decisions, and a production Market workspace.

The result must create football tension, not accounting friction: the manager
can explore players throughout the year, knows exactly when a move is legal,
sees possible financial exposure without losing budget for unanswered offers,
and receives a clear answer within three game days.

## Entry Gate

- Phase 78 Steps 01-14 are Done. Step 15 remains open and was accepted as
  deferred by the explicit 2026-07-23 entry-gate override recorded in
  `docs/PROJECT_STATUS.md`; its release obligations remain outstanding.
- Senior ownership, registrations, contracts, annual wages, club cash,
  transfer budget, annual wage budget, ledgers, and one durable match plan are
  canonical and passing their structural gate.
- Posta and Continue can stop on real selected-club decisions.
- SQLite/OPFS persists the current working session and explicit save cadence.
- The integrated Phase 79 Step 15 remains the final cleanup/report boundary;
  the deferred Phase 78 Step 15 gate is not silently treated as complete.

## User-Facing Outcome

The manager can:

- open Market throughout the season and inspect real generated players;
- see whether the current competition transfer window is open, when it closes,
  and when the next window starts;
- submit an up-front permanent-transfer offer during an open window;
- negotiate first with the selling club and then with the player;
- receive acceptance, rejection, or a counteroffer within three game days per
  negotiation stage;
- understand current cash, transfer budget, annual wage headroom, committed
  money, and informational pending exposure before confirming;
- sign a player only through one atomic transfer, contract, registration,
  finance, history, and squad update;
- negotiate renewals throughout the year;
- agree a future contract with an eligible player whose current agreement has
  six months or less remaining;
- resolve every required response through Posta without hidden automation.

## Locked Product Decisions

### Competition-Owned Transfer Windows

- Transfer dates are not configurable by the user and do not live in a generic
  balance package.
- `@game/content` owns a small, source-backed date catalog for competitions
  that are actually playable. Domain and engine consume the resolved dates;
  they do not invent or override them.
- The current generated competition is the Italian professional third-tier
  demo. Its first supported season uses the official 2026/27 professional
  windows: `2026-07-01` through `2026-09-01`, and `2027-01-02` through
  `2027-02-01`, inclusive.
- Later seasons repeat the same competition-owned month/day template until a
  content release deliberately updates it. This keeps long careers
  deterministic while remaining recognizably realistic.
- A future playable English, Spanish, German, French, or other championship
  must add its own researched dates beside that competition content. Phase 79
  must not ship unused speculative records for leagues the game cannot start.
- Every supported competition has exactly two registration windows per season.

### Outside The Windows

- Market inspection remains available.
- The manager may renew contracts with current players throughout the year.
- The manager may negotiate a preliminary agreement with an eligible player
  whose active contract has six months or less remaining.
- Permanent transfers, ordinary external free-agent registrations, and club-
  to-club offers are blocked outside an open window with a structured reason
  and the next opening date.
- A transfer-stage deadline cannot cross the closing instant. An unresolved
  stage expires when the window closes.

### Three-Day Negotiations

- Club-to-club negotiation and player-contract negotiation are two explicit
  stages. Each stage lasts at most three calendar game days.
- A counteroffer does not reset the current stage deadline.
- Responses are deterministic from structured football and financial facts.
- Same-day resolutions use stable submission order and stable IDs.
- Continue stops only when the selected club has a real response or decision.

### Budget And Pending Exposure

- A submitted or countered offer does not spend or reserve cash, transfer
  budget, signing bonus, or annual wage headroom.
- The UI derives and labels aggregate pending exposure so the manager can see
  risk without mistaking it for committed money.
- Every acceptance or completion rechecks affordability against current facts.
- If another deal has consumed the available budget, an otherwise accepted
  pending deal is cancelled with an explicit `unaffordable` fact no later than
  its three-day resolution boundary.
- No partial transfer is allowed. Fee, seller contract closure, buyer
  contract, registration, number, history, ledger, and ownership commit once
  or not at all.

### Preliminary Agreements

- Eligibility starts when six months or less remain on the active contract.
- The agreement has no transfer fee and starts after the current contract
  ends; ownership and registration remain with the current club until then.
- One player can have at most one valid future agreement.
- A future agreement cannot overlap another active or future agreement.
- The selected club always decides explicitly. AI clubs use the same
  eligibility, affordability, deadline, and activation rules.
- Country-specific legal exceptions are out of scope until their competitions
  are playable; the current game rule is universal and explicit.

### Market Scope

- Phase 79 supports permanent up-front transfers and preliminary agreements.
- There are no loans, installments, sell-on clauses, release clauses, agents,
  auctions, bidding wars, registration quotas, work permits, or fake scouting
  uncertainty.
- The browser never exposes exact hidden potential.
- Motion gives semantic feedback for submission, reply, completion, expiry,
  and cancellation; it never owns timing or command completion.

## Architecture And Ownership

- `@game/domain` owns transfer-window vocabulary, negotiation stages, future
  agreements, states, reasons, invariants, and stable IDs.
- `@game/content` owns researched window dates for playable competitions only.
- `@game/engine` owns eligibility, three-day progression, valuation,
  willingness, affordability, AI decisions, atomic completion, and future-
  agreement activation.
- `@game/storage` persists every durable market fact losslessly.
- `@game/ui` owns framework-free Market, offer, budget, and Posta read models.
- `apps/web` owns Market routing, transient filters and drafts, accessible
  presentation, explicit commands, and semantic Motion.
- No package-wide configuration container, UI-owned market rule, or second
  transfer implementation is allowed.

## Phase 78 Carry-Forward Quality Register

Phase 79 must correct the following proven Phase 78 defects inside the existing
step that owns each boundary. They are not a license for a generic cleanup
step or unrelated refactor.

| ID | Classification | Required resolution | Owning step |
| --- | --- | --- | --- |
| `P79-CF-01` | Incomplete behavior | Replace the hardcoded `steady` morale direction with a reload-stable direction derived from the latest canonical morale consequence. Do not compare React render snapshots. If no canonical fact can support a direction, remove the unsupported direction branches instead of fabricating one. | 09 |
| `P79-CF-02` | Divergence risk | Replace both adapter-owned `244` checks with one exported `@game/ui` contract-expiry alert policy/helper and cover the exact boundary once. | 09 |
| `P79-CF-03` | Duplication and inconsistent presentation | Replace the three web-local currency formatters with one shared localized display formatter. Keep exact two-decimal editable values as a separate form concern rather than forcing display and input precision to match accidentally. | 10-11 |
| `P79-CF-04` | Latent draft-loss bug | Seed a contract or transfer draft once when its editing workflow opens. Career-state/object identity refreshes must not erase typed values; only explicit reset, cancel, successful replacement, player/workflow change, or close may reseed it. | 11 |
| `P79-CF-05` | UX verification gap | Reuse canonical `CareerSessionStatus.dirty`; prove contract and market commands mark it and that the unsaved warning remains visible or reachable while the relevant workspace is open. Do not create contract-local dirty state or action-level autosave. | 13 |
| `P79-CF-06` | Long-career performance defect | Pre-index contract history and latest matching negotiations by player before building player profiles; prohibit repeated full-history/full-negotiation scans inside the player loop. | 09 |
| `P79-CF-07` | Type-safety defect | Replace `as unknown as WebCareerState` in the browser career builder with an explicitly typed construction boundary whose missing fields fail typecheck. | 13 |
| `P79-CF-08` | Readability defect | Correct the malformed contract-command switch indentation while that runtime is touched and keep the command branches formatter-clean. | 13 |

Step 15 must prove all eight entries are resolved, that the old helpers and
unsupported branches are removed, and that no parallel state or compatibility
path was introduced.

## Ordered Steps

1. `01-current-market-ownership-and-gap-audit.md`
2. `02-playable-competition-transfer-window-catalog.md`
3. `03-window-eligibility-and-out-of-window-policy.md`
4. `04-three-day-negotiation-clock-and-pending-exposure.md`
5. `05-club-to-club-permanent-transfer-negotiation.md`
6. `06-player-contract-table-and-atomic-transfer-completion.md`
7. `07-final-six-month-preliminary-agreements.md`
8. `08-ai-market-targeting-and-squad-protection.md`
9. `09-market-search-budget-and-target-read-models.md`
10. `10-market-workspace-and-player-inspection.md`
11. `11-offer-composer-and-two-stage-decision-flow.md`
12. `12-posta-continue-and-market-deadline-integration.md`
13. `13-persistence-squad-plan-and-cross-surface-integration.md`
14. `14-market-contract-finance-and-squad-long-run-gates.md`
15. `15-integrated-accessibility-cleanup-architecture-and-phase-report.md`

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
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

The structural gate runs `50 worlds x 10 seasons`, `250 worlds x 30 seasons`,
and at least `750 worlds x 20 seasons`, with a repeated deterministic sample.
The resumable `10,000 x 50` runner remains a release-scale tool and is not a
Phase 79 completion requirement.

## What NOT To Implement

- No user-configurable or generic transfer calendar.
- No content rows for competitions that are not playable.
- No loans, installments, add-ons, auctions, agents, promises, work permits,
  squad-registration quotas, or broad scouting system.
- No automatic selected-club offer, acceptance, contract, cancellation, or
  replacement without a visible rule and factual Posta outcome.
- No pending-offer budget reservation disguised as committed spending.
- No acceptance that mutates only some of ownership, contract, registration,
  finance, number, history, or squad state.
- No duplicate Market state in web/Zustand, rendered prose in engine facts,
  exact hidden potential, dormant API, compatibility branch, or placeholder UI.
- No broad Finances, Youth, Staff, stadium, ticket, sponsor, debt, or
  bankruptcy workflow.

## Definition Of Done

- The current competition has two source-backed, deterministic transfer
  windows and all market commands obey them.
- Every negotiation stage resolves or expires within three game days.
- Pending offers consume no actual budget; completions are atomically
  affordable and unaffordable outcomes are explicit.
- Permanent transfers and preliminary agreements preserve ownership,
  registration, active/future-contract, finance, history, and squad invariants.
- AI and selected-club flows use the same rules without hidden selected-club
  automation.
- Market, Posta, Continue, Squad, Tactics, preparation, Matchday, persistence,
  and annual payroll agree after transfer completion and future activation.
- The Market workspace is complete, accessible, responsive, localized,
  reduced-motion-safe, and contains no horizontal page scroll.
- The final integrated Step 15 closes both the deferred Phase 78 cleanup and
  Phase 79 with caller proof, dead-code removal, architecture evidence, visual
  QA, long-run evidence, and exactly one next recommendation.

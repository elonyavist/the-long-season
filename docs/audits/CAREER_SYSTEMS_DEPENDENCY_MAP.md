# Career Systems Dependency Map

Date: 2026-06-21

Scope: documentation-only dependency review before implementing market, youth, scouting, economy, persistence, or other career systems.

## Executive Summary

Phase 16 exists to prevent a false linear roadmap. The market roadmap is directionally correct, but several candidate phases depend on shared career Modules that should not be discovered late during implementation.

The next implementation phase can be a narrow permanent-transfer MVP only if it is treated as an in-memory market inspection/apply Module with explicit Interfaces for market state, transfer intent, valuation, budget, ownership, and player willingness. It must not introduce loans, wages, contracts, transfer windows, scouting fog, AI market behavior, or durable career persistence unless a later documented step adds those systems.

If the project goal is a playable long-running career before any market preview, career persistence should be inserted before market. If the goal is to validate the market rules first, permanent-transfer MVP can start now, followed immediately by career state and transfer persistence.

## Market Roadmap Dependency Review

| Candidate phase | Initial classification | Dependency notes |
|---|---|---|
| Market MVP Permanent Transfers | `can_start_now` with constraints | Can start as a deterministic, in-memory, manager-driven market Module. Needs narrow contracts for `MarketState`, `TransferIntent`, `TransferFeasibility`, player ownership, valuation, temporary club budget, and player willingness. Must avoid persistence, wages, loans, transfer windows, scouting fog, AI bids, player exchanges, and installments. |
| Career State And Transfer Persistence | `needs_prior_market_phase`, `needs_career_state` | Can follow the market MVP to persist squad ownership, budget changes, and transfer history. If the project wants durable gameplay before previewing market rules, this phase should be moved before market MVP. |
| Loans MVP | `needs_career_state`, `needs_calendar`, `needs_prior_market_phase` | Loans need owner club, temporary destination club, start/end dates or season scope, return processing, and player willingness. Persistent loans should not be implemented before career state and season-transition rules. |
| Contracts And Wages | `needs_economy`, `needs_career_state`, `needs_prior_market_phase` | Wages and contract expiry require a money/budget model, contract state, and future affordability checks. This should not be squeezed into the first transfer MVP. |
| Scouting And Information Quality | `needs_scouting_or_youth`, `needs_prior_market_phase` | Scouting needs a visible-player-data Interface and must separate true player data from what the manager can see. It can consume market valuation later but should not be faked with hardcoded labels or hidden ad hoc fields. |
| AI Club Market Behavior | `needs_career_state`, `needs_economy`, `needs_prior_market_phase` | Other clubs need budgets, squad ownership, player willingness, and transfer history before they can act credibly. AI must not bypass the same constraints used for the manager. |
| Negotiation v1 | `needs_prior_market_phase`, `needs_career_state` | Negotiation needs an existing transfer intent/feasibility flow and should probably wait until persistence exists. Wage counteroffers require the contracts/wages phase. |
| Transfer Windows And Registration | `needs_calendar`, `needs_career_state`, `needs_prior_market_phase` | Windows and registration depend on current date, season phase, competition rules, squad ownership, and persisted transfer effects. |
| Structured Transfer Deals | `needs_economy`, `needs_career_state`, `needs_prior_market_phase`, `defer_until_later` | One-player exchanges and simple installments are acceptable later, but installments require future-budget commitments and anti-exploit valuation. Multiple-player exchanges and complex clauses remain out of scope. |
| Market Balance And Economy Review | `needs_prior_market_phase`, `needs_economy` | This is a review gate after several market/economy systems exist. It cannot meaningfully run before real transfer behavior and budget effects exist. |

### Roadmap Interruption Points

- Insert or immediately follow with career state and transfer persistence once transfer actions must survive beyond one command.
- Insert economy and budget foundations before wages, installments, long-term commitments, or finance-driven rejections.
- Insert calendar and season-transition foundations before loans, windows, registration, contract expiry, or end-of-season processing.
- Insert player information/scouting foundations before hiding ability, potential, valuation, or willingness behind fog of war.
- Revisit youth only after ownership, loans, development inputs, and visible player information have coherent Interfaces.

### Step 01 Conclusion

The market roadmap should not be treated as a fully linear feature queue. The permanent-transfer MVP can begin next only as a constrained, deterministic, manager-initiated Module. Later market phases require shared career-state, economy, calendar, scouting, and youth seams before they can be implemented cleanly.

## Shared Career State Seams

### Current State

- `GameState` is already the authoritative run snapshot for meta, calendar, players, ordered player IDs, dynamic player states, clubs, ordered club IDs, fixtures, and ordered fixture IDs.
- `GameStorage` and `JsonGameStorage` can persist a full `GameState` snapshot behind a storage Interface.
- `Club.playerIds` is the current roster ownership source of truth. The order is explicit and must remain deterministic.
- `SquadDepth`, `SelectedLineup`, `Formation`, fixture IDs, club IDs, player IDs, and `playerStates` already give market/career systems enough stable IDs to reference current squads without object-order assumptions.
- There is no `CareerState` Module yet. Current CLI commands still generate and consume a one-command simulation context rather than a durable manager run.

### Candidate Shared Modules

| Module / Interface | Consumers | Notes |
|---|---|---|
| `CareerState` or documented career slice over `GameState` | persistence, market, loans, contracts, economy, scouting, youth, UI | Needed once actions must survive between commands. It should wrap or extend `GameState`, not duplicate run data in a separate unstructured object. |
| `RosterOwnership` | market, loans, registration, squad selection, youth promotion | Current `Club.playerIds` can support a first permanent-transfer MVP. Later loans need owner club vs temporary registered club, so ownership must become explicit before loans. |
| `TransferHistory` | persistence, negotiation, AI market, news, balance review | Not required for a pure preview. Required once a completed transfer has to be inspectable or replay-safe across save/load. |
| `SelectedClubContext` | CLI, UI, market, tactics, lineup, scouting | The manager must act as one selected club. This should remain explicit input, not inferred from standings or generated demo content. |
| `SeasonProgressionState` | calendar, windows, registration, loans, contracts, economy | Required before time-limited market actions or season-end processing. The current date exists, but no season-transition process exists. |
| `CareerSaveAdapter` | apps, storage, future UI | Existing `GameStorage` can persist snapshots, so the first persistence step may adapt it instead of inventing a second storage layer. Cross-run manager profile storage is separate future scope. |

### Blocking Decision

Permanent-transfer MVP can start without a full `CareerState` only if it remains in-memory and command-local. A real career market that changes squads, budgets, and history across commands needs a dedicated career-state/persistence phase immediately after the MVP, or before it if we want durable gameplay first.

### Step 02 Conclusion

The current `GameState` shape is strong enough to host future career slices. The key seam is not storage availability; it is deciding when market actions become durable run state. The first market MVP should depend on existing `Club.playerIds` for permanent ownership, but it must leave a clean path to explicit ownership/registration before loans and windows.

## Economy And Budget Dependencies

### Current State

- `Money` and `BasisPoints` already exist in `domain` as integer minor-unit value objects with safe-integer validation, non-negative constructors, arithmetic helpers, percentage application, and deterministic splitting.
- `Club` already carries `category` and `reputation`, which can support early sporting-level and reputation checks for player willingness and valuation.
- There is no `ClubBudget`, `ClubFinances`, `PlayerContract`, wage budget, transfer history ledger, installment commitment state, monthly finance tick, or financial-crisis state in implemented code.
- Requirements already reserve broader finance concepts: club budget, wages, contracts, installments, facilities, ticket revenue, sponsor income, crisis stages, and future financial commitments.

### Dependency Split

| Economy concept | Needed by | Can be in first market MVP? | Notes |
|---|---|---|---|
| `Money` value object | fees, budget, wages, installments | Yes, already available | Market code should use `Money`, `nonNegativeMoney`, `addMoney`, `subtractMoney`, and `compareMoney`, not plain numeric fees. |
| Transfer budget | permanent-transfer MVP, persistence, AI market | Yes, as narrow `ClubBudget` Interface | It can be a deterministic input keyed by club. It should not imply monthly finance, sponsorship, or full accounting. |
| Wage budget | contracts, wages, loans with wage share, player willingness | No | Must wait for player contracts and wage commitments. |
| Future commitments | installments, structured deals, financial reports | No | Installments require a future ledger and calendar/payment dates. |
| Full club finances | economy, facilities, staff, board, financial crisis | No | This is broader than market MVP and should be a dedicated future phase. |
| Valuation curves | market MVP, AI market, scouting | Yes, minimally | MVP can use ability, potential, age, role/position, club category, and reputation. It must keep true value separate from future perceived/scouted value. |
| Structured rejection reasons | CLI, UI, localization | Yes | Budget rejection should be typed, for example insufficient transfer budget. User-facing prose must stay in presentation/localization. |

### Budget Boundary For Market MVP

The first permanent-transfer MVP may define a small market-local `ClubBudget` Interface if it uses `Money` and stays explicit:

- transfer budget only;
- no wage budget;
- no monthly income/expense simulation;
- no future commitments;
- no board budget allocation;
- no persistence unless the active phase includes it.

This gives the market enough leverage to reject unaffordable transfers without pretending that the full economy exists.

### Step 03 Conclusion

The economy foundation does not block a narrow permanent-transfer MVP because `Money` already exists and a temporary transfer-budget Interface can be scoped tightly. Contracts, wages, installments, finance reports, and club economic simulation must remain blocked until dedicated economy/career phases define durable state and calendar-based processing.

## Calendar And Season Transition Dependencies

### Current State

- `GameDate` exists as an epoch-day value object.
- `GameState.calendar.currentDate` and `currentSeasonId` exist.
- Fixtures carry both `roundNumber` and `date`.
- `generateRoundRobinCalendar` creates deterministic dated fixture schedules from a `seasonStartDate`.
- `simulateSeason` currently simulates one generated season in a batch-style command and uses fixture dates for fitness recovery.
- There is no season-transition Module, no transfer-window config, no registration-period validation, no loan-end processor, no contract-expiry processor, no promotion/relegation flow, and no multi-season world advancement.

### Required Calendar Modules

| Module / Interface | Required before | Notes |
|---|---|---|
| `SeasonTransition` | promotion/relegation, new season generation, end-of-season loans/contracts | Needed when the game advances from one season snapshot to the next. |
| `TransferWindowConfig` and `TransferWindowState` | transfer-window validation, deadline day, calendar-based negotiations | Can be deferred from MVP if the first transfer command is explicitly inspection/demo scoped. |
| `RegistrationState` | squad registration, post-transfer eligibility, competition rules | Must exist before moves can affect who is eligible to play under window/registration rules. |
| `LoanLifecycle` | loans, loan return, loan development input | Needs owner club, destination club, start/end dates or season scope, and season transition. |
| `ContractExpiryProcessor` | contracts, free agents, renewals | Needs contract state and calendar progression. |
| `PromotionRelegationRules` | multi-division career, category changes, market willingness by league movement | Not needed for one-division MVP, but required before the Scalata can become multi-season truthful. |

### Transfer Window Decision

Permanent-transfer MVP can temporarily ignore windows if the phase clearly says it is a constrained market preview/apply demo. It should still model transfer intent and feasibility in a way that can later accept a `currentDate` and window validation result without changing the public concept of a transfer.

Loans, contracts, registration, and AI market behavior should not ignore calendar rules once they become persistent. Those systems would create misleading state if implemented before season transition and window boundaries exist.

### Step 04 Conclusion

Calendar primitives are present, but career calendar behavior is not. The first market MVP may avoid transfer windows only by being explicitly narrow. Persistent loans, windows, registration, contract expiry, promotion/relegation, and multi-season market balance require a dedicated calendar/season-transition foundation before implementation.

## Scouting Youth And Market Overlap

### Current State

- `Player` stores true `birthDate`, ordered `naturalPositions`, true `abilities`, and true `potential`.
- `PlayerDynamicState` stores fitness, form, and morale separately from stable player identity.
- Fake content generates current ability and potential values, but does not model scouting knowledge, visible ranges, youth contracts, development profiles, ambition, personality, career stage, or growth history.
- Requirements are clear that true ability/potential should not be the same thing as what the manager sees once scouting exists.

### Shared Information Seams

| Seam | Consumers | Dependency notes |
|---|---|---|
| `PlayerTruth` | engine, content, balance, debug tools | Already exists in practice through `Player.abilities`, `Player.potential`, `birthDate`, and positions. It must remain deterministic and not contain UI labels. |
| `VisiblePlayerProfile` | CLI/UI, scouting, market inspection, squad screens | Not implemented. Should derive visible attributes, visible potential range, known positions, and confidence from `PlayerTruth` plus `ScoutingKnowledge`. |
| `ScoutingKnowledge` | scouting, market value, youth/prospect discovery, AI decisions | Not implemented. Should be persistent by observing club and player, with confidence/range derived for presentation. |
| `PlayerValuation` | market MVP, AI market, structured deals, scouting | MVP can use true values internally, but should keep valuation behind an Interface so future perceived value can replace it. |
| `PlayerWillingness` | permanent transfers, loans, contracts, negotiation | MVP needs simple willingness now: sporting category/reputation, player quality, age, and role/fringe approximation. Ambition/personality/wages should be later inputs, not hidden constants. |
| `DevelopmentInput` | youth, loans, growth, training | Not available yet. Loan phases should not claim development benefits until minutes/growth processing exists. |
| `YouthOwnership` | youth intake, senior promotion, loans, contracts | Youth players should eventually be normal `Player` entities with ownership/contract facts. Market must not create a separate prospect model. |

### Market MVP Boundaries

The first permanent-transfer MVP must not hardcode long-term scouting/youth behavior:

- no fake fog-of-war;
- no visible potential range unless a scouting/visible-profile step owns it;
- no youth/prospect special-case ownership;
- no development benefit from loans;
- no ambition/personality fields unless a documented future step adds them;
- no UI/CLI prose embedded in domain or engine reasons.

It may use current true player data for deterministic valuation and willingness, provided the contract names that as current truth-based MVP behavior and leaves a replaceable Interface for perceived/scouted values later.

### Step 05 Conclusion

Scouting and youth do not block a narrow market MVP, but they constrain its shape. Market code should introduce valuation and willingness seams now, not presentation-specific player facts. Youth and scouting should later reuse the same player truth, ownership, valuation, and visible-profile boundaries instead of creating parallel player-information models.

## Recommended Phase Order

### Next Implementation Phase

Recommended next implementation phase: `Phase 17 — Market MVP Permanent Transfers`.

Reason: the current core already has enough stable foundations for a narrow market MVP:

- deterministic `GameState` with clubs, players, fixtures, ordered IDs, and player states;
- `Club.playerIds` as current permanent roster ownership;
- `Money` and `BasisPoints` value objects;
- club category and reputation;
- player birth date, positions, abilities, and potential;
- squad/formation inspection that can explain why the manager wants a new player without generating automatic market advice.

This recommendation is conditional. Phase 17 must be written as a small market Module, not as the whole career economy.

### Phase 17 Constraints

Phase 17 should use these constraints:

- **Persistence:** in-memory only. It may preview/apply a transfer inside one CLI command, but it must not create durable career saves unless the phase explicitly adds persistence.
- **Budget:** temporary transfer budget is allowed, using domain `Money`. Wage budget, monthly finance, sponsor income, board allocation, debt, and future commitments are out of scope.
- **Transfer windows:** no transfer-window validation yet. The phase must keep a place for later `currentDate`/window validation without implementing it.
- **Player willingness:** required, but simple and truth-based for MVP:
  - buying club category and reputation;
  - selling/current club category and reputation;
  - player quality versus destination level;
  - age/career-stage approximation from `birthDate`;
  - likely role/fringe approximation where available.
- **Scouting:** no fog of war. Valuation may use true player data internally, but the Interface must be replaceable by perceived/scouted valuation later.
- **Transfers:** permanent transfers only. No loans, contracts, wages, AI bids, negotiation state, player exchanges, installments, sell-on clauses, registration rules, or deadline day.
- **Presentation:** rejection reasons must be structured keys/data, with localized rendering in CLI/UI layers. Do not embed prose in domain or engine contracts.

### Follow-up Phase Order

After Phase 17, the recommended order is:

1. `Phase 18 — Career State And Transfer Persistence`
   Persist changed squads, changed transfer budget, selected-club context, and transfer history using the existing `GameStorage` boundary or a documented career slice over `GameState`.

2. `Phase 19 — Calendar And Season Transition Foundation`
   Add season transition, transfer-window state, registration boundaries, and end-of-season processing foundations before persistent loans/contracts.

3. `Phase 20 — Loans MVP`
   Add manual loans only after ownership and season-transition rules can return players correctly.

4. `Phase 21 — Contracts And Wages`
   Add player contracts, wages, wage budget, and wage-based willingness once persistence and budget state exist.

5. `Phase 22 — Scouting And Visible Player Information`
   Add `ScoutingKnowledge`, visible player profiles, perceived value, and confidence/range selectors. This can move earlier if market UX starts exposing too much true data, but it should not block the first internal MVP.

6. Later phases:
   AI club market behavior, negotiation, transfer windows/registration expansion, structured deals, and market balance should follow only after their required shared Modules exist.

### Explicit Blockers

- A persistent transfer cannot be implemented safely before career-state/persistence scope is documented.
- Loans cannot be implemented safely before ownership distinction and season-transition processing exist.
- Wages, installments, and future commitments cannot be implemented safely before economy state exists.
- Scouting fog cannot be implemented safely before a visible-player-profile Interface exists.
- Youth/prospects should not be implemented as a separate player model; they must reuse player truth, ownership, visibility, growth, and loan/development seams.

### Phase 16 Final Decision

Phase 16 is complete. The next phase should be `Phase 17 — Market MVP Permanent Transfers`, constrained as above. Do not start Phase 18+ until Phase 17 proves the transfer contracts and manager-facing inspection are coherent.

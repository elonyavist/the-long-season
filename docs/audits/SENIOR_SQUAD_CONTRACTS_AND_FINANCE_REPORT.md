# Senior Squad, Contracts And Club Finance Ownership Audit

Date: 2026-07-21  
Phase: `78-senior-squad-player-contracts-and-club-finance-foundation`  
Step: `01-current-ownership-and-gap-audit`

## Purpose

This report records the current owners and the exact Phase 78 replacement
targets before contracts, club finance, or the senior-squad UI change runtime
behavior. It separates current truth from missing behavior and from the locked
Phase 78 decisions.

## Executive Conclusion

The repository already has strong deterministic seams for players, clubs,
money, transfers, career progression, availability, Posta, Continue, match
preparation, and JSON/SQLite persistence. It does **not** yet have a canonical
owner for shirt numbers, contracts, wages, club cash, finance ledgers, a Squad
route, a Tactics route, or a full player profile.

Phase 78 must extend the existing `CareerState` and its storage mappings rather
than create web-only state. The existing match-preparation plan remains the one
durable current plan, but its availability handling must change: an injured or
suspended selected player stays visibly selected and blocks kickoff until the
manager acts. Current beta saves must be rejected through a clean version
boundary; no compatibility mapper is justified while the product is in beta.

## Current Ownership Trace

### 1. Player generation and club membership

1. `packages/content/src/generators/fake-clubs.ts` creates the ordered club set
   and deterministic senior-player IDs. A club stores only its ordered
   `playerIds` roster.
2. `packages/content/src/generators/fake-players.ts` creates each senior
   `Player` from those IDs. The generated player owns identity, birth date,
   natural positions, canonical role identity, current abilities, and
   reachable potential.
3. `packages/domain/src/entities/player.entity.ts` defines `Player`; it has no
   shirt number, contract ID, wage, or value field.
4. `packages/domain/src/entities/club.entity.ts` defines `Club`; it has club
   identity, category, reputation, and ordered `playerIds`, but no cash or wage
   state.
5. `packages/domain/src/state/career-state.ts` embeds the generated `GameState`
   in `CareerState`, adds market, history, youth, preparation, Inbox,
   participation, and availability state, and validates cross-references.

Current truth: senior ownership is represented by `Club.playerIds`; there is no
separate senior-roster entity and no contract-backed ownership invariant.

Phase 78 decision: keep `Club.playerIds` as the ordered active senior roster,
add domain-owned shirt-number and contract records, and validate that every
owned senior player has exactly one active contract with that club.

### 2. Preparation, Matchday, and plan carryover

1. `packages/domain/src/state/career-state.ts` owns
   `CareerMatchPreparation`: XI, tactic, base formation, normalized board
   slots, bench slots, target fixture, and update time.
2. `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
   converts that durable record to the editable draft and back.
3. `apps/web/src/features/tactics-board/` owns the shared tactical-board
   presentation and interactions; it must remain the only board implementation.
4. `packages/engine/src/career/progress-fixture.ts` validates the supplied
   selected lineup, runs staged match progression, and publishes the completed
   fixture atomically at full time.
5. `apps/web/src/runtime/web-career-runtime.ts` carries the completed
   preparation forward without its old `targetFixtureId` after the full-time
   review is acknowledged.

Current conflict: `createMatchPreparationDraft` filters unavailable players out
of the carried XI and bench, while `CareerState` validation also rejects an
unavailable player in an unplayed fixture preparation. The existing regression
expectations are explicit in
`apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
(`removes a suspended player from a carried plan`) and
`apps/web/src/runtime/web-career-runtime.test.ts` (`carries the previous team
plan ...` without unavailable players).

Phase 78 decision: durable plan validation permits a selected unavailable
player; UI/read models expose that state; kickoff eligibility remains strict and
blocks until the manager explicitly removes or replaces the player. No hidden
replacement is allowed.

### 3. Transfers and valuation

1. `packages/engine/src/market/player-valuation.ts` is the canonical pure
   valuation formula. It derives value from role-aware current ability,
   reachable potential, age, position, and configured market context. Value is
   derived, not stored on `Player`.
2. `packages/domain/src/entities/transfer.entity.ts` owns `MarketState` and
   `ClubTransferBudget`; the only current club financial fact is a transfer
   budget.
3. `packages/engine/src/market/transfer-feasibility.ts` owns buyer/seller
   transfer-budget movement for accepted permanent transfers.
4. `packages/engine/src/career/apply-career-transfer.ts` applies an accepted
   transfer preview and appends an immutable transfer-history row.
5. `packages/engine/src/career/transfer-turnover.ts` is the deterministic
   career turnover path. Its current contract explicitly excludes fees,
   contracts, and wages and only moves roster membership.
6. `packages/domain/src/state/career-state.ts` stores permanent-transfer
   history with buyer, seller, player, fee, and date only.

Current truth: transfer budgets and valuation exist, but they are not a complete
club-finance model. A transfer does not terminate or create a player contract,
write a cash ledger entry, or preserve contract history.

Phase 78 decision: keep valuation in the engine and Money in integer minor
units; extend accepted-transfer and turnover paths to move cash, terminate the
old contract, create the new contract, and append idempotent history/ledger
facts. Do not duplicate valuation or affordability logic in web code.

### 4. Youth conversion and player exits

1. `packages/engine/src/career/youth-lifecycle.ts` keeps players aged 15-19 in
   the academy and produces age-out promotion/release candidates.
2. `packages/engine/src/career/youth-promotion.ts` promotes a candidate by
   appending the player ID to `Club.playerIds`; no senior contract is created.
3. `packages/engine/src/career/player-exits.ts` removes player ownership while
   retaining immutable player records where required; it has no contract close
   operation.
4. `packages/engine/src/career/advance-career-season.ts` owns the canonical
   ordered seasonal lifecycle, including exits, youth, squad maintenance,
   turnover, and rollover.

Current truth: youth promotion and exits mutate senior membership without a
contract invariant.

Phase 78 decision: every path that enters or leaves a senior roster must use
the same contract transition rules. Youth promotion creates the initial senior
contract; expiry/release/exit closes ownership without inventing a transfer.

### 5. Monthly and full-time career boundaries

1. `packages/engine/src/career/advance-career-month.ts` owns monthly player
   development and uses durable closed-month keys for idempotency.
2. `packages/engine/src/career/progress-fixture.ts` owns the full-time commit
   order: lifecycle checkpoint, result, condition, form/morale, availability,
   participation, and structured Inbox consequences.
3. `packages/engine/src/career/continue-career.ts` advances date by date until
   the next attention boundary.
4. `packages/engine/src/career/career-inbox-lifecycle.ts` reconciles and
   mutates Inbox lifecycle facts.
5. `packages/domain/src/career/inbox.ts` owns message identity, level,
   lifecycle, destination, and Continue-blocking semantics.
6. `packages/domain/src/career/attention.ts` owns current matchday preparation
   blockers.

Current truth: monthly and full-time boundaries are deterministic and already
have durable idempotency/state seams, but there is no payroll or contract
negotiation checkpoint.

Phase 78 decision: annual payroll extends the canonical season boundary while
due bonuses extend the full-time checkpoint, both with explicit idempotency
keys; renewal responses and deadlines extend structured Posta/Continue
attention. The web runtime remains an adapter and does not settle money or
decide negotiations.

## Fake Or Derived Shirt Numbers

There is no shirt number in `Player`, `Club`, or `CareerState`.

- `apps/web/src/features/match-preparation/match-preparation-adapter.ts` maps
  the roster index to `number: index + 1`.
- `apps/web/src/features/tactics-board/tactical-board-squad.ts` performs the
  same index-based derivation for tactical-board players.
- Match and CLI surfaces therefore inherit presentation numbers that can change
  when roster order changes and are not persisted.

Phase 78 Step 02 replaces these derivations with one deterministic,
club-specific, persisted shirt-number assignment. All consumers read the same
fact; no UI fallback may recreate `index + 1`.

## Money And Finance Baseline

`packages/domain/src/value-objects/money.ts` already provides the required
integer-minor-unit `Money` value object and pure non-negative arithmetic.

The current club-money baseline is only:

- `ClubTransferBudget.transferBudget` in
  `packages/domain/src/entities/transfer.entity.ts`;
- `CareerState.marketState` in
  `packages/domain/src/state/career-state.ts`;
- one hard-coded EUR 6,000,000 selected-club budget in
  `apps/web/src/runtime/web-career-runtime.ts` and CLI scenario fixtures.

There is no current owner for club cash, annual wage budget, committed annual
wages, annual payroll, bonuses, or ledger entries. Phase 78 must add those to
domain/career state and generate them for **every** club; the selected club must
not be a special financial case.

## Persistence And Version Baseline

### JSON/envelope

- `CareerState` currently uses `CAREER_STATE_SCHEMA_VERSION = 1` in
  `packages/domain/src/state/career-state.ts`.
- Generic save metadata is version 1 and the current career envelope is v3 in
  `packages/storage/src/save-metadata.ts`.
- `packages/storage/src/career-save-envelope.ts` already rejects unsupported
  beta envelope versions rather than migrating them.

### SQLite/OPFS

- `packages/storage/src/sqlite/sqlite-career-schema.ts` currently exposes
  SQLite schema version 9.
- The schema stores players and club-player order, transfer budgets, transfer
  history, match preparation/board/bench, autosave policy, Inbox,
  participation, and availability.
- It stores no shirt-number, contract, contract-history, negotiation, club
  finance, or ledger table.
- `packages/storage/src/sqlite/sqlite-career-migrations.ts` rejects an existing
  older non-zero beta schema and builds only a clean current database.
- `packages/storage/src/sqlite/world-state-mapper.ts` and
  `packages/storage/src/sqlite/career-state-mapper.ts` are the authoritative
  row mapping boundaries.

Phase 78 reset boundary:

1. bump career-state, envelope, and SQLite schema versions together;
2. reject every earlier beta browser, JSON, and SQLite save;
3. surface a typed reset-required result in the web entry/load lifecycle;
4. allow the user to delete/reset and create a coherent new world;
5. add no old-save mapper, default-filled contract, lazy finance repair, or
   compatibility branch.

## Missing Owners Confirmed

The audit found no existing canonical owner for:

- persistent shirt numbers;
- active player contracts or contract history;
- annual wages or supported bonuses;
- contract demands, offers, responses, counters, or deadlines;
- club cash, annual wage budget, committed wage total, or finance ledger;
- annual payroll or fixture-bonus settlement;
- free-agent contract status;
- a real Squad route;
- a real Tactics route;
- a full-screen player profile;
- selected-club renewal decisions in Posta/Continue.

These are Phase 78 gaps, not reasons to introduce placeholders before their
documented steps.

## Exact Replacement And Extension Map

| Step | Canonical owner or replacement target |
| --- | --- |
| 02 | Extend `packages/domain/src/entities/player.entity.ts`, add contract domain entities/state validation, extend `packages/content/src/generators/`, and replace index-derived shirt numbers in both web adapters. |
| 03 | Add domain club-finance state over `Money`; replace selected-club-only budget construction in `apps/web/src/runtime/web-career-runtime.ts` and CLI scenarios with every-club deterministic generation. |
| 04 | Bump `CareerState`, career envelope, and SQLite schemas; extend JSON/SQLite mappers; add typed beta-reset UI handling; delete compatibility defaults. |
| 05 | Extend the season boundary and full-time fixture commit with idempotent annual-payroll/bonus ledger facts; keep web runtime settlement-free. |
| 06 | Add pure deterministic contract demand/offer/response/counter/deadline engine Modules; no prose or browser timers in engine. |
| 07 | Extend `packages/domain/src/career/inbox.ts`, `attention.ts`, engine Inbox lifecycle, Continue, UI read models, and web commands with selected-club contract decisions. |
| 08 | Integrate deterministic AI renewal, expiry, release, and free-agent transitions into the canonical career lifecycle/season order. |
| 09 | Extend accepted transfer, transfer turnover, youth promotion, exits, valuation context, contract history, and finance history through one ownership transition seam. |
| 10 | Change `CareerState` preparation validation and `match-preparation-adapter.ts` reconciliation so unavailable selections remain visible; keep kickoff validation strict. Replace the two current removal regression expectations. |
| 11 | Add framework-free `@game/ui` Squad, profile, contract, plan, and finance read models that consume canonical facts and canonical suitability/valuation. |
| 12 | Add real Squad navigation/route and a no-horizontal-scroll senior table; no nested Tactics pseudo-route. |
| 13 | Connect explicit table Field/Remove/Replace commands to the one durable current plan and the existing shared tactical board. |
| 14 | Add the full-screen accessible player profile and selected-club renewal workspace over Step 06/07 commands. |
| 15 | Add structural long-run gates for contracts, finances, plan continuity, expiry, turnover, and reset behavior. |
| 16 | Finish accessibility, responsive/visual QA, dependency/dead-code review, architecture/reporting, and phase-level gates. |

## Tests That Must Change Or Extend

- `packages/domain/src/state/career-state.test.ts`: new ownership, contract,
  finance, uniqueness, history, and durable unavailable-plan invariants.
- `packages/content/src/generators/*.test.ts`: deterministic shirt, contract,
  and every-club finance generation.
- `packages/storage/src/**/*test.ts`: version rejection, clean schema, and
  lossless JSON/SQLite mapping.
- `packages/engine/src/career/**/*test.ts`: payroll/bonus idempotency,
  negotiation timing, AI lifecycle, expiry/free agency, transfer/youth/exit
  contract transitions, and kickoff eligibility.
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`:
  replace silent unavailable-player removal with visible retained selection and
  explicit kickoff blockers.
- `apps/web/src/runtime/web-career-runtime.test.ts`: carry the exact plan across
  fixtures, preserve unavailable selections, and prove reset-required storage
  handling.
- future Squad/Profile web tests and canonical Playwright journeys: table,
  explicit replacement, Tactics synchronization, profile, renewal, refresh,
  narrow/keyboard/touch/200% text/reduced-motion.

## Scope Guardrails Reconfirmed

Phase 78 must not introduce a Market target browser, broad Finances screen,
loans, installments, agents, unsupported clauses, Youth/Staff UI, scouting fog,
runtime LLM, UI-owned calculations, a second tactical board, a second current
plan, automatic selected-club decisions, or old-save compatibility code.

## Step 02 Entry Decision

The ownership audit is complete. Step 02 is the only valid next implementation
step: establish deterministic persistent shirt numbers and the complete active
player-contract foundation before club finance generation or any Squad UI.

## Step 03 Completion - Canonical Club Finance

Step 03 establishes one canonical `ClubFinanceState` for every generated club.
Each account now owns its EUR cash balance, available transfer budget, annual
wage budget, committed annual wage, season totals, and an ordered typed ledger.
The validator proves complete club coverage, currency consistency, non-negative
balances and budgets, ledger/account reconciliation, and exact agreement between
committed wage and the active contracts created in Step 02.

World generation derives opening capital and budgets deterministically from the
club's division, reputation, roster quality, and existing wage commitments. The
competition owns one season distribution instead of relying on an unrelated
presentation constant. Two fixed-seed manual samples covered weak, average, and
strong clubs: sampled transfer budgets were approximately EUR 1.7m-2.0m, while
annual wage headroom remained approximately 11%-16%; no generated club began
with unfunded contracts.

The permanent-transfer preview and application paths, CLI career scenarios and
reports, simulation tooling, and web new-world creation now consume this one
finance owner. The old `MarketState` and selected-club-only transfer-funds cache
were removed. Transfer feasibility rejects both insufficient budget and the
distinct case where budget exists but cash does not, and accepted previews post
balanced buyer/seller ledger entries.

Persistence is intentionally the only remaining old-model boundary. Its stale
`MarketState` imports are not a compatibility requirement: Step 04 owns the
coordinated beta schema reset, lossless mapping of contracts and finances, and
typed reset-required behavior. Adding defaults or a legacy mapper here would
violate the phase contract.

Verification under Node 24:

- domain, content, and engine suites pass;
- domain, content, and engine typechecks pass;
- dependency-cruiser passes with `589` modules and `2,128` dependencies;
- focused transfer-finance tests pass, including the insufficient-cash case;
- fixed-seed manual finance distribution inspection passes.

Step 04 is the only valid next implementation step.

## Step 04 Completion - Clean Beta Persistence Baseline

Step 04 establishes career save envelope version `4` and SQLite schema version
`10` as the only supported Phase 78 persistence baseline. Registrations,
contracts, active-contract ownership, ordered contract history, club finance
accounts, and ordered ledger entries now round-trip losslessly through JSON and
SQLite/OPFS. `CareerState` cannot cross the storage boundary without complete
senior-squad and finance state, so no partially upgraded career can load.

Every earlier JSON envelope and SQLite schema is intentionally incompatible.
The browser worker recreates only a database rejected with the typed
`unsupported_schema_version` code, reports that beta reset separately from
storage-access failures, and lets App Entry explain that a fresh career is
required. The normal 7/15-day autosave and manual-save cadence is unchanged.
No old-save mapper, synthesized agreement, lazy finance repair, or dual schema
path remains.

The browser-level SQLite/OPFS journey creates two real generated careers,
proves isolation, exact reload, transaction rollback, durable registrations,
contracts, contract history, finance accounts, and ledger entries, and confirms
that IndexedDB and localStorage remain unused. This gate also exposed and fixed
a real positional-bind defect in Inbox persistence: `message.date` had been
omitted, causing the category string to bind into the integer date column.
Focused mapper coverage now protects that binding order.

Negotiation persistence is deliberately not predeclared here. Step 06 creates
the real negotiation entities; their mapper will be added when those entities
have a current runtime consumer rather than as dead placeholder storage.

Verification under Node 24:

- storage tests pass (`7` files / `30` tests) and storage typecheck passes;
- web tests pass (`60` files / `262` tests) and web typecheck passes;
- the real Chromium SQLite/OPFS journey passes;
- dependency-cruiser passes with `590` modules and `2,135` dependencies;
- `git diff --check` and Graphify update pass.

Step 05 is the only valid next implementation step.

## Step 05 Completion - Canonical Contract And Finance Settlement

Step 05 gives each supported football movement one canonical financial
boundary. Active annual base wages settle once per club and completed season;
signing bonuses settle when an agreement becomes active; appearance, goal, and
clean-sheet bonuses derive only from committed full-time facts; permanent
transfer proceeds use the same ledger; and the competition season distribution
posts once during season rollover. Stable transaction IDs make retry and reload
idempotent, and every amount remains an integer number of minor currency units.

Permanent senior transfers now stage the complete ownership transition before
commit: seller registration and active agreement close, the buyer receives a
new registration and agreement, contract history advances, signing bonus and
transfer fee post, and transfer/wage headroom is revalidated. Any affordability
failure returns a typed rejection and preserves the exact prior career state.
The remaining transfer budget is always bounded by available cash, while
committed annual wages and remaining wage headroom are derived from active
agreements instead of maintained by a presentation cache.

Long-run profiling exposed two important lifecycle constraints. Finance-state
validation now pre-aggregates agreement commitments and ledger totals in one
pass, and annual payroll records one auditable club/season entry rather than
one entry per player. More importantly, canonical contract-backed squads no
longer pass through legacy ownership-only exits, youth promotion, maintenance,
or transfer turnover during rollover. Those old paths cannot update agreements
or finance atomically; Steps 08-09 replace them with the documented
contract-aware lifecycle instead of composing two competing owners.

The current demo has no ticketing or sponsorship income. The competition-owned
season distribution is therefore derived against committed wage obligations so
generated clubs can fund the supported lifecycle without inventing unrelated
income streams before the broader Finances phase.

Verification under Node 24:

- domain and engine suites pass;
- the complete monorepo gate passes (`195` files / `1,150` tests);
- all workspace typechecks pass;
- dependency-cruiser passes with `593` modules and `2,152` dependencies;
- focused idempotency, affordability, transfer atomicity, and long-run report
  coverage passes.

Step 06 is the only valid next implementation step.

## Step 06 Completion - Deterministic Contract Negotiation

Step 06 introduces one pure renewal-negotiation lifecycle shared by the
selected club and every AI club. A player's demand derives from canonical
football facts: age, current ability, reachable potential, current squad role,
club and competition reputation, existing wage, remaining agreement term, and
free-agent status. Base wage, duration, role, signing bonus, appearance bonus,
goal bonus, and clean-sheet bonus are evaluated as one offer rather than as
independent shortcuts.

Submitted offers wait a seeded two-to-six-day response period. The player can
accept, reject, or return one explicit counteroffer; counters expire after
fourteen days. Affordability is checked both when the club submits an offer and
when an accepted agreement becomes binding, because cash and wage headroom can
change while a negotiation is pending. A late affordability failure preserves
the previous career state and emits a distinct structured fact with the exact
typed reason.

An accepted renewal atomically closes the previous active agreement, creates
the replacement, appends ordered contract history, recalculates committed
wages, and settles the signing bonus through the canonical finance ledger. The
engine emits only structured negotiation facts. It does not own browser timers,
localized prose, agents, promises, or unsupported clauses.

Verification under Node 24:

- domain tests pass (`27` files / `147` tests);
- engine tests pass (`56` files / `373` tests);
- the complete monorepo gate passes (`198` files / `1,159` tests);
- all workspace typechecks pass;
- dependency-cruiser passes with `599` modules and `2,189` dependencies;
- `git diff --check` and Graphify update pass.

Step 07 is the only valid next implementation step.

## Step 07 Completion - Selected-Club Posta And Continue

Step 07 connects the selected club to the same canonical negotiation truth
introduced in Step 06. Contract reminders, due responses, counteroffers,
acceptances, rejections, withdrawals, and final release decisions now have
stable structured attention and Inbox identities. Reminders inside eight
months are important but do not stop Continue; an actionable counteroffer or
final expiry choice does stop it. No selected-club decision is inferred or
resolved silently.

The browser exposes one typed command boundary for renewal offer, revision,
submission, counter acceptance/rejection, withdrawal, and release at expiry.
Those commands delegate to engine use cases, reconcile Posta from the resulting
lifecycle state, and change only the working career session. They do not add a
per-click save or duplicate negotiation policy in React. UI and i18n consume
structured facts and own concise localized presentation.

Implementation exposed the next persistence obligation. Negotiations and
explicit Inbox Continue policy are now runtime-active, but the Step 04 schema
predates them. Step 08 therefore owns one clean beta schema advance and
lossless JSON/SQLite/OPFS mapping for both. The previous schema will be rejected
rather than repaired with inferred policy or synthesized negotiation state.

Verification under Node 24:

- domain, engine, UI, and web test suites pass;
- web passes `60` files and `264` tests, and web typecheck passes;
- dependency-cruiser passes with `600` modules and `2,199` dependencies;
- `git diff --check` and Graphify update pass.

Step 08 is the only valid next implementation step.

## Step 08 Completion - AI Renewal, Expiry And Free Agency

Step 08 gives every non-selected club one deterministic contract lifecycle.
The policy evaluates real age, current level, reachable potential, squad role,
department depth, agreed status, demand, cash, and annual wage headroom. AI
clubs enter the same delayed negotiation path as the selected club, resolve
accepted terms through the canonical agreement activation boundary, and
receive no hidden affordability exception. The selected club is excluded from
every automatic renewal and release decision.

Expiry now closes the active agreement and registration exactly once. A player
without club ownership and without an active agreement is derived as a free
agent; free-agent status is not stored as a competing flag. Release policy
retains at least eighteen senior players and protects goalkeeper, defensive,
midfield, and attacking depth. The ten-season structural smoke kept club
rosters between `18` and `22` players, with an average close to `21`, and
reported no department-collapse warning.

Runtime-active negotiations and explicit Inbox Continue policy now round-trip
losslessly through career envelope version `5` and SQLite schema version `11`.
Every previous beta baseline is rejected rather than repaired with inferred
policy or synthesized negotiations. Browser reload preserves negotiation ID,
terms, response/deadline dates, and blocking policy.

The lifecycle implementation also removes a material long-run cost. Immutable
validated contract, negotiation, and finance states retain their canonical
identity, while each command validates only its changed record and affected
club invariants. The isolated ten-season report fell from approximately
`10.01s` to `6.83s`; the complete concurrent suite no longer exceeds its
timeout. This is an ownership optimization, not a relaxed validation or test
timeout.

Wages remain annual facts throughout the model. Contracts store annual base
wage, club budgets track committed annual wages, and one idempotent payroll
entry charges the whole club once at the canonical season boundary. No monthly
wage installment or monthly salary cache was introduced.

Verification under Node 24:

- focused domain/engine lifecycle tests pass, including selected-club
  exclusion, structural retention, expiry, release, free agency, and
  incremental canonical-state commands;
- web persistence tests pass (`60` files / `264` tests), and storage plus engine
  typechecks pass;
- the complete monorepo gate passes (`199` files / `1,178` tests);
- dependency-cruiser passes with `602` modules and `2,209` dependencies;
- `git diff --check` and Graphify update pass.

Step 09 is the only valid next implementation step.

## Step 09 Completion - Contract-Aware Ownership Transitions

Step 09 replaces every current ownership-only transition with contract-aware
career operations. A permanent transfer now closes the seller registration and
agreement, reconciles any negotiation that referenced the closed agreement,
posts the fee to both clubs, protects buyer cash and transfer plus annual-wage
headroom, creates the buyer agreement and deterministic available shirt number,
and appends factual contract history as one atomic result. A failed term or
affordability check leaves the complete prior career state untouched.

Transfer value and willingness now use age, canonical current ability,
reachable potential, division, club reputation, form, and remaining contract
security. Buyer terms no longer treat an employed player as a free agent: they
derive from the existing agreement and cannot silently reduce annual wage,
squad status, or credible remaining security. Renewal duration also no longer
stacks a fresh full term after the previous expiry; it preserves the current
expiry when later while otherwise applying the offered term from acceptance.

Youth promotion creates a real senior registration and professional agreement.
Youth release, senior release, expiry, player exits, and deterministic AI
turnover close or create registrations and agreements through the same
canonical boundaries. Contract history now records signing, renewal, transfer
termination, expiry, and release facts. Standalone market ownership/budget
mutation helpers have been removed, and operational negotiations cannot retain
references to an agreement closed by another lifecycle path.

Wages remain annual throughout these paths. The ten-season command takes about
sixteen seconds in isolation because it simulates ten complete seasons; this is
a technical bulk-report runtime, not a delay in an individual player command or
normal browser interaction. Removing a duplicate whole-career validation from
the transfer transaction kept the report bounded without weakening invariants.

Verification under Node 24:

- domain and engine suites pass;
- the complete monorepo gate passes (`199` files / `1,181` tests);
- dependency-cruiser passes with `602` modules and `2,220` dependencies;
- the complete ten-season report passes with the new canonical transfers;
- `git diff --check` and Graphify update pass.

Step 10 is the only valid next implementation step.

## Step 10 Completion - Durable Plan And Fixture Eligibility

Step 10 separates the manager's persistent football decision from temporary
eligibility for one fixture. XI, bench, formation, normalized board positions,
roles, and tactic now remain exact after full time, Continue, navigation, and
reload. Injury or suspension no longer causes hidden removal, replacement,
reset, or loss of the saved-plan marker.

One domain-owned availability query returns ordered structured blockers with
the exact player and reason. Preparation confirmation and direct Matchday entry
consume that query through engine APIs and reject an ineligible selection
without mutating career state. The web surface only presents those facts.
Explicit manager-triggered `Auto` and `Fill gaps` commands do not choose an
unavailable candidate, but they remain explicit editing actions rather than a
background reconciliation path.

The separation also gives automatic recovery without another mutation. When an
injury ends or a suspension is served, the eligibility query returns no blocker
and the unchanged plan becomes usable again. Ownership loss and explicit
manager edits remain the only current reasons for removing a selected player.

Verification under Node 24:

- domain, engine, and web suites pass; web passes `60` files / `265` tests;
- focused plan/eligibility/preparation/kickoff/runtime coverage passes `92`
  tests;
- full `pnpm check` passes `199` files / `1,185` tests;
- dependency-cruiser passes with `602` modules / `2,221` dependencies;
- web typecheck, `git diff --check`, and Graphify update pass.

Step 11 is the only valid next implementation step.

## Step 11 Completion - Public Squad, Profile And Contract Models

Step 11 establishes one framework-free presentation contract before any React
screen is added. The engine now derives club-relative `leading`, `first_team`,
`squad`, or `depth` assessments from canonical role ability and the selected
club's real senior standard. Public models receive only those categorical
labels; raw aggregate ability and exact hidden potential never cross the
browser boundary.

The Senior Squad model owns the locked columns, deterministic default order,
reusable filters, composite selection and availability facts, contract-expiry
alert, and explicit field, remove, or replacement-choice descriptors. An
injured or suspended selected player remains selected, and a full XI requires
the manager to choose the replaced slot rather than allowing a hidden swap.

The full player-profile model exposes identity, shirt number, canonical role
order and suitability, condition, form, morale, value, public level labels,
contract context, and all twenty-five exact current attributes in their
technical, mental, physical, and goalkeeping families. It accepts no potential
attribute collection and serializes no raw current or potential aggregate.

Contract presentation remains annual throughout. The read model exposes annual
base wage, annual wage budget, committed annual wages, remaining annual wage
headroom, bonuses, expiry, squad status, history, and explicit negotiation
actions. No monthly wage field, cache, label, or installment exists. The
sixteen-to-twenty-second timing previously recorded for a ten-season command is
a bulk technical simulation runtime; normal Career commands do not perform that
work and must provide immediate visible feedback to the player.

Verification under Node 24:

- focused engine, UI, and i18n coverage passes `5` files / `29` tests;
- engine, UI, and i18n typechecks pass;
- dependency-cruiser passes with `610` modules / `2,250` dependencies;
- localized annual-wage, Squad, role, action, and attribute labels pass in all
  five supported languages;
- `git diff --check` and Graphify update pass.

The UI package deliberately retains no package-local test script; focused
Vitest execution verifies these modules directly without adding an unused
command surface.

Step 12 is the only valid next implementation step.

## Step 12 Completion - Senior Squad Table And Navigation Workspace

Step 12 turns the Senior Squad projection into a real browser destination.
The sidebar now opens one responsive roster workspace backed by the selected
club's current career state. The screen consumes the Step 11 framework-free
model for its locked columns, role/department/status filters, deterministic
sorting, composite selection and availability, currency value, public current
and potential labels, and under-eight-month contract warning. React owns no
ability, suitability, value, or contract calculation.

The desktop table has a fixed vertical viewport and sticky headers without
horizontal scrolling. Narrow and 200% text layouts use the same facts in a
readable row-card presentation rather than clipping columns. Row activation is
available through pointer and keyboard, restores focus on close, and opens one
native full-screen profile shell using the real selected player. That shell is
deliberately limited to the data already owned by Step 11; contract commands
and the complete profile workspace remain Step 14 scope.

Squad actions remain descriptive in this step. No plan mutation, automatic
replacement, second board, second match-plan store, contract submission, or
hidden potential number was introduced. Step 13 owns the explicit command
integration and separate Tactics route.

Verification under Node 24:

- web tests pass (`61` files / `269` tests);
- web typecheck and production build pass;
- dependency-cruiser passes with `616` modules / `2,279` dependencies;
- the complete current-product and SQLite/OPFS Playwright gate passes `20/20`,
  including desktop, narrow, 200% text, reduced motion, keyboard navigation,
  profile focus restoration, and real storage;
- `git diff --check` passes.

Step 13 is the only valid next implementation step.

## Step 13 Completion - Explicit Selection And One Shared Plan

Step 13 makes the current match plan the single editable football decision
across Squad, Tactics, preparation, and Matchday. The Squad table can now field
a player, remove an XI or bench selection, or open an explicit slot chooser.
Occupied alternatives remain visible and are ordered by empty-slot priority,
canonical role suitability, weaker current occupant, condition, and stable
identity. Choosing a slot is atomic: the incoming player is removed from any
other XI or bench location and no hidden best-XI mutation runs.

The separate Tactics route reuses the exact preparation workspace and approved
tactical board. Loaded-career route changes preserve the same in-memory draft,
so a manager can move between Squad, Tactics, preparation, and Dashboard
without losing or duplicating the plan. Deliberate save/autosave remains the
only persistence boundary. A discard/save confirmation is reserved for a real
career exit or Matchday boundary rather than being shown for ordinary internal
navigation.

The explicit replacement dialog is keyboard-accessible, restores focus, uses
the shared Motion language, and exposes role suitability plus the current slot
occupant. Browser evidence fills all nineteen selections, replaces a chosen XI
slot from Squad, then proves that the same surname and all eleven starters are
present on Tactics. Desktop, narrow, reduced-motion, preparation, Dashboard,
and SQLite/OPFS journeys retain their previous behavior.

Verification under Node 24:

- engine tests pass;
- web tests pass (`61` files / `271` tests), and web typecheck/build pass;
- the complete current-product and SQLite/OPFS Playwright gate passes `20/20`;
- focused Squad, preparation, narrow-preparation, and Dashboard visual journeys
  pass;
- dependency, monorepo, diff, and Graphify gates pass.

Step 14 is the only valid next implementation step.

## Step 14 Completion - Full Player Profile And Renewal Workspace

Step 14 completes the selected-club player context without creating a second
contract owner. The full-screen profile presents identity, persistent shirt
number, role and suitability, availability, condition, morale, value, public
current and potential assessments, all exact current attributes grouped by
football family, annual contract terms, supported bonuses, remaining duration,
and factual agreement history. Exact hidden potential and raw aggregate ability
never enter browser props or rendered output.

The same workspace now drafts, submits, revises, withdraws, accepts, rejects,
or releases through the existing engine negotiation lifecycle and dirty working
session. Finance impact is an engine-derived preview over integer minor-unit
money. React retains only form input and recoverable feedback; a failed command
keeps the profile and draft open, while successful commands rebuild the profile
from committed career truth.

The package boundary was tightened during verification. Presentation-safe money
constructors live in UI, browser commands carry plain string identity, and the
runtime resolves those strings against canonical career-owned IDs before
calling engine commands. `apps/web` therefore has no direct `@game/domain`
import and contains no copied money, contract, or identity validation.

Verification under Node 24:

- UI tests pass `75/75` and web tests pass `278/278` across `63` files;
- web typecheck and production build pass;
- the complete current-product and SQLite/OPFS browser gate passes `21/21`,
  including profile, narrow, keyboard, command-failure, and durable renewal
  coverage;
- dependency-cruiser passes with `626` modules and `2,314` dependencies;
- `git diff --check` and Graphify update pass.

The existing production-build chunk warning remains unchanged and does not
affect this bounded profile feature. Step 15 is the only valid next
implementation step.

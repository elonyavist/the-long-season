# Phase 81B Pre-Implementation Analysis Prerequisite

## Status

**Open prerequisite.** This analysis was verified against the Phase 81B
documents and the current production code on 2026-08-07. It changes no engine
behaviour. Phase 81B implementation must not start until every blocking finding
below has either been corrected in the owning step contract or replaced by an
explicit, documented decision that preserves the same invariant.

This file is not an implementation step. It is the review gate that prevents a
step from being opened with an impossible ordering, an unmeasurable threshold,
or an Expected Files list that cannot contain the required change.

## Review Scope

The review covered:

- the Phase 81B README and Steps 01-07 in full;
- the always-active repository rules in `AGENTS.md` and `CLAUDE.md`;
- the current career fixture, monthly advancement, season rollover, contract,
  free-agent, long-run report, checkpoint, and persistence paths;
- the previously accepted requirement for a bounded simulation checkpoint
  after every coherent group of two or three steps;
- the requirement that simulation checkpoints use exactly `7` workers.

The review that produced these findings changed no production behaviour. This
document and the phase README only record and enforce its result.

## Prerequisite Exit Gate

Before Step 01 starts:

1. every **blocking** finding has a written resolution in the owning Phase 81B
   document;
2. the Step 01 metric population, denominator, sample, seed contract, thresholds,
   and `7`-worker execution contract are preregistered;
3. the ordered plan names the intermediate checkpoints after Steps 02-03 and
   Steps 04-05, including `GO`, `REFINE`, `STOP / RETHINK`, and the owner reopened
   by each miss;
4. the Step 07 domestic-division and rollover decision is made before its
   expensive cohort is authorized;
5. every affected step's Expected Files list can contain all of the production
   readers that its contract requires it to change.

A blocker is closed by correcting the contract before implementation, not by
adding a test that exercises only the reachable happy path.

## Blocking Findings

### B1. Step 04 inverts the same-date commit order

Step 04 requires background fixtures on the arrival date to appear after the
manager's match, but says this follows from `advanceCareerMonths(...)` running
before the manager report is applied. The current production order is exactly
the opposite of the claimed consequence:

1. [`advanceCareerMonths(...)`](../../../packages/engine/src/career/progress-fixture.ts#L369)
   advances lifecycle state;
2. [`applyMatchReportToFixture(...)`](../../../packages/engine/src/career/progress-fixture.ts#L381)
   then applies the manager's result.

If arrival-date background resolution is inserted inside the first call, those
results are computed and applied before the manager's result. Atomic publication
of the returned career state does not reverse the mutation order or establish a
separate reveal order.

The Step 04 contract must define one executable ordering. A valid design may,
for example, advance an interval exclusive of the arrival date, commit the
manager fixture, and then call the same advancement owner for the remainder of
that date. It may not claim that the current single call already produces the
opposite order.

**Owner:** Step 04, with Step 05 consuming the corrected full-time boundary.

### B2. A second durable fixture checkpoint duplicates canonical state

Step 04 asks for a new durable checkpoint recording already-resolved fixtures.
The current model already owns that fact:

- [`Fixture.result`](../../../packages/domain/src/entities/fixture.entity.ts#L30)
  is the authoritative played/unplayed state;
- [`applyMatchReportToFixture(...)`](../../../packages/engine/src/use-cases/apply-match-report-to-fixture.ts#L73)
  rejects a second application unless an explicit debug overwrite is requested.

A stored collection that must agree with `fixture.result` is duplicated derived
information. It would also force CareerState and SQLite persistence work after
Step 02 has already taken the phase's declared beta reset.

Step 04 must derive idempotency from the canonical fixture result unless it can
prove that a different, non-derivable transaction fact is required. If such a
fact exists, its semantics, reset/version owner, and non-duplication proof must
be written before implementation.

**Owner:** Step 04.

### B3. Step 07 cannot combine selected-division-only scope with ten-season rollover

Step 07 currently states all of the following:

- only the selected club's division is resolved fixture by fixture;
- fixtures outside that division are outside scope;
- every world-integrity fixture reaches the canonical career producer;
- the cohort observes ten successive seasons of promotion and relegation.

The current engine cannot roll a domestic season on that population. The
canonical completion check requires every current-season fixture to be played:
[`assessCareerSeasonCompletion(...)`](../../../packages/engine/src/career/season-completion.ts#L63).
Promotion/relegation also requires a non-empty final table for every registered
competition:
[`prepareDomesticMovement(...)`](../../../packages/engine/src/career/advance-career-season.ts#L1063).

The existing ten-season report obtains the missing adjacent-division tables by
calling `simulateSeason(...)` separately for every other competition:
[`advanceCareerForReport(...)`](../../../apps/cli/src/commands/ten-season-report/report-data.ts#L4324).
That path currently builds the fixed `4-4-2` report input:
[`createCompetitionCareerSeasonInput(...)`](../../../apps/cli/src/commands/ten-season-report/report-data.ts#L4121).

Before Step 07 is authorized, the phase must choose one truthful contract:

- expand canonical fixture resolution to every domestic division needed by
  rollover; or
- retain an explicitly separate aggregate source for adjacent tables, exclude
  those fixtures from canonical-selection claims, and label the resulting
  promotion evidence accordingly.

The current wording cannot be satisfied by one implementation.

**Owner:** Step 04 for playable-world scope, Step 06 for population freeze, and
Step 07 for cohort execution.

### B4. Step 07's Expected Files do not contain the runner it must replace or deepen

The shared career long-run runner still invokes `simulateSeason(...)` directly:
[`runCareerLongRunSimulation(...)`](../../../packages/simulation-tools/src/long-run/career-long-runner.ts#L166).
Step 07 says `world-integrity-cohort` must instead use career-fixture progression,
but neither that runner nor its tests appear in Step 07's Expected Files.

Deepening only `report-data.ts` would either leave the old runner in control or
create a second long-run orchestration path. Both conflict with the phase's
single-producer and no-residue rules.

Step 07's Graphify-informed scope must include the actual runner owner and every
affected test, or explicitly document a different existing seam that can change
the call without duplicating orchestration.

**Owner:** Step 07, frozen by Step 06 before acceptance seeds run.

### B5. Step 02 cannot remove whole-year terms inside its current file scope

Step 02 correctly requires one offered-term unit and says no `durationYears`
path or converter may survive. Its current Expected Files omit production
readers that still use year semantics, including:

- [`player-willingness.ts`](../../../packages/engine/src/market/player-willingness.ts#L138);
- [`contract-negotiation.ts`](../../../packages/engine/src/career/contract-negotiation.ts#L1049);
- [`career-market-adapter.ts`](../../../apps/web/src/features/market/career-market-adapter.ts#L780);
- [`career-contract-view.ts`](../../../packages/ui/src/career/career-contract-view.ts#L16);
- `packages/engine/src/career/apply-career-transfer.ts`;
- `apps/web/src/features/squad/career-squad-adapter.ts`;
- the CLI market demo and the affected tests.

Step 01 already owns the complete term-reader inventory and is allowed to amend
the next relevant step. It must use that authority before Step 02 starts. The
Step 02 Expected Files list is not implementation authority until the inventory
and Graphify affected set agree with it.

**Owner:** Step 01 inventory, resolved in the Step 02 contract.

### B6. The intermediate checkpoint protocol is missing

Steps 02-03 are measured together and Steps 04-05 contain focused tests, but the
phase defines no named intermediate checkpoints with a decision table. A search
of the current documents finds `GO`, `REFINE`, and `STOP / RETHINK` only in the
final Step 07 cohort.

This does not satisfy the accepted development rule: implement a small coherent
slice, simulate it, and decide whether to continue or revise before building the
next slice. It also leaves Step 03 saying Step 04 is the only next action even if
the market-cycle result misses its contract.

The minimum checkpoint ladder is:

1. **Baseline checkpoint — Step 01:** freeze population, metric definitions,
   thresholds, seeds, sample, and exactly `7` workers;
2. **Market checkpoint — after Steps 02-03:** measure expiry clustering,
   peak/trough/drain, attributed outflow, arrivals, squad/role sustainability,
   and deterministic repeatability; decide `GO`, `REFINE 02/03`, or
   `STOP / RETHINK`;
3. **Fixture checkpoint — after Steps 04-05:** measure table completeness,
   same-date ordering, idempotency, day-step/month-jump equality, shared-producer
   equality, and performance with exactly `7` workers; decide `GO`,
   `REFINE 04/05`, or `STOP / RETHINK`;
4. **Authorization — Step 06:** freeze the expensive Step 07 contract;
5. **Acceptance — Step 07:** run the `7 x 10` canary and `750 x 10` cohort.

Every simulation checkpoint runs alone, and every command must report `7`
actual workers before its output counts as evidence.

**Owner:** phase README and Steps 01, 03, 05, and 06.

## Required Contract Corrections

### C1. Free-agent gates lack complete numeric semantics

The phase currently freezes a `5-7%` peak but describes the trough as “roughly
`2%`”, the drain only as a delta, and the attributed outflow as “mostly”
signings. Those phrases cannot produce a preregistered pass/fail result.

Step 01 must freeze before post-change output exists:

- the exact trough interval;
- the minimum positive drain, with formula;
- the minimum signing share of attributed outflow, with formula;
- empty-population behaviour;
- the observation dates and inclusion boundaries;
- the exact sample, seasons, seed prefix, and `7`-worker execution contract.

### C2. The free-agent competition denominator is undefined and its example is inconsistent

The canonical pool is global and derived from lack of ownership:
[`selectFreeAgentPlayerIds(...)`](../../../packages/engine/src/career/free-agent-pool.ts#L14).
An unowned player has no current competition, so “free agents in that
competition” needs an attribution rule: last registered competition, market
tier, eligibility, or another preregistered football fact.

The numeric example also mixes scopes. One division contains `18` clubs and the
canonical target senior squad is `22` players, so `2%` is about `8` players per
division. Across the complete `54`-club country it is about `24`, not `30-40`.
Step 01 must correct the example and use the same denominator for peak, trough,
drain, and opening-state comparison.

### C3. The `60`-month ceiling has two possible meanings

Step 02 says an offered term is capped at `60` months and that expiry lands on
the first season boundary at or after that requested term. Those rules permit an
effective `startsOn -> endsOn` duration longer than `60` months.

The contract must decide whether `60` caps:

- the requested negotiation term only; or
- the effective signed tenure after boundary anchoring.

The domain validation, UI label, player-willingness calculation, persistence
column, audit metric, and boundary-edge tests must all read the same meaning.

### C4. Simulate-match neutrality must distinguish kickoff equivalence from live intervention

The promise that simulation returns “the result he would have got by playing”
is false once the live manager can substitute players or change tactics. The
valid counterfactual is the result from the identical committed kickoff context
with no later live intervention.

For identical context, producer, config, and `(worldSeed, fixtureId)`, the core
gate should require exact paired equality of the structured result. A
distribution-only comparison is weaker and could allow two different producers
to pass after calibration. Distribution comparisons may remain as an additional
population monitor, not as proof of shared ownership.

**Owner:** Step 05 and the fixture checkpoint.

### C5. Fresh and resumed executions cannot make the same full view byte-identical

Step 07 requires the view to include execution facts and also requires the view
to be byte-identical after the fresh run and no-work resume. Those invocations
necessarily differ:

- fresh: `simulatedWorldCount = 750`, `resumedWorldCount = 0`;
- resume: `simulatedWorldCount = 0`, `resumedWorldCount = 750`.

The current report model explicitly excludes invocation metadata from its
aggregate evidence hash because those counters differ:
[`hashPlayerDevelopmentCohortAggregateEvidence(...)`](../../../apps/cli/src/commands/ten-season-report/report-data.ts#L1048).

Step 07 must either compare two subsequent checkpoint-only renders, or keep
invocation telemetry outside the byte-identical canonical view. Aggregate hash
identity and full-document byte identity are different gates and must not share
one label.

### C6. Inherited Phase 81A gates need exact IDs and populations

The observational `750 x 10` can measure formation usage, selection sources,
role availability, fallback count, and other real-career distributions. It
cannot silently stand in for Phase 81A's oracle matrices, paired best-response
searches, or realized human-manager agency checkpoints.

Step 06 must enumerate every inherited metric ID that Step 07 evaluates, its
canonical reader, population, denominator, and status semantics. Anything not
observable in this cohort remains `not_evaluated` or cites the earlier Phase 81A
evidence; it does not receive a new `PASS` from an unrelated population.

### C7. Broad-department recruitment may erase Phase 81A squad identity

Step 03 currently makes free-agent need decisions at goalkeeper/defender/
midfielder/attacker level. Phase 81A makes ten primary roles and squad identity
material to formation selection. A squad can therefore satisfy every broad
department floor while losing the role mix that made its formation contextual.

The market checkpoint must measure, on real generated career populations:

- all ten primary-role frequencies and reachability;
- role-coverage warnings by season;
- squad-identity and formation-choice stability at comparable availability;
- catalog-order independence;
- formation concentration after repeated AI recruitment.

The policy need not preserve a permanent formation. It must prove that recruitment
does not collapse contextual shape choice before the `750 x 10` cohort is spent.

### C8. Operational budgets need tail and artifact limits

Step 04 freezes only p50 tick budgets, while Step 07 can retain large per-world
facts in `750` checkpoint shards. The `7 x 10` canary says it validates memory
and checkpoints but has no numeric memory or disk decision.

Step 06 should preregister at least:

- p50 and a tail latency measure for Continue and matchday;
- maximum peak RSS when measurable;
- maximum checkpoint bytes per world and projected total disk use;
- maximum canonical report and HTML sizes;
- the owner reopened when any operational bound misses.

These are operational findings, not engine-correctness gates, but they must be
known before a potentially day-long acceptance run.

## Verified Strengths To Preserve

The review found the following contracts sound and worth preserving while the
findings above are resolved:

- Step 07 enforces exactly `7` workers and accepts only the exact `7 x 10` canary
  and `750 x 10` acceptance profiles;
- the legacy fixed-`4-4-2` path is rejected through selection-source counts,
  fallback count `0`, and an observed formation-variety gate;
- tactical facts are read from what was actually fielded rather than rebuilt
  from later squad ownership;
- stable IDs own identity and deterministic final tie-breaks own ordering;
- player age comes from the canonical completed-age function;
- transfers come from canonical history and reconcile with finance and
  ownership;
- the long-run cohort is explicitly an automated-manager world-health test, not
  proof that human choices are fun;
- loan and market-race populations remain explicit `not_evaluated` capabilities;
- large checkpoints and generated views use existing ignored artifact roots;
- mandatory table, goal, assist, transfer, ownership, and denominator
  reconciliations fail closed.

## Authorization Decision

**Current decision: HOLD.** The Phase 81B thesis remains valid, but no
implementation step is authorized by this analysis yet. Resolve B1-B6 and
incorporate C1-C8 into their owning contracts first. After those document
changes, reread production code and use Graphify affected output before opening
Step 01.

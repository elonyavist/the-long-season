# Step 06B16 - Role-Aware Domestic Market And Soft Club Blueprint

## Status

**Done (2026-08-10).** Checkpoint L5.3C identified `market_distribution`: comparable
prime-age replacements exist in the first division, but few clubs possess one
for the exact role occupied by a season-ten opening leader. The carried club-
identity attribution separately identified competition-balanced annual intake
allocation as the owner of formation-identity erosion.

## User-Facing Reason

A believable ten-season career needs clubs to replace the football job they are
actually losing. A club short of a striker should not be satisfied merely
because it owns four attackers, and a club built around wing-backs should not
have its youth intake slowly turned into the same generic squad as everybody
else. Transfers must remain negotiated and affordable; youth production must
remain varied and soft rather than protecting one formation forever.

## Frozen Implementation Contract

### Exact-role recruitment without forced outcomes

`AiMarketNeed` becomes an exhaustive target union:

- a `department` target retains structural depth, expiring-contract and broad
  quality maintenance exactly as today;
- a `role` target expresses succession for one canonical `PlayerRole` and
  derives its department through `playerRoleSquadDepartment(...)`.

No need stores both role and its derived department. A role-succession need is
reachable only when a club has an outfield incumbent at or above the existing
aging threshold and lacks a `21..29` same-role teammate whose public current
ability is within `0.5` of that incumbent. The `0.5` tolerance is frozen before
implementation because L5.3C used the same quality resolution to establish the
distribution owner.

The permanent and preliminary target selectors filter role needs by exact
`primaryRole`. Department needs retain their current department filter. Every
seller floor, squad floor, transfer window, willingness, wage, budget, public-
information and selected-club rule remains canonical and unchanged. A role
need may fail to recruit; no transfer, release or player result is forced.

The new succession priority is versioned content, below structural emergency
depth but above a generic department aging observation. It does not award a
young-player bonus and does not read potential beyond the existing public
assessment.

### Derivable soft club blueprint

The generated squad identity is derived again from the existing sole owner,
`assignGeneratedSquadIdentities(...)`, using the same immutable world seed,
competition identity and ordered club IDs as opening senior generation. It is
not added to `CareerState`, a save envelope or a second lookup table.

`planCompetitionAnnualIntakePositions(...)` keeps ownership of the balanced
competition-wide role deck. When assigning each real role token to a club, it
prefers the lowest current-plus-planned fill relative to that club's generated
identity role counts. A role absent from a blueprint remains possible after
positive blueprint demand is satisfied; the blueprint is a preference, never
an exclusion, protected shape or formation key. Stable RNG and club/slot
tie-breakers remain final.

The same allocation rule is used by opening academy, annual academy refill and
the dormant emergency senior provider. There is one role-allocation algorithm,
not one identity-aware path beside a legacy generic path.

### Versioning

The market behaviour asset advances from v8 to v9 because the AI recruitment
policy changes. Existing beta saves carrying the older calibration version are
rejected and reset by the already-canonical CLI/web calibration boundary; no
migration, compatibility default or dual reader is added. No persistence schema
changes merely to store a derivable blueprint.

## What NOT To Implement

- no synthetic external player pool;
- no direct age, origin, goal, assist, lineup or leaderboard bonus;
- no forced sale, forced transfer, free player movement or relaxed finance;
- no permanent formation, tactical plan or identity field in career state;
- no club-exclusive roles and no reduction of competition-wide role variety;
- no second market client, intake planner or report entrypoint;
- no tuning after reading L5.4.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and test own the total
  need target, exact-role succession discovery, selectors, diagnostics and
  real-data reachability;
- `packages/engine/src/test-fixtures/market-behavior-config.ts` follows the
  typed v9 contract for engine tests; it remains a fixture, not policy;
- `packages/domain/src/balance/player-economy-calibration.ts` owns the typed v9
  role-succession content contract;
- `packages/content/src/balance/market-behavior-calibration.json`,
  `packages/content/src/schemas/player-economy-calibration.schema.ts` and
  `packages/content/src/balance/player-economy-calibration.test.ts` own and
  validate the v9 values;
- `packages/content/src/generators/squad-identity.ts` and test expose the one
  derived role-count view of an existing identity;
- `packages/content/src/generators/annual-intake-role-plan.ts` and test own the
  soft proportional blueprint allocation and its deterministic fallback;
- `packages/content/src/generators/initial-youth-academies.ts` and test pass the
  canonical opening identity into the shared planner;
- `packages/content/src/generators/career-intake-players.ts` and test derive the
  same identity for annual academy and emergency senior composition;
- `packages/engine/src/index.ts` only if the already-public market types need an
  updated re-export shape;
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts` and
  test derive the existing broad loss slice from the new total diagnostic
  target through the engine-owned target-to-department seam; they do not add a
  second market classification;
- `apps/cli/src/commands/simulation-report/role-aware-market-reachability.test.ts`
  **(new)** searches generated domestic worlds through the canonical career
  and market policies; it is the real-data proof, not a report implementation;
- existing CLI/web calibration-reset tests only if the v9 asset exposes a real
  stale expectation; their behaviour is not rewritten;
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts` move one shared generated-
  world identity hash together after the v9/academy composition change;
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts` moves the
  measured exceptional-replacement continuity row caused by the new academy
  role allocation; all stock, missing and inflation gates stay unchanged;
- this step, phase README, `docs/PROJECT_STATUS.md` and the preregistered 06B17
  checkpoint document.

Every additional file is listed here with its owner before modification.

## Required Checks

- focused market, content schema, squad-identity and intake tests;
- real generated population proves both department and role needs reachable,
  exact-role candidate filtering reachable, and a genuine role mismatch
  rejected;
- real generated competition proves multiple blueprints receive distinct role
  mixes while all ten roles and sided balance remain reachable;
- catalog/order determinism and repeated-seed equality;
- `graphify update .`, targeted `graphify affected`, `pnpm check` alone and
  `git diff --check`.

## Definition Of Done

- role succession uses only public current facts and canonical transfers;
- intake retains league-wide variety while following a soft club role vector;
- no second source of squad identity, market truth or derived department;
- v9 is explicit and old beta calibration bundles fail at the existing reset
  boundary;
- every new branch is reachable on real generated data;
- all checks are green before L5.4 starts.

## Outcome

- `AiMarketNeed.target` is a total `department | role` union. Department is
  derived for role targets through `playerRoleSquadDepartment(...)`; no need or
  diagnostic stores the same fact twice.
- role succession uses the frozen `0.5` public-ability tolerance and v9 priority
  `32`. A generated three-world sweep reached department needs, role needs,
  recruitable role needs and exact-role targets through real career finance.
- the permanent and preliminary selectors now retain target player IDs in
  diagnostics. The L5.4 observer can therefore prove an exact-role target was
  real without reconstructing the market decision.
- opening and annual academy composition derive the same club identity role
  vector from the original seed/competition/club order. The shared planner
  fills proportional role deficits first, then falls back to generic balancing;
  every role remains reachable and no formation is stored.
- the generated-world identity hash moved together in CLI/web to `da43409b`.
  On the continuity seed, exceptional replacements moved `5 -> 7`; active stock
  stayed `8`, missing replacements and inflation stayed `0`.
- `pnpm check` passed: `305` files, `2344` tests, `878` modules and `3630`
  dependency edges; every custom check and typecheck passed. `git diff --check`
  and Graphify affected checks are clean.

## Handoff

Open the preregistered 06B17 profile once, with its fresh prefix and exactly
seven workers. No coefficient or target changes after output. JSON is the
canonical evidence; HTML is rebuilt from that JSON only.

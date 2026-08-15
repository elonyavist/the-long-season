# Step 16L - Structural Successor-Ceiling Stock

## Status

**Done.** The structural policy and every frozen reachability branch are green.
Step 16M is open.

## User-Facing Reason

A ten-season career needs believable replacements to exist before club AI,
minutes and development can create a story around them. Today almost every
generated player is structurally unable to reach the top senior rung. This step
adds a small, uncertain national stream of credible successors without making
every academy productive or every prospect successful.

## Frozen Inputs

- L6.42A funnel: `1885 -> 1041 -> 22 -> 13 -> 13`;
- ceiling owner share: `1019/1872 = 0.5443`, coherent in `6/7`;
- viable-ceiling realization: `13/22 = 0.5909`;
- opening current-16 season-ten survivors: `71/7 = 10.14` per world;
- existing active young six-star target: `4..5`, unchanged;
- successor stock: `0.90..1.00` per First-Division club, therefore `16..18`
  under the current eighteen-club topology.

No number moves after a generation sample is inspected.

## What To Implement

### 1. Versioned Semantic Target

Extend the rating-scale rarity contract with the five-star-or-better active
stock share and per-club maximum. Advance the rating-scale version and linked
valuation reference together. Validation must reject non-integral basis points,
an inverted range, a maximum above `10000`, a non-positive club cap, or a
five-star target smaller than the unchanged six-star target.

### 2. One Tiered Annual Allocation

Refactor `buildAnnualWorldIntakeExceptionalAllocation(...)` into one deeper
annual ceiling-stock allocation. It receives one active young population and
one real vacancy catalog, derives both stock tiers, assigns six-star vacancies
first, then fills only the remaining five-star-or-better vacancies.

Return one total player-ID-ordered assignment list with a semantic minimum
rating. Derived lists and counts are report helpers, not stored beside it.
Stable ordering ends in player ID. No order-sensitive object enumeration.

### 3. Contextual Selection

Five-star successor candidates:

- are actual First-Division academy vacancies;
- keep the role assigned by the annual competition role plan;
- are weighted by the existing development-environment serious-prospect
  policy rather than a copied table;
- use a derived seeded stream;
- respect one new assignment per club per intake and two active qualifying
  youth per club;
- become serious prospects with an exact five-star ceiling through
  `buildContextualProspectJointProfile(...)`;
- retain its current/ceiling gap and never arrive current five-star.

Six-star selections retain their current eligibility, lower-division allowance,
per-club cap, rare-prodigy class and exact IDs in the paired control proof.

### 4. Temporary Paired-Control Seam

Add one analysis-only semantic switch at the annual world-composition boundary.
`false` must reproduce current generation exactly; `true` enables the successor
stock. The seam is used by Step 16M and removed by Step 16N. It must not enter a
save, engine decision, club state, player state or public gameplay command.

### 5. Beta Calibration Reset

Use the existing calibration-version rejection/reset path. Update tests that
pin the supported bundle. Do not add migration, fallback, dual reader or a new
storage/schema version.

## Real-Data Reachability

Tests must search deterministic real annual worlds, not construct an assignment
fixture. Before Done they must find and assert:

- a season with a positive five-star vacancy;
- a season with zero five-star vacancy because active stock satisfies target;
- a five-star assignment and a six-star assignment;
- an eligible club refused by the annual or active club cap;
- at least two different clubs and two different roles selected across the
  search corpus;
- a selected serious prospect below current five-star whose stored ceiling is
  exactly five-star;
- unchanged six-star IDs and unchanged non-selected player output in control;
- zero missing real vacancies and zero reconciliation failures.

The corpus and maximum seed search are written into the test before its first
run. Failure to find a branch is `STOP_RETHINK`, not permission to weaken it or
append seeds after seeing output.

## Expected Files

- `packages/domain/src/balance/player-economy-calibration.ts` - typed rarity
  contract only if the validated content type owns the new fields there.
- `packages/content/src/balance/player-rating-scale.json`,
  `valuation-curves.json`, `asking-price-curves.json`,
  `market-behavior-calibration.json`, `player-economy-calibration.ts` and test -
  one versioned target bundle and the existing linked-version chain; only the
  rating asset changes behaviour.
- `packages/content/src/schemas/player-economy-calibration.schema.ts` and test -
  strict validation and cross-tier invariants.
- `packages/content/src/generators/player-rarity-budget.ts` and test - one
  tiered active-stock allocator.
- `packages/content/src/generators/career-intake-players.ts` and test - one
  world composition and diagnostics owner.
- `packages/content/src/generators/initial-youth-academies.ts` and test - consume
  the total semantic assignment without a second archetype roll.
- `packages/content/src/index.ts` only if an existing public composition root
  needs the renamed type or function.
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and focused
  tests - replace reads of the superseded six-ID array with derivation from the
  total assignment list; this is required by the one-fact/one-owner rule,
  not new report behaviour.
- CLI/web calibration-reset tests only when their existing exact-version pins
  require updating; no runtime implementation change is expected.
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts` - the canonical CLI/web
  identity hash moves together because the linked calibration bundle changed;
  the equal new hash remains the cross-surface proof.
- `packages/engine/src/squad/player-potential-projection.test.ts` and
  `public-player-assessment.test.ts` - typed test-only rating-scale fixtures
  must describe the complete v11 annual-intake contract; production engine
  behaviour is unchanged.
- this step, the phase README, the design contract and
  `docs/PROJECT_STATUS.md`.

Production inspection and `graphify affected` may narrow this list. Any newly
required file is added here with its ownership reason before editing.

## What Not To Implement

- no player development, aging, minutes, selection, market or match changes;
- no current-ability floor outside the existing serious-prospect policy;
- no guaranteed club successor, role rewrite or formation input;
- no second allocator or per-club rarity roll;
- no report gate or HTML yet;
- no save migration or compatibility code.

## Required Checks

1. `nvm use 24.16.0`.
2. Graphify explain/affected for the annual allocator and both generation roots.
3. Focused schema, rarity, youth and annual-provider tests.
4. Exact control replay and RNG/ID/order proof.
5. Real-data reachability corpus.
6. `graphify update .` and no stale old allocator symbol.
7. `git diff --check`.
8. `pnpm check` alone.

## Decision

- **Done:** every structural and reachability condition passes; open Step 16M.
- **REFINE:** correct only this allocator with targets unchanged.
- **STOP_RETHINK:** remove the candidate when the stock is unreachable without
  another gameplay subsystem, changes six-star rarity, or creates instant
  senior stars.

## Outcome

**Done on 2026-08-15.** One country-level allocator now reconciles the active
`15..20` five-star-or-better and six-star stocks, assigns the unchanged six-star
lane first and fills only the residual five-star vacancies. The linked content
bundle is versioned; no migration or compatibility reader was added.

The frozen seven-world real-data corpus reaches both zero and positive
five-star vacancies, both semantic assignment tiers, a real club-cap refusal,
multiple selected clubs and roles, exact-five stored ceilings below current
five-star, and zero role/vacancy reconciliation failures. Paired generation
keeps the six-star IDs and every non-selected player identical. Focused result:
`5` files, `77` tests, all green. Graphify was rebuilt and the superseded annual
allocator symbol has no production reader or definition. The temporary policy
switch survives only for Step 16M and has Step 16N as its removal owner.

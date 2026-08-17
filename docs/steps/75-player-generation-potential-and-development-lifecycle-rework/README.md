# Phase 75 - Player Generation, Potential And Development Lifecycle Rework

## Status

Complete. Steps 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, and 15 are Done. Phase 76 is not started.

## Goal

Replace the current broad seasonal player-growth model with one credible,
deterministic lifecycle in which current ability, reachable potential, age,
minutes, performance, role exposure, division, club context, decline, and exit
all tell the same football story.

## User-Facing Outcome

- A 26-year-old with pace `10` cannot carry a hidden pace ceiling of `18`.
- A lower-division prospect may become excellent after several seasons, but is
  not already a first-division star at creation.
- Young players improve slowly when they play and perform; unused players do
  not realize the same development automatically.
- Older outfield players begin meaningful physical decline from age `32`, with
  a separate later goalkeeper curve.
- A player can learn a related role through sustained real match exposure, not
  by instantly changing his football identity.
- AI clubs rotate squads and create credible minutes instead of developing the
  same fixed XI while every reserve stagnates.
- Long careers retain believable age, ability, potential, role, academy, and
  squad structures.

## Entry Gate

Before Step 01 starts:

1. Phase 74 Steps 10 and 11 are Done.
2. The Phase 74 canonical ability algebra, role profiles, construction
   boundary, persistence proof, and long-run report are the starting baseline.
3. `docs/PROJECT_STATUS.md` explicitly points to Phase 75 Step 01.
4. No source file is changed merely because this phase has been documented.

## Locked Product Decisions

### Current Ability And Potential

- Generate the current player profile first.
- Derive potential from one bounded remaining-growth budget; do not roll an
  unrelated future value independently for every attribute.
- Potential means the realistic ceiling still reachable from the player's
  current age, not an idealized birth ceiling that can no longer be reached.
- For every ability, `current <= potential <= 20`.
- Persisted potential may remain stable or compress; it may never increase.
- Exact hidden potential remains engine truth and is never shown precisely to
  the manager.
- Public prospect language keeps four labels only: `ordinary`, `interesting`,
  `high`, and `elite`.

### Age And Attribute Families

- Ages `15..17` may have substantial room and rare advanced current traits,
  such as pace `14`, without being complete senior players.
- Ages `18..21` retain meaningful development room.
- Ages `22..24` retain bounded room, weighted toward role-relevant attributes.
- Ages `25..27` have small remaining room; physical jumps are near zero and
  large technical jumps are invalid.
- Ages `28..31` are mainly maintenance, refinement, and limited mental growth.
- Outfield physical decline starts from age `32`.
- Goalkeepers use a separate, later peak and decline curve.
- The active-player floor for the five current physical attributes is `7`.
  The floor prevents physically impossible active footballers; it is not a
  promise that an old player remains effective in his role.

### Development Cadence

- Development is applied gradually at deterministic monthly checkpoints.
- Real minutes are the primary opportunity signal.
- Match ratings and structured contributions provide a bounded modifier, not a
  second source of progression.
- Performance can adjust the monthly result by at most approximately `+/-15%`.
- Age, reachable room, role relevance, and minutes remain stronger than one
  unusually good or bad match.
- No daily attribute churn and no once-per-season growth jump remain.

### AI Participation And Role Learning

- AI clubs select a credible XI and bench, rotate players across the season,
  and may make deterministic half-time substitutions.
- Rotation must respect role coverage, fitness, quality, prospect value, and
  stable ordering without secretly optimizing every match.
- Actual starts, substitute minutes, ratings, and played roles feed one durable
  participation ledger.
- Related-role familiarity may improve after sustained minutes in that role.
- Primary role and archetype do not change automatically.

### Youth And Rarity

- Every club has an explicit derived youth-development level from `1..5`.
- Division is the primary generation constraint; club reputation/development
  level is a bounded secondary influence.
- A strong third-division academy may generate interesting prospects more
  often, but cannot routinely create first-division-ready players.
- Division-wide rarity budgets remain strict: elite is often zero and at most
  one; high remains rare; ordinary remains the majority.

### Beta Save Policy

- All pre-Phase-75 careers are intentionally unsupported and may be deleted.
- Phase 75 establishes one new beta save baseline and updates JSON plus
  SQLite/OPFS versions together.
- No migration, compatibility reader, dual mapper, or legacy development path
  is retained for discarded beta saves.
- Failure to recognize an old save produces typed recovery with a clear reset
  path; it never silently invents lifecycle facts.

## Configuration And Ownership Decision

Do not add `@game/balance` or one global coefficient package.

- `@game/domain` owns stable types and invariants only: ability ordering,
  role-profile facts, physical floor invariant, participation-ledger shape, and
  validated state construction.
- `@game/content` owns generation bands, current-profile policy, reachable
  potential allocation, academy-level derivation, and rarity budgets.
- `@game/engine` owns monthly growth, performance/minute modifiers, AI squad
  participation, role exposure, decline, potential compression, retirement,
  and lifecycle orchestration.
- `@game/storage` owns the new beta baseline and lossless persistence.
- CLI and simulation-tools own inspection and gates, never gameplay formulas.

Coefficient tables may be exported read-only from their owning module when
tests and diagnostics need them. A coefficient must not be duplicated in a
second package merely to make tuning convenient.

## Determinism And Fun Contract

- Same seed plus same commands produces the same players and career state.
- Random draw order changes are deliberate, isolated, and documented.
- Every completed step leaves the repository buildable and its new production
  contract consumed by the current path. If a contract, persistence mapping,
  and first real consumer cannot be completed safely inside the documented
  Expected Files, stop and correct that step document before editing source;
  do not land a dormant API or temporary compatibility bridge.
- Reports explain football meaning; they do not become gameplay truth.
- No threshold is relaxed to make a gate green.
- The objective is a believable and enjoyable career: rare discoveries,
  meaningful selection choices, gradual payoff, aging trade-offs, and roster
  renewal. Mathematical neatness alone is not success.

## Ordered Steps

1. [01-accepted-lifecycle-contract-and-reproducible-baseline.md](01-accepted-lifecycle-contract-and-reproducible-baseline.md) - Done
2. [02-current-profile-generation-and-physical-floor-policy.md](02-current-profile-generation-and-physical-floor-policy.md) - Done
3. [03-age-aware-reachable-potential-allocation.md](03-age-aware-reachable-potential-allocation.md) - Done
4. [04-youth-development-level-and-rarity-budget-integration.md](04-youth-development-level-and-rarity-budget-integration.md) - Done
5. [05-durable-player-participation-and-development-ledger.md](05-durable-player-participation-and-development-ledger.md) - Done
6. [06-beta-save-baseline-reset-and-lifecycle-persistence.md](06-beta-save-baseline-reset-and-lifecycle-persistence.md) - Done
7. [07-ai-pre-match-squad-selection-and-rotation.md](07-ai-pre-match-squad-selection-and-rotation.md) - Done
8. [08-ai-half-time-substitutions-and-authoritative-minute-accrual.md](08-ai-half-time-substitutions-and-authoritative-minute-accrual.md) - Done
9. [09-monthly-minutes-and-performance-driven-development.md](09-monthly-minutes-and-performance-driven-development.md) - Done
10. [10-related-role-exposure-and-familiarity-progression.md](10-related-role-exposure-and-familiarity-progression.md) - Done
11. [11-aging-physical-decline-potential-compression-and-exits.md](11-aging-physical-decline-potential-compression-and-exits.md) - Done
12. [12-career-calendar-orchestration-and-idempotency.md](12-career-calendar-orchestration-and-idempotency.md) - Done
13. [13-player-trajectory-diagnostics-and-inspection-reports.md](13-player-trajectory-diagnostics-and-inspection-reports.md) - Done
14. [14-staged-50x10-and-250x30-calibration-gates.md](14-staged-50x10-and-250x30-calibration-gates.md) - Done
15. [15-operational-10000x50-gate-cleanup-and-phase-report.md](15-operational-10000x50-gate-cleanup-and-phase-report.md) - Done

## Phase-Level Checks

Run with Node `24.19.0`:

```bash
nvm use 24
pnpm exec vitest run packages/domain/src packages/content/src/generators packages/engine/src/career packages/engine/src/use-cases packages/storage/src packages/simulation-tools/src/long-run
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
pnpm check
pnpm cli simulate-season --seed=phase75-world-a --player-generation-report
pnpm cli simulate-season --seed=phase75-world-b --player-generation-report
pnpm cli career --save=phase75-world-a --seed=phase75-world-a --new-world-preview
pnpm cli career --save=phase75-world-a --development-report
pnpm cli ten-season-report --seed-prefix=phase75-diagnostic --worlds=50 --seasons=10 --report-output=/tmp/phase75-50x10.md
pnpm cli ten-season-report --seed-prefix=phase75-pre-gate --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_250X30_REPORT.md
pnpm cli ten-season-report --seed-prefix=phase75-release --worlds=10000 --seasons=50 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_10000X50_REPORT.md
git diff --check
graphify update .
```

If the current CLI cannot execute the operational gate within the documented
runtime envelope, Step 15 may optimize or shard the runner without changing
simulation results. It may not reduce the agreed `10000 x 50` gate.

## Phase-Level Evidence

The final report must include:

- representative players at ages 16, 18, 21, 24, 26, 29, 32, 36, and 40;
- current/potential gaps by age, role, attribute family, division, and club
  tier;
- zero `potential < current`, age-feasibility, role-cap, and physical-floor
  violations;
- potential monotonicity across monthly and seasonal checkpoints;
- minute, start, substitute, rating, and role-exposure distributions;
- development by age, minutes band, performance band, role, and prospect label;
- physical decline and goalkeeper-curve evidence;
- academy-level and rarity-budget evidence;
- AI squad-use, stale-reserve, age-profile, exit, retirement, and replacement
  evidence;
- deterministic repeat hashes;
- `50 x 10`, `250 x 30`, and `10000 x 50` named-seed results;
- before/after ownership, complexity, duplicate-policy, and dead-code maps.

## What NOT To Implement

- No global balance/configuration package.
- No player-detail UI, scouting screen, exact potential display, or UI redesign.
- No staff, training-session, personality, injury, contract, wage, market UI,
  economy, or facility-management feature.
- No opponent tactical intelligence beyond the documented deterministic squad
  rotation and half-time substitution scope.
- No match-calculator tuning unless a Phase 75 participation change creates a
  proven regression inside the existing balance gate.
- No runtime LLM or narrative prose in engine/domain state.
- No support for pre-Phase-75 beta saves.
- No temporary legacy path, dual development system, unused coefficient table,
  or placeholder abstraction.
- Do not start Phase 76.

## Definition Of Done

- Newly generated current profiles are credible by role, division, club, age,
  and attribute family.
- Reachable potential is age-feasible, bounded, monotone non-increasing, and
  generated from current ability rather than independently.
- Monthly development uses actual minutes and structured performance with
  slow, bounded results.
- AI clubs distribute credible minutes through deterministic selection,
  rotation, and half-time substitutions.
- Related-role exposure can improve familiarity without rewriting identity.
- Outfield physical decline starts at age 32, goalkeepers follow their own
  curve, and active-player physical values respect the agreed floor.
- Aging, exits, retirement, youth intake, and squad replacement remain coherent
  for 50 seasons.
- The new beta save baseline persists all lifecycle facts without legacy code.
- `10000` deterministic worlds complete `50` seasons without structural roster,
  potential, development, role, or age collapse.
- All replaced policies and helpers are deleted, architecture is documented,
  and `pnpm check` passes.

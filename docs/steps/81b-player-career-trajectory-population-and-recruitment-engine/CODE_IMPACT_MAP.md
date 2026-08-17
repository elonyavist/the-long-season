# Code Impact Map

## Purpose

This is the architectural explanation behind each step's code impact, built
from production code, `rg`, Graphify `explain` and `affected` on the current
uncommitted tree. Exact minimum paths and checkpoint ownership live in
[`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md);
the active step also carries its own `Expected Files`. The active step reruns
`graphify update .` and `graphify affected` before each shared edit. This map
never replaces that check or grants edit scope by itself.

## Domain Truth

### `packages/domain/src/entities/player.entity.ts`

Replace `Player.potential` with an explicit latent-career field. Keep current
abilities/role identity. Public forecast does not belong in `Player`.

### `packages/domain/src/player/player-abilities.ts`

Add one canonical ability-family mapping. Replace/remove
`RolePotentialAbility`, `rolePotentialAbility(...)`,
`potentialAtLeastCurrent(...)` and `isPotentialAtLeastCurrent(...)` as callers
migrate. Never retain both potential and latent-prime helpers.

### `packages/domain/src/player/create-player.ts`

Validate final trajectory invariants rather than mechanically renaming
`potential >= current`. Step 01 must decide whether current can exceed latent
prime in a family after late development/damage semantics.

### Exports and fixtures

- `packages/domain/src/index.ts`
- `packages/domain/src/player/index.ts`
- `player.entity.test.ts`, `create-player.test.ts`, state tests and every
  `Player` fixture currently providing `potential`.

Graphify shows `Player` has a very wide impact set. Use a shared test builder
where fixtures duplicate full players, but do not create a production factory
that merely returns inputs.

## Persistence And One Beta Reset

### `packages/storage/src/sqlite/sqlite-career-schema.ts`

At analysis time SQLite schema is `24`, and
`player_abilities.ability_scope` is `current|potential`. Advance once, store
current and final latent-prime scopes, plus compact profile/damage facts only
where non-derivable. No compatibility view.

### `packages/storage/src/sqlite/world-state-mapper.ts`

Change `AbilityScope`, writer near current line `260`, reader near `448`.
Validate all 25 abilities and deterministic player/scope/group/key order. Old
scope causes reset, not partial load.

### Version/reset owners

- `packages/storage/src/save-metadata.ts`: career envelope `15` at analysis.
- `packages/domain/src/state/career-state.ts`: career schema `3`.
- `packages/storage/src/sqlite/sqlite-career-schema.ts`: SQLite `24`.
- JSON/SQLite storage tests and web runtime canonical reset path.

Advance all in one epoch. Do not add migrations.

## Continuous Population Generation

### Retain as adapters

- `fake-players.ts`: `generateFakePlayersForClubs(...)` for opening seniors.
- `initial-youth-academies.ts`: opening academy and seasonal youth roots.
- `career-intake-players.ts`: annual youth/senior providers.
- `generated-player-factory.ts`: final assembly only, not distribution.

### New deep Module

Preferred:

- `packages/content/src/generators/player-population-policy.ts` plus test;
- versioned asset under `packages/content/src/balance/`;
- validation contract under `packages/domain/src/balance/`.

It owns continuous tail, readiness, profile selection, deterministic `3:2:1`
rotation and equal club access. It accepts no desired-star result.

### Replace/delete after migration

- `player-potential-allocation.ts` reachable/ceiling target helpers;
- potential semantics in `player-prospect-joint-profile.ts`;
- `player-potential-rarity.ts` if no independent live owner remains;
- `player-rarity-budget.ts` annual five/six top-up and special assignments;
- old config, exports, fixtures and diagnostics.

If a file also owns valid current-ability logic, first split the survivor into
a correctly named Module; then delete the mixed old Module.

### Keep role quantity owners separate

`annual-intake-role-plan.ts` and Phase 81A squad identity/role blueprints decide
requested roles, not talent quality.

## Public Forecast And Consumers

### Canonical Seam

- `packages/engine/src/squad/player-potential-projection.ts`: replace room
  factors with probability forecast; rename only with same-step cleanup.
- `packages/engine/src/squad/public-player-assessment.ts`: expose public
  probabilities/derived stars only.
- squad/engine index exports: final names only.

### Versioned policy

- `packages/domain/src/balance/player-economy-calibration.ts` currently owns
  `PlayerPotentialProjectionPolicyConfig`.
- `packages/content/src/balance/player-economy-calibration.ts` selects it.
- Replace old fields/schema rather than append mutually exclusive paths.

### Consumers forbidden from re-deriving forecast

- `packages/engine/src/market/player-valuation.ts`
- `player-willingness.ts`, `transfer-feasibility.ts`
- `contract-negotiation-demand.ts`
- transfer/preliminary/free-agent/youth lifecycle paths
- `ai-squad-selection.ts`, `career-ai-team-selection.ts`
- `simulate-season.ts`

Consumers may derive decisions from probabilities; they cannot read latent
trajectory or recreate P50/upper.

## Development, Aging, Injury, Retirement

### `player-development-policy.ts`

Keep as owner of age/opportunity/performance/environment. Extend its small
Interface with trajectory-derived family window; do not duplicate it in CLI.

### `player-development.ts`

Replace direct `player.potential` growth room in `developOnePlayerMonth(...)`
with one trajectory derivation. Add base training for eligible zero-match
months through the real lifecycle. Minutes/performance remain bounded.

### `player-aging-policy.ts`

Delete `reachablePotentialCeiling(...)`, `remainingReachableRoom(...)`,
potential mutation and `totalPotentialCompression`. Retain/refine current
family decline and deterministic variance. Emit derived window diagnostics
without another persisted ceiling.

### Injury owners to inspect in Step 05

- `packages/engine/src/match-engine/match-injury.ts`
- `packages/domain/src/match/match-consequence.ts`
- `packages/domain/src/career/player-availability.ts`
- `packages/engine/src/career/match-availability-consequences.ts`

Permanent damage is a rare reachable branch of serious injury, not automatic.

### `player-exits.ts`

Add mandatory season-end retirement at completed age `>=37` before stochastic
hazard, preserving squad-repair order and earlier role/longevity exits.

## AI Recruitment And Market

The final Graphify inventory must include the canonical free-agent pool,
signing-policy and application path. These are not a separate feature: Step 07
must make them consume the same `AiRecruitmentIntent` and public assessment as
owned-market candidates, then delete any broad-department parallel ranking.

`packages/engine/src/career/ai-market-lifecycle.ts` already owns need reasons,
targets, `deriveAiMarketNeeds(...)`, succession, scoring and command submission.

Extend this Module:

- exhaustive `AiRecruitmentIntent` on each need;
- derive from squad, public decline, role depth, club context and finance;
- score by intent using only `PublicPlayerAssessment`;
- remove Phase 81A analysis switches at their closeout owner;
- persist intent only in non-derivable market facts needed for attribution.

Use a total intent-weight mapping in existing market behavior config. No `??`
fallback and no parallel planner.

## Web/UI

Current presentation:

- `apps/web/src/shared/ui/PlayerPotentialRangeRating.tsx`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `packages/ui/src/career/career-squad-view.ts`
- `packages/ui/src/career/career-player-detail-view.ts`

Keep six absolute slots, present probability-derived summaries, expose no
latent facts, share one squad/market read model, update all five localization
catalogs, and run desktop/narrow Playwright QA for shipped screens.

## Reports

Use only:

- `report-registry.ts` for modules/locked profiles;
- `career-world-facts.ts` for canonical retained facts;
- `career-sections.ts` for assembly;
- focused attribution Modules beside existing succession diagnostics.

Report origin/division/age/role/tier, forecast class versus outcome, AI intent,
transfer movement, generated leader share, retirement/injury, top-performer age
and Phase 81A tactical monitors. Diagnostic latent facts are permitted only in
locked profiles. HTML derives from canonical JSON with `--from-report`.

## Requirements And Handoff

Step 00 later amends `requirements.md` Area 3 and J-bis language that currently
forbids a stable hidden modifier, persists true potential, and mandates special
exceptional stock/top-up.

Step 14 later amends Phase 81C first, then only obsolete Phase 82A/82B
entry-gate and forecast/development Interfaces, plus `docs/steps/README.md`,
audit index and project status. Those downstream documents are
intentionally untouched during proposal review.

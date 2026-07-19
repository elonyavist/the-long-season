# Phase 74 - Player Generation And Model Consolidation Cleanup

## Status

Complete. Steps 01-11 are Done.

## Goal

Make player creation, current ability, potential, role identity, development,
youth progression, career turnover, valuation, and persistence follow one
explicit model without changing football balance by accident.

The phase is a consolidation and safety phase. It removes parallel formulas
and construction paths, gives each concept one owner, and makes the complete
player lifecycle readable from a small set of documented entry points.

## User-Facing Reason

Players are the long-term memory of the career. The game stops being credible
when a third-division defender becomes an elite finisher, youth players arrive
through a different quality model from senior players, potential means
something different in development and valuation, or a refactor silently
changes every generated squad.

The user must be able to trust that:

- every generated footballer fits division, club tier, age, and role;
- current ability and potential are comparable without being the same value;
- a prospect can have high potential without already dominating senior
  football;
- development respects role identity and hard caps;
- youth, senior, and later-career intake use the same football vocabulary;
- existing careers remain loadable through an explicit migration decision;
- the same seed and inputs still produce deterministic results.

## Phase Position

- Phase 62 already provides deterministic engine regression gates.
- Phases 24, 28, 32, and 33 established the current player-generation,
  development, youth, role-coherence, and rarity behavior.
- Phase 47 recorded the latest pre-UI player-generation sanity evidence.
- Phase 73C is complete and explicitly recommended this already-reserved
  engine phase.
- The later product decision reserves Phase 75 for player generation,
  potential, and development lifecycle rework. The former Market UI phase
  moves to Phase 76. This phase starts neither future phase.

## Current Problem Map

The current system has credible behavior but several parallel implementations:

- `fake-players.ts`, `initial-youth-academies.ts`, and
  `career-intake-players.ts` construct players through separate paths;
- senior and youth generation duplicate potential-at-least-current and
  ability traversal logic;
- role attribute classification and hard caps live in content while the
  development engine repeats equivalent tables because engine cannot import
  content;
- development, exits, youth lifecycle, promotion, transfer turnover,
  valuation, CLI reports, and the web adapter each derive scalar ability in
  their own way;
- `Player` allows optional generated role identity for historical save
  compatibility, so new construction can bypass invariants;
- raw attribute average, role-weighted current ability, role-weighted
  potential, and tactical suitability are not named distinctly enough to stop
  future callers from choosing the wrong measure.

## Locked Semantic Contract

### Ability meanings

The phase must distinguish four concepts explicitly:

1. **Raw ability average**: an unweighted diagnostic/compatibility measure over
   the canonical 25 attributes. It is not automatically football quality.
2. **Role current ability**: current attributes evaluated through the canonical
   profile of a specific football role.
3. **Role potential ability**: potential attributes evaluated with the same
   role profile, so current and potential remain comparable.
4. **Tactical role suitability**: whether a specific player can perform a
   selected tactical-board role. It may consume role ability and familiarity,
   but remains a separate decision and keeps its current public behavior.

No exported helper may use an ambiguous name such as `currentAbility` or
`averageAbilities` without identifying which of these meanings it returns.

### Attribute and potential invariants

- The existing 25 attributes and the `1..20` scale remain canonical.
- Potential remains attribute-shaped and must be greater than or equal to the
  corresponding current attribute.
- Goalkeeper and outfield role profiles remain distinct.
- Existing role hard caps remain enforced globally; they are not youth-only.
- Current and potential never become one stored scalar.
- Exact hidden potential remains engine truth and is not exposed as precise
  user-facing knowledge.

### Ownership

- `@game/domain` owns stable football invariants shared by content and engine:
  ability keys/traversal, explicit derived-ability semantics, canonical role
  profiles/caps, and validated player construction.
- `@game/content` owns fictional identity, division/club/age bands,
  archetypes, potential rarity, rarity budgets, and deterministic generated
  player assembly.
- `@game/engine` owns development, aging, exits, youth lifecycle, promotion,
  turnover, market decisions, and all state transitions.
- `@game/storage` owns durable representation, migrations, and round-trip
  compatibility.
- CLI and web adapters may format or project player facts; they may not carry
  independent football formulas.
- `@game/shared` remains football-agnostic and must not receive player-domain
  rules merely to avoid dependency direction.

## Determinism And Balance Contract

- No step may change random draw count/order unintentionally.
- Fixed-seed snapshots and distribution reports are captured before structural
  edits.
- A deliberate output change requires one isolated step, before/after evidence,
  a football reason, and long-run verification.
- Thresholds may not be widened and failed seeds may not be hidden to make a
  report pass.
- Lower-division plausibility, role coherence, rarity budgets, exact youth
  academy composition, and long-run squad structure remain release gates.
- Structural refactors should preserve exact outputs where the current
  behavior is valid.

## Save Compatibility Contract

- Existing JSON and SQLite/OPFS careers are part of the product contract.
- The audit must decide whether the durable `Player` shape needs to change.
- If it changes, the storage schema/version and migration are explicit and
  tested from the previous version.
- If no durable change is necessary, Step 10 proves compatibility and does not
  manufacture an empty migration.
- Missing historical role metadata must be normalized deterministically from
  persisted facts or rejected with typed recovery; it may not be silently
  randomized.
- No permanent compatibility wrapper remains after the supported migration
  path is established.

## Readability And Architecture Contract

- KISS applies before SOLID: one well-named function is preferred to a factory
  hierarchy.
- Every new public module and exported function/type receives useful TSDoc.
- Each player lifecycle stage has one discoverable entry point and one test
  that explains its contract.
- Line count and complexity are audit signals, not arbitrary split targets.
  A file is split only when the extracted module owns a coherent current rule.
- The phase records a before/after duplicate-helper and file-complexity map.
- Replaced helpers, tables, exports, and tests are deleted in the same step
  after replacement coverage passes.
- No `legacy`, `v2`, `new`, temporary adapter, or future-facing abstraction may
  remain in production naming.

## Ordered Steps

1. [01-current-player-model-path-invariant-and-baseline-audit.md](01-current-player-model-path-invariant-and-baseline-audit.md) - Done
2. [02-canonical-ability-algebra-and-ca-pa-semantics.md](02-canonical-ability-algebra-and-ca-pa-semantics.md) - Done
3. [03-canonical-role-profile-classification-and-cap-ownership.md](03-canonical-role-profile-classification-and-cap-ownership.md) - Done
4. [04-validated-player-construction-contract.md](04-validated-player-construction-contract.md) - Done
5. [05-senior-and-career-intake-generation-pipeline-consolidation.md](05-senior-and-career-intake-generation-pipeline-consolidation.md) - Done
6. [06-youth-generation-and-rarity-pipeline-consolidation.md](06-youth-generation-and-rarity-pipeline-consolidation.md) - Done
7. [07-development-aging-and-role-cap-consolidation.md](07-development-aging-and-role-cap-consolidation.md) - Done
8. [08-career-lifecycle-consumer-alignment.md](08-career-lifecycle-consumer-alignment.md) - Done
9. [09-market-report-and-web-adapter-ability-alignment.md](09-market-report-and-web-adapter-ability-alignment.md) - Done
10. [10-save-migration-and-round-trip-compatibility.md](10-save-migration-and-round-trip-compatibility.md) - Done
11. [11-long-run-quality-gate-dead-code-closeout-and-phase-report.md](11-long-run-quality-gate-dead-code-closeout-and-phase-report.md) - Done

## Phase-Level Checks

Run with Node `24.16.0`:

```bash
nvm use 24
pnpm exec vitest run packages/domain/src packages/content/src/generators packages/engine/src/career packages/engine/src/market packages/storage/src
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm depcruise
pnpm check
pnpm cli simulate-season --seed=world-a --player-generation-report
pnpm cli simulate-season --seed=world-b --player-generation-report
pnpm cli career --save=phase74-world-a --seed=world-a --new-world-preview
pnpm cli career --save=phase74-world-a --development-report
pnpm cli ten-season-report --seed-prefix=phase74-player-model --worlds=50 --seasons=10 --report-output=/tmp/phase74-player-model-50x10.md
pnpm cli ten-season-report --seed-prefix=phase74-player-model --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_MODEL_CONSOLIDATION_LONG_RUN_REPORT.md
pnpm cli balance-report --seed-prefix=phase74-balance --seasons=20 --target-profile=calibration-v1 --strict
git diff --check
graphify update .
```

## Phase-Level Evidence

The final report must compare the captured baseline and final state for:

- exact fixed-seed world/player output where behavior was intended to remain;
- senior and youth current-ability distributions;
- role current ability and role potential distributions;
- potential-below-current violations;
- role cap and role-coherence violations;
- lower-division serious/elite current players and rare prospects;
- academy size, age, department composition, intake, promotion, release, and
  aged-out resolution;
- development growth, decline, stalls, and cap violations;
- exits, promotion, turnover, and market valuation decisions affected by the
  consolidated semantics;
- JSON and SQLite/OPFS round trips from supported previous saves;
- duplicate ability/role formula count and touched-file complexity;
- 50x10 diagnostic and 250x30 release-gate results;
- match/season balance non-regression.

## What NOT To Implement

- No UI redesign, Squad screen, or player-detail feature.
- No new attributes, personalities, hidden traits, scouting, staff, contracts,
  wages, economy, or facilities.
- No match-engine tuning.
- No new formation or tactical-board behavior.
- No broad generation rebalance without evidence from a dedicated step.
- No exact hidden-potential disclosure.
- No save-schema break without migration.
- No second player model, compatibility leftovers, unused helper, or deferred
  cleanup.
- Do not start Phase 75.

## Definition Of Done

- There is one canonical ability vocabulary and traversal API.
- Current ability, potential ability, raw average, and tactical suitability are
  explicit, compatible, and impossible to confuse by name.
- There is one canonical role-profile/classification/cap source consumed by
  both content and engine.
- Every new senior, youth, and later-career player passes one validated
  construction boundary.
- Senior, youth, and career-intake generation share one deterministic assembly
  pipeline without losing their distinct policies.
- Development, aging, lifecycle, valuation, reports, and adapters consume the
  correct canonical derived measure.
- Existing saves load or migrate deterministically and round-trip through JSON
  and SQLite/OPFS.
- Fixed-seed and 250x30 gates preserve credible division, role, youth, and
  long-run behavior.
- Replaced paths are deleted, architecture documentation is updated, and a
  junior developer can follow the complete player lifecycle from documented
  entry points.
- `pnpm check` passes and Phase 75 has not started.

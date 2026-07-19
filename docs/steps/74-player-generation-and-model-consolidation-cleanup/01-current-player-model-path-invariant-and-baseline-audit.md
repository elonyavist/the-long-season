# Step 01 - Current Player Model Path, Invariant, And Baseline Audit

## Status

Done.

## Goal

Create the authoritative map and reproducible baseline for every current player
producer, mutator, consumer, and persistence path before changing source code.

## Inspectable Outcome

A junior developer can open one audit and answer:

- where senior, initial-youth, seasonal-youth, and later-career players enter;
- which module owns every current ability, potential, role, cap, and rarity
  decision;
- which consumers need raw average, role current ability, role potential, or
  tactical suitability;
- which formulas/tables are duplicated and which are only superficially
  similar;
- which current outputs and distributions are locked as the refactor baseline;
- whether the durable player shape requires a migration later in the phase.

## Scope

1. Trace every player creation path from public entry point to `Player` value.
2. Trace development, aging, exit, youth lifecycle, promotion, turnover,
   valuation, willingness, report, and web-adapter consumers.
3. Trace JSON and SQLite/OPFS player persistence, including optional historical
   role metadata.
4. Inventory every 25-attribute key list, traversal, average, potential clamp,
   role profile, classification, and hard-cap implementation.
5. Classify each consumer by the locked semantic contract in the phase README.
6. Record source/test line counts and complexity hotspots without prescribing
   arbitrary file splits.
7. Capture fixed-seed structured output, focused tests, player reports, and
   hashes/metrics sufficient to detect accidental random-stream drift.
8. Record the exact ownership/deletion/migration decision that Steps 02-10 must
   follow.

## Audit Contract

- This step is evidence-only; no production, test, schema, dependency, or
  generated output change is allowed.
- Similar-looking formulas are not called duplicates until input, output, and
  football meaning are compared.
- The audit must explicitly flag ambiguous scalar `current ability` usage.
- The migration decision must be one of:
  - durable player shape unchanged, compatibility proof only;
  - durable shape changed through an explicit versioned migration in Step 10.
- Baseline failures remain visible. Do not tune or suppress them here.

## Expected Files

- `docs/audits/PLAYER_MODEL_CONSOLIDATION_BASELINE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No source or test edit.
- No helper extraction or rename.
- No role, cap, band, rarity, development, valuation, or persistence change.
- No inferred migration before the persisted evidence is recorded.
- No new phase.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/entities/player.entity.test.ts packages/content/src/generators/fake-players.test.ts packages/content/src/generators/initial-youth-academies.test.ts packages/content/src/generators/career-intake-players.test.ts packages/engine/src/career/player-development.test.ts packages/engine/src/career/youth-lifecycle.test.ts packages/engine/src/market/player-valuation.test.ts packages/storage/src/sqlite/world-state-mapper.test.ts
pnpm cli simulate-season --seed=world-a --player-generation-report
pnpm cli simulate-season --seed=world-b --player-generation-report
pnpm cli career --save=phase74-baseline-world-a --seed=world-a --new-world-preview
pnpm cli career --save=phase74-baseline-world-a --development-report
git diff --check
```

## Manual Inspection

- Verify the map contains no orphan producer or consumer.
- Verify every claimed duplicate names both source locations and semantic use.
- Verify the baseline distinguishes exact-output locks from distribution locks.
- Verify Step 02 can begin without making a new ownership decision.

## Completion Criteria

- The baseline audit exists and is internally consistent.
- All player lifecycle paths and ambiguous derived measures are classified.
- The source-of-truth, deletion, and migration map is explicit.
- Current deterministic evidence is reproducible.
- No code or behavior changed.
- Step 02 is the single next action.

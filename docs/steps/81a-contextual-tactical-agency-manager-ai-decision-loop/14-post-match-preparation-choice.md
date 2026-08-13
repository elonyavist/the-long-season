# Step 14 - Single Tactical Persistence Integration

## Status

**Done.** Amendment A11 made the former preparation design internally
contradictory, so persistence and the unresolved product choice were split
before implementation. This step owns the completed coordinated beta
persistence integration. Step 14B owns preparation after an explicit product
decision.

## Goal

Persist the tactical facts the match already produced, once, so current and
reloaded careers explain the same football and future delayed evidence can read
history without reconstruction.

## What To Implement

Add a required tactical context to every durable `MatchReport`: initial fielded
formation and lateral focus for each side, plus the ordered accepted
non-substitution tactical command facts with their explicit manager/AI owner.
Substitutions remain canonical match events. Add resolver-owned `expectedGoals`
to durable shot context so tactical chapters are derived after reload from the
same raw facts as in the live session; never persist derived chapter totals.

Advance match-event, career-state, SQLite, career-envelope and supported beta
versions exactly once here. Delete incompatible careers without migration,
dual readers, optional legacy fields or guessed defaults. A save produced after
this reset remains loadable through later checkpoints.

This is the phase's single coordinated **storage schema/event-envelope**
advance. It is separate from Step 06B7F1's already-completed content bundle
`v8` invalidation. Beta saves may be discarded at either boundary; no
compatibility reader is retained.

After the reset, raw fielded-formation history is queryable for a future delayed
read. It is not activated as an AI input in this step: Amendment A11 keeps
pre-match AI opponent-blind. Insufficient history remains absent evidence, never
a reconstructed `4-4-2` or another default.

## Expected Files

- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/entities/match-event.entity.ts`
- `packages/domain/src/entities/match-event.entity.test.ts`
- `packages/domain/src/entities/match.entity.ts`
- `packages/domain/src/match/match-consequence.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/match-engine/match-simulation-runner.ts` (forwards the
  progressive command ledger into the already-requested live explanation)
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/engine/src/match-engine/index.ts` (exports the single durable chapter
  derivation used by the web reload path)
- `packages/engine/src/use-cases/simulate-season.ts` and its test: the fixture
  setup owns the selected formation/focus and the progressive state owns
  accepted commands;
- `packages/engine/src/career/progress-fixture.ts` and its test: the AI selector
  owns its exact formation/focus, while a caller-imposed XI is honestly
  `not_observed`;
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts` and
  its test: the analysis schedule owns its accepted tactic changes, but not a
  catalog formation;
- `packages/simulation-tools/src/live-match/live-match-control-gate.ts` and its
  test: the exact live-team states and progressive command ledger are owners;
- `apps/cli/src/commands/simulate-season.ts` and its test: the diagnostic owns
  its scheduled tactic delta and reports its custom formation as
  `not_observed`;
- `apps/web/src/features/matchday/matchday-adapter.ts` and its test: the private
  live session owns both kickoff teams, focus and accepted command ledger;
- schema-shaped report fixtures in engine/storage/web tests, added only to make
  the new required persisted truth explicit; no shared default helper is added;
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/career/career-finance-lifecycle.test.ts`
- `packages/engine/src/career/career-match-state-consequences.test.ts`
- `packages/engine/src/career/match-availability-consequences.test.ts`
- `packages/engine/src/career/player-statistics.test.ts`
- `packages/engine/src/season-engine/player-match-stats.test.ts`
- `packages/engine/src/season-engine/player-stats.test.ts`
- `packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `packages/storage/src/career-storage.test.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/testing/persistable-career-fixture.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `docs/PROJECT_STATUS.md`
- the Phase 81A `README.md`
- this step document
- `14b-post-match-preparation-product-decision.md`
- `15-checkpoint-e-multi-match-consequence.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/create-match-report.test.ts
pnpm exec vitest run packages/engine/src/match-engine/progressive-match-session.test.ts
pnpm exec vitest run packages/storage/src/sqlite/career-state-mapper.test.ts
pnpm exec vitest run packages/storage/src/career-storage.contract.test.ts
pnpm exec vitest run packages/storage/src/career-storage.test.ts
pnpm exec vitest run packages/storage/src/json-career-storage.test.ts
pnpm exec vitest run apps/web/src/runtime/web-career-runtime.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

The phase has exactly one coordinated storage schema/event-envelope advance,
owned here. Initial formations, lateral focus, canonical shot xG and accepted
tactical commands round-trip together; live and reloaded chapters are identical;
a career created at the reset survives every later save/load path; historical
formation is reachable on real reports and absent honestly when insufficient;
no match result or RNG consumption changes. Step 14B is next.

## Implementation Outcome

- `MatchReport` now requires selection-owned kickoff formation/focus and the
  ordered progressive command ledger. A custom XI without a catalog owner is
  stored as `not_observed`; no caller defaults to `4-4-2`.
- durable shot events carry resolver-owned `expectedGoals`. One shared chapter
  derivation accepts live or durable events, reconciles shots/goals/xG and
  deduplicates the shot copy emitted beside a canonical penalty outcome.
- SQLite stores the raw facts relationally and reloads them exactly. A real
  SQLite save/load test covers an exact formation, honest absence, lateral
  focus, xG and a tactic command together.
- schema versions advanced once: match event `9`, career state `3`, SQLite
  `24`, career envelope `15`. Older beta saves are rejected/reset; no migration,
  dual reader or compatibility default was introduced.
- formation history remains data only. No AI selection reader, match-strength
  multiplier or third tactical candidate was added.

## Verification

- focused engine/caller suites: `159` tests passed;
- storage and real SQLite round-trip suites: `38` tests passed;
- `pnpm check`: `317` files / `2544` tests, typecheck and all custom checks
  green;
- web production build: green (`2537` modules transformed);
- `pnpm web:visual:qa`: `38/38` passed in `7.2m`, including the OPFS beta reset,
  future-schema preservation, current-schema round-trip and atomic rollback;
- `git diff --check`: green; `graphify update .`: green (`24809` nodes,
  `47407` edges).

## Next Action

Step 14B is active and product-blocked. Do not open Step 15 until the owner
chooses the post-match preparation boundary recorded there.

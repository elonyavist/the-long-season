# Step 02 - Dynamic Club Tier, Reputation And Season Freeze

## Status

Done.

## Goal

Replace generation-only club-number tiers with one durable, deterministic
competitive tier and gradually changing reputation recalculated at season
rollover.

## Accepted Semantics

- Per 18-club division: ranks `1..4` title contender, `5..8` playoff,
  `9..14` mid-table, `15..18` survival.
- Tier score is approximately `70%` current roster strength and `30%`
  just-completed sporting result, with explicit promotion/relegation/title
  correction.
- Stable club ID breaks exact ties.
- Tier is frozen for the full next season.
- Current reputation is the only historical memory.
- Reputation moves toward its new target by at most `2` points per rollover.
- No reputation-history collection is stored.

## Frozen Ranking And Reputation Policy

The exact v1 policy is fixed here before post-change output exists:

- For each club, calculate primary-role current ability using the canonical
  role profile. Build a balanced XI with `1/4/4/2` goalkeeper/defender/
  midfielder/attacker quotas, filling a genuine department shortage from the
  best remaining player. Stable player ID breaks ability ties.
- The useful bench contains the best reserve goalkeeper when one exists, then
  the best remaining players, up to the existing eight substitute slots. Each
  XI player has weight `1`; each useful-bench player has weight `0.5`. Raw
  roster strength is the weighted mean, so a complete XI plus eight-player
  bench contributes approximately `73% / 27%`.
- Within each new division, min-max normalize raw roster strength to integer
  basis points `0..10,000`. When every raw score is equal, all clubs receive
  neutral `5,000`; club ID is still only the final ranking tie-break.
- Map each completed position to the fixed national-pyramid coordinate
  `previousDivisionIndex * 18 + (finalPosition - 1)`, with First/Second/Third
  indices `0/1/2`. Invert and min-max normalize those coordinates among clubs
  now sharing the new division. This makes champion, promotion, and relegation
  corrections structural rather than arbitrary bonuses. Equal coordinates are
  neutral `5,000`.
- A report-only refresh may provide incomplete competition evidence. Never mix
  observed and invented results inside one division: recalculate only a
  division with complete rows; otherwise carry its tiers and reputation
  forward under the new season stamp and emit explicit carry-forward facts.
- The final ranking score is exactly
  `7 * normalizedRosterBp + 3 * correctedResultBp`. Sort descending, then by
  stable club ID ascending. Apply the fixed `4/4/6/4` rank buckets.
- Reputation uses tier anchors `0 / 3,333 / 6,667 / 10,000` for survival,
  mid-table, playoff, and title contender. Its target signal is exactly
  `70% tier anchor + 30% corrected result`. Project that signal into the
  existing inclusive category bands—Third `4..9`, Second `9..14`, First
  `14..19`—using nearest-integer rounding. Move current reputation toward the
  target by at most `2` and retain no earlier value.
- The frozen state is stamped `club-competitive-tier-v1` and the active season
  ID. These constants may be reopened only in this owning step, never tuned by
  a later long run.

## What To Implement

- Add canonical domain types/state for current competitive tier and its season.
- Derive roster strength from canonical best-XI plus useful bench facts.
- Derive and normalize the completed-result component.
- Recalculate tier after promotion/relegation resolves.
- Update reputation with the bounded convergence rule.
- Route generation, finance, market, and later environment consumers away from
  club-number tier inference where a career tier exists.
- Persist/round-trip the new compatible state.
- Bump the owning beta save version and delete incompatible saves rather than
  migrate them.

## What NOT To Implement

- No environment multiplier, player growth, prospect tuning, public
  projection, valuation, or UI.
- No historical reputation rows, moving averages, or hidden prestige history.
- No five-country policy.

## Expected Files

- `packages/domain/src/entities/club.entity.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/career/club-competitive-tier.ts`
- `packages/domain/src/career/index.ts`
- `packages/content/src/generators/player-generation-bands.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/career/player-season-rollover.ts`
- `packages/engine/src/career/player-season-rollover.test.ts`
- `packages/engine/src/career/promotion-relegation.ts`
- `packages/engine/src/career/promotion-relegation.test.ts`
- `packages/engine/src/career/club-season-tier.ts`
- `packages/engine/src/career/club-season-tier.test.ts`
- `packages/engine/src/career/fresh-career-state.ts`
- `packages/engine/src/career/career-market-catalog.test.ts`
- `packages/engine/src/career/contract-negotiation-demand.test.ts`
- `packages/engine/src/index.ts`
- `packages/storage/src/sqlite/career-state-mapper.ts`
- `packages/storage/src/sqlite/career-state-mapper.test.ts`
- `packages/storage/src/save-metadata.ts`
- `packages/storage/src/career-save-envelope.ts`
- `packages/storage/src/index.ts`
- `packages/storage/src/career-storage.contract.ts`
- `packages/storage/src/career-storage.contract.test.ts`
- `packages/storage/src/career-storage.test.ts`
- `packages/storage/src/testing/persistable-career-fixture.ts`
- `packages/storage/src/json-career-storage.test.ts`
- `packages/storage/src/sqlite/sqlite-career-schema.ts`
- `packages/storage/src/sqlite/sqlite-career-migrations.ts`
- `packages/storage/src/sqlite/sqlite-career-storage.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.test.ts`
- `packages/storage/src/sqlite/world-state-mapper.ts`
- `apps/cli/src/commands/career/scenarios.ts`
- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/state/career-state.test.ts \
  packages/engine/src/career/club-season-tier.test.ts \
  packages/engine/src/career/promotion-relegation.test.ts \
  packages/engine/src/career/player-season-rollover.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  packages/storage/src/sqlite/career-state-mapper.test.ts \
  packages/storage/src/career-storage.contract.test.ts \
  packages/storage/src/career-storage.test.ts \
  packages/storage/src/json-career-storage.test.ts \
  packages/storage/src/sqlite/sqlite-career-storage.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Every active club has exactly one current tier for the active season.
- `4/4/6/4`, tie-break, promotion/relegation ordering, and season freeze pass.
- Reputation changes by at most two and no historical collection exists.
- Incompatible beta saves are deleted without compatibility debris.
- Step 03 is the only next action.

# Season Assists And Saves Summary

## Goal

Add minimal season-level assist and goalkeeper save summaries after match-level data is complete.

## Why we implement it this way

The CLI already prints a top scorer. After durable assists, saves, shooter attribution, and complete match stats exist, the next useful season-level summary is small: top assist provider and top goalkeeper by saves. This gives the user a broader reason to care about the richer event data without building UI or long-term player memory.

This step should aggregate from durable match reports or report-derived helper output. It should not calculate from rendered CLI text, fixture scores, or duplicated CLI-only parsing.

## What to implement

- Add deterministic season-level aggregation for:
  - assists;
  - goalkeeper saves.
- Decide whether to extend the existing season player-stat helper or add a new narrow helper; document the adopted solution.
- Include registered fixed-lineup players with zero assists/saves only if doing so matches the existing season stat approach without bloating output.
- Add CLI summary lines, for example:
  - `Top assist: Player04 No06 (PRO04) - 2 assists`
  - `Top goalkeeper saves: Player04 No01 (PRO04) - 5 saves`
- Preserve existing top scorer output.
- Sort ties deterministically by stable player ID after meaningful totals.

## What NOT to implement

- Do not add league-wide full stat tables unless this step proves a compact top-line summary is insufficient.
- Do not add ratings, awards, player history pages, save memory, UI, storage browsing, localization, or commentary prose.
- Do not add cards, injuries, substitutions, minutes, fatigue, xG, possession, passes, tackles, fouls, contracts, growth, market value, or management systems.
- Do not change match simulation, event attribution, scoring, calibration, fake content, or fixture generation.

## Allowed dependencies

- `packages/engine -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`

## Expected files

- `packages/engine/src/season-engine/player-stats.ts`
- `packages/engine/src/season-engine/player-stats.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts` only if season result shape changes.
- `packages/engine/src/use-cases/simulate-season.test.ts` only if season result shape changes.
- `packages/engine/src/index.ts` only if a new public helper must be exported.
- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- Focused Vitest tests for touched engine/CLI files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Season output includes deterministic top assist and top goalkeeper-save summaries.
- Aggregation reads durable match data or engine-derived helpers, not rendered text.
- Existing top scorer, table, fixture detail, and balance behavior remain stable.
- No UI, storage browsing, ratings, awards system, or management system is added.
- Phase 06 can stop with a complete CLI inspection/stat proof before the next phase is designed.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only minimal season assist and goalkeeper-save summaries from durable match data. Do not add UI, storage, ratings, awards, new match mechanics, or calibration changes. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.

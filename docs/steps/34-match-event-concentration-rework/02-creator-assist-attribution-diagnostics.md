# Step 02 - Creator Assist Attribution Diagnostics

## Goal

Add diagnostics that separate creator concentration from assist concentration and scorer concentration.

## Context

Current long-run gates already detect `top_creator_goal_share_max`, `top_three_creator_goal_share_max`, and `top_assist_max`, but the report is not yet detailed enough to explain why a world fails.

Before reworking engine behavior, diagnostics must show whether the issue is:

- one creator being selected too often;
- the same creator also receiving too many assists;
- a single scorer creating apparent creator concentration;
- chance types over-favoring one role;
- team lineup shape concentrating all creativity into one slot.

## Expected files

- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `apps/cli/src/**/*.ts`
- `apps/cli/src/**/*.test.ts`
- `packages/i18n/src/**/*.ts`
- `packages/i18n/src/**/*.test.ts`
- `docs/audits/MATCH_EVENT_CONCENTRATION_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Extend long-run diagnostic output with a compact per-failing-world concentration snapshot.
- Include, where available:
  - world seed;
  - season number;
  - club;
  - top creator player;
  - top creator goal share;
  - top three creator goal share;
  - top assist player and count;
  - top scorer player and goals;
  - total team goals;
  - chance creator role/slot if available from current data.
- Keep diagnostics structured and deterministic.
- Keep user-facing labels localized.
- Update tests for the new diagnostic fields.

## What NOT to implement

- Do not change match-event attribution.
- Do not change long-run thresholds.
- Do not add verbose per-match dumps to normal output.
- Do not expose hidden player potential.
- Do not add UI.

## Required checks

- `pnpm --filter @game/simulation-tools run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused tests for touched simulation-tools/CLI/i18n files
- `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The failure can be read from CLI/report output without manually inspecting raw fixtures.
- The diagnostics distinguish creator, assist, scorer, and team-goal concentration.
- No engine behavior is changed yet unless Step 01 proved that diagnostics alone require a tiny data-surface addition.

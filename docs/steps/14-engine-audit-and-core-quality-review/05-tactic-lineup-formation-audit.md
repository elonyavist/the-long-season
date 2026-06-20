# Tactic Lineup Formation Audit

## Goal

Audit the manager-facing core around selected tactics, selected lineups, manual tactical changes, manual lineup rotation, formation catalog, and squad-fit facts.

## Why we implement it this way

The user has been clear: the manager chooses who plays, which tactic to use, and how to interpret squad fit. The system should show factual fit, natural/adapted/weak coverage, and deterministic consequences. It should not prescribe market actions or automatically choose tactical changes.

## What to implement

- Add or update the `5. Tactic Lineup Formation Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`.
- Review:
  - selected lineup domain contracts;
  - tactic setup contracts;
  - saved demo tactic profiles;
  - manual tactic switch contract;
  - manual lineup override contract;
  - formation catalog;
  - position suitability;
  - squad depth;
  - formation squad-fit report;
  - CLI inspection paths for setup, manual switch, lineup, condition, and formation fit.
- Check that manager choice remains explicit:
  - no automatic lineup selection;
  - no automatic rotation;
  - no automatic tactic switch by score/minute;
  - no market instruction or hidden recommendation.
- Check whether formation catalog coverage is broad enough for common major-league shapes.
- Check whether factual fit notes remain localized and non-prescriptive.

## What NOT to implement

- Do not add automatic best-XI selection.
- Do not add transfer advice, market commands, or squad-needs recommendations.
- Do not add tactical AI or automatic in-match changes.
- Do not add UI.
- Do not change formation effects or match engine balance.

## Allowed dependencies

- No new dependencies.
- Documentation-only output is expected.

## Expected files

- `docs/audits/ENGINE_CORE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run packages/domain/src/tactics packages/domain/src/squad packages/engine/src/squad apps/cli/src/commands/simulate-season.test.ts`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`
- `rg -n "market|need|recommend|auto-select|automatic|best XI|best-XI" packages apps docs/steps/12-squad-selection-and-formation-core docs/steps/13-localization-foundation`

## Definition of Done

- The audit report states whether the manager-choice boundary is respected.
- Any prescriptive wording or automatic behavior is recorded as a finding.
- Any missing formation/squad-shape coverage is recorded as a future product question or rework step.
- `docs/PROJECT_STATUS.md` records the step result and next action.

## Claude Code task prompt

Read the required project docs and this step. Audit tactics, lineups, formation catalog, and squad-fit output against the manager-choice principle, run the listed checks, update the `5. Tactic Lineup Formation Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`, update `docs/PROJECT_STATUS.md`, and stop after this step.

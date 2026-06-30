# 11 - Section Quality Review And Phase Report

## Goal

Close Phase 66 only after checking engine correctness, UI quality, user fun,
accessibility, package boundaries, and the next phase decision.

## Scope

Write a final report covering:

- what changed in the engine;
- how staged match progression works;
- how half-time decisions work;
- how player ratings are derived and what they intentionally do not cover yet;
- how the web match centre differs from the Phase 65 log/report screen;
- how Continue/dashboard/Inbox routing changed;
- which files are key entry points for a junior developer;
- Playwright screenshot findings;
- residual risks;
- whether the next phase should now be web persistence or another matchday
  quality pass.

Also update:

- architecture docs;
- playability roadmap;
- web-section roadmap;
- project status.

## Expected files

- `docs/audits/INTERACTIVE_MATCHDAY_FLOW_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not start the next phase.
- Do not add new source behavior.
- Do not claim persistence exists.
- Do not hide UX problems.
- Do not mark the phase complete if Playwright or `pnpm check` is blocked.
- Do not claim extra time or penalties are playable unless they actually are.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/staged-match-progression.test.ts
pnpm exec vitest run packages/engine/src/match-engine/player-match-rating.test.ts
pnpm exec vitest run packages/engine/src/match-engine/half-time-substitutions.test.ts
pnpm exec vitest run packages/ui/src/career/career-matchday-phase-view.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/web run test
node --experimental-strip-types apps/web/src/visual-qa/interactive-matchday-flow.spec.ts
pnpm check
git diff --check
graphify update .
```

## Done when

- Final report exists and is honest about quality, fun value, residual risks,
  and the next phase.
- Architecture docs identify the staged matchday engine and web entry points.
- Roadmaps reflect the new Phase 66 decision and recommended next step.
- `docs/PROJECT_STATUS.md` marks Phase 66 complete or blocked with concrete
  verification output.

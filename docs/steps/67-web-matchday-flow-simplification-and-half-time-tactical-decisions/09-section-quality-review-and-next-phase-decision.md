# 09 - Section Quality Review And Next Phase Decision

## Goal

Close Phase 67 only after checking flow quality, accessibility, package
boundaries, and whether persistence is now safe to start.

## Scope

Write a final report covering:

- baseline click flow vs final click flow;
- which buttons/actions were removed, renamed, or made contextual;
- how shell modes work;
- how dashboard primary action selection works;
- how "Save and go to match" works;
- how pre-match and full-time actions work;
- how half-time tactical decisions work;
- key entry points for a junior developer;
- Playwright screenshot findings;
- residual UX risks;
- whether the next phase should be web persistence or another matchday quality
  pass.

Also update:

- architecture docs;
- playability roadmap;
- web-section roadmap;
- project status.

## Expected files

- `docs/audits/MATCHDAY_FLOW_SIMPLIFICATION_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not start the next phase.
- Do not add persistence.
- Do not hide unresolved UX problems.
- Do not claim live replay exists.
- Do not mark the phase complete if Playwright or `pnpm check` is blocked.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-shell-view.test.ts
pnpm exec vitest run packages/ui/src/career/build-career-dashboard-view.test.ts
pnpm exec vitest run packages/ui/src/career/career-matchday-phase-view.test.ts
pnpm exec vitest run packages/domain/src/match/half-time-tactical-decision.test.ts
pnpm exec vitest run packages/engine/src/match-engine/half-time-substitutions.test.ts
pnpm exec vitest run packages/engine/src/match-engine/staged-match-progression.test.ts
pnpm exec vitest run apps/web/src/features/dashboard/CareerDashboardScreen.test.tsx
pnpm exec vitest run apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/web run test
node --experimental-strip-types apps/web/src/visual-qa/matchday-flow-simplification.spec.ts
pnpm check
git diff --check
graphify update .
```

## Done when

- Final report exists and is honest about flow quality, residual risks, and the
  next phase.
- Architecture docs identify the shell, dashboard, preparation, matchday, and
  half-time tactical-decision entry points.
- Roadmaps reflect the Phase 67 decision and next recommendation.
- `docs/PROJECT_STATUS.md` marks Phase 67 complete or blocked with concrete
  verification output.

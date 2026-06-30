# 07 - Section Quality Review And Phase Report

## Goal

Close Phase 65 only after checking code quality, section completeness,
dependencies, user experience, and the next phase decision.

## Scope

Write a final report covering:

- what became playable in the web app;
- how the app reaches matchday;
- how the match is played through real engine facts;
- which result/consequence facts are visible;
- how dashboard and Inbox/Posta change after play;
- which files are the key entry points for a junior developer;
- which roadmap rows were updated;
- residual risks, especially in-memory-only demo state;
- exact next-phase recommendation.

The likely next phase is `Phase 66 - Web Career Persistence And Save Adapter`
unless Phase 65 exposes a more urgent blocker.

## Expected files

- `docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not start Phase 66.
- Do not add new source behavior.
- Do not hide known UX problems.
- Do not claim persistence exists if the flow is still in-memory.
- Do not leave the phase marked complete if Playwright or `pnpm check` is
  blocked.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-matchday-view.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.tsx
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/web run test
node --experimental-strip-types apps/web/src/visual-qa/matchday-playable-slice.spec.ts
pnpm check
git diff --check
graphify update .
```

## Done when

- Final report exists and is honest about quality, fun value, residual risks,
  and the next phase.
- `docs/ARCHITECTURE.md` documents the matchday screen/adapters/read-model
  entry points.
- Roadmaps reflect completed Phase 65 facts and the recommended next step.
- `docs/PROJECT_STATUS.md` marks Phase 65 complete or blocked with concrete
  verification output.

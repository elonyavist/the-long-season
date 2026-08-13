# Step 13 - Tactical Chapters And Canonical Explanation

## Status

Blocked. Amendment A10 retains product option B's meaningful point floor and
freezes a route/task-quality redesign after Step 12F removed the weak generic
volume link. Step 12H must pass both fresh G/H sets before this step opens. The
previously planned implementation scope is retained below for review, not
authorized execution.

## Goal

Explain what happened before and after each tactical decision using the same
facts consumed by the match, not a parallel explanation model.

## What To Implement

Segment the match from `AppliedLiveMatchCommandFact`: initial plan, manager
change, AI response, and final phase. Each chapter owns minute interval,
decision, routes attempted/succeeded, chance volume/quality, control, connected
cost, and relevant physical state.

Derive chapter intervals, aggregates and localized explanation for the current
session from `AppliedLiveMatchCommandFact` and canonical route/opportunity facts.
Do not copy chapter totals beside the facts that derive them. Reconcile derived
chapter totals with match totals. A command at minute N never rewrites earlier
facts. Step 14 adds the raw command boundaries to `MatchReport` and owns the one
durable persistence integration and reset.

Do not change storage schemas, envelope versions, or beta compatibility here.
Prove the same pre-phase career accepted by Step 10 still loads.

## Expected Files

- `packages/domain/src/match/match-consequence.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/match-engine/match-explanation-trace.ts`
- `packages/engine/src/match-engine/match-explanation-trace.test.ts`
- `packages/ui/src/career/tactical-consequence-view.ts`
- `packages/ui/src/career/tactical-consequence-view.test.ts`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.test.tsx`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `14-post-match-preparation-choice.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/match-explanation-trace.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

Chapters reconcile, derive from canonical facts, contain no rendered prose,
remain temporally local, pass visual/accessibility QA, leave persistence
unchanged for Step 14, keep the pre-phase career loadable, and Step 14 is next.

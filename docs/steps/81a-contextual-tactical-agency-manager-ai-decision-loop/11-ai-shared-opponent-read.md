# Step 11 - AI Shared Opponent Read

## Status

Not started; requires Step 10 Done.

## Goal

Let AI make explainable correct, wrong, or non-committal tactical choices from
the same evidence and latency available to the manager.

## What To Implement

- Preserve formation chosen from the AI squad.
- Before Step 14, consume the same five-component profile as the manager and
  keep `formation_history: not_observed`; the AI may not substitute its current
  opponent formation or internal simulation state.
- Evaluate a bounded deterministic set of tactical plans through the canonical
  minute-plan Module and Step 10 `OpponentRead`.
- Make fallibility come from confidence, risk profile, and a declared regret
  margin; use only stable derived RNG for ties/shortlists.
- Persist evidence read, reason key, expected benefit, and exposure as structured
  decision facts.
- Deepen live AI diagnosis beyond minute/score: blocked route, exposed side,
  ineffective/exhausted press, protect-control, or chase-risk.
- Apply commands through the same public Interface used by the manager.

## Expected Files

- `packages/engine/src/team-selection/tactical-plan-evaluation.ts`
- `packages/engine/src/team-selection/tactical-plan-evaluation.test.ts`
- `packages/engine/src/career/career-ai-team-selection.ts`
- `packages/engine/src/team-selection/shape-tactical-distribution.ts`
- `packages/engine/src/team-selection/shape-tactical-distribution.test.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.ts`
- `packages/engine/src/team-selection/ai-in-game-decisions.test.ts`
- `packages/engine/src/match-engine/progressive-match-session.ts`
- `packages/engine/src/match-engine/progressive-match-session.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `12-checkpoint-d-manager-ai-agency.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/team-selection/tactical-plan-evaluation.test.ts
pnpm exec vitest run packages/engine/src/team-selection/ai-in-game-decisions.test.ts
pnpm exec vitest run packages/engine/src/match-engine/progressive-match-session.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

Manager and AI inputs are structurally identical at the same instant, correct,
wrong, and non-commit branches are reachable on real data, decisions are
deterministic, the five-component D profile is explicit, AI formation remains
squad-owned, and Step 12 is next.

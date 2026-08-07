# Step 10 - Manager Opponent Read

## Status

Not started; requires Checkpoint C GO.

## Goal

Give the manager observable, canonical evidence from which a contextual
tactical choice can be made before the AI uses that evidence.

## What To Implement

- Add a language-agnostic `OpponentRead` Interface derived from Phase 81 facts
  already durable in past reports and from the current live session:
  formation distribution, route use/concession, pressing/risk, lateral
  preference/exposure, half-time changes, sample size, and confidence.
- Define the raw fielded-formation observation required for the final read, but
  do not add it to `MatchReport` yet. Before Step 14, historical formation is
  explicitly `not_observed` rather than reconstructed or defaulted; live
  formation may be read only from the current session. Step 14 adds the fact to
  `MatchReport` and durable storage together.
- Name the six read components explicitly: `formation_history`, `route_history`,
  `pressing_risk_history`, `lateral_history`, `half_time_change_history`, and
  `sample_confidence`. Checkpoint D consumes the latter five only and records
  `formation_history: not_observed`; this is a preregistered information set,
  not missing instrumentation.
- Pre-match reads use only previous observed matches. Live reads use only facts
  available through the same decision window.
- Surface evidence -> possible choice -> benefit -> exposure, never an optimal
  command.
- Handle zero/small/old samples explicitly.
- Do not change storage schemas, envelope versions, or beta compatibility here.
- Prove a pre-Phase-81A compatible career still loads unchanged; Step 10 may
  not consume the phase reset.

## Expected Files

- `packages/domain/src/match/opponent-read.ts`
- `packages/domain/src/match/opponent-read.test.ts`
- `packages/engine/src/career/opponent-read.ts`
- `packages/engine/src/career/opponent-read.test.ts`
- `packages/ui/src/career/career-match-preparation-view.ts`
- `packages/ui/src/career/career-match-preparation-view.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `11-ai-shared-opponent-read.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/opponent-read.test.ts
pnpm exec vitest run apps/web/src/features/match-preparation/match-preparation-adapter.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

The same reports and live facts reproduce the same read, no future or hidden fact
enters it, every AI input planned for Step 11 is already visible to the manager,
localized accessible UI works at desktop/narrow/reduced motion, persistence is
explicitly pending Step 14, the five-component D profile is total, a pre-phase
career still loads, and Step 11 is next.

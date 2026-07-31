# Step 01 - Reproducible Baseline And Calibration Contract

## Status

Not started.

## Goal

Freeze the pre-80A joint player/club/development/value baseline, metric
definitions, positive denominators, and acceptance thresholds before changing
behavior.

## What To Implement

- Reproduce the accepted 20-world age-17/upside finding on the current code.
- Record current:
  - club category/reputation/tier ownership;
  - monthly participation and development cadence;
  - stable hidden realization modifier;
  - public lower/expected/upper factors;
  - current/ceiling generation by age/category/tier/archetype;
  - annual academy intake/refill and exceptional allocation;
  - public-value and AI target inputs;
  - `marketContext` call sites, category/free-agent multipliers, per-context
    maximums, and Phase 79C division output tolerances;
  - the Phase 79D `302 / 100 worlds` stored-ceiling-six observation.
- Add structured diagnostic fields only where a required denominator or
  concept is currently missing.
- Separate stored ceiling, public P50, and public upper explicitly.
- Freeze category-share, exceptional-stock, non-widening, quarterly
  equivalence, cap-frequency, and AI-information thresholds before tuning.
- Declare the Phase 79C division-value tolerances and Phase 79D `302 / 100`
  stored-six observation historical and non-comparable to the new 80A epoch.
- Reuse the already documented real-market sources to freeze new global value
  curves and division population output bands before Step 08. Division remains
  a diagnostic grouping, not a public-value input.
- Record exact bounded reproduction commands and hashes in the Phase 80A
  baseline audit.

## What NOT To Implement

- No generation, development, projection, value, tier, reputation, AI, UI, or
  save behavior change.
- No threshold selected after inspecting post-change output.
- No `50 x 20`.

## Expected Files

- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `docs/audits/PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_BASELINE.md`
- `docs/audits/PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_DESIGN_CONTRACT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- Step 02 document only if the ownership audit changes its expected files

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
git diff --check
graphify update .
```

No long run belongs to this step.

## Definition Of Done

- Every later metric has a stable definition and positive denominator.
- Stored ceiling and public projection counts cannot be confused.
- Current context multipliers/maximums and behavior are recorded, superseded
  thresholds are named, and new source-backed thresholds are frozen before
  tuning.
- Step 02 has exact owners and no unresolved product decision.

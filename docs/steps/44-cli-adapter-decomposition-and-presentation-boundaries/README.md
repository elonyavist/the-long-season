# Phase 44 - CLI Adapter Decomposition And Presentation Boundaries

## Goal

Reduce the remaining CLI adapter complexity before any UI work.

Phase 43 confirmed that the package graph is healthy and that the largest
remaining readability risk is concentrated in CLI adapters and presentation
files. This phase starts with `apps/cli/src/commands/simulate-season.ts`, the
largest and hardest command file to trace.

The goal is not to change gameplay. The goal is to make current CLI behavior
easier to follow, test, and eventually map to UI-facing view models:

- the CLI command adapter should parse, compose, and dispatch;
- inspection builders should live behind named modules;
- rendering functions should live near the output family they render;
- reusable diagnostic meaning must stay in `@game/simulation-tools`;
- engine/content/storage dependencies must remain unchanged.

## Product intent

- User-visible output must remain stable unless a step explicitly documents a
  wording-only cleanup.
- The player experience and football credibility are not tuned in this phase.
- The future UI should benefit from clearer adapter and presentation seams, but
  no UI is implemented here.
- A junior developer should be able to open the CLI command and quickly find
  which module owns each inspection mode.

## Architecture intent

- Prefer deep CLI modules that hide one output family or inspection mode behind
  a small interface.
- Do not create pass-through wrappers. A moved module must own meaningful
  locality: formatting, building, or command-specific composition.
- Keep localized output in CLI/i18n layers.
- Keep gameplay rules in engine and generated data in content.
- Preserve deterministic output for every existing command smoke.

## Ordered steps

1. `01-cli-adapter-responsibility-audit.md`
2. `02-simulate-season-fixture-detail-module.md`
3. `03-simulate-season-demo-builders-module.md`
4. `04-simulate-season-inspection-renderers.md`
5. `05-simulate-season-summary-renderer.md`
6. `06-presentation-boundary-review.md`
7. `07-phase-report-and-next-phase-decision.md`

## Phase-level checks

- Focused tests for every touched CLI module.
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck` when localized output is touched.
- `pnpm check`
- `pnpm cli simulate-season --seed=world-a`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation`
- `pnpm cli simulate-season --seed=world-a --round=1`
- `pnpm cli simulate-season --seed=world-a --formation-fit=4-2-3-1`
- `pnpm cli simulate-season --seed=world-a --player-generation-report`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-a --market-demo=pro01-affordable-permanent`
- `pnpm cli simulate-season --seed=world-a --condition-demo=pro01-season`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000003 --lineup-demo=pro01-rotated`
- `pnpm cli simulate-season --seed=world-a --fixture=fixture:000003 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## What NOT to implement in this phase

- No gameplay behavior changes.
- No match engine tuning.
- No generated content tuning.
- No new CLI feature flags.
- No UI.
- No new package.
- No moving engine/content/storage logic into CLI.
- No moving CLI presentation text into engine/content/simulation-tools.
- No broad rewrite of `simulate-season.ts` in one step.
- No dead wrappers, compatibility aliases, or temporary duplicate renderers.

## Definition of Done

- `simulate-season.ts` is meaningfully smaller and easier to trace.
- Each extracted CLI module owns a clear output family or inspection mode.
- Existing CLI behavior and deterministic output remain stable.
- Localized output still passes the presentation-text guard.
- Remaining CLI hotspots are documented with concrete next-phase choices.
- `docs/PROJECT_STATUS.md` records verification and the recommended next phase.

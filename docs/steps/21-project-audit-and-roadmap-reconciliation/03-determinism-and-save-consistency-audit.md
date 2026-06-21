# 03 - Determinism And Save Consistency Audit

## Goal

Audit deterministic behavior and save consistency across season simulation, career creation, career inspection, transfers, identity generation, and world generation.

This step verifies that the project has one coherent model for seeds, RNG streams, generated worlds, and persisted career state.

## What to implement

- Review:
  - shared RNG and date utilities;
  - match and season seed usage;
  - generated world seed usage;
  - `CareerWorldMetadata`;
  - `CareerState`;
  - JSON save/load paths;
  - persistent transfer application;
  - standalone `simulate-season` identity paths;
  - career `--new-world-preview` and `--inspect` paths.
- Check same-seed reproducibility and different-seed variation.
- Check whether career saves preserve generated players, identities, budgets, and transfer results.
- Add determinism/save findings to `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change storage schema unless the audit finds an unavoidable blocker and the step is explicitly re-scoped.
- Do not add new save migrations.
- Do not add new career features.
- Do not change match or balance algorithms.
- Do not regenerate world data on every render or inspect command.

## Expected files

- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/21-project-audit-and-roadmap-reconciliation/04-product-loop-readiness-audit.md` only if a lesson learned changes the next audit step.

## Required checks

- `pnpm --filter @game/shared run typecheck`
- `pnpm --filter @game/storage run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-b --identity-review`
- `pnpm cli career --save=phase21-determinism-a --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase21-determinism-a --inspect`
- `pnpm cli career --save=phase21-determinism-b --seed=world-b --new-world-preview`
- `pnpm cli career --save=phase21-determinism-b --inspect`
- `git diff --check`

## Definition of Done

- The audit report states whether seed behavior is coherent enough for a playable career loop.
- The report identifies any save consistency risks before larger career systems.
- Same-seed and different-seed expectations are documented.
- `docs/PROJECT_STATUS.md` points to the next audit step.


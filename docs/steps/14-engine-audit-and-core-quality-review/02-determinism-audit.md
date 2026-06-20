# Determinism Audit

## Goal

Verify that the current engine and simulation paths remain deterministic by seed and avoid forbidden runtime sources of variability.

## Why we implement it this way

The game is deterministic and offline. A manager must be able to reproduce a season, fixture, lineup override, tactical switch, and balance report from the same seed and inputs. Market and youth features will rely on the same determinism guarantees.

## What to implement

- Add or update the `2. Determinism Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`.
- Review RNG usage:
  - seed derivation;
  - stream names;
  - fixture IDs;
  - manual tactic switch segmentation;
  - lineup override simulation;
  - player condition lifecycle;
  - fake content generation.
- Search for forbidden or suspicious runtime APIs:
  - `Math.random`
  - `Date`
  - timezone APIs
  - unordered object iteration where output order matters
  - filesystem or network reads in simulation packages.
- Verify repeatability of representative CLI commands.
- Record whether deterministic output is locked by tests or only smoke-checked.

## What NOT to implement

- Do not change RNG algorithms.
- Do not retune match rates or balance targets.
- Do not rewrite tests unless a blocker prevents the audit from running.
- Do not add new gameplay behavior.

## Allowed dependencies

- No new dependencies.
- Documentation-only output is expected.

## Expected files

- `docs/audits/ENGINE_CORE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm lint`
- `pnpm exec vitest run packages/shared/src packages/engine/src packages/content/src apps/cli/src`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `rg -n "Math\\.random|new Date\\(|Date\\.now|Intl\\.|toLocale" packages apps scripts`

## Definition of Done

- The audit report explains whether deterministic behavior is currently strong, weak, or partially covered.
- Any nondeterministic API use is classified as gameplay-affecting, presentation-only, test-only, or acceptable.
- Any missing golden/reproducibility test is recorded as a finding.
- `docs/PROJECT_STATUS.md` records the step result and next action.

## Claude Code task prompt

Read the required project docs and this step. Audit deterministic behavior and forbidden runtime API usage, run the listed checks, update the `2. Determinism Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`, update `docs/PROJECT_STATUS.md`, and stop after this step.

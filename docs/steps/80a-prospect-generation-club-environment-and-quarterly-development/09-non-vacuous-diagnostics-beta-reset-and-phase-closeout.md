# Step 09 - Non-Vacuous Diagnostics, Beta Reset And Phase Closeout

## Status

Not started.

## Entry Gate

- Steps 01-08 are Done.
- No production change remains pending.
- All thresholds were frozen before post-change bounded cohorts.

## Goal

Run bounded deterministic joint diagnostics, complete browser/repository
verification, delete incompatible beta saves, and hand control to Phase 80B
without running the deferred longitudinal cohort.

## What To Implement

- Run the accepted role/age/category/tier/archetype joint diagnostics with
  positive denominators.
- Verify current/P50/upper/stored-ceiling separation, non-widening uncertainty,
  prospect shares, exceptional stock, annual intake, quarterly equivalence,
  environment response, global value/cap eligibility, context invariance,
  division population output bands, exact zero free-agent fees, and AI
  information parity.
- Verify the established current-six and age-15-to-20 ceiling-six cohorts
  separately; do not compare their new `6..8` combined national stock with the
  historical Phase 79D `302 / 100 worlds` baseline.
- Prove category differences in public-value distributions arise from player
  population quality rather than any residual `marketContext`, multiplier, or
  per-context maximum.
- Classify every warning as healthy variance, monitor, threshold defect,
  missing diagnostic, or real behavior defect.
- Fix only Phase 80A-owned failures; do not weaken frozen thresholds.
- Delete incompatible CLI/browser beta saves and prove new compatible JSON and
  SQLite/OPFS round trips.
- Run full repository, build, browser, accessibility, diff, and Graphify gates.
- Write the Phase 80A report and update Phase 80B handoff.

## What NOT To Implement

- No incoming offer, listing, loan, staff, facilities, scouting, or new product
  feature.
- No hidden threshold relaxation, seed exception, or warning suppression.
- No `50 x 20`; it belongs only to the final Phase 80C step.

## Expected Files

- diagnostics/tests already owned by Steps 01-08 when fixing an owned failure
- `apps/web/src/visual-qa/current-product.spec.ts`
- beta save lifecycle/version owners from Steps 02/05
- `docs/audits/PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_REPORT.md`
- `docs/audits/README.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- Phase 80A README
- this step document
- Phase 80B README

## Required Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm depcruise
pnpm web:visual:qa
git diff --check
graphify update .
```

Run only the bounded diagnostic commands frozen in Step 01. Do not run the
Phase 80C `50 x 20`.

## Definition Of Done

- Every required metric has positive observations and correct concept names.
- Public value remains identical across owner/employment transitions while
  asking price and exact zero free-agent fee retain their separate semantics.
- Bounded diagnostics satisfy frozen thresholds without hiding warnings.
- New saves round-trip and incompatible beta saves are removed.
- Repository/browser/accessibility checks pass.
- Phase 80A report is complete.
- Phase 80B Step 01 is the only next action and no longitudinal cohort has run.

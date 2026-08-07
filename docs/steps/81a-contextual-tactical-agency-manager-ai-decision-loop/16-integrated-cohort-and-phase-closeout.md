# Step 16 - Integrated Cohort And Phase Closeout

## Status

Not started; requires Checkpoint E GO.

## Goal

Run final acceptance on unseen seeds, close Phase 81A truthfully, and hand the
project to Phase 81B.

This checkpoint certifies contextual tactical agency; it is not expanded into
the `750 x 10` world-integrity run. Complete league tables and player charts
first exist after Phase 81B's background fixtures, so Phase 81B Step 07 owns
that larger cohort and its diagnostic view.

## Populations

- complete uniform strategic-signature matrix;
- equal-quality squads with different attributes;
- generated career worlds;
- informed, blind, and exposed manager policies;
- pre-match and live AI;
- mirrored lateral scenarios;
- post-match preparation mini-seasons;
- save/load replay.

Freeze sample size, seeds, exactly `7` workers, throughput, and wall clock before
execution. Acceptance seeds were never used for coefficients or gates. The
report must fail closed if its effective worker count is not seven.

## Final Gates

- exact conservation;
- catalog-order invariance and relative squad-identity targets;
- original `no_dominant_composition`, `no_dominant_tactic`, and
  `no_dominant_formation` readers at `0.55`;
- analytic full-space `R / N_eff >= 0.25` and ubiquity multiple `<= 4`;
- structural `+0.045/-0.045/0`;
- five-component D baseline and full six-component manager
  `+0.045/-0.045/0`, reported separately;
- formation-history ablation remains reachable, adds at least `+0.015` in its
  stable sufficient-history clusters, and stays ignored within `0.015` when
  history is volatile or insufficient;
- player-driven reversals and lateral mirroring;
- low-block xG `>= 8%` and ratio `<= 2.0`;
- AI/manager information parity and no fixed-formation exploit;
- chapter reconciliation and save/load identity;
- exactly one Phase 81A beta reset, owned by Step 14, with its post-reset career
  still loadable at F;
- contextual post-match preparation;
- determinism, localization, accessibility, package, and regression gates.

## Expected Files

- `docs/audits/PHASE_81A_INTEGRATED_COHORT.md`
- `docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_REPORT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/README.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this phase README
- this step document
- `../81b-season-anchored-contracts-free-agent-economy-and-background-fixtures/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `apps/cli/src/commands/tactical-agency-report.ts`

## Required Checks

Run the cohort alone, then each repository/browser gate alone:

```bash
nvm use 24
pnpm cli tactical-agency-report --checkpoint=f --workers=7
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Decision

- **GO:** close Phase 81A and activate Phase 81B.
- **REFINE:** reopen the local owner and its preceding checkpoint, then repeat F.
- **STOP / RETHINK:** record systemic materiality/non-dominance failure; do not
  relax thresholds or activate Phase 81B.

## Definition Of Done

All gates have positive denominators and pass on preregistered unseen seeds,
reports record limitations and residual owners, no stale phase references or
dead code remain, status stays under 300 lines, and Phase 81B Step 01 is the only
next action.

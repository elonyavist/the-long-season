# Step 01 - Lock Player Workspace Product And Design Contract

## Status

Done.

## Goal

Translate the reviewed Squad/Market screenshots and the user's seven product
decisions into one durable phase contract and one shared design system before
production code changes.

This step is documentation-only.

## Expected Files

- `design.md`
- `.hallmark/preflight.json`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/README.md`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/01-lock-player-workspace-product-and-design-contract.md`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/02-durable-player-career-statistics-archive.md`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/03-public-half-star-assessment-and-shared-rating-view.md`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/04-squad-lineup-select-swap-and-action-menu.md`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/05-squad-player-profile-tabs-and-role-aware-attributes.md`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/06-market-player-profile-exact-attributes-statistics-and-offer.md`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/07-responsive-accessibility-visual-qa-and-phase-report.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`
- `docs/steps/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Implementation Checklist

- Record the seven confirmed decisions without inventing a scouting system.
- Lock the exact reliable career-stat facts and explicit coverage semantics.
- Lock the selected-club-relative half-star model plus absolute elite marker.
- Define automatic lineup-swap behavior for every source/destination pairing.
- Define role-aware attribute groups and natural/adapted detail visibility.
- Define the two three-tab player workspaces and form-state preservation.
- Capture the current tokens, type pairing, Workbench macrostructure,
  interaction states, responsive targets, and reduced-motion policy in
  `design.md`.
- Pause Phase 79 Step 14 explicitly without changing its gate.

## What NOT To Implement

- Do not modify production code, tests, dependencies, runtime behavior, or CSS.
- Do not run a simulation cohort or browser build.
- Do not add product behavior not resolved by the user.

## Required Checks

```bash
test -f design.md
test -f docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/README.md
git diff --check
```

## Definition Of Done

- One active phase/step is recorded.
- Every later step has exact owned files, checks, and exclusions.
- The design system extends the accepted visual identity rather than replacing
  it.
- Phase 79 Step 14 remains Reopened, paused, and unclaimed.

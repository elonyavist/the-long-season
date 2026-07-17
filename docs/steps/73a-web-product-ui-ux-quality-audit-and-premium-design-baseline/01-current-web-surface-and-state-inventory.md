# Step 01 - Current Web Surface And State Inventory

## Status

Ready.

## Goal

Create one authoritative inventory of every currently reachable browser
surface, meaningful state, route, command, and presentation owner before
judging or changing the product.

## Scope

- Trace the production entry from `main.tsx` through app state, routing, shell,
  runtime, session, and feature screens.
- Inventory app entry, Dashboard, Posta, match preparation, tactical board,
  matchday phases, shared dialogs, save controls, command feedback, and the
  compact Posta rail.
- For each surface record:
  - route or state transition that reveals it;
  - deterministic fixture/save prerequisites;
  - meaningful empty, loading, disabled, error, ready, and completed states;
  - primary and secondary actions;
  - presentation/view-model owner;
  - source component and CSS ownership;
  - existing unit, integration, and visual QA coverage.
- Record disabled future navigation separately from implemented destinations.
- Identify unreachable current branches, duplicate routes, legacy visual QA,
  and ambiguous ownership as investigation candidates only.
- Define the deterministic browser fixture matrix used by all later steps.

## Expected files

- `docs/audits/WEB_PRODUCT_SURFACE_AND_STATE_INVENTORY.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/02-critical-journey-and-action-economy-audit.md` only if the inventory changes its assumptions.

## Required evidence

- Source and Graphify trace for every production surface.
- Table of routes/states, prerequisites, commands, owners, and tests.
- Current source-size and stylesheet-ownership measurements used only as audit
  signals.
- One deterministic fixture/save recipe for each primary surface.
- Explicit list of screens or states that are future scope rather than defects.

## What NOT to implement

- No production or test source changes.
- No CSS, component, routing, copy, or localization fixes.
- No deletion based on apparent reachability until production callers and
  tests have been traced.
- No quality score before the inventory is complete.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_PRODUCT_SURFACE_AND_STATE_INVENTORY.md
git diff --check
```

## Manual inspection

- Can a new developer find every current web surface from this inventory?
- Does every recorded state have a reproducible path?
- Are future disabled sections clearly separated from current product defects?

## Completion criteria

- Every current production surface and meaningful state is listed once.
- Every surface has a current owner and reproducible fixture.
- Existing test and visual evidence coverage is mapped without assuming it is
  sufficient.
- `docs/PROJECT_STATUS.md` marks Step 01 Done and Step 02 active.

# Step 06 - Frontend Presentation Architecture And CSS Maintainability Audit

## Status

Pending.

## Goal

Assess whether current React, Zustand, presenter, shared UI, stylesheet, and
visual-QA ownership can sustain a consistent premium interface that a junior
developer can trace and extend safely.

## Scope

- Trace application entry, shell routing, command runner, Zustand ownership,
  runtime/session boundaries, presenters, feature screens, shared UI, and
  tactical-board ownership.
- Measure large files, render branches, prop surfaces, repeated markup,
  conditional state complexity, selector breadth, specificity, hardcoded
  values, stylesheet coupling, and unused or superseded visual QA.
- Identify where Tailwind utilities, semantic CSS classes, tokens, or local
  component styles currently own presentation and whether that ownership is
  understandable.
- Trace every suspected dead component, selector, helper, screen branch, or
  compatibility path to production callers and tests before classifying it.
- Evaluate whether screen files separate orchestration, view-model mapping, and
  presentational composition enough for safe visual iteration.
- Identify justified reusable primitives based on current repeated behavior;
  do not invent abstractions for future sections.
- Record a bounded migration order for any P0/P1 maintainability finding,
  including deletion targets and regression coverage.
- Confirm package dependency boundaries and localization ownership remain
  appropriate.

## Expected files

- `docs/audits/WEB_FRONTEND_PRESENTATION_ARCHITECTURE_AND_CSS_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/07-playwright-visual-baseline-and-pixel-perfect-scorecard.md` only if the architecture audit changes its assumptions.

## Required evidence

- Graphify/source ownership map from route to presenter to component to style.
- File-size and selector metrics interpreted as signals, not verdicts.
- Confirmed duplicate, coupled, unreachable, or unclear paths with callers.
- Existing test/visual-QA coverage for each proposed remediation boundary.
- Junior-developer trace walkthrough for app entry, Dashboard, Posta,
  preparation, and matchday.

## What NOT to implement

- No component extraction, file split, CSS move, selector deletion, or test
  cleanup.
- No architecture score based only on lines of code.
- No new folder taxonomy, design-system package, generic component layer, or
  state abstraction without current repeated callers.
- No dependency change.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_FRONTEND_PRESENTATION_ARCHITECTURE_AND_CSS_AUDIT.md
pnpm depcruise
git diff --check
```

## Manual inspection

- Can a junior developer follow each primary screen from route to data to UI?
- Is visual ownership local enough to change one component without unexpected
  cross-screen drift?
- Are proposed abstractions justified by current duplication and behavior?

## Completion criteria

- Presentation ownership is mapped across current product surfaces.
- Maintainability findings have caller and coupling evidence.
- Suspected dead code is distinguished from tested compatibility or active
  production code.
- Any proposed migration is incremental, bounded, and regression-aware.
- `docs/PROJECT_STATUS.md` marks Step 06 Done and Step 07 active.

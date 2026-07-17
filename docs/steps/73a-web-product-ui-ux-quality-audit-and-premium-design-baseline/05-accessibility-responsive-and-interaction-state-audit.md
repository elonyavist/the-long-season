# Step 05 - Accessibility, Responsive, And Interaction State Audit

## Status

Pending.

## Goal

Prove whether current primary browser journeys remain understandable and
operable across supported viewports, keyboard input, text zoom, reduced motion,
and asynchronous command states.

## Scope

- Run the existing application with deterministic fixtures at `1440x900`,
  `1920x1080`, and `390x844`.
- Inspect keyboard order, focus visibility, focus restoration, skip/landmark
  behavior, dialog containment, context-menu dismissal, and route-change focus.
- Inspect accessible names, semantic landmarks, headings, tables/lists,
  selected/current state, live regions, and non-color status communication.
- Inspect `200%` text zoom and narrow layouts for horizontal overflow, clipping,
  overlap, unreachable controls, broken sticky regions, and excessive vertical
  cost.
- Review pointer and touch targets, hover-only behavior, context menus, long
  press, and dismissal paths where currently supported.
- Review loading, disabled, optimistic, success, error, empty, dirty-session,
  save, recovery, and date-transition feedback.
- Verify reduced-motion behavior for calendar transition and any other current
  animation.
- Separate WCAG violations, usability risks, and desktop-first enhancement
  opportunities.

## Expected files

- `docs/audits/WEB_ACCESSIBILITY_RESPONSIVE_AND_INTERACTION_STATE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/06-frontend-presentation-architecture-and-css-maintainability-audit.md` only if the audit changes its assumptions.

## Required evidence

- Desktop, wide, and narrow screenshot paths for every primary surface.
- Keyboard walkthrough results for every primary journey.
- Focus, zoom, reduced-motion, loading, empty, error, and dialog findings.
- Overflow measurements and first failing viewport where applicable.
- WCAG criterion or explicit usability principle for every accessibility P0/P1.

## What NOT to implement

- No CSS, markup, ARIA, focus, animation, or command-feedback fixes.
- No narrowing of the WCAG 2.2 AA target to make findings disappear.
- No mobile feature redesign beyond the current narrow non-breaking contract.
- No automated accessibility result treated as sufficient without keyboard and
  visual inspection.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_ACCESSIBILITY_RESPONSIVE_AND_INTERACTION_STATE_AUDIT.md
pnpm --filter @game/web run typecheck
git diff --check
```

## Manual inspection

- Can all primary journeys be completed without a pointer?
- Does `200%` text zoom preserve essential information and actions?
- Are loading and disabled states distinguishable from a frozen interface?

## Completion criteria

- All primary surfaces have responsive and interaction-state evidence.
- Keyboard, focus, zoom, reduced motion, and overflow are explicitly assessed.
- Accessibility defects and broader usability risks are not conflated.
- Every P0/P1 includes reproduction, user impact, and ownership.
- `docs/PROJECT_STATUS.md` marks Step 05 Done and Step 06 active.

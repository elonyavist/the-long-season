# Step 04 - Premium Visual System And Component Language Audit

## Status

Pending.

## Goal

Determine whether the current interface uses one coherent, restrained
retro-premium visual language and define the minimum design-system contract
needed for future sections.

## Scope

- Inventory current visual tokens and their production usage:
  - color roles and accepted skins;
  - typography families, sizes, weights, line heights, and numeric treatment;
  - spacing, sizing, radius, border, shadow, and layering scales;
  - surface hierarchy and selected/attention/error/success semantics;
  - motion duration, easing, and reduced-motion behavior.
- Audit the current language of buttons, icon buttons, links, tabs, filters,
  segmented controls, selects, context menus, tables, list rows, panels,
  dialogs, alerts, status markers, loading indicators, and tooltips.
- Check consistency across app entry, shell, Dashboard, Posta, preparation,
  tactical board integration, matchday phases, and save/command feedback.
- Record hardcoded values, near-duplicate patterns, inconsistent hover/focus/
  disabled states, excessive framing, weak hierarchy, and one-off component
  variants.
- Distinguish deliberate football-specific visual identity from generic SaaS
  styling or decorative retro effects.
- Preserve `campo-calcio.svg` and the tactical board as the approved visual
  anchor; assess only their integration with surrounding product chrome.
- Define a documented premium component-language baseline without implementing
  new primitives or tokens.

## Expected files

- `docs/audits/WEB_PREMIUM_VISUAL_SYSTEM_AND_COMPONENT_LANGUAGE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/73a-web-product-ui-ux-quality-audit-and-premium-design-baseline/05-accessibility-responsive-and-interaction-state-audit.md` only if the visual audit changes its assumptions.

## Required evidence

- Token-to-usage inventory with source references.
- Cross-screen component-state comparison screenshots.
- Typography, spacing, density, and alignment findings with concrete examples.
- List of unjustified one-off variants and missing shared contracts.
- Proposed visual-language rules tied to user comprehension, not taste alone.

## What NOT to implement

- No palette, token, CSS, Tailwind, component, SVG, or theme changes.
- No new design-system package or generic primitive library.
- No replacement of the accepted tactical-board pitch asset.
- No recommendation based only on fashion, novelty, or resemblance to a
  specific commercial game's branding.

## Required checks

```bash
nvm use 24
test -f docs/audits/WEB_PREMIUM_VISUAL_SYSTEM_AND_COMPONENT_LANGUAGE_AUDIT.md
git diff --check
```

## Manual inspection

- Do all controls look and behave as members of one product family?
- Is visual emphasis proportional to decision importance?
- Does the retro skin support readability rather than competing with it?

## Completion criteria

- Current tokens and component states are fully inventoried.
- Cross-screen inconsistencies have evidence and severity.
- Premium visual-language requirements are concrete and testable.
- Tactical-board preservation boundaries are explicit.
- `docs/PROJECT_STATUS.md` marks Step 04 Done and Step 05 active.

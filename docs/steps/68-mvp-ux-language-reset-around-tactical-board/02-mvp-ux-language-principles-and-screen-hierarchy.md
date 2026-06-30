# 02 - MVP UX Language Principles And Screen Hierarchy

## Goal

Define the target UX language and screen hierarchy before changing app code.

## Scope

Write a design guide covering:

- product tone: compact retro-premium football manager;
- visual principles: dense, readable, operational, football-first;
- typography, spacing, borders, panels, buttons, tables, alerts, and icon use;
- what makes a primary action, secondary action, disabled future nav, and
  attention item;
- how screens should relate to the approved tactical board;
- WCAG 2.2 AA constraints;
- anti-patterns: generic dashboard cards, debug tables, decorative buttons,
  oversized empty panels, unclear CTA clusters.

## Expected files

- `docs/design/MVP_UX_LANGUAGE_GUIDE.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change React/CSS/source files.
- Do not add persistence.
- Do not add new screens.
- Do not create a broad theme picker or new palette catalog.

## Required checks

```bash
nvm use 24
test -f docs/design/MVP_UX_LANGUAGE_GUIDE.md
git diff --check
```

## Done when

- A junior developer can read the guide and understand how to design the first
  MVP screens.
- The guide names the approved tactical board as the visual anchor.
- The guide says what to avoid, not only what to add.
- `docs/PROJECT_STATUS.md` records the adopted design direction.

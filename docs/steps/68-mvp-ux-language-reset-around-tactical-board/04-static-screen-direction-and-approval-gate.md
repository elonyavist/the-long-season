# 04 - Static Screen Direction And Approval Gate

## Goal

Create static screen direction artifacts before app-wide implementation.

## Scope

Create static target direction for:

- main menu;
- dashboard/command centre;
- Inbox/Posta attention surface;
- match preparation around the approved tactical board;
- matchday centre.

The artifacts may be Markdown wireframes, static HTML prototypes, or screenshot
annotated design notes, but they must be concrete enough for the user to judge
the direction before React/CSS rework starts.

## Expected files

- `docs/design/MVP_UX_STATIC_DIRECTION.md`
- optional `docs/prototypes/mvp-ux-language-reset.html`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change app React/CSS files yet.
- Do not add persistence.
- Do not replace the tactical board.
- Do not claim visual approval without user approval or a documented blocker.

## Required checks

```bash
nvm use 24
test -f docs/design/MVP_UX_STATIC_DIRECTION.md
git diff --check
```

## Done when

- Static direction exists for all first MVP screens.
- The tactical board remains the anchor in match-preparation direction.
- The direction is specific enough to implement.
- If the direction is not accepted, the phase stops here with a documented
  blocker instead of writing app code.

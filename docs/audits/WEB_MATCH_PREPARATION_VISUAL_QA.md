# Web Match Preparation Visual QA

Date: 2026-06-23
Phase: `52-web-match-preparation-slice`
Step: `07-responsive-accessibility-and-visual-qa`

## Scope

This audit verifies the first browser-rendered match-preparation slice:

- main menu to demo career dashboard;
- dashboard blockers before preparation;
- dashboard action opening match preparation;
- Inbox/Posta action opening match preparation;
- lineup selection;
- tactic selection;
- Save preparation;
- dashboard blocker clearance;
- Continue reaching matchday-ready behavior;
- desktop and narrow viewport behavior;
- keyboard focus path.

## Commands

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && node --experimental-strip-types apps/web/src/visual-qa/match-preparation.spec.ts
```

Supporting checks for this step:

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run typecheck
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run test
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run build
```

## Screenshot Evidence

Screenshots are intentionally written outside the repository:

- `/tmp/the-long-season-phase52/main-menu-desktop.png`
- `/tmp/the-long-season-phase52/dashboard-before-preparation-desktop.png`
- `/tmp/the-long-season-phase52/preparation-empty-desktop.png`
- `/tmp/the-long-season-phase52/preparation-saved-desktop.png`
- `/tmp/the-long-season-phase52/dashboard-matchday-desktop.png`
- `/tmp/the-long-season-phase52/preparation-inbox-narrow.png`
- `/tmp/the-long-season-phase52/dashboard-cleared-narrow.png`

## Desktop Findings

- PASS: main menu, dashboard, match preparation, saved preparation, and matchday-ready dashboard all render.
- PASS: the left Inbox/Posta rail stays left of the central content.
- PASS: match-preparation blockers are visible near the top of the central screen.
- PASS: dashboard blockers are visible in the first useful viewport, not only at the bottom.
- PASS: the user can fill all 11 lineup slots, choose a tactic, and save.
- PASS: after save, dashboard preparation facts become available and `Advance next fixture` becomes available.
- PASS: Continue reaches `Matchday reached` after preparation is saved.

## Narrow Findings

- PASS: shell stacks top navigation, Inbox/Posta rail, and central content.
- PASS: the Inbox/Posta action opens match preparation on a narrow viewport.
- PASS: after save, the narrow dashboard shows `Preparation complete` and available preparation facts.
- PASS: no horizontal overflow was detected by the Playwright geometry check.

## Keyboard And Focus Findings

- PASS: keyboard focus can start on the preparation `Dashboard` return button.
- PASS: pressing Tab reaches the first lineup select.
- PASS: lineup slots use native `select` controls with associated labels.
- PASS: tactic selection uses native radio controls.
- PASS: Save preparation is a native button and remains disabled until the view model reports the save action available.

## Accessibility Concerns

- No blocking accessibility issue found in this slice.
- The current controls are intentionally native and keyboard friendly.
- A future full lineup editor can add drag-and-drop only if it keeps an equivalent keyboard path.

## Remaining Non-Blocking Issues

- The preparation section is functionally complete for the prototype, but it is still not a full tactical editor.
- Player suitability is factual only at this stage: the screen does not show natural/adapted role fit yet because that belongs to a later squad/tactics section, not this blocker-resolution slice.
- The web app still uses in-memory demo state; durable save integration remains future scope.

# Web Match Preparation Slice Report

Date: 2026-06-23
Phase: `52-web-match-preparation-slice`

## Result

Phase 52 is complete.

The web app now has a practical first match-preparation section. It resolves the
current career-loop blocker instead of showing a decorative screen:

```text
Dashboard -> Prepare match -> choose lineup and tactic -> save preparation ->
Dashboard blockers cleared -> Continue reaches matchday-ready behavior
```

## What Changed

### Preparation Read Model

- Added `packages/ui/src/career/career-match-preparation-view.ts`.
- The read model is framework-free and language-agnostic.
- It derives:
  - missing lineup slots;
  - duplicate player selections;
  - missing tactic;
  - blocker keys;
  - preparation status;
  - Save preparation action availability.

### Web Preparation Adapter And State

- Added `apps/web/src/career/match-preparation-demo.ts`.
- The adapter owns deterministic prototype facts:
  - selected club;
  - next fixture;
  - 11 lineup slots;
  - 22 player options;
  - tactic profiles;
  - in-memory selected lineup/tactic/save state.
- It is replaceable by a future real career-save adapter.

### Lineup Selection

- Added `apps/web/src/screens/CareerMatchPreparationScreen.tsx`.
- The user can choose a player for each of 11 stable lineup slots.
- Missing and duplicate slot blockers are visible.
- No drag-and-drop, best XI, hidden recommendation, or squad-needs advice was
  added.

### Tactic Selection And Save Flow

- The screen renders tactic profiles with:
  - mentality;
  - pressing;
  - directness;
  - width;
  - risk.
- The user can select a tactic profile.
- Save preparation is blocked until lineup and tactic are valid.
- Successful save is visible and stays in in-memory prototype state only.

### Dashboard And Inbox/Posta Resolution

- Dashboard `Prepare match` opens match preparation.
- Inbox/Posta `Prepare match` opens match preparation.
- Saved preparation clears:
  - missing saved lineup;
  - missing saved tactic.
- Dashboard blockers are now visible near the top of the first useful viewport.
- Continue reaches `matchday_reached` after preparation is saved.

### Localization

- Match-preparation labels were added in all five supported languages:
  - English;
  - Italian;
  - German;
  - Spanish;
  - French.

### Browser QA

- Added `apps/web/src/visual-qa/match-preparation.spec.ts`.
- Playwright verifies:
  - main menu;
  - dashboard blockers;
  - dashboard entry path;
  - Inbox/Posta entry path;
  - lineup selection;
  - tactic selection;
  - save;
  - dashboard blocker clearance;
  - Continue to matchday-ready behavior;
  - desktop and narrow layouts;
  - keyboard focus path.

Screenshots are written outside the repository:

- `/tmp/the-long-season-phase52/main-menu-desktop.png`
- `/tmp/the-long-season-phase52/dashboard-before-preparation-desktop.png`
- `/tmp/the-long-season-phase52/preparation-empty-desktop.png`
- `/tmp/the-long-season-phase52/preparation-saved-desktop.png`
- `/tmp/the-long-season-phase52/dashboard-matchday-desktop.png`
- `/tmp/the-long-season-phase52/preparation-inbox-narrow.png`
- `/tmp/the-long-season-phase52/dashboard-cleared-narrow.png`

## Quality Review

Evidence:

- `docs/audits/WEB_MATCH_PREPARATION_SCOPE_REVIEW.md`
- `docs/audits/WEB_MATCH_PREPARATION_VISUAL_QA.md`
- `docs/audits/WEB_MATCH_PREPARATION_SECTION_REVIEW.md`

Outcome:

- Dependency direction: PASS.
- Code quality: PASS.
- Architecture: PASS.
- UI/UX: PASS.
- Accessibility: PASS.
- Fun/agency: PASS for this phase scope.

The manager now makes real choices before matchday. The game does not choose the
lineup or tactic automatically.

## Out Of Scope Kept Out

- Full drag-and-drop lineup editor.
- Full squad screen.
- Full tactic editor.
- Match simulation or matchday flow.
- Real save persistence from the web app.
- Market, squad-needs, finances, youth, staff, archive, or contract UI.
- Hidden recommendations.

## Known Non-Blocking Issues

- Player role suitability is not shown yet; it belongs to future squad/tactics
  work.
- Tactic editing is not available yet; the current screen selects existing
  profiles only.
- The web app still uses in-memory demo state.
- CSS organization should be reviewed again after more web sections exist.

## Final Verification

Final checks for Phase 52:

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/ui run typecheck
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run typecheck
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run test
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run build
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && node --experimental-strip-types apps/web/src/visual-qa/match-preparation.spec.ts
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm depcruise
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm check
git diff --check
```

## Next Phase Recommendation

Recommended next phase:

`Phase 53 - Inbox/Posta Decision Center`

Reason:

Phase 52 makes Inbox/Posta action routing real for one decision. The next useful
section should turn the left rail from a compact message list into the structured
decision center for career advancement stops, without becoming a generic news
feed.

Do not start Phase 53 until its documentation is explicitly requested.

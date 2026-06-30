# Phase 65 - Web Matchday Playable Slice

## Goal

Let the web user reach matchday from a prepared career, play the selected
club's next fixture through the real engine path, see the result and
consequences, and return to an updated dashboard without using the CLI.

## Product intent

The first MVP loop must feel like a football manager game:

- the manager prepares the team;
- the career stops on matchday because attention is required;
- the user chooses to play the match;
- the game shows the score, key events, basic player stats, and player-state
  consequences;
- the dashboard and Inbox/Posta then reflect that the career has moved on.

This phase is about payoff, not a live match viewer. The user should understand
what happened and why it matters for the next decision.

## Architecture intent

Connect the existing web shell to the canonical career advancement path without
making the web app own game rules:

- engine/domain continue to emit structured facts only;
- `packages/ui` owns web-ready matchday read models;
- `apps/web` owns interaction, routing state, and presentation;
- demo adapters may be in-memory, but they must call the real engine career
  fixture progression path;
- no CLI prose may be parsed by the web app;
- no fake matchday data may be rendered when engine facts are unavailable.

Phase 66 will handle browser/save persistence. Phase 65 may keep the playable
slice in memory as long as the user can complete the loop in one web session.

## Binding constraints

- Read `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` before each
  step; Phase 65 is bound to its scope.
- Check `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` on every step and update
  the relevant row only when the step genuinely advances that section.
- Use `nvm use 24` before package commands.
- Use Playwright and browser screenshots for web visual QA.
- Preserve the accepted visual identity system; do not rework global theme
  tokens here.
- Do not touch the tactical pitch SVG unless a step explicitly requires a
  layout fix around it.
- Keep labels localized through the existing i18n path.
- Keep read models language-agnostic where possible; presentation may translate
  labels.
- Keep UI state in Zustand and keep engine rules out of Zustand.
- Do not add dead routes, placeholder tabs, unused helpers, or compatibility
  leftovers.
- Keep code readable for a junior developer: small files, clear entry points,
  TSDoc/JSDoc where it explains contracts, and tests around adapters/read
  models.

## What NOT to implement

- No live animated 2D or 3D match viewer.
- No in-match substitutions.
- No half-time team talks.
- No opponent tactical board.
- No injuries, suspensions, press conferences, scouting, finances, contracts,
  market, staff, or training.
- No new persistence layer, localStorage save system, backend, or real file
  save adapter.
- No CLI output parsing.
- No narrative/LLM text generation.
- No hidden user decisions for the selected club.
- No match engine tuning or balance threshold changes just to make the UI flow
  easier.

## Ordered steps

1. [01-current-web-matchday-readiness-audit.md](01-current-web-matchday-readiness-audit.md)
2. [02-matchday-read-model-and-action-contract.md](02-matchday-read-model-and-action-contract.md)
3. [03-web-demo-matchday-adapter-and-store-flow.md](03-web-demo-matchday-adapter-and-store-flow.md)
4. [04-matchday-screen-result-and-event-presentation.md](04-matchday-screen-result-and-event-presentation.md)
5. [05-dashboard-inbox-and-continue-state-update.md](05-dashboard-inbox-and-continue-state-update.md)
6. [06-playwright-accessibility-and-visual-qa.md](06-playwright-accessibility-and-visual-qa.md)
7. [07-section-quality-review-and-phase-report.md](07-section-quality-review-and-phase-report.md)

## Phase-level checks

Run these at the end of the phase unless a step explicitly blocks earlier:

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-matchday-view.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.tsx
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/web run test
pnpm check
git diff --check
```

If web code changes are made, also run the phase Playwright smoke documented in
Step 06 and keep screenshots in the usual local QA path. If code changes are
made, also run:

```bash
graphify update .
```

## Definition of Done

- The current web matchday gap is audited before implementation.
- A `packages/ui` matchday read model exposes pre-match facts, result facts,
  key events, basic player stats, condition/form/morale consequences, next stop,
  and available actions.
- The web demo adapter advances the selected club's prepared fixture through
  the real engine path.
- Zustand can move the UI from dashboard/Inbox/Posta to matchday, play the
  fixture once, and return to an updated dashboard.
- The matchday screen is localized, accessible, responsive, and visually aligned
  with the accepted football-manager identity.
- Dashboard and Inbox/Posta reflect changed career state after the match.
- Playwright QA proves the prepare-to-matchday-to-dashboard loop.
- The final report states whether Phase 66 should be web persistence or whether
  a blocker must be handled first.

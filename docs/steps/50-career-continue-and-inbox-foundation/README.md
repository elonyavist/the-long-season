# Phase 50 - Career Continue And Inbox Foundation

## Goal

Build the foundation for a Football Manager style career loop:

1. The manager starts from the career dashboard.
2. The manager presses `Continue`.
3. The career advances day by day.
4. Advancement stops when an event requires the manager's attention.
5. The event is visible as a structured Inbox / Posta message.

This phase should turn the current dashboard from a static hub into the first
playable navigation loop. It must not implement every future event category.

## Product intent

- Keep the manager in control.
- The game may surface problems and events, but it must not make hidden
  decisions for the user.
- `Continue` is a flow control, not a simulation shortcut.
- The Inbox / Posta is a decision surface, not decorative news.
- The first stop condition should be narrow and useful:
  - next selected-club fixture;
  - missing match preparation;
  - matchday ready state.
- Future stop categories should be documented as structured keys, but not
  implemented until their systems exist.

## Attention categories

Future career advancement may stop for:

- match preparation required;
- matchday reached;
- transfer offer received for one of the user's players;
- user transfer offer accepted/rejected by a club;
- player contract negotiation required;
- incoming contract response;
- player unhappiness or request;
- injury or suspension that invalidates a saved lineup;
- youth academy decision at season rollover;
- player aging out of youth academy;
- board or club objective decision;
- finance warning that requires action;
- staff report requiring a manager choice;
- season rollover decisions;
- registration or squad-list deadline;
- critical competition draw or calendar event.

Only the current phase's documented subset should be implemented.

## Architecture intent

- Add structured, language-agnostic contracts before rendering Inbox prose.
- Keep engine/career advancement pure and deterministic.
- Keep UI read-models free from engine/storage implementations.
- Keep visible text behind localization keys.
- Keep web components as consumers of read models, not owners of career rules.
- Keep Inbox message identity and action identity stable so a future real save
  can persist them.

## Ordered steps

1. `01-phase-49-output-and-continue-loop-scope.md`
2. `02-inbox-domain-contract.md`
3. `03-career-attention-event-classification.md`
4. `04-continue-until-next-attention-stop.md`
5. `05-career-inbox-view-model.md`
6. `06-web-dashboard-continue-action.md`
7. `07-web-inbox-panel-prototype.md`
8. `08-playwright-continue-and-inbox-qa.md`
9. `09-phase-report-and-next-phase-decision.md`

## Phase-level checks

- Focused tests for every touched package/app module.
- `pnpm --filter @game/domain run typecheck` when domain contracts change.
- `pnpm --filter @game/engine run typecheck` when career advancement changes.
- `pnpm --filter @game/ui run typecheck` when view-model contracts change.
- `pnpm --filter @game/web run typecheck` when web code changes.
- `pnpm --filter @game/web run test` when web tests exist.
- `pnpm --filter @game/web run build` when web code changes.
- `pnpm depcruise`
- `pnpm check`
- `pnpm playwright:install` if Chromium is missing.
- Playwright screenshot QA for desktop and narrow viewport when web screens
  change.
- `git diff --check`

## What NOT to implement in this phase

- No full match preparation UI.
- No lineup editor.
- No tactic editor.
- No match viewer.
- No fixture playback.
- No automatic lineup or tactic choices.
- No market simulation.
- No player contracts, salaries, staff, stadiums, ticket prices, sponsorships,
  or economics.
- No youth academy decision UI.
- No full mail client.
- No random flavor news.
- No browser save persistence beyond the current prototype boundary unless a
  step explicitly requires it.
- No hidden recommendations about transfers or squad needs.
- No hardcoded visible labels.
- No CLI prose parsing.

## Definition of Done

- The project has documented and implemented the first structured career
  attention loop.
- The career can produce structured Inbox / Posta messages for the implemented
  stop conditions.
- `Continue` stops at a manager-relevant event instead of silently skipping
  choices.
- The web dashboard can show the continue state and a small Inbox panel.
- The implementation remains deterministic, localized, and package-boundary
  safe.
- The phase report recommends exactly one next phase.
- `docs/PROJECT_STATUS.md` records verification and next action.

# 03 - Web Preparation Demo Adapter And State

## Goal

Add the web-owned adapter and in-memory state needed to render and save match
preparation in the current prototype.

This step should bridge the existing demo career dashboard to the new
`@game/ui` match-preparation read model without adding real browser
persistence.

## Expected files

- `apps/web/src/career/*`
- `apps/web/src/App.tsx`
- Focused `apps/web` tests
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Build deterministic demo match-preparation facts for the current selected
  club and next fixture.
- Store in-memory preparation state in the web app:
  - selected lineup;
  - selected tactic;
  - save status.
- Reuse existing career/dashboard facts where possible.
- Keep the state shape compatible with future real career save data.
- Add tests proving:
  - initial preparation is incomplete;
  - saving valid lineup and tactic produces complete preparation;
  - invalid duplicate player selection remains blocked.

## What NOT to implement

- Do not add localStorage/sessionStorage.
- Do not write career saves.
- Do not parse CLI output.
- Do not import raw domain contracts in React components if the adapter can hide
  them.
- Do not implement a real squad screen.
- Do not implement automatic lineup or tactic choice.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The web app can build a match-preparation view from deterministic prototype
  state.
- The web app can track saved lineup/tactic state in memory.
- The adapter is clearly replaceable by a future real-save adapter.
- No gameplay rules are duplicated in React components.
- `docs/PROJECT_STATUS.md` identifies Step 04 as the next action.


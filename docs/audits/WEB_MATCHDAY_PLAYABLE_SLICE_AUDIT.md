# Web Matchday Playable Slice Audit

Date: 2026-06-29
Phase: `65-web-matchday-playable-slice`
Step: `01-current-web-matchday-readiness-audit`

## Question

Can the current web app reach a real matchday, play the selected club's next
fixture through the engine, show the result/consequences, and return to an
updated dashboard without introducing dead UI or a premature persistence layer?

## Roadmap Constraints Checked

- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` makes Phase 65 the
  next step after Phase 64 and scopes it to a playable web matchday slice.
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` still describes the broader
  Matchday Flow as `dashboard -> prepare -> matchday -> result ->
  consequences -> next stop`.
- No roadmap row is marked complete by this audit. This step only establishes
  the implementation map.

## Current Web State

The web app is ready for a narrow in-memory playable slice, but not yet for real
save persistence.

Current strengths:

- `apps/web/src/stores/career-ui-store.ts` already centralizes browser UI state
  in Zustand.
- `apps/web/src/app/App.tsx` already switches between app entry, dashboard, and
  match preparation.
- `apps/web/src/features/dashboard/continue-demo-career.ts` already calls the
  pure engine `continueCareerUntilAttention` rule and can produce
  `matchday_reached` Inbox/Posta messages.
- `apps/web/src/features/match-preparation/match-preparation-demo.ts` already
  owns in-memory lineup, bench, tactic, save status, and shared tactical-board
  draft state.
- Phase 57-59 tactical board and bench work already gives the manager a
  complete saved preparation path.

Current gaps:

- `CareerUiScreen` has no `matchday` screen.
- `handleInboxAction` only handles `prepare_match`; it ignores
  `open_matchday`.
- `continueCareer` records the stop result but does not route to matchday.
- `buildDemoCareerDashboardInput` is static and cannot represent a played
  fixture, changed player condition/form/morale, or a recent match after play.
- The demo web preparation currently uses `player:demo-*` IDs, while the real
  engine career state uses generated career-world player IDs. The matchday
  adapter must either construct a coherent web-demo career state from matching
  demo IDs or introduce one narrow mapping boundary. It must not pass mismatched
  IDs into engine progression.

## Current UI Read-Model State

Existing `@game/ui` read models cover dashboard, Inbox/Posta, shell, dashboard
actions, and match preparation:

- `packages/ui/src/career/build-career-dashboard-view.ts`
- `packages/ui/src/career/career-dashboard-view.ts`
- `packages/ui/src/career/career-inbox-view.ts`
- `packages/ui/src/career/career-shell-view.ts`
- `packages/ui/src/career/career-match-preparation-view.ts`

Missing:

- A matchday read model that exposes pre-play state, played result state,
  event rows, player stat rows, condition changes, form/morale consequences,
  next stop, and available actions.

Adopted seam:

- Add `packages/ui/src/career/career-matchday-view.ts` in Step 02.
- Keep it pure and language-agnostic.
- Do not import engine, content, storage, i18n, React, or web from `@game/ui`.

## Current Engine State

The engine now has the required matchday facts:

- `packages/engine/src/career/progress-fixture.ts` exposes
  `progressNextCareerFixture`.
- Successful progression returns:
  - `fixtureBefore`;
  - `fixtureAfter`;
  - durable `report`;
  - optional `explanationTrace`;
  - selected-club `conditionChanges`;
  - selected-club `playerStateConsequences`;
  - `playerStateConsequenceSummary`;
  - copied progressed `careerState`.
- `apps/cli/src/commands/career/progression.ts` demonstrates the correct
  adapter responsibilities: validate saved preparation, apply pre-match
  recovery, build caller-owned team contexts, call `progressNextCareerFixture`,
  then retarget preparation to the next selected-club fixture.

Adopted seam:

- Step 03 should create a web demo matchday adapter that follows the CLI
  ordering, but remains browser/in-memory and uses the feature-first web folder
  structure.
- The adapter may borrow the CLI algorithm shape, not CLI output or CLI file
  ownership.

## Safe Integration Path

1. Add a UI-owned matchday read model.
2. Add `apps/web/src/features/matchday/matchday-demo.ts` as the only web demo
   adapter that builds coherent engine inputs and calls real progression.
3. Extend Zustand with a `matchday` screen, a matchday state/result, and one
   `playMatchdayFixture` action.
4. Add `CareerMatchdayScreen.tsx`.
5. Route dashboard/Inbox/Posta/Continue to matchday when the stop reason is
   `matchday_reached`.
6. After play, rebuild dashboard data from the updated in-memory career state.
7. Run Playwright on the full prepare-to-matchday-to-dashboard loop.

## Expected Source Files For Later Steps

Step 02:

- `packages/ui/src/career/career-matchday-view.ts`
- `packages/ui/src/career/career-matchday-view.test.ts`
- `packages/ui/src/career/index.ts`
- `packages/ui/src/index.ts`

Step 03:

- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/matchday-demo.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`

Step 04:

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/styles/components.css`

Step 05:

- `apps/web/src/features/dashboard/build-demo-career-dashboard.ts`
- `apps/web/src/features/dashboard/continue-demo-career.ts`
- `apps/web/src/features/dashboard/dashboard-demo.test.ts`
- `apps/web/src/features/career-shell/CareerInboxPanel.tsx`
- `apps/web/src/app/App.tsx`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`

Step 06:

- `apps/web/src/visual-qa/matchday-playable-slice.spec.ts`
- `docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_VISUAL_QA.md`

Step 07:

- `docs/audits/WEB_MATCHDAY_PLAYABLE_SLICE_REPORT.md`
- `docs/ARCHITECTURE.md`
- both relevant roadmap files;
- `docs/PROJECT_STATUS.md`.

## In-Memory Decision

Phase 65 can remain in-memory because the user-facing goal is to prove the
first web gameplay loop inside one session: prepare, reach matchday, play, see
consequences, return to dashboard.

Persistence is intentionally deferred to Phase 66 because:

- persistence needs save validation, migration, missing-save states, and browser
  storage boundaries;
- adding it now would mix the matchday interaction slice with save-system
  architecture;
- the current project already treats `apps/web` demo adapters as replacement
  points for future real-save adapters.

## Risks For Later Steps

- Demo player IDs and engine career player IDs must be made coherent before
  calling `progressNextCareerFixture`.
- Dashboard refresh must not keep static fixture/preparation facts after a
  match is played.
- Matchday screen must not render placeholder/fake events if the engine returns
  an invalid or missing report.
- `open_matchday` must be routed explicitly; otherwise Inbox/Posta will show an
  action that does nothing.
- Playwright QA must catch stale dashboard state, clipped result tables, and
  keyboard focus traps.

## Recommendation

Proceed to Step 02 and add the `@game/ui` matchday read-model contract before
touching web state or React screens.

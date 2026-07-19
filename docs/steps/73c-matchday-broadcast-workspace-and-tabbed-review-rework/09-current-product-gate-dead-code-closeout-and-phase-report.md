# Step 09 - Current Product Gate, Dead-Code Closeout, And Phase Report

## Status

Ready.

## Goal

Make the rebuilt Matchday the only current product path, prove the complete
real-browser journey, remove replaced code, and close Phase 73C without
starting Phase 74.

## User-Visible Outcome

- App Entry -> Dashboard -> Preparation -> Matchday -> Dashboard remains one
  coherent real career journey.
- The accepted broadcast hierarchy is consistent across both halves, interval,
  and full time.
- Refresh, command failure, manual save cadence, Posta, and Continue still work.
- No obsolete live feed, duplicated full-time report, hidden half-time layout,
  or stale Matchday copy remains reachable.

## Scope

1. Migrate every still-current Matchday assertion into the canonical
   `current-product.spec.ts` real SQLite/OPFS journey.
2. Preserve the separate `sqlite-opfs-storage.spec.ts` only for unique storage
   isolation/rollback evidence.
3. Search production/test/CSS/i18n ownership for replaced Matchday paths.
4. Remove only code proven obsolete by replacement coverage.
5. Update architecture documentation for current Matchday component,
   presenter, playback, tab, and persistence boundaries.
6. Produce `MATCHDAY_BROADCAST_WORKSPACE_REWORK_REPORT.md` with UX, visual,
   accessibility, architecture, code-quality, dependency, fun, and residual
   risk review.
7. Reconcile status and both career roadmaps, recommending exactly Phase 74.

## Required Browser Gate

The canonical journey must prove:

- pre-match full-width hierarchy and one command;
- first-half playback, pause, speed, ordinary event, decisive event, and goal;
- stable one-line commentary and compact tabellino;
- half-time Summary, Tactics, selected-team, and opponent tabs;
- one real tactical change and valid second-half start;
- second-half playback under the same policy;
- full-time selected-team, opponent, and consequence tabs;
- one Return to Dashboard action;
- refresh at pre-match, half-time, and full time;
- command failure with preserved screen;
- desktop, wide, narrow, 200% text, keyboard/focus, and reduced motion;
- no horizontal page overflow or cumulative live-page height growth;
- unchanged tactical-board behavior and real SQLite/OPFS lifecycle.

## Expected Files

- current Phase 73C production/test files under
  `apps/web/src/features/matchday/`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/audits/MATCHDAY_BROADCAST_WORKSPACE_REWORK_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/steps/73c-matchday-broadcast-workspace-and-tabbed-review-rework/README.md`

## What NOT To Implement

- No new gameplay, event, narrative, career section, or Phase 74 code.
- No deletion based only on age, naming, line count, or an unverified grep.
- No historical compatibility test kept after its unique assertion migrates.
- No new audit runner when the canonical current-product gate can own the
  assertion.
- No architectural abstraction created only to improve a diagram.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
pnpm check
pnpm web:visual:qa
git diff --check
graphify update .
```

## Manual Inspection

- Review the complete screenshot matrix and contact sheets rather than isolated
  passing frames.
- Confirm the experience reads as one restrained premium football broadcast,
  not a dashboard, log viewer, or technical report.
- Confirm every visible fact helps understand the match or make the interval
  decision.
- Confirm sidebar, Dashboard, Posta, save lifecycle, command feedback, and
  tactical board remain coherent with the rest of the product.
- Confirm no accepted phase contains duplicate actions, empty decorative
  panels, stale fallback copy, or dead interaction.

## Cleanup Boundary

Delete replaced Matchday components/helpers/branches/selectors/labels/tests
only after their unique behavior is covered by current unit and browser gates.
Record any retained path and its current caller in the final report; an
unexplained compatibility bridge blocks phase completion.

## Completion Criteria

- All nine Phase 73C steps are Done.
- One canonical current-product browser gate proves the accepted Matchday
  journey through real SQLite/OPFS.
- Full repository checks and manual visual review pass.
- Architecture and both roadmaps describe the code that actually exists.
- The final report records no known dead Matchday code or unexplained retained
  compatibility path.
- Phase 73C recommends exactly `Phase 74 - Player Generation And Model
  Consolidation Cleanup` and does not start it.

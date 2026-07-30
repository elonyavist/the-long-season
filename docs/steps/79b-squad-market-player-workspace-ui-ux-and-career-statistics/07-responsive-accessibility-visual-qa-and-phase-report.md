# Step 07 - Responsive, Accessibility, Visual QA And Phase Report

## Status

Done.

## Completion And Verification

- Domain, engine, storage, UI, and i18n package tests pass.
- Web tests pass: 72 files and 322 tests.
- Web typecheck and production build pass. The known chunk-size warning remains
  non-blocking.
- Visual QA passes: 29 of 29 scenarios in 4.4 minutes.
- The responsive Squad-table vertical-scroll glitch was corrected with an
  explicit containing block on its scroll frame and is protected by a browser
  assertion.
- Repository-wide `pnpm check` passes: 235 files / 1,452 tests,
  dependency-cruiser 715 modules / 2,700 dependencies, localized text, lint,
  and all workspace typechecks.
- `git diff --check` and `graphify update .` pass.
- Phase 79 Step 14 is the next active work. The Phase 79 `750 x 50` long run
  remains unrun and unclaimed.

## Goal

Verify the complete Squad/Market redesign as one product, correct only defects
inside this phase's surfaces, document the result, and return control to Phase
79 Step 14.

## Expected Files

- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/features/squad/SquadRowActionMenu.tsx`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/shared/ui/PlayerStarRating.tsx`
- `apps/web/src/shared/ui/PlayerProfileTabs.tsx`
- `apps/web/src/shared/ui/PlayerRoleChips.tsx`
- `apps/web/src/shared/ui/PlayerAttributeGroups.tsx`
- `apps/web/src/shared/ui/PlayerStatisticsPanel.tsx`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/audits/SQUAD_MARKET_PLAYER_WORKSPACE_79B_REPORT.md`
- `design.md`
- `.hallmark/log.json`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/README.md`
- `docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/07-responsive-accessibility-visual-qa-and-phase-report.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`
- `docs/steps/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- Graphify generated files under `graphify-out/`

## Required Evidence

- Desktop, narrow, and useful 200% text screenshots for Squad/Market tables and
  all six detail tabs.
- Keyboard proof for row, select, menu, tabs, dialog close, and focus restore.
- Touch proof for select/menu/tab targets.
- First and last Squad row menu positioning, table-scroll close, and no clipped
  portal.
- Automatic swap reflected in the canonical Tactics workspace.
- Offer and renewal drafts retained across tabs.
- Goalkeeper and outfield attribute separation.
- Natural/adapted-only role chips.
- Half-stars and elite dark-orange marker.
- Current/career statistics plus partial/unavailable coverage.
- Exactly one dialog scrollbar and no horizontal page overflow.
- Reduced-motion parity.
- SQLite schema-14-to-15 upgrade and reload-safe archived statistics.
- One shared statistics-period formatter used by both Squad and Market; remove
  the duplicated coverage/metric formatting discovered in the Step 06 review.

## What NOT To Implement

- No new feature, route, metric, tuning, dependency, scouting system, or
  replacement architecture.
- No weakening assertions to fit screenshots.
- No Phase 79 long run.
- No deletion without a separately confirmed exact file list.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/storage run test
pnpm --filter @game/ui run test
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

- Every documented phase behavior and evidence item passes.
- Hallmark's final universal slop-test subset passes and its app stamp is
  recorded.
- Architecture, phase report, roadmap, step index, and status match code.
- No dead replacement path or accidental hidden-potential leak remains.
- Phase 79B is Done and Phase 79 Step 14 is again the only active step.
- The `750 x 50` remains unrun and unclaimed.

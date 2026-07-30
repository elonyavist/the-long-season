# Step 05 - Squad Player Profile Tabs And Role-Aware Attributes

## Status

Done.

## Goal

Turn the Squad player inspector into a compact three-tab workspace with
role-appropriate attributes, truthful statistics, and the existing complete
contract workflow.

## Expected Files

- `packages/ui/src/career/career-player-detail-view.ts`
- `packages/ui/src/career/career-player-detail-view.test.ts`
- `packages/ui/src/career/career-player-statistics-view.ts`
- `packages/ui/src/career/career-player-statistics-view.test.ts`
- `packages/ui/src/career/career-player-profile-view.ts`
- `packages/ui/src/career/career-player-profile-view.test.ts`
- `packages/ui/src/index.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.test.tsx`
- `apps/web/src/shared/ui/PlayerProfileTabs.tsx`
- `apps/web/src/shared/ui/PlayerProfileTabs.test.tsx`
- `apps/web/src/shared/ui/PlayerRoleChips.tsx`
- `apps/web/src/shared/ui/PlayerRoleChips.test.tsx`
- `apps/web/src/shared/ui/PlayerAttributeGroups.tsx`
- `apps/web/src/shared/ui/PlayerAttributeGroups.test.tsx`
- `apps/web/src/shared/ui/PlayerStatisticsPanel.tsx`
- `apps/web/src/shared/ui/PlayerStatisticsPanel.test.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Filter profile roles to natural/adapted in the framework-free view model.
- Project goalkeepers to goalkeeping/mental/physical and outfield players to
  technical/mental/physical.
- Keep exact current values and role-relevance ordering.
- Add three WAI-ARIA tabs and reset to Attributes on player change.
- Keep the Contract panel mounted while hidden so renewal drafts survive.
- Present current season and career totals with coverage status.
- Preserve the compact identity/summary header above the tabs.
- Ensure the dialog owns exactly one scroll container at desktop and narrow.

## What NOT To Implement

- No Market offer integration.
- No weak/red role cards, outfield goalkeeping attributes, goalkeeper outfield
  technical group, or numeric hidden potential.
- No contract form rewrite or tab-driven draft reset.
- No unsupported statistic or inferred zero.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/ui run test
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
```

## Definition Of Done

- The Squad detail has exactly the locked tabs and keeps renewal drafts alive.
- Role chips and attribute groups are compact and position-correct.
- Current/career statistics are truthful, localized, and coverage-aware.
- Keyboard tabs, focus, dialog scroll, narrow layout, 200% text, and reduced
  motion pass.

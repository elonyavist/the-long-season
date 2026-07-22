# Step 12 - Senior Squad Table And Navigation Workspace

## Status

Done.

## Goal

Enable the Squad route and implement the complete senior-roster table around
the Step 11 read model.

## User-Visible Outcome

The manager can open Squad from the sidebar, scan the whole roster, sort and
filter it, understand selection/availability, and open any player profile.

## Scope

1. Enable the current Squad navigation destination and route.
2. Build a dense football-roster header and table using the locked columns.
3. Add reusable sorting and focused department/status filtering.
4. Render condition percentage, morale direction, composite status, currency
   value, level, potential assessment, and the under-eight-month contract icon.
5. Keep row and explicit action controls keyboard/touch accessible.
6. Open a temporary profile shell from the row using the real read model; Step
   14 completes its contents and commands.
7. Use vertical table scrolling only where needed and preserve sticky headers.
8. Apply existing tokens, icons, table patterns, semantic Motion, loading,
   empty, and error states.
9. Add desktop, narrow, 200% text, keyboard, and reduced-motion screenshots.

## Implementation Contract

- The table consumes Step 11 projections and owns no football calculation.
- Zustand may keep route-local sort/filter/profile-open state only.
- Use Lucide icons with accessible names/tooltips where an icon exists.
- Table width must fit the content outlet without page or table horizontal
  scrolling at supported gates.
- A row click and keyboard activation open the same profile command.

## Expected Files

- new `apps/web/src/features/squad/` production/test Modules
- current web route/navigation/frame Modules/tests
- current shared table/icon/dialog primitives only where reusable improvement
  is required
- current web styles/tokens for production-used Squad selectors only
- current i18n catalogs/tests
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No local player fixture, copied sorting algorithm, fake contract/profile
  field, horizontal scrolling, Market/Youth row, or decorative dashboard card.
- No contract submission command yet.
- No second top-level tab system for Squad/Tactics.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Inspect a full roster at desktop, narrow, and 200% text with no horizontal
  scroll or clipped action.
- Use keyboard-only sorting, filtering, row opening, and return focus.
- Confirm injured/suspended selected players show both states clearly.

## Completion Criteria

- Squad is a real route backed by current career facts.
- The table satisfies every locked column and responsive requirement.
- Profile entry is accessible and uses the real selected row.
- Step 13 remains the only next implementation step.

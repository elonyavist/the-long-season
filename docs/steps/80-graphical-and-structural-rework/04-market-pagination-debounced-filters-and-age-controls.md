# Step 04 - Market Pagination, Debounced Filters And Age Controls

## Status

Done.

## Goal

Keep the Market responsive and navigable by paginating the deterministic
result set, delaying only typed filters, and replacing free age entry with
bounded selectors.

## Accepted Semantics

- Filter -> sort -> paginate is the canonical order.
- Page size is fixed at `25`.
- Query and manually entered value bounds apply after `250 ms`.
- Role, employment, contract, negotiability, and age selects apply
  immediately.
- Age uses minimum and maximum selects with `All` plus `15..40`.
- If a changed age bound crosses the other bound, the other bound clamps to
  the selected age.
- Any applied filter or sort returns to page `1`.
- Result shrinkage clamps to the last valid page; empty results remain page
  `1` of `1`.
- Paging never changes selection, target identity, eligibility, or sorting
  semantics.

## What To Implement

- Add framework-free page input and output metadata to the Market read model.
- Add one tested shared `useDebouncedValue` helper for typed React filters.
- Keep immediate input echo while delaying read-model application.
- Replace age number inputs with accessible min/max selects.
- Add Previous/Next and bounded direct page controls with visible interval and
  total count.
- Preserve full-dataset sorting and reset/clamp behavior.

## What NOT To Implement

- No server pagination, virtualization, infinite scroll, persisted filters,
  selectable page size, or new market rule.
- No debounce in domain, engine, `@game/ui`, or command handling.
- No delay for selects or page controls.

## Expected Files

- `packages/ui/src/career/career-market-target-view.ts`
- `packages/ui/src/career/career-market-target-view.test.ts`
- `apps/web/src/shared/lib/use-debounced-value.ts`
- `apps/web/src/shared/lib/use-debounced-value.test.ts`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/80-graphical-and-structural-rework/README.md`
- `docs/steps/80-graphical-and-structural-rework/04-market-pagination-debounced-filters-and-age-controls.md`

## Required Checks

```bash
pnpm exec vitest run \
  packages/ui/src/career/career-market-target-view.test.ts \
  apps/web/src/shared/lib/use-debounced-value.test.ts \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web exec playwright test \
  src/visual-qa/current-product.spec.ts \
  --grep "Market paginates and delays typed filters" \
  --workers=1
git diff --check
graphify update .
```

No long run belongs to this step.

## Definition Of Done

- At most `25` sorted/filtered Market rows render per page.
- Typing remains immediate while the result set updates once after `250 ms`.
- Age cannot leave the accepted `15..40` range or an inverted bound state.
- Pagination is keyboard accessible and stable under sorting/filtering.
- Required checks pass and Step 05 is the only next action.

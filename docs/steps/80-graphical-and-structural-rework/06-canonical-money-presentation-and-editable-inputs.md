# Step 06 - Canonical Money Presentation And Editable Inputs

## Status

Done.

## Goal

Make every accepted Squad, Market, contract, and finance amount use one exact,
locale-aware presentation and safe editable-input contract.

## Accepted Semantics

- Stored money remains integer minor units and is never parsed through
  floating-point arithmetic.
- Read-only formatting follows active language and currency.
- Tables use exact whole-unit display; minor precision is explicit only where
  cents are meaningful.
- Money is not abbreviated to `K`, `M`, or locale-independent punctuation.
- Editable fields accept locale-valid grouping/decimal conventions, stay
  readable while editing, and normalize on blur.
- Ambiguous or unsafe values fail validation; they are not guessed.

## What To Implement

- Audit all user-visible money in accepted Market, Squad, profile, contract,
  renewal, and finance surfaces.
- Keep one shared read-only formatter and add one shared integer-safe editable
  parser/formatter or component boundary.
- Replace local parsing/formatting paths in transfer-fee and contract terms.
- Add useful JSDoc/TSDoc explaining minor-unit, locale, and round-trip
  invariants.
- Retain tabular numerals and non-wrapping table alignment.

## What NOT To Implement

- No value, asking-price, fee, wage, budget, affordability, or negotiation
  tuning.
- No domain money replacement, currency conversion, compact notation, or
  lossy rounding.
- No duplicated screen-local parser.

## Expected Files

- `apps/web/src/shared/format-money.ts`
- `apps/web/src/shared/format-money.test.ts`
- `apps/web/src/features/shared/ContractTermsForm.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx`
- `apps/web/src/features/squad/contract-renewal-form.ts`
- `apps/web/src/features/squad/contract-renewal-form.test.ts`
- `apps/web/src/features/squad/CareerContractWorkspace.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/80-graphical-and-structural-rework/README.md`
- `docs/steps/80-graphical-and-structural-rework/06-canonical-money-presentation-and-editable-inputs.md`

## Required Checks

```bash
pnpm exec vitest run \
  apps/web/src/shared/format-money.test.ts \
  apps/web/src/features/market/CareerMarketPlayerDialog.test.tsx \
  apps/web/src/features/squad/contract-renewal-form.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/web exec playwright test \
  src/visual-qa/current-product.spec.ts \
  --grep "money presentation and editing stay locale safe" \
  --workers=1
git diff --check
graphify update .
```

No long run belongs to this step.

## Definition Of Done

- Accepted read-only amounts use the shared formatter with explicit precision.
- Transfer and contract inputs round-trip safe integer money across all
  supported languages.
- English grouping remains English; Italian grouping remains Italian.
- No manual currency concatenation or floating-point parsing remains in scope.
- Required checks pass and Step 07 is the only next action.

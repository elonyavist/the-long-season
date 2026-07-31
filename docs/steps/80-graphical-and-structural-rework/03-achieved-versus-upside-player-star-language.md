# Step 03 - Achieved Versus Upside Player-Star Language

## Status

Done.

The shared renderer and all focused checks pass. The separate upstream
generation/projection mismatch is accepted and assigned to documented Phase
80A Steps 05-07; it no longer blocks the presentation-only completion
contract or authorizes model changes inside this step.

## Goal

Make Level and Potential immediately distinguishable while retaining the full
Phase 79D public lower/upper uncertainty contract in every shared player
surface.

## Accepted Semantics

- Current Level keeps the existing solid gold ordinary stars and dark-orange
  sixth star.
- Potential receives current rating plus the public lower/upper range:
  - `0..current`: achieved, same solid color as Level;
  - `current..lower`: lighter projected color, solid;
  - `lower..upper`: lighter projected color, patterned;
  - `upper..6`: neutral outline.
- Future ordinary slots use light yellow; future sixth-star segments use light
  orange. Existing contrast and exceptional-current tokens remain unchanged.
- Half-star clipping applies independently to all three filled bands.
- Accessible text states current rating, conservative projection, upper
  projection, and uncertainty without calling the lower value guaranteed.

## What To Implement

- Extend the shared potential renderer with the current public rating fact.
- Render achieved, conservative future, and uncertain future segments in
  stable six-slot SVG/DOM state.
- Add explicit design tokens for ordinary and sixth-star projected upside.
- Update Market, Squad, Market detail, and Squad profile consumers.
- Add focused semantic/component coverage and visual QA.

## What NOT To Implement

- No rating, stored potential, public projection, development, sorting,
  valuation, scouting, or save-schema change.
- No second potential renderer or screen-local star calculation.
- No color-only status and no removal of the uncertain hatch.

## Expected Files

- `apps/web/src/shared/ui/PlayerPotentialRangeRating.tsx`
- `apps/web/src/shared/ui/PlayerPotentialRangeRating.test.tsx`
- `apps/web/src/features/market/CareerMarketScreen.tsx`
- `apps/web/src/features/market/CareerMarketPlayerDialog.tsx`
- `apps/web/src/features/squad/CareerSquadScreen.tsx`
- `apps/web/src/features/squad/CareerPlayerProfileDialog.tsx`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/80-graphical-and-structural-rework/README.md`
- `docs/steps/80-graphical-and-structural-rework/03-achieved-versus-upside-player-star-language.md`

## Required Checks

```bash
pnpm exec vitest run \
  apps/web/src/shared/ui/PlayerPotentialRangeRating.test.tsx \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/web exec playwright test \
  src/visual-qa/current-product.spec.ts \
  --grep "player rating and potential distinguish achieved from upside" \
  --workers=1
git diff --check
graphify update .
```

No long run belongs to this step.

## Definition Of Done

- A `3`-star player with a public `4..5` range reads as three achieved stars,
  one light conservative star, and one light patterned uncertain star.
- Current and projected sixth-star segments use dark and light orange
  respectively.
- All consumers use the shared implementation and preserve six stable slots.
- Keyboard/screen-reader users receive the same facts without depending on
  color.
- Required checks pass and Step 04 is the only next action.

## Completion

- The shared renderer now receives the current public rating and keeps six
  stable slots split into achieved, conservative-future, uncertain-future, and
  neutral-outline DOM/SVG states.
- Current segments preserve the Level gold/dark-orange palette. Future
  ordinary and sixth-star segments use dedicated light-yellow/light-orange
  tokens, while uncertainty retains the non-color hatch.
- Market, Squad, and both player-detail workspaces use the same renderer.
- Localized accessible copy exposes current, conservative, upper, and
  uncertainty facts in all five supported languages.
- Focused Vitest `20/20`, web typecheck, the named Playwright check `1/1`,
  manual desktop screenshot inspection, diff, and Graphify pass.
- Step 04 is the only next action.

## Reopened Finding

- Direct product review showed that the neutral outline was painted over the
  achieved fill and the uncertain band had no light base fill. Potential was
  technically present but visually too weak to read at table density.
- The renderer now matches the Level fill/outline treatment for achieved
  segments and gives uncertain future segments a light base plus a visible
  hatch. Focused Vitest `21/21`, web typecheck, named Playwright `1/1`, direct
  screenshot inspection, diff, and Graphify pass.
- A separate deterministic `20`-world generation audit found `1,710`
  seventeen-year-olds, only `11` with at least one public star of upside and
  only `6` with a stored six-star ceiling. Those six-star prospects start at
  `1..1.5` stars in that age slice, never at `3`; the complete young
  exceptional sample starts at `1..2.5`.
- The public `0..17` outfield policy then exposes only `30.76%` of remaining
  stored-ceiling room. A real young six-star ceiling therefore commonly
  presents with a public upper of only `2.5..3` stars.
- Fixing either cause would change generation or public projection, both
  explicitly excluded by this step. The accepted
  `PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_DESIGN_CONTRACT.md`
  assigns those changes to Phase 80A. Step 03 therefore closes on its verified
  renderer evidence and Step 04 may proceed without changing model facts.

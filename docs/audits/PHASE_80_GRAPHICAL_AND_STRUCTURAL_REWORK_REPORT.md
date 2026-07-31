# Phase 80 Graphical And Structural Rework Report

Date: 2026-07-31

## Scope

This report closes the five accepted items in
`PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_INVENTORY.md`. Phase 80 delivered
presentation, interaction, and framework-free read-model changes only. It did
not reopen player generation, potential calibration, valuation economics,
persistence, or simulation, and it ran no longitudinal cohort.

## Delivered Inventory

### P80-R01 — Current Achievement Versus Potential Upside

- The shared six-slot renderer receives the canonical current rating and layers
  achieved, light conservative future, light patterned uncertain future, and
  neutral outline. Dark orange stays reserved for an achieved sixth star; the
  projected sixth star uses light orange.
- Market, Squad, and both player inspectors consume the same renderer.
- Segment meaning is exposed through DOM state and localized accessible text,
  not through color alone.
- The `20`-world audit recorded during Step 03 found only `11 / 1,710`
  seventeen-year-olds with at least one public star of upside. That is a
  generation/projection fact, not a renderer defect, and Phase 80A owns it.

### P80-R02 — Market Pagination, Debounced Filters, And Age Selects

- `@game/ui` owns `CAREER_MARKET_PAGE_SIZE` and a pure
  `paginateCareerMarketTargetRows` slice applied after canonical filtering and
  sorting. Oversized pages clamp to the last valid page; an empty result stays
  page `1` of `1`.
- Typing echoes immediately; the query and manually entered value bounds reach
  the read model once after `250 ms` through the shared debounce helper.
- Role, employment, contract, negotiability, and age selects apply immediately,
  and any applied filter or sort returns to page `1`.
- Age uses two accessible selects covering `All` plus `15..40`, with a crossed
  bound clamping the other bound.

### P80-R03 — Squad Age, Placement Order, And Debounced Search

- The locked column contract is now `#`, `Role`, `Placement`, `Player`, `Age`,
  `Condition`, `Morale`, `Status`, `Value`, `Level`, `Potential`, `Action`.
- `age` is a public sortable row fact carried unchanged from the valuation the
  adapter already derives; React never computes an age.
- Player-name search applies after `250 ms` through the same shared helper,
  while department and availability selects and every placement command stay
  immediate.
- Narrow card labels expose age and placement with the same hierarchy.

### P80-R04 — Canonical Money Presentation And Editable Money Input

- `apps/web/src/shared/format-money.ts` is the single web money owner.
- Read-only display hands `Intl` an exact decimal string built from the stored
  integer minor units, so no floating-point division sits between storage and
  screen, and precision stays an explicit caller decision.
- `parseMoneyInputToMinorUnits` reads grouping and decimal characters from the
  active language, accepts locale-valid text, assembles minor units with string
  arithmetic, and rejects ambiguous values such as English `1,50` instead of
  guessing them. `formatMoneyInputFromMinorUnits` is its blur-time round-trip
  partner.
- The three screen-local parsers were removed. Contract renewal, the Market
  transfer fee, and the Market value bounds all use the shared pair, and the
  value bounds became locale-aware text because an HTML `type="number"` field
  is always locale-independent.

### P80-R05 — Transfer-Offer Draft And Dialog Stability

- `FullScreenDialog` owns one explicit `dismissOnBackdrop` policy, defaulting to
  the existing light dismissal and publishing its state as
  `data-backdrop-dismiss`.
- The Market player dialog opts out because it holds an unsent offer draft.
  Backdrop, blank gutter, and scrollbar interaction can no longer discard it.
- Explicit close, `Escape`, the native focus trap, opener focus restoration, the
  existing per-player draft identity, and the command lifecycle are unchanged.
- No Market-specific DOM or CSS workaround was introduced.

## Defects Found And Fixed During The Phase

- The Squad department select shipped the role name `goalkeeper` while the
  canonical department is `goalkeeping`, so that filter had always returned an
  empty squad. The `as` cast on the select value hid the mismatch from the
  compiler. Fixed in Step 05 with browser evidence.
- Four browser assertions written before Steps 04 and 06 were measuring the old
  behavior: two compared Market result totals by counting rendered rows, which
  pagination caps at `25`, and two expected raw unnormalized money text. All
  four now assert the reported total and the normalized value.
- One QA assertion assumed a searched full name matches exactly one generated
  player. Fictional full names can repeat, so the delayed query is now proven by
  a smaller matching-only result set.
- On the pinned Node `24.16.0` ICU, Italian requires two grouping digits, so a
  four-digit amount stays ungrouped (`1250,75`). One money expectation and one
  browser regex assumed unconditional grouping and were corrected to the real
  locale rule.
- The Phase 79 transfer-offer browser journey was world-dependent and failed
  about half the time. Every new browser career seeds its world with a fresh
  `crypto.randomUUID()`, while the test offered a fixed `€100,000` for whatever
  target happened to sort first, so the engine answered `fee_below_valuation`.
  The journey now filters to contracted, actionable targets, sorts by ascending
  public value, and offers the seller's own asking price. It walks up to eight
  candidates because a seller may still answer `player_not_for_sale`, then
  proves the pending, exposure, and withdrawal lifecycle on the accepted offer.
  This strengthened the assertions; none were relaxed.

## Absence Checks

- Exactly one debounce helper exists (`apps/web/src/shared/lib/use-debounced-value.ts`);
  both Market and Squad consume it.
- No screen-local money parser or formatter remains; no user-visible manual
  currency concatenation remains in the accepted surfaces.
- No local pagination rule exists outside `@game/ui`.
- No Market-specific dialog dismissal workaround exists; the only
  `pointer-events: none` rule in the stylesheet belongs to the read-only live
  tactics board.
- No replaced renderer path remains: the potential renderer has one
  implementation shared by four consumers.

## Gate Results

All gates ran on the pinned Node `24.16.0` toolchain.

- `pnpm check` PASS (exit `0`): ESLint, dependency-cruiser, the localized-text
  script, Vitest `1,606` tests across `256` files, and all ten workspace
  typechecks.
- `pnpm depcruise` PASS: `769` modules and `2,966` dependencies, no violation.
- `pnpm --filter @game/web run build` PASS.
- `pnpm web:visual:qa` PASS: `34/34` Playwright tests across the current-product
  and SQLite/OPFS specs, `6.7` minutes, exit `0`.
- `git diff --check` and `graphify update .` PASS.

The Node version matters: the repository pins `24.16.0`, and the default shell
here is Node `20.17.0`, where `pnpm check` cannot even start because
`scripts/check-localized-presentation-text.ts` needs native TypeScript
execution. Node `24.16.0` also carries the ICU rules these gates assert.

## Manual Inspection Targets

- Market desktop and narrow pagination controls at `200%` text.
- Squad narrow cards: age and placement must stay visible and legible.
- Contract renewal and Market offer money fields in Italian, German, Spanish,
  and French, including blur normalization.
- Market player dialog: confirm the gutter is inert while a fee draft is open,
  and that `Escape` still closes.

## Residual Monitor Items

- `reduced motion reaches the same half-time decision without interpolated
  clicks` failed once mid-suite on a focus assertion while another test suite
  was competing for CPU, then passed alone and in every clean full run. It is an
  existing matchday timing sensitivity, unrelated to the Phase 80 surfaces.
- The `1.68 MB` web entry chunk warning predates Phase 80 and is unchanged.

## Handoff

- Phase 80 is complete. All nine steps are Done, every accepted inventory item
  maps to passing implementation and browser evidence, and Phase 80A Step 01 is
  the only next action.
- Phase 80A owns the player-model correction behind the Step 03 audit finding:
  club-independent public value, current/P50/upper projection, and the new
  calibration epoch.
- Phase 80B accepts the browser finding that outgoing command eligibility and
  seller willingness are separate facts. `Action available` permits an
  approach; `player_not_for_sale` remains a valid explicit seller response and
  must not be hidden or recomputed in React.
- The deferred resumable `50 x 20` remains unrun. It belongs only to Phase 80C
  Step 09 with `50` stable shards and exactly `7` workers.
- Phase 79 Step 14 remains Reopened, paused, and unclaimed.

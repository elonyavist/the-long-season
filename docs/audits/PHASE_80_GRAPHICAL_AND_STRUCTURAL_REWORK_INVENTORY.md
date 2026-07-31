<!-- Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 -->

# Phase 80 Graphical And Structural Rework Inventory

Date: 2026-07-30

## Decision

The five user-reported Squad and Market reworks below are the complete accepted
Phase 80 inventory. They are presentation, interaction, and framework-free
read-model changes. They do not reopen player generation, potential
calibration, valuation economics, scouting, persistence, or simulation.

The supplied Market screenshots are accepted visual evidence. A focused
Playwright replay of the ordinary transfer-fee edit path could not start its
Vite server inside the bounded sandbox window, so this audit does not falsely
claim that automation reproduced the premature close. Existing source tests do
cover fee editing, tab switching, and successful submission; the missing
regression seam is accidental dialog dismissal while a draft is active.

## Locked Interaction Defaults

- Market pagination uses `25` rows per page.
- Filtering and sorting apply to the complete result set before pagination.
- Text and manually entered numeric filters apply after `250 ms`.
- Select controls apply immediately.
- Changing a filter or sort returns to page `1`; a shrinking result clamps the
  current page to the last valid page.
- Market age remains a range: two selects expose `All` plus every integer age
  from `15` through `40`. Crossing the bounds clamps the other bound to the
  newly selected age.
- Read-only money remains exact rather than abbreviated and follows the active
  UI locale and currency.
- Transactional Market player details do not light-dismiss from backdrop or
  scrollbar/gutter interaction. Explicit close and `Escape` remain available.

These are bounded interface defaults, not game rules. They may be amended in
the relevant step before implementation if product feedback changes them.

## Accepted Inventory

### P80-R01 — Current Achievement Versus Potential Upside

Current evidence:

- `PlayerStarRating` renders the current rating using the existing gold palette
  and dark-orange sixth slot.
- `PlayerPotentialRangeRating` receives only the public lower/upper range. It
  cannot identify which filled portion is already achieved.
- The Market screenshots therefore show Level and Potential with nearly the
  same visual weight, while all potential slots use the range treatment.

Accepted outcome:

- Potential receives the current rating as an explicit presentation fact.
- The already-achieved segment uses the same solid color as Level.
- Future ordinary upside uses a distinctly lighter yellow; future sixth-star
  upside uses a distinctly lighter orange.
- The Phase 79D range meaning remains visible:
  - current-to-lower conservative projection is light and solid;
  - lower-to-upper uncertain upside is light and patterned;
  - beyond the public upper remains a neutral outline.
- Half-star boundaries remain exact.
- Shape/pattern, DOM state, and localized accessible text communicate the
  distinction without relying on color alone.

Owner:

- reusable React renderer and web design tokens;
- framework-free public range remains owned by `@game/ui`.

Non-goals:

- no change to current rating, stored potential, public P90 projection,
  development, sorting, value, or scouting;
- no singular “guaranteed potential” label.

Verification:

- component tests cover current, conservative, uncertain, half-star, and sixth
  segments;
- Market, Squad, and both player-detail consumers share the same renderer;
- desktop, narrow, high-contrast-by-shape, and accessible-label browser checks.

### P80-R02 — Market Pagination, Debounced Filters, And Age Selects

Current evidence:

- `CareerMarketScreen` rebuilds the entire target view on every query or number
  input event and renders every filtered row.
- `buildCareerMarketTargetView` filters and sorts the complete collection but
  has no page input or page metadata.
- Age is currently entered through free numeric minimum/maximum fields.

Accepted outcome:

- `@game/ui` owns deterministic filter-sort-paginate ordering and exposes page,
  page size, total rows, and total pages.
- React keeps responsive draft values; text/value filters reach the read model
  after `250 ms`.
- Role, employment, contract, negotiability, and age selects remain immediate.
- Age uses two accessible `15..40` range selects with an `All` state and
  deterministic bound clamping.
- Controls show the visible row interval and total, and provide keyboard-
  accessible Previous/Next plus direct page navigation appropriate to the
  available page count.

Owner:

- filter/sort/page facts in `@game/ui`;
- draft timing and controls in React;
- no server, engine, or persistence pagination.

Non-goals:

- no infinite scrolling, virtualization, remote query, new market eligibility
  rule, page-size preference, or persisted filter state.

Verification:

- read-model tests prove filter -> sort -> paginate order and page clamping;
- fake-timer tests prove exactly one delayed application;
- browser QA covers typing, sorting, paging, reset, focus, narrow layout, and
  `200%` text.

### P80-R03 — Squad Age, Placement Order, And Debounced Search

Current evidence:

- the Squad public row and column contract omits age even though the adapter
  already has the player's valuation age;
- the current order places Placement after Status;
- player-name search rebuilds the view on every keystroke.

Accepted outcome:

- age becomes a sortable public Squad fact;
- desktop order becomes `#`, `Role`, `Placement`, `Player`, `Age`, `Condition`,
  `Morale`, `Status`, `Value`, `Level`, `Potential`, `Action`;
- narrow/card labels preserve the same information hierarchy;
- player-name search applies after `250 ms`; dropdown filters remain immediate.

Owner:

- Squad columns, row facts, filtering, and sorting in `@game/ui`;
- domain-to-view age mapping in the existing Squad adapter;
- timing and layout in React.

Non-goals:

- no new squad selection rule, tactic assignment rule, player-age derivation,
  or persisted table preference.

Verification:

- `@game/ui` tests cover column order, age projection, and age sorting;
- adapter tests prove canonical age mapping;
- browser QA covers search timing, placement editing, action-menu focus, and
  desktop/narrow layouts.

### P80-R04 — Canonical Money Presentation And Editable Money Input

Current evidence:

- read-only Market, Squad, profile, contract, and finance surfaces already use
  `formatMoneyFromMinorUnits`;
- the English screenshots correctly use English grouping
  (`€132,496,875`), so replacing it with Italian punctuation independent of
  UI language would be a regression;
- editable transfer/contract fields still use separate raw-string parsing and
  do not share one locale-aware presentation contract.

Accepted outcome:

- every read-only amount uses the shared exact minor-unit formatter with an
  explicit whole/minor precision decision;
- currency grouping, decimal separators, and currency placement follow the
  active UI language and currency;
- table values remain whole-unit exact amounts; cents appear only where the
  existing product fact requires them;
- editable monetary controls share one locale-aware, integer-safe parser and
  formatter, remain easy to edit, and normalize on blur without floating-point
  conversion;
- money columns retain tabular numerals and useful non-wrapping behavior.

Owner:

- shared web money presentation/parsing boundary;
- domain `MoneyAmount` remains the sole monetary fact owner.

Non-goals:

- no `K`/`M` abbreviation, currency conversion, economics tuning, value
  rounding policy change, or duplicate monetary type.

Verification:

- unit tests cover all supported locales, grouping, invalid/ambiguous input,
  zero, large safe values, and round trips;
- a source audit finds no user-visible manual currency concatenation in the
  accepted surfaces;
- browser QA covers Market offer and contract renewal editing.

### P80-R05 — Transfer-Offer Draft And Dialog Stability

Current evidence:

- the shared native full-screen dialog closes when any click targets the
  dialog backdrop itself;
- the full-screen scroll owner leaves gutters around the narrower article, so
  pointer/scrollbar interaction can reach that light-dismiss seam;
- existing Market tests prove ordinary fee editing and tab persistence but do
  not cover accidental backdrop/gutter/scroll interaction with a dirty draft.

Accepted outcome:

- a Market transfer-offer draft survives fee editing, scrolling, tab changes,
  and backdrop/scrollbar/gutter interaction until explicit close, `Escape`, or
  successful command handling;
- the shared dialog exposes an explicit light-dismiss policy rather than a
  Market-specific DOM workaround;
- existing focus restoration and native modal semantics remain intact.

Owner:

- shared full-screen dialog primitive owns dismissal policy;
- Market player dialog owns transactional opt-out and draft identity.

Non-goals:

- no global removal of backdrop close from non-transactional dialogs;
- no new confirmation flow, autosave, persistence, or transfer command.

Verification:

- a regression test first captures the reported interaction path and proves
  the edited fee remains present;
- browser QA covers mouse, keyboard, scrolling, tab switches, explicit close,
  focus restoration, and submission.

## Ordered Delivery

1. Step 03 — P80-R01 star language.
2. Step 04 — P80-R02 Market pagination and filtering.
3. Step 05 — P80-R03 Squad row contract and delayed search.
4. Step 06 — P80-R04 shared money presentation/input contract.
5. Step 07 — P80-R05 transfer-offer dialog stability.
6. Step 08 — integrated browser, accessibility, architecture, and regression
   closeout.
7. Step 09 — Phase 80 report and truthful Phase 80A handoff, without a long
   run.

The order lets Squad reuse the debounce primitive established by Market and
lets the dialog regression run against the final money-input behavior.

## Deferred Long-Run Owner

Phase 80 runs no longitudinal cohort. The user accepted further player-model,
market, and loan reworks after this inventory was frozen, so executing the
cohort here would validate an intermediate product and be discarded.

The one replacement `50 x 20` belongs only to Phase 80C Step 09, after Phase
80A and all Phase 80B bounded gates. Its seed, checkpoint directory, `50`
stable shards, `7` workers, and report path are frozen in:

- `docs/audits/PHASE_80B_INCOMING_OFFERS_MARKET_POSTURES_AND_LOANS_DESIGN_CONTRACT.md`
- `docs/steps/80b-incoming-offers-market-postures-and-loans/10-checkpointed-50x20-phase-report-and-phase-79-handoff.md`

That cohort validates the complete accepted rework chain and the deferred
Phase 79D longitudinal evidence; it does not replace Phase 79 Step 14's
release-scale gate.

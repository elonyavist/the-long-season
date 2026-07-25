# Transfer Window Source Audit

Date: 2026-07-23
Phase: `79-transfer-market-windows-negotiations-and-market-workspace`
Step: `02-playable-competition-transfer-window-catalog`

## Purpose

Record the researched source, retrieval date, and resolved dates behind every
transfer-window template shipped for a playable competition. Transfer dates are
content facts, not user settings; each playable competition must have a cited
row before it ships. The game ships no speculative rows for leagues it cannot
start.

## Playable Competitions

### `competition:demo-third-division` (Italian professional third tier demo)

- Source: FIGC 2026/27 professional registration periods.
- URL: <https://www.figc.it/it/federazione/news/approvati-i-criteri-per-le-riammissioni-le-sostituzioni-e-i-ripescaggi-nei-campionati-professionistici-szuz8fvh>
- Retrieved: 2026-07-23.
- `sourceKey`: `figc-2026-27-professional`.
- First supported season (2026/27), both boundaries inclusive:
  - Summer window: `2026-07-01` .. `2026-09-01`.
  - Winter window: `2027-01-02` .. `2027-02-01`.
- Later-season derivation: the same competition-owned month/day template rolls
  forward deterministically. For a season starting in calendar year `Y`, the
  summer window resolves in year `Y` and the winter window in year `Y + 1`. No
  wall-clock access and no random drift; the same season year always resolves to
  the same absolute dates until a content release deliberately updates the row.

## Ownership

- Template + resolver: `packages/content/src/generators/transfer-window-catalog.ts`
  (`transferWindowTemplateFor`, `resolveSeasonTransferWindows`,
  `seasonStartYearFromDate`). Content imports `@game/domain` and `@game/shared`
  only.
- Domain vocabulary + validation + status:
  `packages/domain/src/value-objects/transfer-window.ts` (`TransferWindow`,
  `SeasonTransferWindows`, `seasonTransferWindows`, `resolveTransferWindowStatus`,
  `TransferWindowError`). Every supported competition has exactly two inclusive
  windows; reversed, unordered, overlapping/touching, or non-two window sets are
  rejected.
- World-generation link: `createFakeLeagueSystem` resolves and exposes
  `transferWindows: SeasonTransferWindows` on `FakeLeagueSystem`, keyed by the
  generated competition identity and season.

## Determinism And Boundary Behavior (tested)

- `2026-06-30` closed → `2026-07-01` open (inclusive open boundary).
- `2026-09-01` open (inclusive close boundary) → `2026-09-02` closed, next
  opening `2027-01-02`.
- `2027-02-01` open → `2027-02-02` closed, no further opening in this season.
- A season starting `2027` resolves `2027-07-01`..`2027-09-01` and
  `2028-01-02`..`2028-02-01`.

## Explicitly Not Shipped

- No English, Spanish, German, French, or other league rows: none are playable.
- No user-editable calendar, environment variable, tuning panel, or admin UI.
- No offer eligibility or negotiation behavior (Step 03 owns eligibility).

# Player Market Calibration Provenance Ledger

Date: 2026-07-28  
Status: Reproduced and accepted for `player-market-calibration-transfermarkt-it-2026-07-28-v1`

## Scope And Classification

This ledger makes the aggregate market snapshot reproducible without committing
HTML or real-player rows. Values read from source pages are
`observed_source_fact`; arithmetic over those values is `derived_aggregate`;
tolerances and game curves are `explicit_game_design_target`.

Transfermarkt describes market value as a community estimate rather than a
transfer fee or a single algorithm. The game therefore uses this snapshot only
as distributional evidence. See the
[source definition](https://www.transfermarkt.com/navigation/mwdefinition).

## Capture Contract

- Retrieval completed: `2026-07-28T20:54:35+02:00`.
- Retrieval time zone: `Europe/Rome`.
- Source host and locale: `https://www.transfermarkt.it`.
- Season selector: `2026/27`, URL `saison_id/2026`.
- Currency: EUR.
- Competition entry pages: IT1, IT2, IT3A, IT3B, and IT3C.
- Roster pages: every club listed by each competition entry page, using
  `/{club-slug}/kader/verein/{club-id}/saison_id/2026/plus/1`.
- Included player rows: roster-table rows with a numeric displayed market
  value.
- Excluded player rows: rows whose market value was absent or `-`. They count
  in `listedPlayerCount` and `excludedUnvaluedCount`, but not in the percentile
  population or value total.
- Unit normalization: `mln € × 1,000,000`, `mila € × 1,000`; normalized euros
  were converted to integer minor units.
- Percentiles: Hyndman-Fan type 7 linear interpolation,
  `h=(n-1)p`, followed by rounding to the nearest euro.
- Market-value cross-check: all four top-100 pages per competition were read;
  their numeric rows exactly matched the corresponding highest roster values.
- No captured HTML, player identity, or row-level dataset is retained.

## Exact Paginated URLs

For every competition, pages `1`, `2`, `3`, and `4` were retrieved:

- `https://www.transfermarkt.it/serie-a/marktwerte/wettbewerb/IT1/saison_id/2026/pos//detailpos/0/altersklasse/alle/plus/1/page/{1..4}`
- `https://www.transfermarkt.it/serie-b/marktwerte/wettbewerb/IT2/saison_id/2026/pos//detailpos/0/altersklasse/alle/plus/1/page/{1..4}`
- `https://www.transfermarkt.it/serie-c-girone-a/marktwerte/wettbewerb/IT3A/saison_id/2026/pos//detailpos/0/altersklasse/alle/plus/1/page/{1..4}`
- `https://www.transfermarkt.it/serie-c-girone-b/marktwerte/wettbewerb/IT3B/saison_id/2026/pos//detailpos/0/altersklasse/alle/plus/1/page/{1..4}`
- `https://www.transfermarkt.it/serie-c/marktwerte/wettbewerb/IT3C/saison_id/2026/pos//detailpos/0/altersklasse/alle/plus/1/page/{1..4}`

`{1..4}` is an explicit enumeration of four URLs, not a runtime endpoint or
glob. The roster endpoint template above was instantiated for these captured
club IDs:

- IT1: `46, 5, 506, 6195, 1047, 800, 12, 430, 1025, 398, 130, 410, 252,
  6574, 1390, 416, 607, 1005, 8970, 2919`.
- IT2: `4172, 276, 458, 2239, 1385, 1038, 2331, 749, 2581, 1429, 4554,
  3037, 4097, 4159, 5587, 4255, 4171, 20519, 2655, 408`.
- IT3A: `41101, 132806, 4084, 5514, 46619, 4095, 24898, 6692, 26789,
  52687, 4103, 4541, 2251, 91510, 11483, 5542, 26251, 44223, 4553, 56265`.
- IT3B: `41110, 3522, 5621, 2921, 1105, 45894, 22045, 4330, 46337,
  18642, 34499, 1210, 2253, 9816, 4102, 7030, 839, 4326, 4333, 9793`.
- IT3C: `41119, 332, 1627, 380, 6089, 4031, 10118, 33734, 22408, 7197,
  6266, 9818, 49430, 22249, 22048, 4341, 5585, 4083, 4106, 704`.

## Reproduced Aggregate Results

| Sample | Clubs | Listed | Included | Unvalued | Total | Median | P90 | P99 | Maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| First / IT1 | 20 | 651 | 649 | 2 | €5,620.90m | €4.00m | €23.00m | €50.00m | €85.00m |
| Second / IT2 | 20 | 596 | 583 | 13 | €522.25m | €450k | €2.20m | €5.00m | €12.00m |
| Third / IT3A | 20 | 540 | 500 | 40 | €91.755m | €150k | €300k | €601k | €1.80m |
| Third / IT3B | 20 | 596 | 555 | 41 | €119.615m | €150k | €400k | €1.338m | €3.50m |
| Third / IT3C | 20 | 530 | 489 | 41 | €104.540m | €150k | €400k | €1.060m | €3.00m |
| Third combined | 60 | 1,666 | 1,544 | 122 | €315.910m | €150k | €375k | €1.20m | €3.50m |

The complete machine-readable figures and classifications are in
`packages/content/src/balance/player-market-calibration.json`.

## Denominators And 22-Senior Comparator

Raw squad averages divide total source value by source club count. The
canonical game comparator instead multiplies mean value per listed player by
exactly 22 active seniors; it is derived context, not a source fact.

| Division | Mean per listed player | Raw source squad average | Normalized 22-senior comparator |
| --- | ---: | ---: | ---: |
| First | €8.634m | €281.045m | €189.954m |
| Second | €876k | €26.113m | €19.278m |
| Third combined | €190k | €5.265m | €4.172m |

## Pre-79C Game Baseline

- Repository commit: `f2c7013d4b91fb0c9fcf185adca8384b6cdcb584`.
- Relevant source diff SHA-256: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
  (the empty digest: generation and valuation owners were clean).
- Runtime: Node `v24.19.0`.
- Command form:
  `source /Users/elianarducci/.nvm/nvm.sh && nvm use 24 && node --input-type=module < phase79c-current-baseline.mjs`.
- Seed prefix: `phase79c-current-baseline`.
- Worlds: `100`.
- Per-category sample: `100 × 18 × 22 = 39,600`.
- Projection: generate independent 18-club/22-senior populations for each
  category using the same deterministic IDs, seeds, reputation sequence
  `4..9`, initial contracts, neutral form `50`, and the pre-79C valuation
  config. Sort integer minor-unit values and apply the same type-7 percentile.

| Projection | Mean | Median | P90 | P99 | Maximum |
| --- | ---: | ---: | ---: | ---: | ---: |
| First | €5.501m | €5.500m | €7.455m | €8.883m | €10.201m |
| Second | €3.029m | €3.008m | €4.093m | €4.897m | €5.690m |
| Third | €1.769m | €1.741m | €2.371m | €2.870m | €3.423m |

The measured model fails the locked target tolerances: the lower-tier
population is too expensive while the first-tier upper tail is compressed.
No target was widened to make this baseline pass.

## Reproduction Recipe

1. Fetch each competition entry with `saison_id/2026`.
2. Extract the 20 table-owned club IDs, then fetch the corresponding detailed
   roster endpoint with `plus/1`.
3. Parse only numeric market-value cells under the inclusion policy above.
4. Reconcile included plus unvalued with listed rows for every competition.
5. Fetch all 20 market-value pages listed above and cross-check their numeric
   rows against the top 100 roster values per competition.
6. Aggregate in integer euros, calculate type-7 percentiles, convert to minor
   units, and compare the output to the versioned JSON.
7. Run the pre-79C projection with the recorded commit/runtime/seed dimensions.

The application contains no code for these network steps. Updating the source
version is a deliberate offline review and requires a new dated asset.

## Phase 79D Youth And Prospect Extension

Retrieval completed `2026-07-29` in `Europe/Rome` through the public
Transfermarkt.it competition market-value pages. This extension is evidence
for monetary age/prospect factors only. Transfermarkt does not publish The Long
Season star ratings, stored potential, realization probabilities, or public
potential ranges.

### Reproduction method

For IT1, IT2, IT3A, IT3B, and IT3C:

1. open the competition `marktwerte` page;
2. set `altersklasse/u19` and separately `altersklasse/u21`;
3. retain only displayed numeric market values;
4. follow every pagination link exposed by that filtered result;
5. normalize `mln € × 1,000,000` and `mila € × 1,000`;
6. sort integer euros and calculate Hyndman-Fan type-7
   P50/P90/P99, rounded to the nearest euro;
7. retain only the aggregates below, not names, identities, HTML, or rows.

URL templates:

- `https://www.transfermarkt.it/serie-a/marktwerte/wettbewerb/IT1/pos//detailpos/0/altersklasse/{u19|u21}/land_id/0/only_loans/`
- `https://www.transfermarkt.it/serie-b/marktwerte/wettbewerb/IT2/pos//detailpos/0/altersklasse/{u19|u21}/land_id/0/only_loans/`
- `https://www.transfermarkt.it/serie-c-girone-a/marktwerte/wettbewerb/IT3A/pos//detailpos/0/altersklasse/{u19|u21}/land_id/0/only_loans/`
- `https://www.transfermarkt.it/serie-c-girone-b/marktwerte/wettbewerb/IT3B/pos//detailpos/0/altersklasse/{u19|u21}/land_id/0/only_loans/`
- `https://www.transfermarkt.it/serie-c/marktwerte/wettbewerb/IT3C/pos//detailpos/0/altersklasse/{u19|u21}/land_id/0/only_loans/`

The `u19` filter returned ages `17..18`; `u21` returned ages through `20`.
Competition market-value pages are bounded leaderboards rather than complete
roster populations: a `100`-row U21 result is explicitly labeled as the
observed top-100 list and must not be interpreted as every U21 player.

### Observed source facts

| Competition | Filter | Observed rows | Age min/max | P50 | P90 | P99 | Maximum |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: |
| IT1 | U19 | 16 | 17/18 | €2.00m | €12.50m | €27.75m | €30.00m |
| IT1 | U21 | 75 | 18/20 | €600k | €18.00m | €30.52m | €32.00m |
| IT2 | U19 | 13 | 17/18 | €300k | €740k | €976k | €1.00m |
| IT2 | U21 | 57 | 17/20 | €300k | €2.50m | €5.00m | €5.00m |
| IT3A | U19 | 16 | 17/18 | €112.5k | €225k | €377.5k | €400k |
| IT3A | U21 top 100 | 100 | 17/20 | €150k | €400k | €1.503m | €1.80m |
| IT3B | U19 | 16 | 17/18 | €100k | €350k | €1.76m | €2.00m |
| IT3B | U21 top 100 | 100 | 17/20 | €150k | €700k | €2.807m | €3.50m |
| IT3C | U19 | 14 | 18/18 | €125k | €780k | €1.422m | €1.50m |
| IT3C | U21 top 100 | 100 | 18/20 | €125k | €500k | €1.515m | €3.00m |

### Derived and design boundaries

- The percentiles above are `derived_aggregate`; the displayed values and age
  filters are `observed_source_fact`.
- A versioned game prospect-value curve or discount is an
  `explicit_game_design_target`; it cannot be attributed to Transfermarkt.
- Public potential lower/expected realization factors come only from the
  deterministic engine-outcome matrix in
  `EXCEPTIONAL_PLAYER_GENERATION_AND_PROSPECT_ECONOMY_79D_BASELINE.md`.
- No source row implies a six-star rating or a probability of reaching one.

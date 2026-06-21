# Club Identity Source Data Spec

Date: 2026-06-21
Phase: `29-club-identity-and-world-calendar-v1`
Step: `01-club-identity-source-data-spec.md`

## Goal

Replace placeholder club labels with deterministic fictional city-based identities that make long-run reports readable without using real club names or licensed competition data.

## Supported Countries

Phase 29 prepares source data for the launch countries already defined in `requirements.md`:

- Italy
- England
- Spain
- Germany
- France

The implementation should keep the data shape country-agnostic so later phases can add more nations or community content packs without changing the generation algorithm.

## City Pool Categories

Each country should provide city entries grouped by prominence:

- `large`: major national or international cities, best suited to first-division and high-reputation clubs.
- `medium`: regional cities, credible for second division or strong third-division clubs.
- `small`: smaller cities and provincial towns, best suited to third division and lower-reputation clubs.

City names are source content, not localization labels. They should use ASCII spellings in code for now to keep generated output stable and avoid encoding churn.

## Division-To-City Weights

Generation should choose the city pool from the competition level and club slot/tier.

| Division level | Large city weight | Medium city weight | Small city weight | Intent |
|---|---:|---:|---:|---|
| First division | High | Medium | Low | Big clubs usually come from prominent cities, with occasional smaller overperformers. |
| Second division | Medium | High | Medium | A mix of regional clubs, fallen larger clubs, and ambitious smaller clubs. |
| Third division | Low | Medium | High | Mostly provincial identity, with a few medium-city clubs. |

Current generated content is still a single demo third division, so its default should heavily prefer `small` and `medium` city pools.

## Fictional Club Name Patterns

Names must be fictional and IP-safe. Allowed patterns:

- `<Country abbreviation> <City>`, for example `A.C. Arezzo`, `U.S. Taranto`, `S.S. Terni`.
- `<City> <Country suffix>`, for example `Como Calcio`, `Salerno Calcio`, `Liverpool F.C.`, `Barcelona C.F.`.
- `<Football identity word> <City>`, for example `Virtus Trento`, `Pro Palermo`, `Real Gijon`, `Fortuna Kiel`, `Stade Laval`.
- `<Base pattern> <Country disambiguator>` only when the base name is already used or explicitly blocked.
- Numeric fallback only as an extreme deterministic last resort.

Naming vocabulary must be country-specific. For example, `Calcio`, `Pro`, `Virtus`, and `A.S.D.` are credible in Italy; `United`, `Town`, `Rovers`, `Athletic`, `Albion`, and `Wanderers` are credible in England/Scotland; `Real`, `Atletico`, `Sporting`, `Racing`, and `Deportivo` are credible in Spain; `VfB`, `VfL`, `SV`, `Fortuna`, and `Dynamo` are credible in Germany; `Stade`, `Olympique`, `Racing`, `AS`, and `RC` are credible in France.

The generator should not use a single global suffix pool. Words such as `Sporting`, `Club`, `Rangers`, `Union`, `Athletic`, and `Rovers` are valid only in countries where they sound natural.

Avoid names that knowingly match real professional clubs, especially exact combinations such as famous abbreviation/word plus famous city. The generator should be able to skip blocked full names when a known unsafe combination is listed.

## Short Names

Short names should be readable and stable:

- Prefer three-letter city-derived codes, e.g. `ARE`, `MOD`, `TRE`.
- Ensure uniqueness inside the league by deterministic suffix fallback only when needed, e.g. `MOD`, `MO2`.
- Do not derive short names from the old slot placeholder (`PRO01`) except as a last-resort technical fallback.

## Duplicate-Avoidance Rules

Within one generated league:

- No duplicate full club name.
- No duplicate short name.
- Prefer no duplicate city in the same division unless the source pool is exhausted.
- If a city repeats because a pool is exhausted, the naming pattern or disambiguator must differ and the short name must remain unique.

Across different seeds:

- The same city or naming pattern may appear again.
- Different seeds should be allowed to produce different city mixes.

Stable club IDs must not change. The identity changes are display content; simulation references keep `club:...` IDs.

## IP-Safety Rules

- Do not include real club names in source data.
- Do not use licensed competition names.
- Do not imply official licenses, historical continuity, or real-world affiliations.
- City names are acceptable, but the club identity attached to them must be fictional.
- Add a small explicit blocked-name list for obvious unsafe combinations and future expansion.

## Implementation Notes For Next Step

The next implementation step should:

- add country city pools and naming patterns under `packages/content/src/clubs/`;
- keep all generated identities deterministic from seed and club slot;
- preserve existing `club:` IDs;
- add focused tests for same-seed stability, different-seed variation, and duplicate avoidance.

# Club Identity And World Calendar Report

Date: 2026-06-21
Phase: `29-club-identity-and-world-calendar-v1`
Step: `05-club-identity-and-calendar-report.md`

## Result

Phase 29 is complete.

Generated career and simulation output now uses readable fictional city-based club names instead of `PRO01`-style placeholders. The current calendar model is documented and is sufficient for the first ten-season report as long as Phase 30 labels the world as a closed single-division simulation.

## Club Naming Model

The content package now provides:

- country city pools for Italy, England, Spain, Germany, and France;
- city prominence buckets: `large`, `medium`, `small`;
- division-to-city-pool weights;
- country-appropriate weighted fictional naming patterns;
- football identity words such as `Calcio`, `Pro`, `Virtus`, `Real`, `Atletico`, `Racing`, `Fortuna`, `Dynamo`, `Stade`, and `Olympique` only in countries where they are credible;
- country-flavoured disambiguator words used only when a base pattern-city name collides or is blocked;
- a blocked-name list for obvious unsafe combinations;
- seeded deterministic club identity generation.

Stable domain IDs are preserved:

- `club:province-01`, `club:province-02`, etc. remain the simulation identity.
- `Club.name` is now the user-facing generated identity.
- Current `shortName` values remain technical compatibility data and are no longer the primary CLI label.

## Sample Output - `world-a`

`pnpm cli simulate-season --seed=world-a` produced readable table rows such as:

- `A.C. Lecco`
- `Como Calcio`
- `Salerno Calcio`
- `U.S. Taranto`
- `A.S. Matera`
- `A.C. Cagliari`
- `Virtus Trento`

The summary also used generated club names:

- Top scorer: `Yaya Keita (A.S. Matera)`
- Best defense: `A.C. Lecco`
- Worst attack: `U.S. Ravenna`

## Sample Output - `world-b`

`pnpm cli simulate-season --seed=world-b` produced a different generated mix:

- `Virtus Ascoli`
- `U.S. Cagliari`
- `A.C. Parma`
- `A.S. Terni`
- `U.S. Arezzo`
- `Virtus Palermo`
- `Carpi Calcio`

The summary also used generated club names:

- Top scorer: `Enrico Corsi (A.S. Terni)`
- Best defense: `A.S. Terni`
- Worst attack: `U.S. Pescara`

## Career Preview Sample

`pnpm cli career --save=phase29-world-a --seed=world-a --new-world-preview` now prints:

- Selected club: `S.S. Perugia`
- Generated squad size: `22`
- Career save written: `yes`

This confirms generated club identity is persisted into career saves and reused by career presentation.

## Calendar Model

The current calendar remains:

- deterministic;
- one competition;
- 18 clubs in the demo third division;
- 34 rounds;
- 306 fixtures;
- double round-robin;
- weekly round spacing;
- same clubs across MVP season rollover;
- no promotion/relegation yet.

`docs/audits/WORLD_CALENDAR_V1_REVIEW.md` records the detailed limits and the Phase 30 reporting constraint.

## Readiness Decision

Phase 30 can start.

The ten-season report should proceed with this explicit framing:

- closed league;
- single competition;
- no cups;
- no playoffs;
- no promotion/relegation;
- same club set every season.

This is acceptable for the next goal because Phase 30 is an engine credibility report, not a full career pyramid simulation.

## Remaining Risks

- Club `shortName` still contains legacy `PROxx` values for technical compatibility. This is acceptable only while user-facing output uses `Club.name`.
- City pools are small curated v1 lists, not complete national gazetteers.
- The generator uses fictional country-specific naming patterns but should keep growing its blocked-name list as more countries and patterns are added.
- The calendar does not yet model real country competition rules.

## Manual Inspection Commands

Use these commands to inspect the current phase output:

```sh
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-b
pnpm cli career --save=phase29-world-a --seed=world-a --new-world-preview
pnpm cli career --save=phase29-world-a --summary
```

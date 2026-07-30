# Wage And Club Finance Calibration Source Audit

Date: 2026-07-28  
Status: Reproduced and accepted for `wage-finance-calibration-reportcalcio-2025-v1`

## Source

The independent source is
[ReportCalcio 2025, English edition](https://www.pwc.com/it/it/publications/reportcalcio/2025/doc/ReportCalcio2025_en.pdf),
published by FIGC with AREL and PwC. It reports the 2023/24 economic profile of
professional Italian football. Retrieval completed
`2026-07-28T21:02:00+02:00` in `Europe/Rome`.

The source is independent wage/club-finance evidence. Transfermarkt values
were not converted into wages.

## Reproduced Source Facts

The economic-profile and third-tier cost tables report:

| Source tier | Sample / population | Value of production | Employee cost | Employee cost / production |
| --- | --- | ---: | ---: | ---: |
| First | 20 / 20 clubs | €3.837bn aggregate; €191.85m/club derived | about €2.0bn aggregate; €100m/club derived | about 52% |
| Second | 20 / 20 clubs | €482.6m aggregate; €24.13m/club derived | €394.3m aggregate; €19.715m/club derived | 81.73% derived |
| Third | 46 / 60 clubs | €4.734m/club | €4.218m/club | 89.1% |

The first-tier salary total is printed approximately, so its stored
`approximate` flag is true. The second-tier 81.73% is arithmetic over printed
aggregates; ReportCalcio also discusses a broader players-and-coaches
wages/revenue ratio, which is not silently substituted here. Third-tier facts
use the reported 46-club sample, not an invented 60-club aggregate.

“Employee cost” is wider than player-only senior wages. These figures constrain
the order of magnitude and divisional pressure; they are not direct player
salary rows.

## Explicit Game-Design Targets

The following are reviewed game targets, not observed source facts:

| Division | Annual senior wage budget range | Median |
| --- | ---: | ---: |
| First | €60m..€140m | €90m |
| Second | €10m..€25m | €16m |
| Third | €2m..€4.5m | €3m |

The target committed-senior-wage band is `70%..95%` in every tier. Rating wage
anchors, transfer budgets, cash reserves, negotiation demands, and AI
affordability remain design coefficients and are separately classified in the
six JSON assets. Later implementation steps must test those targets together;
they must not claim player-level salary fidelity to ReportCalcio.

## Limitations And Refresh Policy

- The financial source season (2023/24) differs from the market-value snapshot
  season (2026/27); versions therefore remain independent.
- Source clubs are real and structurally different from the fictional
  three-by-18 world.
- Accounting categories and game budget categories are not identical.
- No raw PDF or extracted rows are committed.
- A future update requires a new dated source audit and content version; the
  game never fetches this source at runtime.

# Phase 79A Transfer-Market Diagnostic Report

Date: 2026-07-27

## Purpose

This report is the durable diagnostic baseline for Phase 79A. It separates
verified medium-run facts from hypotheses that require new structured
observability before gameplay policy changes.

The source cohort was generated with:

```bash
pnpm cli ten-season-report \
  --seed-prefix=phase79-market-smoke-50x20 \
  --worlds=50 \
  --seasons=20 \
  --report-output=/tmp/phase79-market-smoke-50x20.md
```

The temporary artifact had SHA-256
`0b9e9e8ac8351c48d3da1afd559576c648bd8dc236a74c68bf8094ebaca9d18e`.
This report, rather than the temporary path, is the durable decision record.

## Locked Cohort Baseline

- Worlds: `50`.
- Seasons per world: `20`.
- Total simulated seasons: `1,000`.
- Execution: sequential, one worker.
- Partition hash: `d9f3b553d6fefb50`.
- Overall anomaly status: `FAIL`.
- Failed worlds: `1`.
- Warning worlds: `49`.
- Only failing check:
  `phase79-market-smoke-50x20-world-00025`,
  `champion_streak=7`.
- Contract/finance structural violations: `0`.
- Minimum senior squad size: `18`.
- Clubs below structural minimum: `0`.
- Clubs without a natural goalkeeper: `0`.
- Maximum annual wage utilization: `1.0000`.
- Maximum free-agent share: `0.4314`.
- Permanent-transfer turnover:
  - non-zero in `13 / 50` worlds;
  - zero, and therefore warning, in `37 / 50` worlds.
- Wage-utilization warning: `50 / 50` worlds.
- Free-agent population-share warning: `50 / 50` worlds.
- Contract lifecycle:
  - renewals: `187,157`;
  - releases: `17,346`;
  - expiries: `41,487`;
  - selected-club expiry decisions: `16,393`.
- Active population:
  - senior: `395..438`;
  - youth: `198..198`;
  - total: `593..636`.
- Match/competition context:
  - goals per match average: `2.980`;
  - goals per match p95: `3.050`;
  - table-spread average: `42.41`;
  - draw-rate average: `0.240`;
  - champion-streak maximum: `7`;
  - top-assist p95: `16`, maximum `17`.

## Existing Warning Semantics

| Check | Aggregation | Current boundary | Baseline interpretation |
|---|---|---|---|
| `transfer_turnover_available` | completed permanent transfers across one world | warn when unavailable or zero | Does not count preliminary agreements or activations. |
| `wage_budget_utilization` | maximum club utilization in each season, then maximum season in the world | pass `<0.95`; warn `0.95..1`; fail `>1` | One exact-ceiling club-season warns the whole world. |
| `free_agent_population_share` | maximum seasonal free-agent share in the world | pass `<=0.25`; warn above | Reports stock peak, not inflow/outflow or employability. |
| `champion_streak` | longest streak in the world | at 20 seasons: pass `<4`; warn `4..6`; fail `>=7` | Football-story boundary outside Phase 79A tuning. |
| `goals_per_match_avg` | average across the world | pass `2.3..3.0`; warn outside; fail outside `2.0..3.2` | Narrow monitor edge; cohort aggregate is healthy. |
| `top_assist_max` | maximum season value | pass `<=15`; warn `16..23`; fail `>=24` | Story/monitor signal outside Phase 79A tuning. |
| `senior_active_player_population` | minimum and maximum owned senior population | pass `396..450`; warn outside | Six worlds dip only to `395`; structural squad checks remain clean. |
| `total_active_player_population` | minimum and maximum owned senior plus academy population | pass `594..648`; warn outside | Mirrors the one-player senior edge, not a roster collapse. |

No threshold or classification is changed in Step 01.

## Representative Seasonal Evidence

These are diagnostic samples, not cohort aggregates.

### World 00025 — Zero Permanent Transfers, Failed Dynasty Story

- Permanent transfers: `0`.
- Preliminary agreements created: `525`.
- Preliminary activations: `311`.
- Peak free-agent share: `0.4099` in season 16.
- Free-agent share:
  `0.0000`, `0.0195`, `0.0732`, `0.1278`, `0.2120`, `0.2723`,
  `0.2958`, `0.3344`, `0.3571`, `0.3681`, `0.3750`, `0.3750`,
  `0.3838`, `0.3982`, `0.4068`, `0.4099`, `0.3970`, `0.3633`,
  `0.3504`, `0.3462`.
- Wage utilization starts at `0.8873`, reaches `0.9486` in season 2,
  touches `1.0` from season 3, and later fluctuates mostly below the ceiling.
- Minimum squad size stays structurally safe.
- The seven-title A.S. Padova streak coexists with six unique champions,
  average streak table spread `44.71`, and no market/contract/finance
  corruption.

### World 00041 — Highest Free-Agent Share

- Permanent transfers: `0`.
- Preliminary agreements created: `531`.
- Preliminary activations: `291`.
- Peak free-agent share: `0.4314` in season 16.
- Free-agent share:
  `0.0000`, `0.0114`, `0.0431`, `0.0989`, `0.2142`, `0.2585`,
  `0.2978`, `0.3285`, `0.3464`, `0.3574`, `0.3669`, `0.3858`,
  `0.3982`, `0.4103`, `0.4149`, `0.4314`, `0.4120`, `0.3734`,
  `0.3739`, `0.3683`.
- Wage utilization touches `1.0` in several early and later seasons but is not
  continuously at the ceiling.
- Goals per match are `3.03`, only `0.03` beyond the warning boundary.

### World 00023 — One Permanent Transfer

- Permanent transfers: `1`, completed in season 1.
- Preliminary agreements created: `516`.
- Preliminary activations: `301`.
- Peak free-agent share: approximately `0.424` in season 16.
- Free-agent share later falls to approximately `0.3543` in season 20.
- The permanent-transfer warning passes solely because the world has one
  completion; the report cannot yet explain why later windows produce none.

## Finding Classification

### Structural Integrity

Verified:

- transfer-window, negotiation-clock, and preliminary-agreement violation
  counters are zero;
- contract and finance structural violations are zero;
- no club crosses the senior-squad or natural-goalkeeper hard floor;
- wage utilization never exceeds `1.0`.

The Phase 79 market is genuinely active because the representative worlds
contain hundreds of preliminary agreements and activations. Preliminary
integrity and activation paths therefore do not pass only over empty state.

### Real Market-Economy Risks

Verified:

- permanent transfers are absent in a large majority of worlds;
- preliminary recruitment remains very active in those same representative
  zero-transfer worlds;
- the free-agent stock rises systematically for roughly sixteen seasons and
  remains well above the current monitor boundary after partial late-career
  correction.

These facts affect the intended lower-division football economy: current
players should move for fees when needs, seller willingness, and affordability
align, while parameters zero should be important without replacing nearly the
entire market.

### Diagnostic-Semantics Defects

Verified:

- `transfer_turnover_available` compresses the complete market into a binary
  permanent-completion headline and hides preliminary activity;
- `wage_budget_utilization` uses the single worst historical observation, so it
  cannot distinguish isolated exact-ceiling contact from widespread pressure;
- `free_agent_population_share` exposes only peak stock and cannot identify
  source, destination, age, ability, or time unattached.

### Football Stories And Monitors Outside Phase 79A

- The seven-title dynasty remains visible and keeps the generic gate red, but
  Phase 79A must not tune champion behavior.
- Goals, assists, table spread, and one-player active-population edges remain
  comparison metrics only.

## Hypotheses Requiring Step 02 Evidence

The following statements are hypotheses, not adopted fixes:

1. The permanent market may be starved because monthly market work occurs
   before the annual transfer-budget refresh.
2. Permanent target selection may reject most combinations because it requires
   current fee, signing bonus, wage capacity, seller willingness, and safe
   seller depth simultaneously.
3. The preliminary fallback may systematically consume recruitment
   opportunities after a permanent target cannot be submitted.
4. Expiries and releases may add players faster than structural replenishment
   and normal market demand remove them.
5. The closing free-agent pool may contain either useful prime-age players or
   mostly aging residual records; the current share cannot distinguish them.
6. Exact transfer-to-wage reallocation may create isolated `1.0` utilization
   observations without league-wide financial compression.

No hypothesis authorizes gameplay changes before the corresponding measured
funnel or stock/flow evidence exists.

## Locked Step 02 Vocabulary

### Permanent-Transfer Funnel

- recruitment needs evaluated;
- recruitable needs;
- permanent targets found;
- permanent targets unavailable, by structured reason;
- club offers submitted;
- seller rejection, counter, provisional acceptance, expiry, cancellation;
- player-table starts;
- player rejection, counter, acceptance, expiry, cancellation;
- unaffordable completion;
- completed permanent transfer.

### Preliminary-Agreement Funnel

- candidates found;
- offers submitted;
- rejection, counter, acceptance, expiry, withdrawal, cancellation;
- agreements created;
- activations attempted;
- activations completed;
- activation failures by structured reason.

### Free-Agent Stock And Flow

- opening and closing stock;
- expiry inflow;
- release inflow;
- ordinary free-agent-signing outflow;
- preliminary-activation outflow;
- retirement/career-step-down outflow;
- age band;
- canonical public/current ability band;
- time-unattached band.

### Wage Pressure

- p50, p90, p95, p99, and maximum club-season utilization;
- club-season count/share at `>=0.95`, exactly `1.0`, and `>1.0`;
- remaining annual-wage headroom distribution;
- exact-ceiling observations caused by transfer-to-wage reallocation.

## Locked Questions

1. At which exact permanent-transfer funnel stage are candidate deals lost?
2. Does market execution before annual transfer-budget refresh materially
   reduce affordable permanent targets?
3. How often does the preliminary fallback replace a failed permanent attempt,
   and for which structured reason?
4. Which events add players to and remove players from the free-agent pool?
5. How long do useful prime-age players remain unattached?
6. Is the large free-agent pool employable talent, aging residual population,
   or a classification/denominator problem?
7. How prevalent is wage pressure across club-seasons?

Step 02 must answer these questions with structured facts while preserving
fixed-seed gameplay behavior.

## Step 02 Structured Observability Result

Step 02 added diagnostics only. It did not change recruitment choices,
lifecycle ordering, budgets, valuation, willingness, squad targets, exits, or
warning thresholds. High-volume checkpoint observations are compacted by club,
department, stage, and stable reason before they leave the engine.

The fixed representative command was:

```bash
pnpm cli ten-season-report \
  --seed=phase79-market-smoke-50x20-world-00025 \
  --seasons=20
```

The football and pre-existing economy outcomes still match the locked baseline:

- distinct champions: `6`;
- longest champion streak: `7`;
- completed permanent transfers: `0`;
- peak free-agent share: `0.4099`;
- maximum wage utilization: `1.0000`;
- minimum senior squad and natural-goalkeeper structural checks remain clean.

This fixed-seed equality is the Step 02 evidence that observability did not
change gameplay output.

### Permanent-Transfer Funnel — World 00025

- recruitment needs evaluated: `49,714`;
- recruitable checkpoint-needs: `18,199`;
- permanent targets found: `0`;
- club offers submitted: `0`;
- completed permanent transfers: `0`;
- lost-stage reasons:
  - active-talk limit already reached: `25,925`;
  - transfer window closed: `17,699`;
  - club already handled at the checkpoint: `4,823`;
  - club could not recruit: `767`;
  - actual in-window target searches stopped by
    `seller_department_floor`: `500`.

The dominant reason among genuine in-window permanent target searches is
therefore not budget timing or unaffordable terms: every one of the `500`
searches reached suitable department players but seller department protection
correctly refused the move. Step 03 must reproduce this exact interaction and
may change only its canonical owner without weakening the floor.

### Preliminary-Agreement Funnel — World 00025

- candidates found and offers submitted: `2,625`;
- player/club rejections: `1,227`;
- agreements reached: `469`;
- expiries: `924`;
- activations completed: `311`;
- activation cancellations: `130`;
- principal loss reasons:
  `preliminary_target_unavailable=15,574`,
  `player_unwilling=852`,
  `negotiation_deadline=873`,
  `club_terms_unaffordable=375`,
  `contract_overlap=91`,
  `current_contract_expired=51`,
  `unaffordable=39`.

This confirms that clubs blocked from a permanent target remain highly active
in the preliminary market. The Step 01 value `525` counted live/agreed
agreement observations across seasons; the new `469` value counts actual
agreement events and must not be compared as the same metric.

### Free-Agent Stock And Flow — World 00025

Every season reconciles exactly:

`opening + expiry + senior release + academy external move + academy release
+ other inflow - ordinary signing - preliminary activation - retirement
- career step-down - other outflow = closing`.

The reconciliation delta is `0` in all 20 seasons and residual
`other_in`/`other_out` is `0` after source classification.

Representative rows:

| Season | Open | Expiry in | Senior release in | Academy external in | Academy release in | Ordinary signing out | Retirement/step-down out | Close |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 0 | 0 | 0 | 4 | 8 | 0 | 0 | 12 |
| 3 | 12 | 10 | 0 | 8 | 19 | 0 | 0 | 49 |
| 16 | 408 | 2 | 7 | 0 | 22 | 16 | 9 | 414 |
| 20 | 321 | 0 | 0 | 0 | 27 | 17 | 16 | 315 |

Across closing-stock observations the age bands are
`under23=1,267`, `23-29=3,094`, `30-34=989`, `35+=94`; current-ability
bands are `<8=5,206`, `8-9=236`, `10-11=2`, `12+=0`; time-unattached bands
are `<1 season=5,014`, `1-2 seasons=177`, `3+ seasons=253`.

The pool is therefore not a hidden population of high-quality prime-age
players. It is overwhelmingly below current ability `8`, with annual academy
release inflow continuing after contract-expiry inflow has nearly disappeared.
Step 04 must treat the pool as a lifecycle-equilibrium problem, not manufacture
arbitrary senior demand for non-viable players.

### Wage Distribution — World 00025

- utilization p50: `0.8269`;
- p90: `0.9807`;
- p95: `0.9997`;
- p99: `1.0000`;
- maximum: `1.0000`;
- club-season share at `>=0.95`: `0.1667`;
- exact-ceiling share: `0.0472`;
- above-budget share: `0.0000`;
- exact-ceiling club-seasons following transfer-to-wage reallocation: `14`;
- annual-wage headroom p10: `14,109,000`;
- annual-wage headroom p50: `115,310,000`.

This is pressure in a minority of club-seasons, not universal compression.
Step 05 owns the warning-semantics correction; the `>1.0` structural failure
remains unchanged.

## Step 03 Pre-Change Decision Contract

### Measured Bottleneck

World `00025` has `49,714` checkpoint-needs and `18,199` recruitable
checkpoint-needs, but zero permanent targets, offers, or completions in every
one of its 20 seasons.

The `500` actual permanent searches inside an open transfer window fail at the
seller department floor:

- goalkeeper: `75`;
- midfielder: `425`;
- defender and attacker: `0` searches reached target evaluation.

The larger upstream loss is `active_talk_limit_reached=25,925`, but a focused
experiment proved that this is not the permanent-target root cause. Ignoring
agreed preliminary contracts in the only shared counter reduced that loss and
raised preliminary starts from roughly `2,600` to roughly `9,000`, while
permanent targets remained zero. That experiment was rejected.

The reproducible owner is the interaction between need derivation and the
seller floor:

- every generated opening squad has the same broad shape:
  `2` goalkeepers, `10` defenders, `3` midfielders, and `7` attackers;
- the protected floor is `2/6/6/3`, so no club may legally sell a midfielder
  and only defenders/attackers have opening supply;
- the previous quality reason compared only the whole department average with
  the squad average, so it did not recognize a materially weak depth player in
  those sellable departments;
- after one unsuccessful high-priority permanent department, the same pass
  could start a preliminary fallback and mark the club handled before every
  current-window department was exhausted.

Every AI club in the representative world shows the same substitution:

- all `17` AI clubs record zero permanent targets/offers/completions;
- every one starts preliminary talks;
- preliminary starts range from `47` to `427` per club across 20 seasons;
- all 20 seasons remain permanently silent while preliminary starts are
  non-zero from season 2 onward and reach `83..346` per season from season 5
  onward.

Budget timing and affordability are not the measured pre-target loss: no
permanent offer reaches either check in this world.

### Adopted Football Reason

A current-window recruitment pass must evaluate every genuine department need
before falling back to a contract that will activate only after expiry. A
department can also have a real quality need when one depth player is at least
two public current-ability points below his department average, even if the
department average itself is not weak.

The canonical owner remains `deriveAiMarketNeeds` plus its deterministic
current-window traversal:

- quality-gap derivation now detects that weak depth outlier;
- a failed in-window department defers preliminary fallback while the same club
  still has another permanent need;
- agreed preliminary arrivals remain inside the future-planning cap, but only
  offers/counters consume the current permanent-talk cap; the full cap is
  rechecked before another preliminary offer.

This opens demand in departments where another club can sell legally. It does
not weaken a seller floor, increase an annual transfer cap, force a target,
override affordability, or alter selected-club agency.

### Locked Acceptance Boundary

For the named representative sample `00025`, `00041`, and `00023` over 20
seasons (`1,020` AI club-seasons):

- permanent targets found must be at least `0.10` per AI club-season;
- permanent offers submitted must be at least `0.05` per AI club-season;
- completed permanent transfers must be at least `0.01` per AI club-season;
- at least one individual season and at least one AI club may still finish
  with zero permanent completion;
- constrained-club, seller-floor, seller-refusal, affordability, window, and
  negotiation-clock outcomes remain legal losses;
- preliminary agreements remain separately counted and active.

This boundary measures opportunity and participation, not a guaranteed deal.

### Post-Change Result

The named `00025`, `00041`, and `00023` sample produced:

- permanent targets/offers: `190`, or `0.1863` per AI club-season;
- completed permanent transfers: `113`, or `0.1108` per AI club-season;
- world completions: `42`, `38`, and `33`;
- at least three AI clubs across the sample still completed zero permanent
  transfers;
- nineteen seasons per world remained without a permanent completion;
- preliminary agreements remained separately active;
- window, three-day-clock, affordability, selected-club, squad-size,
  goalkeeper, and department-floor invariants remained strict.

The accepted result is deliberately opportunity-based: the opening market can
move weak depth players through legal supply, while later quiet seasons expose
the separate long-run squad/free-agent circulation question owned by Step 04.

## Step 04 Free-Agent Decision Contract

### Pre-Change Classification

World `00025` proved a combination of two measured causes:

1. academy releases were the dominant inflow;
2. careers retained non-viable unattached players too long.

The pool was not primarily useful-player unemployment:

- closing-stock observations by current ability were
  `<8=5,206`, `8..9=236`, `10..11=2`, `12+=0`;
- only `2/5,444` observations met the prime-age/current-ability useful
  diagnostic;
- youth releases supplied the largest repeated inflow;
- ordinary recruitment already ranked free agents by public current ability
  and signed the strongest affordable positional fit when a squad had a real
  structural vacancy;
- structurally complete squads correctly stopped at their target rather than
  padding rosters.

The previous unattached-duration bands also had a factual defect. Academy
releases have no senior contract-history departure, so the report classified
them as newly unattached forever even though the youth lifecycle stores an
exact `statusChangedAt`.

### Adopted Football Reason

A player released from an academy or senior club remains available for two
complete seasons. If he is still unattached after that interval and his public
current ability remains below `8`, he explicitly steps down from this playable
professional layer. This is a career-lifecycle outcome, not deletion triggered
by the population ratio.

Goalkeepers use a five-season interval because Step 06 proved that their later
maturation and retirement curve can otherwise exhaust the emergency supply.

The policy does not inspect hidden potential, sign a player mandatorily, touch
the selected club, enlarge squads, lower the warning threshold, or change the
permanent-transfer policy. Ability `8+` players and recent releases remain
available; older low-value players continue through the existing natural
retirement/step-down rules.

### Post-Change Result — World 00025

- peak free-agent share: `0.2119`, down from `0.4099`;
- final free-agent stock: `51`;
- maximum useful prime-age stock: `0`;
- stock/flow reconciliation delta: `0` in all 20 seasons;
- free-agent share is below the unchanged `0.25` monitor boundary;
- minimum squad size remains `18`;
- clubs below the minimum: `0`;
- clubs without a natural goalkeeper: `0`;
- permanent transfers remain `42`, preserving the Step 03 correction;
- wage utilization never exceeds `1.0`.

The pool rises during the initial two-season opportunity window, peaks at `164`
players in season 6, and then remains bounded while explicit step-down outflow
absorbs old low-ability cohorts. Late annual youth releases can still raise the
closing stock, so the policy does not manufacture a fixed count.

## Step 05 Wage Diagnostic Semantics

### Before-Change Distribution

After the Step 04 population correction, world `00025` records:

- maximum utilization: `1.0000`;
- p50: `0.8131`;
- p90: `0.9788`;
- p95: `0.9958`;
- p99: `1.0000`;
- club-season pressure share at `>=0.95`: `0.1806`;
- exact-ceiling share: `0.0417`;
- above-budget share: `0.0000`;
- exact-ceiling observations after transfer-to-wage reallocation: `13`;
- p10 headroom: `14,862,000` minor units;
- p50 headroom: `124,475,000` minor units.

There is no accounting defect to correct. A minority of club-seasons operates
under pressure, exact contact is visible but not widespread, no commitment is
above its budget, and positive headroom remains at both p10 and p50.

### Adopted Report Semantics

The maximum remains a headline metric, but it no longer assigns severity by
itself. Four stable checks now have one meaning each:

- `wage_budget_overspend`: structural failure when any club-season is above
  budget;
- `wage_budget_pressure_prevalence`: football-story warning when at least
  `25%` of club-seasons are at or above `0.95`;
- `wage_budget_exact_ceiling_prevalence`: football-story warning when at least
  `10%` of club-seasons are exactly at `1.0`;
- `wage_budget_headroom_p10`: informational remaining annual-wage room.

World `00025` now reports contract/finance `PASS` while still printing its
`1.0000` maximum, p95/p99, `0.1806` pressure share, `0.0417` exact share,
zero overspend, reallocation attribution, and headroom. No budget, contract
demand, replenishment, transfer, or free-agent behavior changed in Step 05.

## Step 06 Final Cohort And Phase Decision

The final behavior was verified over the same 50 deterministic worlds and 20
seasons per world. Eight worker partitions reduced wall-clock time only; every
world retained the locked `phase79-market-smoke-50x20-world-NNNNN` seed.

| Metric | Locked baseline | Final Phase 79A |
|---|---:|---:|
| Worlds with a permanent completion | `13 / 50` | `50 / 50` |
| Permanent completions | not exposed as an aggregate funnel | `1,719` |
| Maximum free-agent share | `0.4314` | `0.2274` |
| Maximum useful free-agent stock | not exposed | `3` |
| Wage pressure warning | `50 / 50` from any maximum `1.0` | prevalence `0.1900` |
| Exact wage-ceiling share | not exposed | `0.0400` |
| Above-budget share | no observed overspend | `0.0000` |
| Minimum senior squad | `18` | `18` |
| Clubs below minimum | `0` | `0` |
| Clubs without natural goalkeeper | `0` | `0` |
| Contract/finance structural violations | `0` | `0` |

The final permanent funnel records `2,631,510` evaluated needs,
`2,218,109` recruitable observations, `3,149` targets and offers, and `1,719`
completed transfers. The preliminary funnel remains separately active with
`160,320` offers, `23,999` agreements, and `16,312` activations.

The gate reproduced three structural edge cases: concurrent provisional
transfers completing against changed seller depth; below-minimum replenishment
stopping on an unavailable preferred department; and retirement removing a
club's final player in one broad department. The fixes recheck AI seller
structure at negotiated completion, permit a non-preferred free-agent fallback
only below the hard squad minimum, and defer retirement only when it would
empty a department. No player is generated, no selected-club decision is
automated, no threshold is weakened, and no transfer is guaranteed.

The generic report remains `FAIL` for `champion_streak=7` in worlds `00001`
and `00046`. Goals, assists, active-population edges, and dynasty signals remain
visible and were not tuned.

Repeated output hashes match byte for byte:

- `00025`: `c70983aa1831399eae0108dcf80f2c1d3ab1513b788d81e64adda2a06be299a1`;
- `00041`: `5e64535b0acae9e079d7d5fd53760f21388198fbb27ba9f8e67e4633add65a98`;
- `00023`: `91f5f94faf9bdb7e7804555148ad91eae8a7e3f89d24d671443e5bc25665325c`.

Phase 79A accepts its owned criteria and returns control to Phase 79 Step 14.
The Phase 79 `750 x 50` gate remains unrun and unclaimed.

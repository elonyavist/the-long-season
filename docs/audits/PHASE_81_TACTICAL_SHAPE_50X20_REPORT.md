# Phase 80A Prospect And Player-Economy Bounded Gates Report

Date: 2026-08-01
Seed prefix: `phase81-tactical-shape-50x20`
Worlds: 50
Seasons per world: 20
Total seasons: 1000
Execution: sharded; workers=7; shards=50; resumed=50; resumed_worlds=50; simulated_worlds=0; partition_hashes=36fec0be88b140c7,7f1e272cb2f9ed13,df26b722ad6bce3b,923bcaef1eddf66e,6bc7ab3003bdd697,db2f26a2f31d86c1,8ea84de48a84efd9,c248fbe8533b0f4d,38b3e4efe31793ae,ce85e2565a5e4905,85fa6f2ebe078cd9,9c9eb9d04b2a32fc,20638fdf05c8c282,3af39c88f49f5973,2de237edfb68605b,03e27099a16b591b,f79a03be9f9dbee5,7be023a710b1c3e7,b7ac2273cf4fe8ed,5cf4c5509d04826b,3df77c3882ed0a6c,0f451ec1109b2faa,3a0398dfa66af706,c9b4dc640092b636,5799fa9a17cfd146,1e8bc7bc0eed5e95,5eeb5f7b5b475406,3a74a0b542445338,5ba3e37dac17e8e2,0a5ff33e4fef7d1d,b94191f84d276d97,5f567ee1eb0a0d2d,bedd95501c890300,0057c512ce135d6b,b4c60dfe06aeb10e,f3e90e5684bd17c8,69dc6dda016bb74e,22c98ffa61d804fc,1917ff785f581878,96561b2820c7da81,04c5a89cc2416de1,e8c7eaeacf3e0ca6,0417c6a392ab5c9a,b286fcf333c880f1,30be159f1d016049,a84f2718dbf73850,0129fee6d3b63a53,9ee80bdad5601dc2,c1082af3270adf23,0c65e0c0fc63fb8b
Status: FAIL

## Aggregate Metrics

- Failed worlds: 50
- Warning worlds: 0
- Player-economy gate violations: 160
- Closing division-value fit: FAIL
- Closing checkpoint season start year: 2046
- Closing division-value observations: 59926
- Closing division-value violations: 12
- Year-10 rating-stock observations: 50/50
- Year-10 current-six maximum observed: 2
- Year-10 stored-ceiling-six maximum observed: 10
- Year-10 lower-tier stored-ceiling-six maximum observed: 2
- Goals per match average: 2.670
- Goals per match p95: 2.740
- Table spread average: 38.64
- Table spread minimum world average: 34.70
- Draw rate average: 0.270
- Draw rate maximum world average: 0.280
- Champion streak max observed: 6
- Top assist max p95: 15
- Production warning max: assists=15 top1=0.29 top3=0.54
- Age 30+ share p95: 0.20
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 5579
- Role coverage warnings p95: 119
- Youth roster max observed: 11
- Active player count min/max: senior=1190..1357 youth=594..594 total=1784..1951
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 14
- Club cash floor (minor): 706227182
- Maximum annual wage utilization: 1.0000
- Annual wage utilization distribution: p50=0.6200; p90=0.9800; p95=0.9800; p99=1.0000; pressure share=0.1500; exact ceiling share=0.0200; above budget share=0.0000; reallocation exact ceiling count=413
- Annual wage headroom (minor): p10=12320000; p50=541450000
- Maximum free-agent share: 0.2627
- Maximum useful free-agent stock: 21
- Free-agent closing-stock band observations: age under23/23-29/30-34/35+=226335/79592/37208/25190; ability <8/8-9/10-11/12+=252926/94677/16315/4407; unattached <1/1-2/3+ seasons=112810/188271/67244
- Permanent-transfer funnel: needs=17784086; recruitable=14018505; targets=286111; unavailable=17497975; offers=286111; seller rejected/countered/accepted/expired/withdrawn=121582/131536/154668/9244/781; player started/countered/rejected/counter-accepted=154501/0/27254/0; unaffordable=781; completed=107103; lost reasons=active_talk_limit_reached=71012, club_already_handled=1141904, club_cannot_recruit=2552665, counter_exceeds_capacity=781, implausible_downward_move=11226, permanent_start_limit_reached=2977638, seller_department_floor=64264, transfer_terms_unaffordable=60900, transfer_window_closed=10618366
- Preliminary-agreement funnel: candidates=238250; unavailable=11266423; offers=238250; rejected/countered/counter-accepted/counter-rejected=119051/0/0/0; agreements=74917; expired=44263; activations=54592; activation failures=15219; lost reasons=active_talk_limit_reached=7800089, club_terms_unaffordable=53348, contract_overlap=12966, current_contract_expired=2162, negotiation_deadline=42101, player_unwilling=65703, preliminary_start_limit_reached=592117, preliminary_target_unavailable=2874217, unaffordable=2253
- Permanent-transfer public values: count=107103; p50=41975100; p90=870091400; p99=2594542900; max=11374000000
- Permanent-transfer asking prices: count=107103; p50=55452600; p90=1142386851; p99=3547034400; max=16227225000
- Permanent-transfer completed fees: count=107103; p50=52493175; p90=1073130000; p99=3337748854; max=15923600000
- Free-agent public values: count=82165; p50=9943600; p90=127299800; p99=1254008600; max=11374000000
- Free-agent non-zero completed fees: 0
- Sampled player value min/max (minor): 795300..15000000000
- Contract lifecycle: renewals=550876; releases=48507; expiries=126550; selected expiry decisions=16884
- Warning check counts: senior_active_player_population=50, total_active_player_population=50, youth_active_player_population=50, free_agent_population_share=39, champion_streak=6, table_points_spread_avg=3
- Signal check counts: monitor=150, structural=39, story=9
- Failing check counts: player_economy_young_stored_ceiling_six_stock_arrival_category_placement=50, contract_finance_structural_integrity=13, preliminary_agreement_integrity=12
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Player Economy Non-Vacuous Gates

| Gate | Observations | Violations | Failed worlds | Not evaluated worlds | Cohort proof | Threshold |
|---|---:|---:|---:|---:|---|---|
| `age_seventeen_senior_public_upside_observations` | 3854 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | descriptive age-17 senior public-upside share; positive denominator required, no frozen quota |
| `ai_information_parity_offer_selection` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `ai_information_parity_target_ranking` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `ai_information_parity_willingness` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `annual_exceptional_intake` | 1000 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated -> generated -> accepted; active-stock bounds and replacement are checked from complete snapshots |
| `free_agent_zero_fee_and_value` | 82165 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every completed canonical free-agent movement has positive public value and exact zero transfer fee; value invariance is owned by intrinsic_public_value_invariance_free_agent |
| `hard_cap_eligibility_and_display` | 23 | 0 | 0 | 30 | matching=10 share_bps=4348 cohort_evidence=n/a cohort_minimum=n/a | positive cohort eligible population; zero ineligible exact/display collisions; eligible exact cap share <10000 basis points |
| `initial_established_current_six_stock` | 118 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening champions are current six, age >20, senior first-team players at strong First Division clubs |
| `initial_exceptional_allocation` | 89100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | established current-six 2..3; young stored-ceiling-six 4..5; lower-tier young stored-ceiling-six <=1; allocated/effective identity |
| `initial_young_stored_ceiling_six_stock` | 226 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening prospects are age 15..20, have stored ceiling six, and remain inside the content-supplied age/division current-rating guardrail |
| `intrinsic_public_value_invariance_contract_expiry` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_free_agent` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_owner_category` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_promotion_relegation` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_transfer` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `negotiation_counter_path` | 131536 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required counter observations and at least one completed-after-counter path |
| `negotiation_offer_spread` | 286111 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required offers; not structural 100% asking/offer equality |
| `negotiation_seller_outcomes` | 286111 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required accepted, rejected, and countered observations |
| `public_potential_range_ordering` | 188564 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | current <= P50 <= public upper <= stored ceiling |
| `stored_ceiling_six_joint_profile` | 596 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every stored-ceiling-six observation has positive public value; asking is measured separately |
| `stored_ceiling_six_prospect_value_observations` | 478 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required positive-valued stored-ceiling-six prospect population |
| `young_stored_ceiling_prospect_share_first_division` | 7496 | 0 | 0 | 0 | matching=1828 share_bps=2439 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 1500..2500 basis points |
| `young_stored_ceiling_prospect_share_second_division` | 7298 | 0 | 0 | 0 | matching=880 share_bps=1206 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 800..1500 basis points |
| `young_stored_ceiling_prospect_share_third_division` | 6656 | 0 | 0 | 0 | matching=521 share_bps=783 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 400..800 basis points |
| `young_stored_ceiling_six_active_stock` | 1050 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | complete world-season snapshots; stored ceiling count equals each snapshot's deterministic target (4 or 5) |
| `young_stored_ceiling_six_no_inflation` | 1000 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | adjacent-season arrivals never raise active stock above the closing snapshot's deterministic target |
| `young_stored_ceiling_six_stock_arrival_category_placement` | 1126 | 160 | 50 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals; outside First Division <=1; every introduced First Division placement is title_contender or playoff_contender |
| `young_stored_ceiling_six_stock_arrival_club_uniqueness` | 1126 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals introduce <=1 associated player per club; later market concentration remains descriptive |
| `young_stored_ceiling_six_vacancy_replacement` | 1000 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=900 cohort_minimum=1 | adjacent-season vacancies are replenished to the closing snapshot's deterministic target |

## Closing Checkpoint Division Public Values

This cohort is the active senior stock at the explicitly named closing season checkpoint; it is not a year-ten proxy.

| Division | Observations | Median | P90 | P99 | Maximum | Fit |
|---|---:|---:|---:|---:|---:|---|
| first_division | 20078 | 11531600 | 28700490 | 448433291 | 3480716600 | fail |
| second_division | 19946 | 8875650 | 13821350 | 99424545 | 2050306600 | fail |
| third_division | 19902 | 7379000 | 10524260 | 34617522 | 1925607600 | fail |

## Phase 79C Version And Replay Evidence

Exact calibration bundles:

- `{"topologyDecisionId":"fictional-three-tier-v1","playerRatingScaleVersion":"player-rating-scale-v7","playerMarketCalibrationVersion":"player-market-calibration-transfermarkt-it-2026-07-28-v2","valuationCurvesVersion":"valuation-curves-v5","askingPriceCurvesVersion":"asking-price-curves-v4","marketBehaviorCalibrationVersion":"market-behavior-calibration-v5","wageFinanceCalibrationVersion":"wage-finance-calibration-reportcalcio-2025-v1","playerDevelopmentEnvironmentVersion":"player-development-environment-v1"}`

| Seed | Initial composition hash |
|---|---|
| `phase81-tactical-shape-50x20-world-00001` | `1556d3a92ca27577` |
| `phase81-tactical-shape-50x20-world-00002` | `ae1aeafe28176053` |
| `phase81-tactical-shape-50x20-world-00003` | `fcc94f90ff8b0dc8` |
| `phase81-tactical-shape-50x20-world-00004` | `72427541eda77227` |
| `phase81-tactical-shape-50x20-world-00005` | `7baa3ccb85895a71` |
| `phase81-tactical-shape-50x20-world-00006` | `b93d53f97a764863` |
| `phase81-tactical-shape-50x20-world-00007` | `6e1d45f3fdeca932` |
| `phase81-tactical-shape-50x20-world-00008` | `11a1abfb01c42983` |
| `phase81-tactical-shape-50x20-world-00009` | `cec234ec755a09f1` |
| `phase81-tactical-shape-50x20-world-00010` | `467ce2e8a8f94d92` |
| `phase81-tactical-shape-50x20-world-00011` | `f994991a1cb76ddf` |
| `phase81-tactical-shape-50x20-world-00012` | `44dbb165f2b746f8` |
| `phase81-tactical-shape-50x20-world-00013` | `ef4bbce7a197e0e1` |
| `phase81-tactical-shape-50x20-world-00014` | `5bb15bbe6595b323` |
| `phase81-tactical-shape-50x20-world-00015` | `789a5d48679a02fe` |
| `phase81-tactical-shape-50x20-world-00016` | `b18bc9936dcb0c4e` |
| `phase81-tactical-shape-50x20-world-00017` | `6707f7fbf741ddfb` |
| `phase81-tactical-shape-50x20-world-00018` | `93adf8698b2b03c7` |
| `phase81-tactical-shape-50x20-world-00019` | `5382919a3fc644cc` |
| `phase81-tactical-shape-50x20-world-00020` | `3fc8689fc8f3db56` |
| `phase81-tactical-shape-50x20-world-00021` | `04228f3153dfeedc` |
| `phase81-tactical-shape-50x20-world-00022` | `8eab2e0912d5ac76` |
| `phase81-tactical-shape-50x20-world-00023` | `25df78306eae04ed` |
| `phase81-tactical-shape-50x20-world-00024` | `29034d684a2ccbfd` |
| `phase81-tactical-shape-50x20-world-00025` | `002ad3e23aec34ab` |
| `phase81-tactical-shape-50x20-world-00026` | `dcf7f2545e69c287` |
| `phase81-tactical-shape-50x20-world-00027` | `e65de29dc899d635` |
| `phase81-tactical-shape-50x20-world-00028` | `fe92f7e176b471bb` |
| `phase81-tactical-shape-50x20-world-00029` | `6737e7365a6014ca` |
| `phase81-tactical-shape-50x20-world-00030` | `dfd503f6f1004400` |
| `phase81-tactical-shape-50x20-world-00031` | `146f36ef2b56cfb3` |
| `phase81-tactical-shape-50x20-world-00032` | `29246ed0544998b9` |
| `phase81-tactical-shape-50x20-world-00033` | `4725e737113d6fa2` |
| `phase81-tactical-shape-50x20-world-00034` | `c2842581fe54a2a4` |
| `phase81-tactical-shape-50x20-world-00035` | `2022e2ae0fa4d9c7` |
| `phase81-tactical-shape-50x20-world-00036` | `16227e4036a5f890` |
| `phase81-tactical-shape-50x20-world-00037` | `012ead4c40d804e0` |
| `phase81-tactical-shape-50x20-world-00038` | `e964321389b109e8` |
| `phase81-tactical-shape-50x20-world-00039` | `c267c8612a46fb7b` |
| `phase81-tactical-shape-50x20-world-00040` | `3ab980e6f3c73afc` |
| `phase81-tactical-shape-50x20-world-00041` | `9537211e283c0c3d` |
| `phase81-tactical-shape-50x20-world-00042` | `e1e96a246250cddf` |
| `phase81-tactical-shape-50x20-world-00043` | `45625d335f0f2d9d` |
| `phase81-tactical-shape-50x20-world-00044` | `3e07abe64026786c` |
| `phase81-tactical-shape-50x20-world-00045` | `f5898d03873d16a4` |
| `phase81-tactical-shape-50x20-world-00046` | `c854f003bfbf040c` |
| `phase81-tactical-shape-50x20-world-00047` | `c9065f42bdf3c81e` |
| `phase81-tactical-shape-50x20-world-00048` | `93f20507811f61ab` |
| `phase81-tactical-shape-50x20-world-00049` | `156576eb107cfb39` |
| `phase81-tactical-shape-50x20-world-00050` | `9010e5f39ec5997f` |

## Phase 79C Closing Division Economy

### Wage Economy

| Seed | Division | Clubs | Players | Wage P50/P90/P99 | Committed P50/P90/P99 | Utilization P50/P90/P99 | Headroom P10/P50 |
|---|---|---:|---:|---|---|---|---|
| `phase81-tactical-shape-50x20-world-00001` | first_division | 18 | 399 | 15760000/38958000/94727600 | 439540000/619407000/649123800 | 0.0443/0.0828/0.1029 | 5563742000/8709710000 |
| `phase81-tactical-shape-50x20-world-00001` | second_division | 18 | 399 | 6940000/25518000/63054600 | 270570000/328315000/409957100 | 0.1651/0.2288/0.2658 | 882216000/1380100000 |
| `phase81-tactical-shape-50x20-world-00001` | third_division | 18 | 400 | 4815000/18063000/50670700 | 198550000/268927000/289362300 | 0.4809/0.6374/0.6499 | 153928103.1/219210000 |
| `phase81-tactical-shape-50x20-world-00002` | first_division | 18 | 396 | 15155000/37580000/111130500 | 452285000/518428000/729637800 | 0.0445/0.0699/0.1191 | 5697392000/8807770000 |
| `phase81-tactical-shape-50x20-world-00002` | second_division | 18 | 397 | 7600000/27522000/78270400 | 266860000/360176000/383340000 | 0.1825/0.2462/0.2845 | 770598000/1424950000 |
| `phase81-tactical-shape-50x20-world-00002` | third_division | 18 | 397 | 4810000/15010000/52678400 | 179000000/231121000/273391700 | 0.4728/0.6047/0.6229 | 148070367.8/222145000 |
| `phase81-tactical-shape-50x20-world-00003` | first_division | 18 | 401 | 15550000/40220000/137950000 | 463510000/661966000/680676700 | 0.0554/0.0670/0.0906 | 6103878857.6/8701765000 |
| `phase81-tactical-shape-50x20-world-00003` | second_division | 18 | 399 | 6950000/23900000/72152000 | 253345000/333439000/491734900 | 0.1431/0.2481/0.3984 | 801809000/1437800000 |
| `phase81-tactical-shape-50x20-world-00003` | third_division | 18 | 396 | 4625000/17165000/58909500 | 179465000/250260000/265015600 | 0.4647/0.6301/0.6437 | 141983776/209155102.5 |
| `phase81-tactical-shape-50x20-world-00004` | first_division | 18 | 406 | 15285000/37485000/129365500 | 445310000/592392000/720658700 | 0.0442/0.0819/0.0999 | 5597673000/8896380000 |
| `phase81-tactical-shape-50x20-world-00004` | second_division | 18 | 401 | 8100000/30920000/77920000 | 291165000/394544000/464816700 | 0.1733/0.3127/0.3603 | 758310000/1355290000 |
| `phase81-tactical-shape-50x20-world-00004` | third_division | 18 | 398 | 4575000/15714000/47257300 | 185090000/214556000/240001500 | 0.4174/0.5844/0.6784 | 111472020.8/260020000 |
| `phase81-tactical-shape-50x20-world-00005` | first_division | 18 | 398 | 17375000/40381000/93504200 | 469135000/571450000/658309600 | 0.0467/0.0783/0.0926 | 5572459000/8929075000 |
| `phase81-tactical-shape-50x20-world-00005` | second_division | 18 | 401 | 7780000/26610000/67000000 | 263290000/370501000/524335900 | 0.1677/0.2800/0.3890 | 780989000.6/1357225000 |
| `phase81-tactical-shape-50x20-world-00005` | third_division | 18 | 396 | 4845000/16850000/40399500 | 188790000/239843000/255716300 | 0.5043/0.6112/0.6877 | 108112450/193770000 |
| `phase81-tactical-shape-50x20-world-00006` | first_division | 18 | 398 | 15000000/36364000/91249800 | 407725000/592387000/675386500 | 0.0445/0.0732/0.1120 | 5582233000/8862210000 |
| `phase81-tactical-shape-50x20-world-00006` | second_division | 18 | 400 | 8415000/25054000/71045700 | 264210000/357158000/371145400 | 0.1639/0.2389/0.2689 | 916387000/1414540000 |
| `phase81-tactical-shape-50x20-world-00006` | third_division | 18 | 399 | 5370000/18370000/56621400 | 188955000/269721000/299681600 | 0.5165/0.7096/0.7834 | 104912857.7/186790409 |
| `phase81-tactical-shape-50x20-world-00007` | first_division | 18 | 401 | 15580000/40660000/99040000 | 499155000/602668000/686816600 | 0.0481/0.0831/0.1110 | 5585053000/8761040000 |
| `phase81-tactical-shape-50x20-world-00007` | second_division | 18 | 397 | 6900000/26524000/57218000 | 254910000/301549000/346872600 | 0.1468/0.2543/0.2675 | 940309694.7/1467885000 |
| `phase81-tactical-shape-50x20-world-00007` | third_division | 18 | 397 | 4930000/15866000/56520400 | 172405000/263858000/323012900 | 0.5068/0.6403/0.8144 | 106188143.6/183520715.5 |
| `phase81-tactical-shape-50x20-world-00008` | first_division | 18 | 402 | 15000000/36713000/132441200 | 447310000/583974000/771252600 | 0.0501/0.0768/0.1101 | 5539305000/8794665000 |
| `phase81-tactical-shape-50x20-world-00008` | second_division | 18 | 398 | 7350000/26703000/64384100 | 280640000/334119000/361660300 | 0.1452/0.2376/0.2469 | 933862714.5/1489995000 |
| `phase81-tactical-shape-50x20-world-00008` | third_division | 18 | 396 | 4745000/15980000/55374000 | 188565000/213734000/291844100 | 0.4488/0.6451/0.8618 | 127889020.7/242688572.5 |
| `phase81-tactical-shape-50x20-world-00009` | first_division | 18 | 400 | 15650000/38480000/95570400 | 460390000/571149000/663168100 | 0.0418/0.0764/0.1068 | 5633833000/8806115000 |
| `phase81-tactical-shape-50x20-world-00009` | second_division | 18 | 404 | 7180000/26390000/63628300 | 284085000/343867000/384747800 | 0.1439/0.2811/0.3498 | 797158000/1407990000 |
| `phase81-tactical-shape-50x20-world-00009` | third_division | 18 | 398 | 4840000/16226000/54866100 | 182215000/256795000/304185600 | 0.4614/0.6773/0.8477 | 86647000/213254796 |
| `phase81-tactical-shape-50x20-world-00010` | first_division | 18 | 402 | 15935000/38071000/90031900 | 453005000/547371000/601235400 | 0.0517/0.0628/0.0774 | 5652464000/8782105000 |
| `phase81-tactical-shape-50x20-world-00010` | second_division | 18 | 400 | 7685000/22304000/63202000 | 258520000/348936000/382537500 | 0.1487/0.2730/0.3586 | 827205000/1486582347.5 |
| `phase81-tactical-shape-50x20-world-00010` | third_division | 18 | 399 | 4810000/16462000/49751400 | 185550000/242401000/253838100 | 0.4701/0.6310/0.7378 | 91281183.9/222804898.5 |
| `phase81-tactical-shape-50x20-world-00011` | first_division | 18 | 399 | 15320000/36324000/139098600 | 416130000/654020000/667366800 | 0.0437/0.0882/0.0917 | 5671171000/8825710000 |
| `phase81-tactical-shape-50x20-world-00011` | second_division | 18 | 399 | 8570000/25326000/68525200 | 280385000/320919000/338364200 | 0.1545/0.2216/0.2950 | 908670000/1471191122.5 |
| `phase81-tactical-shape-50x20-world-00011` | third_division | 18 | 397 | 4930000/14926000/42517200 | 171860000/218850000/250772200 | 0.4361/0.6103/0.7557 | 109279000/219070306.5 |
| `phase81-tactical-shape-50x20-world-00012` | first_division | 18 | 401 | 15840000/38140000/97130000 | 440070000/688502000/745463000 | 0.0476/0.0987/0.1105 | 5515853000/8939160000 |
| `phase81-tactical-shape-50x20-world-00012` | second_division | 18 | 403 | 8350000/23000000/59306000 | 260110000/321430000/406951000 | 0.1497/0.2361/0.2573 | 880929000/1474125000 |
| `phase81-tactical-shape-50x20-world-00012` | third_division | 18 | 397 | 4700000/16580000/50599600 | 199830000/260458000/278357200 | 0.4983/0.6070/0.6994 | 126224858.4/203760000 |
| `phase81-tactical-shape-50x20-world-00013` | first_division | 18 | 405 | 14560000/38436000/113407200 | 420380000/615313000/825947300 | 0.0461/0.0725/0.1317 | 5565232000/8725570000 |
| `phase81-tactical-shape-50x20-world-00013` | second_division | 18 | 397 | 7600000/22872000/61913200 | 261550000/319494000/381918700 | 0.1578/0.2603/0.2956 | 819678714.7/1357040000 |
| `phase81-tactical-shape-50x20-world-00013` | third_division | 18 | 400 | 4985000/16546000/48150900 | 178070000/255707000/277890800 | 0.4641/0.6108/0.7743 | 117512000/207091123 |
| `phase81-tactical-shape-50x20-world-00014` | first_division | 18 | 399 | 16260000/40930000/102812600 | 455495000/598098000/710868400 | 0.0498/0.0850/0.0998 | 5926803000/8700320000 |
| `phase81-tactical-shape-50x20-world-00014` | second_division | 18 | 398 | 7790000/22139000/57199400 | 258525000/308863000/353616900 | 0.1606/0.2675/0.3536 | 734116000/1369210000 |
| `phase81-tactical-shape-50x20-world-00014` | third_division | 18 | 397 | 4510000/15838000/49062800 | 167380000/239831000/278051000 | 0.4339/0.6460/0.7072 | 107694266.5/236031837.5 |
| `phase81-tactical-shape-50x20-world-00015` | first_division | 18 | 404 | 16495000/36164000/92659900 | 428525000/597287000/703546300 | 0.0494/0.0803/0.0942 | 5661786000/8721790000 |
| `phase81-tactical-shape-50x20-world-00015` | second_division | 18 | 401 | 7410000/22610000/58410000 | 269455000/350784000/374892900 | 0.1627/0.2358/0.2651 | 901770000/1338545000 |
| `phase81-tactical-shape-50x20-world-00015` | third_division | 18 | 397 | 4800000/17318000/53934400 | 188420000/252826000/295992300 | 0.5100/0.6677/0.8020 | 91569000.6/208510000 |
| `phase81-tactical-shape-50x20-world-00016` | first_division | 18 | 397 | 16600000/36932000/92063600 | 447865000/596980000/681356700 | 0.0442/0.0719/0.1105 | 5697000000/8730905000 |
| `phase81-tactical-shape-50x20-world-00016` | second_division | 18 | 399 | 8360000/29216000/80227600 | 274965000/390346000/451849700 | 0.1597/0.2525/0.4160 | 883349000/1534270000 |
| `phase81-tactical-shape-50x20-world-00016` | third_division | 18 | 396 | 4685000/16685000/58655500 | 179270000/282881000/358538800 | 0.4833/0.6364/0.7915 | 105649327.6/204167959.5 |
| `phase81-tactical-shape-50x20-world-00017` | first_division | 18 | 398 | 16855000/37912000/77436900 | 424035000/551207000/781559800 | 0.0487/0.0739/0.1065 | 5887288000/8745630000 |
| `phase81-tactical-shape-50x20-world-00017` | second_division | 18 | 399 | 8220000/26172000/59809000 | 271710000/339001000/401577200 | 0.1661/0.2276/0.3419 | 929044775.7/1339630000 |
| `phase81-tactical-shape-50x20-world-00017` | third_division | 18 | 397 | 4730000/16668000/53198000 | 188150000/227711000/250917800 | 0.4804/0.5793/0.6574 | 136458429.1/217337858 |
| `phase81-tactical-shape-50x20-world-00018` | first_division | 18 | 400 | 15305000/37961000/98412400 | 424200000/580490000/677450900 | 0.0469/0.0682/0.0777 | 6101726857.9/8700655000 |
| `phase81-tactical-shape-50x20-world-00018` | second_division | 18 | 403 | 8240000/26166000/68822600 | 277360000/387492000/458644200 | 0.1643/0.2613/0.3056 | 771535000/1392845000 |
| `phase81-tactical-shape-50x20-world-00018` | third_division | 18 | 397 | 4760000/15600000/36267200 | 162040000/220027000/268094100 | 0.4507/0.5287/0.6019 | 167365898.5/222275000 |
| `phase81-tactical-shape-50x20-world-00019` | first_division | 18 | 401 | 14960000/37620000/107540000 | 427705000/594118000/640951300 | 0.0504/0.0740/0.0946 | 5881889000/8705110000 |
| `phase81-tactical-shape-50x20-world-00019` | second_division | 18 | 397 | 7980000/28956000/71113600 | 296545000/366948000/403000400 | 0.1800/0.2485/0.2776 | 927825000/1424235000 |
| `phase81-tactical-shape-50x20-world-00019` | third_division | 18 | 400 | 4865000/16282000/54663200 | 179065000/273571000/313381000 | 0.5034/0.6502/0.7739 | 93414061.9/197263469.5 |
| `phase81-tactical-shape-50x20-world-00020` | first_division | 18 | 406 | 19390000/38645000/95305000 | 461015000/711467000/739721600 | 0.0497/0.0867/0.0956 | 5551842000/8795965000 |
| `phase81-tactical-shape-50x20-world-00020` | second_division | 18 | 396 | 7330000/21060000/58427000 | 239985000/316178000/456606800 | 0.1500/0.2602/0.3478 | 841537143.4/1362025000 |
| `phase81-tactical-shape-50x20-world-00020` | third_division | 18 | 400 | 5065000/15580000/43808900 | 185415000/224401000/340691800 | 0.4477/0.6846/0.7865 | 87439571.6/227510000 |
| `phase81-tactical-shape-50x20-world-00021` | first_division | 18 | 402 | 17250000/38478000/112244200 | 440995000/609118000/813823500 | 0.0481/0.0773/0.1003 | 5636443000/8713010000 |
| `phase81-tactical-shape-50x20-world-00021` | second_division | 18 | 398 | 7040000/22599000/74075100 | 242700000/359773000/441048500 | 0.1569/0.2581/0.3062 | 840738000/1436415714.5 |
| `phase81-tactical-shape-50x20-world-00021` | third_division | 18 | 396 | 5025000/17485000/39876000 | 177875000/241302000/292201600 | 0.4471/0.5951/0.7007 | 116875000.6/232936225.5 |
| `phase81-tactical-shape-50x20-world-00022` | first_division | 18 | 411 | 15600000/39820000/121963000 | 460825000/718048000/783822200 | 0.0474/0.0838/0.1260 | 5593948000/8784540000 |
| `phase81-tactical-shape-50x20-world-00022` | second_division | 18 | 401 | 7660000/23200000/67400000 | 259315000/350139000/445167100 | 0.1554/0.2805/0.3243 | 782920000/1382977653.5 |
| `phase81-tactical-shape-50x20-world-00022` | third_division | 18 | 398 | 4725000/15217000/47575300 | 173065000/221302000/254173100 | 0.4805/0.6392/0.6994 | 97130163.7/191472041 |
| `phase81-tactical-shape-50x20-world-00023` | first_division | 18 | 404 | 15170000/42805000/131615600 | 438515000/810843000/954009400 | 0.0523/0.1018/0.1307 | 5595161000/8713570000 |
| `phase81-tactical-shape-50x20-world-00023` | second_division | 18 | 397 | 7180000/28068000/57192400 | 267635000/306997000/358283200 | 0.1405/0.2230/0.2409 | 959871000/1535095000 |
| `phase81-tactical-shape-50x20-world-00023` | third_division | 18 | 399 | 4820000/17292000/44740200 | 195560000/274614000/325942300 | 0.4598/0.6495/0.8172 | 117396000.4/219726122.5 |
| `phase81-tactical-shape-50x20-world-00024` | first_division | 18 | 404 | 14165000/36167000/90875400 | 391970000/536922000/716255000 | 0.0439/0.0721/0.0785 | 5798641000/8802850000 |
| `phase81-tactical-shape-50x20-world-00024` | second_division | 18 | 400 | 7350000/25855000/67212100 | 274315000/359759000/363020400 | 0.1724/0.2589/0.2977 | 783027000/1424235000 |
| `phase81-tactical-shape-50x20-world-00024` | third_division | 18 | 396 | 5075000/16595000/50498500 | 181145000/259066000/302399800 | 0.4988/0.6266/0.6968 | 115639980.1/226150816.5 |
| `phase81-tactical-shape-50x20-world-00025` | first_division | 18 | 401 | 16090000/40020000/98620000 | 472545000/613473000/664004000 | 0.0522/0.0749/0.1091 | 5577230000/8887410000 |
| `phase81-tactical-shape-50x20-world-00025` | second_division | 18 | 396 | 7285000/19750000/63245000 | 246975000/314138000/330386200 | 0.1431/0.2320/0.2841 | 952276000/1419385000 |
| `phase81-tactical-shape-50x20-world-00025` | third_division | 18 | 402 | 4935000/16061000/40284200 | 169200000/245720000/285735100 | 0.4739/0.6190/0.6883 | 117347000/220420000 |
| `phase81-tactical-shape-50x20-world-00026` | first_division | 18 | 399 | 16020000/38788000/121589200 | 454145000/648159000/869619500 | 0.0478/0.0886/0.1181 | 5631034000/8916435000 |
| `phase81-tactical-shape-50x20-world-00026` | second_division | 18 | 400 | 8695000/23954000/72912400 | 297560000/336196000/350258100 | 0.1744/0.2366/0.3255 | 825894286.2/1360010000 |
| `phase81-tactical-shape-50x20-world-00026` | third_division | 18 | 399 | 5400000/17484000/52601800 | 199545000/239612000/267680400 | 0.5053/0.6158/0.6588 | 114314000/213753776 |
| `phase81-tactical-shape-50x20-world-00027` | first_division | 18 | 400 | 15540000/39180000/94895100 | 411940000/594997000/802307100 | 0.0440/0.0843/0.1122 | 5989261572.5/8820145000 |
| `phase81-tactical-shape-50x20-world-00027` | second_division | 18 | 400 | 7290000/27225000/57917400 | 242630000/374777000/385840200 | 0.1547/0.2430/0.3595 | 759165000/1331940000 |
| `phase81-tactical-shape-50x20-world-00027` | third_division | 18 | 398 | 5005000/15682000/42578600 | 172375000/253695000/271398900 | 0.4264/0.6202/0.6756 | 109268041.8/234553674.5 |
| `phase81-tactical-shape-50x20-world-00028` | first_division | 18 | 406 | 16820000/38545000/121170500 | 479335000/599003000/903937800 | 0.0478/0.0870/0.1229 | 5518887000/8887590000 |
| `phase81-tactical-shape-50x20-world-00028` | second_division | 18 | 396 | 7275000/23755000/59442000 | 261020000/298475000/306679900 | 0.1479/0.2495/0.2763 | 765063000/1387075000 |
| `phase81-tactical-shape-50x20-world-00028` | third_division | 18 | 398 | 4635000/17621000/45807600 | 158710000/247487000/313379600 | 0.4078/0.6728/0.7611 | 93296612.3/227146429 |
| `phase81-tactical-shape-50x20-world-00029` | first_division | 18 | 407 | 15770000/43044000/106395000 | 494400000/615866000/677183900 | 0.0437/0.0880/0.1097 | 5542125000/8875655000 |
| `phase81-tactical-shape-50x20-world-00029` | second_division | 18 | 399 | 7620000/23350000/48041200 | 262445000/281030000/310750000 | 0.1458/0.2557/0.2689 | 869503000/1534880000 |
| `phase81-tactical-shape-50x20-world-00029` | third_division | 18 | 399 | 4700000/15930000/46451000 | 167645000/220468000/269419400 | 0.4417/0.5629/0.6454 | 140755735.7/214238572 |
| `phase81-tactical-shape-50x20-world-00030` | first_division | 18 | 404 | 16350000/38938000/109374800 | 459865000/652143000/735493100 | 0.0503/0.0830/0.1035 | 5610465000/9052909082 |
| `phase81-tactical-shape-50x20-world-00030` | second_division | 18 | 398 | 7910000/23094000/57990600 | 252210000/317024000/420341900 | 0.1536/0.2688/0.3421 | 783001000/1395805000 |
| `phase81-tactical-shape-50x20-world-00030` | third_division | 18 | 397 | 5160000/16406000/36229200 | 180475000/222010000/241074200 | 0.4602/0.5620/0.6318 | 138427857.8/231345000 |
| `phase81-tactical-shape-50x20-world-00031` | first_division | 18 | 401 | 13770000/33520000/142260000 | 390415000/553034000/744365400 | 0.0395/0.0805/0.1233 | 5675620000/8887725000 |
| `phase81-tactical-shape-50x20-world-00031` | second_division | 18 | 398 | 7820000/28349000/71221000 | 292510000/349011000/420244000 | 0.1811/0.2754/0.3022 | 782873000/1448385000 |
| `phase81-tactical-shape-50x20-world-00031` | third_division | 18 | 399 | 5360000/17846000/54105800 | 188045000/284442000/284965800 | 0.5051/0.6343/0.6907 | 131333715.3/214201633 |
| `phase81-tactical-shape-50x20-world-00032` | first_division | 18 | 406 | 16935000/41940000/90481000 | 460685000/615836000/831410100 | 0.0536/0.0836/0.1117 | 5526329000/8584430000 |
| `phase81-tactical-shape-50x20-world-00032` | second_division | 18 | 399 | 8050000/24736000/64295600 | 275095000/327636000/361250900 | 0.1646/0.2514/0.2580 | 895212000/1325970000 |
| `phase81-tactical-shape-50x20-world-00032` | third_division | 18 | 401 | 4920000/16660000/52900000 | 175960000/266401000/298886800 | 0.5059/0.6802/0.7582 | 110739857.3/189077857.5 |
| `phase81-tactical-shape-50x20-world-00033` | first_division | 18 | 405 | 15730000/41840000/115765200 | 436955000/613804000/765483100 | 0.0494/0.0789/0.1254 | 5536561000/8705325000 |
| `phase81-tactical-shape-50x20-world-00033` | second_division | 18 | 401 | 8530000/27390000/72090000 | 277300000/395928000/463898800 | 0.1669/0.2885/0.3539 | 762685714.8/1368687551.5 |
| `phase81-tactical-shape-50x20-world-00033` | third_division | 18 | 397 | 4920000/16554000/57600000 | 178315000/251388000/292854400 | 0.4763/0.6465/0.7376 | 130881000/202116837.5 |
| `phase81-tactical-shape-50x20-world-00034` | first_division | 18 | 398 | 16005000/35590000/93189200 | 412455000/566041000/735322500 | 0.0470/0.0660/0.0942 | 5716201000/8735015000 |
| `phase81-tactical-shape-50x20-world-00034` | second_division | 18 | 404 | 10055000/31690000/71273000 | 329390000/389390000/413039700 | 0.2015/0.2752/0.3502 | 750545000/1292990000 |
| `phase81-tactical-shape-50x20-world-00034` | third_division | 18 | 397 | 4690000/14918000/41807600 | 170540000/199473000/220076400 | 0.4238/0.5402/0.6597 | 130445000/219458674 |
| `phase81-tactical-shape-50x20-world-00035` | first_division | 18 | 399 | 16130000/40896000/111802800 | 497540000/587608000/763611000 | 0.0560/0.0787/0.0874 | 5763638000/9242247755.5 |
| `phase81-tactical-shape-50x20-world-00035` | second_division | 18 | 398 | 7340000/23791000/67209400 | 257580000/330422000/385759500 | 0.1626/0.2086/0.3024 | 848848000/1361785000 |
| `phase81-tactical-shape-50x20-world-00035` | third_division | 18 | 399 | 4690000/16918000/60757200 | 200835000/279994000/309479500 | 0.4650/0.6600/0.7489 | 112877000/206339184 |
| `phase81-tactical-shape-50x20-world-00036` | first_division | 18 | 400 | 15875000/36931000/98773900 | 417310000/550180000/670282400 | 0.0480/0.0687/0.0914 | 5693476000/8857550000 |
| `phase81-tactical-shape-50x20-world-00036` | second_division | 18 | 399 | 8870000/27924000/72591400 | 293415000/347041000/363939700 | 0.1625/0.2848/0.3018 | 770229000/1421730000 |
| `phase81-tactical-shape-50x20-world-00036` | third_division | 18 | 398 | 5035000/16638000/49141900 | 175280000/255252000/272057600 | 0.4698/0.6187/0.6630 | 117412450/213257449.5 |
| `phase81-tactical-shape-50x20-world-00037` | first_division | 18 | 401 | 17650000/42070000/121090000 | 448740000/677113000/835338200 | 0.0543/0.0838/0.1062 | 5633168000/8711295000 |
| `phase81-tactical-shape-50x20-world-00037` | second_division | 18 | 403 | 7460000/22598000/70295200 | 275430000/330675000/351688000 | 0.1465/0.2769/0.3326 | 789950449.6/1405355000 |
| `phase81-tactical-shape-50x20-world-00037` | third_division | 18 | 399 | 4890000/16176000/44583400 | 169540000/236014000/272897400 | 0.4445/0.5876/0.7517 | 97611081.7/235081429 |
| `phase81-tactical-shape-50x20-world-00038` | first_division | 18 | 400 | 16640000/37960000/78568100 | 420095000/578963000/763355300 | 0.0422/0.0827/0.1073 | 5588743000/8879660000 |
| `phase81-tactical-shape-50x20-world-00038` | second_division | 18 | 396 | 7120000/23685000/63020000 | 267715000/331653000/340759700 | 0.1525/0.2595/0.3096 | 767682000/1395252857.5 |
| `phase81-tactical-shape-50x20-world-00038` | third_division | 18 | 401 | 4980000/16320000/45250000 | 173140000/274798000/291272000 | 0.4295/0.6147/0.6485 | 132856123.4/241463266 |
| `phase81-tactical-shape-50x20-world-00039` | first_division | 18 | 403 | 16940000/38830000/104778200 | 479560000/622216000/677524100 | 0.0554/0.0793/0.1018 | 5590762000/9400805000 |
| `phase81-tactical-shape-50x20-world-00039` | second_division | 18 | 398 | 8180000/24124000/54733900 | 278755000/340272000/357456700 | 0.1618/0.2292/0.2779 | 910084571.9/1367490000 |
| `phase81-tactical-shape-50x20-world-00039` | third_division | 18 | 396 | 4665000/14150000/48746000 | 170090000/200850000/279821400 | 0.4324/0.6541/0.6998 | 88595877.9/242328470 |
| `phase81-tactical-shape-50x20-world-00040` | first_division | 18 | 402 | 17415000/39284000/87444300 | 492895000/597228000/730360000 | 0.0493/0.0833/0.1021 | 5916333000/8843825000 |
| `phase81-tactical-shape-50x20-world-00040` | second_division | 18 | 396 | 8270000/27235000/68881000 | 253530000/371453000/385144200 | 0.1705/0.2488/0.2729 | 879153000/1383325510.5 |
| `phase81-tactical-shape-50x20-world-00040` | third_division | 18 | 402 | 5120000/15376000/37968600 | 167345000/234626000/272225700 | 0.4096/0.6645/0.7819 | 106279000/224111735 |
| `phase81-tactical-shape-50x20-world-00041` | first_division | 18 | 399 | 15110000/36428000/111949600 | 406430000/595091000/672861000 | 0.0478/0.0817/0.0962 | 5630724000/8726135000 |
| `phase81-tactical-shape-50x20-world-00041` | second_division | 18 | 399 | 7220000/31976000/83086200 | 285230000/370291000/375121000 | 0.1751/0.2600/0.2806 | 838222000/1457025000 |
| `phase81-tactical-shape-50x20-world-00041` | third_division | 18 | 399 | 4730000/16460000/58149200 | 167635000/248718000/352713100 | 0.4433/0.7765/0.8208 | 73040042.2/224608265.5 |
| `phase81-tactical-shape-50x20-world-00042` | first_division | 18 | 403 | 15230000/38080000/137505200 | 444420000/618192000/645450800 | 0.0418/0.0766/0.1002 | 5675683286.1/8808405000 |
| `phase81-tactical-shape-50x20-world-00042` | second_division | 18 | 399 | 7460000/27574000/62218000 | 270335000/372805000/385195100 | 0.1489/0.2801/0.3067 | 844517000/1377380000 |
| `phase81-tactical-shape-50x20-world-00042` | third_division | 18 | 396 | 4820000/15600000/35373000 | 156405000/234017000/264868100 | 0.4679/0.5811/0.6210 | 122862857.8/206116123 |
| `phase81-tactical-shape-50x20-world-00043` | first_division | 18 | 397 | 16770000/39868000/111431600 | 496980000/615877000/730838500 | 0.0499/0.0827/0.0897 | 5612794000/8779715000 |
| `phase81-tactical-shape-50x20-world-00043` | second_division | 18 | 398 | 8275000/28271000/86918600 | 300680000/421053000/455132700 | 0.1733/0.3230/0.3513 | 821218816.7/1346410000 |
| `phase81-tactical-shape-50x20-world-00043` | third_division | 18 | 397 | 4550000/15688000/48738800 | 189790000/219972000/230687500 | 0.4585/0.6062/0.6511 | 116710796.7/214090000 |
| `phase81-tactical-shape-50x20-world-00044` | first_division | 18 | 401 | 14620000/39480000/90760000 | 428420000/606776000/809096100 | 0.0466/0.0842/0.1086 | 5585689000/8765095000 |
| `phase81-tactical-shape-50x20-world-00044` | second_division | 18 | 400 | 8085000/31668000/85921600 | 292240000/397872000/437832100 | 0.1734/0.2456/0.3371 | 812897286.1/1342125000 |
| `phase81-tactical-shape-50x20-world-00044` | third_division | 18 | 396 | 4435000/14610000/37021000 | 160760000/212041000/217728400 | 0.3860/0.5240/0.6437 | 154319878/263552960 |
| `phase81-tactical-shape-50x20-world-00045` | first_division | 18 | 400 | 15790000/38072000/77849300 | 430980000/523167000/530179300 | 0.0482/0.0693/0.0856 | 5656914000/8759015000 |
| `phase81-tactical-shape-50x20-world-00045` | second_division | 18 | 397 | 7380000/24772000/63235600 | 265235000/372865000/417722200 | 0.1777/0.2923/0.3738 | 867754571.5/1358670000 |
| `phase81-tactical-shape-50x20-world-00045` | third_division | 18 | 398 | 4915000/16375000/58144800 | 178150000/279644000/300228600 | 0.5308/0.6528/0.8057 | 121162224.9/180162449 |
| `phase81-tactical-shape-50x20-world-00046` | first_division | 18 | 400 | 14445000/41927000/83621500 | 451425000/574586000/591697800 | 0.0495/0.0817/0.0908 | 5535799000/8856780000 |
| `phase81-tactical-shape-50x20-world-00046` | second_division | 18 | 399 | 7480000/25724000/62666200 | 267005000/346206000/383402500 | 0.1686/0.2331/0.3236 | 898368000/1387195204.5 |
| `phase81-tactical-shape-50x20-world-00046` | third_division | 18 | 399 | 5200000/17818000/52815200 | 194380000/259309000/283771400 | 0.5595/0.6185/0.6647 | 108270347.3/196564490.5 |
| `phase81-tactical-shape-50x20-world-00047` | first_division | 18 | 400 | 14130000/38693000/96671100 | 425855000/588325000/666503100 | 0.0446/0.0780/0.1052 | 5694009000/8983060000 |
| `phase81-tactical-shape-50x20-world-00047` | second_division | 18 | 397 | 7700000/22010000/65390000 | 258235000/322965000/418756700 | 0.1633/0.2692/0.2866 | 740412000/1490185000 |
| `phase81-tactical-shape-50x20-world-00047` | third_division | 18 | 396 | 5095000/18645000/65312500 | 193825000/299210000/316915500 | 0.4864/0.6902/0.7195 | 103916143.8/229983674 |
| `phase81-tactical-shape-50x20-world-00048` | first_division | 18 | 406 | 14820000/40795000/91951500 | 429960000/532271000/617513600 | 0.0489/0.0754/0.0899 | 5547314000/9065750000 |
| `phase81-tactical-shape-50x20-world-00048` | second_division | 18 | 399 | 7470000/25250000/69792400 | 280995000/320659000/363300300 | 0.1689/0.2595/0.2839 | 862768000/1398370000 |
| `phase81-tactical-shape-50x20-world-00048` | third_division | 18 | 399 | 4530000/16862000/50258000 | 195385000/232974000/245442600 | 0.4907/0.5565/0.7158 | 119147286.7/223480919 |
| `phase81-tactical-shape-50x20-world-00049` | first_division | 18 | 404 | 15290000/38974000/100758400 | 421570000/628911000/813932700 | 0.0493/0.0695/0.0851 | 5616624000/8728325000 |
| `phase81-tactical-shape-50x20-world-00049` | second_division | 18 | 396 | 7255000/28285000/78230000 | 287700000/322130000/408792700 | 0.1561/0.2552/0.2800 | 831872001/1393405000 |
| `phase81-tactical-shape-50x20-world-00049` | third_division | 18 | 399 | 4590000/15324000/48335600 | 178875000/226108000/270197200 | 0.4663/0.5844/0.6187 | 118161715.5/209215000 |
| `phase81-tactical-shape-50x20-world-00050` | first_division | 18 | 402 | 15245000/39092000/72847400 | 456330000/564688000/662930900 | 0.0471/0.0667/0.0903 | 5691432000/9383495102.5 |
| `phase81-tactical-shape-50x20-world-00050` | second_division | 18 | 397 | 7780000/24788000/63590000 | 267190000/328955000/412750800 | 0.1507/0.2844/0.2986 | 891884000/1448392857.5 |
| `phase81-tactical-shape-50x20-world-00050` | third_division | 18 | 398 | 4955000/14668000/45780600 | 190335000/221869000/274234000 | 0.4503/0.6097/0.8023 | 113642286.8/224165000 |

### Cash, Transfer Room And Pending Exposure

| Seed | Division | Cash P50/P90/P99 | Transfer room P50/P90/P99 | Pending cash P50/P90/P99 | Pending wage P50/P90/P99 | Attempts/completed/free agents |
|---|---|---|---|---|---|---|
| `phase81-tactical-shape-50x20-world-00001` | first_division | 215859149579/248340668237.4/256393027128.28 | 11216163895.5/20556686779.6/26654613587.81 | 4125500/6496500/9454510 | 44405000/62823000/79475300 | 108/54/29 |
| `phase81-tactical-shape-50x20-world-00001` | second_division | 36171480468.5/42897501423.9/45469719861.78 | 1209771845.5/2464077589/5519462188.78 | 4532500/8154800/18226210 | 43455000/60629000/130183900 | 108/40/48 |
| `phase81-tactical-shape-50x20-world-00001` | third_division | 5199590613.5/6761998219.3/10552747152.08 | 256749349/929685097/1936654105.11 | 6871500/12396800/15584320 | 53595000/89873000/111318000 | 102/48/39 |
| `phase81-tactical-shape-50x20-world-00002` | first_division | 210958660595/249509941802/256426890259.72 | 9933062606.5/17935047987/21366588561.93 | 4411000/10333000/17976890 | 48665000/103043000/140725700 | 108/55/40 |
| `phase81-tactical-shape-50x20-world-00002` | second_division | 37695950872/44595086471/51222993840.81 | 1438607046/4834653418.5/12576376824.74 | 3683500/8601800/9647910 | 35590000/72197000/76225500 | 108/55/36 |
| `phase81-tactical-shape-50x20-world-00002` | third_division | 5457676285.5/9185165044.6/11219890292.28 | 217860692/1492188046.7/4811745088.56 | 4343000/10273900/13273930 | 34610000/73385000/97875300 | 102/49/40 |
| `phase81-tactical-shape-50x20-world-00003` | first_division | 212495650266/240654251730.6/256284274955.12 | 11990496520/18533492082.4/20122079848.13 | 4577500/9013900/17177260 | 48715000/77490000/138022800 | 107/55/34 |
| `phase81-tactical-shape-50x20-world-00003` | second_division | 37121579967.5/41951898162.6/42214497403.49 | 1275651723.5/2143824719.1/3348240687.6 | 4519000/8758600/14381290 | 40590000/66730000/102728000 | 108/39/45 |
| `phase81-tactical-shape-50x20-world-00003` | third_division | 5789093427.5/8692131782.2/10639817211.45 | 268040000/1700048801.4/3504731471.92 | 3159500/6153900/7158690 | 31365000/48247000/53208800 | 102/42/41 |
| `phase81-tactical-shape-50x20-world-00004` | first_division | 216297466575.5/250066426268/263341161187.9 | 10752571254/20306224456/26306950273.5 | 3433500/19840100/21530470 | 37235000/146395000/155002200 | 108/55/35 |
| `phase81-tactical-shape-50x20-world-00004` | second_division | 37759213717/42309630062.7/47352165267.38 | 1141613434/3139914736.7/6944529579.87 | 3363000/10412100/13550410 | 33630000/75339000/97337200 | 108/57/35 |
| `phase81-tactical-shape-50x20-world-00004` | third_division | 5565695238/6505999140.9/10636175781.27 | 213070099/472040413.2/1267192043.45 | 3398000/9315300/11340730 | 30915000/66534000/83397500 | 102/46/50 |
| `phase81-tactical-shape-50x20-world-00005` | first_division | 208538766896.5/250353192333.8/253619222798.99 | 11167145146/18109174779/27757064929.13 | 4750500/7955100/10331610 | 54155000/78912000/84137900 | 108/46/27 |
| `phase81-tactical-shape-50x20-world-00005` | second_division | 36726064053/42404975124.3/43073425399.65 | 1561434088.5/3124037460/4606773939.58 | 4355500/6988000/17227910 | 39635000/70447000/130057000 | 108/46/48 |
| `phase81-tactical-shape-50x20-world-00005` | third_division | 5547326909/6506665612/10678347101.12 | 217454927/322738827.5/380816229.58 | 3814500/6811800/13486330 | 35695000/53776000/97139000 | 102/46/48 |
| `phase81-tactical-shape-50x20-world-00006` | first_division | 218165050750.5/245214477082.3/256281157762.21 | 11459636473.5/19749324472/21703867358.23 | 4864000/10189000/13919060 | 46125000/92668000/110629000 | 108/47/48 |
| `phase81-tactical-shape-50x20-world-00006` | second_division | 37169099760.5/41388892481.8/42739666219.69 | 1085928176/3094594978.5/4000739863 | 4382500/6944000/16274760 | 37610000/70187000/125771600 | 108/53/40 |
| `phase81-tactical-shape-50x20-world-00006` | third_division | 5626084266.5/7216575827.2/11063820004.6 | 183092865/304299266.7/2192095185.32 | 3027500/6404900/7404200 | 30275000/47024000/56813900 | 102/57/31 |
| `phase81-tactical-shape-50x20-world-00007` | first_division | 216597258613/247189475456.3/251038831131.97 | 9838517694/21971500944.9/35214923649.65 | 3935500/8952600/12895850 | 49255000/81546000/101784300 | 108/59/35 |
| `phase81-tactical-shape-50x20-world-00007` | second_division | 38001385338/43728131170.7/46223483812.21 | 1798706437/5036357189.2/6010075523.47 | 3918500/9746800/11224110 | 37960000/71236000/88176200 | 108/54/42 |
| `phase81-tactical-shape-50x20-world-00007` | third_division | 5664446497/6377896253.6/10738593356.76 | 165110000/343887818.8/450826801.07 | 3255000/8384600/11334050 | 31080000/61634000/81542300 | 102/40/35 |
| `phase81-tactical-shape-50x20-world-00008` | first_division | 205285257950.5/239845089952.8/254692076813.31 | 11030138751/19772589028.5/23313207503.53 | 3944000/10259000/14594230 | 39440000/84143000/115134400 | 108/59/33 |
| `phase81-tactical-shape-50x20-world-00008` | second_division | 37080015571.5/42465386977/42753514929.53 | 1437395608.5/2987603924.8/3768841605.75 | 4947000/10483300/12060480 | 46895000/76962000/86444000 | 108/60/43 |
| `phase81-tactical-shape-50x20-world-00008` | third_division | 5802575193/7925878102.1/10807087463.71 | 199395909/1291790202.6/2734763954.63 | 2919000/5759300/8623870 | 29190000/44193000/62236600 | 102/48/44 |
| `phase81-tactical-shape-50x20-world-00009` | first_division | 206871631325.5/243003094620.4/259493624325.71 | 10175650781.5/19161352321.5/37965113363.67 | 4232500/12479000/42975100 | 48750000/96099000/306966400 | 108/48/45 |
| `phase81-tactical-shape-50x20-world-00009` | second_division | 36627207312.5/44068077238.7/45189125879.69 | 1693506649/3624036252.4/5050364359.33 | 5287000/11270800/12252400 | 48755000/83544000/95605400 | 107/53/34 |
| `phase81-tactical-shape-50x20-world-00009` | third_division | 5785340180/7635234257.9/11074398016.39 | 220233714.5/1066305940.1/2768787982.3 | 2954000/9398000/11976160 | 29540000/67796000/85916900 | 102/43/27 |
| `phase81-tactical-shape-50x20-world-00010` | first_division | 229661644481/243456531093.2/249352027576.8 | 10748173980/20820930445.5/35044752574.11 | 4779000/12775700/26202690 | 56550000/111576000/196551800 | 108/53/38 |
| `phase81-tactical-shape-50x20-world-00010` | second_division | 38620488444.5/43029402491.8/45969006234.37 | 1488258029/3753463106.9/4809344719.67 | 3706500/8038000/12833510 | 34110000/64407000/126237600 | 108/51/48 |
| `phase81-tactical-shape-50x20-world-00010` | third_division | 5422904091.5/7185182158.9/10889304542.85 | 182630049/1190130623.1/2810502974.77 | 2984500/6441900/8544870 | 27880000/47235000/65547300 | 99/57/37 |
| `phase81-tactical-shape-50x20-world-00011` | first_division | 200418565972.5/244402563978.4/247966815687.96 | 10628575176/20537706607.6/32135731466.91 | 4695000/10767300/12310830 | 46135000/86562000/107096600 | 108/44/44 |
| `phase81-tactical-shape-50x20-world-00011` | second_division | 37459596301.5/43878088158.2/49805126374.96 | 1601199475.5/4508739415.6/10158256110.48 | 5826000/9992200/13399040 | 49610000/78590000/95710500 | 108/47/25 |
| `phase81-tactical-shape-50x20-world-00011` | third_division | 5337296443.5/6980964106.6/10880389691.64 | 184027262.5/402048022.4/2095637928.68 | 3052500/8192100/11198490 | 30525000/61051000/80019300 | 102/37/52 |
| `phase81-tactical-shape-50x20-world-00012` | first_division | 209062814873/255781886927.3/257823841434.06 | 10989969159.5/21723334785.4/22573696399.02 | 3986000/10123800/10731780 | 46370000/78030000/83248300 | 106/54/39 |
| `phase81-tactical-shape-50x20-world-00012` | second_division | 37625673387/45009710200.3/45669053253.99 | 1651532468/4766388120.1/6439949207.61 | 4847000/9589100/13803590 | 44035000/69663000/99259800 | 108/56/37 |
| `phase81-tactical-shape-50x20-world-00012` | third_division | 5472841145/7107456524.7/10546442732.67 | 232778580/520250241.9/1942655457.86 | 4363500/9908800/12855050 | 34845000/70774000/91819900 | 102/49/46 |
| `phase81-tactical-shape-50x20-world-00013` | first_division | 220263240676.5/247556264102.4/252361676693.53 | 11839373418/17118002843.2/19016254930.3 | 5330500/17549200/22045730 | 51380000/142600000/197118800 | 108/48/39 |
| `phase81-tactical-shape-50x20-world-00013` | second_division | 36903601625.5/42582580810.6/42788465302.71 | 1517287003/2839441281.2/3421756269.84 | 5375500/9427700/13990620 | 48385000/73509000/101236600 | 108/50/49 |
| `phase81-tactical-shape-50x20-world-00013` | third_division | 5823774636.5/7411033055.8/11353322121.07 | 174295297.5/381546958.5/2341188773.48 | 2507000/6165600/9518660 | 25055000/45195000/71766400 | 101/45/40 |
| `phase81-tactical-shape-50x20-world-00014` | first_division | 211675580602.5/245973357247/257916035982.91 | 10721534691/17343439932.9/21751356188.81 | 4774000/10282700/12676250 | 50870000/80374000/123229900 | 108/58/38 |
| `phase81-tactical-shape-50x20-world-00014` | second_division | 38045066411/42472130279.1/43035141235.41 | 1441276628/3181634482.3/4815190057.91 | 4553000/11558200/14865540 | 40025000/87787000/106180300 | 108/36/48 |
| `phase81-tactical-shape-50x20-world-00014` | third_division | 5670032858/7774733080/10863222819.9 | 293306735/1431865588.2/2798451876.43 | 3343500/6308200/8026640 | 29645000/48523000/59866200 | 102/44/60 |
| `phase81-tactical-shape-50x20-world-00015` | first_division | 211863990351/246379037660.2/249359257705.52 | 11014325177.5/18384448778/26627903582.65 | 2994500/15585900/18105870 | 40250000/117078000/141486600 | 108/53/41 |
| `phase81-tactical-shape-50x20-world-00015` | second_division | 36946981821.5/42664060381.7/44948886190.36 | 1773725735.5/3177627722.1/5294973615.03 | 4084000/7576600/9489680 | 39600000/58165000/76105000 | 108/35/43 |
| `phase81-tactical-shape-50x20-world-00015` | third_division | 5551490429.5/8495138114/11263883670.29 | 298831198.5/1577349983.4/3040243711.74 | 2935000/7316500/10305950 | 26425000/55510000/78108100 | 100/46/34 |
| `phase81-tactical-shape-50x20-world-00016` | first_division | 212605188571/248970397395.2/255944763638.78 | 9195265720.5/17231150059/29065152480.16 | 3720000/24300000/35367580 | 43635000/175222000/253562700 | 108/63/37 |
| `phase81-tactical-shape-50x20-world-00016` | second_division | 38748237531/43776687603.3/45396478875.29 | 1712552821.5/4312371526.6/8052631829.57 | 3904500/8381900/11244010 | 39685000/63944000/108389000 | 108/56/37 |
| `phase81-tactical-shape-50x20-world-00016` | third_division | 5617043285/6447811623.5/10557719258.75 | 224957415/813444533.4/1079527780.43 | 3168000/7816900/10009680 | 30715000/55836000/75931100 | 102/37/50 |
| `phase81-tactical-shape-50x20-world-00017` | first_division | 215588719140/246783640095.5/257692345802.95 | 10819611403.5/16767836215.3/22477326893.87 | 3937000/6556600/11778950 | 43490000/71133000/97930200 | 108/55/34 |
| `phase81-tactical-shape-50x20-world-00017` | second_division | 35319216810.5/45987608177.8/47841615277.22 | 1398816704.5/5507963036.2/7908744912.3 | 5198500/11291600/14421980 | 47305000/82909000/104291300 | 108/48/34 |
| `phase81-tactical-shape-50x20-world-00017` | third_division | 5585403246.5/6392723847.8/10305398030.95 | 337831809/647144817.9/730256192.72 | 7174500/8898500/11908550 | 56175000/73992000/90403500 | 102/41/39 |
| `phase81-tactical-shape-50x20-world-00018` | first_division | 208143211907.5/252844006595.4/259959601361.8 | 9847552728/17747907936/23374909035.79 | 4092000/6257200/7274400 | 43695000/57285000/71287100 | 108/52/43 |
| `phase81-tactical-shape-50x20-world-00018` | second_division | 38353489176/41743594173.9/42806965598.5 | 1499975257.5/4439976120.3/5749892368.17 | 2625500/6106700/6467140 | 29815000/52107000/59522000 | 108/50/19 |
| `phase81-tactical-shape-50x20-world-00018` | third_division | 5815185896.5/6359768306.1/10925378510.93 | 214204485.5/849495936.3/908066555.06 | 4593000/8653000/12953290 | 40425000/63330000/92522800 | 102/46/45 |
| `phase81-tactical-shape-50x20-world-00019` | first_division | 214045425915/245356434306.3/253091872455.45 | 9768081424.5/15591960160.8/19833326811.53 | 5339500/11754400/16359340 | 62435000/91886000/125791200 | 108/49/44 |
| `phase81-tactical-shape-50x20-world-00019` | second_division | 37120709870/42138845000.2/45942543394.12 | 1420091685/3295009626.1/6258497227.32 | 6467500/11390200/11567360 | 53185000/83508000/89790300 | 108/42/46 |
| `phase81-tactical-shape-50x20-world-00019` | third_division | 5654615236.5/6903726317.4/11300544878.38 | 227223484.5/861610633.9/2086420183.86 | 3474500/7098900/11208230 | 30665000/51858000/80422500 | 102/48/34 |
| `phase81-tactical-shape-50x20-world-00020` | first_division | 224521156733/247189843894.4/262930684655.38 | 11989438332/19313180299.6/24377563187.72 | 4062500/8706500/17316160 | 42205000/77882000/133313700 | 108/52/28 |
| `phase81-tactical-shape-50x20-world-00020` | second_division | 38401172294.5/42722283351.6/45616472505.94 | 2004976386/2820248775.1/6230545559.51 | 5760500/10879200/14936540 | 49780000/85492000/108219300 | 108/47/48 |
| `phase81-tactical-shape-50x20-world-00020` | third_division | 5610953271/8205542562.1/12014153767.46 | 226899121.5/1168434057.8/5338980908.54 | 3788000/7187900/13205590 | 33710000/52716000/95107100 | 101/47/40 |
| `phase81-tactical-shape-50x20-world-00021` | first_division | 212845766915/251296412414.2/252383739829.24 | 11148773449.5/16280072866.3/23262694799.09 | 3343500/10337900/18443740 | 37725000/81811000/131740300 | 108/51/28 |
| `phase81-tactical-shape-50x20-world-00021` | second_division | 37829312475.5/42808338803.5/43151576899.88 | 1570882528/3284766282.7/3644602896.77 | 3738500/7202500/8479730 | 34850000/55467000/64392000 | 108/53/42 |
| `phase81-tactical-shape-50x20-world-00021` | third_division | 5715034191.5/6621736176.4/10389110432.47 | 179087900.5/775610639.1/2632819283.67 | 5518000/7300200/29536570 | 42770000/54462000/212673900 | 102/57/34 |
| `phase81-tactical-shape-50x20-world-00022` | first_division | 214459867343.5/239959301381.5/243302600595.03 | 12547913338/17452268579.6/29339351108.04 | 4892000/13261300/20203930 | 52580000/103180000/145909300 | 108/56/26 |
| `phase81-tactical-shape-50x20-world-00022` | second_division | 37299685078.5/41957527623/44457075648.59 | 1345113391.5/2548447801.2/5844677249.31 | 4290000/10004600/52614640 | 38690000/77873000/375819800 | 108/45/38 |
| `phase81-tactical-shape-50x20-world-00022` | third_division | 5673316381.5/7055272135.8/10978744148.39 | 188723481.5/398261015.5/2316084346.53 | 2868000/4784500/7253450 | 26070000/43852000/55655500 | 102/53/32 |
| `phase81-tactical-shape-50x20-world-00023` | first_division | 209469453457/254610263156/259238505575.5 | 11427892180/22473553511.9/28331722592.8 | 4799500/21827300/54602830 | 47020000/167075000/396053800 | 108/44/39 |
| `phase81-tactical-shape-50x20-world-00023` | second_division | 36841492636/41975698183/45169953947.32 | 1671342541.5/4310938162.7/7087080289.24 | 5960000/11138900/16321780 | 56940000/81102000/117389000 | 108/47/41 |
| `phase81-tactical-shape-50x20-world-00023` | third_division | 5540891913.5/6203876214/10534038783.35 | 228085456/873393487.4/1393424316.94 | 3882000/8456200/10225190 | 38045000/67203000/73411500 | 102/42/36 |
| `phase81-tactical-shape-50x20-world-00024` | first_division | 219737244284.5/247088520524.5/254337673896.52 | 11067511839.5/19169331877.6/26962084655.78 | 4741500/10694800/11742980 | 44840000/84250000/94187600 | 108/43/40 |
| `phase81-tactical-shape-50x20-world-00024` | second_division | 36572380577/44400469922.5/46025726978.62 | 2045949003.5/4355320611.2/5855163909.25 | 3582000/7270100/14504650 | 38240000/62187000/105668900 | 108/51/40 |
| `phase81-tactical-shape-50x20-world-00024` | third_division | 5557534447/7158547104.3/11164500369.88 | 286793465.5/661131916.8/2711051277.55 | 4954500/6976400/8438410 | 38440000/59374000/66198800 | 102/44/45 |
| `phase81-tactical-shape-50x20-world-00025` | first_division | 214813614144/246388849187.1/255332980291 | 11495869230.5/19231033580.9/31362100673.19 | 3108000/7568900/18173710 | 37785000/71159000/138191300 | 108/52/29 |
| `phase81-tactical-shape-50x20-world-00025` | second_division | 36773495662.5/43777815023.2/43859381783.63 | 1388638226/4077280660.1/6511701107.53 | 5513500/10504200/11249270 | 41750000/76285000/87621900 | 108/43/52 |
| `phase81-tactical-shape-50x20-world-00025` | third_division | 5630329818.5/6423370194.6/10771566348.08 | 234324899.5/559501761.9/892477352.15 | 5261500/8556900/10026450 | 39920000/65838000/72338000 | 102/41/40 |
| `phase81-tactical-shape-50x20-world-00026` | first_division | 203631357868.5/247515418633.6/262650894515.26 | 10898132944.5/22684993700.2/28963458905.26 | 3473000/8309500/44683860 | 44125000/76583000/324895600 | 106/47/31 |
| `phase81-tactical-shape-50x20-world-00026` | second_division | 36581899004/42708226941/45302810643.09 | 1655227065/3428148587.1/5286235443.95 | 4811000/7575800/9605540 | 40455000/65402000/75426700 | 108/46/25 |
| `phase81-tactical-shape-50x20-world-00026` | third_division | 5440400067.5/7132769491.1/11149510244.22 | 205856534/639016598.7/3874949212.47 | 3881500/9032300/11684820 | 35300000/67892000/83467500 | 102/45/43 |
| `phase81-tactical-shape-50x20-world-00027` | first_division | 217131295234/241739355573.9/248281718234.59 | 10950479467/15017165595.2/32734983391.74 | 4574500/9644400/17401710 | 46220000/80458000/141132800 | 108/44/43 |
| `phase81-tactical-shape-50x20-world-00027` | second_division | 37034833117.5/42403032917.8/44669074726.26 | 1344577279.5/4087003648.7/4272213103.14 | 3537500/6044900/9387810 | 31945000/52385000/68668600 | 108/58/39 |
| `phase81-tactical-shape-50x20-world-00027` | third_division | 5354635320/6669441429/10638627777.86 | 311703458.5/918883662.4/1061921015.1 | 3108000/5441500/6444770 | 27195000/43154000/49543600 | 101/42/41 |
| `phase81-tactical-shape-50x20-world-00028` | first_division | 211061790762.5/242532428127/269512790893.32 | 12027659141/19077559602.3/25681707202.38 | 4928500/8419900/19720540 | 48595000/70997000/150715100 | 108/59/36 |
| `phase81-tactical-shape-50x20-world-00028` | second_division | 39093421370.5/43191098435.7/43811215008.23 | 1777117596.5/3001373347.3/4088816994.58 | 5519500/10695700/12456230 | 45725000/76395000/88971400 | 108/36/50 |
| `phase81-tactical-shape-50x20-world-00028` | third_division | 5450737526.5/6839386687.7/10860310675.53 | 234035477.5/766919258.1/1821104128.11 | 3722000/8647000/10777330 | 33355000/66205000/80642300 | 102/53/43 |
| `phase81-tactical-shape-50x20-world-00029` | first_division | 218300720226.5/240722491491.2/244863892677.27 | 9092698965.5/17289542927.1/19568325455.81 | 3446000/6935400/19033090 | 39515000/78887000/141891200 | 108/52/34 |
| `phase81-tactical-shape-50x20-world-00029` | second_division | 35692238641.5/44922693117.4/47554587684.79 | 1568308642/5164332589.2/7971698017.99 | 5151000/6945700/10843240 | 40915000/61393000/79958800 | 108/42/45 |
| `phase81-tactical-shape-50x20-world-00029` | third_division | 5902637153/6182962783.7/10770026659.54 | 210649602.5/367107996.1/888280807.95 | 4357000/8843800/9914940 | 39380000/64278000/74821600 | 102/49/46 |
| `phase81-tactical-shape-50x20-world-00030` | first_division | 206992345786/249197518969.8/262490177336.38 | 11048994686/20547120930.8/27793201710.36 | 3577500/12986600/27878600 | 46395000/102491000/207034400 | 108/53/39 |
| `phase81-tactical-shape-50x20-world-00030` | second_division | 37075059878.5/42827886126/44662937590.15 | 1588956514.5/4543804177.6/5550650642.64 | 4788000/9906600/11729780 | 41820000/74913000/84511500 | 108/50/49 |
| `phase81-tactical-shape-50x20-world-00030` | third_division | 5412094626/6439376487.1/10234166005.41 | 164569999.5/392295283.5/588297249.82 | 4392000/7932900/8500770 | 38285000/57879000/66082100 | 102/42/35 |
| `phase81-tactical-shape-50x20-world-00031` | first_division | 220346814717.5/239175480565.8/271752196157.82 | 11148920401.5/25470855845/30516589960.53 | 4788500/13115800/18684220 | 55185000/102032000/134300000 | 108/43/44 |
| `phase81-tactical-shape-50x20-world-00031` | second_division | 37830429185.5/41907441618.7/46749633159.12 | 1350980149.5/2663597011.7/5496536000.87 | 4215000/6646500/8079250 | 40960000/54136000/63541700 | 108/50/43 |
| `phase81-tactical-shape-50x20-world-00031` | third_division | 5221730536.5/5952341946.7/10177243694.63 | 206496058/451442185/613379051.67 | 5927500/7847900/9224000 | 47750000/58935000/65976600 | 102/52/41 |
| `phase81-tactical-shape-50x20-world-00032` | first_division | 213592197544.5/242573733555.8/250156757316.01 | 11109795875/21003971640.1/25767935413.06 | 5125500/9335700/10561730 | 54020000/69969000/85702800 | 105/56/39 |
| `phase81-tactical-shape-50x20-world-00032` | second_division | 36824308166/41807936652.1/44960205740.32 | 1312228625/3335321738.5/6050273079.24 | 3826500/7738500/10381880 | 39160000/70941000/93129700 | 108/46/35 |
| `phase81-tactical-shape-50x20-world-00032` | third_division | 5539045007.5/6618645986.3/10681170716.92 | 221825453.5/894974966.3/2892162504.89 | 2813000/9535600/10564360 | 28130000/68720000/82146900 | 102/51/45 |
| `phase81-tactical-shape-50x20-world-00033` | first_division | 212701095301/247254080300.6/261881603269.18 | 10543103658/19815642830.6/30862233681.25 | 4012500/11595800/41210820 | 45490000/92592000/296813700 | 108/47/39 |
| `phase81-tactical-shape-50x20-world-00033` | second_division | 36613567825.5/42737975128.2/43094025354.04 | 1366688850/2867396015.2/4891761483.34 | 5557500/7375000/9256460 | 44530000/63546000/67739100 | 108/51/41 |
| `phase81-tactical-shape-50x20-world-00033` | third_division | 5428783872/6399705576.5/10841442332.85 | 256329067/508155926.2/676434466.12 | 4146500/11129600/13338650 | 36895000/83928000/95969800 | 102/42/48 |
| `phase81-tactical-shape-50x20-world-00034` | first_division | 205623788433/248353719727.1/250256297973.78 | 11079762961.5/20626746536.9/21195158273.51 | 4620000/14992700/27304050 | 44645000/110669000/198588000 | 108/51/42 |
| `phase81-tactical-shape-50x20-world-00034` | second_division | 38475667656.5/43712054008.2/46211221433.6 | 1648970718/4297449364.2/4628659534.14 | 5547500/8885100/11539350 | 51790000/66882000/86260900 | 107/50/38 |
| `phase81-tactical-shape-50x20-world-00034` | third_division | 5553406823/7270921380.2/10938578168.4 | 155825403/611330058.3/2479985516.72 | 4318000/8581100/13776630 | 33725000/68051000/99933400 | 102/40/48 |
| `phase81-tactical-shape-50x20-world-00035` | first_division | 220656991010.5/245672854007/248772942980.29 | 11915283856.5/18384753734.4/25798292124.11 | 5965000/11223600/13454420 | 50965000/96754000/109648100 | 108/52/46 |
| `phase81-tactical-shape-50x20-world-00035` | second_division | 37815190459/42429416467.9/45699501755.82 | 1638797216/3828014373.8/6122464475.67 | 4723000/9129000/14389920 | 43135000/70585000/106937100 | 108/48/41 |
| `phase81-tactical-shape-50x20-world-00035` | third_division | 5465779520/6321365373.6/10787997283.96 | 253405934/599814888.8/1059189078.37 | 3444500/10110900/18033740 | 33505000/78296000/128817900 | 102/37/39 |
| `phase81-tactical-shape-50x20-world-00036` | first_division | 218549682004.5/244549150974/245427545088.94 | 10372384825.5/22278859553.2/32251963465.02 | 2733000/11218300/14174520 | 34380000/90392000/117336100 | 108/50/37 |
| `phase81-tactical-shape-50x20-world-00036` | second_division | 36516477901.5/42352228365.5/42721968242.02 | 1531876962.5/2958367424.4/4674292346 | 5699500/8123300/10894140 | 48730000/62589000/84727100 | 108/49/39 |
| `phase81-tactical-shape-50x20-world-00036` | third_division | 5449287450/7825189562.9/11048511303.12 | 328502668/1293312475.4/2954843997.01 | 4114000/5907800/6684430 | 34630000/48373000/53509800 | 102/51/26 |
| `phase81-tactical-shape-50x20-world-00037` | first_division | 213643469774.5/247212659689.1/248329850176.65 | 9852623874/19542623263/23534485346.55 | 4065000/12525800/21186950 | 47100000/96258000/160383400 | 108/41/37 |
| `phase81-tactical-shape-50x20-world-00037` | second_division | 36959774025.5/42186288629.4/42459364057.78 | 1582501888/4265774182.2/6067141526.03 | 4143500/10081400/12272530 | 41435000/74670000/87663300 | 108/48/46 |
| `phase81-tactical-shape-50x20-world-00037` | third_division | 5674244285.5/6507456473/10809408195.71 | 179997907.5/947384416.6/1318045855.9 | 2906000/6804400/12204550 | 29060000/51312000/87879700 | 101/42/40 |
| `phase81-tactical-shape-50x20-world-00038` | first_division | 213811987184/243186782787.8/252535591131.34 | 9545720081/20212703958.3/25838881825.52 | 3340500/10859600/14430300 | 45685000/81391000/103075000 | 108/48/45 |
| `phase81-tactical-shape-50x20-world-00038` | second_division | 39482618958.5/42877264033.4/45035624503.61 | 1640774612.5/4910386319/5568652361.88 | 5641000/10767200/14536810 | 48105000/81802000/105072200 | 108/45/47 |
| `phase81-tactical-shape-50x20-world-00038` | third_division | 5535632012.5/6876794574/11060298269.78 | 204532801.5/1237524716.2/2982509803.13 | 5464500/10408000/12385480 | 43055000/78133000/89151300 | 102/43/38 |
| `phase81-tactical-shape-50x20-world-00039` | first_division | 209398220218.5/248883286009.6/254494949496.46 | 9917887232.5/21931294510.9/27725098570.53 | 3507500/14507600/59429400 | 44735000/112176000/549064400 | 108/53/47 |
| `phase81-tactical-shape-50x20-world-00039` | second_division | 37127824542/42601455075.3/43640921280.06 | 1433206120/3741216990.7/4877347912.66 | 3681500/9212300/9541610 | 36025000/68411000/71640300 | 107/50/38 |
| `phase81-tactical-shape-50x20-world-00039` | third_division | 5315924510.5/7362312272.8/10696525151.03 | 178875830/420538002.3/2012591096.97 | 4928000/9051700/10581580 | 38340000/69049000/77920700 | 102/44/44 |
| `phase81-tactical-shape-50x20-world-00040` | first_division | 210888495191.5/237138030840.3/246623279028.55 | 9701955414/19952082050.4/31117242433.02 | 5641500/14414200/18169240 | 57615000/108183000/134522200 | 102/45/37 |
| `phase81-tactical-shape-50x20-world-00040` | second_division | 38930568029.5/44011698359.2/44603920890.74 | 1492038518/2962437315.2/6348156799.26 | 3535000/8560400/12240990 | 38420000/67216000/89118700 | 108/41/48 |
| `phase81-tactical-shape-50x20-world-00040` | third_division | 5703696348.5/7177827807.9/11112250735.98 | 178340942.5/526517525.3/2732765448.81 | 2625500/8357200/14187940 | 26255000/59690000/101341700 | 102/43/46 |
| `phase81-tactical-shape-50x20-world-00041` | first_division | 220256128917/243131586213.3/253460590615.42 | 11794449141/19673284770.1/21614666376.59 | 3892000/8125700/8562040 | 45330000/67295000/82095200 | 108/57/40 |
| `phase81-tactical-shape-50x20-world-00041` | second_division | 37032590866/42828536174.6/44587761294.82 | 1719668058.5/2444982088.8/4144649021.84 | 3691000/6638900/8080690 | 36910000/58810000/62023500 | 108/53/30 |
| `phase81-tactical-shape-50x20-world-00041` | third_division | 5367606398.5/6804076329.2/10565011333.28 | 198461858/503578044.8/1115529908.06 | 3563500/10524600/22684230 | 29480000/75176000/162034500 | 102/45/60 |
| `phase81-tactical-shape-50x20-world-00042` | first_division | 205528536506.5/242321435698.4/247090213898.25 | 10800739291.5/18668709449.9/20177336590.06 | 5033000/9577600/26310530 | 49165000/78620000/189354500 | 107/50/28 |
| `phase81-tactical-shape-50x20-world-00042` | second_division | 38078335141.5/42409216714.8/44221127702.53 | 1479836792/2573083183.6/3671355385.65 | 4511500/8635300/14748730 | 42870000/68759000/106171600 | 108/42/38 |
| `phase81-tactical-shape-50x20-world-00042` | third_division | 6049449576/6904533034.3/10664850663.84 | 303741723.5/824391074.9/2547935428.33 | 3829500/7254800/10210940 | 34620000/55597000/73544400 | 102/53/48 |
| `phase81-tactical-shape-50x20-world-00043` | first_division | 208906577458.5/244689178004.7/259348646824.07 | 11159995965.5/18213704875.1/21773233522.43 | 4199000/8032000/15231580 | 52740000/75769000/131792300 | 108/63/40 |
| `phase81-tactical-shape-50x20-world-00043` | second_division | 37283513822.5/42977888793.2/43901809111.85 | 1936882084.5/3753784935.7/5163318094.72 | 5517500/11407200/14820020 | 46175000/83096000/106770700 | 108/62/47 |
| `phase81-tactical-shape-50x20-world-00043` | third_division | 5610715064.5/6937431468.6/10842160707.2 | 175128459.5/599685585.9/1605098457.49 | 3605500/7566000/10333930 | 31825000/63590000/74296100 | 102/42/55 |
| `phase81-tactical-shape-50x20-world-00044` | first_division | 212551582766/248112397971.2/252097013997.06 | 10765243631.5/21407955952.8/30297174726.52 | 4235000/10337200/15795940 | 49730000/95254000/119329200 | 108/54/29 |
| `phase81-tactical-shape-50x20-world-00044` | second_division | 36859565707.5/43015846213.1/44058741288.83 | 1491047145.5/2931297512.8/3838596940.5 | 3996000/7569400/9895610 | 39960000/66907000/75828000 | 108/50/39 |
| `phase81-tactical-shape-50x20-world-00044` | third_division | 5209157809.5/7045369418.3/10728900443.71 | 158370168/344835184.1/2431721281.76 | 2984500/7901800/12686800 | 29845000/56871000/90859300 | 102/45/50 |
| `phase81-tactical-shape-50x20-world-00045` | first_division | 207145312605/246091281807.2/256674588337.83 | 10879369924.5/18963169951.6/29127871752.2 | 3318500/8591600/10916660 | 36650000/71904000/82099300 | 108/45/29 |
| `phase81-tactical-shape-50x20-world-00045` | second_division | 37825397875/43681359909.9/44602419856.73 | 1461894070.5/3494548029.6/4113012276.72 | 4070500/8161500/15384120 | 37105000/59724000/115810700 | 108/47/45 |
| `phase81-tactical-shape-50x20-world-00045` | third_division | 5666947738.5/7132454871.6/10947917157.31 | 278166289.5/832015929.7/1655355361.3 | 2626000/6893700/9507450 | 26260000/51545000/73115900 | 102/48/34 |
| `phase81-tactical-shape-50x20-world-00046` | first_division | 220592924821.5/242279176782.3/264192437832 | 11640181016.5/16973405303.2/20150425947.84 | 5045000/9165000/10492460 | 45945000/78403000/89152900 | 108/45/44 |
| `phase81-tactical-shape-50x20-world-00046` | second_division | 37165200524.5/43441222944.6/44592192146.59 | 1558144804.5/5586618050.4/6109547621.35 | 3958500/10349300/12872490 | 39585000/83696000/92492300 | 108/51/35 |
| `phase81-tactical-shape-50x20-world-00046` | third_division | 5415919618/6396180034.2/10767564910.72 | 220476966.5/423965025/935232715.68 | 3149000/6540300/11636450 | 31490000/49478000/83113700 | 102/50/33 |
| `phase81-tactical-shape-50x20-world-00047` | first_division | 212085668846/254580561794.1/265047560603.07 | 10460429632.5/23656446278.6/32861211987.27 | 5012500/14104800/28767740 | 52720000/110164000/206774400 | 108/56/34 |
| `phase81-tactical-shape-50x20-world-00047` | second_division | 36141387044.5/43828569371.1/45547191618.65 | 1641614267.5/2860891395.2/6279396584.03 | 5600000/11387500/13203710 | 47225000/84233000/94432700 | 108/45/40 |
| `phase81-tactical-shape-50x20-world-00047` | third_division | 5522812811.5/8057584835.1/10969144114.83 | 354563425.5/1891440736.2/2739798989.09 | 5131000/9905100/14482330 | 38725000/72912000/103449500 | 102/44/47 |
| `phase81-tactical-shape-50x20-world-00048` | first_division | 204492032964.5/250312419977.5/260240882008.13 | 8516938075.5/21051281651.5/27554582508.28 | 3457000/7214400/11760780 | 37315000/63205000/90139500 | 104/44/43 |
| `phase81-tactical-shape-50x20-world-00048` | second_division | 35785857751/43137919949/43780889111.92 | 1416624478.5/2687323797.2/5305438044.08 | 5190500/9341500/11683220 | 44115000/76208000/91793700 | 108/45/44 |
| `phase81-tactical-shape-50x20-world-00048` | third_division | 5581464534/7302763289/11007767359.77 | 188779229.5/600049538.8/2634588906.54 | 2697000/6917000/10352580 | 26970000/50826000/79604200 | 101/47/40 |
| `phase81-tactical-shape-50x20-world-00049` | first_division | 208916709890/244037033287.2/251925328780.88 | 10262503217/15943221793.4/33601731129.85 | 4445500/15902000/46401670 | 48690000/119423000/340068900 | 107/47/38 |
| `phase81-tactical-shape-50x20-world-00049` | second_division | 37878752850.5/42954889443.5/43762119214.9 | 1466876916.5/5109714986.1/5749884681.62 | 4568500/9660500/12668160 | 40350000/77301000/91862400 | 108/42/40 |
| `phase81-tactical-shape-50x20-world-00049` | third_division | 5529009371/6605555476.3/10767894834.07 | 128790082.5/576853142.4/946311253.52 | 2691500/7648700/11851070 | 26915000/55859000/85349600 | 102/38/41 |
| `phase81-tactical-shape-50x20-world-00050` | first_division | 218652168753/242762762107.1/250240083759 | 10778791052/15892561528.8/22233454257.11 | 3179500/7871500/10932690 | 35545000/68866000/82385700 | 108/59/38 |
| `phase81-tactical-shape-50x20-world-00050` | second_division | 37116021222/43055516324.3/48492261945.74 | 1543491995.5/3332059781.4/9007865104.45 | 2752000/7515400/10073190 | 28160000/61262000/75545600 | 108/50/41 |
| `phase81-tactical-shape-50x20-world-00050` | third_division | 5616626856.5/6986031706.9/11079438699.73 | 193118971.5/979306262.7/3498616150.13 | 3346500/7474300/11710060 | 29050000/56399000/84533600 | 102/54/39 |

### Cross-Tier Permanent Transfers

| Seed | Source -> destination | Attempts | Completed | Public value P50 | Asking P50 | Fee P50 | Rejections |
|---|---|---:|---:|---:|---:|---:|---|
| `phase81-tactical-shape-50x20-world-00001` | first_division -> first_division | 90 | 43 | 18050100 | 28065430 | 29863733 | fee_below_valuation=24, player_unwilling=10, stale_ownership=10, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00001` | first_division -> second_division | 62 | 19 | 16659300 | 24809756.5 | 22970633 | stale_ownership=6, fee_below_valuation=28, player_unwilling=7, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00001` | second_division -> first_division | 11 | 6 | 74715100 | 134487180 | 124750259 | fee_below_valuation=2, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00001` | second_division -> second_division | 34 | 13 | 21515500 | 38727900 | 31148826 | fee_below_valuation=10, player_unwilling=7, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00001` | second_division -> third_division | 54 | 24 | 10773550 | 15150543 | 13064517 | fee_below_valuation=13, player_unwilling=9, stale_ownership=6 |
| `phase81-tactical-shape-50x20-world-00001` | third_division -> first_division | 7 | 5 | 8061300 | 11031889 | 10480295 | stale_ownership=1, fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00001` | third_division -> second_division | 12 | 8 | 11251700 | 16840621 | 14197695.5 | stale_ownership=1, fee_below_valuation=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00001` | third_division -> third_division | 48 | 24 | 9180100 | 12018188 | 15199464 | fee_below_valuation=14, stale_ownership=2, player_unwilling=5 |
| `phase81-tactical-shape-50x20-world-00002` | first_division -> first_division | 80 | 35 | 27246900 | 44807384 | 44582978 | fee_below_valuation=18, stale_ownership=9, player_unwilling=12, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00002` | first_division -> second_division | 62 | 34 | 19287250 | 30694647.5 | 25961351 | fee_below_valuation=18, player_unwilling=5, stale_ownership=5 |
| `phase81-tactical-shape-50x20-world-00002` | second_division -> first_division | 24 | 16 | 21247400 | 35336574 | 31454210 | stale_ownership=3, fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00002` | second_division -> second_division | 33 | 13 | 17857000 | 32142600 | 36231640 | fee_below_valuation=11, player_unwilling=6, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00002` | second_division -> third_division | 41 | 21 | 10370700 | 15342656 | 13041258 | stale_ownership=2, fee_below_valuation=14, player_unwilling=2 |
| `phase81-tactical-shape-50x20-world-00002` | third_division -> first_division | 4 | 4 | 18623600 | 31664793 | 30072448 | none |
| `phase81-tactical-shape-50x20-world-00002` | third_division -> second_division | 13 | 8 | 13371700 | 16337986 | 19103380 | fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00002` | third_division -> third_division | 61 | 28 | 5366200 | 6544048 | 6000331.5 | fee_below_valuation=24, player_unwilling=3, player_not_for_sale=2, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00003` | first_division -> first_division | 86 | 44 | 33117650 | 56038763 | 95973122 | fee_below_valuation=18, player_unwilling=13, stale_ownership=8, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00003` | first_division -> second_division | 61 | 18 | 17088200 | 28389533 | 23564994 | player_unwilling=16, fee_below_valuation=15, player_not_for_sale=3, stale_ownership=6 |
| `phase81-tactical-shape-50x20-world-00003` | second_division -> first_division | 18 | 9 | 25198850 | 42820793.5 | 40847894 | fee_below_valuation=6, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00003` | second_division -> second_division | 40 | 15 | 20578900 | 32433514 | 20297910 | fee_below_valuation=13, player_unwilling=6, stale_ownership=3, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00003` | second_division -> third_division | 50 | 18 | 10734800 | 16705276.5 | 17090984.5 | player_unwilling=8, fee_below_valuation=17, stale_ownership=5, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00003` | third_division -> first_division | 3 | 2 | 33874300 | 53352023 | 68978534.5 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00003` | third_division -> second_division | 7 | 6 | 11413700 | 15619648 | 22666108.5 | none |
| `phase81-tactical-shape-50x20-world-00003` | third_division -> third_division | 52 | 24 | 6835200 | 10148590.5 | 7727013 | fee_below_valuation=17, stale_ownership=2, player_unwilling=6, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00004` | first_division -> first_division | 93 | 42 | 31848700 | 49934239 | 128705243.5 | fee_below_valuation=32, player_unwilling=13, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00004` | first_division -> second_division | 57 | 26 | 16160900 | 22055355 | 20791549 | fee_below_valuation=22, stale_ownership=3, player_unwilling=4 |
| `phase81-tactical-shape-50x20-world-00004` | second_division -> first_division | 11 | 9 | 29390800 | 48669480 | 39089760 | fee_below_valuation=1, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00004` | second_division -> second_division | 33 | 18 | 25836900 | 40707765 | 47160777 | fee_below_valuation=12, stale_ownership=1, player_unwilling=1 |
| `phase81-tactical-shape-50x20-world-00004` | second_division -> third_division | 43 | 17 | 12772800 | 17003400 | 15303050 | fee_below_valuation=21, player_unwilling=2, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00004` | third_division -> first_division | 4 | 4 | 11938900 | 17596355.5 | 16199003 | none |
| `phase81-tactical-shape-50x20-world-00004` | third_division -> second_division | 18 | 13 | 15619300 | 21747904 | 22240540 | stale_ownership=1, fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00004` | third_division -> third_division | 59 | 29 | 5228600 | 7189278 | 8040823 | fee_below_valuation=20, player_unwilling=1, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00005` | first_division -> first_division | 92 | 37 | 33915700 | 47481980 | 94856209 | fee_below_valuation=31, player_unwilling=11, stale_ownership=8, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00005` | first_division -> second_division | 63 | 22 | 17971900 | 27318101 | 22606600 | fee_below_valuation=19, player_unwilling=14, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00005` | second_division -> first_division | 16 | 9 | 27130400 | 46124225 | 27259699 | fee_below_valuation=5, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00005` | second_division -> second_division | 37 | 20 | 19276500 | 30456580 | 23264654.5 | player_unwilling=6, fee_below_valuation=10, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00005` | second_division -> third_division | 37 | 15 | 7209900 | 9304926 | 9084430 | fee_below_valuation=14, player_unwilling=5, unaffordable=1, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00005` | third_division -> second_division | 8 | 4 | 8129350 | 11125015.5 | 10324581 | fee_below_valuation=3, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00005` | third_division -> third_division | 65 | 31 | 6930700 | 9866748 | 9259580 | fee_below_valuation=23, player_not_for_sale=3, player_unwilling=2, stale_ownership=3, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00006` | first_division -> first_division | 90 | 39 | 22183450 | 36548996.5 | 136255980 | fee_below_valuation=28, player_unwilling=15, player_not_for_sale=2, stale_ownership=6 |
| `phase81-tactical-shape-50x20-world-00006` | first_division -> second_division | 52 | 25 | 18196650 | 29697200 | 25793600 | fee_below_valuation=11, stale_ownership=4, player_not_for_sale=2, player_unwilling=7 |
| `phase81-tactical-shape-50x20-world-00006` | second_division -> first_division | 13 | 6 | 16046000 | 25667775 | 24463334 | fee_below_valuation=4, stale_ownership=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00006` | second_division -> second_division | 38 | 17 | 25574850 | 38394133 | 36781533 | fee_below_valuation=9, player_unwilling=8, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00006` | second_division -> third_division | 46 | 30 | 9953750 | 12784459 | 10911690.5 | fee_below_valuation=9, stale_ownership=4, player_unwilling=2 |
| `phase81-tactical-shape-50x20-world-00006` | third_division -> first_division | 5 | 2 | 4838400 | 6621350 | 7394984.5 | fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00006` | third_division -> second_division | 18 | 11 | 6502250 | 8831241.5 | 9791145 | fee_below_valuation=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00006` | third_division -> third_division | 56 | 27 | 6638800 | 7900172 | 8936517 | fee_below_valuation=16, stale_ownership=2, player_unwilling=7, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00007` | first_division -> first_division | 87 | 44 | 32089900 | 46209456 | 99694412 | fee_below_valuation=18, player_unwilling=18, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00007` | first_division -> second_division | 55 | 26 | 17709000 | 26223743 | 31389625.5 | fee_below_valuation=9, player_unwilling=13, stale_ownership=2, player_not_for_sale=3 |
| `phase81-tactical-shape-50x20-world-00007` | second_division -> first_division | 21 | 15 | 28040200 | 44533755 | 40583137 | fee_below_valuation=6 |
| `phase81-tactical-shape-50x20-world-00007` | second_division -> second_division | 42 | 20 | 23298350 | 40062690 | 32059537 | fee_below_valuation=14, player_unwilling=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00007` | second_division -> third_division | 56 | 23 | 12653500 | 17296300 | 12428220 | fee_below_valuation=26, player_unwilling=2, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00007` | third_division -> second_division | 11 | 8 | 11200500 | 15327884 | 19578455 | stale_ownership=1, fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00007` | third_division -> third_division | 46 | 17 | 6046650 | 7389605.5 | 6711996 | fee_below_valuation=21, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00008` | first_division -> first_division | 85 | 43 | 97723200 | 133734199 | 166482320 | fee_below_valuation=19, player_unwilling=9, stale_ownership=7, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00008` | first_division -> second_division | 54 | 25 | 19028400 | 25021505 | 25982001 | player_unwilling=6, fee_below_valuation=16, stale_ownership=5 |
| `phase81-tactical-shape-50x20-world-00008` | second_division -> first_division | 23 | 16 | 24512200 | 33544946 | 33180894.5 | stale_ownership=3, fee_below_valuation=4 |
| `phase81-tactical-shape-50x20-world-00008` | second_division -> second_division | 40 | 27 | 19849600 | 28775968.5 | 28387698 | fee_below_valuation=9, stale_ownership=3, player_unwilling=1 |
| `phase81-tactical-shape-50x20-world-00008` | second_division -> third_division | 36 | 18 | 12378150 | 17100838 | 16740159.5 | player_unwilling=4, fee_below_valuation=8, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00008` | third_division -> second_division | 14 | 8 | 10987500 | 14054271 | 23403241.5 | fee_below_valuation=5 |
| `phase81-tactical-shape-50x20-world-00008` | third_division -> third_division | 66 | 30 | 5135200 | 6452516 | 6370163 | fee_below_valuation=27, stale_ownership=2, player_unwilling=6 |
| `phase81-tactical-shape-50x20-world-00009` | first_division -> first_division | 86 | 35 | 18965450 | 30901982.5 | 30254040 | fee_below_valuation=18, stale_ownership=6, player_unwilling=20, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00009` | first_division -> second_division | 51 | 19 | 18823300 | 31171385 | 30990632 | player_unwilling=8, fee_below_valuation=19, stale_ownership=4, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00009` | second_division -> first_division | 20 | 12 | 21047800 | 32196121 | 30308385 | fee_below_valuation=7, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00009` | second_division -> second_division | 41 | 26 | 19708100 | 27591340 | 20682010 | fee_below_valuation=8, player_unwilling=4, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00009` | second_division -> third_division | 42 | 16 | 7975500 | 9421453.5 | 8742773 | fee_below_valuation=19, player_unwilling=2, stale_ownership=2, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00009` | third_division -> first_division | 2 | 1 | 5094500 | 7563329 | 7492373 | stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00009` | third_division -> second_division | 15 | 8 | 9825700 | 17686260 | 16397380 | fee_below_valuation=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00009` | third_division -> third_division | 60 | 27 | 7097100 | 10478881 | 10120841 | fee_below_valuation=22, player_unwilling=6, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00010` | first_division -> first_division | 88 | 42 | 19633550 | 31692353.5 | 36323859 | player_unwilling=15, fee_below_valuation=15, stale_ownership=12 |
| `phase81-tactical-shape-50x20-world-00010` | first_division -> second_division | 46 | 23 | 17666200 | 23363920 | 22306800 | fee_below_valuation=14, player_unwilling=4, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00010` | second_division -> first_division | 18 | 10 | 23203400 | 32865182 | 26897799.5 | fee_below_valuation=8 |
| `phase81-tactical-shape-50x20-world-00010` | second_division -> second_division | 52 | 20 | 19033400 | 28513371 | 26732257 | fee_below_valuation=17, player_unwilling=9, stale_ownership=2, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00010` | second_division -> third_division | 46 | 24 | 9539450 | 11317170.5 | 17128831 | fee_below_valuation=19, player_unwilling=2, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00010` | third_division -> first_division | 2 | 1 | 13083950 | 15529255 | 24176980 | none |
| `phase81-tactical-shape-50x20-world-00010` | third_division -> second_division | 10 | 8 | 5972300 | 7953520 | 7437416 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00010` | third_division -> third_division | 53 | 33 | 5796900 | 7224133 | 6725806 | fee_below_valuation=13, player_unwilling=4, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00011` | first_division -> first_division | 93 | 35 | 25157500 | 39623063 | 37521963 | fee_below_valuation=28, player_unwilling=21, stale_ownership=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00011` | first_division -> second_division | 50 | 23 | 16740100 | 26397378 | 24960210 | stale_ownership=6, player_unwilling=6, fee_below_valuation=11, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00011` | second_division -> first_division | 12 | 7 | 22033750 | 37564223.5 | 31977504 | fee_below_valuation=3, stale_ownership=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00011` | second_division -> second_division | 47 | 18 | 19870800 | 34878600 | 32541750 | player_unwilling=9, fee_below_valuation=15, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00011` | second_division -> third_division | 43 | 13 | 9099300 | 10909920 | 9818910 | player_unwilling=7, fee_below_valuation=19, unaffordable=1, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00011` | third_division -> first_division | 3 | 2 | 15799700 | 28439460 | 37035985 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00011` | third_division -> second_division | 11 | 6 | 8714200 | 13641691 | 18996311 | fee_below_valuation=3, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00011` | third_division -> third_division | 59 | 24 | 5629600 | 7704108 | 7346337.5 | fee_below_valuation=26, stale_ownership=5, player_unwilling=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00012` | first_division -> first_division | 81 | 35 | 21730000 | 34880625 | 35502376 | fee_below_valuation=23, player_unwilling=15, player_not_for_sale=1, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00012` | first_division -> second_division | 51 | 22 | 17349600 | 24769361 | 28643005 | player_unwilling=10, stale_ownership=2, fee_below_valuation=12, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00012` | second_division -> first_division | 23 | 18 | 21362900 | 38453220 | 32696939.5 | fee_below_valuation=3, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00012` | second_division -> second_division | 43 | 22 | 17467300 | 27032670 | 22191183.5 | fee_below_valuation=12, player_unwilling=8, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00012` | second_division -> third_division | 39 | 18 | 10648500 | 14657720 | 16362717 | fee_below_valuation=13, player_unwilling=6, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00012` | third_division -> first_division | 2 | 1 | 11258350 | 14991378.5 | 7857149 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00012` | third_division -> second_division | 14 | 12 | 13942700 | 22462832.5 | 22160543.5 | stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00012` | third_division -> third_division | 63 | 31 | 8047200 | 10970372 | 8888901 | fee_below_valuation=17, player_unwilling=9, stale_ownership=1, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00013` | first_division -> first_division | 84 | 35 | 42790200 | 58206371 | 64024833 | fee_below_valuation=25, player_unwilling=16, stale_ownership=6 |
| `phase81-tactical-shape-50x20-world-00013` | first_division -> second_division | 55 | 21 | 14699800 | 21448560 | 21624472 | fee_below_valuation=16, player_unwilling=11, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00013` | second_division -> first_division | 22 | 12 | 16498100 | 28155682 | 27278996 | stale_ownership=1, fee_below_valuation=9 |
| `phase81-tactical-shape-50x20-world-00013` | second_division -> second_division | 45 | 24 | 15678200 | 21455617 | 17198386.5 | stale_ownership=2, player_unwilling=4, fee_below_valuation=15 |
| `phase81-tactical-shape-50x20-world-00013` | second_division -> third_division | 52 | 22 | 9132100 | 12497279 | 8917482.5 | fee_below_valuation=22, player_unwilling=4, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00013` | third_division -> first_division | 2 | 1 | 10109200 | 13171009.5 | 17496273 | stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00013` | third_division -> second_division | 8 | 5 | 12355350 | 18706323 | 25370412 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00013` | third_division -> third_division | 49 | 23 | 5034200 | 6373360 | 6872314 | stale_ownership=1, fee_below_valuation=19, player_not_for_sale=1, player_unwilling=2 |
| `phase81-tactical-shape-50x20-world-00014` | first_division -> first_division | 87 | 45 | 26742700 | 44314020 | 41296268 | fee_below_valuation=24, player_unwilling=14, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00014` | first_division -> second_division | 57 | 14 | 16099200 | 26440027 | 21004307.5 | fee_below_valuation=17, player_unwilling=18, stale_ownership=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00014` | second_division -> first_division | 18 | 11 | 31221800 | 50267098 | 36028060 | fee_below_valuation=4, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00014` | second_division -> second_division | 34 | 13 | 18650600 | 29104901 | 24631020 | fee_below_valuation=10, player_unwilling=5, stale_ownership=4, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00014` | second_division -> third_division | 43 | 18 | 7443700 | 10421180 | 6909258 | fee_below_valuation=14, player_unwilling=7, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00014` | third_division -> first_division | 3 | 2 | 12830600 | 20208195 | 55328429 | none |
| `phase81-tactical-shape-50x20-world-00014` | third_division -> second_division | 17 | 9 | 9551900 | 11366761 | 7459753 | fee_below_valuation=6, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00014` | third_division -> third_division | 59 | 26 | 5360800 | 7118800 | 7594479.5 | stale_ownership=5, player_unwilling=9, fee_below_valuation=11, player_not_for_sale=3 |
| `phase81-tactical-shape-50x20-world-00015` | first_division -> first_division | 89 | 43 | 21782300 | 32271729 | 34329044 | player_unwilling=20, fee_below_valuation=19, stale_ownership=5 |
| `phase81-tactical-shape-50x20-world-00015` | first_division -> second_division | 63 | 18 | 21324400 | 33585930 | 29931486 | player_unwilling=8, stale_ownership=6, fee_below_valuation=26 |
| `phase81-tactical-shape-50x20-world-00015` | second_division -> first_division | 15 | 8 | 15191700 | 27028800 | 18391650.5 | fee_below_valuation=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00015` | second_division -> second_division | 25 | 12 | 16375000 | 26363750 | 29418392.5 | fee_below_valuation=8, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00015` | second_division -> third_division | 37 | 19 | 6808900 | 9317980 | 10346781 | fee_below_valuation=12, stale_ownership=2, player_unwilling=2, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00015` | third_division -> first_division | 4 | 2 | 11123900 | 14095937 | 13931386.5 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00015` | third_division -> second_division | 20 | 5 | 21068300 | 34239224.5 | 23122629 | fee_below_valuation=10, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00015` | third_division -> third_division | 63 | 27 | 8881100 | 11251920 | 12395483 | fee_below_valuation=23, player_unwilling=8, stale_ownership=2, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00016` | first_division -> first_division | 84 | 47 | 35558100 | 55639564 | 38848170 | player_unwilling=10, fee_below_valuation=21, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00016` | first_division -> second_division | 52 | 26 | 19858200 | 31273606 | 27807278 | fee_below_valuation=16, stale_ownership=4, player_unwilling=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00016` | second_division -> first_division | 24 | 16 | 18888350 | 26833349.5 | 33203208.5 | fee_below_valuation=5, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00016` | second_division -> second_division | 46 | 22 | 19858200 | 30947043.5 | 25473573.5 | fee_below_valuation=11, player_unwilling=8, player_not_for_sale=1, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00016` | second_division -> third_division | 46 | 13 | 15010200 | 20584665 | 21733000 | fee_below_valuation=20, player_unwilling=6, stale_ownership=6 |
| `phase81-tactical-shape-50x20-world-00016` | third_division -> second_division | 10 | 8 | 10846350 | 16070640.5 | 16360880.5 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00016` | third_division -> third_division | 56 | 24 | 5335000 | 6852917 | 6698182 | player_unwilling=5, fee_below_valuation=19, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00017` | first_division -> first_division | 90 | 42 | 27471100 | 40144634.5 | 43962316 | fee_below_valuation=28, player_unwilling=11, stale_ownership=4, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00017` | first_division -> second_division | 66 | 25 | 17523850 | 27409781.5 | 27364765 | fee_below_valuation=22, player_unwilling=15, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00017` | second_division -> first_division | 17 | 12 | 22938800 | 36919554 | 33323266 | fee_below_valuation=4 |
| `phase81-tactical-shape-50x20-world-00017` | second_division -> second_division | 35 | 17 | 11593600 | 19185275 | 18529670 | player_unwilling=4, fee_below_valuation=10, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00017` | second_division -> third_division | 47 | 14 | 17594500 | 27711338 | 16172715 | fee_below_valuation=22, player_unwilling=10, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00017` | third_division -> first_division | 1 | 1 | 3192400 | 3798956 | 3419028 | none |
| `phase81-tactical-shape-50x20-world-00017` | third_division -> second_division | 7 | 6 | 5780100 | 8092140 | 9811785 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00017` | third_division -> third_division | 55 | 27 | 7348400 | 9121707 | 6263130 | fee_below_valuation=25, player_unwilling=2, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00018` | first_division -> first_division | 86 | 39 | 31141050 | 54180900 | 91956950 | player_unwilling=15, fee_below_valuation=25, stale_ownership=2, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00018` | first_division -> second_division | 57 | 22 | 18657400 | 25427052 | 21755974.5 | player_unwilling=9, fee_below_valuation=24, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00018` | second_division -> first_division | 16 | 9 | 22265550 | 34641495 | 25271078 | fee_below_valuation=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00018` | second_division -> second_division | 36 | 18 | 17002300 | 27241459.5 | 27022400 | stale_ownership=1, fee_below_valuation=9, player_unwilling=7 |
| `phase81-tactical-shape-50x20-world-00018` | second_division -> third_division | 46 | 17 | 8049500 | 10599090 | 6966450 | fee_below_valuation=21, player_unwilling=3, stale_ownership=2, unaffordable=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00018` | third_division -> first_division | 6 | 4 | 13657900 | 18690836.5 | 14833620 | fee_below_valuation=1, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00018` | third_division -> second_division | 15 | 10 | 10538700 | 12705987 | 12824657 | fee_below_valuation=5 |
| `phase81-tactical-shape-50x20-world-00018` | third_division -> third_division | 56 | 29 | 5381800 | 7009726.5 | 6450469 | fee_below_valuation=23, stale_ownership=2, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00019` | first_division -> first_division | 95 | 41 | 21103200 | 31433502 | 29091563 | fee_below_valuation=23, player_unwilling=20, stale_ownership=5, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00019` | first_division -> second_division | 60 | 19 | 17502700 | 26555431.5 | 24484954 | fee_below_valuation=19, player_unwilling=15, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00019` | second_division -> first_division | 12 | 7 | 19970550 | 35946990 | 25560172 | fee_below_valuation=3, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00019` | second_division -> second_division | 33 | 17 | 15332800 | 25317360 | 14129360 | fee_below_valuation=9, player_unwilling=4, stale_ownership=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00019` | second_division -> third_division | 40 | 15 | 13172800 | 21677390 | 20853507 | stale_ownership=5, fee_below_valuation=13, player_unwilling=6, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00019` | third_division -> first_division | 1 | 1 | 27812800 | 38937920 | 36991010 | none |
| `phase81-tactical-shape-50x20-world-00019` | third_division -> second_division | 15 | 6 | 15508100 | 21222835 | 26980044 | stale_ownership=3, fee_below_valuation=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00019` | third_division -> third_division | 62 | 33 | 5351450 | 7386064 | 7028560 | fee_below_valuation=19, stale_ownership=3, player_unwilling=4, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00020` | first_division -> first_division | 86 | 38 | 52208250 | 85012781 | 96085424.5 | fee_below_valuation=24, stale_ownership=7, player_unwilling=8, player_not_for_sale=7 |
| `phase81-tactical-shape-50x20-world-00020` | first_division -> second_division | 54 | 19 | 17079500 | 26712384 | 19381268 | fee_below_valuation=14, stale_ownership=5, player_unwilling=10, player_not_for_sale=5 |
| `phase81-tactical-shape-50x20-world-00020` | second_division -> first_division | 16 | 10 | 16000600 | 27229732.5 | 28070098 | stale_ownership=1, fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00020` | second_division -> second_division | 35 | 16 | 16587700 | 26476450 | 20484896.5 | player_unwilling=4, fee_below_valuation=10, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00020` | second_division -> third_division | 46 | 24 | 11501350 | 14093544.5 | 10473204 | fee_below_valuation=13, player_unwilling=4, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00020` | third_division -> first_division | 6 | 4 | 8097050 | 11250475 | 10972207.5 | stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00020` | third_division -> second_division | 19 | 12 | 8331500 | 11401658 | 11533454.5 | fee_below_valuation=4, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00020` | third_division -> third_division | 55 | 23 | 5479800 | 7297560 | 6849090 | fee_below_valuation=22, stale_ownership=3, player_unwilling=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00021` | first_division -> first_division | 73 | 31 | 35958300 | 64724940 | 61488670 | player_unwilling=12, fee_below_valuation=20, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00021` | first_division -> second_division | 45 | 21 | 24406300 | 41399100 | 53370602 | fee_below_valuation=11, player_unwilling=6, stale_ownership=3, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00021` | second_division -> first_division | 31 | 17 | 24406300 | 38439923 | 57148648 | fee_below_valuation=12, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00021` | second_division -> second_division | 53 | 24 | 17632100 | 29621928 | 24586367 | fee_below_valuation=16, player_unwilling=7, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00021` | second_division -> third_division | 43 | 23 | 12319800 | 16284912 | 16596293 | fee_below_valuation=17, player_unwilling=2, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00021` | third_division -> first_division | 4 | 3 | 12311650 | 22160970 | 25603020 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00021` | third_division -> second_division | 10 | 8 | 13157700 | 16654764 | 15708552.5 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00021` | third_division -> third_division | 59 | 34 | 5876000 | 7892220 | 7348144.5 | fee_below_valuation=18, player_unwilling=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00022` | first_division -> first_division | 91 | 45 | 32792200 | 53466610 | 51517440 | player_unwilling=19, fee_below_valuation=18, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00022` | first_division -> second_division | 52 | 17 | 19190200 | 30089738.5 | 30997788 | fee_below_valuation=16, player_unwilling=13, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00022` | second_division -> first_division | 17 | 11 | 18298400 | 27742523 | 30943483 | stale_ownership=2, fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00022` | second_division -> second_division | 43 | 19 | 25240500 | 34046280 | 29289289 | fee_below_valuation=16, player_unwilling=3, player_not_for_sale=1, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00022` | second_division -> third_division | 33 | 20 | 7479400 | 10140466 | 10005121 | fee_below_valuation=12 |
| `phase81-tactical-shape-50x20-world-00022` | third_division -> second_division | 13 | 9 | 12708000 | 18125100 | 23461200 | fee_below_valuation=2, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00022` | third_division -> third_division | 69 | 33 | 5156300 | 6550320 | 5964248 | fee_below_valuation=28, stale_ownership=3, player_unwilling=3 |
| `phase81-tactical-shape-50x20-world-00023` | first_division -> first_division | 86 | 32 | 20754900 | 35380307 | 44230825 | player_unwilling=23, fee_below_valuation=19, stale_ownership=4, player_not_for_sale=3 |
| `phase81-tactical-shape-50x20-world-00023` | first_division -> second_division | 55 | 23 | 18489700 | 27587232 | 24446160 | fee_below_valuation=16, player_unwilling=9, stale_ownership=3, player_not_for_sale=3 |
| `phase81-tactical-shape-50x20-world-00023` | second_division -> first_division | 19 | 11 | 24817600 | 41639040 | 44427264 | fee_below_valuation=4, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00023` | second_division -> second_division | 45 | 20 | 19152300 | 28190448 | 18558242.5 | fee_below_valuation=14, player_unwilling=4, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00023` | second_division -> third_division | 41 | 16 | 13744500 | 19658229 | 18524528.5 | player_unwilling=7, fee_below_valuation=13, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00023` | third_division -> first_division | 3 | 1 | 11980300 | 19839377 | 3973764 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00023` | third_division -> second_division | 8 | 4 | 23517300 | 32628034 | 48059156 | fee_below_valuation=3, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00023` | third_division -> third_division | 61 | 26 | 7887400 | 10793907 | 10387871.5 | fee_below_valuation=26, player_unwilling=6, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00024` | first_division -> first_division | 89 | 32 | 20280700 | 34764300 | 87898212.5 | fee_below_valuation=28, player_unwilling=16, stale_ownership=6, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00024` | first_division -> second_division | 54 | 26 | 16034550 | 24604672.5 | 20481940 | player_unwilling=9, fee_below_valuation=12, stale_ownership=4, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00024` | second_division -> first_division | 15 | 8 | 19793400 | 31942103 | 28643071 | stale_ownership=1, fee_below_valuation=5 |
| `phase81-tactical-shape-50x20-world-00024` | second_division -> second_division | 40 | 16 | 22308700 | 39650512.5 | 31412351.5 | player_unwilling=3, stale_ownership=5, fee_below_valuation=12, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00024` | second_division -> third_division | 56 | 23 | 12770750 | 17590971 | 15977905 | fee_below_valuation=18, player_unwilling=7, player_not_for_sale=2, unaffordable=1, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00024` | third_division -> first_division | 4 | 3 | 16094450 | 27203602.5 | 23493203 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00024` | third_division -> second_division | 14 | 9 | 9555550 | 13432221.5 | 13959544 | fee_below_valuation=4 |
| `phase81-tactical-shape-50x20-world-00024` | third_division -> third_division | 46 | 21 | 7150700 | 10823254 | 9051767 | fee_below_valuation=17, stale_ownership=2, player_unwilling=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00025` | first_division -> first_division | 88 | 40 | 24098900 | 37692922.5 | 33097950 | fee_below_valuation=24, player_unwilling=17, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00025` | first_division -> second_division | 64 | 19 | 19757050 | 31034273 | 22730765 | player_unwilling=19, fee_below_valuation=21, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00025` | second_division -> first_division | 17 | 11 | 24286300 | 41515898 | 34343587 | fee_below_valuation=4, stale_ownership=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00025` | second_division -> second_division | 29 | 15 | 23472600 | 36560736 | 32118240 | fee_below_valuation=7, player_not_for_sale=1, stale_ownership=3, player_unwilling=1 |
| `phase81-tactical-shape-50x20-world-00025` | second_division -> third_division | 43 | 21 | 10157400 | 14993280 | 10930208 | fee_below_valuation=15, stale_ownership=2, player_unwilling=5 |
| `phase81-tactical-shape-50x20-world-00025` | third_division -> first_division | 3 | 1 | 28372700 | 47666136 | 17229970 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00025` | third_division -> second_division | 15 | 9 | 22519400 | 36256234 | 31278980 | fee_below_valuation=2, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00025` | third_division -> third_division | 59 | 20 | 6154300 | 7928613 | 7874230 | fee_below_valuation=22, player_unwilling=7, unaffordable=1, player_not_for_sale=1, stale_ownership=5 |
| `phase81-tactical-shape-50x20-world-00026` | first_division -> first_division | 90 | 38 | 21968700 | 32679170 | 50346473.5 | stale_ownership=3, fee_below_valuation=20, player_unwilling=27, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00026` | first_division -> second_division | 48 | 19 | 16895250 | 25371474 | 16312810 | player_unwilling=14, fee_below_valuation=11, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00026` | second_division -> first_division | 15 | 8 | 22680100 | 37079266 | 29694482 | fee_below_valuation=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00026` | second_division -> second_division | 40 | 19 | 20473500 | 36852300 | 49975707 | fee_below_valuation=8, player_unwilling=9, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00026` | second_division -> third_division | 40 | 18 | 8941550 | 11883887.5 | 10992569 | fee_below_valuation=17, player_unwilling=4, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00026` | third_division -> first_division | 1 | 1 | 16463500 | 19591565 | 17632383 | none |
| `phase81-tactical-shape-50x20-world-00026` | third_division -> second_division | 20 | 8 | 9022550 | 11923670.5 | 14422846.5 | fee_below_valuation=6, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00026` | third_division -> third_division | 62 | 27 | 5159150 | 7246980.5 | 6900958 | fee_below_valuation=25, player_unwilling=3, unaffordable=1, stale_ownership=5 |
| `phase81-tactical-shape-50x20-world-00027` | first_division -> first_division | 77 | 29 | 32322300 | 40793904 | 52163054 | player_unwilling=22, fee_below_valuation=15, stale_ownership=4, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00027` | first_division -> second_division | 59 | 27 | 14885600 | 21923507 | 23711300 | player_unwilling=8, fee_below_valuation=19, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00027` | second_division -> first_division | 18 | 7 | 18852400 | 28108690 | 24623598 | fee_below_valuation=7, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00027` | second_division -> second_division | 30 | 21 | 18493050 | 28126783 | 28127082 | fee_below_valuation=5, player_unwilling=4 |
| `phase81-tactical-shape-50x20-world-00027` | second_division -> third_division | 51 | 20 | 15695400 | 21479155 | 9650107.5 | fee_below_valuation=24, stale_ownership=3, player_unwilling=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00027` | third_division -> first_division | 13 | 8 | 18683100 | 28448515 | 24289300.5 | fee_below_valuation=2, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00027` | third_division -> second_division | 19 | 10 | 10420800 | 14589120 | 20304195 | fee_below_valuation=7, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00027` | third_division -> third_division | 50 | 22 | 6725500 | 7866746 | 6640675.5 | fee_below_valuation=21, player_unwilling=4, player_not_for_sale=1, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00028` | first_division -> first_division | 82 | 41 | 23041650 | 39773599 | 47734265 | player_unwilling=17, fee_below_valuation=16, stale_ownership=6 |
| `phase81-tactical-shape-50x20-world-00028` | first_division -> second_division | 50 | 17 | 15891600 | 24952680 | 22598742 | player_unwilling=10, fee_below_valuation=14, stale_ownership=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00028` | second_division -> first_division | 18 | 12 | 18833700 | 29698121.5 | 26326215.5 | fee_below_valuation=4, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00028` | second_division -> second_division | 38 | 13 | 26070700 | 44966808 | 35040960 | fee_below_valuation=10, player_unwilling=10, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00028` | second_division -> third_division | 48 | 24 | 7977600 | 10448032 | 5699996.5 | fee_below_valuation=17, stale_ownership=1, player_unwilling=4, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00028` | third_division -> first_division | 8 | 6 | 8113200 | 12865480.5 | 7069932.5 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00028` | third_division -> second_division | 20 | 6 | 10069100 | 14154658 | 16617907 | stale_ownership=3, fee_below_valuation=9, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00028` | third_division -> third_division | 54 | 29 | 4885600 | 6832059.5 | 6704129 | player_unwilling=7, stale_ownership=3, fee_below_valuation=13, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00029` | first_division -> first_division | 80 | 34 | 28808800 | 43801130 | 45849947.5 | fee_below_valuation=21, player_unwilling=16, player_not_for_sale=4, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00029` | first_division -> second_division | 76 | 26 | 18257550 | 26146788 | 18273380 | fee_below_valuation=22, player_unwilling=17, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00029` | second_division -> first_division | 25 | 17 | 20175400 | 34179600 | 35458769 | fee_below_valuation=5, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00029` | second_division -> second_division | 21 | 10 | 17253600 | 27174420 | 25657047.5 | fee_below_valuation=5, stale_ownership=2, player_not_for_sale=1, player_unwilling=2 |
| `phase81-tactical-shape-50x20-world-00029` | second_division -> third_division | 47 | 19 | 8552600 | 10928260 | 15231076 | player_unwilling=3, fee_below_valuation=16, stale_ownership=5 |
| `phase81-tactical-shape-50x20-world-00029` | third_division -> first_division | 3 | 1 | 13472900 | 21691369 | 19522185 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00029` | third_division -> second_division | 11 | 6 | 9227500 | 11448388 | 23217564 | fee_below_valuation=1, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00029` | third_division -> third_division | 55 | 30 | 5277700 | 7085040 | 6557697 | fee_below_valuation=19, stale_ownership=2, player_unwilling=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00030` | first_division -> first_division | 93 | 40 | 44237400 | 64740451 | 66785325 | player_unwilling=20, fee_below_valuation=25, stale_ownership=3, player_not_for_sale=3 |
| `phase81-tactical-shape-50x20-world-00030` | first_division -> second_division | 54 | 23 | 16911150 | 27951096 | 31172532 | fee_below_valuation=14, player_unwilling=8, player_not_for_sale=2, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00030` | second_division -> first_division | 13 | 12 | 18581000 | 33313140 | 31945141 | none |
| `phase81-tactical-shape-50x20-world-00030` | second_division -> second_division | 34 | 15 | 12650850 | 17101542 | 12970170 | fee_below_valuation=10, stale_ownership=3, player_unwilling=2 |
| `phase81-tactical-shape-50x20-world-00030` | second_division -> third_division | 53 | 20 | 7943000 | 10869996 | 12976268 | fee_below_valuation=23, player_unwilling=5, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00030` | third_division -> first_division | 2 | 1 | 11555450 | 16064587.5 | 21191670 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00030` | third_division -> second_division | 20 | 12 | 11154000 | 14362907.5 | 13576685 | fee_below_valuation=7, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00030` | third_division -> third_division | 49 | 22 | 4807100 | 6113100 | 6068339 | player_unwilling=4, fee_below_valuation=20, unaffordable=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00031` | first_division -> first_division | 95 | 40 | 17997400 | 28900346 | 27693601 | fee_below_valuation=28, player_unwilling=15, stale_ownership=5, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00031` | first_division -> second_division | 47 | 21 | 18572300 | 27857760 | 26796848 | player_unwilling=6, fee_below_valuation=17, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00031` | second_division -> first_division | 10 | 1 | 16584300 | 24158627.5 | 171016390 | fee_below_valuation=7, player_not_for_sale=1, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00031` | second_division -> second_division | 49 | 22 | 22843200 | 38154054 | 36671607 | fee_below_valuation=15, stale_ownership=3, player_unwilling=8 |
| `phase81-tactical-shape-50x20-world-00031` | second_division -> third_division | 46 | 22 | 12206500 | 16049803.5 | 19250598.5 | fee_below_valuation=19, stale_ownership=1, player_unwilling=3 |
| `phase81-tactical-shape-50x20-world-00031` | third_division -> first_division | 3 | 2 | 65455300 | 103092098 | 81324275 | none |
| `phase81-tactical-shape-50x20-world-00031` | third_division -> second_division | 12 | 7 | 18121300 | 30702171 | 25093621 | fee_below_valuation=4, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00031` | third_division -> third_division | 56 | 30 | 5807200 | 7928131 | 7463349.5 | fee_below_valuation=16, player_unwilling=5, stale_ownership=5 |
| `phase81-tactical-shape-50x20-world-00032` | first_division -> first_division | 82 | 42 | 38873600 | 48239370 | 37663164 | fee_below_valuation=14, stale_ownership=8, player_unwilling=11 |
| `phase81-tactical-shape-50x20-world-00032` | first_division -> second_division | 46 | 18 | 14984350 | 21250468 | 17924494.5 | fee_below_valuation=16, player_unwilling=7, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00032` | second_division -> first_division | 19 | 12 | 22210500 | 39978900 | 39235102.5 | fee_below_valuation=6 |
| `phase81-tactical-shape-50x20-world-00032` | second_division -> second_division | 50 | 21 | 16872850 | 24813995 | 22406345 | fee_below_valuation=11, player_unwilling=9, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00032` | second_division -> third_division | 40 | 17 | 8646150 | 11215659 | 8333710 | player_unwilling=12, fee_below_valuation=9, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00032` | third_division -> first_division | 4 | 2 | 18906900 | 30849374 | 29573362 | stale_ownership=1, fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00032` | third_division -> second_division | 12 | 7 | 14116500 | 19067584.5 | 18205595 | stale_ownership=1, fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00032` | third_division -> third_division | 62 | 34 | 5612700 | 7197014 | 6596710.5 | fee_below_valuation=24, stale_ownership=1, player_unwilling=1 |
| `phase81-tactical-shape-50x20-world-00033` | first_division -> first_division | 84 | 34 | 35917300 | 63260540 | 74099525.5 | fee_below_valuation=24, player_unwilling=16, player_not_for_sale=2, stale_ownership=7 |
| `phase81-tactical-shape-50x20-world-00033` | first_division -> second_division | 56 | 21 | 19465350 | 29852614.5 | 25896910 | player_unwilling=15, fee_below_valuation=12, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00033` | second_division -> first_division | 21 | 11 | 20610900 | 37099620 | 37234210 | fee_below_valuation=7, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00033` | second_division -> second_division | 45 | 24 | 15578900 | 26723340 | 19867305 | fee_below_valuation=12, stale_ownership=1, player_unwilling=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00033` | second_division -> third_division | 37 | 16 | 13321400 | 20681474 | 16904956.5 | fee_below_valuation=15, player_unwilling=2, player_not_for_sale=2, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00033` | third_division -> first_division | 3 | 2 | 15760200 | 22064280 | 20465282.5 | stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00033` | third_division -> second_division | 7 | 6 | 13827300 | 22474800 | 20247384.5 | stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00033` | third_division -> third_division | 65 | 26 | 8988800 | 10696672 | 9242635 | fee_below_valuation=25, player_unwilling=7, stale_ownership=3, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00034` | first_division -> first_division | 91 | 43 | 16237000 | 26141570 | 21823596 | fee_below_valuation=29, player_unwilling=9, stale_ownership=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00034` | first_division -> second_division | 62 | 24 | 17233600 | 27074578.5 | 23776611 | fee_below_valuation=26, player_unwilling=5, stale_ownership=4, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00034` | second_division -> first_division | 13 | 6 | 21666700 | 34883387 | 34256134 | fee_below_valuation=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00034` | second_division -> second_division | 37 | 19 | 18388600 | 31050432 | 26762624 | player_unwilling=3, fee_below_valuation=12, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00034` | second_division -> third_division | 39 | 14 | 9140400 | 13017402 | 6571175.5 | fee_below_valuation=18, player_unwilling=3, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00034` | third_division -> first_division | 4 | 2 | 4824250 | 5701197.5 | 4651068.5 | fee_below_valuation=1, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00034` | third_division -> second_division | 8 | 7 | 7228550 | 9994823.5 | 9115820 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00034` | third_division -> third_division | 63 | 26 | 4804300 | 6574685 | 5540051 | fee_below_valuation=27, player_unwilling=5, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00035` | first_division -> first_division | 84 | 42 | 60190100 | 76998185.5 | 103852086 | fee_below_valuation=25, player_unwilling=9, stale_ownership=5, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00035` | first_division -> second_division | 49 | 18 | 19277500 | 27355104 | 35734033.5 | fee_below_valuation=13, player_unwilling=10, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00035` | second_division -> first_division | 15 | 8 | 21553200 | 36209376 | 39034232 | fee_below_valuation=7 |
| `phase81-tactical-shape-50x20-world-00035` | second_division -> second_division | 44 | 21 | 20071200 | 32863039 | 26214618 | player_unwilling=7, fee_below_valuation=13, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00035` | second_division -> third_division | 48 | 22 | 12784800 | 17898720 | 15323903 | fee_below_valuation=18, player_unwilling=3, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00035` | third_division -> first_division | 9 | 2 | 15869900 | 21717958 | 20680952 | fee_below_valuation=4, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00035` | third_division -> second_division | 15 | 9 | 11157400 | 14958945 | 14289200 | fee_below_valuation=3, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00035` | third_division -> third_division | 54 | 15 | 9781500 | 13540041.5 | 15785733 | fee_below_valuation=26, player_unwilling=6, stale_ownership=2, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00036` | first_division -> first_division | 85 | 36 | 34056300 | 45976005 | 55552367.5 | fee_below_valuation=25, stale_ownership=8, player_unwilling=13, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00036` | first_division -> second_division | 59 | 24 | 16165600 | 24891233 | 19256587 | player_unwilling=8, fee_below_valuation=22, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00036` | second_division -> first_division | 18 | 12 | 15056750 | 19736575.5 | 19101888.5 | fee_below_valuation=5 |
| `phase81-tactical-shape-50x20-world-00036` | second_division -> second_division | 29 | 11 | 14336600 | 22257572 | 18391960 | fee_below_valuation=9, player_unwilling=7 |
| `phase81-tactical-shape-50x20-world-00036` | second_division -> third_division | 53 | 25 | 14380000 | 20790140 | 14001391 | fee_below_valuation=20, player_unwilling=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00036` | third_division -> first_division | 5 | 2 | 6251000 | 8554494 | 1417642398.5 | fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00036` | third_division -> second_division | 20 | 14 | 8817500 | 12198702.5 | 13427367 | fee_below_valuation=6 |
| `phase81-tactical-shape-50x20-world-00036` | third_division -> third_division | 49 | 26 | 5853400 | 8497671 | 7879349 | player_unwilling=6, fee_below_valuation=15, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00037` | first_division -> first_division | 91 | 30 | 43418200 | 60785480 | 80850287.5 | player_unwilling=28, stale_ownership=3, fee_below_valuation=26 |
| `phase81-tactical-shape-50x20-world-00037` | first_division -> second_division | 55 | 17 | 18151500 | 30002040 | 20062418 | fee_below_valuation=23, player_unwilling=13, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00037` | second_division -> first_division | 12 | 8 | 20642100 | 29592622.5 | 30445271.5 | fee_below_valuation=3, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00037` | second_division -> second_division | 41 | 23 | 17130100 | 22686773 | 28945420 | fee_below_valuation=10, player_unwilling=4, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00037` | second_division -> third_division | 43 | 18 | 7438800 | 10414320 | 10569479 | fee_below_valuation=16, player_unwilling=5, stale_ownership=2, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00037` | third_division -> first_division | 5 | 3 | 48111400 | 78205208 | 70384654 | stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00037` | third_division -> second_division | 12 | 8 | 10091450 | 14534605 | 14307233.5 | fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00037` | third_division -> third_division | 58 | 24 | 7477300 | 10232685 | 9868610 | fee_below_valuation=25, player_unwilling=3, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00038` | first_division -> first_division | 91 | 33 | 18941300 | 31817880 | 51525880 | fee_below_valuation=34, player_unwilling=18, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00038` | first_division -> second_division | 50 | 24 | 16695200 | 27215741.5 | 20805419 | player_unwilling=16, stale_ownership=5, fee_below_valuation=5 |
| `phase81-tactical-shape-50x20-world-00038` | second_division -> first_division | 17 | 15 | 16744900 | 29163060 | 25196070 | stale_ownership=1, fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00038` | second_division -> second_division | 45 | 16 | 18077500 | 31708992 | 30123521 | fee_below_valuation=19, player_unwilling=5, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00038` | second_division -> third_division | 44 | 18 | 9623750 | 14005082 | 11782888.5 | fee_below_valuation=17, player_unwilling=5, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00038` | third_division -> second_division | 13 | 5 | 6008100 | 8222085 | 8756290 | fee_below_valuation=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00038` | third_division -> third_division | 58 | 25 | 5249400 | 7141609.5 | 5918504 | stale_ownership=3, fee_below_valuation=16, player_unwilling=11, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00039` | first_division -> first_division | 80 | 34 | 31938200 | 43776411 | 83819404.5 | fee_below_valuation=20, player_unwilling=10, stale_ownership=7, player_not_for_sale=4 |
| `phase81-tactical-shape-50x20-world-00039` | first_division -> second_division | 54 | 20 | 18545100 | 26844300 | 14801891 | fee_below_valuation=21, player_unwilling=8, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00039` | second_division -> first_division | 22 | 15 | 20414900 | 33374340 | 31996755 | fee_below_valuation=7 |
| `phase81-tactical-shape-50x20-world-00039` | second_division -> second_division | 40 | 20 | 10415650 | 14610120 | 11618375 | fee_below_valuation=14, stale_ownership=1, player_unwilling=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00039` | second_division -> third_division | 40 | 16 | 9094850 | 11645871.5 | 8753150.5 | fee_below_valuation=15, player_unwilling=5, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00039` | third_division -> first_division | 6 | 4 | 12024000 | 18007444 | 12294774 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00039` | third_division -> second_division | 13 | 10 | 9001100 | 12390813 | 13800640.5 | fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00039` | third_division -> third_division | 62 | 28 | 5682400 | 7776364 | 7022140 | fee_below_valuation=20, stale_ownership=5, player_unwilling=6, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00040` | first_division -> first_division | 81 | 33 | 42332400 | 57198953 | 46597378 | player_unwilling=12, fee_below_valuation=22, stale_ownership=8, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00040` | first_division -> second_division | 45 | 15 | 18043600 | 27084915 | 34728990 | player_unwilling=12, fee_below_valuation=13, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00040` | second_division -> first_division | 20 | 11 | 27096500 | 41338577 | 37204689 | stale_ownership=1, fee_below_valuation=6 |
| `phase81-tactical-shape-50x20-world-00040` | second_division -> second_division | 52 | 20 | 19759700 | 33196296 | 24245401.5 | fee_below_valuation=16, player_unwilling=10, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00040` | second_division -> third_division | 36 | 13 | 7958700 | 10069185 | 11191184 | stale_ownership=5, fee_below_valuation=10, player_unwilling=6 |
| `phase81-tactical-shape-50x20-world-00040` | third_division -> first_division | 1 | 1 | 10967900 | 13051801 | 11746601 | none |
| `phase81-tactical-shape-50x20-world-00040` | third_division -> second_division | 11 | 6 | 14509100 | 21638453 | 16590818.5 | stale_ownership=2, fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00040` | third_division -> third_division | 66 | 30 | 5529850 | 6943557.5 | 6696737.5 | fee_below_valuation=31, player_unwilling=2, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00041` | first_division -> first_division | 96 | 49 | 35544500 | 49202474 | 149328188 | fee_below_valuation=28, player_unwilling=14, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00041` | first_division -> second_division | 49 | 22 | 19430700 | 30166162 | 28067305 | fee_below_valuation=22, stale_ownership=3, player_unwilling=1 |
| `phase81-tactical-shape-50x20-world-00041` | second_division -> first_division | 12 | 8 | 19005400 | 31097713.5 | 35158355 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00041` | second_division -> second_division | 43 | 22 | 13385400 | 19274976 | 19802769 | player_unwilling=7, fee_below_valuation=10, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00041` | second_division -> third_division | 44 | 15 | 9539700 | 14300272 | 8247211 | fee_below_valuation=20, player_unwilling=6, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00041` | third_division -> second_division | 16 | 9 | 13516600 | 21761726 | 29346300 | fee_below_valuation=4, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00041` | third_division -> third_division | 58 | 30 | 5767450 | 7647017 | 7370566.5 | fee_below_valuation=17, player_not_for_sale=1, stale_ownership=4, player_unwilling=2, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00042` | first_division -> first_division | 73 | 34 | 15715200 | 27009000 | 19484929.5 | fee_below_valuation=19, stale_ownership=5, player_unwilling=9, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00042` | first_division -> second_division | 65 | 18 | 16419000 | 24867180 | 28196560 | fee_below_valuation=26, player_unwilling=12, stale_ownership=2, player_not_for_sale=3 |
| `phase81-tactical-shape-50x20-world-00042` | second_division -> first_division | 27 | 13 | 21981300 | 38757420 | 38757420 | fee_below_valuation=9, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00042` | second_division -> second_division | 33 | 17 | 18207800 | 31431960 | 25752813 | player_unwilling=4, fee_below_valuation=9, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00042` | second_division -> third_division | 37 | 16 | 9096400 | 12448423 | 11950130.5 | fee_below_valuation=14, stale_ownership=2, player_unwilling=3 |
| `phase81-tactical-shape-50x20-world-00042` | third_division -> first_division | 7 | 3 | 11473600 | 16063040 | 17934235 | fee_below_valuation=4 |
| `phase81-tactical-shape-50x20-world-00042` | third_division -> second_division | 10 | 7 | 7217050 | 10822626.5 | 9367793 | fee_below_valuation=2, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00042` | third_division -> third_division | 65 | 37 | 5662800 | 7749542 | 7807985 | stale_ownership=2, player_unwilling=3, fee_below_valuation=18 |
| `phase81-tactical-shape-50x20-world-00043` | first_division -> first_division | 82 | 44 | 55168900 | 94964546.5 | 100208060 | fee_below_valuation=17, player_unwilling=10, stale_ownership=2, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00043` | first_division -> second_division | 51 | 29 | 20076000 | 32221260 | 31415680 | player_unwilling=10, fee_below_valuation=8, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00043` | second_division -> first_division | 23 | 17 | 21380000 | 38317440 | 38317440 | fee_below_valuation=5 |
| `phase81-tactical-shape-50x20-world-00043` | second_division -> second_division | 42 | 25 | 26341050 | 40592807.5 | 42553560 | fee_below_valuation=11, stale_ownership=3, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00043` | second_division -> third_division | 38 | 17 | 8435500 | 11747504 | 15665532 | stale_ownership=2, fee_below_valuation=9, player_unwilling=6 |
| `phase81-tactical-shape-50x20-world-00043` | third_division -> first_division | 3 | 2 | 13427800 | 21618758 | 60471865.5 | fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00043` | third_division -> second_division | 15 | 8 | 21380000 | 38484000 | 21753029.5 | stale_ownership=1, fee_below_valuation=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00043` | third_division -> third_division | 64 | 25 | 5892900 | 7928405 | 7614271 | player_unwilling=8, fee_below_valuation=23, player_not_for_sale=2, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00044` | first_division -> first_division | 87 | 40 | 33169500 | 45392461 | 51179095 | fee_below_valuation=26, stale_ownership=6, player_unwilling=11 |
| `phase81-tactical-shape-50x20-world-00044` | first_division -> second_division | 61 | 22 | 23129600 | 34136060 | 27370940 | player_unwilling=12, fee_below_valuation=23, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00044` | second_division -> first_division | 17 | 12 | 21736600 | 39125880 | 38096911 | fee_below_valuation=5 |
| `phase81-tactical-shape-50x20-world-00044` | second_division -> second_division | 35 | 20 | 18190100 | 30431240 | 26239892 | player_unwilling=3, fee_below_valuation=8, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00044` | second_division -> third_division | 40 | 19 | 9526300 | 14684085.5 | 6626441 | fee_below_valuation=16, player_unwilling=3, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00044` | third_division -> first_division | 4 | 2 | 15936400 | 21808963.5 | 22171203 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00044` | third_division -> second_division | 12 | 8 | 21307000 | 29829800 | 28336452.5 | fee_below_valuation=3, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00044` | third_division -> third_division | 62 | 26 | 5104400 | 7082421.5 | 6441904 | fee_below_valuation=25, stale_ownership=1, unaffordable=1, player_unwilling=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00045` | first_division -> first_division | 89 | 38 | 19926700 | 32199930 | 30070497.5 | fee_below_valuation=27, player_unwilling=16, stale_ownership=5, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00045` | first_division -> second_division | 55 | 20 | 15777700 | 25103064 | 26791391 | fee_below_valuation=18, stale_ownership=4, player_unwilling=11 |
| `phase81-tactical-shape-50x20-world-00045` | second_division -> first_division | 16 | 7 | 26530900 | 38893152 | 39409702 | fee_below_valuation=5, player_not_for_sale=2, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00045` | second_division -> second_division | 32 | 15 | 16552250 | 24418952 | 19899176 | fee_below_valuation=9, stale_ownership=4, player_unwilling=3 |
| `phase81-tactical-shape-50x20-world-00045` | second_division -> third_division | 45 | 21 | 11501500 | 15678720 | 12909874 | player_unwilling=4, fee_below_valuation=15, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00045` | third_division -> first_division | 3 | 0 | 16502800 | 29705040 | 0 | player_not_for_sale=1, fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00045` | third_division -> second_division | 21 | 12 | 10708400 | 14991760 | 12513124.5 | fee_below_valuation=8 |
| `phase81-tactical-shape-50x20-world-00045` | third_division -> third_division | 57 | 27 | 5948700 | 8140796 | 7817701 | fee_below_valuation=20, stale_ownership=2, player_unwilling=6 |
| `phase81-tactical-shape-50x20-world-00046` | first_division -> first_division | 93 | 38 | 23837000 | 34073494 | 34306011.5 | fee_below_valuation=26, stale_ownership=7, player_unwilling=20 |
| `phase81-tactical-shape-50x20-world-00046` | first_division -> second_division | 58 | 21 | 17500750 | 26943304 | 24133970 | player_unwilling=12, fee_below_valuation=19, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00046` | second_division -> first_division | 12 | 6 | 25971800 | 46749240 | 37346125 | fee_below_valuation=4, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00046` | second_division -> second_division | 36 | 19 | 16067550 | 23655375 | 26276609 | fee_below_valuation=12, player_unwilling=4, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00046` | second_division -> third_division | 37 | 18 | 13245000 | 21460320 | 9181965.5 | player_unwilling=4, fee_below_valuation=10, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00046` | third_division -> first_division | 3 | 1 | 15283200 | 24605952 | 30195113 | stale_ownership=1, fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00046` | third_division -> second_division | 14 | 11 | 10842950 | 14782411 | 12769814 | player_not_for_sale=1, fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00046` | third_division -> third_division | 65 | 32 | 8262100 | 9831899 | 7572883.5 | fee_below_valuation=22, player_unwilling=4, unaffordable=1, stale_ownership=1, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00047` | first_division -> first_division | 84 | 47 | 38253100 | 64552106.5 | 73418810 | fee_below_valuation=21, player_unwilling=7, stale_ownership=2, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00047` | first_division -> second_division | 45 | 19 | 16088600 | 26081280 | 19421456 | fee_below_valuation=16, stale_ownership=3, player_unwilling=3 |
| `phase81-tactical-shape-50x20-world-00047` | second_division -> first_division | 17 | 8 | 17670600 | 27831195 | 29534210.5 | fee_below_valuation=7, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00047` | second_division -> second_division | 44 | 18 | 20135900 | 29684970 | 29302742 | fee_below_valuation=14, player_unwilling=9, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00047` | second_division -> third_division | 35 | 18 | 11365500 | 13761993 | 12305497.5 | fee_below_valuation=11, stale_ownership=3, player_unwilling=2, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00047` | third_division -> first_division | 7 | 1 | 17129300 | 27578173 | 10073749 | fee_below_valuation=5 |
| `phase81-tactical-shape-50x20-world-00047` | third_division -> second_division | 19 | 8 | 13285000 | 18298511 | 31228841.5 | fee_below_valuation=9, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00047` | third_division -> third_division | 67 | 26 | 7650900 | 10306037 | 8850671 | player_unwilling=14, fee_below_valuation=19, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00048` | first_division -> first_division | 88 | 35 | 22314050 | 33403266 | 26213100 | fee_below_valuation=23, player_unwilling=19, stale_ownership=4, player_not_for_sale=3 |
| `phase81-tactical-shape-50x20-world-00048` | first_division -> second_division | 54 | 21 | 16783800 | 29010089.5 | 24810450 | player_unwilling=13, fee_below_valuation=15, stale_ownership=1, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00048` | second_division -> first_division | 13 | 7 | 23883600 | 42990480 | 40840940 | fee_below_valuation=2, stale_ownership=3 |
| `phase81-tactical-shape-50x20-world-00048` | second_division -> second_division | 35 | 15 | 17519100 | 31534380 | 32218550 | fee_below_valuation=8, stale_ownership=4, player_unwilling=7 |
| `phase81-tactical-shape-50x20-world-00048` | second_division -> third_division | 41 | 19 | 9465500 | 12977300 | 13663134 | fee_below_valuation=16, player_unwilling=3 |
| `phase81-tactical-shape-50x20-world-00048` | third_division -> first_division | 3 | 2 | 20093400 | 36168120 | 32402964 | player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00048` | third_division -> second_division | 19 | 9 | 13287100 | 20605320 | 8691958 | fee_below_valuation=8 |
| `phase81-tactical-shape-50x20-world-00048` | third_division -> third_division | 60 | 28 | 5617250 | 7534940 | 8796786 | fee_below_valuation=24, player_not_for_sale=1, player_unwilling=4, unaffordable=1 |
| `phase81-tactical-shape-50x20-world-00049` | first_division -> first_division | 83 | 36 | 21965900 | 31559760 | 30880140 | stale_ownership=5, fee_below_valuation=16, player_unwilling=19, player_not_for_sale=2 |
| `phase81-tactical-shape-50x20-world-00049` | first_division -> second_division | 62 | 22 | 19280900 | 28395063 | 25566241 | fee_below_valuation=21, player_unwilling=12, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00049` | second_division -> first_division | 17 | 7 | 20464100 | 32230958 | 29976993 | stale_ownership=1, fee_below_valuation=7 |
| `phase81-tactical-shape-50x20-world-00049` | second_division -> second_division | 34 | 14 | 14686550 | 20813576 | 20047110 | fee_below_valuation=10, player_unwilling=5, stale_ownership=2 |
| `phase81-tactical-shape-50x20-world-00049` | second_division -> third_division | 48 | 17 | 11090900 | 16017593 | 17627790 | fee_below_valuation=24, player_unwilling=4 |
| `phase81-tactical-shape-50x20-world-00049` | third_division -> first_division | 7 | 4 | 5797700 | 7934152 | 6961108.5 | fee_below_valuation=2 |
| `phase81-tactical-shape-50x20-world-00049` | third_division -> second_division | 12 | 6 | 18397050 | 25474130 | 21450738.5 | fee_below_valuation=4, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00049` | third_division -> third_division | 54 | 21 | 4897800 | 6856920 | 6171210 | fee_below_valuation=24, stale_ownership=3, player_unwilling=5 |
| `phase81-tactical-shape-50x20-world-00050` | first_division -> first_division | 83 | 41 | 33657400 | 41248872 | 43165595 | fee_below_valuation=16, player_unwilling=16, stale_ownership=7, player_not_for_sale=1 |
| `phase81-tactical-shape-50x20-world-00050` | first_division -> second_division | 55 | 16 | 17078500 | 24970296 | 26532740 | fee_below_valuation=19, player_unwilling=14, player_not_for_sale=1, stale_ownership=4 |
| `phase81-tactical-shape-50x20-world-00050` | second_division -> first_division | 19 | 14 | 21607800 | 37027980 | 33914671 | fee_below_valuation=4, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00050` | second_division -> second_division | 46 | 31 | 17739400 | 25739302.5 | 30549106 | stale_ownership=1, fee_below_valuation=6, player_unwilling=4 |
| `phase81-tactical-shape-50x20-world-00050` | second_division -> third_division | 44 | 22 | 6545000 | 8126491 | 8404739 | fee_below_valuation=17, player_unwilling=2, unaffordable=1, stale_ownership=1 |
| `phase81-tactical-shape-50x20-world-00050` | third_division -> first_division | 6 | 4 | 10885050 | 16010263.5 | 6876331 | stale_ownership=1, fee_below_valuation=1 |
| `phase81-tactical-shape-50x20-world-00050` | third_division -> second_division | 7 | 3 | 10962900 | 13045851 | 8965698 | fee_below_valuation=3 |
| `phase81-tactical-shape-50x20-world-00050` | third_division -> third_division | 58 | 32 | 6608100 | 8133610.5 | 7145550.5 | fee_below_valuation=15, player_unwilling=7, player_not_for_sale=1, stale_ownership=1 |

## Year-10 Exceptional Stock Locations

### phase81-tactical-shape-50x20-world-00001

- `player:ita-1-08-11|current=6|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-04|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=academy`
- `player:youth-intake-ita-1-18-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=academy`
- `player:youth-intake-ita-2-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=second_division|club=club:ita-2-07|slot=senior`

### phase81-tactical-shape-50x20-world-00002

- `player:ita-1-05-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-09|slot=academy`
- `player:youth-intake-ita-1-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=academy`
- `player:youth-intake-ita-3-11-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-11|slot=academy`
- `player:youth-ita-1-01-10|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`
- `player:youth-ita-1-03-06|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00003

- `player:ita-1-08-06|current=6|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:ita-1-08-10|current=6|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=academy`
- `player:youth-intake-ita-1-13-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-13|slot=academy`
- `player:youth-intake-ita-3-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=third_division|club=club:ita-3-10|slot=academy`
- `player:youth-ita-1-02-08|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-ita-1-04-09|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00004

- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-advance-season-2026-long-run-1-long-run-2-long-run-3-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=academy`
- `player:youth-intake-ita-1-12-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=academy`
- `player:youth-intake-ita-3-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-04|current=3|storedCeiling=6|division=third_division|club=club:ita-3-08|slot=academy`

### phase81-tactical-shape-50x20-world-00005

- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-04|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=academy`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=academy`
- `player:youth-intake-ita-2-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=second_division|club=club:ita-2-14|slot=academy`
- `player:youth-ita-1-02-11|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-ita-1-05-07|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=promotion_candidate`
- `player:youth-ita-1-06-09|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00006

- `player:ita-1-05-05|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:ita-1-08-10|current=6|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`
- `player:youth-intake-ita-1-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-05|current=3|storedCeiling=6|division=first_division|club=club:ita-1-09|slot=academy`
- `player:youth-intake-ita-3-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=third_division|club=club:ita-3-10|slot=senior`

### phase81-tactical-shape-50x20-world-00007

- `player:ita-1-06-02|current=6|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-11-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-11|slot=academy`
- `player:youth-intake-ita-1-13-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-13|slot=academy`
- `player:youth-intake-ita-2-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-04|current=3|storedCeiling=6|division=second_division|club=club:ita-2-04|slot=academy`
- `player:youth-ita-1-02-09|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-ita-1-05-09|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00008

- `player:ita-1-05-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=senior`
- `player:ita-1-06-09|current=6|storedCeiling=6|division=second_division|club=club:ita-2-13|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-05|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=promotion_candidate`
- `player:youth-intake-ita-3-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-07|slot=academy`

### phase81-tactical-shape-50x20-world-00009

- `player:ita-1-04-08|current=6|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=senior`
- `player:youth-intake-ita-1-18-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=senior`
- `player:youth-intake-ita-3-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=third_division|club=club:ita-3-17|slot=academy`
- `player:youth-ita-1-04-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00010

- `player:ita-1-04-07|current=6|storedCeiling=6|division=first_division|club=club:ita-1-11|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-advance-season-2026-long-run-1-long-run-2-long-run-3-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-17|slot=academy`
- `player:youth-intake-ita-2-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=second_division|club=club:ita-2-05|slot=academy`
- `player:youth-ita-1-03-04|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00011

- `player:ita-1-03-03|current=6|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=academy`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-1-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-04|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-17|slot=academy`
- `player:youth-intake-ita-3-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-07|slot=senior`
- `player:youth-ita-1-01-11|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00012

- `player:ita-1-05-11|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-12-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=academy`
- `player:youth-intake-ita-3-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=third_division|club=club:ita-3-03|slot=academy`
- `player:youth-ita-1-03-10|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00013

- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-12-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=academy`
- `player:youth-intake-ita-3-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=third_division|club=club:ita-3-07|slot=academy`

### phase81-tactical-shape-50x20-world-00014

- `player:ita-1-01-02|current=6|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=senior`
- `player:youth-intake-ita-1-01-2026-advance-season-2026-long-run-1-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-13-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-03|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-13|slot=senior`
- `player:youth-intake-ita-1-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-17|slot=academy`
- `player:youth-intake-ita-3-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=third_division|club=club:ita-3-08|slot=academy`

### phase81-tactical-shape-50x20-world-00015

- `player:ita-1-07-04|current=6|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-advance-season-2026-long-run-1-long-run-2-long-run-3-02|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=senior`
- `player:youth-intake-ita-3-13-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-04|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-13|slot=academy`
- `player:youth-ita-1-01-06|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00016

- `player:ita-1-02-08|current=6|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=senior`
- `player:ita-1-07-11|current=6|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-1-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=senior`
- `player:youth-intake-ita-2-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=second_division|club=club:ita-2-02|slot=academy`

### phase81-tactical-shape-50x20-world-00017

- `player:ita-1-01-05|current=6|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=senior`
- `player:youth-intake-ita-2-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-04|current=3|storedCeiling=6|division=second_division|club=club:ita-2-03|slot=academy`
- `player:youth-ita-1-05-11|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00018

- `player:ita-1-05-02|current=6|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-2-18-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3.5|storedCeiling=6|division=second_division|club=club:ita-2-18|slot=academy`
- `player:youth-ita-1-04-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00019

- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-18-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=academy`
- `player:youth-intake-ita-3-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-03|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-08|slot=academy`
- `player:youth-ita-1-07-07|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=senior`

### phase81-tactical-shape-50x20-world-00020

- `player:ita-1-05-06|current=6|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-08|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=senior`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-04|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=academy`
- `player:youth-intake-ita-1-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-17|slot=academy`
- `player:youth-intake-ita-2-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3|storedCeiling=6|division=second_division|club=club:ita-2-14|slot=senior`
- `player:youth-intake-ita-3-13-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-13|slot=academy`
- `player:youth-ita-1-04-06|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00021

- `player:ita-1-06-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-09|slot=senior`
- `player:ita-1-06-04|current=6|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-03|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-2-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-03|current=3|storedCeiling=6|division=second_division|club=club:ita-2-15|slot=senior`
- `player:youth-ita-1-01-10|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`
- `player:youth-ita-1-04-08|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00022

- `player:ita-1-03-06|current=6|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:ita-1-04-08|current=6|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=academy`
- `player:youth-intake-ita-1-13-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-05|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-13|slot=senior`
- `player:youth-intake-ita-3-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-04|slot=senior`
- `player:youth-ita-1-04-07|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00023

- `player:ita-1-02-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=senior`
- `player:ita-1-04-07|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-09|slot=senior`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=academy`
- `player:youth-intake-ita-1-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=academy`
- `player:youth-intake-ita-1-16-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=academy`
- `player:youth-intake-ita-2-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=second_division|club=club:ita-2-05|slot=senior`

### phase81-tactical-shape-50x20-world-00024

- `player:ita-1-07-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`
- `player:youth-intake-ita-1-16-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=academy`
- `player:youth-intake-ita-1-18-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=academy`
- `player:youth-intake-ita-2-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=second_division|club=club:ita-2-14|slot=academy`
- `player:youth-ita-1-02-08|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`

### phase81-tactical-shape-50x20-world-00025

- `player:ita-1-04-10|current=6|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=academy`
- `player:youth-intake-ita-2-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=2.5|storedCeiling=6|division=second_division|club=club:ita-2-03|slot=academy`
- `player:youth-intake-ita-2-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`

### phase81-tactical-shape-50x20-world-00026

- `player:ita-1-03-10|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:ita-1-05-11|current=6|storedCeiling=6|division=first_division|club=club:ita-1-09|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-advance-season-2026-long-run-1-long-run-2-long-run-3-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=senior`
- `player:youth-intake-ita-1-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-09|slot=academy`
- `player:youth-intake-ita-1-16-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=academy`
- `player:youth-intake-ita-2-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=second_division|club=club:ita-2-10|slot=academy`

### phase81-tactical-shape-50x20-world-00027

- `player:ita-1-04-05|current=6|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-05|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-18-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=academy`
- `player:youth-intake-ita-2-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=3|storedCeiling=6|division=second_division|club=club:ita-2-09|slot=academy`
- `player:youth-ita-1-03-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00028

- `player:ita-1-05-10|current=6|storedCeiling=6|division=first_division|club=club:ita-1-11|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=academy`
- `player:youth-intake-ita-1-16-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=academy`
- `player:youth-intake-ita-3-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=3|storedCeiling=6|division=third_division|club=club:ita-3-14|slot=academy`
- `player:youth-ita-1-04-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00029

- `player:ita-1-05-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-advance-season-2026-long-run-1-long-run-2-long-run-3-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-04|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=senior`
- `player:youth-intake-ita-2-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-04|current=3|storedCeiling=6|division=second_division|club=club:ita-2-17|slot=academy`

### phase81-tactical-shape-50x20-world-00030

- `player:ita-1-08-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=senior`
- `player:ita-1-08-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=senior`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=senior`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-13-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-13|slot=academy`
- `player:youth-intake-ita-1-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-17|slot=senior`
- `player:youth-intake-ita-3-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=third_division|club=club:ita-3-17|slot=academy`
- `player:youth-ita-1-05-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00031

- `player:ita-1-06-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-17|slot=senior`
- `player:ita-1-07-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=senior`
- `player:youth-intake-ita-1-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-09|slot=academy`
- `player:youth-intake-ita-2-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-03|current=3|storedCeiling=6|division=second_division|club=club:ita-2-01|slot=senior`
- `player:youth-ita-1-03-09|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00032

- `player:ita-1-02-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=senior`
- `player:youth-intake-ita-1-16-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=academy`
- `player:youth-intake-ita-2-12-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=3|storedCeiling=6|division=second_division|club=club:ita-2-12|slot=academy`

### phase81-tactical-shape-50x20-world-00033

- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-12-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=academy`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=academy`
- `player:youth-ita-1-03-10|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00034

- `player:ita-1-01-02|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-17|slot=senior`
- `player:youth-intake-ita-3-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=2|storedCeiling=6|division=third_division|club=club:ita-3-04|slot=academy`
- `player:youth-ita-1-05-05|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`

### phase81-tactical-shape-50x20-world-00035

- `player:ita-1-06-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=senior`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-05|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=senior`
- `player:youth-intake-ita-1-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-09|slot=academy`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-3-18-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=3|storedCeiling=6|division=third_division|club=club:ita-3-18|slot=senior`
- `player:youth-ita-1-03-10|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00036

- `player:ita-1-04-08|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-03|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=academy`
- `player:youth-intake-ita-3-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=2|storedCeiling=6|division=third_division|club=club:ita-3-01|slot=promotion_candidate`
- `player:youth-intake-ita-3-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-01|slot=academy`
- `player:youth-ita-1-03-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00037

- `player:ita-1-04-06|current=6|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=senior`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=senior`
- `player:youth-intake-ita-2-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=3|storedCeiling=6|division=second_division|club=club:ita-2-02|slot=academy`

### phase81-tactical-shape-50x20-world-00038

- `player:ita-1-04-04|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=senior`
- `player:youth-ita-1-03-08|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00039

- `player:ita-1-03-06|current=6|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=senior`
- `player:ita-1-06-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-03|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-08-2026-long-run-1-advance-season-2026-long-run-1-long-run-2-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=promotion_candidate`
- `player:youth-intake-ita-1-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=academy`
- `player:youth-intake-ita-3-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=3|storedCeiling=6|division=third_division|club=club:ita-3-02|slot=academy`

### phase81-tactical-shape-50x20-world-00040

- `player:ita-1-01-05|current=6|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:ita-1-04-03|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-18-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=academy`
- `player:youth-intake-ita-3-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-14|slot=academy`

### phase81-tactical-shape-50x20-world-00041

- `player:ita-1-05-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-advance-season-2026-long-run-1-long-run-2-long-run-3-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=promotion_candidate`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-2-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=second_division|club=club:ita-2-08|slot=senior`
- `player:youth-ita-1-01-04|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00042

- `player:ita-1-02-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=senior`
- `player:ita-1-06-07|current=6|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=senior`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=promotion_candidate`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-02|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-12-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:youth-intake-ita-3-17-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=2.5|storedCeiling=6|division=third_division|club=club:ita-3-17|slot=academy`
- `player:youth-ita-1-01-08|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`
- `player:youth-ita-1-02-06|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00043

- `player:ita-1-02-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=senior`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=senior`
- `player:youth-intake-ita-1-12-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:youth-intake-ita-1-13-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-13|slot=academy`
- `player:youth-intake-ita-1-16-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-16|slot=academy`
- `player:youth-intake-ita-2-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=second_division|club=club:ita-2-15|slot=academy`
- `player:youth-ita-1-01-10|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`
- `player:youth-ita-1-07-07|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00044

- `player:ita-1-05-04|current=6|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=academy`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-03|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=senior`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-2-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=3|storedCeiling=6|division=second_division|club=club:ita-2-09|slot=academy`

### phase81-tactical-shape-50x20-world-00045

- `player:ita-1-02-02|current=6|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:ita-1-05-01|current=6|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-advance-season-2026-long-run-1-long-run-2-long-run-3-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-04|current=3|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=academy`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-2-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=2.5|storedCeiling=6|division=second_division|club=club:ita-2-15|slot=academy`
- `player:youth-ita-1-02-08|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-ita-1-05-09|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00046

- `player:ita-1-04-11|current=6|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=senior`
- `player:ita-1-06-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-18|slot=senior`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=academy`
- `player:youth-intake-ita-1-05-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-05|slot=academy`
- `player:youth-intake-ita-1-08-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-08|slot=academy`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-3-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3|storedCeiling=6|division=third_division|club=club:ita-3-09|slot=senior`
- `player:youth-ita-1-02-10|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-ita-3-15-03|current=3|storedCeiling=6|division=third_division|club=club:ita-3-15|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00047

- `player:ita-1-03-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=senior`
- `player:ita-1-07-04|current=6|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:youth-intake-ita-1-01-2026-advance-season-2026-long-run-1-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=promotion_candidate`
- `player:youth-intake-ita-1-01-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-01|slot=academy`
- `player:youth-intake-ita-1-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=academy`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-3-09-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-02|current=3|storedCeiling=6|division=third_division|club=club:ita-3-09|slot=senior`
- `player:youth-ita-1-03-06|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00048

- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`
- `player:youth-intake-ita-1-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-04|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=promotion_candidate`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=promotion_candidate`
- `player:youth-intake-ita-1-12-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-05|current=3|storedCeiling=6|division=first_division|club=club:ita-1-12|slot=academy`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=academy`
- `player:youth-intake-ita-2-03-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-01|current=3|storedCeiling=6|division=second_division|club=club:ita-2-03|slot=senior`

### phase81-tactical-shape-50x20-world-00049

- `player:ita-1-04-09|current=6|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-07-2026-long-run-1-long-run-2-long-run-3-long-run-4-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-07|slot=senior`
- `player:youth-intake-ita-1-10-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-10|slot=academy`
- `player:youth-intake-ita-1-11-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-03|current=3|storedCeiling=6|division=first_division|club=club:ita-1-11|slot=academy`
- `player:youth-intake-ita-2-06-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=2.5|storedCeiling=6|division=second_division|club=club:ita-2-06|slot=academy`
- `player:youth-ita-1-02-05|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=promotion_candidate`
- `player:youth-ita-1-03-09|current=3.5|storedCeiling=6|division=first_division|club=club:ita-1-03|slot=promotion_candidate`

### phase81-tactical-shape-50x20-world-00050

- `player:ita-1-02-04|current=6|storedCeiling=6|division=first_division|club=club:ita-1-06|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-02|slot=academy`
- `player:youth-intake-ita-1-04-2026-long-run-1-long-run-2-long-run-3-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-02|current=3|storedCeiling=6|division=first_division|club=club:ita-1-04|slot=promotion_candidate`
- `player:youth-intake-ita-1-11-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-01|current=3|storedCeiling=6|division=first_division|club=club:ita-1-11|slot=senior`
- `player:youth-intake-ita-1-14-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-01|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-14|slot=academy`
- `player:youth-intake-ita-1-15-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-03|current=2.5|storedCeiling=6|division=first_division|club=club:ita-1-15|slot=academy`
- `player:youth-intake-ita-2-11-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-advance-season-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-long-run-10-03|current=3|storedCeiling=6|division=second_division|club=club:ita-2-11|slot=academy`

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase81-tactical-shape-50x20-world-00006` | FAIL | 18 | 11 | senior 1197..1351; youth 594..594; total 1791..1945 | 0 | 0 | 0 | structural 2; cash 755027569; wage 1.0000; free agents 0.2407; values 932200..13684000000; renew/release/expiry 10992/965/2519 | 12 | avg 39.45; min 26; max 55; low season 17; champion pts 61..74; last pts 14..37; ability spread 6.45->2.79; draw rate avg/max 0.260/0.300 | season 10; U.S. Cagliari; Mateo Vargas; assists 9; team goals 40; top1 0.23; top3 0.42; top assist Nico Benedetti; top scorer Yaya Camara:19 | senior_active_player_population, youth_active_player_population, total_active_player_population | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00021` | FAIL | 18 | 11 | senior 1196..1349; youth 594..594; total 1790..1943 | 0 | 0 | 0 | structural 1; cash 730883434; wage 1.0000; free agents 0.2605; values 932400..12298000000; renew/release/expiry 10871/970/2554 | 10 | avg 37.95; min 26; max 47; low season 15; champion pts 60..73; last pts 17..36; ability spread 6.58->3.11; draw rate avg/max 0.270/0.320 | season 9; F.C. Turin; Joris Jansen; assists 9; team goals 41; top1 0.22; top3 0.41; top assist Niklas Keller; top scorer Luca Morelli:20 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00015` | FAIL | 19 | 11 | senior 1198..1357; youth 594..594; total 1792..1951 | 0 | 0 | 0 | structural 1; cash 717740157; wage 1.0000; free agents 0.2587; values 797500..12298000000; renew/release/expiry 11069/999/2516 | 11 | avg 39.60; min 32; max 50; low season 13; champion pts 62..72; last pts 16..32; ability spread 6.06->3.11; draw rate avg/max 0.260/0.300 | season 12; S.S. Trento; Sota Tanaka; assists 9; team goals 43; top1 0.21; top3 0.40; top assist Giorgio Martini; top scorer Dario Petrovic:17 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00024` | FAIL | 18 | 11 | senior 1196..1347; youth 594..594; total 1790..1941 | 0 | 0 | 0 | structural 1; cash 809425612; wage 1.0000; free agents 0.2580; values 803800..11374000000; renew/release/expiry 10967/960/2527 | 11 | avg 41.95; min 25; max 60; low season 15; champion pts 57..80; last pts 17..34; ability spread 5.94->2.62; draw rate avg/max 0.260/0.310 | season 7; Parma Calcio; Matteo Basiletti; assists 10; team goals 45; top1 0.22; top3 0.40; top assist Nikola Lukic; top scorer Caio Almeida:22 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00040` | FAIL | 18 | 11 | senior 1198..1346; youth 594..594; total 1792..1940 | 0 | 0 | 0 | structural 1; cash 775549228; wage 1.0000; free agents 0.2574; values 843500..12298000000; renew/release/expiry 11032/1002/2494 | 12 | avg 40.95; min 22; max 57; low season 16; champion pts 56..79; last pts 12..34; ability spread 6.93->2.77; draw rate avg/max 0.270/0.310 | season 7; U.S. Ravenna; Davide Pavan; assists 10; team goals 41; top1 0.24; top3 0.46; top assist Davide Pavan; top scorer Luka Pavlovic:21 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00049` | FAIL | 18 | 11 | senior 1197..1330; youth 594..594; total 1791..1924 | 0 | 0 | 0 | structural 1; cash 805017542; wage 1.0000; free agents 0.2565; values 1167000..15000000000; renew/release/expiry 10929/976/2516 | 11 | avg 37.30; min 23; max 50; low season 14; champion pts 57..73; last pts 19..34; ability spread 6.28->2.99; draw rate avg/max 0.280/0.350 | season 12; Pro Pescara; Luca Abate; assists 9; team goals 42; top1 0.21; top3 0.40; top assist Luca Abate; top scorer Giorgio Romano:16 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00048` | FAIL | 19 | 11 | senior 1200..1351; youth 594..594; total 1794..1945 | 0 | 0 | 0 | structural 1; cash 813760487; wage 1.0000; free agents 0.2548; values 926600..13684000000; renew/release/expiry 10980/974/2527 | 11 | avg 39.05; min 27; max 55; low season 1; champion pts 59..76; last pts 18..36; ability spread 6.53->2.55; draw rate avg/max 0.260/0.300 | season 12; F.C. Taranto; Luca Gandolfi; assists 10; team goals 40; top1 0.25; top3 0.40; top assist Luca Gandolfi; top scorer Emilio Mendoza:18 | champion_streak, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00016` | FAIL | 18 | 11 | senior 1192..1351; youth 594..594; total 1786..1945 | 0 | 0 | 0 | structural 1; cash 754043100; wage 1.0000; free agents 0.2525; values 989500..13684000000; renew/release/expiry 10921/952/2543 | 14 | avg 40.00; min 25; max 59; low season 20; champion pts 59..78; last pts 19..34; ability spread 5.96->2.56; draw rate avg/max 0.270/0.300 | season 7; A.S. Modena; Luca Santoro; assists 10; team goals 44; top1 0.23; top3 0.41; top assist Luca Santoro; top scorer Nolan Rousseau:21 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00007` | FAIL | 18 | 11 | senior 1195..1340; youth 594..594; total 1789..1934 | 0 | 0 | 0 | structural 1; cash 744143107; wage 1.0000; free agents 0.2523; values 976200..12298000000; renew/release/expiry 11081/992/2537 | 12 | avg 38.10; min 22; max 57; low season 2; champion pts 56..77; last pts 20..36; ability spread 6.05->3.06; draw rate avg/max 0.270/0.330 | season 18; A.S. Genoa; Enrico Piras; assists 11; team goals 41; top1 0.27; top3 0.54; top assist Enrico Piras; top scorer Sekou Sarr:15 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |
| `phase81-tactical-shape-50x20-world-00001` | FAIL | 19 | 11 | senior 1196..1354; youth 594..594; total 1790..1948 | 0 | 0 | 0 | structural 1; cash 808517913; wage 1.0000; free agents 0.2509; values 1134400..13684000000; renew/release/expiry 11096/979/2474 | 12 | avg 35.50; min 28; max 44; low season 8; champion pts 58..72; last pts 21..34; ability spread 6.44->2.48; draw rate avg/max 0.270/0.310 | season 15; Arezzo Calcio; Lukas Vogel; assists 11; team goals 46; top1 0.24; top3 0.48; top assist Lukas Vogel; top scorer Nico Mantovani:17 | table_points_spread_avg, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share | contract_finance_structural_integrity, preliminary_agreement_integrity, player_economy_young_stored_ceiling_six_stock_arrival_category_placement |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase81-tactical-shape-50x20-world-00035` | 15 | season 13; S.S. Parma; Giorgio Magnani; assists 12; team goals 42; top1 0.29; top3 0.50; top assist Giorgio Magnani; top scorer Niklas Hartmann:15 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00039` | 15 | season 13; A.C. Siena; Luca Bianchi; assists 15; team goals 58; top1 0.26; top3 0.45; top assist Luca Bianchi; top scorer Joao Ferreira:17 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00004` | 15 | season 12; S.S. Perugia; Sergio Molina; assists 15; team goals 68; top1 0.22; top3 0.43; top assist Sergio Molina; top scorer Enrico Dalla Costa:17 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00014` | 15 | season 6; Trieste Calcio; Davide Raimondi; assists 9; team goals 44; top1 0.20; top3 0.41; top assist Giorgio Sorrentino; top scorer Nico Bortolotti:19 | senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00041` | 14 | season 11; A.S. Cagliari; Giorgio Lorenzini; assists 14; team goals 56; top1 0.25; top3 0.46; top assist Giorgio Lorenzini; top scorer Davide Silvestri:19 | champion_streak, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00044` | 14 | season 19; A.C. Parma; Haruto Kobayashi; assists 11; team goals 45; top1 0.24; top3 0.42; top assist Haruto Kobayashi; top scorer Nico Ceccarelli:18 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00003` | 14 | season 18; U.S. Lecco; Davide Fontana; assists 13; team goals 54; top1 0.24; top3 0.43; top assist Davide Fontana; top scorer Davide Gandolfi:15 | senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00012` | 14 | season 16; Real Cesena; Caio Moraes; assists 12; team goals 52; top1 0.23; top3 0.42; top assist Caio Moraes; top scorer Mert Aydin:23 | senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00016` | 14 | season 7; A.S. Modena; Luca Santoro; assists 10; team goals 44; top1 0.23; top3 0.41; top assist Luca Santoro; top scorer Nolan Rousseau:21 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00038` | 13 | season 10; F.C. Foggia; Giorgio Zambelli; assists 13; team goals 49; top1 0.27; top3 0.45; top assist Giorgio Zambelli; top scorer Matteo Rossetti:18 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase81-tactical-shape-50x20-world-00048` | 6 | Pro Palermo | 64..76 | 42.17 | 8 | transfer=2100; squad=6535 | champion_streak, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00008` | 4 | Salerno Calcio | 60..76 | 45.25 | 10 | transfer=2206; squad=6591 | champion_streak, senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00009` | 4 | Trento Calcio | 64..73 | 42.25 | 11 | transfer=2058; squad=6452 | champion_streak, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00041` | 4 | Virtus Pescara | 64..73 | 39.25 | 10 | transfer=2253; squad=6705 | champion_streak, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00013` | 4 | A.C. Padova | 62..74 | 37.00 | 9 | transfer=2110; squad=6522 | champion_streak, senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00050` | 4 | U.S. Genoa | 61..69 | 36.00 | 10 | transfer=2218; squad=6631 | champion_streak, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00046` | 3 | S.S. Cesena | 66..69 | 46.00 | 8 | transfer=2132; squad=6515 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00019` | 3 | S.S. Trieste | 69..81 | 45.00 | 8 | transfer=2136; squad=6545 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00045` | 3 | Pro Cesena | 66..75 | 44.67 | 9 | transfer=2091; squad=6439 | senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00049` | 3 | A.S. Parma | 67..69 | 44.67 | 8 | transfer=2068; squad=6461 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase81-tactical-shape-50x20-world-00017` | 34.70 | 24..47 | 57..73 | 24..34 | avg 0.270 max 0.320 | 6.24->2.86 | table_points_spread_avg, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00020` | 35.45 | 22..53 | 58..74 | 21..37 | avg 0.270 max 0.320 | 5.80->2.59 | table_points_spread_avg, senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00001` | 35.50 | 28..44 | 58..72 | 21..34 | avg 0.270 max 0.310 | 6.44->2.48 | table_points_spread_avg, senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00023` | 36.05 | 28..48 | 58..73 | 23..35 | avg 0.270 max 0.330 | 6.74->2.85 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00044` | 36.40 | 26..52 | 54..78 | 14..34 | avg 0.280 max 0.310 | 6.22->2.97 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00029` | 36.55 | 23..46 | 57..76 | 24..34 | avg 0.260 max 0.320 | 6.65->2.86 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00003` | 36.70 | 25..46 | 56..72 | 21..37 | avg 0.270 max 0.340 | 6.99->2.71 | senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00036` | 36.75 | 21..56 | 57..79 | 17..36 | avg 0.280 max 0.320 | 6.23->2.69 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |
| `phase81-tactical-shape-50x20-world-00012` | 36.95 | 23..55 | 56..84 | 18..35 | avg 0.260 max 0.310 | 6.03->2.61 | senior_active_player_population, youth_active_player_population, total_active_player_population |
| `phase81-tactical-shape-50x20-world-00043` | 37.00 | 26..48 | 59..76 | 19..35 | avg 0.280 max 0.340 | 6.27->2.52 | senior_active_player_population, youth_active_player_population, total_active_player_population, free_agent_population_share |

## Market And Economy Diagnostic Worlds

### Zero Permanent Completions Despite Recruitment Needs

| Seed | Needs | Recruitable | Targets | Offers | Completed | Lost reasons |
|---|---:|---:|---:|---:|---:|---|

### Highest Useful Free-Agent Stock

| Seed | Useful stock max | Free-agent share max |
|---|---:|---:|
| `phase81-tactical-shape-50x20-world-00027` | 21 | 0.2510 |
| `phase81-tactical-shape-50x20-world-00035` | 20 | 0.2610 |
| `phase81-tactical-shape-50x20-world-00015` | 19 | 0.2587 |
| `phase81-tactical-shape-50x20-world-00025` | 19 | 0.2546 |
| `phase81-tactical-shape-50x20-world-00047` | 18 | 0.2515 |
| `phase81-tactical-shape-50x20-world-00011` | 17 | 0.2612 |
| `phase81-tactical-shape-50x20-world-00024` | 17 | 0.2580 |
| `phase81-tactical-shape-50x20-world-00004` | 17 | 0.2578 |
| `phase81-tactical-shape-50x20-world-00039` | 17 | 0.2545 |
| `phase81-tactical-shape-50x20-world-00036` | 17 | 0.2536 |

### Broadest Wage Pressure

| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |
|---|---:|---:|---:|---:|
| `phase81-tactical-shape-50x20-world-00011` | 0.1778 | 0.0278 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00008` | 0.1713 | 0.0167 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00039` | 0.1694 | 0.0120 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00026` | 0.1685 | 0.0213 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00024` | 0.1657 | 0.0185 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00032` | 0.1639 | 0.0222 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00035` | 0.1639 | 0.0185 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00029` | 0.1620 | 0.0139 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00034` | 0.1602 | 0.0157 | 0.0000 | 1.0000 |
| `phase81-tactical-shape-50x20-world-00007` | 0.1602 | 0.0148 | 0.0000 | 1.0000 |

## Reproduction

Run the same gate with:

```bash
nvm use 24
pnpm cli ten-season-report --seed-prefix=phase81-tactical-shape-50x20 --worlds=50 --seasons=20 --checkpoint-dir=<checkpoint-directory> --shards=50 --workers=7 --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
```

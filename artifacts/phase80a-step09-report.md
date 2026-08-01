# Phase 80A Prospect And Player-Economy Bounded Gates Report

Date: 2026-08-01
Seed prefix: `phase80a-prechange-baseline`
Worlds: 20
Seasons per world: 2
Total seasons: 40
Execution: sharded; workers=7; shards=20; resumed=0; partition_hashes=a2147729d981e70c,2b2ae1cac8c0dc3c,bba91db28048f1de,cf698e6e0a411520,4fe6b2ab8ddc56e3,4dd4ac22afa534e3,29d8d2ce58b968bd,6c14f1115bcb98b5,f41f324f6e135f3f,250c8585791ad6dd,5d04cc8c8b1b2772,4c7e3f4b5470ded4,b2f4dcf4a35e8954,943de788f0253a62,0a13d0d3d63929bc,ff3d11d4c587c240,65a3c70a704aeca3,dab476279637d117,e3a4f432c6f73b6a,1ec355014d32fe94
Status: FAIL

## Aggregate Metrics

- Failed worlds: 3
- Warning worlds: 17
- Player-economy gate violations: 0
- Closing division-value fit: FAIL
- Closing checkpoint season start year: 2028
- Closing division-value observations: 25762
- Closing division-value violations: 1
- Year-10 rating-stock observations: 0/20
- Year-10 current-six maximum observed: n/a
- Year-10 stored-ceiling-six maximum observed: n/a
- Year-10 lower-tier stored-ceiling-six maximum observed: n/a
- Goals per match average: 2.920
- Goals per match p95: 3.040
- Table spread average: 34.85
- Table spread minimum world average: 27.50
- Draw rate average: 0.240
- Draw rate maximum world average: 0.270
- Champion streak max observed: 2
- Top assist max p95: 12
- Production warning max: assists=13 top1=0.24 top3=0.49
- Age 30+ share p95: 0.16
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 1791
- Role coverage warnings p95: 94
- Youth roster max observed: 11
- Active player count min/max: senior=1217..1302 youth=594..594 total=1811..1896
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 722000000
- Maximum annual wage utilization: 1.0000
- Annual wage utilization distribution: p50=0.8800; p90=0.9800; p95=1.0000; p99=1.0000; pressure share=0.3300; exact ceiling share=0.0100; above budget share=0.0000; reallocation exact ceiling count=1
- Annual wage headroom (minor): p10=7010000; p50=192980000
- Maximum free-agent share: 0.0397
- Maximum useful free-agent stock: 0
- Free-agent closing-stock band observations: age under23/23-29/30-34/35+=1595/0/3/0; ability <8/8-9/10-11/12+=897/700/0/1; unattached <1/1-2/3+ seasons=1257/341/0
- Permanent-transfer funnel: needs=403556; recruitable=307521; targets=9984; unavailable=393572; offers=9984; seller rejected/countered/accepted/expired/withdrawn=6739/2708/2860/353/36; player started/countered/rejected/counter-accepted=2856/0/1063/0; unaffordable=36; completed=1499; lost reasons=active_talk_limit_reached=768, club_already_handled=10626, club_cannot_recruit=84641, counter_exceeds_capacity=36, implausible_downward_move=427, permanent_start_limit_reached=88996, seller_department_floor=18963, transfer_terms_unaffordable=5590, transfer_window_closed=183561
- Preliminary-agreement funnel: candidates=1982; unavailable=215453; offers=1982; rejected/countered/counter-accepted/counter-rejected=545/0/0/0; agreements=463; expired=918; activations=20; activation failures=6; lost reasons=active_talk_limit_reached=13051, club_terms_unaffordable=66, contract_overlap=5, current_contract_expired=7, negotiation_deadline=911, player_unwilling=479, preliminary_start_limit_reached=394, preliminary_target_unavailable=202008, unaffordable=1
- Permanent-transfer public values: count=1499; p50=115450800; p90=1357472200; p99=2612040700; max=3378244000
- Permanent-transfer asking prices: count=1499; p50=133858688; p90=1636488450; p99=3371285640; max=4729541600
- Permanent-transfer completed fees: count=1499; p50=123779445; p90=1520602355; p99=3092771918; max=4138348900
- Free-agent public values: count=688; p50=10010400; p90=12947400; p99=14726400; max=18279100
- Free-agent non-zero completed fees: 0
- Sampled player value min/max (minor): 3355700..15000000000
- Contract lifecycle: renewals=5447; releases=16; expiries=24; selected expiry decisions=3
- Warning check counts: role_coverage_warning_count=20, senior_active_player_population=20, total_active_player_population=20, wage_budget_pressure_prevalence=20, youth_active_player_population=20, table_points_spread_avg=10, goals_per_match_avg=3
- Signal check counts: monitor=103, story=10
- Failing check counts: table_points_spread_avg=3
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Player Economy Non-Vacuous Gates

| Gate | Observations | Violations | Failed worlds | Not evaluated worlds | Cohort proof | Threshold |
|---|---:|---:|---:|---:|---|---|
| `age_seventeen_senior_public_upside_observations` | 1556 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | descriptive age-17 senior public-upside share; positive denominator required, no frozen quota |
| `ai_information_parity_offer_selection` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `ai_information_parity_target_ranking` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `ai_information_parity_willingness` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | different stored ceilings with identical public assessments produce identical live AI decisions |
| `annual_exceptional_intake` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated -> generated -> accepted; active-stock bounds and replacement are checked from complete snapshots |
| `free_agent_zero_fee_and_value` | 688 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every completed canonical free-agent movement has positive public value and exact zero transfer fee; value invariance is owned by intrinsic_public_value_invariance_free_agent |
| `hard_cap_eligibility_and_display` | 8 | 0 | 0 | 12 | matching=3 share_bps=3750 cohort_evidence=n/a cohort_minimum=n/a | positive cohort eligible population; zero ineligible exact/display collisions; eligible exact cap share <10000 basis points |
| `initial_established_current_six_stock` | 50 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening champions are current six, age >20, senior first-team players at strong First Division clubs |
| `initial_exceptional_allocation` | 35640 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | established current-six 2..3; young stored-ceiling-six 4..5; lower-tier young stored-ceiling-six <=1; allocated/effective identity |
| `initial_young_stored_ceiling_six_stock` | 88 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | allocated opening prospects are age 15..20, have stored ceiling six, and remain inside the content-supplied age/division current-rating guardrail |
| `intrinsic_public_value_invariance_contract_expiry` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_free_agent` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_owner_category` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_promotion_relegation` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `intrinsic_public_value_invariance_transfer` | 20 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | same canonical player assessment and intrinsic facts produce identical public value |
| `negotiation_counter_path` | 2708 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required counter observations and at least one completed-after-counter path |
| `negotiation_offer_spread` | 9984 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required offers; not structural 100% asking/offer equality |
| `negotiation_seller_outcomes` | 9984 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required accepted, rejected, and countered observations |
| `public_potential_range_ordering` | 75210 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | current <= P50 <= public upper <= stored ceiling |
| `stored_ceiling_six_joint_profile` | 288 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | every stored-ceiling-six observation has positive public value; asking is measured separately |
| `stored_ceiling_six_prospect_value_observations` | 188 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | required positive-valued stored-ceiling-six prospect population |
| `young_stored_ceiling_prospect_share_first_division` | 4111 | 0 | 0 | 0 | matching=856 share_bps=2082 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 1500..2500 basis points |
| `young_stored_ceiling_prospect_share_second_division` | 3686 | 0 | 0 | 0 | matching=532 share_bps=1443 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 800..1500 basis points |
| `young_stored_ceiling_prospect_share_third_division` | 3236 | 0 | 0 | 0 | matching=212 share_bps=655 cohort_evidence=n/a cohort_minimum=n/a | active senior age 15..20 with stored ceiling >=3.5: 400..800 basis points |
| `young_stored_ceiling_six_active_stock` | 60 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | complete world-season snapshots; stored ceiling count equals each snapshot's deterministic target (4 or 5) |
| `young_stored_ceiling_six_no_inflation` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | adjacent-season arrivals never raise active stock above the closing snapshot's deterministic target |
| `young_stored_ceiling_six_stock_arrival_category_placement` | 100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals; outside First Division <=1; every introduced First Division placement is title_contender or playoff_contender |
| `young_stored_ceiling_six_stock_arrival_club_uniqueness` | 100 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=n/a cohort_minimum=n/a | opening allocation and new stock arrivals introduce <=1 associated player per club; later market concentration remains descriptive |
| `young_stored_ceiling_six_vacancy_replacement` | 40 | 0 | 0 | 0 | matching=n/a share_bps=n/a cohort_evidence=12 cohort_minimum=1 | adjacent-season vacancies are replenished to the closing snapshot's deterministic target |

## Closing Checkpoint Division Public Values

This cohort is the active senior stock at the explicitly named closing season checkpoint; it is not a year-ten proxy.

| Division | Observations | Median | P90 | P99 | Maximum | Fit |
|---|---:|---:|---:|---:|---:|---|
| first_division | 9291 | 283767600 | 1979495200 | 4814653110 | 13684000000 | fail |
| second_division | 8403 | 49670300 | 226413240 | 462788362 | 1170005400 | pass |
| third_division | 8068 | 11725050 | 43333550 | 92212080 | 316549800 | pass |

## Phase 79C Version And Replay Evidence

Exact calibration bundles:

- `{"topologyDecisionId":"fictional-three-tier-v1","playerRatingScaleVersion":"player-rating-scale-v6","playerMarketCalibrationVersion":"player-market-calibration-transfermarkt-it-2026-07-28-v2","valuationCurvesVersion":"valuation-curves-v4","askingPriceCurvesVersion":"asking-price-curves-v3","marketBehaviorCalibrationVersion":"market-behavior-calibration-v4","wageFinanceCalibrationVersion":"wage-finance-calibration-reportcalcio-2025-v1","playerDevelopmentEnvironmentVersion":"player-development-environment-v1"}`

| Seed | Initial composition hash |
|---|---|
| `phase80a-prechange-baseline-world-00001` | `ca00b3a90d5edc53` |
| `phase80a-prechange-baseline-world-00002` | `df3ba7cf10d066db` |
| `phase80a-prechange-baseline-world-00003` | `cfab1536a4cee989` |
| `phase80a-prechange-baseline-world-00004` | `966ea3757a7a7948` |
| `phase80a-prechange-baseline-world-00005` | `65ea9cdbe6912cb0` |
| `phase80a-prechange-baseline-world-00006` | `61f6d48bfaf1e999` |
| `phase80a-prechange-baseline-world-00007` | `73e0a8bf466702e2` |
| `phase80a-prechange-baseline-world-00008` | `347e6d96744f416b` |
| `phase80a-prechange-baseline-world-00009` | `af2e98f009ac01bc` |
| `phase80a-prechange-baseline-world-00010` | `60765570833168e7` |
| `phase80a-prechange-baseline-world-00011` | `ec587202037ccaee` |
| `phase80a-prechange-baseline-world-00012` | `6bc5678311e57f9b` |
| `phase80a-prechange-baseline-world-00013` | `0ae5aeceb242aa3d` |
| `phase80a-prechange-baseline-world-00014` | `31d254520407acfc` |
| `phase80a-prechange-baseline-world-00015` | `ac0c72cec44cc41e` |
| `phase80a-prechange-baseline-world-00016` | `27d715b9b21cbdc6` |
| `phase80a-prechange-baseline-world-00017` | `6b365f7c74d2946c` |
| `phase80a-prechange-baseline-world-00018` | `0708187dad4af527` |
| `phase80a-prechange-baseline-world-00019` | `bda40ee3c5e334a2` |
| `phase80a-prechange-baseline-world-00020` | `e0c5664586b786ae` |

## Phase 79C Closing Division Economy

### Wage Economy

| Seed | Division | Clubs | Players | Wage P50/P90/P99 | Committed P50/P90/P99 | Utilization P50/P90/P99 | Headroom P10/P50 |
|---|---|---:|---:|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | first_division | 18 | 460 | 172675000/824803000/1787889200 | 7431720000/13268922000/13922744900 | 0.8624/0.9730/0.9945 | 229213000/1112070000 |
| `phase80a-prechange-baseline-world-00001` | second_division | 18 | 418 | 51825000/142796000/222908900 | 1373835000/2204353000/2474492400 | 0.8424/0.9691/0.9898 | 68385000/252450000 |
| `phase80a-prechange-baseline-world-00001` | third_division | 18 | 405 | 11690000/27700000/39118000 | 316540000/442293000/448783000 | 0.9783/0.9932/0.9995 | 2676000/7690000 |
| `phase80a-prechange-baseline-world-00002` | first_division | 18 | 472 | 162020000/795603000/1652011600 | 7900790000/13066376000/13846014900 | 0.8574/0.9795/0.9890 | 219953000/1286165000 |
| `phase80a-prechange-baseline-world-00002` | second_division | 18 | 423 | 54140000/132240000/245945000 | 1427065000/2370909000/2471003800 | 0.8743/0.9823/0.9898 | 28536000/169235000 |
| `phase80a-prechange-baseline-world-00002` | third_division | 18 | 403 | 11440000/27696000/38055200 | 289680000/442434000/447723600 | 0.9728/0.9991/1.0000 | 287000/8300000 |
| `phase80a-prechange-baseline-world-00003` | first_division | 18 | 469 | 163080000/833182000/2279600000 | 7572920000/13504109000/13930541900 | 0.9160/0.9911/0.9976 | 97246000/805755000 |
| `phase80a-prechange-baseline-world-00003` | second_division | 18 | 424 | 54640000/137328000/245045200 | 1394010000/2460856000/2495808800 | 0.8715/0.9980/0.9984 | 4915000/128500000 |
| `phase80a-prechange-baseline-world-00003` | third_division | 18 | 398 | 12250000/28006000/38162300 | 281330000/445249000/450424700 | 0.9645/0.9960/0.9996 | 1598000/7960000 |
| `phase80a-prechange-baseline-world-00004` | first_division | 18 | 463 | 164120000/881672000/2099908400 | 7556500000/13523119000/13936630700 | 0.8447/0.9810/0.9956 | 255167000/1242240000 |
| `phase80a-prechange-baseline-world-00004` | second_division | 18 | 414 | 55340000/145364000/229058600 | 1264525000/2308153000/2454828000 | 0.8549/0.9811/0.9903 | 35746000/220440000 |
| `phase80a-prechange-baseline-world-00004` | third_division | 18 | 401 | 11450000/28880000/39920000 | 297620000/444708000/450910500 | 0.9784/0.9980/0.9999 | 462000/6505000 |
| `phase80a-prechange-baseline-world-00005` | first_division | 18 | 459 | 194190000/879938000/1825013400 | 7745825000/13578790000/13731570100 | 0.8683/0.9803/0.9816 | 252167000/1187670000 |
| `phase80a-prechange-baseline-world-00005` | second_division | 18 | 418 | 57880000/145179000/228849600 | 1405670000/2468784000/2503759900 | 0.8824/0.9875/0.9981 | 30313000/200640000 |
| `phase80a-prechange-baseline-world-00005` | third_division | 18 | 409 | 10970000/28606000/41606400 | 285750000/421076000/446358400 | 0.9822/0.9964/0.9993 | 837000/4280000 |
| `phase80a-prechange-baseline-world-00006` | first_division | 18 | 472 | 164440000/869686000/2094961100 | 7805350000/13237218000/13869379200 | 0.8810/0.9560/0.9907 | 548414000/1089025000 |
| `phase80a-prechange-baseline-world-00006` | second_division | 18 | 423 | 53720000/130508000/231130000 | 1417620000/2422384000/2487358100 | 0.8723/0.9690/0.9949 | 71449000/166945000 |
| `phase80a-prechange-baseline-world-00006` | third_division | 18 | 407 | 10980000/27206000/41339800 | 288465000/431421000/447510500 | 0.9784/0.9941/0.9983 | 2675000/7590000 |
| `phase80a-prechange-baseline-world-00007` | first_division | 18 | 461 | 166720000/804650000/2282346000 | 7942005000/13467636000/13859746900 | 0.9045/0.9890/0.9952 | 106279000/955370000 |
| `phase80a-prechange-baseline-world-00007` | second_division | 18 | 423 | 55600000/136388000/227718000 | 1458455000/2405189000/2484844200 | 0.8492/0.9795/0.9940 | 42675000/195130000 |
| `phase80a-prechange-baseline-world-00007` | third_division | 18 | 406 | 11180000/27800000/47997000 | 285650000/445945000/448384600 | 0.9837/0.9999/1.0000 | 21000/4610000 |
| `phase80a-prechange-baseline-world-00008` | first_division | 18 | 471 | 179070000/822310000/1855443000 | 7971925000/13998573000/14017472900 | 0.8665/0.9995/0.9999 | 7569000/1156545000 |
| `phase80a-prechange-baseline-world-00008` | second_division | 18 | 419 | 56280000/142708000/221853000 | 1455490000/2479299000/2519094200 | 0.9046/0.9940/0.9994 | 12987000/147730000 |
| `phase80a-prechange-baseline-world-00008` | third_division | 18 | 402 | 10655000/28540000/44393100 | 288990000/442764000/447936300 | 0.9869/1.0000/1.0000 | 0/4395000 |
| `phase80a-prechange-baseline-world-00009` | first_division | 18 | 460 | 155180000/869521000/1953467500 | 8094730000/13621385000/13992614900 | 0.8934/0.9740/0.9981 | 237278000/1123170000 |
| `phase80a-prechange-baseline-world-00009` | second_division | 18 | 422 | 57245000/132957000/214751400 | 1385795000/2430235000/2499413700 | 0.8855/0.9879/0.9992 | 25982000/176890000 |
| `phase80a-prechange-baseline-world-00009` | third_division | 18 | 400 | 11395000/28399000/41234700 | 290875000/442868000/448697800 | 0.9616/0.9984/1.0000 | 714000/13520000 |
| `phase80a-prechange-baseline-world-00010` | first_division | 18 | 461 | 166200000/824170000/1907404000 | 8188720000/13495980000/13867447100 | 0.8844/0.9640/0.9905 | 504020000/1166785000 |
| `phase80a-prechange-baseline-world-00010` | second_division | 18 | 424 | 54220000/135635000/213261500 | 1421370000/2422707000/2489654600 | 0.8913/0.9841/0.9959 | 29763000/175705000 |
| `phase80a-prechange-baseline-world-00010` | third_division | 18 | 403 | 11200000/28472000/40749800 | 277925000/443760000/450011300 | 0.9761/0.9989/1.0000 | 437000/7465000 |
| `phase80a-prechange-baseline-world-00011` | first_division | 18 | 459 | 164710000/734000000/2097090000 | 7034445000/13763774000/13900496800 | 0.8785/0.9862/0.9929 | 115662000/1023725000 |
| `phase80a-prechange-baseline-world-00011` | second_division | 18 | 418 | 56865000/131149000/204602400 | 1314530000/2210246000/2481711100 | 0.8587/0.9829/0.9927 | 29942000/202690000 |
| `phase80a-prechange-baseline-world-00011` | third_division | 18 | 403 | 11180000/27744000/40411600 | 282070000/447168000/451254400 | 0.9853/1.0000/1.0000 | 0/4675000 |
| `phase80a-prechange-baseline-world-00012` | first_division | 18 | 463 | 165170000/845786000/1964052600 | 7892400000/13721566000/13929692900 | 0.8650/0.9873/0.9950 | 136029000/1150315000 |
| `phase80a-prechange-baseline-world-00012` | second_division | 18 | 413 | 57580000/141076000/224142000 | 1444390000/2392075000/2492307900 | 0.9015/0.9843/0.9969 | 26781000/167525000 |
| `phase80a-prechange-baseline-world-00012` | third_division | 18 | 406 | 11300000/29530000/40614500 | 323375000/438869000/448937200 | 0.9788/1.0000/1.0000 | 7000/5720000 |
| `phase80a-prechange-baseline-world-00013` | first_division | 18 | 467 | 166120000/771010000/1945965200 | 7396225000/13662077000/13956900600 | 0.8371/0.9855/0.9969 | 176545000/1323190000 |
| `phase80a-prechange-baseline-world-00013` | second_division | 18 | 421 | 52990000/134690000/232368000 | 1478885000/2454882000/2488235400 | 0.8976/0.9892/0.9965 | 23692000/150135000 |
| `phase80a-prechange-baseline-world-00013` | third_division | 18 | 403 | 11340000/28276000/39495400 | 297800000/447301000/449233300 | 0.9755/0.9991/1.0000 | 331000/5610000 |
| `phase80a-prechange-baseline-world-00014` | first_division | 18 | 466 | 163690000/863255000/2047245500 | 8020570000/13908024000/13978044100 | 0.8646/0.9934/0.9984 | 91976000/1179430000 |
| `phase80a-prechange-baseline-world-00014` | second_division | 18 | 419 | 56060000/138356000/213924200 | 1345575000/2469850000/2489324300 | 0.8902/0.9845/0.9957 | 33755000/142300000 |
| `phase80a-prechange-baseline-world-00014` | third_division | 18 | 399 | 11470000/28650000/41206600 | 279540000/441564000/448565500 | 0.9793/0.9994/0.9999 | 267000/6780000 |
| `phase80a-prechange-baseline-world-00015` | first_division | 18 | 467 | 168380000/812992000/2090122600 | 7943380000/13961551000/13991892100 | 0.8623/0.9973/0.9994 | 38449000/1256620000 |
| `phase80a-prechange-baseline-world-00015` | second_division | 18 | 424 | 54585000/139787000/223745600 | 1372185000/2478049000/2495694500 | 0.8661/0.9912/0.9983 | 21951000/178295000 |
| `phase80a-prechange-baseline-world-00015` | third_division | 18 | 398 | 11090000/28547000/40936000 | 298650000/441424000/446757200 | 0.9753/0.9874/0.9942 | 3247000/8535000 |
| `phase80a-prechange-baseline-world-00016` | first_division | 18 | 470 | 174215000/799709000/2066806800 | 8298570000/13553584000/13979427100 | 0.8856/0.9918/0.9987 | 110325000/1247795000 |
| `phase80a-prechange-baseline-world-00016` | second_division | 18 | 424 | 56185000/138951000/246898400 | 1400585000/2474072000/2483002700 | 0.8855/0.9931/0.9970 | 17363000/180580000 |
| `phase80a-prechange-baseline-world-00016` | third_division | 18 | 399 | 11370000/27748000/41607200 | 280205000/443011000/448665500 | 0.9578/0.9960/0.9983 | 1785000/14190000 |
| `phase80a-prechange-baseline-world-00017` | first_division | 18 | 470 | 150630000/822747000/2082706300 | 8426245000/13721290000/13962859200 | 0.8638/0.9897/1.0000 | 125848000/1323035000 |
| `phase80a-prechange-baseline-world-00017` | second_division | 18 | 417 | 59840000/138362000/205258400 | 1380285000/2455531000/2503161700 | 0.8740/0.9833/0.9982 | 26500000/154510000 |
| `phase80a-prechange-baseline-world-00017` | third_division | 18 | 407 | 11850000/27582000/39953600 | 303040000/405941000/449761000 | 0.9786/0.9986/0.9999 | 498000/5595000 |
| `phase80a-prechange-baseline-world-00018` | first_division | 18 | 467 | 169550000/830010000/2054776200 | 7970195000/13671769000/13953383600 | 0.8842/0.9766/0.9967 | 261820000/1005590000 |
| `phase80a-prechange-baseline-world-00018` | second_division | 18 | 424 | 52250000/144466000/222822500 | 1414255000/2417134000/2485843600 | 0.8653/0.9747/0.9943 | 50112000/188505000 |
| `phase80a-prechange-baseline-world-00018` | third_division | 18 | 402 | 10740000/28522000/39511700 | 279850000/439635000/449034900 | 0.9769/0.9930/0.9996 | 1840000/9545000 |
| `phase80a-prechange-baseline-world-00019` | first_division | 18 | 456 | 156030000/833125000/2642651000 | 7923935000/13796190000/14084456100 | 0.8656/0.9876/0.9995 | 149868000/1240880000 |
| `phase80a-prechange-baseline-world-00019` | second_division | 18 | 421 | 53300000/141380000/224752000 | 1505425000/2469842000/2495348400 | 0.9007/0.9905/0.9988 | 22217000/171200000 |
| `phase80a-prechange-baseline-world-00019` | third_division | 18 | 406 | 10940000/28835000/40473500 | 293970000/447148000/449148800 | 0.9783/0.9975/0.9990 | 1063000/5690000 |
| `phase80a-prechange-baseline-world-00020` | first_division | 18 | 458 | 171875000/797958000/2311054200 | 8727900000/13143376000/13776656300 | 0.8728/0.9825/0.9923 | 211735000/1181995000 |
| `phase80a-prechange-baseline-world-00020` | second_division | 18 | 414 | 56385000/135249000/217091500 | 1332900000/2459176000/2483504600 | 0.8833/0.9837/0.9934 | 40824000/207545000 |
| `phase80a-prechange-baseline-world-00020` | third_division | 18 | 411 | 11390000/29800000/40872000 | 297235000/445913000/447173900 | 0.9848/1.0000/1.0000 | 0/4345000 |

### Cash, Transfer Room And Pending Exposure

| Seed | Division | Cash P50/P90/P99 | Transfer room P50/P90/P99 | Pending cash P50/P90/P99 | Pending wage P50/P90/P99 | Attempts/completed/free agents |
|---|---|---|---|---|---|---|
| `phase80a-prechange-baseline-world-00001` | first_division | 30457848400/34313526735.6/39304228758.99 | 6800000000/12000000000/12000000000 | 0/72397300/113274480 | 0/533382000/814881300 | 68/9/16 |
| `phase80a-prechange-baseline-world-00001` | second_division | 6179486842/7207266682/7304705327.03 | 1180000000/1603843823.5/1869483745.32 | 0/955500/9055590 | 0/15924000/150920400 | 90/10/0 |
| `phase80a-prechange-baseline-world-00001` | third_division | 1306250134/1420398577.8/1552880960.33 | 113356150/300000000/300000000 | 0/0/2959780 | 0/0/21140100 | 43/13/0 |
| `phase80a-prechange-baseline-world-00002` | first_division | 31533201000/34831790160.2/40267379444.66 | 6860220714/12372630348.9/13440984739.61 | 5475000/45726400/125455250 | 91250000/459835000/1261587000 | 72/6/27 |
| `phase80a-prechange-baseline-world-00002` | second_division | 6095654084.5/7110053620.1/7574063742.13 | 1020000000/1579772550/1780829651.53 | 0/4465500/12422170 | 0/74416000/130586500 | 91/7/1 |
| `phase80a-prechange-baseline-world-00002` | third_division | 1315443759/1508957386.6/1588007266.62 | 140000000/300000000/300000000 | 0/180300/5385950 | 0/3006000/39443500 | 51/4/0 |
| `phase80a-prechange-baseline-world-00003` | first_division | 30034018685/34592035742.5/39461599259.67 | 6808782377.5/12000000000/12456526237.96 | 6263500/16830800/26025130 | 104390000/258886000/309449100 | 75/11/26 |
| `phase80a-prechange-baseline-world-00003` | second_division | 5959970011/7307547203.2/7427237483.45 | 1157286741.5/1598749003.2/1673604563.45 | 0/0/2120650 | 0/0/35341400 | 82/13/0 |
| `phase80a-prechange-baseline-world-00003` | third_division | 1326484602.5/1442565784.9/1576004717.65 | 135976003/300000000/472190861.27 | 0/0/2369650 | 0/0/23696500 | 47/9/0 |
| `phase80a-prechange-baseline-world-00004` | first_division | 31071799863.5/33372704779.5/36360526313.71 | 6595568572/12000000000/12000000000 | 0/52129600/152447480 | 0/639296000/1169828300 | 71/6/29 |
| `phase80a-prechange-baseline-world-00004` | second_division | 6207238279/6901712721.5/7106520561.59 | 1171518384/1503071748/1556187388.96 | 0/7927700/17822380 | 0/71643000/170609500 | 94/11/0 |
| `phase80a-prechange-baseline-world-00004` | third_division | 1330231765.5/1460945190.8/1585829695.25 | 140000000/299202000/300000000 | 0/0/0 | 0/0/0 | 47/7/0 |
| `phase80a-prechange-baseline-world-00005` | first_division | 31533303734/34780705276.1/36151904751.06 | 6800000000/12000000000/12956733646.2 | 1798500/36519100/92096270 | 29975000/373857000/750107200 | 92/12/22 |
| `phase80a-prechange-baseline-world-00005` | second_division | 6131300702.5/6843271126.5/7046372198.14 | 1038746982.5/1492818000/1500000000 | 0/1946300/6511840 | 0/32432000/108536700 | 88/14/0 |
| `phase80a-prechange-baseline-world-00005` | third_division | 1294863189/1464951186.2/1511430176.54 | 140000000/300000000/307342580.06 | 0/0/0 | 0/0/0 | 19/3/0 |
| `phase80a-prechange-baseline-world-00006` | first_division | 30529605692/34185667412.1/35757687937.76 | 6800000000/12000000000/12282631583.4 | 1523500/123808600/212285480 | 25390000/1100632000/1607911100 | 84/6/29 |
| `phase80a-prechange-baseline-world-00006` | second_division | 6117685746.5/7032129309/7344641775.62 | 956680510/1554375183.2/1707252632.38 | 0/10118000/27772380 | 0/106210000/225316700 | 94/7/0 |
| `phase80a-prechange-baseline-world-00006` | third_division | 1318234979/1394913412/1431965438.64 | 113000000/300000000/307114511 | 0/0/3065190 | 0/0/21895400 | 44/10/0 |
| `phase80a-prechange-baseline-world-00007` | first_division | 30572668111.5/33210592388.3/36636342320.65 | 6836208190/12000000000/13638928262.12 | 726500/12143800/235083660 | 12110000/143750000/1733472100 | 86/11/26 |
| `phase80a-prechange-baseline-world-00007` | second_division | 6134802414/6822916207.6/7295585294.89 | 929138578.5/1500000000/1500000000 | 0/3519400/7652080 | 0/58664000/127536300 | 95/9/0 |
| `phase80a-prechange-baseline-world-00007` | third_division | 1311253780/1469407971.8/1532939649.19 | 145295280/300000000/304090422.6 | 0/0/2139740 | 0/0/21397400 | 26/4/0 |
| `phase80a-prechange-baseline-world-00008` | first_division | 30615856011/34445671804.2/36979172606.5 | 6800000000/11980797000/11998031400 | 8959000/131577200/212665630 | 119970000/1204028000/2027593200 | 72/7/22 |
| `phase80a-prechange-baseline-world-00008` | second_division | 6110093966.5/6945636960.2/7070970697.66 | 1020000000/1500000000/1507188263.97 | 0/1467000/6909390 | 0/24453000/115166500 | 78/4/0 |
| `phase80a-prechange-baseline-world-00008` | third_division | 1311968985/1439561585.9/1501919176.5 | 140000000/300000000/313608894.14 | 0/0/2328980 | 0/0/23289800 | 18/3/0 |
| `phase80a-prechange-baseline-world-00009` | first_division | 31509855100/33546231180.7/34462676033.13 | 6956017900/11983445000/12208982990.05 | 1073000/79342500/108849140 | 17885000/865353000/1089171400 | 88/17/21 |
| `phase80a-prechange-baseline-world-00009` | second_division | 6040383650/6800845879.1/6961145169.22 | 1006722250/1492986000/1500000000 | 0/1410400/5679310 | 0/23502000/94660700 | 86/5/0 |
| `phase80a-prechange-baseline-world-00009` | third_division | 1315921166/1527952951.4/1792840718.46 | 132840000/336424510.5/443293119.54 | 0/0/0 | 0/0/0 | 38/3/0 |
| `phase80a-prechange-baseline-world-00010` | first_division | 31236622067/33690616205.1/36300614986.38 | 6800000000/12000000000/12432940574.5 | 0/45394700/99098970 | 0/519019000/1548509000 | 78/18/22 |
| `phase80a-prechange-baseline-world-00010` | second_division | 6127942446/6643764768.5/7037439697.11 | 914860307/1500000000/1724282712.05 | 0/5599900/16263640 | 0/93325000/139009300 | 95/14/0 |
| `phase80a-prechange-baseline-world-00010` | third_division | 1316917154/1450671502.1/1525759684.96 | 140000000/299979000/305777136.98 | 0/0/1899870 | 0/0/18998700 | 52/10/0 |
| `phase80a-prechange-baseline-world-00011` | first_division | 30418518790/34469579650.5/38603168925.52 | 7458844676/12000000000/12000000000 | 1773500/91714500/252139630 | 29550000/655104000/1897609600 | 87/12/23 |
| `phase80a-prechange-baseline-world-00011` | second_division | 6267411430/6910974302.5/6995295434.76 | 1108712907/1500000000/1500000000 | 0/4101300/9757130 | 0/51361000/119639500 | 92/15/0 |
| `phase80a-prechange-baseline-world-00011` | third_division | 1343789915.5/1498538556.5/1554581713.59 | 132452946.5/336518921.6/429069813.59 | 0/0/0 | 0/0/0 | 32/2/0 |
| `phase80a-prechange-baseline-world-00012` | first_division | 31031482852.5/35718010058.8/39419440477.42 | 7046061009/12206460933.9/13220189499.82 | 0/23110700/232935890 | 0/271466000/1673726600 | 79/12/25 |
| `phase80a-prechange-baseline-world-00012` | second_division | 6157876149.5/6725860659.7/7056348127.52 | 860000000/1500000000/1529287512.8 | 0/769200/14206410 | 0/12822000/115738500 | 93/4/0 |
| `phase80a-prechange-baseline-world-00012` | third_division | 1264650554.5/1464488506.5/1524006264.02 | 125018237/300000000/300000000 | 0/0/0 | 0/0/0 | 31/5/0 |
| `phase80a-prechange-baseline-world-00013` | first_division | 30392868168/36808874048.9/38935143857.05 | 8100000000/12000000000/12859277604.26 | 2179000/20630200/45975890 | 36325000/323536000/420229500 | 93/6/26 |
| `phase80a-prechange-baseline-world-00013` | second_division | 6118110070/6730359076.4/7185678905.85 | 955440345/1500000000/1500000000 | 0/1654400/3841310 | 0/27570000/64010200 | 84/8/1 |
| `phase80a-prechange-baseline-world-00013` | third_division | 1336841690/1521275371.7/1857634623.15 | 145582723.5/300000000/565662955.5 | 0/0/0 | 0/0/0 | 25/8/0 |
| `phase80a-prechange-baseline-world-00014` | first_division | 30533294376.5/35183142101.4/38964896159.58 | 6875457405/12021938697/12420515121.64 | 0/17989200/24287600 | 0/299824000/404794400 | 76/13/25 |
| `phase80a-prechange-baseline-world-00014` | second_division | 6098206594.5/6864633529.5/7994966821.92 | 1045789992.5/1500000000/2180881974.24 | 0/1295500/4991630 | 0/21585000/83201000 | 84/7/0 |
| `phase80a-prechange-baseline-world-00014` | third_division | 1302555516/1600435403.1/1669673048.16 | 201124046/300848369.1/469636509.56 | 0/0/0 | 0/0/0 | 50/11/0 |
| `phase80a-prechange-baseline-world-00015` | first_division | 31113835837.5/33797132673.9/34946681418.04 | 6800000000/12000000000/12000000000 | 1256000/30748100/36034590 | 20935000/295253000/537555900 | 72/6/24 |
| `phase80a-prechange-baseline-world-00015` | second_division | 6067677357/6805911487.4/7449322923.34 | 965267380/1500000000/1627613675.28 | 0/2906700/13200600 | 0/39175000/134388100 | 88/10/0 |
| `phase80a-prechange-baseline-world-00015` | third_division | 1337368577.5/1500034778.6/1521665162.98 | 140000000/300000000/395907476.91 | 0/0/0 | 0/0/0 | 49/8/0 |
| `phase80a-prechange-baseline-world-00016` | first_division | 31184441025/33439891716/38105941296.78 | 6800000000/12000000000/12910949891.7 | 1280500/102893600/131748620 | 21340000/780114000/1022306900 | 60/9/25 |
| `phase80a-prechange-baseline-world-00016` | second_division | 6098581253/6781662665.1/7368645658.73 | 860000000/1519272807.6/1569466488.73 | 0/8598200/35705200 | 0/87286000/293484600 | 82/5/1 |
| `phase80a-prechange-baseline-world-00016` | third_division | 1353255000/1563136645.6/1667247673.29 | 154842997.5/323022169.8/560211703.29 | 0/0/0 | 0/0/0 | 56/15/1 |
| `phase80a-prechange-baseline-world-00017` | first_division | 30981512831/34229900718.3/36799719648.68 | 6800000000/12000000000/12000000000 | 1157000/39218900/103851860 | 19285000/308310000/761010400 | 68/9/31 |
| `phase80a-prechange-baseline-world-00017` | second_division | 6132869355.5/6675781280.2/7028232487.95 | 873628138.5/1493504000/1500000000 | 0/2706800/13023640 | 0/45104000/142988700 | 90/12/1 |
| `phase80a-prechange-baseline-world-00017` | third_division | 1322507882.5/1470970039.7/1567561717.26 | 138875000/300000000/317612709.56 | 0/0/1904850 | 0/0/19048500 | 43/7/0 |
| `phase80a-prechange-baseline-world-00018` | first_division | 30704220227.5/34065795354.4/35942856447.16 | 7379031303.5/12000000000/12443932321.77 | 0/19117000/78435270 | 0/212722000/601986600 | 70/9/27 |
| `phase80a-prechange-baseline-world-00018` | second_division | 6152201594/6824933951.6/7677295930.88 | 907222334.5/1500000000/2200243317.01 | 0/18610700/34173220 | 0/265092000/287960500 | 93/10/0 |
| `phase80a-prechange-baseline-world-00018` | third_division | 1340641046/1502541620.5/1631513283.26 | 140000000/300000000/317604980.6 | 0/387300/1598100 | 0/4983000/20693600 | 37/8/0 |
| `phase80a-prechange-baseline-world-00019` | first_division | 30762229493/34915259756.7/37300452809.45 | 6800000000/11923427000/12000000000 | 3691000/45308500/241378340 | 61515000/481574000/1737671100 | 68/7/21 |
| `phase80a-prechange-baseline-world-00019` | second_division | 6114115046.5/6767156989.1/6948728309.55 | 860464209.5/1500000000/1553695741.12 | 0/7301200/35720100 | 0/62155000/274426700 | 84/6/0 |
| `phase80a-prechange-baseline-world-00019` | third_division | 1306225375/1450712866.1/1476373999.6 | 127947280/299552000/300000000 | 0/321300/4008370 | 0/5358000/30368100 | 22/2/0 |
| `phase80a-prechange-baseline-world-00020` | first_division | 30711224877/32995177372.3/35805518675.86 | 6803436925/12000000000/12000000000 | 9062000/92437200/184755210 | 128385000/855280000/1413956100 | 80/17/21 |
| `phase80a-prechange-baseline-world-00020` | second_division | 6157845116/6872078071.1/7185334397.84 | 1020969835.5/1502087470.2/2009909057.01 | 0/5818800/7524030 | 0/96951000/106837900 | 96/7/0 |
| `phase80a-prechange-baseline-world-00020` | third_division | 1307732375.5/1459691033.6/1477796923.49 | 154976722/300000000/300000000 | 0/0/3569830 | 0/0/27929500 | 34/9/0 |

### Cross-Tier Permanent Transfers

| Seed | Source -> destination | Attempts | Completed | Public value P50 | Asking P50 | Fee P50 | Rejections |
|---|---|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00001` | first_division -> first_division | 60 | 7 | 876270350 | 1103466375 | 1329266609 | player_unwilling=18, fee_below_valuation=32, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00001` | first_division -> second_division | 8 | 4 | 19499450 | 20181931 | 19499022.5 | stale_ownership=1, fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00001` | second_division -> first_division | 8 | 2 | 66840300 | 86477980 | 118210144 | fee_below_valuation=2, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00001` | second_division -> second_division | 82 | 6 | 146664900 | 187095263 | 72096860 | player_unwilling=11, fee_below_valuation=61, stale_ownership=2, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00001` | second_division -> third_division | 7 | 1 | 21524300 | 21524300 | 31232600 | fee_below_valuation=3, unaffordable=2 |
| `phase80a-prechange-baseline-world-00001` | third_division -> third_division | 36 | 12 | 11440400 | 13618440 | 12493488 | fee_below_valuation=17, unaffordable=2, player_unwilling=3 |
| `phase80a-prechange-baseline-world-00002` | first_division -> first_division | 72 | 6 | 1002920800 | 1181254500 | 720674956.5 | fee_below_valuation=56, player_unwilling=6 |
| `phase80a-prechange-baseline-world-00002` | first_division -> second_division | 1 | 1 | 8661800 | 11953284 | 11056742 | none |
| `phase80a-prechange-baseline-world-00002` | second_division -> second_division | 87 | 4 | 125858800 | 169909380 | 218583349 | fee_below_valuation=54, player_unwilling=21, unaffordable=4, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00002` | second_division -> third_division | 11 | 0 | 31079000 | 34963875 | 0 | fee_below_valuation=7, player_unwilling=3 |
| `phase80a-prechange-baseline-world-00002` | third_division -> second_division | 3 | 2 | 11055600 | 13266720 | 25953995 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00002` | third_division -> third_division | 40 | 4 | 15940000 | 19161300 | 19775025 | player_unwilling=6, fee_below_valuation=29 |
| `phase80a-prechange-baseline-world-00003` | first_division -> first_division | 64 | 8 | 825588200 | 1014539175 | 290859291 | player_unwilling=11, fee_below_valuation=38, unaffordable=1, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00003` | first_division -> second_division | 1 | 1 | 45631100 | 54757320 | 50650510 | none |
| `phase80a-prechange-baseline-world-00003` | second_division -> first_division | 9 | 3 | 16535800 | 21394018 | 19254609 | stale_ownership=4, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00003` | second_division -> second_division | 73 | 9 | 146840300 | 167697135 | 41974600 | fee_below_valuation=53, player_unwilling=10 |
| `phase80a-prechange-baseline-world-00003` | second_division -> third_division | 3 | 1 | 23315600 | 23315600 | 9068772 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00003` | third_division -> first_division | 2 | 0 | 63720450 | 83829117 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00003` | third_division -> second_division | 8 | 3 | 32989900 | 37938385 | 50998770 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00003` | third_division -> third_division | 44 | 8 | 10077900 | 12264210 | 10268800 | fee_below_valuation=24, player_unwilling=11 |
| `phase80a-prechange-baseline-world-00004` | first_division -> first_division | 68 | 5 | 992153400 | 1120499880 | 57109445 | stale_ownership=3, player_unwilling=9, fee_below_valuation=43, unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | first_division -> second_division | 4 | 1 | 20245400 | 26245409.5 | 10159457 | stale_ownership=3 |
| `phase80a-prechange-baseline-world-00004` | second_division -> first_division | 3 | 1 | 112472300 | 126531338 | 126531338 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00004` | second_division -> second_division | 87 | 8 | 152006900 | 237012143 | 212590771 | fee_below_valuation=68, player_unwilling=10 |
| `phase80a-prechange-baseline-world-00004` | second_division -> third_division | 14 | 1 | 19548700 | 21992287.5 | 27254400 | fee_below_valuation=11, unaffordable=1 |
| `phase80a-prechange-baseline-world-00004` | third_division -> second_division | 3 | 2 | 9339600 | 12888648 | 48443377 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00004` | third_division -> third_division | 33 | 6 | 9473100 | 11574300 | 9755364.5 | fee_below_valuation=16, player_unwilling=9 |
| `phase80a-prechange-baseline-world-00005` | first_division -> first_division | 89 | 11 | 962020100 | 1324096515 | 1457347100 | player_unwilling=8, fee_below_valuation=67, unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | first_division -> second_division | 3 | 1 | 15706900 | 23481816 | 13318936 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00005` | second_division -> first_division | 2 | 1 | 120698200 | 159745613.5 | 167987298 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | second_division -> second_division | 80 | 10 | 162525250 | 207370620 | 81712270 | player_unwilling=20, fee_below_valuation=46, player_not_for_sale=2 |
| `phase80a-prechange-baseline-world-00005` | second_division -> third_division | 2 | 0 | 30528250 | 32195419 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00005` | third_division -> first_division | 1 | 0 | 10196100 | 14070618 | 0 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00005` | third_division -> second_division | 5 | 3 | 42952300 | 51542760 | 47677030 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00005` | third_division -> third_division | 17 | 3 | 15703000 | 24732225 | 7508994 | player_unwilling=4, fee_below_valuation=7, unaffordable=1 |
| `phase80a-prechange-baseline-world-00006` | first_division -> first_division | 81 | 5 | 864562500 | 900202545 | 340519980 | player_unwilling=21, fee_below_valuation=50, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00006` | first_division -> second_division | 1 | 1 | 32245200 | 38694240 | 38694240 | none |
| `phase80a-prechange-baseline-world-00006` | second_division -> first_division | 3 | 1 | 129472700 | 201006367 | 190956034 | stale_ownership=2 |
| `phase80a-prechange-baseline-world-00006` | second_division -> second_division | 91 | 6 | 129857600 | 175111043 | 240679747.5 | player_unwilling=19, fee_below_valuation=60 |
| `phase80a-prechange-baseline-world-00006` | second_division -> third_division | 5 | 2 | 10062200 | 9659712 | 17647453 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00006` | third_division -> second_division | 2 | 0 | 36552150 | 55350731.5 | 0 | fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00006` | third_division -> third_division | 39 | 8 | 10519000 | 11833875 | 10883515 | fee_below_valuation=17, player_unwilling=8, unaffordable=2 |
| `phase80a-prechange-baseline-world-00007` | first_division -> first_division | 80 | 10 | 856855600 | 982189100 | 771869450 | player_unwilling=14, fee_below_valuation=53, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00007` | second_division -> first_division | 5 | 1 | 15986600 | 24290146 | 19649282 | fee_below_valuation=2, player_not_for_sale=2 |
| `phase80a-prechange-baseline-world-00007` | second_division -> second_division | 90 | 6 | 170465200 | 207715500 | 194632352 | player_unwilling=12, fee_below_valuation=64, unaffordable=3 |
| `phase80a-prechange-baseline-world-00007` | second_division -> third_division | 7 | 0 | 33771500 | 37992938 | 0 | fee_below_valuation=5, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00007` | third_division -> first_division | 1 | 0 | 85010600 | 133891695 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00007` | third_division -> second_division | 5 | 3 | 47341400 | 51696960 | 46616986 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00007` | third_division -> third_division | 19 | 4 | 9501500 | 12827025 | 9016294 | player_unwilling=3, fee_below_valuation=11 |
| `phase80a-prechange-baseline-world-00008` | first_division -> first_division | 72 | 7 | 974209700 | 1186596675 | 647775773 | fee_below_valuation=49, player_unwilling=10, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00008` | first_division -> second_division | 1 | 0 | 162838400 | 243443408 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00008` | second_division -> second_division | 73 | 3 | 147445600 | 183553965 | 101813840 | player_unwilling=19, fee_below_valuation=48 |
| `phase80a-prechange-baseline-world-00008` | second_division -> third_division | 1 | 0 | 32906100 | 37019363 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00008` | third_division -> second_division | 4 | 1 | 44364400 | 55164795 | 81332074 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00008` | third_division -> third_division | 17 | 3 | 13260300 | 18299214 | 7442910 | fee_below_valuation=10, unaffordable=1, player_unwilling=3 |
| `phase80a-prechange-baseline-world-00009` | first_division -> first_division | 84 | 16 | 733598100 | 855402815 | 24877445 | fee_below_valuation=48, player_unwilling=13, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00009` | first_division -> second_division | 4 | 2 | 30829950 | 35808737 | 49125659 | stale_ownership=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00009` | second_division -> first_division | 4 | 1 | 141778100 | 217464816.5 | 18100129 | fee_below_valuation=1, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00009` | second_division -> second_division | 77 | 3 | 165005200 | 235031760 | 269059183 | fee_below_valuation=57, player_unwilling=16 |
| `phase80a-prechange-baseline-world-00009` | second_division -> third_division | 5 | 1 | 61267100 | 73520520 | 66168460 | fee_below_valuation=3, player_unwilling=1 |
| `phase80a-prechange-baseline-world-00009` | third_division -> second_division | 5 | 0 | 32298900 | 50870768 | 0 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00009` | third_division -> third_division | 33 | 2 | 10517100 | 12655575 | 11784853.5 | fee_below_valuation=20, player_unwilling=8 |
| `phase80a-prechange-baseline-world-00010` | first_division -> first_division | 73 | 17 | 955782400 | 1075255200 | 594355400 | fee_below_valuation=34, stale_ownership=6, player_unwilling=12 |
| `phase80a-prechange-baseline-world-00010` | first_division -> second_division | 4 | 1 | 32168100 | 30881376 | 29337288 | fee_below_valuation=1, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00010` | second_division -> first_division | 5 | 1 | 50306200 | 69422556 | 64215828 | fee_below_valuation=1, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00010` | second_division -> second_division | 87 | 10 | 142175700 | 183946921 | 139775865 | fee_below_valuation=58, player_unwilling=18, unaffordable=1 |
| `phase80a-prechange-baseline-world-00010` | second_division -> third_division | 4 | 1 | 23090550 | 24367787.5 | 10244479 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00010` | third_division -> second_division | 4 | 3 | 31048050 | 48900679 | 50355714 | unaffordable=1 |
| `phase80a-prechange-baseline-world-00010` | third_division -> third_division | 48 | 9 | 12012250 | 13547475 | 6333262 | fee_below_valuation=26, player_unwilling=7 |
| `phase80a-prechange-baseline-world-00011` | first_division -> first_division | 80 | 9 | 784794200 | 1078728980 | 127274150 | fee_below_valuation=45, player_unwilling=16, stale_ownership=3 |
| `phase80a-prechange-baseline-world-00011` | first_division -> second_division | 3 | 2 | 7381300 | 11714123 | 14109706 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00011` | second_division -> first_division | 5 | 2 | 85001900 | 109975458 | 261352904.5 | fee_below_valuation=1, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00011` | second_division -> second_division | 80 | 11 | 148969800 | 199648665 | 217075450 | player_unwilling=14, fee_below_valuation=51 |
| `phase80a-prechange-baseline-world-00011` | second_division -> third_division | 4 | 1 | 41616700 | 56182545 | 12878304 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00011` | third_division -> first_division | 2 | 1 | 13974300 | 19284534 | 20562000 | player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00011` | third_division -> second_division | 9 | 2 | 29646700 | 40023045 | 23327845.5 | fee_below_valuation=6, unaffordable=1 |
| `phase80a-prechange-baseline-world-00011` | third_division -> third_division | 28 | 1 | 14453000 | 16259625 | 6271300 | player_unwilling=7, fee_below_valuation=19 |
| `phase80a-prechange-baseline-world-00012` | first_division -> first_division | 79 | 12 | 877049200 | 1184016420 | 879601480 | player_unwilling=14, stale_ownership=4, fee_below_valuation=41 |
| `phase80a-prechange-baseline-world-00012` | first_division -> second_division | 8 | 0 | 9522200 | 13140636 | 0 | unaffordable=1, fee_below_valuation=4, player_unwilling=2 |
| `phase80a-prechange-baseline-world-00012` | second_division -> second_division | 77 | 2 | 177066400 | 248655420 | 188993737 | fee_below_valuation=48, player_unwilling=24 |
| `phase80a-prechange-baseline-world-00012` | second_division -> third_division | 5 | 0 | 10834400 | 10401024 | 0 | unaffordable=1, fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00012` | third_division -> second_division | 8 | 2 | 32224250 | 44326987.5 | 28373128.5 | fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00012` | third_division -> third_division | 26 | 5 | 9825050 | 10301288 | 7931030 | fee_below_valuation=13, unaffordable=1, player_unwilling=7 |
| `phase80a-prechange-baseline-world-00013` | first_division -> first_division | 92 | 6 | 1185683700 | 1333894163 | 1500602591 | fee_below_valuation=68, player_unwilling=14 |
| `phase80a-prechange-baseline-world-00013` | second_division -> second_division | 79 | 7 | 136384500 | 185300055 | 153638340 | fee_below_valuation=53, player_unwilling=15 |
| `phase80a-prechange-baseline-world-00013` | second_division -> third_division | 5 | 0 | 53673500 | 72459225 | 0 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00013` | third_division -> first_division | 1 | 0 | 14676400 | 19813140 | 0 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00013` | third_division -> second_division | 5 | 1 | 42073000 | 56798550 | 29912380 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00013` | third_division -> third_division | 20 | 8 | 13157500 | 13157500 | 11307952.5 | fee_below_valuation=9, unaffordable=1, player_unwilling=2 |
| `phase80a-prechange-baseline-world-00014` | first_division -> first_division | 69 | 10 | 612128400 | 688644450 | 329318870.5 | fee_below_valuation=39, player_unwilling=14, stale_ownership=1, player_not_for_sale=2 |
| `phase80a-prechange-baseline-world-00014` | first_division -> second_division | 8 | 1 | 9932450 | 12567163 | 14591276 | fee_below_valuation=4, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00014` | second_division -> first_division | 6 | 2 | 104680350 | 135435436.5 | 694191983.5 | stale_ownership=2, fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00014` | second_division -> second_division | 70 | 4 | 136373450 | 168253942.5 | 140307347 | fee_below_valuation=43, stale_ownership=2, player_unwilling=16, unaffordable=2 |
| `phase80a-prechange-baseline-world-00014` | second_division -> third_division | 4 | 1 | 46704000 | 52542000 | 45974250 | player_unwilling=2, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00014` | third_division -> first_division | 1 | 1 | 97431500 | 145660093 | 131094047 | none |
| `phase80a-prechange-baseline-world-00014` | third_division -> second_division | 6 | 2 | 38745800 | 54377670 | 43315920.5 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00014` | third_division -> third_division | 46 | 10 | 11713900 | 14936292 | 11140356.5 | fee_below_valuation=32, player_unwilling=2, unaffordable=2 |
| `phase80a-prechange-baseline-world-00015` | first_division -> first_division | 72 | 6 | 1040898250 | 1238814217.5 | 1319979384.5 | fee_below_valuation=50, player_unwilling=13, unaffordable=1 |
| `phase80a-prechange-baseline-world-00015` | second_division -> second_division | 82 | 7 | 139929750 | 189634905 | 148537400 | fee_below_valuation=56, player_unwilling=16 |
| `phase80a-prechange-baseline-world-00015` | second_division -> third_division | 7 | 2 | 10958200 | 11289125 | 11843888 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00015` | third_division -> second_division | 6 | 3 | 42972350 | 57108037.5 | 49970143 | fee_below_valuation=2, unaffordable=1 |
| `phase80a-prechange-baseline-world-00015` | third_division -> third_division | 42 | 6 | 12884100 | 15669215 | 12540509.5 | fee_below_valuation=23, player_unwilling=9, unaffordable=2, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00016` | first_division -> first_division | 60 | 9 | 694152900 | 902057929 | 102582214 | fee_below_valuation=35, stale_ownership=5, player_unwilling=11 |
| `phase80a-prechange-baseline-world-00016` | first_division -> second_division | 3 | 0 | 46108200 | 50903453 | 0 | stale_ownership=3 |
| `phase80a-prechange-baseline-world-00016` | second_division -> second_division | 74 | 2 | 126130700 | 170871260 | 96979985 | player_unwilling=12, fee_below_valuation=53 |
| `phase80a-prechange-baseline-world-00016` | second_division -> third_division | 11 | 3 | 18089600 | 17366016 | 16931858 | fee_below_valuation=6 |
| `phase80a-prechange-baseline-world-00016` | third_division -> second_division | 5 | 3 | 37060700 | 51884980 | 57891450 | fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00016` | third_division -> third_division | 45 | 12 | 11104700 | 11711025 | 10521652.5 | player_unwilling=12, stale_ownership=1, unaffordable=1, fee_below_valuation=14 |
| `phase80a-prechange-baseline-world-00017` | first_division -> first_division | 58 | 6 | 923841600 | 1029681300 | 716339521.5 | player_unwilling=12, fee_below_valuation=37, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00017` | first_division -> second_division | 7 | 3 | 32370500 | 44171765 | 63118043 | stale_ownership=1, unaffordable=1, fee_below_valuation=2 |
| `phase80a-prechange-baseline-world-00017` | second_division -> first_division | 7 | 2 | 9970700 | 15823501 | 205031763 | fee_below_valuation=3, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00017` | second_division -> second_division | 78 | 7 | 143384700 | 172433070 | 88709880 | fee_below_valuation=53, player_unwilling=14 |
| `phase80a-prechange-baseline-world-00017` | second_division -> third_division | 7 | 2 | 38780300 | 38780300 | 26267631.5 | fee_below_valuation=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> first_division | 3 | 1 | 14542000 | 18814440 | 18814440 | stale_ownership=1, fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> second_division | 5 | 2 | 38780300 | 47555818 | 46390916.5 | stale_ownership=1, fee_below_valuation=1, unaffordable=1 |
| `phase80a-prechange-baseline-world-00017` | third_division -> third_division | 36 | 5 | 15924400 | 18847525.5 | 13257030 | player_unwilling=14, fee_below_valuation=16 |
| `phase80a-prechange-baseline-world-00018` | first_division -> first_division | 70 | 9 | 852976800 | 1153444460 | 1283832775 | fee_below_valuation=43, player_unwilling=13, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00018` | first_division -> second_division | 1 | 1 | 9977300 | 13768674 | 12391787 | none |
| `phase80a-prechange-baseline-world-00018` | second_division -> second_division | 89 | 7 | 136908700 | 184826745 | 232413560 | player_unwilling=10, fee_below_valuation=65, unaffordable=3 |
| `phase80a-prechange-baseline-world-00018` | second_division -> third_division | 12 | 1 | 30690600 | 34526925 | 38142150 | player_unwilling=3, fee_below_valuation=7, unaffordable=1 |
| `phase80a-prechange-baseline-world-00018` | third_division -> second_division | 3 | 2 | 31803000 | 44524200 | 49126454 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00018` | third_division -> third_division | 25 | 7 | 10336600 | 10961550 | 12365550 | fee_below_valuation=13, player_unwilling=4, unaffordable=1 |
| `phase80a-prechange-baseline-world-00019` | first_division -> first_division | 62 | 5 | 912569050 | 1110665059 | 448785708 | player_unwilling=17, fee_below_valuation=32, unaffordable=2, stale_ownership=1 |
| `phase80a-prechange-baseline-world-00019` | first_division -> second_division | 2 | 1 | 44627300 | 56817967 | 9908867 | stale_ownership=1 |
| `phase80a-prechange-baseline-world-00019` | second_division -> first_division | 6 | 2 | 88202000 | 117990952 | 113497351.5 | fee_below_valuation=2, stale_ownership=2 |
| `phase80a-prechange-baseline-world-00019` | second_division -> second_division | 78 | 5 | 161399100 | 246795255 | 221143450 | fee_below_valuation=57, player_unwilling=13 |
| `phase80a-prechange-baseline-world-00019` | second_division -> third_division | 6 | 0 | 39419000 | 44346375 | 0 | fee_below_valuation=5 |
| `phase80a-prechange-baseline-world-00019` | third_division -> second_division | 4 | 0 | 49718600 | 65131140 | 0 | fee_below_valuation=4 |
| `phase80a-prechange-baseline-world-00019` | third_division -> third_division | 16 | 2 | 14437200 | 19490220 | 11190241 | fee_below_valuation=14 |
| `phase80a-prechange-baseline-world-00020` | first_division -> first_division | 64 | 11 | 504022700 | 654482025 | 268081500 | fee_below_valuation=33, player_unwilling=12, stale_ownership=3, player_not_for_sale=1 |
| `phase80a-prechange-baseline-world-00020` | first_division -> second_division | 4 | 2 | 11059450 | 15302116 | 14154433 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00020` | second_division -> first_division | 14 | 5 | 55992500 | 84742716.5 | 253826763 | fee_below_valuation=3, stale_ownership=6 |
| `phase80a-prechange-baseline-world-00020` | second_division -> second_division | 88 | 4 | 174907500 | 263617864 | 275344897.5 | fee_below_valuation=71, player_unwilling=9 |
| `phase80a-prechange-baseline-world-00020` | second_division -> third_division | 10 | 3 | 59936700 | 80914545 | 9063978 | fee_below_valuation=5, player_unwilling=2 |
| `phase80a-prechange-baseline-world-00020` | third_division -> first_division | 2 | 1 | 231666000 | 275682540 | 248114270 | fee_below_valuation=1 |
| `phase80a-prechange-baseline-world-00020` | third_division -> second_division | 4 | 1 | 53929900 | 72805365 | 191041742 | fee_below_valuation=3 |
| `phase80a-prechange-baseline-world-00020` | third_division -> third_division | 24 | 6 | 12060750 | 12780700.5 | 9288382.5 | fee_below_valuation=15, player_unwilling=2 |

## Year-10 Exceptional Stock Locations

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase80a-prechange-baseline-world-00009` | FAIL | 18 | 11 | senior 1219..1282; youth 594..594; total 1813..1876 | 0 | 0 | 0 | structural 0; cash 809151693; wage 1.0000; free agents 0.0320; values 3699000..14020000000; renew/release/expiry 262/0/2 | 10 | avg 29.50; min 22; max 37; low season 2; champion pts 60..63; last pts 26..38; ability spread 6.80->5.88; draw rate avg/max 0.230/0.250 | season 1; Parma Calcio; Oumar Traore; assists 8; team goals 46; top1 0.17; top3 0.43; top assist Diego Herrera; top scorer Giorgio Taddei:14 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00010` | FAIL | 19 | 11 | senior 1226..1288; youth 594..594; total 1820..1882 | 0 | 0 | 0 | structural 0; cash 722000000; wage 1.0000; free agents 0.0314; values 3883500..13495000000; renew/release/expiry 279/0/0 | 12 | avg 27.50; min 24; max 31; low season 1; champion pts 59..60; last pts 28..36; ability spread 6.72->6.07; draw rate avg/max 0.250/0.270 | season 1; A.S.D. Salerno; Luca Gatti; assists 9; team goals 46; top1 0.20; top3 0.48; top assist Giorgio Carli; top scorer Davide Costantini:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00001` | FAIL | 19 | 11 | senior 1227..1283; youth 594..594; total 1821..1877 | 0 | 0 | 0 | structural 0; cash 742943400; wage 0.9996; free agents 0.0276; values 3774900..12298000000; renew/release/expiry 273/3/2 | 12 | avg 28.50; min 27; max 30; low season 2; champion pts 61..63; last pts 31..36; ability spread 6.78->5.77; draw rate avg/max 0.250/0.270 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 45; top1 0.24; top3 0.41; top assist Matteo Basiletti; top scorer Nico Sorrentino:14 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | table_points_spread_avg |
| `phase80a-prechange-baseline-world-00019` | WARN | 19 | 11 | senior 1220..1283; youth 594..594; total 1814..1877 | 0 | 0 | 0 | structural 0; cash 755258250; wage 1.0000; free agents 0.0397; values 3690800..12760000000; renew/release/expiry 295/0/0 | 11 | avg 35.50; min 33; max 38; low season 2; champion pts 63..65; last pts 27..30; ability spread 6.41->5.89; draw rate avg/max 0.240/0.240 | season 1; Virtus Foggia; Luka Tomic; assists 9; team goals 50; top1 0.18; top3 0.40; top assist Luka Tomic; top scorer Nico Magnani:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00002` | WARN | 19 | 11 | senior 1231..1298; youth 594..594; total 1825..1892 | 0 | 0 | 0 | structural 0; cash 761305695; wage 1.0000; free agents 0.0346; values 3731800..12760000000; renew/release/expiry 275/1/1 | 13 | avg 40.00; min 34; max 46; low season 2; champion pts 69..73; last pts 27..35; ability spread 6.22->5.23; draw rate avg/max 0.250/0.250 | season 1; Virtus Parma; Sergio Molina; assists 11; team goals 50; top1 0.22; top3 0.40; top assist Logan Morgan; top scorer Niklas Weber:14 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00013` | WARN | 18 | 11 | senior 1217..1291; youth 594..594; total 1811..1885 | 0 | 0 | 0 | structural 0; cash 811657870; wage 1.0000; free agents 0.0328; values 3496600..15000000000; renew/release/expiry 260/0/1 | 10 | avg 33.50; min 27; max 40; low season 2; champion pts 56..72; last pts 29..32; ability spread 5.90->5.36; draw rate avg/max 0.250/0.260 | season 1; S.S. Taranto; Enrico Bruni; assists 10; team goals 46; top1 0.22; top3 0.41; top assist Enrico Bruni; top scorer Tomas Paredes:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00017` | WARN | 20 | 11 | senior 1229..1294; youth 594..594; total 1823..1888 | 0 | 0 | 0 | structural 0; cash 842951878; wage 1.0000; free agents 0.0326; values 3451100..13684000000; renew/release/expiry 271/1/5 | 10 | avg 41.50; min 39; max 44; low season 1; champion pts 67..67; last pts 23..28; ability spread 6.69->6.05; draw rate avg/max 0.220/0.220 | season 1; S.S. Terni; Nico Tarantino; assists 10; team goals 45; top1 0.22; top3 0.40; top assist Nico Tarantino; top scorer Timo Bergmann:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00012` | WARN | 20 | 11 | senior 1218..1282; youth 594..594; total 1812..1876 | 0 | 0 | 0 | structural 0; cash 848293290; wage 1.0000; free agents 0.0326; values 4016400..10303000000; renew/release/expiry 256/1/1 | 9 | avg 35.00; min 34; max 36; low season 1; champion pts 62..63; last pts 26..29; ability spread 6.52->6.13; draw rate avg/max 0.240/0.250 | season 1; Virtus Foggia; Lautaro Sosa; assists 9; team goals 53; top1 0.17; top3 0.39; top assist Lautaro Sosa; top scorer Marko Stanic:15 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00018` | WARN | 19 | 11 | senior 1220..1293; youth 594..594; total 1814..1887 | 0 | 0 | 0 | structural 0; cash 744567250; wage 1.0000; free agents 0.0324; values 3887300..12298000000; renew/release/expiry 270/2/1 | 11 | avg 32.00; min 28; max 36; low season 1; champion pts 60..65; last pts 29..32; ability spread 6.43->5.85; draw rate avg/max 0.250/0.260 | season 1; A.S.D. Bologna; Enrico Ferrini; assists 10; team goals 48; top1 0.21; top3 0.41; top assist Davide Spinelli; top scorer Enrico Fontana:17 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase80a-prechange-baseline-world-00007` | WARN | 19 | 11 | senior 1219..1290; youth 594..594; total 1813..1884 | 0 | 0 | 0 | structural 0; cash 758168502; wage 1.0000; free agents 0.0324; values 3649400..13495000000; renew/release/expiry 283/0/0 | 10 | avg 38.00; min 33; max 43; low season 1; champion pts 64..67; last pts 24..31; ability spread 5.76->5.28; draw rate avg/max 0.230/0.260 | season 1; Vicenza Calcio; Matteo Pavan; assists 9; team goals 41; top1 0.22; top3 0.49; top assist Luca Casadei; top scorer Davide Falco:18 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase80a-prechange-baseline-world-00002` | 13 | season 1; Virtus Parma; Sergio Molina; assists 11; team goals 50; top1 0.22; top3 0.40; top assist Logan Morgan; top scorer Niklas Weber:14 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 12 | season 1; U.S. Matera; Nico Bonacina; assists 11; team goals 45; top1 0.24; top3 0.41; top assist Matteo Basiletti; top scorer Nico Sorrentino:14 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00010` | 12 | season 1; A.S.D. Salerno; Luca Gatti; assists 9; team goals 46; top1 0.20; top3 0.48; top assist Giorgio Carli; top scorer Davide Costantini:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00003` | 12 | season 2; S.S. Carpi; Giorgio Caldara; assists 10; team goals 58; top1 0.17; top3 0.38; top assist Emilio Sosa; top scorer Renan Teixeira:21 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00018` | 11 | season 1; A.S.D. Bologna; Enrico Ferrini; assists 10; team goals 48; top1 0.21; top3 0.41; top assist Davide Spinelli; top scorer Enrico Fontana:17 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 11 | season 2; Pisa Calcio; Marko Tomic; assists 9; team goals 45; top1 0.20; top3 0.42; top assist Nico Bosco; top scorer Matteo Sala:17 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00006` | 11 | season 1; Taranto Calcio; Giorgio Bianchi; assists 9; team goals 47; top1 0.19; top3 0.40; top assist Nico Vitali; top scorer Enrico Bianco:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00014` | 11 | season 1; U.S. Catania; Nico Capra; assists 11; team goals 59; top1 0.19; top3 0.39; top assist Nico Capra; top scorer Luca Rosati:16 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00019` | 11 | season 1; Virtus Foggia; Luka Tomic; assists 9; team goals 50; top1 0.18; top3 0.40; top assist Luka Tomic; top scorer Nico Magnani:13 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00015` | 11 | season 1; U.S. Cesena; Nico Bonetti; assists 8; team goals 46; top1 0.17; top3 0.40; top assist Nico Cerri; top scorer Enrico Capra:15 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00017` | 2 | Pro Trento | 67..67 | 41.50 | 1 | transfer=78; squad=121 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00003` | 2 | A.C. Matera | 61..76 | 36.00 | 1 | transfer=77; squad=111 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00006` | 2 | A.S.D. Lecco | 63..65 | 35.50 | 1 | transfer=69; squad=110 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 2 | Pro Brescia | 62..68 | 34.50 | 1 | transfer=70; squad=108 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00004` | 2 | F.C. Terni | 66..66 | 34.00 | 1 | transfer=76; squad=116 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00002` | 1 | A.C. Terni | 73..73 | 46.00 | 2 | transfer=59; squad=103 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00014` | 1 | A.C. Taranto | 69..69 | 43.00 | 2 | transfer=82; squad=123 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00015` | 1 | U.S. Florence | 65..65 | 43.00 | 2 | transfer=69; squad=104 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 1 | S.S. Lecco | 69..69 | 42.00 | 2 | transfer=80; squad=115 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00016` | 1 | A.S. Florence | 74..74 | 42.00 | 2 | transfer=76; squad=113 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase80a-prechange-baseline-world-00010` | 27.50 | 24..31 | 59..60 | 28..36 | avg 0.250 max 0.270 | 6.72->6.07 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00001` | 28.50 | 27..30 | 61..63 | 31..36 | avg 0.250 max 0.270 | 6.78->5.77 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00009` | 29.50 | 22..37 | 60..63 | 26..38 | avg 0.230 max 0.250 | 6.80->5.88 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00011` | 30.00 | 29..31 | 63..64 | 32..35 | avg 0.270 max 0.280 | 6.52->5.38 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00005` | 31.00 | 28..34 | 64..65 | 31..36 | avg 0.220 max 0.220 | 6.06->5.50 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00018` | 32.00 | 28..36 | 60..65 | 29..32 | avg 0.250 max 0.260 | 6.43->5.85 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00013` | 33.50 | 27..40 | 56..72 | 29..32 | avg 0.250 max 0.260 | 5.90->5.36 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00004` | 34.00 | 33..35 | 66..66 | 31..33 | avg 0.240 max 0.250 | 6.13->5.28 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00008` | 34.50 | 30..39 | 62..68 | 29..32 | avg 0.260 max 0.280 | 6.42->5.70 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase80a-prechange-baseline-world-00020` | 35.00 | 28..42 | 63..69 | 27..35 | avg 0.220 max 0.240 | 6.07->5.35 | table_points_spread_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Market And Economy Diagnostic Worlds

### Zero Permanent Completions Despite Recruitment Needs

| Seed | Needs | Recruitable | Targets | Offers | Completed | Lost reasons |
|---|---:|---:|---:|---:|---:|---|

### Highest Useful Free-Agent Stock

| Seed | Useful stock max | Free-agent share max |
|---|---:|---:|
| `phase80a-prechange-baseline-world-00019` | 0 | 0.0397 |
| `phase80a-prechange-baseline-world-00006` | 0 | 0.0378 |
| `phase80a-prechange-baseline-world-00002` | 0 | 0.0346 |
| `phase80a-prechange-baseline-world-00013` | 0 | 0.0328 |
| `phase80a-prechange-baseline-world-00012` | 0 | 0.0326 |
| `phase80a-prechange-baseline-world-00017` | 0 | 0.0326 |
| `phase80a-prechange-baseline-world-00005` | 0 | 0.0324 |
| `phase80a-prechange-baseline-world-00007` | 0 | 0.0324 |
| `phase80a-prechange-baseline-world-00018` | 0 | 0.0324 |
| `phase80a-prechange-baseline-world-00009` | 0 | 0.0320 |

### Broadest Wage Pressure

| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |
|---|---:|---:|---:|---:|
| `phase80a-prechange-baseline-world-00020` | 0.3889 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00007` | 0.3796 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00008` | 0.3704 | 0.0278 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00013` | 0.3704 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00012` | 0.3611 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00017` | 0.3519 | 0.0185 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00003` | 0.3426 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00019` | 0.3426 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00014` | 0.3333 | 0.0093 | 0.0000 | 1.0000 |
| `phase80a-prechange-baseline-world-00005` | 0.3333 | 0.0000 | 0.0000 | 0.9996 |

## Reproduction

Run the same gate with:

```bash
nvm use 24
pnpm cli ten-season-report --seed-prefix=phase80a-prechange-baseline --worlds=20 --seasons=2 --checkpoint-dir=<checkpoint-directory> --shards=20 --workers=7 --report-output=artifacts/phase80a-step09-report.md
```

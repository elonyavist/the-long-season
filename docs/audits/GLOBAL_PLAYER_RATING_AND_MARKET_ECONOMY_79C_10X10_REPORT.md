# Senior Squad, Contracts And Club Finance Long-Run Gates Report

Date: 2026-07-28
Seed prefix: `phase79c-three-division-short`
Worlds: 10
Seasons per world: 10
Total seasons: 100
Execution: parallel; workers=8; partition_hashes=8355634db7c5fd59,6876b2a49cc9a175,153de17c71c36b77,f2278c8d7ceb95f4,19a8b31abb21d90a,4180840a32dfad23,6b5b7e027fb26409,5effbb264aefbb86
Status: PASS

## Aggregate Metrics

- Failed worlds: 0
- Warning worlds: 10
- Year-10 rating-cap violation worlds: 0
- Year-10 current-six maximum observed: 2
- Year-10 potential-six maximum observed: 4
- Year-10 lower-tier potential-six maximum observed: 1
- Goals per match average: 3.040
- Goals per match p95: 3.150
- Table spread average: 40.54
- Table spread minimum world average: 38.40
- Draw rate average: 0.230
- Draw rate maximum world average: 0.240
- Champion streak max observed: 6
- Top assist max p95: 14
- Production warning max: assists=14 top1=0.26 top3=0.55
- Age 30+ share p95: 0.26
- Minimum squad size observed: 18
- Clubs below minimum squad size: 0
- Clubs without natural goalkeeper: 0
- Role coverage warnings total: 2017
- Role coverage warnings p95: 213
- Youth roster max observed: 11
- Active player count min/max: senior=1188..1298 youth=594..594 total=1782..1892
- Clubs above youth target: 0
- Clubs below youth minimum: 0
- Contract/finance structural violations: 0
- Club cash floor (minor): 691839790
- Maximum annual wage utilization: 1.0000
- Annual wage utilization distribution: p50=0.9100; p90=0.9900; p95=1.0000; p99=1.0000; pressure share=0.4000; exact ceiling share=0.0400; above budget share=0.0000; reallocation exact ceiling count=114
- Annual wage headroom (minor): p10=5780000; p50=190550000
- Maximum free-agent share: 0.2124
- Maximum useful free-agent stock: 18
- Free-agent closing-stock band observations: age under23/23-29/30-34/35+=8835/6818/4968/5881; ability <8/8-9/10-11/12+=7221/11944/6033/1304; unattached <1/1-2/3+ seasons=4531/14323/7648
- Permanent-transfer funnel: needs=1753855; recruitable=1097832; targets=23718; unavailable=1730137; offers=23718; seller rejected/countered/accepted/expired/withdrawn=501/0/22599/618/0; player started/countered/rejected/counter-accepted=22599/0/6467/0; unaffordable=0; completed=12237; lost reasons=active_talk_limit_reached=6077, club_already_handled=88807, club_cannot_recruit=561139, implausible_downward_move=6358, permanent_start_limit_reached=198868, seller_department_floor=22022, transfer_terms_unaffordable=26370, transfer_window_closed=820496
- Preliminary-agreement funnel: candidates=26669; unavailable=867848; offers=26669; rejected/countered/counter-accepted/counter-rejected=15921/0/0/0; agreements=4279; expired=6427; activations=2890; activation failures=623; lost reasons=active_talk_limit_reached=431150, club_terms_unaffordable=6959, contract_overlap=138, current_contract_expired=288, negotiation_deadline=6139, player_unwilling=8962, preliminary_start_limit_reached=81099, preliminary_target_unavailable=355599, unaffordable=485
- Permanent-transfer public values: count=12237; p50=114382508; p90=1213839645; p99=2357150484; max=8382930329
- Permanent-transfer asking prices: count=12237; p50=146668271; p90=1523434510; p99=3140116475; max=11736102461
- Permanent-transfer completed fees: count=12237; p50=146668271; p90=1523434510; p99=3140116475; max=11736102461
- Free-agent public values: count=3882; p50=36074643; p90=310343103; p99=1158105892; max=9451138837
- Free-agent non-zero completed fees: 0
- Sampled player value min/max (minor): 2018275..15000000000
- Contract lifecycle: renewals=48636; releases=1060; expiries=9308; selected expiry decisions=1526
- Warning check counts: role_coverage_warning_count=10, senior_active_player_population=10, total_active_player_population=10, wage_budget_pressure_prevalence=10, youth_active_player_population=10, goals_per_match_avg=8, champion_streak=2
- Signal check counts: monitor=58, story=2
- Failing check counts: none
- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk

## Phase 79C Version And Replay Evidence

Exact calibration bundles:

- `{"topologyDecisionId":"fictional-three-tier-v1","playerRatingScaleVersion":"player-rating-scale-v1","playerMarketCalibrationVersion":"player-market-calibration-transfermarkt-it-2026-07-28-v1","valuationCurvesVersion":"valuation-curves-v1","askingPriceCurvesVersion":"asking-price-curves-v1","marketBehaviorCalibrationVersion":"market-behavior-calibration-v1","wageFinanceCalibrationVersion":"wage-finance-calibration-reportcalcio-2025-v1"}`

| Seed | Initial composition hash |
|---|---|
| `phase79c-three-division-short-world-00001` | `fbf49a7699b43a91` |
| `phase79c-three-division-short-world-00002` | `28161f0f50d9c860` |
| `phase79c-three-division-short-world-00003` | `494a92aa828bbf32` |
| `phase79c-three-division-short-world-00004` | `e18ab18c4bf54ebc` |
| `phase79c-three-division-short-world-00005` | `f08730290544808f` |
| `phase79c-three-division-short-world-00006` | `b36107e097017e01` |
| `phase79c-three-division-short-world-00007` | `00c2d561ff260fb4` |
| `phase79c-three-division-short-world-00008` | `087bfe7b8adb1537` |
| `phase79c-three-division-short-world-00009` | `7f4f55b5c4a835cf` |
| `phase79c-three-division-short-world-00010` | `fd705440d432da51` |

## Phase 79C Closing Division Economy

### Wage Economy

| Seed | Division | Clubs | Players | Wage P50/P90/P99 | Committed P50/P90/P99 | Utilization P50/P90/P99 | Headroom P10/P50 |
|---|---|---:|---:|---|---|---|---|
| `phase79c-three-division-short-world-00001` | first_division | 18 | 450 | 48590000/582411000/1704851700 | 4450995000/6685556000/7531340100 | 0.4670/0.7730/0.8158 | 1433281000/4738310000 |
| `phase79c-three-division-short-world-00001` | second_division | 18 | 408 | 42250000/95292000/212677100 | 1045920000/1283581000/1483556800 | 0.5677/0.8025/0.8142 | 250751286.6/861465000 |
| `phase79c-three-division-short-world-00001` | third_division | 18 | 398 | 12380000/35351000/51973600 | 376990000/465401000/488416700 | 0.9704/0.9800/0.9965 | 5725348/14063265.5 |
| `phase79c-three-division-short-world-00002` | first_division | 18 | 451 | 52090000/466250000/1489845000 | 4570095000/5516513000/6740642200 | 0.4234/0.6459/0.6984 | 2895726000/4510160000 |
| `phase79c-three-division-short-world-00002` | second_division | 18 | 413 | 42410000/97380000/249404400 | 1112205000/1477746000/1525609000 | 0.7058/0.8834/0.9319 | 117801000/559990000 |
| `phase79c-three-division-short-world-00002` | third_division | 18 | 394 | 13820000/38328000/51224000 | 440235000/453777000/488336500 | 0.9783/0.9800/0.9800 | 6904184.3/9084286 |
| `phase79c-three-division-short-world-00003` | first_division | 18 | 451 | 46400000/397960000/1572845000 | 3418965000/6101477000/9565891800 | 0.4074/0.6655/0.6838 | 3737920000/4670975000 |
| `phase79c-three-division-short-world-00003` | second_division | 18 | 412 | 42420000/102790000/231105800 | 1064550000/1489735000/1576190800 | 0.6397/0.8634/0.9630 | 151495000/675665000 |
| `phase79c-three-division-short-world-00003` | third_division | 18 | 396 | 13540000/36805000/57313500 | 428255000/456464000/465320300 | 0.9781/0.9800/0.9884 | 6690429.1/9869082 |
| `phase79c-three-division-short-world-00004` | first_division | 18 | 451 | 42960000/466940000/1312995000 | 3605875000/6689189000/9240663600 | 0.3490/0.6579/0.7806 | 2673214000/4895495000 |
| `phase79c-three-division-short-world-00004` | second_division | 18 | 407 | 43490000/115484000/174620200 | 1140780000/1433573000/1590331500 | 0.6888/0.9433/0.9778 | 59360857.6/523775918.5 |
| `phase79c-three-division-short-world-00004` | third_division | 18 | 389 | 11240000/40292000/55390800 | 411320000/461648000/498577500 | 0.9789/0.9800/0.9800 | 7495347.6/9134490.5 |
| `phase79c-three-division-short-world-00005` | first_division | 18 | 451 | 38410000/400890000/1472080000 | 3213500000/6523195000/8765251200 | 0.3612/0.6010/0.6886 | 3076470000/5336000000 |
| `phase79c-three-division-short-world-00005` | second_division | 18 | 406 | 42770000/102795000/199584500 | 1092390000/1519346000/1555757900 | 0.6122/0.8285/0.9257 | 183808000/785080000 |
| `phase79c-three-division-short-world-00005` | third_division | 18 | 396 | 13525000/39080000/57943000 | 429135000/451107000/458856500 | 0.9794/0.9800/0.9966 | 5902715/9485000 |
| `phase79c-three-division-short-world-00006` | first_division | 18 | 450 | 59030000/401709000/1587270400 | 3599695000/6631015000/7454009600 | 0.3737/0.6060/0.8267 | 3316233612.3/5386035000 |
| `phase79c-three-division-short-world-00006` | second_division | 18 | 407 | 44010000/108818000/185230000 | 1156095000/1471376000/1590431300 | 0.7146/0.9663/0.9800 | 41791449.2/468255000 |
| `phase79c-three-division-short-world-00006` | third_division | 18 | 396 | 11750000/38200000/59098500 | 423205000/455331000/479405700 | 0.9399/0.9834/0.9983 | 6439123.9/27640000 |
| `phase79c-three-division-short-world-00007` | first_division | 18 | 451 | 48480000/473650000/1184605000 | 3589510000/6090486000/7943899800 | 0.3905/0.5538/0.6661 | 3557984000/5346665000 |
| `phase79c-three-division-short-world-00007` | second_division | 18 | 410 | 43880000/101768000/199284300 | 1081855000/1526710000/2266429800 | 0.7005/0.8788/0.9510 | 162058857.2/529025000 |
| `phase79c-three-division-short-world-00007` | third_division | 18 | 396 | 11910000/36080000/65653000 | 405930000/463031000/472640500 | 0.9589/0.9800/0.9800 | 7626245.5/19645000 |
| `phase79c-three-division-short-world-00008` | first_division | 18 | 450 | 47820000/504649000/1357150300 | 3656250000/6490498000/8153445000 | 0.4189/0.6020/0.6636 | 3157076000/5265340000 |
| `phase79c-three-division-short-world-00008` | second_division | 18 | 410 | 42770000/100543000/272718800 | 1069505000/1506589000/1904514500 | 0.6974/0.9482/0.9762 | 69173000/497220000 |
| `phase79c-three-division-short-world-00008` | third_division | 18 | 397 | 12510000/37102000/54926800 | 435605000/456027000/486958900 | 0.9751/0.9800/0.9800 | 8582449.8/12405000 |
| `phase79c-three-division-short-world-00009` | first_division | 18 | 453 | 48390000/407562000/1496394400 | 4117015000/6883104000/9730394900 | 0.3905/0.7299/0.9178 | 2174097000/4947780000 |
| `phase79c-three-division-short-world-00009` | second_division | 18 | 406 | 42410000/91760000/211553000 | 1056340000/1340176000/1686854700 | 0.5438/0.8734/0.9358 | 142946775.7/848235000 |
| `phase79c-three-division-short-world-00009` | third_division | 18 | 395 | 13270000/37664000/72797600 | 417380000/475975000/501736100 | 0.9773/0.9800/0.9962 | 5940694.7/9615000 |
| `phase79c-three-division-short-world-00010` | first_division | 18 | 451 | 48480000/473660000/1367445000 | 3997040000/6110916000/6906653600 | 0.4416/0.6693/0.7044 | 2632886000/5577405000 |
| `phase79c-three-division-short-world-00010` | second_division | 18 | 409 | 42770000/102810000/218672800 | 1113360000/1364794000/1805198500 | 0.6188/0.8542/0.9634 | 152853000/778605000 |
| `phase79c-three-division-short-world-00010` | third_division | 18 | 399 | 11480000/39178000/65200600 | 433145000/461093000/465902200 | 0.9800/0.9858/0.9999 | 4565143.3/9019592 |

### Cash, Transfer Room And Pending Exposure

| Seed | Division | Cash P50/P90/P99 | Transfer room P50/P90/P99 | Pending cash P50/P90/P99 | Pending wage P50/P90/P99 | Attempts/completed/free agents |
|---|---|---|---|---|---|---|
| `phase79c-three-division-short-world-00001` | first_division | 83093590241/107926666548.3/120345255099.08 | 9299155000/16970699438.6/25097479292.81 | 32553000/137772900/279580460 | 323305000/1039314000/2028291600 | 94/62/0 |
| `phase79c-three-division-short-world-00001` | second_division | 15839984925.5/25915303460.1/29785327715.01 | 2114484801/9098073998.1/14767761450.95 | 9333500/25104900/38568120 | 99580000/214517000/303036000 | 108/57/37 |
| `phase79c-three-division-short-world-00001` | third_division | 2483633099.5/3609905937.3/5608927185.26 | 182790115/339537960.4/530340343.37 | 2358500/7988500/9312490 | 23585000/67209000/72444400 | 92/48/52 |
| `phase79c-three-division-short-world-00002` | first_division | 85225753783/112289543723.2/119544472258.39 | 9615819846.5/21381126020.1/25141904986.37 | 34240000/188575000/313065900 | 300665000/1476407000/2328100600 | 101/62/0 |
| `phase79c-three-division-short-world-00002` | second_division | 15901751533.5/23762861999.7/27267414135.3 | 1459785000/5341349944.4/11072574250.63 | 11850500/16681500/20357920 | 101790000/164751000/215292400 | 108/48/25 |
| `phase79c-three-division-short-world-00002` | third_division | 2808275561/3588640006.5/5635697350.66 | 225864085.5/663042327/792795620.34 | 721000/7945500/10697670 | 12025000/62559000/77130600 | 92/41/40 |
| `phase79c-three-division-short-world-00003` | first_division | 89378874849.5/111811066519.1/115649444503.06 | 9369170324.5/17534105064/23398637046.99 | 56534000/175998900/232019940 | 444010000/1281364000/1695750400 | 103/74/0 |
| `phase79c-three-division-short-world-00003` | second_division | 16154334263/23761184237.3/28400342640.19 | 1694570749.5/6579718880/11885976617.14 | 15193500/27381500/30602500 | 120610000/239615000/301710400 | 108/75/27 |
| `phase79c-three-division-short-world-00003` | third_division | 2751344183.5/3388803454.2/5645744242.93 | 198882018.5/585003656.1/651567849.78 | 2114500/9111000/9951710 | 26540000/70187000/73461600 | 88/36/33 |
| `phase79c-three-division-short-world-00004` | first_division | 85200059385.5/113836425518.8/134520716848.94 | 10389712445.5/18102499169/31406510148.94 | 32174500/101080900/161661780 | 303865000/976390000/1410022500 | 106/73/0 |
| `phase79c-three-division-short-world-00004` | second_division | 17007718517/24546994939.7/25795446465.05 | 1648761591/6422183697.3/9663753889.04 | 17200000/30300200/33963000 | 145985000/225816000/281267300 | 108/59/23 |
| `phase79c-three-division-short-world-00004` | third_division | 2694352468.5/3416640050.7/5572897881.45 | 122860586/302573491.5/530323930.5 | 1087500/8147500/9478640 | 13455000/69482000/78609900 | 72/36/46 |
| `phase79c-three-division-short-world-00005` | first_division | 81244983715/110563956782.9/123744276121.17 | 10351400000/14712535864.9/15303592591.45 | 44208000/222017000/362258610 | 442080000/1668217000/2723866100 | 100/66/0 |
| `phase79c-three-division-short-world-00005` | second_division | 16312458907/22974548843/27266868382.66 | 2212319693.5/5767872365.3/10084766351.4 | 13724000/23762800/32953170 | 112755000/189478000/320620300 | 108/67/30 |
| `phase79c-three-division-short-world-00005` | third_division | 2880872113/3499106932.8/5671440869.22 | 228126186/550473915.8/883739847.03 | 1736000/8402000/9542070 | 21840000/70025000/79220200 | 96/40/53 |
| `phase79c-three-division-short-world-00006` | first_division | 83715075570.5/111573791123.4/137182482681.54 | 9009236006.5/14837133243.9/24080575390.96 | 28711000/134753000/413397220 | 270120000/1191612000/3203625200 | 103/65/0 |
| `phase79c-three-division-short-world-00006` | second_division | 15549580252/24870056366.2/27490894147.81 | 1895057453.5/6462289379.3/8674418969.31 | 15283500/24009500/27646890 | 138060000/188746000/230473000 | 108/56/34 |
| `phase79c-three-division-short-world-00006` | third_division | 2765522745/3489126185.8/5529789200.27 | 251958069.5/639396216.4/1048596765.12 | 1179000/10107500/11222470 | 15340000/86102000/99156000 | 102/44/46 |
| `phase79c-three-division-short-world-00007` | first_division | 87714067497/121764394879.8/127896618453.28 | 9599549659.5/21250891226.3/26576633927.22 | 39831000/119190900/171757300 | 332075000/1015062000/1267277700 | 107/81/0 |
| `phase79c-three-division-short-world-00007` | second_division | 14880865126.5/23373483320/23927256505.82 | 1994060898/5670711101/8625377455.78 | 18359000/30180400/38059210 | 140350000/298241000/380592100 | 108/58/34 |
| `phase79c-three-division-short-world-00007` | third_division | 2624077770.5/3815767848.6/5872119246.31 | 263400000/614625565.7/1488640060.71 | 5425500/9016300/10702920 | 49160000/76361000/76787100 | 95/43/53 |
| `phase79c-three-division-short-world-00008` | first_division | 85585760852/117305886337.3/125489728207.09 | 9310546934/18187056800.2/22158821342.8 | 51938500/120874000/220910370 | 400975000/1069305000/1583120700 | 105/75/0 |
| `phase79c-three-division-short-world-00008` | second_division | 15843817984.5/25261711433.8/27935730582.4 | 1732372569/6592822109/9761137742.4 | 16573000/31530300/46074910 | 143405000/314847000/387625000 | 108/67/26 |
| `phase79c-three-division-short-world-00008` | third_division | 2677081004/3538822149.6/5584864404.12 | 216933417.5/355191446.7/668860237.66 | 4142000/8965700/10259630 | 40565000/71657000/85306400 | 88/50/43 |
| `phase79c-three-division-short-world-00009` | first_division | 86033897990.5/113202789055/118666826299.22 | 9325297942/19278553255/22023592388.89 | 29372500/82620300/742646590 | 219510000/645159000/5396715100 | 104/77/1 |
| `phase79c-three-division-short-world-00009` | second_division | 16917902210/24879516379.9/28485482268.38 | 1891682879/7401360303.7/10708034720.22 | 13813500/23231500/30748960 | 119985000/182516000/219634700 | 108/56/35 |
| `phase79c-three-division-short-world-00009` | third_division | 2731572204.5/3469580767.8/5720700076.2 | 218451306/469459964.5/613200852 | 2653500/10366300/18495880 | 28010000/78825000/166008700 | 91/48/34 |
| `phase79c-three-division-short-world-00010` | first_division | 83675196213/112288959733.1/125879368722.36 | 9083584690/18267768084.8/24320556691.64 | 25638000/165393700/272982110 | 282030000/1353386000/2133284800 | 102/73/0 |
| `phase79c-three-division-short-world-00010` | second_division | 15726882344.5/24426928645.5/29979352090.06 | 1808251330.5/8694413586.9/13630416066 | 13855500/27546900/45536030 | 121045000/239446000/325257600 | 108/71/27 |
| `phase79c-three-division-short-world-00010` | third_division | 2902938778.5/3674678263/5541538447.01 | 218428710.5/702317891.5/869068668.26 | 298000/8458200/12537530 | 4970000/63154000/89554000 | 102/57/33 |

### Cross-Tier Permanent Transfers

| Seed | Source -> destination | Attempts | Completed | Public value P50 | Asking P50 | Fee P50 | Rejections |
|---|---|---:|---:|---:|---:|---:|---|
| `phase79c-three-division-short-world-00001` | first_division -> first_division | 74 | 43 | 753512879 | 1026853128 | 1022523881 | player_unwilling=23, stale_ownership=3 |
| `phase79c-three-division-short-world-00001` | first_division -> second_division | 5 | 4 | 105398043 | 136363988 | 165397300 | player_unwilling=1 |
| `phase79c-three-division-short-world-00001` | second_division -> first_division | 20 | 19 | 452268550.5 | 621908747 | 593563834 | stale_ownership=1 |
| `phase79c-three-division-short-world-00001` | second_division -> second_division | 95 | 45 | 118502227 | 158094992 | 140820175 | stale_ownership=21, player_unwilling=18 |
| `phase79c-three-division-short-world-00001` | second_division -> third_division | 23 | 12 | 21364547 | 21614172 | 21601835 | stale_ownership=7, player_unwilling=3 |
| `phase79c-three-division-short-world-00001` | third_division -> second_division | 8 | 8 | 92007176 | 119232981.5 | 119232981.5 | none |
| `phase79c-three-division-short-world-00001` | third_division -> third_division | 69 | 36 | 15488567 | 19477112 | 15798338 | player_unwilling=10, player_not_for_sale=1, unaffordable=4, stale_ownership=14 |
| `phase79c-three-division-short-world-00002` | first_division -> first_division | 87 | 52 | 987266924 | 1174847640 | 1190539812 | player_unwilling=23, stale_ownership=7 |
| `phase79c-three-division-short-world-00002` | first_division -> second_division | 12 | 5 | 27135211.5 | 31700345 | 44326978 | player_unwilling=5, stale_ownership=2 |
| `phase79c-three-division-short-world-00002` | second_division -> first_division | 14 | 10 | 351173374 | 519860518 | 362389469.5 | stale_ownership=2, player_not_for_sale=2 |
| `phase79c-three-division-short-world-00002` | second_division -> second_division | 83 | 37 | 120843154 | 169964835 | 144585010 | player_unwilling=26, stale_ownership=13, player_not_for_sale=5 |
| `phase79c-three-division-short-world-00002` | second_division -> third_division | 29 | 14 | 15722453 | 18414404 | 21576176 | stale_ownership=5, player_unwilling=7 |
| `phase79c-three-division-short-world-00002` | third_division -> second_division | 13 | 6 | 39033313 | 67390437 | 47303014.5 | stale_ownership=6, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00002` | third_division -> third_division | 63 | 27 | 10318199 | 13603678 | 19145434 | player_unwilling=20, stale_ownership=8, player_not_for_sale=4, unaffordable=1 |
| `phase79c-three-division-short-world-00003` | first_division -> first_division | 86 | 63 | 986762431 | 1298139734.5 | 1292347949 | stale_ownership=6, player_unwilling=13 |
| `phase79c-three-division-short-world-00003` | first_division -> second_division | 3 | 2 | 77573876 | 79125354 | 185388804 | stale_ownership=1 |
| `phase79c-three-division-short-world-00003` | second_division -> first_division | 17 | 11 | 158352657 | 216705611 | 203313687 | stale_ownership=5 |
| `phase79c-three-division-short-world-00003` | second_division -> second_division | 98 | 66 | 112573973.5 | 144208173 | 136115185 | player_unwilling=16, stale_ownership=10, player_not_for_sale=3 |
| `phase79c-three-division-short-world-00003` | second_division -> third_division | 22 | 10 | 15453709 | 17385423 | 15865649 | player_unwilling=2, stale_ownership=7, player_not_for_sale=1, unaffordable=1 |
| `phase79c-three-division-short-world-00003` | third_division -> second_division | 7 | 7 | 72371405 | 86121972 | 86121972 | none |
| `phase79c-three-division-short-world-00003` | third_division -> third_division | 66 | 26 | 11560859 | 15899495.5 | 15130476 | player_unwilling=24, unaffordable=5, stale_ownership=5, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00004` | first_division -> first_division | 92 | 62 | 995204601 | 1208277256 | 1318645719 | player_unwilling=13, stale_ownership=14, player_not_for_sale=1, unaffordable=1 |
| `phase79c-three-division-short-world-00004` | first_division -> second_division | 4 | 3 | 23438774 | 27153912.5 | 34839341 | stale_ownership=1 |
| `phase79c-three-division-short-world-00004` | second_division -> first_division | 13 | 10 | 308438201 | 424704536 | 428259008.5 | stale_ownership=3 |
| `phase79c-three-division-short-world-00004` | second_division -> second_division | 94 | 50 | 108627042 | 146120864.5 | 142146102 | player_unwilling=25, stale_ownership=9, unaffordable=2 |
| `phase79c-three-division-short-world-00004` | second_division -> third_division | 20 | 13 | 13196688.5 | 11992766 | 14000782 | stale_ownership=3, unaffordable=2, player_unwilling=1 |
| `phase79c-three-division-short-world-00004` | third_division -> first_division | 1 | 1 | 4659735 | 6932754 | 6932754 | none |
| `phase79c-three-division-short-world-00004` | third_division -> second_division | 10 | 6 | 75053333.5 | 96660159.5 | 96660159.5 | stale_ownership=3 |
| `phase79c-three-division-short-world-00004` | third_division -> third_division | 52 | 23 | 9884297 | 11611800 | 9380888 | player_unwilling=17, stale_ownership=4, unaffordable=2 |
| `phase79c-three-division-short-world-00005` | first_division -> first_division | 91 | 60 | 942333003 | 1121376274 | 1195724725 | player_unwilling=15, stale_ownership=12 |
| `phase79c-three-division-short-world-00005` | first_division -> second_division | 4 | 2 | 34567696.5 | 41957853 | 76494216.5 | player_unwilling=2 |
| `phase79c-three-division-short-world-00005` | second_division -> first_division | 9 | 6 | 352864833 | 502047034 | 822981451.5 | stale_ownership=2, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00005` | second_division -> second_division | 88 | 52 | 119996295 | 157927999 | 153524987.5 | player_unwilling=31, stale_ownership=3 |
| `phase79c-three-division-short-world-00005` | second_division -> third_division | 21 | 7 | 36773616 | 44128339 | 40764606 | player_unwilling=7, stale_ownership=6 |
| `phase79c-three-division-short-world-00005` | third_division -> second_division | 16 | 13 | 71408204.5 | 99835756 | 99719066 | unaffordable=1, stale_ownership=1 |
| `phase79c-three-division-short-world-00005` | third_division -> third_division | 75 | 33 | 11354407 | 13202971 | 18019444 | player_unwilling=28, stale_ownership=5, unaffordable=3, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00006` | first_division -> first_division | 86 | 52 | 789457569 | 1048063869 | 1133079636.5 | stale_ownership=6, player_unwilling=25, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00006` | first_division -> second_division | 22 | 11 | 34874078.5 | 42918255 | 45017680 | stale_ownership=5, player_unwilling=5 |
| `phase79c-three-division-short-world-00006` | second_division -> first_division | 17 | 13 | 273368470 | 413554476 | 262861985 | stale_ownership=4 |
| `phase79c-three-division-short-world-00006` | second_division -> second_division | 76 | 38 | 109416941 | 135319515 | 123777862 | player_unwilling=19, stale_ownership=13, player_not_for_sale=2, unaffordable=1 |
| `phase79c-three-division-short-world-00006` | second_division -> third_division | 43 | 18 | 17718428 | 21135470 | 21326825.5 | stale_ownership=18, unaffordable=2, player_not_for_sale=3, player_unwilling=2 |
| `phase79c-three-division-short-world-00006` | third_division -> second_division | 10 | 7 | 122614187 | 160706655.5 | 197276975 | stale_ownership=1, unaffordable=1, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00006` | third_division -> third_division | 59 | 26 | 21135470 | 28532885 | 46607913.5 | stale_ownership=7, unaffordable=5, player_unwilling=16, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00007` | first_division -> first_division | 88 | 65 | 995466983 | 1272680765 | 1301975207 | player_unwilling=16, stale_ownership=3 |
| `phase79c-three-division-short-world-00007` | first_division -> second_division | 2 | 2 | 112262415 | 157349709.5 | 157349709.5 | none |
| `phase79c-three-division-short-world-00007` | second_division -> first_division | 18 | 15 | 251465857 | 323240215.5 | 297909202 | stale_ownership=2 |
| `phase79c-three-division-short-world-00007` | second_division -> second_division | 93 | 43 | 120166549 | 145283965 | 145283965 | player_unwilling=38, stale_ownership=7, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00007` | second_division -> third_division | 27 | 11 | 17258716 | 17826617 | 14669909 | player_unwilling=7, unaffordable=4, stale_ownership=4, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00007` | third_division -> first_division | 1 | 1 | 105273535 | 169490391 | 169490391 | none |
| `phase79c-three-division-short-world-00007` | third_division -> second_division | 13 | 13 | 85253336 | 134243758 | 134243758 | none |
| `phase79c-three-division-short-world-00007` | third_division -> third_division | 68 | 32 | 14413847 | 19952368 | 21551738 | player_unwilling=14, stale_ownership=14, player_not_for_sale=3 |
| `phase79c-three-division-short-world-00008` | first_division -> first_division | 88 | 61 | 719046148 | 1096322481 | 1299054683 | player_unwilling=18, stale_ownership=3 |
| `phase79c-three-division-short-world-00008` | first_division -> second_division | 1 | 1 | 123125638 | 159299950 | 159299950 | none |
| `phase79c-three-division-short-world-00008` | second_division -> first_division | 17 | 14 | 222994678 | 265363667 | 306087984 | stale_ownership=2, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00008` | second_division -> second_division | 97 | 58 | 106940390 | 143309407 | 138074836 | player_unwilling=26, unaffordable=1, stale_ownership=8 |
| `phase79c-three-division-short-world-00008` | second_division -> third_division | 25 | 12 | 18816291 | 21387433 | 19758685.5 | stale_ownership=8, player_unwilling=5 |
| `phase79c-three-division-short-world-00008` | third_division -> second_division | 10 | 8 | 87815951 | 122942331.5 | 122942331.5 | unaffordable=1, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00008` | third_division -> third_division | 63 | 38 | 17644056 | 27549124 | 16258203 | player_unwilling=15, unaffordable=4, player_not_for_sale=1, stale_ownership=2 |
| `phase79c-three-division-short-world-00009` | first_division -> first_division | 87 | 65 | 929313519 | 1141753989 | 1290754413 | player_unwilling=13, stale_ownership=4, player_not_for_sale=2 |
| `phase79c-three-division-short-world-00009` | second_division -> first_division | 17 | 12 | 370069436 | 533946301 | 508585904 | stale_ownership=5 |
| `phase79c-three-division-short-world-00009` | second_division -> second_division | 98 | 46 | 125574415.5 | 172568335.5 | 167682836.5 | player_unwilling=32, stale_ownership=12, player_not_for_sale=4 |
| `phase79c-three-division-short-world-00009` | second_division -> third_division | 26 | 12 | 19635423 | 22557292 | 25364572 | stale_ownership=5, player_unwilling=9 |
| `phase79c-three-division-short-world-00009` | third_division -> second_division | 10 | 10 | 72830304 | 95447080 | 95447080 | none |
| `phase79c-three-division-short-world-00009` | third_division -> third_division | 65 | 36 | 11348114 | 14806397 | 14212067 | player_unwilling=16, stale_ownership=6, unaffordable=4 |
| `phase79c-three-division-short-world-00010` | first_division -> first_division | 80 | 55 | 899192443 | 1104855452 | 1230544858 | player_unwilling=20, stale_ownership=2 |
| `phase79c-three-division-short-world-00010` | first_division -> second_division | 5 | 4 | 34511624 | 32867988 | 33219589.5 | player_unwilling=1 |
| `phase79c-three-division-short-world-00010` | second_division -> first_division | 21 | 17 | 244608212 | 342451497 | 279401297 | stale_ownership=4 |
| `phase79c-three-division-short-world-00010` | second_division -> second_division | 85 | 52 | 132256950 | 166829137 | 157400403 | player_unwilling=21, stale_ownership=10, player_not_for_sale=1 |
| `phase79c-three-division-short-world-00010` | second_division -> third_division | 24 | 13 | 22272633.5 | 22272633.5 | 21150885 | unaffordable=2, stale_ownership=5, player_unwilling=3 |
| `phase79c-three-division-short-world-00010` | third_division -> first_division | 1 | 1 | 113296737 | 182407747 | 182407747 | none |
| `phase79c-three-division-short-world-00010` | third_division -> second_division | 18 | 15 | 94041883 | 132551323 | 108966844 | player_not_for_sale=1, stale_ownership=2 |
| `phase79c-three-division-short-world-00010` | third_division -> third_division | 78 | 44 | 12253086 | 17089763 | 25552436.5 | player_unwilling=20, stale_ownership=6, unaffordable=2, player_not_for_sale=1 |

## Phase 79C Year-10 Exceptional Locations

### phase79c-three-division-short-world-00001

- `player:ita-1-02-04|current=6|potential=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:ita-1-11-11|current=1.5|potential=6|division=first_division|club=club:ita-1-11|slot=senior`
- `player:ita-1-13-05|current=5.5|potential=5.5|division=first_division|club=club:ita-1-16|slot=senior`
- `player:ita-1-16-01|current=5.5|potential=5.5|division=first_division|club=club:ita-1-05|slot=senior`
- `player:youth-ita-1-08-09|current=3.5|potential=6|division=first_division|club=club:ita-1-01|slot=senior`

### phase79c-three-division-short-world-00002

- `player:ita-1-02-11|current=6|potential=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:ita-1-04-10|current=6|potential=6|division=first_division|club=club:ita-1-04|slot=senior`

### phase79c-three-division-short-world-00003

- `player:ita-1-03-10|current=6|potential=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:ita-1-04-04|current=6|potential=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:ita-1-15-03|current=5.5|potential=5.5|division=first_division|club=club:ita-1-08|slot=senior`

### phase79c-three-division-short-world-00004

- `player:ita-1-03-06|current=6|potential=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:ita-1-03-11|current=6|potential=6|division=free_agent|club=none|slot=free_agent`

### phase79c-three-division-short-world-00005

- `player:ita-1-03-01|current=6|potential=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:ita-1-03-09|current=3|potential=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:ita-1-11-02|current=5.5|potential=5.5|division=first_division|club=club:ita-1-16|slot=senior`
- `player:ita-3-06-16|current=1|potential=6|division=first_division|club=club:ita-1-06|slot=senior`

### phase79c-three-division-short-world-00006

- `player:ita-1-04-07|current=6|potential=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:ita-1-04-11|current=6|potential=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:ita-1-05-08|current=3|potential=6|division=first_division|club=club:ita-1-05|slot=senior`
- `player:ita-1-08-07|current=5.5|potential=6|division=first_division|club=club:ita-1-02|slot=senior`

### phase79c-three-division-short-world-00007

- `player:ita-1-01-14|current=2.5|potential=6|division=first_division|club=club:ita-1-12|slot=senior`
- `player:ita-1-03-09|current=6|potential=6|division=first_division|club=club:ita-1-03|slot=senior`
- `player:ita-1-17-09|current=5.5|potential=5.5|division=second_division|club=club:ita-2-01|slot=senior`
- `player:youth-intake-ita-1-02-2026-long-run-1-long-run-2-long-run-3-long-run-4-long-run-5-long-run-6-long-run-7-long-run-8-long-run-9-youth-intake-10-06|current=3.5|potential=6|division=first_division|club=club:ita-1-02|slot=academy`

### phase79c-three-division-short-world-00008

- `player:ita-1-04-09|current=6|potential=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:ita-1-11-19|current=1.5|potential=6|division=first_division|club=club:ita-1-11|slot=senior`

### phase79c-three-division-short-world-00009

- `player:ita-1-02-08|current=6|potential=6|division=first_division|club=club:ita-1-02|slot=senior`
- `player:ita-1-14-01|current=5.5|potential=6|division=first_division|club=club:ita-1-09|slot=senior`
- `player:ita-1-15-07|current=5.5|potential=6|division=first_division|club=club:ita-1-15|slot=senior`
- `player:ita-2-02-07|current=3|potential=6|division=first_division|club=club:ita-1-13|slot=senior`

### phase79c-three-division-short-world-00010

- `player:ita-1-04-04|current=6|potential=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:ita-1-07-06|current=5.5|potential=6|division=first_division|club=club:ita-1-04|slot=senior`
- `player:ita-1-08-16|current=1.5|potential=6|division=first_division|club=club:ita-1-08|slot=senior`
- `player:ita-3-01-14|current=2|potential=6|division=third_division|club=club:ita-3-01|slot=senior`

## Worst Worlds

| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |
|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|
| `phase79c-three-division-short-world-00004` | WARN | 18 | 11 | senior 1188..1289; youth 594..594; total 1782..1883 | 0 | 0 | 0 | structural 0; cash 691839790; wage 1.0000; free agents 0.2124; values 2701148..15000000000; renew/release/expiry 4896/98/942 | 11 | avg 38.60; min 28; max 49; low season 7; champion pts 59..75; last pts 20..38; ability spread 5.84->4.38; draw rate avg/max 0.230/0.260 | season 3; Pro Pescara; Luca Esposito; assists 9; team goals 41; top1 0.22; top3 0.41; top assist Enrico Vallini; top scorer Matteo Donati:17 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00005` | WARN | 18 | 11 | senior 1188..1298; youth 594..594; total 1782..1892 | 0 | 0 | 0 | structural 0; cash 851357732; wage 1.0000; free agents 0.2085; values 2018275..15000000000; renew/release/expiry 4832/119/940 | 13 | avg 38.40; min 32; max 61; low season 1; champion pts 61..79; last pts 18..31; ability spread 5.30->3.38; draw rate avg/max 0.230/0.270 | season 9; Como Calcio; Marko Kovacic; assists 10; team goals 46; top1 0.22; top3 0.41; top assist Marko Kovacic; top scorer Enrico Trevisan:19 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00008` | WARN | 18 | 11 | senior 1188..1295; youth 594..594; total 1782..1889 | 0 | 0 | 0 | structural 0; cash 824429149; wage 1.0000; free agents 0.2062; values 2677591..15000000000; renew/release/expiry 4828/93/967 | 14 | avg 42.30; min 31; max 55; low season 4; champion pts 60..79; last pts 23..35; ability spread 5.87->4.84; draw rate avg/max 0.230/0.280 | season 6; A.S. Trento; Marko Tadic; assists 9; team goals 43; top1 0.21; top3 0.39; top assist Luca Fabbri; top scorer Nico Greco:18 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00007` | WARN | 18 | 11 | senior 1188..1292; youth 594..594; total 1782..1886 | 0 | 0 | 0 | structural 0; cash 787854024; wage 1.0000; free agents 0.2043; values 2248741..15000000000; renew/release/expiry 4869/114/914 | 12 | avg 41.50; min 28; max 48; low season 9; champion pts 62..73; last pts 21..34; ability spread 6.11->4.00; draw rate avg/max 0.240/0.300 | season 9; A.S. Padova; Luca Amato; assists 11; team goals 47; top1 0.23; top3 0.43; top assist Luca Amato; top scorer Giorgio Vitali:19 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00002` | WARN | 18 | 11 | senior 1188..1295; youth 594..594; total 1782..1889 | 0 | 0 | 0 | structural 0; cash 703974750; wage 1.0000; free agents 0.2042; values 2798870..15000000000; renew/release/expiry 4851/108/916 | 12 | avg 43.20; min 35; max 48; low season 6; champion pts 66..77; last pts 19..36; ability spread 5.36->3.88; draw rate avg/max 0.220/0.260 | season 1; S.S. Modena; Nico Sorrentino; assists 10; team goals 48; top1 0.21; top3 0.45; top assist Davide Vallini; top scorer Giorgio Ferrari:18 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00001` | WARN | 18 | 11 | senior 1188..1287; youth 594..594; total 1782..1881 | 0 | 0 | 0 | structural 0; cash 848184094; wage 1.0000; free agents 0.2040; values 2996579..15000000000; renew/release/expiry 4844/108/922 | 14 | avg 38.80; min 26; max 50; low season 3; champion pts 61..77; last pts 25..36; ability spread 5.53->3.83; draw rate avg/max 0.240/0.280 | season 7; Perugia Calcio; Davide Zappa; assists 14; team goals 53; top1 0.26; top3 0.47; top assist Davide Valentini; top scorer Luca Zaccaria:18 | goals_per_match_avg, champion_streak, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00006` | WARN | 18 | 11 | senior 1188..1298; youth 594..594; total 1782..1892 | 0 | 0 | 0 | structural 0; cash 773358338; wage 1.0000; free agents 0.2015; values 2796068..15000000000; renew/release/expiry 4841/104/972 | 13 | avg 40.60; min 29; max 55; low season 8; champion pts 64..80; last pts 21..35; ability spread 5.82->4.84; draw rate avg/max 0.230/0.280 | season 8; A.S. Padova; Giorgio Cremonesi; assists 11; team goals 47; top1 0.23; top3 0.47; top assist Ibrahima Diop; top scorer Matteo Serra:16 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00010` | WARN | 18 | 11 | senior 1188..1294; youth 594..594; total 1782..1888 | 0 | 0 | 0 | structural 0; cash 770777124; wage 1.0000; free agents 0.2005; values 2651919..15000000000; renew/release/expiry 4852/91/944 | 13 | avg 43.00; min 33; max 62; low season 5; champion pts 60..88; last pts 21..33; ability spread 5.96->4.58; draw rate avg/max 0.230/0.270 | season 3; U.S. Rimini; Luca Trevisan; assists 11; team goals 47; top1 0.23; top3 0.40; top assist Luca Trevisan; top scorer Enrico Ferri:16 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00009` | WARN | 18 | 11 | senior 1188..1295; youth 594..594; total 1782..1889 | 0 | 0 | 0 | structural 0; cash 821497846; wage 1.0000; free agents 0.2001; values 3115637..15000000000; renew/release/expiry 4878/108/915 | 13 | avg 40.60; min 31; max 48; low season 1; champion pts 61..77; last pts 21..35; ability spread 5.99->4.46; draw rate avg/max 0.230/0.270 | season 7; Ascoli Calcio; Nico Martinelli; assists 13; team goals 64; top1 0.20; top3 0.44; top assist Nico Martinelli; top scorer Luca Carli:17 | goals_per_match_avg, champion_streak, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |
| `phase79c-three-division-short-world-00003` | WARN | 18 | 11 | senior 1188..1287; youth 594..594; total 1782..1881 | 0 | 0 | 0 | structural 0; cash 697084425; wage 1.0000; free agents 0.1950; values 2791175..15000000000; renew/release/expiry 4945/117/876 | 13 | avg 38.40; min 24; max 50; low season 3; champion pts 59..73; last pts 17..35; ability spread 5.70->4.56; draw rate avg/max 0.240/0.290 | season 3; U.S. Terni; Enrico Sorrentino; assists 10; team goals 44; top1 0.23; top3 0.55; top assist Luka Lukic; top scorer Davide Piras:18 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence | none |

## Production Warning Snapshots

| Seed | Top assist max | Creator snapshot | Warn checks |
|---|---:|---|---|
| `phase79c-three-division-short-world-00001` | 14 | season 7; Perugia Calcio; Davide Zappa; assists 14; team goals 53; top1 0.26; top3 0.47; top assist Davide Valentini; top scorer Luca Zaccaria:18 | goals_per_match_avg, champion_streak, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00008` | 14 | season 6; A.S. Trento; Marko Tadic; assists 9; team goals 43; top1 0.21; top3 0.39; top assist Luca Fabbri; top scorer Nico Greco:18 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00006` | 13 | season 8; A.S. Padova; Giorgio Cremonesi; assists 11; team goals 47; top1 0.23; top3 0.47; top assist Ibrahima Diop; top scorer Matteo Serra:16 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00010` | 13 | season 3; U.S. Rimini; Luca Trevisan; assists 11; team goals 47; top1 0.23; top3 0.40; top assist Luca Trevisan; top scorer Enrico Ferri:16 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00003` | 13 | season 3; U.S. Terni; Enrico Sorrentino; assists 10; team goals 44; top1 0.23; top3 0.55; top assist Luka Lukic; top scorer Davide Piras:18 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00005` | 13 | season 9; Como Calcio; Marko Kovacic; assists 10; team goals 46; top1 0.22; top3 0.41; top assist Marko Kovacic; top scorer Enrico Trevisan:19 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00009` | 13 | season 7; Ascoli Calcio; Nico Martinelli; assists 13; team goals 64; top1 0.20; top3 0.44; top assist Nico Martinelli; top scorer Luca Carli:17 | goals_per_match_avg, champion_streak, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00007` | 12 | season 9; A.S. Padova; Luca Amato; assists 11; team goals 47; top1 0.23; top3 0.43; top assist Luca Amato; top scorer Giorgio Vitali:19 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00002` | 12 | season 1; S.S. Modena; Nico Sorrentino; assists 10; team goals 48; top1 0.21; top3 0.45; top assist Davide Vallini; top scorer Giorgio Ferrari:18 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00004` | 11 | season 3; Pro Pescara; Luca Esposito; assists 9; team goals 41; top1 0.22; top3 0.41; top assist Enrico Vallini; top scorer Matteo Donati:17 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Dynasty Warning Snapshots

| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |
|---|---:|---|---:|---:|---:|---:|---|
| `phase79c-three-division-short-world-00009` | 6 | A.C. Lucca | 68..77 | 44.17 | 4 | transfer=1229; squad=2068 | goals_per_match_avg, champion_streak, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00001` | 5 | U.S. Vicenza | 72..76 | 43.20 | 3 | transfer=1184; squad=2038 | goals_per_match_avg, champion_streak, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00003` | 3 | A.S. Turin | 65..73 | 42.33 | 5 | transfer=1235; squad=2086 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00008` | 3 | Real Catania | 68..74 | 41.33 | 5 | transfer=1238; squad=2060 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00007` | 3 | S.S. Taranto | 64..72 | 40.00 | 5 | transfer=1243; squad=2092 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00010` | 2 | A.C. Siena | 73..88 | 53.50 | 5 | transfer=1212; squad=2037 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00004` | 2 | U.S. Padova | 59..69 | 39.50 | 5 | transfer=1238; squad=2045 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00002` | 2 | Pro Ascoli | 67..68 | 38.00 | 4 | transfer=1171; squad=1987 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00005` | 2 | Bologna Calcio | 61..63 | 32.00 | 4 | transfer=1201; squad=2083 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00006` | 1 | Pro Cosenza | 66..66 | 36.00 | 5 | transfer=1286; squad=2171 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Table Spread Warning Snapshots

| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |
|---|---:|---:|---:|---:|---:|---:|---|
| `phase79c-three-division-short-world-00003` | 38.40 | 24..50 | 59..73 | 17..35 | avg 0.240 max 0.290 | 5.70->4.56 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00005` | 38.40 | 32..61 | 61..79 | 18..31 | avg 0.230 max 0.270 | 5.30->3.38 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00004` | 38.60 | 28..49 | 59..75 | 20..38 | avg 0.230 max 0.260 | 5.84->4.38 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00001` | 38.80 | 26..50 | 61..77 | 25..36 | avg 0.240 max 0.280 | 5.53->3.83 | goals_per_match_avg, champion_streak, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00006` | 40.60 | 29..55 | 64..80 | 21..35 | avg 0.230 max 0.280 | 5.82->4.84 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00009` | 40.60 | 31..48 | 61..77 | 21..35 | avg 0.230 max 0.270 | 5.99->4.46 | goals_per_match_avg, champion_streak, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00007` | 41.50 | 28..48 | 62..73 | 21..34 | avg 0.240 max 0.300 | 6.11->4.00 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00008` | 42.30 | 31..55 | 60..79 | 23..35 | avg 0.230 max 0.280 | 5.87->4.84 | role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00010` | 43.00 | 33..62 | 60..88 | 21..33 | avg 0.230 max 0.270 | 5.96->4.58 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |
| `phase79c-three-division-short-world-00002` | 43.20 | 35..48 | 66..77 | 19..36 | avg 0.220 max 0.260 | 5.36->3.88 | goals_per_match_avg, role_coverage_warning_count, senior_active_player_population, youth_active_player_population, total_active_player_population, wage_budget_pressure_prevalence |

## Market And Economy Diagnostic Worlds

### Zero Permanent Completions Despite Recruitment Needs

| Seed | Needs | Recruitable | Targets | Offers | Completed | Lost reasons |
|---|---:|---:|---:|---:|---:|---|

### Highest Useful Free-Agent Stock

| Seed | Useful stock max | Free-agent share max |
|---|---:|---:|
| `phase79c-three-division-short-world-00008` | 18 | 0.2062 |
| `phase79c-three-division-short-world-00002` | 14 | 0.2042 |
| `phase79c-three-division-short-world-00007` | 13 | 0.2043 |
| `phase79c-three-division-short-world-00006` | 13 | 0.2015 |
| `phase79c-three-division-short-world-00004` | 11 | 0.2124 |
| `phase79c-three-division-short-world-00005` | 9 | 0.2085 |
| `phase79c-three-division-short-world-00001` | 9 | 0.2040 |
| `phase79c-three-division-short-world-00010` | 9 | 0.2005 |
| `phase79c-three-division-short-world-00003` | 9 | 0.1950 |
| `phase79c-three-division-short-world-00009` | 7 | 0.2001 |

### Broadest Wage Pressure

| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |
|---|---:|---:|---:|---:|
| `phase79c-three-division-short-world-00009` | 0.4278 | 0.0481 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00008` | 0.4204 | 0.0370 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00010` | 0.4167 | 0.0296 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00001` | 0.4074 | 0.0333 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00004` | 0.4019 | 0.0407 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00002` | 0.4000 | 0.0315 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00003` | 0.4000 | 0.0315 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00005` | 0.3852 | 0.0389 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00007` | 0.3815 | 0.0352 | 0.0000 | 1.0000 |
| `phase79c-three-division-short-world-00006` | 0.3759 | 0.0278 | 0.0000 | 1.0000 |

## Reproduction

Run the same gate with:

```bash
pnpm cli ten-season-report --seed-prefix=phase79c-three-division-short --worlds=10 --seasons=10 --report-output=docs/audits/GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_10X10_REPORT.md
```

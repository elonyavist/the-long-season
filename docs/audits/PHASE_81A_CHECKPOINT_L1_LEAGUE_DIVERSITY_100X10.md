# Phase 81A Checkpoint L1 - Canary Finding And Stopped Main Cohort

## Decision

**REFINE. The `100 x 10` cohort is stopped and produces no evidence.**

The locked `7 x 10` canary completed with seven workers. Its tactical gate was
already red, and human inspection then found a separate longitudinal player
lifecycle defect. The `35` main-profile world checkpoints written before the
stop are recoverable execution artifacts only. They are not a sample, are not
aggregated, and are not cited below.

## Population And Limits

- Population: `7` deterministic worlds, `10` seasons, `3` competitions of `18`
  clubs per world, `34` league matches per club-season.
- Retained player depth: top `10` scorers and top `10` assist providers per
  competition-season.
- The tables can observe the age, role, goals, assists, appearances and minutes
  of retained leaders. They cannot describe the complete age distribution of
  every scorer or substitute.
- The report path currently simulates league fixtures only. Its appearance
  counts are therefore league appearances, not all-competition workload.

## Automatic Tactical Result

The canary covered `210` competition-seasons and returned `REFINE`:

| Metric | Result | Frozen target |
|---|---:|---:|
| all-ten-role retention | `1.0000` | `>= 0.95` |
| six-formation retention | `1.0000` | `>= 0.95` |
| four replicated formations | `0.8667` | `>= 0.95` |
| top-share `<= 0.30` retention | `0.9905` | `>= 0.95` |
| maximum top formation share | `0.3333` | `<= 0.50` |
| fallback / missing source / missing ID / reconciliation | `0` | `0` |

Opening population passed in `17/21` competitions. Three failures contain a
catalog-order-sensitive tie repeated through the season; one exceeds the
opening `0.30` top-formation-share gate. The main run was not authorized to
turn these canary facts into a larger but equally red result.

## Longitudinal Age Finding

The drift begins after seasons `3-4`, as the owner observed in the HTML:

| Season | scorer mean age | scorer share `33+` | assist mean age | assist share `33+` |
|---:|---:|---:|---:|---:|
| 1 | `27.27` | `0.0%` | `27.33` | `0.7%` |
| 2 | `28.14` | `0.0%` | `28.07` | `0.0%` |
| 3 | `29.28` | `8.1%` | `29.22` | `7.7%` |
| 4 | `30.54` | `19.3%` | `30.04` | `13.9%` |
| 5 | `31.32` | `34.8%` | `30.64` | `29.1%` |
| 6 | `31.64` | `41.6%` | `31.20` | `41.5%` |
| 7 | `32.94` | `62.9%` | `32.35` | `55.6%` |
| 8 | `34.21` | `77.8%` | `33.25` | `67.4%` |
| 9 | `34.14` | `78.6%` | `33.71` | `77.8%` |
| 10 | `34.82` | `86.4%` | `33.93` | `76.5%` |

Every retained `33+` leader has exactly `34` appearances and `3060` minutes.
That impossible concentration is stronger evidence than the age mean alone: an
old exceptional striker is credible, but an entire elderly leader population
with perfect availability is not.

## Real-Football Reference

The comparison uses one complete, internally consistent season: the `2024/25`
Big Five player table, sourced from FBref and published with age, appearances,
goals and assists. For each league, the first ten rows after sorting by goals
(assists as tie-breaker) and by assists (goals as tie-breaker) were retained.
This is a reproducible descriptive reference, not a claim that a fictional
lower division must copy one elite league exactly. Source:
[FBref Big Five table](https://fbref.com/en/comps/Big5/2024-2025/stats/players/2024-2025-Big-5-European-Leagues-Stats),
[downloadable source-labelled dataset](https://www.kaggle.com/datasets/hubertsidorowicz/football-players-stats-2024-2025/data).

| League | top-10 scorer mean | scorers `33+` | top-10 assist mean | assists `33+` |
|---|---:|---:|---:|---:|
| Bundesliga | `25.50` | `0/10` | `26.70` | `1/10` |
| Premier League | `26.20` | `0/10` | `26.60` | `0/10` |
| La Liga | `28.70` | `3/10` | `27.20` | `2/10` |
| Ligue 1 | `24.40` | `1/10` | `23.70` | `0/10` |
| Serie A | `26.20` | `0/10` | `24.90` | `0/10` |
| all fifty | **`26.20`** | **`8%`** | **`25.82`** | **`6%`** |

Older elite outliers are real. The same La Liga scorer table contains
Lewandowski (`35`), Budimir (`33`) and Kike (`34`), but also Mbappe (`25`),
Julian Alvarez (`24`) and Sancet (`24`). The assist table spans Yamal (`17`) to
Rodriguez (`36`). The defect is therefore not “nobody may excel after 32”; it is
the disappearance of the mixed peak-age population.

Independent research places the usual male professional peak around `25-27`,
with forwards tending to peak earlier, while exceptional individual careers can
peak later. See [Dendir, *When do soccer players peak?*](https://journals.sagepub.com/doi/10.3233/JSA-160021),
the [award-nomination age study](https://pmc.ncbi.nlm.nih.gov/articles/PMC8182689/),
and the [2025 physical aging-curve study](https://pmc.ncbi.nlm.nih.gov/articles/PMC12551122/).

## Code Attribution Before Any Tuning

The finding has multiple cooperating owners:

1. `simulateSeason(...)` calls `simulateMatch(...)`, records the report, spends
   fitness and proceeds. It never calls
   `applyMatchAvailabilityConsequences(...)`, even though the ordinary
   fixture-by-fixture career path already does. Match injuries therefore exist
   inside a fixture but cannot remove a player from a later batch fixture.
2. `DEFAULT_FITNESS_RULES` spends `8` per appearance and recovers `5` per rest
   day. A normal weekly interval restores more than a full match cost, so the
   fixture selector sees the same starter at full fitness.
3. `aiSelectedMatchTeamContext(...)` correctly chooses from the players it is
   given, but that input contains no fieldability/availability filter. It is not
   the selector's job to invent an absence.
4. The selector already owns `boundedRecentUseModifier(...)`, worth as much as
   `-1.65`, and ordinary career AI supplies it through
   `recentUseForFixture(...)`. The batch path bypasses that canonical entry and
   never supplies `recentUse`, so every candidate reads zero workload even
   after starting the previous three matches.
5. `monthlyDeclineFor(...)` begins outfield physical decline at `32`; technical
   decline starts at `34` for attackers, `35` for defenders and `36` for
   midfielders, with physical attributes floored at `7`.
6. `monthlyOpportunityMultiplier(...)` reaches its maximum at `450` monthly
   minutes. The always-selected incumbent receives full development opportunity
   while the reserve receives none, reinforcing the initial ranking.
7. High-quality outfield players retire automatically only at `37`; the earlier
   exit branches apply mainly to already-low ability players. This is credible
   in isolation but amplifies the missing rotation and weak decline.

Professional-football injury research defines injuries through future
time-loss and finds minor `1-3` day injuries the most common, with match injury
incidence far above training incidence. That supports carrying existing match
events forward; it does not support adding an arbitrary “old-player injury”
roll. See the [systematic review and meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC9929604/)
and the [UEFA Elite Club Injury Study](https://www.uefa.com/news-media/news/02a7-2127f03f93eb-9c1369d44100-1000--uefa-elite-club-injury-study-25-years-of-protecting-players/).

## Adopted Direction

Do not start by making old players randomly worse. First connect the canonical
availability consequence already used by career fixtures to the batch-season
path, preserve suspensions and return dates, and make AI selection consume the
fieldable roster. Then rerun the same canary and measure appearances and leader
ages. Only residual age drift after that attribution may reopen aging,
development, retirement or transfer replacement policy.

Transfer presentation is corrected independently: canonical JSON retains
integer EUR minor units; HTML formats them as euros and shows the buyer and
seller divisions captured at the transfer boundary.

## Accepted Post-Review Amendment: Two Independent Owners

Further analysis requested by the project owner does not rewrite the L1
decision. It deepens the owner attribution before remediation begins.

The `420` scorer/assist leaderboard positions retained per season are still
`395/420` (`94.0%`) opening-population players in season ten; only `25/420`
belong to academy/youth intake and none to senior intake. Therefore
availability and recent use can correct perfect `34/34` schedules but cannot by
themselves establish generational renewal.

The accepted plan now has two separately gated streams: canonical progressive
match/substitution/availability/load behaviour, followed by an attribution of
generation, development, promotion, AI selection and market replacement. The
full research, product decisions and rejected shortcuts are in
[`PHASE_81A_AVAILABILITY_AGING_AND_GENERATIONAL_RENEWAL_PREREQUISITE.md`](PHASE_81A_AVAILABILITY_AGING_AND_GENERATIONAL_RENEWAL_PREREQUISITE.md).

# Phase 81A - Availability, Aging And Generational Renewal Prerequisite

## Thesis

Checkpoint L1 exposed two independent defects, not one aging coefficient that
can be tuned in isolation:

1. automatic seasons do not exercise canonical in-match AI substitutions and
   therefore overstate starts, appearances and full-match minutes;
2. the initial player population remains overwhelmingly dominant after ten
   seasons, so making veterans more tired cannot by itself create new leading
   players.

The accepted remedy is consequently split. Match credibility owns actual
minutes, substitutions, availability, recent load and soft age-dependent
recovery. Career credibility owns development, promotion and replacement of the
opening generation. Neither stream may claim the other stream's outcome.

## Accepted Product Decisions

The project owner accepted all three decisions on 2026-08-08:

- automatic report and background simulations let the existing AI manage both
  teams' in-match decisions; in a played match the manager's team remains
  manual unless a future explicit delegation feature is added;
- aging is a soft modifier mediated by load, recovery and physical resilience,
  never a hard age bracket or a direct penalty to goals and assists;
- generational renewal is in scope now because the ten-season defect cannot be
  corrected honestly through fatigue alone.

Training injuries remain outside the MVP. The first implementation measures and
calibrates match exposure only.

## Real-Football Reference

The `2024/25` Big Five reference retains the top ten scorers and top ten assist
providers from each league. Its pooled means are `26.20` for scorers and `25.82`
for assist providers; the `33+` shares are `8%` and `6%`. Older elite outliers
are real, but they coexist with a large `23-27` population. Source:
[FBref Big Five player table](https://fbref.com/en/comps/Big5/2024-2025/stats/players/2024-2025-Big-5-European-Leagues-Stats).

UEFA's `2024/25` top-20-league landscape reports `4.4` substitutions per club
per match, an average first substitution at minute `56`, and `93%` tactical
substitutions. Players aged `30+` account for about `20%` of domestic league
minutes, compared with `46%` for ages `24-29`. Source:
[UEFA European Club Talent and Competition Landscape](https://editorial.uefa.com/resources/029d-1ebb1aaaa7ca-fb6fe27d6835-1000/uefa_european_club_talent_and_competition_landscape_15_09_25_lowres.pdf).

IFAB Law 3 permits up to five substitutions; it does not prescribe a minimum.
The engine therefore targets a population distribution, not a scripted minimum
per team. Source: [IFAB Law 3](https://theifab.com/laws/latest/the-players/).

Post-match mechanisms can remain impaired for at least `72` hours even when
some physical performance measures recover after `48` hours. Professional
players aged at least `30` show reduced distance, high-intensity running,
sprinting and maximum speed; aging does not imply that technical output must be
directly reduced. Sources:
[post-match recovery review](https://bmjopensem.bmj.com/content/4/1/e000264),
[age and match-performance study](https://pubmed.ncbi.nlm.nih.gov/31268996/).

The professional-men meta-analysis reports `36` match injuries per `1000`
player exposure hours and identifies minor time-loss injuries as the most
common category. This is a calibration reference, not permission to invent
training exposure that the game does not simulate. Source:
[injury epidemiology meta-analysis](https://pubmed.ncbi.nlm.nih.gov/31171515/).

## Canary Re-analysis

The committed L1 artifact retained `420` leaderboard positions in each season:

```text
7 worlds x 3 competitions x (10 scorers + 10 assist providers) = 420
```

Classification by stable player ID gives:

| Season | opening-population rows | academy/youth rows | senior-intake rows |
|---:|---:|---:|---:|
| 1 | `420` | `0` | `0` |
| 4 | `420` | `0` | `0` |
| 7 | `406` | `14` | `0` |
| 10 | `395` (`94.0%`) | `25` (`6.0%`) | `0` |

Rows are leaderboard occupancy, not unique-player counts. That is the correct
denominator for the observed claim: who occupies the visible top-performer
tables after ten seasons. At season ten, `52/210` scorer rows and `19/210`
assist rows are occupied by a player who was also retained in season one, but
the stronger fact is that almost all leaders still originate in the opening
population even when their exact ranking changed.

The development section also moves world-average current ability from roughly
`9.30-9.37` to `8.15-8.29`. That does not prove which lifecycle stage is wrong:
generation, development, academy promotion, AI selection and market replacement
remain separate candidate owners. It does require an attribution checkpoint
before any one of them is tuned.

## Code Diagnosis

- `simulateSeason(...)` currently enters `simulateMatch(...)` directly. The
  progressive AI decision loop exists, but the automatic season does not use it.
- current fitness spends `8` per selected starter and recovers `5` per calendar
  day. It ignores actual minutes and age. A seven-day interval restores `35`,
  so changing an older player's cost from `8` to `15` or `20` alone still
  returns him to `100` before the next ordinary fixture.
- match-relative condition already falls minute by minute and already feeds
  control, discipline, injury risk and the existing substitution policy.
- match injury risk already reads physical resilience and current condition.
  The first correction should therefore connect real starting fitness and
  accumulated load, not add an age-only injury roll.
- player participation already owns exact starter/substitute contributions and
  the ordinary career already owns availability consequences and recent-use
  selection. Shared derivations move to one owner; no report-only formula or
  compatibility wrapper is allowed.

## Rejected Shortcuts

- Directly reduce scoring or assist probability after age `30`.
- Guarantee exactly two or three substitutions per team per match.
- Raise full-match cost while retaining flat `5`-per-day recovery.
- Add more random injuries before canonical availability is connected.
- Make every veteran uniformly worse regardless of stamina and physical state.
- Tune youth curves merely until the season-ten age table turns green.
- Resume the stopped `100 x 10` shards after gameplay behaviour changes.

## Authorized Sequence

```text
06B1 canonical automatic progressive match and substitutions
06B2 Checkpoint L2: substitution and minute truth
06B3 canonical availability and minute-weighted workload
06B4 soft age resilience and recovery
06B5 Checkpoint L3: availability, aging and match injuries
06B6 Checkpoint L4: generational-succession attribution
06B7 correction owned by the L4 result
06B7A canonical low-detail academy participation
06B7B Checkpoint L4.1: youth-minute pathway
06B8 Checkpoint L5: integrated 7 x 10 JSON + HTML
06B main 100 x 10 only after L5 GO
```

Every checkpoint cohort uses exactly seven workers and runs alone. The
integrated HTML remains English, desktop-only and derived from canonical JSON.
No new report entrypoint is introduced: every measurement is a module or locked
profile of `pnpm cli simulation-report`.

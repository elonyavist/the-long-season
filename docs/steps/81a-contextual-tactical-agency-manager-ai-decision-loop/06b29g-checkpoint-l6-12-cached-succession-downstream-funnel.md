# Step 06B29G - Checkpoint L6.12 Cached Succession Downstream Funnel

## Status

Done - `STOP / RETHINK`. The first execution exposed an invalid season-boundary
join; its apparent owner is rejected and no gameplay step opens.

## Goal

Locate the first downstream failure after L6.11 successfully changed who was
acquired. This is observation-only: it reads the already completed L6.11
candidate checkpoints and cannot simulate or change gameplay.

## Frozen Cohort And Unit

- profile `phase81a-succession-downstream-funnel-l6-12-cached`;
- read-only reuse of the seven L6.11 candidate worlds, ten seasons each;
- exactly one row per distinct `(world, buying club, acquired player)`, using
  the earliest fulfilled role-succession episode in seasons `1..8`;
- include only career-generated players aged `21..29` at acquisition;
- seasons `9..10` are excluded from the cohort because they do not expose a
  complete two-season downstream window;
- stable IDs join episodes, origin, player use, player-season ability and the
  canonical season-ten leader set. Names never join evidence.

## Frozen Terminal Stages

Classify each row once, in this order:

1. `season_ten_leader`: the player reaches the canonical season-ten leader set;
2. `no_buyer_appearance`: zero appearances for the buying club in acquisition
   season plus the following season;
3. `below_450_buyer_minutes`: appearances exist but buyer-club minutes over the
   same window are below `450`;
4. `not_retained_two_seasons`: no buyer-club player-season row exists two
   seasons after acquisition;
5. `below_half_ability_growth`: retained, but current ability two seasons later
   is less than acquisition ability plus `0.5`;
6. `developed_not_leader`: retained and developed, but not a season-ten leader.

The ordering makes the buckets mutually exclusive. A leader is success even if
he later changed club; the remaining stages locate why non-leaders failed the
club-local path.

## Decision

- zero eligible rows, duplicate keys, missing origin/player/use facts or cached
  profile mismatch: `STOP_RETHINK`;
- one non-success terminal stage at `>= 0.50` of eligible rows:
  `OWNER_IDENTIFIED` for that stage;
- otherwise `MIXED` and no product owner opens.

Every stage must be reachable on the real cached cohort to be used as a future
gate. An unreachable stage stays diagnostic and cannot justify a correction.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/report-registry.ts`, planner test and
  `packages/i18n/src/labels.ts`;
- 06B29F, this document, audit/index, Phase README and status.

The L6.11 analysis switches are removed from engine, career advancement and CLI
in the same step. No gameplay, content, persistence, web or HTML change.

## Outcome - 2026-08-12

The cached run completed deterministically on the declared seven worlds and
wrote SHA-256
`411ab110719318a359d0f9ab84e6b24ad7642d90cee69cdffde03acba316f87a`.
Its printed `OWNER_IDENTIFIED: below_half_ability_growth` is **not evidence**:
the denominator was one player.

Reading the production boundary after that result explained the collapse.
`renewalNeedEpisodesForSeason(...)` receives lifecycle facts from
`observeSeasonAdvancement(...)`. A transfer fulfilled in season `N` therefore
lands between the closing season-`N` player snapshot and the first season the
buyer can field him, `N + 1`. The frozen L6.12 join instead required the
season-`N` row to belong to the buyer. On the real cache:

- `3,729` fulfilled episodes existed, `2,582` in seasons `1..8`;
- `2,488` distinct `(world, buyer, player)` keys existed;
- `2,457` were silently excluded because the season-`N` row still named the
  seller or another pre-boundary owner;
- only one career-generated prime-age row survived the mistaken buyer check.

This is a correctly detected instrument failure, not a development finding.
L6.12B replaces the live profile and shifts only the downstream observation
window: acquisition facts stay on the unique season-`N` row, while buyer use
and retention begin in `N + 1`. The old profile and its misleading evaluator
path are removed rather than retained as compatibility residue.

## Verification

- cached report completed with the hash above;
- the raw cache reconciliation found zero missing season rows and zero missing
  origins, isolating the defect to the temporal ownership assertion;
- no product or calibration value changed;
- next: [06B29H - Checkpoint L6.12B](06b29h-checkpoint-l6-12b-season-boundary-succession-funnel.md).

# Phase 80A Prospect, Environment And Player-Economy Design Contract

## Status

Accepted on 2026-07-30 after direct product review and a one-question-at-a-time
design interview. Amended the same day after the ownership/value audit to
separate intrinsic value from every club context and to declare a new,
non-comparable calibration epoch. This document is the product contract for
Phase 80A; exact coefficients that are not listed here must be calibrated from
deterministic evidence rather than invented during implementation.

## Player-Facing Goal

Make young-player discovery and development one of the main reasons to keep
playing:

- a promising teenager can become a major player without being guaranteed to;
- strong clubs produce and develop more talent without owning every future
  star;
- minutes, performances, age, and club environment remain meaningful;
- public potential communicates probable growth and uncertain upside honestly;
- the same public projection drives both the manager's decisions and AI clubs;
- player values reward good identification and development without making an
  undeveloped ceiling-six teenager worth an established superstar's price.

## Current Defects Confirmed Before The Contract

- The shared star renderer can distinguish achieved, conservative, and
  uncertain segments, but current young-player projections usually provide too
  little visible upside for that language to appear.
- In a deterministic 20-world inspection, only `11 / 1,710` age-17 players
  exposed at least one full public star of upside.
- Young stored-six prospects in that sample began at `1..2.5` current stars;
  the accepted serious-prospect examples require credible `2..3.5` starting
  levels conditioned by age and club context.
- The current outfield `0..17` projection exposes only `30.76%` of stored
  ceiling room.
- `playerRealizationModifier` derives one stable hidden modifier from player
  identity. That is a permanent hidden predisposition and conflicts with the
  accepted rule that no player is secretly predestined to realize a fixed
  share of their ceiling.
- Monthly participation and match ratings already exist. Goal scorers receive
  a rating lift, and development already consumes real minutes and average
  match performance.
- Annual youth intake and academy refill already exist. Phase 80A recalibrates
  their quality and world allocation; it does not invent a second intake.
- The current valuation policy applies both category/free-agent multipliers and
  category/free-agent maximums through `marketContext`. That makes intrinsic
  public value depend on the player's owner or employment state and must be
  removed rather than neutralized behind compatibility coefficients.

## Global Rating And Potential Truth

- Current rating and public potential use the global `1..6` half-star scale.
- Stored potential is a hard ceiling, not a promised destination.
- No permanent hidden “will become X stars” target is stored.
- Development may finish materially below the stored ceiling.
- Reloading cannot reroll development: every stochastic input is derived from
  stable world/player/season/month keys.
- The public potential strip has three factual bands:
  1. current/achieved rating;
  2. statistically probable development endpoint (`P50`);
  3. uncertain reachable upside (`upper`).
- The `P50` band is not guaranteed. It is the median outcome of the applicable
  deterministic development evidence.
- The stored ceiling is never exposed as a number and is never exceeded.
- UI and valuation consume the same canonical current/P50/upper assessment.

## Architecture Ownership

Phase 80A deepens the existing public-assessment Module instead of leaving
projection knowledge spread across UI, valuation, and AI callers.

- `derivePublicPlayerAssessment(...)` is the single live-game Interface for
  current, P50, reachable upper, and their half-star presentation facts.
- The live Interface does not expose stored ceiling. Generation, development
  hard caps, projection derivation, and diagnostics may receive stored ceiling
  through narrower internal or diagnostic inputs.
- UI read models, sorting, intrinsic public value, player willingness, and live
  AI targeting consume the returned assessment. They do not call
  `derivePlayerPotentialProjection(...)` independently or rebuild rating bands.
- Deprecated/legacy overloads that accept an unlabelled ceiling are removed;
  beta compatibility does not justify two public-assessment Interfaces.
- `derivePlayerValuation(...)` consumes the canonical public assessment plus
  intrinsic player facts. It does not receive `CareerState`, owning club,
  employment kind, seller posture, or stored ceiling.
- Seller asking price remains a separate Module that may consume explicit
  seller/contract context without changing intrinsic public value.

The season development environment is derived, not duplicated:

- durable state owns the season-frozen competitive tier, current reputation,
  and the stamped configuration version;
- `deriveClubDevelopmentEnvironment(...)` maps the frozen category/tier facts
  through the versioned matrix;
- no second persisted environment history or independently mutable environment
  field is introduced;
- save/reload must reproduce the same environment from the same durable facts.

Quarterly development reuses the existing ordered monthly participation ledger
and its closed-month keys. It must not add a second persisted quarterly
checkpoint ledger.

## Public Star Language

- Achieved slots use the exact current-Level color.
- Probable future slots use a lighter solid yellow.
- Uncertain upside uses a lighter patterned yellow.
- Sixth-star achieved/probable/uncertain segments use the corresponding
  dark/light/patterned orange language.
- Empty slots retain neutral outlines.
- Shape/pattern and accessible text carry the distinction; color alone is not
  sufficient.

## Age-Aware Public Upper

For outfield players:

| Age | Public upper contract |
|---|---|
| 15–17 | Full still-reachable stored ceiling |
| 18–20 | Full still-reachable stored ceiling |
| 21–24 | Progressive narrowing |
| 25–27 | Strong narrowing |
| 28+ | Coincides with achieved current level |

For goalkeepers:

| Age | Public upper contract |
|---|---|
| 15–20 | Full still-reachable stored ceiling |
| 21–24 | Almost full |
| 25–27 | Progressive narrowing |
| 28–31 | Strong narrowing |
| 32+ | Coincides with achieved current level |

Exact `P50` and upper realization factors are calibrated separately by role
family and age band from deterministic development outcomes. For each role
family, public uncertainty must not widen as age advances at equal current
rating and stored room.

## Development Cadence And Inputs

- Match statistics, minutes, and ratings are recorded after every committed
  fixture.
- Participation remains stored in monthly rows.
- One development command consumes up to three completed monthly rows every
  three months, reducing state-copy/orchestration work without discarding
  monthly facts.
- A season-end flush consumes any completed residual months.
- Each row uses the player's age at that monthly checkpoint.
- The batch result must equal processing the same monthly rows sequentially.
- Attributes, public P50/upper, and public market value become observable
  together after the quarterly development checkpoint.
- The UI does not show a “next development update” countdown.
- Positive development is driven primarily by:
  1. age curve;
  2. real minutes;
  3. real match performance;
  4. bounded club environment;
  5. player/season/month deterministic variance.
- A big-club reserve must develop less than a regular lower-division starter
  when the latter has materially better minutes and performance.
- No growth is awarded merely because a player is young, has a large ceiling,
  transfers to a larger club, or goes on loan.

## Dynamic Club Competitive Tier

Every division currently contains 18 clubs. At season rollover, rank clubs
deterministically within their new division, then freeze the resulting tier
for the next season:

| Rank | Tier |
|---:|---|
| 1–4 | `title_contender` |
| 5–8 | `playoff_contender` |
| 9–14 | `mid_table` |
| 15–18 | `survival` |

In the first division, `playoff_contender` means the group competing for
continental-cup qualification. In lower divisions it means promotion-playoff
contention.

The ranking score uses approximately:

- `70%` current roster strength, including best XI plus useful bench depth;
- `30%` the just-completed sporting result, corrected for promotion,
  relegation, and title outcomes.

Stable club ID is the final tie-breaker. The exact normalized formula must be
documented and tested before implementation; thresholds may not be selected
after inspecting the final long run.

## Reputation Without Historical Ledger

- Do not add a reputation-history collection.
- Current reputation is the only durable memory.
- At rollover, derive a target from new category, frozen competitive tier, and
  the just-completed promotion/relegation/title/result facts.
- Move current reputation toward the target by at most `2` points per season.
- Promotion does not instantly turn a club into an established first-division
  power; repeated performance changes reputation progressively.

## Seven Development Environments

Public environment states and exact positive-growth multipliers:

| State | Multiplier |
|---|---:|
| Molto carente | `0.92` |
| Carente | `0.95` |
| Limitato | `0.98` |
| Adeguato | `1.00` |
| Buono | `1.03` |
| Ottimo | `1.06` |
| Eccellente | `1.10` |

Category/tier matrix:

| Category | Survival | Mid-table | Playoff | Title contender |
|---|---|---|---|---|
| Serie C | Molto carente | Carente | Limitato | Adeguato |
| Serie B | Carente | Limitato | Adeguato | Buono |
| Serie A | Adeguato | Ottimo | Eccellente | Eccellente |

The inputs to the environment are recalculated at rollover and frozen for the
season; the environment itself is derived from those facts and the stamped
policy. Serie A playoff and title-contender clubs intentionally share
`Eccellente`; their sporting, financial, roster, and reputation differences
remain separate. Future facilities and staff may extend the same derivation
Interface when those systems exist, but no speculative input or persisted
environment history is added in Phase 80A.

## Prospect Generation By Football Context

Club context is a generation signal, not a magical ceiling modifier after a
transfer.

Accepted ceiling bands:

| Origin | Interesting | Serious prospect | Rare prodigy |
|---|---|---|---|
| Serie C | `2.5..3.5` | `3.5..4` | `5..6` |
| Serie B | `3..3.5` | `3.5..4.5` | `5..6` |
| Serie A | `3.5..4` | `4..5` | `5.5..6` |

Accepted current-rating guardrails for rare prodigies:

| Age | Serie C | Serie B | Strong Serie A club |
|---|---|---|---|
| 15–17 | `2..3` | `2.5..3` | `2.5..3.5` |
| 18–20 | `2.5..3.5` | `3..4` | `3.5..4.5` |

Routine and good-prospect bands remain role-, age-, division-, and tier-aware
and must be calibrated around these guardrails without turning every young
player into a prospect.

Target share of active age-15-to-20 players with stored ceiling at least
`3.5`:

| Current category | Calibration band |
|---|---:|
| Serie C | `4%..8%` |
| Serie B | `8%..15%` |
| Serie A | `15%..25%` |

These are game calibration bands, not claims that hidden real-world potential
is directly observable. Environment/tier may move a club within its category
band. The bands are measured with positive denominators and may not be weakened
after the final cohort.

## Exceptional-Player Stock

For the current one-country world:

- `2..3` already-established current six-star champions aged over `20` in
  credible first-team slots at strong first-division clubs;
- `4..5` active players aged `15..20` with stored ceiling six across the
  entire national world;
- at most one of those young ceiling-six players is outside Serie A;
- remaining young ceiling-six players belong to strong Serie A clubs;
- at most one young ceiling-six player per club;
- none is guaranteed to realize six stars.

The established and young cohorts are disjoint by age. The resulting national
stored-ceiling-six stock is therefore normally `6..8`: every current-six
champion necessarily has a stored ceiling of at least six, in addition to the
`4..5` young ceiling-six prospects.

The `4..5` stock counts senior squads, academies, free agents, and loaned
players together. Annual intake tops up the stock only after age progression or
exit creates room; it does not generate four or five new ceiling-six players
each year, and it never deletes or downgrades an existing player to satisfy a
budget.

Code comments/JSDoc at the world-allocation composition root must state that a
future five-country world invokes this national policy once per country. The
current one-country generator must not multiply the budget by five.

The Phase 79D `302 / 100 worlds` stored-ceiling-six observation remains valid
historical evidence for the old generator only. It is intentionally
non-comparable after this stock contract and must not be reused as an 80A
acceptance threshold.

## Annual Youth Intake

- Every club has one annual intake/refill; the existing academy lifecycle is
  extended rather than duplicated.
- Intake quality uses the frozen environment as a bounded probability nudge
  for interesting and serious prospects.
- Environment never grants a minimum star result and never bypasses the world
  exceptional-stock budget.
- A lower-division club can produce a rare phenomenon, but it remains an
  exceptional allocation.
- Age-out, promotion, external move, release, and retirement remain explicit
  lifecycle facts.

## Market Value And Asking Price

Public value represents intrinsic football-market value and uses:

- current global rating;
- `P50` expected development, not full upper;
- age;
- uncertainty width/risk discount;
- bounded role scarcity;
- source-backed global curves recalibrated under the Phase 80A epoch;
- one rare, eligibility-gated global `€150m` public-value cap.

`marketContext` is removed from the public-valuation input and policy. There
are no owner-division, club-category, or free-agent multipliers and no
per-context maximums. A transfer, promotion/relegation, contract expiry, or
free-agent transition alone must not change public value. A free agent keeps
the same intrinsic public value while the transfer fee remains exactly zero.
Do not retain neutral `1.0` context coefficients, context aliases, or fallback
branches.

Asking price is separate and may use:

- public value;
- category and seller context;
- contract security;
- squad importance and depth;
- seller finances and willingness;
- explicit `in vendita` posture once Phase 80B exists.

An undeveloped teenager with upper six can be valuable but is not priced as a
guaranteed six-star champion. Exact `€150m` remains reserved for an eligible,
rare, young current six-star player under the existing cap contract.

## Calibration Epoch And Division Evidence

Removing context multipliers and maximums invalidates the Phase 79C
per-division public-value output bands as acceptance thresholds. Phase 80A
Step 01 must:

- preserve the old curves, context factors, maximums, output bands, commands,
  and hashes as the pre-change baseline;
- declare those Phase 79C output tolerances superseded before implementation;
- use the already documented real-market sources to freeze new global curves
  and division population output bands before Step 08 changes behavior;
- keep division/category distributions as diagnostic outputs, never inputs to
  intrinsic public value;
- require any category differences to emerge from the generated player-quality
  population and asking-price behavior rather than a valuation context factor.

The new bands may not be selected or weakened after inspecting the final
post-change cohort.

## AI Information Fairness

- Live AI market decisions consume the same current/P50/upper facts visible to
  the manager.
- AI may not read stored ceiling to choose targets or price offers.
- Clubs differ through needs, finances, reputation, category, and risk
  appetite—not privileged knowledge.
- Stored ceiling remains available only to generation invariants, development
  hard caps, canonical public-projection derivation, and diagnostics; public
  valuation and live AI receive only the derived public assessment.

## Beta Save Policy

This phase intentionally invalidates beta saves when durable club/projection
facts or calibration versions change:

- bump the canonical save/config version once at the owning step;
- delete incompatible browser/CLI beta saves;
- do not add compatibility branches, fallback coefficients, or migration
  debris;
- keep historical season statistics only when they are part of a newly
  generated compatible career, not as a workaround for deleted saves.

## Required Diagnostics

Before Phase 80A closes, deterministic diagnostics must report positive
observation counts for:

- age/current/P50/upper/stored-ceiling joint profiles;
- non-widening public uncertainty by role family;
- current and ceiling distribution by age/category/tier/archetype;
- `3.5+` prospect shares by category;
- established current-six and young ceiling-six stock;
- young ceiling-six placement outside Serie A and per club;
- annual intake production versus active stock;
- quarterly versus sequential-month development equivalence;
- growth by age/minutes/performance/environment;
- public value/P50/uncertainty relations, division population outputs, and
  exact `€150m` eligibility;
- identical public value for the same player before/after owner category,
  promotion/relegation, transfer, expiry, and free-agent changes;
- exact zero transfer fee with unchanged non-zero public value for free agents;
- AI target decisions proven not to consume stored ceiling.

No `50 x 20` belongs to Phase 80A. Bounded deterministic matrices and
small/mid-size cohorts establish correctness; the single longitudinal
`50 x 20` runs only in Phase 80C after the final competitive-market behavior
exists.

## Explicit Non-Goals

- No scouting fog, fake observed attributes, or staff-derived uncertainty.
- No facilities/staff implementation.
- No five-country runtime topology.
- No permanent hidden realization trait.
- No per-match ability mutation.
- No development countdown in UI.
- No guaranteed potential floor.
- No long run, threshold weakening, or tuning to make warnings disappear.

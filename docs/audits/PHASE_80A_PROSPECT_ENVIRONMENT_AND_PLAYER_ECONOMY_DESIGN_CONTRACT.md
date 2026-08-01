# Phase 80A Prospect, Environment And Player-Economy Design Contract

## Status

Accepted on 2026-07-30 after direct product review and a one-question-at-a-time
design interview. Amended the same day after the ownership/value audit to
separate intrinsic value from every club context and to declare a new,
non-comparable calibration epoch. Reopened on 2026-08-01 after canonical
Step 09 evidence and product screenshots exposed three distinct defects: a
missing stored-upside contract for genuine young prospects, a coarse public
projection cliff after age `20`, and a valuation inversion where wider public
upside could reduce value. This document is the product contract for Phase
80A; exact coefficients that are not listed here must be calibrated from
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
- The first canonical Step 09 evidence and follow-up product inspection show
  that generation can produce age-`15..20` genuine prospect lanes with no full
  stored star between current and ceiling. This is a joint-generation defect,
  not a renderer defect.
- The first post-change projection groups ages `21..24` behind one upper
  factor. An outfield player can therefore move from the full stored upper at
  age `20` to roughly one quarter of the remaining room at age `21`, then keep
  the same factor through age `24`. The product-approved full-upper rule
  through `20` remains; the flat older band does not.
- The deterministic outcome matrix starts its player on 1 August but its first
  yearly loop currently emits January-to-December rows for that same year.
  January through July are consequently evaluated at `startAge - 1`. Exact-age
  calibration must first use twelve consecutive monthly checkpoints beginning
  at the matrix start month; no coefficient may be frozen from the
  retroactive-month sample.
- The first post-change valuation discounts the whole public expected value as
  the visible `P50 -> upper` interval widens. At equal current and P50, a
  better upper can consequently reduce public value. Public upside must be a
  positive but bounded option, never a haircut on already priced ability.

## Step 01 Evidence Identity

The historical `11 / 1,710` age-17 inspection did not retain its seeds,
command, output hashes, repository state, or exact age helper. It remains valid
defect-discovery evidence but is not a replay contract and must not be
reconstructed from memory.

The canonical pre-change evidence is now the 20-world sample in
`PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_BASELINE.md`, with seed
prefix `phase80a-prechange-baseline`, one-based world suffixes `00001..00020`,
explicit positive denominators, and per-world hashes. It independently records
`11 / 1,723` age-17 players with at least one full public star of upside. Later
comparisons use that named baseline, not the unrepeatable `1,710` denominator.

The Step 01 pre-change baseline records the historical projection's
`365.2425`-day approximation because evidence must preserve the implementation
it measured. From Step 05 onward, canonical Phase 80A age buckets use completed
civil years on the exact Gregorian birthday. Day-count divisors such as `365`
or `365.2425` are not live alternatives and no gate may combine denominators
produced before and after this corrected age epoch.

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
family and age from deterministic development outcomes. `P50` is the rounded
type-7 median realization share for its positive-denominator pooled cell. The
five outfield streams use a frozen conventional 4-4-2 composition of two
defenders, two midfielders, and one attacker. They must not clone whichever
non-goalkeeper happens to appear first in generated order: the engine keeps a
midfielder-only age-26 growth branch, so a single full-back template is not a
causal sample of the whole outfield family. Goalkeeper streams remain in their
own family. The
two product-mandated young bands may remain `15..17` and `18..20`,
because both intentionally expose the full stored upper. From age `21` until
the family terminal age, every completed age owns an explicit calibrated
factor; one flat `21..24` or `25..27` implementation band is forbidden. The
starting upper factor at each exact older age is the corresponding type-7 P90
realization share before the age-narrowing invariants are applied. For each
role family, the complete current-to-upper reachable-upside envelope must not
widen as age advances at equal current ability and stored room. This invariant
is deliberately not the visual `P50 -> upper` interval: P50 and upper are
calibrated from separate percentiles, so that visible interval remains
evidence and may differ between adjacent ages without weakening the total
age-narrowing contract. The visible `20 -> 21` boundary is an explicit product
consequence of keeping the full upper through age `20`; it must be measured and
reported, not disguised by a second undocumented smoothing rule.
The terminal ages are hard deadlines for equality with current, not a mandate
to invent non-zero upside immediately before them. An evidence-derived P50 or
P90 may reach zero earlier; once zero, it remains zero for older ages.

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
- Each monthly participation row owns minute-weighted club provenance. The
  environment input is weighted from those recorded minutes, not looked up
  from the player's club at the later quarterly checkpoint; a transfer must
  not retroactively change development already earned elsewhere.
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

The band is not necessarily sampled uniformly. In Serie C the `interesting`
lane keeps the accepted `2.5..3.5` range, but its `3.5` upper edge has a fixed
`2,500`-basis-point selection weight. The remaining outcomes are selected from
the lower supported half-star ratings. This preserves the sporadic
three-and-a-half-star prospect without letting the `interesting` lane absorb
the `serious` lane's reliable `3.5+` responsibility. All other cells remain
uniform unless a later source-backed calibration explicitly versions their
selection policy.

Accepted current-rating guardrails for rare prodigies:

| Age | Serie C | Serie B | Strong Serie A club |
|---|---|---|---|
| 15–17 | `2..3` | `2.5..3` | `2.5..3.5` |
| 18–20 | `2.5..3.5` | `3..4` | `3.5..4.5` |

The Serie A rare-prodigy guardrail is valid only for playoff and
title-contender clubs. A weak Serie A club is not a fourth undocumented origin
band: the composition owner must reject that placement rather than silently
granting the strong-club current profile. The single permitted lower-division
exception uses its explicit Serie B or Serie C band.

Routine and good-prospect bands remain role-, age-, division-, and tier-aware
and must be calibrated around these guardrails without turning every young
player into a prospect.

For generated players aged `15..20`, the joint current/ceiling profile has one
additional game-design invariant:

- explicit `interesting`, `serious`, and `rare_prodigy` prospect lanes have at
  least one full stored star (`2` half-star units) between current rating and
  stored-ceiling rating at construction time;
- routine young players may have little or no remaining room, so a plateau is
  possible rather than globally forbidden;
- the minimum stored gap is not a guaranteed public outcome floor and does not
  promise one star of development;
- generation samples the contextual ceiling target first, then constructs the
  current profile through a ceiling-conditioned prospect envelope satisfying
  `current <= ceiling - 1 star` for an applicable prospect lane;
- the frozen half-star outcome and its weight are sampled once from the stable
  ceiling stream. A second deterministic quantile then materializes the exact
  role ability inside that half-star, bounded above by the strongest target
  reachable from the current envelope under role and family-growth caps. This
  preserves real variation inside a rating without replacing every ceiling by
  the rating threshold or retrying an unreachable draw;
- prospect class is potential semantics, not a synonym for current strength.
  The current `serious -> rare current lane` shortcut is removed. The new
  envelope remains explicitly age/division/tier/role aware, but may include a
  raw young player below an ordinary strong-current lower bound when the
  selected ceiling would otherwise make the joint contract impossible;
- the ceiling-conditioned envelope has two structural bounds: current must be
  low enough to preserve the one-star gap and high enough that the selected
  target remains reachable under the age/role family-growth caps. “Raw” does
  not permit advertising an impossible stored ceiling;
- an empty intersection is a typed configuration error. The implementation may
  not silently raise the ceiling after current generation, retry until a
  favourable player appears, or clamp current after construction, because
  those approaches would change the frozen prospect shares or corrupt the
  authored current profile;
- the final player factory validates the joint result and never repairs it by
  silently raising potential to current;
- opening seniors, initial academies, seasonal academy intake, and annual
  career intake use this same joint-profile owner. Reserved promotion
  candidates retain the already-generated profile they bring from the academy.

The exhaustive joint-policy gate iterates every supported half-star ceiling
target for each age/division/tier/role/prospect-class combination. It does not
sample one seed and call the policy non-empty. First Division rare prodigies at
survival or mid-table clubs remain deliberately unsupported placements and
must raise their existing typed placement failure outside that supported
matrix.

The one-star invariant describes authored opportunity, not destiny. Minutes,
performance, age, environment, and deterministic variance still decide how
much of that room is realized.

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
after the final cohort. They are evaluated once over the bounded cohort's
additive numerator and denominator, not as a hard pass/fail assertion for each
individual world. A final zero denominator remains non-evaluable and therefore
cannot produce a green cohort.

Senior current quality is authored independently from potential through these
speaking profiles: `senior_regular`, `category_starter`, `category_star`,
`veteran_drop_down`, `youth_prospect`, and `established_champion`. Only
role-defining core and secondary attributes of players aged at least `21` are
adjusted; youth bands, allowed-low attributes, off-role caps, and intrinsic
valuation remain untouched.

The calibrated pre-sampling adjustments are:

| Division | Profile/context | Core and secondary adjustment |
|---|---|---:|
| Serie A | regular or category starter | `+0.75` |
| Serie A | ordinary category star | `-0.80` |
| Serie A | veteran drop-down | `-0.70` |
| Serie B | regular or category starter | `0` |
| Serie B | category star | `-1.00` |
| Serie B | veteran drop-down | `-0.40` |
| Serie C | regular or category starter at playoff/title-contender club | `-0.15` |
| Serie C | regular or category starter elsewhere | `0` |
| Serie C | category star at playoff/title-contender club | `-1.20` |
| Serie C | category star at mid-table/survival club | `-0.35` / `-0.30` |
| Serie C | veteran at playoff/title-contender club | `-0.90` |
| Serie C | veteran at mid-table/survival club | `-0.20` / `-0.10` |
| Any | youth prospect or established champion | `0` |

World-budgeted current-six champions use `established_champion` even when the
composition archetype is `category_star`; this prevents the ordinary-star
adjustment from weakening the explicitly allocated champion. The profile
policy shapes generated football ability only. Public value and AI decisions
must continue to consume the shared public assessment and may not inspect the
profile name.

## Exceptional-Player Stock

For the current one-country world:

- `2..3` already-established current six-star champions aged over `20` in
  credible first-team slots at strong first-division clubs;
- `4..5` active players aged `15..20` with stored ceiling six across the
  entire national world;
- opening allocation and every later stock arrival introduce at most one of
  those young ceiling-six players outside Serie A;
- newly introduced Serie A players belong to strong Serie A clubs;
- an opening allocation or later arrival may not introduce a second young
  ceiling-six player at the same club;
- none is guaranteed to realize six stars.

The established and young cohorts are disjoint by age. The resulting national
stored-ceiling-six stock is therefore normally `6..8`: every current-six
champion necessarily has a stored ceiling of at least six, in addition to the
`4..5` young ceiling-six prospects.

The `4..5` stock counts senior squads, academies, reserved promotion
candidates, free agents, and loaned players together. A promotion reservation
keeps its academy-club association for allocation only and is neither senior
ownership nor active academy registration. Annual intake tops up the stock
only after age progression or exit creates room; it does not generate four or
five new ceiling-six players each year, and it never deletes or downgrades an
existing player to satisfy a budget.

The completed rollover must restore its deterministic target whenever enough
eligible academy vacancies exist. Multiple simultaneous departures may
therefore produce multiple replacements in one intake; a legacy fixed
one-player-per-season cap is not part of this stock contract. The active target
and real vacancies remain binding on every complete snapshot. Placement and
club uniqueness bind at opening allocation and when a new player enters the
stock. A later transfer or annual tier change remains a descriptive
market/world fact: the audit keeps the resulting current placement and
concentration visible but does not misattribute it to generation.
Every complete stock observation carries the deterministic target selected for
that world. The global `4..5` interval validates target selection; it must not
allow a target-five world to close at four, and the selected target must remain
immutable across that world's seasonal snapshots.
Academy age-out and stock reconciliation must observe the same incoming-season
date so the provider sees every real slot opened by that rollover; fabricating
capacity or reading the outgoing calendar date is forbidden.

A fixed cap over all active six-ceiling players at year ten is not a valid
inflation gate once annual replenishment exists: older exceptional players may
remain active while a new young cohort restores the `15..20` target. Year-ten
stock remains descriptive longitudinal evidence. Exact target restoration and
adjacent-season arrival budgets own the non-vacuous inflation contract.
Runs shorter than ten seasons must render that checkpoint as unavailable; an
earlier closing stock may not be relabeled as year-ten evidence.
Every adjacent transition is a replacement-gate observation, including valid
no-vacancy seasons. A bounded diagnostic set still requires at least one real
vacancy and completed replacement, so conditional absence in one world cannot
be mistaken for either failure or cohort-wide evidence.

`rare_prodigy` remains a content construction archetype for those explicit
national assignments. It is not a division-level roll or budget: routine
senior and academy generation has no `rareProdigyCount`, `elitePerDivision`,
or `eliteChance` owner and must never select that archetype independently.

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
- `P50` probable development as a discounted, non-guaranteed tranche;
- public upper as a smaller positive option-value tranche;
- age;
- bounded role scarcity;
- source-backed global curves recalibrated under the Phase 80A epoch;
- one rare, eligibility-gated global `€150m` public-value cap.

The public-quality contribution is ordered into three non-overlapping tranches:

1. achieved current quality is priced fully;
2. `current -> P50` contributes with a versioned weight below full certainty;
3. `P50 -> upper` contributes with a smaller positive versioned weight.

The exact curve may operate in ability or money space, but its observable
contract is fixed: with all other inputs equal, increasing P50 cannot reduce
value and increasing upper cannot reduce value; the upper tranche contributes
strictly positive value whenever it has positive width, while remaining less
valuable per unit than the P50 tranche. A wider upper interval is not a global
uncertainty haircut. Club-specific AI risk appetite remains a separate live
decision input and must not be charged a second time inside intrinsic value.
Stored ceiling is never priced directly.

Hard-cap rarity is a cohort property: each world contributes eligible and
exact-hit counts, and the bounded cohort evaluates the combined share once.
Ineligible exact or rendered-as-cap collisions remain immediate world-local
structural violations.

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

An undeveloped teenager with upper six can therefore carry meaningful option
value without being priced as a guaranteed six-star champion. Exact `€150m`
remains reserved for an eligible, rare, young current six-star player under the
existing cap contract.

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

Step 01 freezes those Phase 80A bands and the global-curve invariants in
`PHASE_80A_PROSPECT_ENVIRONMENT_AND_PLAYER_ECONOMY_BASELINE.md`. The numerical
median/P90/P99 anchors and tolerance widths reuse the dated aggregate evidence;
their Phase 80A meaning is new: category is only the population grouping used
to evaluate one intrinsic global curve. Reusing a numerical source anchor does
not revive the superseded Phase 79C context multiplier or context cap.

Exact-cap diagnostics require a positive eligible denominator, zero ineligible
exact-cap/display collisions, and strictly fewer cap hits than eligible players
so the clamp is not the routine eligible outcome. AI-parity diagnostics require
positive live-decision observations and zero direct stored-ceiling use in
target ranking, offer selection, or willingness.

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
- current young ceiling-six placement outside Serie A and per club as
  descriptive drift, plus separate binding opening/stock-arrival violations;
- annual intake production versus active stock;
- quarterly versus sequential-month development equivalence;
- growth by age/minutes/performance/environment;
- public value/P50/uncertainty relations, division population outputs, and
  exact `€150m` eligibility;
- identical public value for the same player before/after owner category,
  promotion/relegation, transfer, expiry, and free-agent changes;
- exact zero transfer fee with unchanged non-zero public value for free agents;
- AI target decisions proven not to consume stored ceiling.

The final short-horizon player-development calibration is a dedicated compact
`750 worlds x 3 seasons` cohort with exactly `7` workers. It is not the deferred
longitudinal `50 x 20` release gate. Its fixed execution contract is:

- seed prefix `phase80a-player-development-750x3-v1`;
- `750` one-world shards, a fresh run, then an identical resume run with
  `750` resumed shards, `0` newly simulated worlds, and the same aggregate
  hash;
- an opening checkpoint and a closing checkpoint after exactly three season
  rollovers;
- opening and closing cross-sections for ages `15..17`, `18..20`, and
  `21..23`, plus paired trajectories classified by opening age;
- senior, academy, reserved-promotion, free-agent, and future loan populations
  remain explicit rather than being blended into one misleading denominator;
- exact ability facts and integer half-star histograms separately expose
  generation gap, public-projection narrowing, and presentation quantization;
- paired rows satisfy `matched + attrition = opening`; closing new entrants are
  counted separately and never inserted into an opening trajectory;
- participation, performance, and development-environment evidence is read
  before season rollover clears the current ledger. No historical player
  development ledger is added to a save;
- checkpoints contain compact per-world aggregates, never raw player rows.

Structural invariants and positive denominators are binding immediately.
Opening-to-closing growth and early-plateau rates are descriptive on this first
cohort unless a threshold was already frozen before execution; the run may not
invent a pass band after seeing its result.

No `50 x 20` belongs to Phase 80A. Bounded deterministic matrices and
the dedicated three-season cohort establish correctness; the single longitudinal
`50 x 20` runs only in Phase 81 Step 12 after the final competitive-market and
tactical match-engine behaviour exists.

## Explicit Non-Goals

- No scouting fog, fake observed attributes, or staff-derived uncertainty.
- No facilities/staff implementation.
- No five-country runtime topology.
- No permanent hidden realization trait.
- No per-match ability mutation.
- No development countdown in UI.
- No guaranteed development outcome floor. The authored one-star stored-room
  minimum applies only to explicit age-`15..20` prospect lanes.
- No `50 x 20`, threshold weakening, or tuning to make warnings disappear.

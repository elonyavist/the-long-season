# Phase 81A Structural Successor-Ceiling Supply

## Status

**Rejected after Step 16M; retained as historical design evidence.** The
structural stock policy was reachable and internally coherent, but the fresh
paired cohort returned `STOP_RETHINK`. It is not the product default. Step
16M-A subsequently identifies `development_realization` as the dominant
selected-player loss; Step 16N remains blocked behind an owner-specific
correction and a new paired verdict.

## Thesis

The long-career problem is not primarily that good young players develop too
slowly, receive too few protected minutes, leave their clubs, or are blocked by
an age rule. The current product rarely creates a credible high-senior ceiling
in the first place.

The L6.42A funnel measured:

`1885 generated -> 1041 senior-observed -> 22 ceiling-16 -> 13 current-16 ->
13 retained -> 4 leaders`.

`observed_ceiling_supply` owns `1019/1872 = 0.5443` failures and is the largest
loss in `6/7` worlds. The independent like-aged reader agrees in `7/7` worlds.
Development loses only nine players after a viable ceiling and retention loses
zero. A correction must therefore create a believable *population* of future
senior players; it must not give a hidden boost to an individual because he is
young, generated in career, selected, or expected to replace a veteran.

The player-facing objective is a stable stream of uncertain succession stories:
several clubs should own plausible future replacements, not every prospect
should become a star and not every club should receive one on schedule. A
prospect can still stall, be sold, change division, or be overtaken.

## Product Decision

Add one country-level **successor-ceiling stock policy** to the existing annual
world intake composition. It maintains a bounded active population of players
aged `15..20` whose stored primary-role ceiling is at least five stars. Six-star
players are a strict subset of this stock and remain governed by the existing
rarity budget.

For the current domestic pyramid, the deterministic target is between `0.90`
and `1.00` active five-star-or-better prospects per First-Division club. With
the current eighteen-club top flight this is `16..18` players across the whole
country, not `16..18` new players every season and not one guaranteed player
per club.

The range is frozen before implementation from the measured replacement need:

- L6.42A retains `71/7 = 10.14` opening current-16 players per world at season
  ten;
- `13/22 = 0.5909` generated players with a viable observed ceiling actually
  reach current `16`;
- `10.14 / 0.5909 = 17.16`, inside the frozen `16..18` active-stock range.

This is a replacement-flow calibration, not a requirement that a report turn
green. The later checkpoint still decides whether the policy produces real
players, leadership and credible age distributions.

## One Allocation Owner

The current annual allocator already reconciles the active national six-star
stock before generating real academy vacancies. Step 16L must deepen that
owner rather than add a second pass:

1. observe the complete active `15..20` stored-ceiling population once;
2. derive the five-star-or-better and six-star counts from that one population;
3. allocate six-star vacancies first under the unchanged `4..5` target and its
   existing lower-division/per-club limits;
4. count those assignments toward the broader five-star-or-better target;
5. allocate remaining five-star vacancies only to real annual academy slots;
6. emit one total ordered assignment list describing each selected player's
   minimum semantic ceiling, never two overlapping player-ID lists that must
   agree.

Five-star successor allocation is eligible only in the First Division. The
active stock remains national, so a qualifying youngster who moves down a
division or becomes a free agent does not create a duplicate replacement. A
six-star player consumes both stocks by derivation, never by copied counters.

## Club And Role Variety

The policy is a country guideline, not a scripted club identity:

- no club receives a guaranteed successor;
- no club receives more than one new successor assignment in one intake;
- no club may hold more than two active allocated five-star-or-better youth;
- the selected role is the real vacancy role from the competition-balanced
  annual intake plan; the allocator never chooses a formation or rewrites the
  role afterward;
- the existing development-environment probability is reused as the weighting
  input, so better academies are more likely but never certain;
- a seeded derived stream and stable player-ID tie-breaker decide among
  eligible slots without consuming or reordering the simulation RNG stream.

The selected five-star successor is constructed as a serious prospect through
the existing joint current/potential owner. He must retain the authored
current-to-ceiling gap and cannot enter as an instant five-star senior. Six-star
assignments remain rare prodigies exactly as today.

## What Must Not Change

- No generic development increase.
- No origin, age, goal, assist, selection or transfer bonus.
- No protected minutes or retention rule.
- No direct injection into a club's first team.
- No synthetic external player pool.
- No formation or tactical identity input.
- No independent per-club rarity roll.
- No increase to the six-star `4..5` active-stock target.
- No lower-division five-star successor allocation.
- No second current/potential formula and no post-generation clamp.

## Version And Beta Contract

The successor-stock targets belong to the versioned player-rating/rarity
content asset. If adopted, the asset and every linked version reference advance
together. The project is in beta: an incompatible career is rejected and reset
through the existing canonical CLI/web path. No migration, compatibility
default, legacy reader or dual asset survives.

This is a calibration-version change, not a storage schema, save-envelope or
match-event schema change. Step 14 remains the sole owner of those persistence
schemas.

## Validation Ladder

### Step 16L - Structural Policy

Implement the single stock allocator and prove on real generated input that
positive vacancies, zero vacancies, five-star assignments, six-star
assignments, club caps and all refusal branches are reachable. A control mode
must reproduce the pre-policy annual generation exactly and has a named removal
owner.

Implemented on 2026-08-15. The rating bundle advances to v11 through its linked
valuation/asking/market chain. One allocator now owns both tiers and emits one
ordered semantic assignment list. A frozen seven-world real-data search reaches
full stock, positive vacancies, five- and six-star assignments, club-cap
refusals, multiple clubs and roles, exact-five ceilings below current five-star,
zero reconciliation failures and a bit-identical six-star/control lane. The
focused result is `77/77` tests green; the temporary control seam is owned for
removal by Step 16N.

### Step 16M - Paired L6.43

Run fresh control and candidate `7 x 10` cohorts with the same seeds, exactly
seven workers and canonical world producers. Only the successor-stock policy
may differ. The candidate does not receive credit from a cache generated under
another product.

Primary GO conditions, frozen now:

- career-generated season-ten current-16 stock is at least opening-senior
  season-ten current-16 stock in `>=5/7` candidate worlds;
- career-generated scorer/creator leader share is `>=0.50` pooled;
- candidate generated current-16 stock exceeds control in `>=5/7` worlds;
- every reachable stock vacancy reconciles, every selected player satisfies
  the semantic ceiling and no selected player is current five-star at intake;
- the exact six-star allocation facts remain identical between paired arms;
- candidate season-ten total current-16 stock never exceeds the opening
  current-16 stock in the same world;
- every existing formation, points/goals, upset, workload, injury, role,
  market, finance, age and exceptional-veteran guardrail remains binding.

`REFINE` reopens only Step 16L with these targets unchanged. `STOP_RETHINK`
removes the candidate when stock is unreachable, fails to improve in `5/7`,
creates instant stars, changes six-star rarity, or needs another subsystem to
claim success.

Completed on 2026-08-15 with `STOP_RETHINK`. The candidate made `728`
exact-five assignments but reached opening-senior current-16 stock in `0/7`
worlds, beat control current-16 stock in only `2/7` and produced a `0.2071`
generated leader share against `0.50`. Normal product execution therefore
uses pre-Step-16L semantics. The candidate remains only as an explicit
L6.43A analysis arm.

### Step 16M-A - Pathway Attribution

The fresh paired `7 x 10` traces `716` selected exact-five players through
canonical academy and senior facts. Of `424` closed windows,
`development_realization` owns `173` losses (`0.4080`) and is largest in `6/7`
worlds; the margin over senior registration is `0.1156`. These players reached
senior football and at least `900` minutes but not current primary-role ability
`16`. The next correction may open only that owner; no generic growth or
protected-minutes policy is authorized.

### Step 16N - Integrated L6.44

After a later owner-specific paired GO, remove the analysis seam and run a
fresh current-product
`7 x 10`. Produce canonical JSON and English desktop HTML through
`pnpm cli simulation-report`. This is the user-inspection artifact containing
tables, scorers, assists, appearances, ages, transfers, formations and all
integrated gates.

Only an L6.44 GO closes the absolute late-career finding and unblocks Phase
81B. A visually plausible HTML does not override a red gate, and a green gate
does not replace manual inspection of the football story.

## Clean-Code Exit

- one active-stock population and one total ordered assignment list;
- one versioned target owner;
- no analysis flag after Step 16N;
- no superseded report profile, i18n key, fixture or branch;
- CLI and web call the same annual provider with the adopted default;
- every threshold has a real-data reachability test;
- `graphify affected`, dependency rules, deterministic replay and `pnpm check`
  are green.

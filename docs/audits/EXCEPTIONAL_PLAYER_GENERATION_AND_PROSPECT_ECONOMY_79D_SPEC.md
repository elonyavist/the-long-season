# Exceptional Player Generation And Prospect Economy 79D Specification

Date: 2026-07-29
Status: Accepted corrective-phase contract; Step 01 baseline reproduced.

## Purpose

Phase 79C introduced the accepted global `1..6` rating scale, the canonical
three-division world, and the source-backed market economy. Subsequent
multi-seed inspection exposed contradictions that its aggregate gates did not
measure:

- generated current six-star players are systematically `15..18` years old;
- a `15`-year-old with public six-star potential can be valued below `€200k`;
- effective six-star counts can exceed the configured forced allocation;
- every eligible young current six-star player is attracted to the exact
  `€150m` cap;
- the annual exceptional-intake allocator exists but is not connected to every
  production career rollover;
- rating-cap checks can pass without observing the intended annual exceptional
  path;
- the UI presents the stored potential ceiling as one certain destination even
  though the existing development engine treats it only as remaining room that
  may not be fully realized;
- the production AI always offers the current asking price, making the seller
  counter branch unreachable and causing asking-price/completed-fee
  distributions to coincide.

The user-facing defect is not that the reports are insufficiently green. It is
that the manager can see an impossible already-world-class child, read a
development ceiling as a promise, and buy the apparent future champion for a
negligible fee.

## Independently Verified Root Causes

The following implementation facts were checked independently against the
current repository:

1. Initial `currentSixPlayerKeys` are included in `potentialSixPlayerKeys`.
2. `generateFakePlayersForClubs` checks potential-six membership before
   current-six membership.
3. That precedence gives every forced current-six player the
   `rare_prodigy` archetype (`15..18`) instead of `category_star` (`24..32`).
4. Current and potential role abilities are then raised to the six-star floor
   after ordinary generation.
5. Public value starts from current quality; the maximum potential-gap premium
   is only `55%`.
6. A two-star, age-15 first-division goalkeeper with six-star potential
   therefore lands near `€192k`, matching the observed Market row.
7. The young-six-star branch bypasses upper-tail compression and reaches the
   `€150m` clamp routinely.
8. Non-eligible values may stop one cent below the cap but render as
   `€150m` because the UI hides cents.
9. Forced rarity counts do not constrain natural profiles that also cross the
   six-star threshold.
10. `buildAnnualWorldIntakeExceptionalAllocation` has tests but no complete
    production composition path.
11. Current tests do not gate the joint distribution
    `age × current rating × potential ceiling × public value`.
12. `selectPermanentTransferTarget` assigns
    `offerFee = currentAskingPrice`, while the seller accepts every offer at or
    above asking. The Phase 79C `10 x 10` therefore recorded `12,237`
    permanent completions, zero seller counters, and identical asking-price
    and completed-fee P50/P90/P99/maximum.

## Existing Development Facts Preserved By 79D

- `Player.potential` is already the one internal per-ability ceiling, not a
  guaranteed final rating.
- Seasonal development consumes real participation, age, performance,
  remaining room, and a stable derived RNG realization.
- Aging compresses remaining potential with an outfield curve that resolves
  earlier than the goalkeeper curve.
- Current ability and the ceiling therefore already converge or stall through
  gameplay. Phase 79D must present that uncertainty truthfully; it must not add
  a second persisted potential or rewrite the development engine.

## Measured Corrective Baseline

The pre-79D read-only audit sampled `100` deterministic initial worlds through
the production generators.

### Current six-star players

- `151` observed;
- age range `15..18`, mean `16.29`;
- `151/151` used the `rare_prodigy` archetype;
- `151/151` rendered at the exact `€150m` cap.

### Senior potential six-star players

- `312` effective observations versus `262` allocated;
- `50` effective potential-six players were not allocated by the exceptional
  budget;
- age range `15..31`, mean `17.90`;
- `262` used `rare_prodigy`, `49` used `category_star`, and `1` used
  `veteran_drop_down`;
- median public value was one minor unit below the `€150m` cap;
- `84` non-eligible values rendered as the same whole-euro cap label.

Step 01 reproduces this baseline through committed diagnostics. The earlier
one-off `146`/`295` figures used a different seed prefix and remain historical
discovery evidence, not the locked regression sample.

### Existing negotiation evidence

The completed Phase 79C `10 x 10` recorded:

- `23,718` permanent offers;
- `0` seller counters;
- `12,237` completed permanent transfers;
- identical asking-price and completed-fee P50/P90/P99/maximum.

Step 01 must retain this as a reproducible structured baseline and distinguish
normal accepted-at-asking deals from a counter path that is structurally
unreachable.

## Locked Product Decisions

### Public rating and visibility

- Keep one global `1..6` half-star scale.
- Keep exact current attributes visible with one decimal.
- Keep exact numeric potential hidden.
- Keep current rating as one singular public star assessment.
- Replace singular public potential with one derived lower-to-upper star range
  when uncertainty is materially visible.
- Do not implement scouting fog, knowledge percentages, or observation
  missions in Phase 79D.

Because the public range remains visible, valuation must price the same
information the manager and AI receive. A player with elite upside cannot be
priced like an ordinary low-level player, but a wide `2..6` projection must not
be priced like a proven six-star champion.

### Public potential projection

- Keep `Player.potential` as the sole internal role-ability ceiling. Do not add
  persisted `potentialFloor`, `potentialCeiling`, or a second save truth.
- Derive three ordered ability-space facts from the current career snapshot and
  one versioned content-supplied policy:

```text
current ability
<= conservative lower estimate
<= expected realization
<= internal upper ceiling
```

- Map lower and upper to the canonical half-star scale only after the
  ability-space derivation. Do not subtract a star-width directly.
- The lower star value is a conservative estimate, not a guarantee. Only the
  current rating is guaranteed.
- The upper star value is the modeled upside bounded by the real stored
  ceiling. Reaching it is not guaranteed, and it is not a second randomly
  generated promise.
- Derive the factors from age, role, current ability, ceiling, and remaining
  room. Existing development and aging change those facts over time, so the
  range is recomputed rather than persisted.
- Ages `15..22` use the range whenever remaining room crosses a visible
  half-star boundary. Outfield ranges normally narrow by `22`; goalkeepers may
  retain material uncertainty later only where their role-specific development
  curve supports it.
- Calibrate conservative and expected factors from a reproducible deterministic
  engine-outcome matrix. Real market sources calibrate money, not fictional
  star probabilities; the provenance ledger must keep that distinction clear.
- Require same facts/date/policy to produce the same projection. Manager, AI,
  Squad, Market, and profile consumers all receive the same range.
- Potential sorting is conservative and deterministic: lower estimate
  descending, upper ceiling descending, current rating descending, then player
  ID ascending as the stable tie-break.
- Present six stable slots: filled through the lower estimate, patterned or
  hatched through uncertain upside, and neutral outline beyond the ceiling.
  Preserve the dark-orange exceptional sixth slot. Shape and localized
  accessible text, not color alone, must communicate uncertainty.

### Exceptional generation

- Keep deterministic pre-allocation of the exceptional slot: club, division,
  squad placement, and role are legitimate design controls.
- Do not use unconstrained generate-then-reject loops.
- Construct the player through an archetype-compatible lane and validate the
  resulting joint profile.
- Initial current-six players must use the intended current-star archetype
  lane, not the `15..18` rare-prodigy lane.
- Potential-only six-star players may use the rare-prodigy lane while remaining
  development prospects rather than current champions.
- Current and potential exceptional status may share one player, but archetype
  precedence must follow current-status requirements when both apply.
- Role caps, potential-at-least-current, stable stream keys, and same-seed
  determinism remain mandatory.

### Rarity budgets

- Preserve the accepted initial complete-world targets:
  - `1..2` effective current six-star players;
  - `2..4` effective potential six-star players;
  - at most one effective potential-six player below the first division.
- These limits apply to actual generated ratings, not only IDs selected for a
  forced floor.
- Preserve the accepted annual contract:
  - `0..1` new potential-six player in one world season;
  - `2..4` across each deterministic ten-season cohort;
  - year-10 active caps of `4` current-six and `8` potential-six, with at most
    one lower-tier potential-six.
- One canonical assignment record must describe the archetype and exceptional
  lane actually used. Superseded rarity metadata is not retained as a second
  truth.

### Prospect public value

- Keep public value distinct from asking price and completed fee.
- Replace the extreme-gap-only percentage treatment with a range-aware
  discounted expectation floor:

```text
public value =
  max(
    current-quality valuation,
    value anchor at calibrated expected realization
      × calibrated uncertainty discount
  )
```

- Expected realization must remain inside the public lower/upper ability range.
  It is not the raw ceiling and must not be replaced by an unweighted midpoint.
- Realization and uncertainty factors must be versioned, monotonic,
  deterministic, and calibrated from the Step 01 development-outcome matrix
  plus the existing dated market provenance and reproducible age/prospect
  aggregate extension. They must not be guessed from chat.
- Current quality, potential, age, position, and owner market context remain
  public-value facts. Contract and seller pressure remain asking-price facts.
- Range width increases the risk discount; narrowing the otherwise-equal range
  cannot reduce public value.
- Apply upper-tail compression to every player, including young six-star
  players.
- `€150m` remains only the final hard clamp for an eligible full six-star
  player aged `25` or below. It must not be the routine value of that class.
- Quantize final public value downward to the whole-euro precision used by the
  current Market before applying display-safe cap semantics:
  - an eligible exact cap remains exactly `€150,000,000`;
  - a non-eligible player remains at least one displayed whole euro below it;
  - no non-eligible value may round to the exact cap label.
- Asking price may exceed public value according to the existing seller model;
  Phase 79D must verify propagation rather than collapse the two concepts.

### Asking price, offer and completed fee

- Public value, initial/current asking price, offered fee, counter fee, agreed
  fee, and completed fee remain distinct facts.
- AI offer construction must use a deterministic, versioned,
  affordability-bounded offer policy rather than copying the asking price
  unconditionally.
- Offer coefficients are explicit game-design policy calibrated through Step
  01/06 simulations; they must not be attributed to Transfermarkt or guessed
  silently in implementation.
- Do not force every negotiation to differ from asking: accepted-at-asking is a
  valid story. The invalid state is structural identity across the whole
  observed population with zero reachable counter path.
- Diagnostics must measure:
  - offered/asking and completed/asking ratios;
  - exact asking/completed equality count and share;
  - seller accepted/rejected/countered observations;
  - counter accepted/rejected/expired outcomes;
  - completed transfers after a counter.
- Any required counter-path gate with zero observations is
  `not_evaluated`/failure, never `PASS`.

## Diagnostic Contract

Every rarity/economy diagnostic must expose its observation count.

```text
observations === 0  -> not_evaluated or fail
observations > 0    -> pass, warning, or fail from measured evidence
```

The following joint slices are mandatory:

- age by current rating;
- age by potential-ceiling rating;
- current rating by potential-ceiling rating;
- public value by age/current/potential;
- public lower/upper range and width by age/role/current/ceiling;
- deterministic projection coverage against the development-outcome matrix;
- initial forced allocation versus effective generated stock;
- annual allocated intake versus accepted intake versus active stock;
- cap hits by eligibility, age, rating, and season;
- public value versus asking price for exceptional prospects and champions.
- asking price versus offered, countered, agreed, and completed fee;
- exact asking/completed equality share and completed-after-counter count.

No cap, intake, rarity, or market check may claim `PASS` solely because the
relevant path produced zero observations.

## Validation Ladder

1. Read-only multi-seed baseline, source/provenance extension, and deterministic
   development-outcome matrix.
2. Focused archetype and joint-profile construction tests.
3. Effective initial-world rarity tests across many deterministic seeds.
4. Adapter-composed annual intake and ten-season cohort tests.
5. Headless public potential-projection contract tests.
6. Production range/read-model/component integration and beta-reset tests.
7. Range-aware valuation, display-safe cap, offer/counter/fee, affordability,
   and AI propagation tests.
8. Non-vacuous report/gate tests, including explicit zero-observation cases.
9. One final `50 worlds × 20 seasons` corrective gate plus Market browser QA.

Phase 79D does not run or claim the release-scale `750`-world gate. After the
phase passes, control returns to Phase 79 Step 14, whose release sequence must
use no more than `20` seasons per world.

## Twenty-Season Gate Rationale And Limit

- Twenty seasons cover one complete representative player arc from age `15` to
  age `35`, the required year-10 and year-20 stock checks, and twice the
  `10+`-season minimum long-horizon requirement.
- After the three-division expansion, one world contains `54` clubs and `918`
  opening league fixtures. The release gate prioritizes breadth across `750`
  deterministic worlds while keeping the run operationally bounded.
- This is a product/runtime coverage decision, not a claim that no footballer
  or manager career can exceed twenty seasons.
- A passing `750 x 20` does not prove multi-generational equilibrium beyond
  year 20. Phase 79D and Phase 79 must state that residual limit explicitly and
  must not claim `50`-season coverage.

## What Phase 79D Does Not Decide

- It does not add scouting or hide current attributes.
- It does not expose exact numeric potential or persist a public potential
  range.
- It does not rewrite development, aging, participation, or realization RNG.
- It does not add real players, real clubs, a live Transfermarkt client, or
  runtime network access.
- It does not rebalance match outcomes, goals, assists, league tables,
  promotion difficulty, player development, wages, or club finance unless a
  direct regression from the corrected generated profiles or public values
  requires a narrowly documented owner fix.
- It does not start Phase 80.

## Beta Save Contract

- Phase 79D adds no persisted potential floor/range and requires no migration
  for that feature.
- During the beta, incompatible save or calibration/schema versions are not
  migrated or read through compatibility defaults.
- When a 79D version boundary makes a save incompatible, increment the
  supported version and delete/reset the incompatible save through the
  canonical storage/runtime path before creating a new career.

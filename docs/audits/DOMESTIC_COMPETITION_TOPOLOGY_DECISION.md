# Domestic Competition Topology Decision

Date: 2026-07-28
Status: Accepted executable game-design decision for active Phase 79C
Decision ID: `fictional-three-tier-v1`

The decision ID is now part of the validated calibration version bundle.
Implementation remains owned by later Phase 79C steps; this audit does not
claim that the three competitions already exist in production.

## Decision

Phase 79C implements one bounded fictional domestic pyramid:

| Tier | Clubs | Regular season | Up | Down |
| --- | ---: | --- | ---: | ---: |
| First Division | 18 | double round robin, 34 matchdays | — | 3 |
| Second Division | 18 | double round robin, 34 matchdays | 3 | 2 |
| Third Division | 18 | double round robin, 34 matchdays | 2 | — |

Additional rules:

- The first-placed First Division club is champion.
- Movement is automatic after the canonical deterministic table tie-breakers.
- First and Second Divisions exchange three clubs atomically.
- Second and Third Divisions exchange two clubs atomically.
- The Third Division lower boundary is closed in Phase 79C. Bottom clubs are
  not labeled relegated and no unsimulated feeder club is created.
- Every competition remains at exactly 18 clubs after movement.
- There are no playoffs, playouts, cups, continental places, infrastructure
  gates, or promotion/relegation-triggered grants, parachute payments, or
  finance consequences in this phase.
- Phase 81 may add advanced groups/postseason/consequences by extending this
  canonical state; it must not create a second world model.

## User-Facing Reason

The manager gets a real three-tier Scalata immediately: first- and
second-division players exist, promotion changes the competition actually
played, and the Market reflects one persistent country. The first implementation
stays understandable and short-run-testable instead of hiding a 60-club
postseason simulator inside an economy-calibration phase.

## Why 18 Clubs

- The current playable prototype already has 18 clubs and a 34-matchday
  double-round-robin calendar.
- Three 18-club competitions create a 54-club world, exactly tripling the
  current club population while preserving existing even-league calendar
  assumptions.
- A 20/20/20 world would still be fictional while increasing migration and
  runtime cost without reproducing the actual third tier.
- Reproducing the Italian structure would require 20 + 20 + 60 clubs, three
  third-tier groups, asymmetric movement, and a large playoff/playout system.
  Those advanced rules belong to Phase 81.

## Real Italian Reference

These sources describe the real structure used only as context:

- [Lega Serie A 2026/27](https://en.legaseriea.it/serie-a/news/looking-forward-to-the-2026-27-serie-a-fixture-list)
  records 20 clubs, 38 matchdays, and 380 matches.
- [Lega B 2026/27](https://www.legab.it/news/serie-bkt-2026-2027-curiosita-e-statistiche-delle-20-squadre)
  records a 20-club single group.
- [Lega Pro 2026/27](https://www.seriec.com/news-detail/nasce-la-nuova-serie-c-2026-27)
  records 60 clubs and three groups.
- [FIGC Article 49 amendment](https://files.figc.it/version/c%3AODYyNzIyOWUtZDljZS00%3AMzQyZjhjMjYtODNmYy00/209%20-%20Modifica%20art.%20%2049%20NOIF.pdf)
  records 20-club A/B tiers, a three-group 20-club Serie C, three direct
  third-tier group winners, a fourth playoff promotion, and a 28-team
  postseason field.

The fictional topology is not called Italian, Serie A, Serie B, or Serie C in
game content. It borrows market-calibration context, not identities, trademarks,
or an assertion of regulatory equivalence.

## Movement Rationale

- Three places between First and Second match the three-club exchange already
  required at that boundary and keep its automatic movement easy to read.
- Two places between Second and Third deliberately compress the real four-club
  C-to-B flow to one 18-club third-tier competition. One place would make the
  Scalata excessively slow; three would turn over one sixth of the league.
- The two-place choice is a gameplay decision, not a statistic inferred from
  the source.

## Deterministic And Persistence Contract

- Competition and membership order are explicit ID arrays.
- Fixture IDs include competition and season identity and are globally unique.
- A club keeps the same ID, players, contracts, finance, history, and selected
  identity when it moves.
- Membership changes, category facts, histories, next calendars, and transfer
  windows publish atomically.
- The topology decision ID is included in the calibration/version bundle
  stamped into new careers and diagnostic reports.

## Non-Goals

- No simulation or branding of real Italian clubs.
- No approximation presented as an observed real competition rule.
- No hidden fourth tier or generated clubs that cannot be inspected.
- No playoffs/playouts disguised as direct table positions.
- No change to the topology merely to make a short-run report pass.

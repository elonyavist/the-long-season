# Phase 79C Global Player Rating And Market Economy Report

Date: 2026-07-29

## Decision

Phase 79C is complete. The game now uses one global `1..6` half-star player
scale, one canonical fictional three-division country, and one versioned
market economy whose public values, asking prices, fees, wages, budgets,
willingness, and AI behavior are structurally separate.

The bounded `10 worlds x 10 seasons` calibration gate passes. This evidence
does not replace or claim Phase 79 Step 14's staged `750 x 50` release gate.

## Source And Configuration Contract

- The dated Transfermarkt evidence and reproducible aggregate extraction are
  recorded in
  `PLAYER_MARKET_CALIBRATION_PROVENANCE_LEDGER.md`.
- The independent wage and finance evidence is recorded in
  `WAGE_AND_CLUB_FINANCE_CALIBRATION_SOURCE_AUDIT.md`.
- The adopted product boundaries and tolerances are recorded in
  `GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_CALIBRATION_SPEC.md`.
- The bounded fictional pyramid is recorded in
  `DOMESTIC_COMPETITION_TOPOLOGY_DECISION.md`.
- Six schema-validated JSON assets own rating, public-value, asking-price,
  market-behavior, and wage/finance calibration. Careers persist the exact
  topology and calibration versions in `GameMeta`.
- Engine and simulation-tools receive those policies explicitly and do not
  import content or provide production tuning defaults.

## Implemented Result

### Player Quality

- Current and potential presentation use one observer-independent `1..6`
  half-star scale.
- `5.5` renders five gold stars plus a half dark-orange sixth star; `6`
  renders the dark-orange sixth star in full.
- The former rating-specific `elite` Boolean and club-relative reference squad
  are absent.
- Current attributes are exact and locale-formatted to one decimal. Exact
  numeric potential remains hidden.
- Goalkeepers and outfield players expose only their relevant attribute
  families.

### World And Career

- `fictional-three-tier-v1` contains three ordered 18-club competitions with
  34 matchdays and 306 fixtures per tier.
- First/Second exchange three clubs; Second/Third exchange two. The Third
  Division lower boundary is closed.
- Competition membership, calendars, histories, windows, contracts, finance,
  player development, persistence, and Market traversal use canonical ordered
  state.
- CLI, web, and long-run diagnostics compose the same 54-club world and exact
  seven-version calibration bundle.

### Market Economy

- Public value is global and observer-independent, with nonlinear rating
  anchors, age/potential/position context, progressive upper-tail compression,
  and an exact `EUR 150m` ceiling reserved for an eligible young six-star
  player.
- Public value, seller asking price, offered/countered/agreed fee, and
  completed fee are distinct facts.
- Free agents retain a public value and always have an exact zero transfer fee.
- Wages are derived from a separate source-backed wage policy, never from a
  fixed market-value ratio.
- Cash, transfer allocation, annual-wage room, signing bonus, and pending
  exposure remain independent affordability constraints.
- Six-star-potential players reject implausible permanent downward moves.
  Strong first-tier squads receive first opportunity on rare lower-tier
  prospects without identity exceptions or forced deals.

### Squad Continuity Remediation

The bounded gate exposed one deterministic second-division club-season at 17
players. The cause was not finance: end-of-season exits had exhausted the
free-agent pool, while canonical senior squads deliberately ignored the
adapter's generated reserve.

The final lifecycle now:

- gives every requested club first access to the shared pool until the hard
  18-player and zero-department floor is restored;
- uses remaining players for optional depth only after all hard floors;
- ranks hard-repair candidates by exact affordable contract demand;
- materializes the smallest validated generated reserve only when the existing
  pool cannot cover hard structural needs;
- invokes the reserve provider lazily, so unused annual candidates never enter
  the durable world;
- still commits every signing through canonical contract, registration, and
  finance validation;
- emits season-scoped replenishment signing facts so free-agent activity and
  public values are measured without inventing persistent transfer history.

## Bounded `10 x 10` Evidence

The generated detailed report is:

`GLOBAL_PLAYER_RATING_AND_MARKET_ECONOMY_79C_10X10_REPORT.md`

Key results:

- status `PASS`;
- 10 worlds, 10 seasons each, 100 total seasons;
- 0 failed worlds and no failing check key;
- minimum senior squad size `18`;
- 0 club-season observations below the minimum;
- 0 clubs without a natural goalkeeper;
- 0 contract/finance structural violations;
- 0 year-10 rating-cap violation worlds;
- year-10 maximum stock: current six-star `2`, potential six-star `4`,
  lower-tier potential six-star `1`;
- sampled public values reach the exact `EUR 150m` ceiling but never exceed it;
- 12,237 completed permanent transfers;
- permanent completed-fee maximum `EUR 117,361,024.61`;
- 3,882 measured replenishment free-agent signings;
- free-agent public-value P50/P90/P99 approximately
  `EUR 360k / EUR 3.10m / EUR 11.58m`, maximum `EUR 94.51m`;
- 0 free-agent non-zero completed fees;
- maximum free-agent population share `0.2124`;
- wage utilization P50/P90/P95/P99
  `0.91 / 0.99 / 1.00 / 1.00`;
- exact-ceiling share `0.04`, above-budget share `0`;
- minimum club cash balance `EUR 6,918,397.90`.

All ten worlds remain `WARN` because the report deliberately retains monitor
signals for role-depth warnings, active-population movement, and wage pressure.
Eight worlds also monitor goals-per-match variance and two retain a healthy
champion-streak story. None is a structural failure or a relaxed threshold.

## Browser And Accessibility Evidence

The canonical current-product plus SQLite/OPFS browser gate passed `29/29`.
The inspected matrix includes desktop, narrow, keyboard, touch, `200%` text,
reduced motion, dialog scroll, sticky tables, contextual menus, and focus
restoration.

Manual review confirmed:

- ordinary, half-star, `5.5`, and `6` ratings;
- five gold plus half/full dark-orange sixth-star rendering and accessible
  `x out of 6` text;
- one-decimal goalkeeper/outfield attributes;
- cross-division Market filters and counts;
- distinct public value, asking, offered/agreed, and zero-fee labels;
- no numeric-potential leak or scouting fog;
- no recurrence of the Squad/Market document-height scroll glitch.

No frontend or CSS file changed after that browser run. The final production
web build passed with only the existing non-blocking main-chunk size warning.

## Absence Audit

The closeout audit found:

- no club-relative rating or reference-squad field;
- no rating/presentation `elite` Boolean branch;
- no production single-league career bootstrap;
- no implicit/default linear valuation;
- no ambiguous transfer value replacing the distinct value/asking/fee facts;
- no first-object-key competition or fixture traversal;
- no engine or simulation-tools import from content;
- no temporary Phase 79C diagnostic environment hook;
- no unversioned production tuning.

The remaining `elite` text in production code belongs to the historical
content-generation potential class, not the removed public rating marker.
Other occurrences are test IDs or test descriptions.

## Verification

- Focused final engine/simulation/report suite: 4 files / 41 tests passed.
- Repository gate: `pnpm check` passed with 247 files / 1,532 tests.
- Dependency-cruiser passed: 751 modules / 2,906 dependencies.
- Every workspace typecheck passed.
- Web production build passed.
- Browser QA passed: 29/29.
- Bounded deterministic cohort passed: 10 worlds / 100 seasons.
- `git diff --check` and `graphify update .` pass at closeout.

## Residual Risks And Handoff

- Role-depth and population diagnostics remain monitor signals. They should be
  observed in Phase 79's staged gate, not hidden or retuned without evidence.
- Third-division wage budgets operate close to their ceiling by design. The
  bounded cohort shows no overspend, but the full Phase 79 gate must inspect
  pressure over 50 seasons.
- The fictional topology is intentionally smaller than the real Italian
  pyramid and has no cup, continental competition, playoff/playout, or open
  lower boundary.
- The Phase 79 `50 x 10`, `250 x 30`, and `750 x 50` closeout sequence remains
  unrun against this new world/economy and is the only next active path.
- Phase 79 Step 15, Phase 78 Step 15, and Phase 80 are not started here.

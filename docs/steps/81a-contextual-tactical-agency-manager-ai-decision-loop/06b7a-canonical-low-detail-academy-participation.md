# Step 06B7A - Canonical Low-Detail Academy Participation

## Status

Done. The canonical calendar path and its real-data reachability proof are
green; only Checkpoint L4.1 is opened.

## User-Facing Goal

Young players must be able to become credible senior footballers because they
actually play while they are in an academy. The game must not solve renewal by
making every veteran worse or by gifting ability to a player with no football
activity.

## Code Truth And Product Basis

The career already has one durable participation ledger and one development
policy. Senior matches feed it; active academy players who are never emergency
call-ups do not. `requirements.md` already decides that youth teams and loans
reuse the low-detail competition model: a low-detail host may synthesize
minutes, but the final input to growth is the same canonical participation
fact.

The implementation therefore adds participation, not another growth formula or
match simulator. A double round-robin academy programme commonly produces a
mid-twenties match count; three fixtures in each competition-active month gives
roughly `27..30` over this game's August-to-May season. References:

- [Premier League U18 format](https://www.premierleague.com/en/news/58897/under-18-premier-league-format-explained)
- [FIFA: support a games programme or loan system for the youth-to-senior transition](https://publications.fifa.com/en/talent-development/the-transition-of-talent/)

## Frozen Behaviour Before Implementation

- A competition-active month is an open participation month in the active
  season with at least one canonical senior-match row and a month key earlier
  than the calendar boundary being advanced to.
- Every complete active academy XI receives three stable, low-detail academy
  fixture facts of `90` minutes in that month.
- Senior minutes replace academy load by whole-match equivalents:

```text
academy fixtures = max(0, 3 - floor(existing non-academy minutes / 90))
```

- A sub-90-minute senior cameo does not erase a whole academy fixture. Total
  development minutes can therefore be above `270` but below `360` in that
  month; it cannot silently become a second full senior schedule.
- Each academy fixture ID is derived from season, month, club and fixture
  ordinal through the canonical `fixtureId(...)` constructor. The participation
  ledger owns idempotency and rejects duplicate accrual.
- Only players in the club's active academy roster participate. The canonical
  natural-position-to-role mapping owns played-role minutes.
- Academy fixtures have no synthetic rating. The existing development policy
  therefore reads neutral performance, real minutes, the player's age,
  potential room, deterministic variance and the club environment.
- The low-detail path produces no result, table, goals, assists, cards, injury
  roll or match condition spend. Those facts require a match simulation and may
  not be fabricated by a development source.
- Zero activity remains zero positive development. No youth bonus, direct
  ability delta, promotion quota or leaderboard multiplier is introduced.
- Academy minutes share the senior ledger deliberately: recent-use selection,
  role adaptation, quarterly checkpoints, reload idempotency and development
  must not receive different answers from different stores.

## Reachability And Safety Proofs

- A real generated career must produce positive academy fixture IDs and
  academy minutes through the normal calendar route.
- Repeating the same calendar advancement produces an identical state and zero
  additional fixture accrual.
- One player with `180` non-academy minutes receives one academy fixture; a
  player with no senior minutes receives three.
- Closing a month before academy accrual remains a hard ledger failure, never a
  compatibility fallback.
- Every academy minute reconciles to fixture IDs, player, club, season, month
  and natural role.

## Expected Files

- `packages/engine/src/career/academy-participation.ts` and test **(new)**; one
  owner derives low-detail academy fixture contributions and their stable IDs
- `packages/engine/src/career/advance-career-month.ts` and test; the calendar
  accrues academy activity before selecting the next quarterly batch
- `packages/engine/src/career/advance-career-season.ts` and test; the season
  fact derives academy activity from the rows it actually closes
- `packages/engine/src/index.ts`; exports only the structured fact needed by
  current callers
- `apps/cli/src/commands/simulation-report/generational-succession.ts` and test;
  L4.1 observes the canonical fact without reconstructing academy activity
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test only
  where the existing observer handoff needs the new fact
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test; this
  existing checkpoint dispatcher selects the L4.1 evaluator and supplies the
  real generated-career reachability proof
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`; a new locked cache contract prevents pre-change
  shards from entering L4.1
- `packages/i18n/src/labels.ts` only if the locked profile needs a new visible
  label
- this document, the phase README, `06b7b-checkpoint-l4-1-youth-minute-pathway.md`
  and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/academy-participation.test.ts packages/engine/src/career/advance-career-month.test.ts packages/engine/src/career/advance-career-season.test.ts apps/cli/src/commands/simulation-report/generational-succession.test.ts apps/cli/src/commands/simulation-report/career-world-facts.test.ts
pnpm check
git diff --check
graphify update .
```

## Verification

- the focused real-career suite passed `40/40` tests;
- the full repository gate passed `299` files and `2275` tests with every
  typecheck, dependency and custom check green;
- the Phase 80A replacement golden moved from one to six accepted exceptional
  intakes for a measured reason: academy players now traverse canonical aging
  and potential compression. The two transitions replace `4 + 2` departures,
  retain exactly four active young ceiling-six players per snapshot, and report
  zero missing replacements, inflation arrivals, placement violations or club
  uniqueness violations. No threshold was widened.

## Definition Of Done

The ordinary career calendar produces canonical, idempotent academy minutes on
real generated data, no second match/development store exists, all safety checks
pass and only Step 06B7B is opened.

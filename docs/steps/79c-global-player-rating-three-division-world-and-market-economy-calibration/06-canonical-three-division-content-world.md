# Step 06 - Canonical Three-Division Content World

## Status

Done.

## Goal

Generate one deterministic `fictional-three-tier-v1` country containing all 54
canonical fictional clubs, players, memberships, contracts, youth foundations,
opening finance, transfer windows, and calibration versions without changing
CLI or web career bootstrap yet.

## Expected Files

- `packages/content/src/generators/domestic-world.ts`
- `packages/content/src/generators/domestic-world.test.ts`
- `packages/content/src/generators/fake-clubs.ts`
- `packages/content/src/generators/fake-clubs.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/league-system.ts`
- `packages/content/src/generators/league-system.test.ts`
- `packages/content/src/generators/gameplay-config.ts`
- `packages/content/src/generators/gameplay-config.test.ts`
- `packages/content/src/generators/senior-squad-world.ts`
- `packages/content/src/generators/senior-squad-world.test.ts`
- `packages/content/src/generators/club-finance-world.ts`
- `packages/content/src/generators/club-finance-world.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/transfer-window-catalog.ts`
- `packages/content/src/generators/transfer-window-catalog.test.ts`
- `packages/content/src/index.ts`
- `docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/06-canonical-three-division-content-world.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Implementation Checklist

- Add a `FakeDomesticWorld`/`createFakeDomesticWorld` content facade distinct
  from the existing focused single-competition simulation fixture.
- Build exactly three ordered competitions with 18 clubs each.
- Build exactly `22` active senior players per club. This is the canonical
  gameplay roster denominator locked by Step 01's normalized squad-value
  comparator; youth foundations remain separate.
- Generate stable, non-colliding club/player IDs containing tier and slot
  identity; do not rely on object enumeration.
- Generate fictional club identities appropriate to each tier without real
  names, badges, or trademarks.
- Generate every club's senior squad, contracts, registrations, youth
  foundation, and opening finance under the existing canonical owners.
- Apply Step 03 current/potential generation and initial rarity budgets once
  across the complete world, not once per competition.
- Put current six-star players in strong first-tier first-team slots and permit
  at most one lower-tier potential-six player.
- Create explicit ordered membership for First, Second, and Third Divisions.
- Resolve source-audited transfer windows for every playable competition.
- Include the Step 04 topology/calibration version bundle in the generated
  content result so Step 07 app bootstraps can stamp its single persisted copy
  into `GameMeta`.
- Keep reusable match/role/state configs outside the single-league facade so
  both focused fixtures and the domestic world share them without copying.
- Keep `FakeLeagueSystem` only as an actively used focused
  single-competition simulation fixture. It must not remain a career bootstrap
  after Step 07.
- Do not generate fixtures in content; Step 05 engine calendar generation owns
  fixture IDs and schedules.
- Prove same-seed world identity, membership/order, version bundle, and rarity
  placement.

## What NOT To Implement

- No CLI/web career switch, promotion/relegation, season rollover,
  cross-division Market UI, valuation, asking price, wage/budget retuning, or AI
  behavior.
- No second career-world owner or synthetic external Market targets.
- No cup, continental competition, real club, or real player.
- No content import from engine.
- No fixtures or calendar IDs manufactured in content.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/generators/domestic-world.test.ts \
  packages/content/src/generators/fake-clubs.test.ts \
  packages/content/src/generators/fake-players.test.ts \
  packages/content/src/generators/league-system.test.ts \
  packages/content/src/generators/gameplay-config.test.ts \
  packages/content/src/generators/senior-squad-world.test.ts \
  packages/content/src/generators/club-finance-world.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  packages/content/src/generators/transfer-window-catalog.test.ts
pnpm --filter @game/content run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- One content call returns the complete ordered 54-club fictional country with
  exactly `22` active seniors per club.
- Every club has coherent players, registrations, contracts, youth, finance,
  competition membership, and a source-audited window.
- Initial current/potential rarity budgets are exact and credibly located.
- Every required config/topology version is present.
- Same-seed complete-world output is byte-identical.
- Existing career clients have not switched yet; the next step owns that
  migration.

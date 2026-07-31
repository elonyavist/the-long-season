# Step 09 - Bounded Diagnostics, Browser, Persistence And Beta Reset

## Status

Not started.

## Entry Gate

- Steps 01-08 are Done.
- No production change remains pending before the phase closeout.

## Goal

Prove incoming permanent offers, market postures, loans, wage sharing,
development, return, persistence, and UI together before spending time on the
deferred `50 x 20`, which Phase 80C Step 09 now owns.

## What To Implement

- Run positive-denominator bounded funnels for:
  - listed/unsolicited incoming permanent offers;
  - outgoing commands shown as action-eligible, followed by both pending talks
    and explicit `player_not_for_sale` seller responses;
  - five-open cap counted by individual incoming negotiation, per-buyer
    uniqueness across permanent and loan kinds, zero concurrent negotiations
    scheduled for one player, and cooldown;
  - accept/reject/final counter and expiry;
  - both loan directions and all three wage shares;
  - need/rotation eligibility;
  - minutes/ratings/development and bench zero-growth;
  - return, unchanged `Club.playerIds` ownership, exactly one borrower
    registration followed by deterministic parent registration, selectable
    registration, `18` plus `2/6/6/3` floors, finance, statistics, and history;
  - owned and selectable headcounts as separate positive observations.
- Prove AI continues to use public assessment only.
- Prove the browser does not promise seller willingness, does not suppress the
  canonical refusal, and does not duplicate seller-willingness rules.
- Verify every owning durable change bumped the beta schema/config version and
  delete remaining incompatible browser/CLI saves without compatibility
  branches. Valid different-buyer negotiations for one player remain accepted.
- Prove new JSON and SQLite/OPFS round trips.
- Run full repository/build/browser/accessibility/diff/Graphify gates.
- Write the implementation report and freeze Step 10 command unchanged.

## What NOT To Implement

- No new feature, threshold weakening, warning suppression, or long run.
- No compatibility migration.

## Expected Files

- files owned by Steps 02-08 only when fixing an owned regression
- simulation/report diagnostic owners from Step 01
- `apps/web/src/visual-qa/current-product.spec.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- beta save/schema/version owners
- `docs/audits/PHASE_80B_INCOMING_OFFERS_AND_LOANS_REPORT.md`
- `docs/audits/README.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- Phase 80B README
- this step document
- Step 10 document only if evidence changes what the phase report must record

## Required Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm depcruise
pnpm web:visual:qa
git diff --check
graphify update .
```

Use only bounded diagnostics frozen by Step 01. Do not run `50 x 20`.

## Definition Of Done

- All bounded funnels have positive observations and pass frozen semantics.
- Action eligibility and seller willingness remain distinct with positive
  observations for submission and explicit seller refusal.
- Loans never mutate `Club.playerIds`; no duplicate
  ownership/finance/statistics/history or privileged AI data exists.
- Selectable totals, department floors, and combined per-buyer/player
  negotiation uniqueness pass with positive observations.
- New saves round-trip; incompatible beta saves are gone.
- Repository/browser/accessibility gates pass.
- Step 10 is the only next action.

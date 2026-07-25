# Step 15 - Integrated Accessibility, Cleanup, Architecture And Phase Report

## Status

Ready.

## Goal

Close Phase 79 and the deferred Phase 78 closeout once, with one coherent
Squad, contract, finance, Market, Posta, persistence, and tactical journey,
complete caller proof, and no superseded code.

## User-Visible Outcome

Senior Squad, player profiles, contracts, renewals, Market, offers,
preliminary agreements, Posta, Tactics, preparation, and Matchday feel like one
premium football-management product across desktop, narrow, keyboard, touch,
200% text, reduced motion, refresh, and recoverable failure.

## Scope

1. Absorb the retired Phase 78 Step 16 and audit every Phase 78/79 Module,
   Interface, use case, Adapter, read model, component, style, test, and route
   for one clear owner.
2. Remove the temporary reservation behavior, duplicate transfer/contract
   helpers, legacy Market output, fallback finance/contract paths, unused
   exports, superseded CSS/tests, and compatibility leftovers after production
   caller proof.
3. Complete desktop, wide, narrow, 200% text, keyboard, touch, focus,
   contrast, screen-reader, reduced-motion, and no-horizontal-overflow QA.
4. Prove New Career, Squad, profile, renewal, Market search, closed window,
   permanent offer, club counter, player terms, multiple pending exposure,
   unaffordable cancellation, completed transfer, preliminary agreement,
   Posta, Continue, reload, Tactics, preparation, Matchday, full time, and
   annual payroll in the real SQLite/OPFS app.
5. Verify loading/error feedback preserves drafts and current screen.
6. Verify no exact hidden potential or internal willingness score reaches the
   browser.
7. Run package, browser, visual, dependency, monorepo, diff, long-run, and
   Graphify gates.
8. Reconcile `docs/ARCHITECTURE.md`, both roadmaps, step index, project status,
   Phase 78 report, transfer-window source audit, market long-run report, and a
   final integrated phase report.
9. Recommend exactly one next phase only after all evidence passes.
10. Close the `P79-CF-01` through `P79-CF-08` register with source and caller
    proof: no hardcoded morale direction, duplicated expiry threshold, local
    read-only money formatter, identity-driven draft reset, invisible dirty
    command, per-player history scan, double-cast state builder, or malformed
    contract-command branch remains.

## Implementation Contract

- Cleanup follows production caller, package, and browser proof; no speculative
  rewrite.
- Motion remains semantic, reduced-motion-safe, and independent from engine
  timing or command completion.
- Browser QA uses the real current app, current working session, and
  SQLite/OPFS lifecycle.
- The tactical board, field SVG, match engine facts, save cadence, and current
  approved visual identity change only for a proven integration defect.
- No next phase implementation begins here.

## Expected Files

- Phase 78/79 production/test files only where final defects or dead paths are
  found and caller proof permits removal
- `apps/web/src/visual-qa/current-product.spec.ts`
- `apps/web/src/visual-qa/sqlite-opfs-storage.spec.ts`
- current accessibility/visual QA helpers only where active coverage requires
  a reusable correction
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/audits/TRANSFER_WINDOW_SOURCE_AUDIT.md`
- `docs/audits/TRANSFER_MARKET_LONG_RUN_REPORT.md`
- `docs/audits/TRANSFER_MARKET_AND_SQUAD_INTEGRATED_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/README.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`

## What NOT To Implement

- No loans, installments, agents, broad Finances screen, extra playable league,
  Youth/Staff section, unrelated redesign, or new motion family.
- No retained obsolete path without a named production caller and test.
- No warning suppression, long-run threshold weakening, or hidden product
  decision.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/content run test
pnpm --filter @game/engine run test
pnpm --filter @game/storage run test
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Complete the full New Career to Squad to profile to renewal to Market to
  two-stage offer to Posta to completed transfer to Tactics to preparation to
  Matchday to next-fixture journey.
- Repeat at desktop, wide, narrow, 200% text, keyboard-only, touch, and reduced
  motion.
- Review market, contract, and finance numbers as manager decisions and
  football stories, not only arithmetic invariants.

## Completion Criteria

- Phase 78 Steps 01-15 and Phase 79 Steps 01-15 are Done and every integrated
  gate passes.
- Squad, Market, contracts, finances, Posta, Continue, persistence, Tactics,
  preparation, and Matchday share canonical facts with no parallel path.
- Visual/accessibility evidence shows no horizontal scroll, clipped fact,
  hidden action, focus loss, drag-only task, or ambiguous pending/committed
  budget.
- Final reports record distributions, removed code, accepted warnings,
  residual risks, and exactly one next recommendation.
- The carry-forward quality register is fully resolved without a second state,
  compatibility path, speculative abstraction, or unsupported UI branch.
- Phase 79 is complete without starting the next phase.

# Step 01 - Current Market Ownership And Gap Audit

## Status

Ready after Phase 78 Step 15 is Done.

## Goal

Map every existing transfer, valuation, willingness, contract, finance,
turnover, Posta, persistence, and browser path before extending the market.

## User-Visible Outcome

No visible change. The audit prevents the new Market from creating a second
transfer engine or preserving temporary reservation behavior by accident.

## Scope

1. Trace permanent transfers from command input through feasibility, seller
   contract closure, buyer agreement, registration, number, finance, history,
   squad, plan, persistence, and presentation.
2. Trace renewal negotiation, free-agent signing, AI turnover, valuation, and
   willingness paths that Phase 79 must reuse or replace.
3. Identify every actual-budget reservation or pending-affordability check and
   classify it as retain, replace, or remove under the locked exposure rule.
4. Trace game-date, season, competition, and calendar ownership.
5. Inventory Market routes, CLI output, UI models, Posta facts, and storage
   schema already in production.
6. Name the exact owner and test seam for every Phase 79 capability.
7. Record absent capabilities explicitly; do not create implementation while
   auditing.

## Implementation Contract

- Use production callers and Graphify evidence, not filename assumptions.
- Every proposed new Module must replace a named gap that no current owner can
  absorb cleanly.
- The audit must distinguish durable domain facts from transient web drafts.
- The temporary Phase 78 pending-reservation behavior must have one named
  replacement path and deletion proof.

## Expected Files

- `docs/audits/TRANSFER_MARKET_OWNERSHIP_AND_GAP_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No production code, schema, UI, calendar, offer, or policy change.
- No speculative abstraction or compatibility plan.
- No scope expansion to loans, scouting, agents, or broad finances.

## Required Checks

```bash
nvm use 24
graphify query "transfer market negotiation contract finance ownership"
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Follow one existing permanent AI transfer and one selected-club renewal from
  input to persisted result.
- Confirm every Phase 79 step points to one current owner or one proven gap.

## Completion Criteria

- The audit has a complete retain/extend/replace/remove table.
- No duplicate transfer, negotiation, finance, or storage owner is proposed.
- Step 02 is the only next implementation step.

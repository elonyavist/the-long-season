# Step 01 - Current Ownership And Gap Audit

## Status

Ready.

## Goal

Record the exact current ownership of squad membership, shirt-number display,
valuation, transfer budgets, plan persistence, availability, Posta, Continue,
world generation, and save mapping before changing production behavior.

## User-Visible Outcome

None yet. This step prevents the Squad and contract implementation from
creating duplicate state or hiding existing career behavior.

## Scope

1. Trace a generated player from world creation through club membership,
   career state, preparation, Matchday, transfer, youth, and storage.
2. Identify every fake or derived shirt-number owner.
3. Trace current transfer funds and valuation formulas.
4. Trace current plan carryover and the exact validation that removes or
   rejects unavailable players.
5. Trace current Posta/Continue extension points and monthly/full-time commit
   boundaries.
6. Inventory current JSON and SQLite schema/version behavior.
7. Record the exact files each later step replaces or extends.
8. Confirm that no active contract, wage, club-cash, finance-ledger, Squad
   route, Tactics route, or player-profile owner already exists.

## Implementation Contract

- This is an audit-only step.
- Every statement must cite a current file or test.
- The report must distinguish current truth, missing behavior, and deliberate
  Phase 78 decisions.
- If current code contradicts a locked phase decision, update the next relevant
  step document before implementation starts.

## Expected Files

- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No production, test, schema, dependency, CSS, or runtime change.
- No speculative architecture beyond the locked Phase 78 scope.
- No compatibility recommendation for beta saves.

## Required Checks

```bash
rg -n "playerIds|transferFunds|shirt|number|valuation|availability|matchPreparation|inbox|schemaVersion" apps packages
git diff --check
graphify update .
```

## Manual Inspection

- Confirm a junior developer can follow each current state owner from the
  report without searching the entire repository.
- Confirm every later step has a named replacement target and no ownership gap
  is silently deferred.

## Completion Criteria

- The audit report exists and cites current owners.
- The beta reset boundary and all superseded seams are explicit.
- Step 02 remains the only next implementation step.


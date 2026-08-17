# Step 02 - Season-Anchored Expiry And Month-Precision Terms

## Status

Blocked behind Step 01.

## Goal

Give signed contracts one season-boundary owner and offered terms one
month-precision representation without changing AI recruitment semantics.

## What To Implement

- Use one canonical competition/season boundary to derive effective signed
  expiry dates.
- Express offered terms in months end to end. Remove whole-year fields,
  converters, duplicate validators and stale localization in the same change.
- Preserve the distinction between requested and effective term only if both
  are non-derivable and user-visible; otherwise store the canonical effective
  value once.
- Seed opening free-agent stock from Step 01's declared population contract,
  not a post-change convenient level.
- Reuse the Phase 81B recruitment/free-agent policy unchanged. It receives
  availability events from the new clock but no hidden trajectory or new
  ranking path.
- If persisted truth changes incompatibly, advance the supported beta version
  and delete/reset old saves exactly once here. No migration or fallback.
- Prove CLI/web/storage agree on contract dates and term months.

## What NOT To Implement

- No free-agent scoring change, negotiation race or loan behavior.
- No background fixtures or simulate-match.
- No second season clock.
- No later Phase 81C beta reset for this contract migration.

## Expected Files

The Step 01 Graphify inventory becomes authoritative before implementation and
must include:

- domain contract/offer types and validators
- engine contract/offer/expiry/calendar owners and tests
- storage JSON/SQLite mappers, schema/version/reset owners and tests
- CLI/web/read-model consumers and all five-language labels affected
- canonical exports and obsolete-field deletion tests
- this step and Step 03; `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm check
git diff --check
graphify update .
```

Focused tests must prove boundary dates, month terms, one reset and absence of
every legacy term reader found in Step 01.

## Definition Of Done

- One season boundary and one term unit exist.
- Requested/effective semantics are explicit and non-duplicated.
- Phase 81B recruitment behavior is reused rather than forked.
- JSON/SQLite/CLI/web agree.
- Exactly one beta reset is owned and verified when required.
- Step 03 is the only next action.


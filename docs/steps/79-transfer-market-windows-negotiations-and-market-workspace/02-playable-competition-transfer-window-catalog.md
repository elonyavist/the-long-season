# Step 02 - Playable Competition Transfer-Window Catalog

## Status

Ready.

## Goal

Give each playable competition exactly two deterministic, researched transfer
windows without creating a user-configurable calendar system.

## User-Visible Outcome

Market shows whether transfers are open, the closing date, or the next opening
date. The dates match the football context of the competition being played.

## Scope

1. Add validated domain vocabulary for one resolved season's two inclusive
   transfer windows and their open/closed/next-boundary result.
2. Add a content-owned date template only for the current playable Italian
   professional third-tier demo competition.
3. Use `2026-07-01..2026-09-01` and `2027-01-02..2027-02-01` for the first
   supported season, based on the official FIGC 2026/27 professional windows.
4. Resolve later career seasons from the same competition-owned month/day
   template without wall-clock access or random drift.
5. Link the competition identity to its window catalog at world generation.
6. Reject missing, overlapping, reversed, or more-than-two windows.
7. Record the source and retrieval date in the audit.

Official starting source:

- [FIGC 2026/27 professional registration periods](https://www.figc.it/it/federazione/news/approvati-i-criteri-per-le-riammissioni-le-sostituzioni-e-i-ripescaggi-nei-campionati-professionistici-szuz8fvh)

## Implementation Contract

- Dates are content, not settings and not a generic balance object.
- Do not add English, Spanish, German, French, or other rows until that league
  is playable. Adding a playable competition later requires its own cited row.
- Engine consumers receive resolved domain dates and never import content.
- All comparisons use canonical `GameDate` semantics and explicit inclusivity.

## Expected Files

- focused transfer-window value object/entity and tests under `packages/domain/`
- focused playable-competition window catalog and tests under `packages/content/`
- current competition/world-generation wiring identified by Step 01
- package export files only where the new public contract is consumed
- `docs/audits/TRANSFER_WINDOW_SOURCE_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No preferences screen, environment variable, JSON tuning panel, admin UI, or
  runtime date editing.
- No speculative catalog for unplayable competitions.
- No offer eligibility or negotiation behavior yet.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/content run test
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Inspect the first season before, on, inside, and after every boundary date.
- Inspect one later season to confirm the template rolls forward correctly.

## Completion Criteria

- The current playable competition resolves exactly two valid windows.
- Boundary behavior and later-season derivation are deterministic and tested.
- No generic or unused competition configuration exists.
- Step 03 is the only next implementation step.

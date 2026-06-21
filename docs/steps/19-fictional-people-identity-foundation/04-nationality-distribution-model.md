# 04 - Nationality Distribution Model

## Goal

Create a deterministic content model that chooses player nationality and name culture based on league nation, division, and club strength/reputation.

This step encodes the product rule discussed with the user: third-division squads should be mostly domestic, second division should be more mixed, and strong first-division clubs should be much more international.

## What to implement

- Content-owned nationality distribution profiles for club contexts such as:
  - third division;
  - second division;
  - first division average club;
  - first division strong/top club.
- Weighted buckets for:
  - domestic players;
  - nearby/regional European players;
  - broader European players;
  - South American players;
  - African players;
  - other international players.
- A deterministic selector that returns:
  - nationality;
  - optional second nationality when appropriate;
  - name culture.
- Inputs that include:
  - league country;
  - club category/division;
  - club reputation or strength band;
  - player slot/index or stable player ID;
  - seed/key parts.
- Tests that sample generated distributions and verify broad ranges, not exact fragile percentages.

## What NOT to implement

- Do not generate final player names yet.
- Do not add scouting fog.
- Do not add transfer eligibility rules.
- Do not add homegrown/registration rules.
- Do not add real countries beyond stable fictional/supporting codes needed by generated content.
- Do not add staff gameplay.
- Do not add UI.

## Expected files

- `packages/content/src/identity/nationality-distribution.ts`
- `packages/content/src/identity/nationality-distribution.test.ts`
- `packages/content/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/19-fictional-people-identity-foundation/05-player-identity-generation.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused nationality-distribution tests
- `pnpm check`
- deterministic repeatability test for the same seed/context
- `rg -n "Math.random|new Date\\(|Date.now|crypto.randomUUID|performance.now" packages/content/src`

## Definition of Done

- Nationality selection is deterministic.
- Third-division profiles are mostly domestic.
- Higher divisions and stronger clubs can produce more international squads.
- The model outputs structured identity data, not prose.
- `docs/PROJECT_STATUS.md` records the adopted distribution rules.

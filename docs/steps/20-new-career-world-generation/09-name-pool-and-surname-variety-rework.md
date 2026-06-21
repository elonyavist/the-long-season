# 09 - Name Pool And Surname Variety Rework

## Goal

Rework generated player names so squads and leagues do not feel artificially small because too many players share the same surname.

The previous Phase 20 pass avoided duplicate full names inside one club, but the user review showed that a 22-player squad could still contain too many repeated surnames. This rework tightens name variety before starting the playable career loop.

## What to implement

- Expand fictional surname pools where needed, especially the domestic lower-league pool.
- Keep generation deterministic by world seed.
- Keep generated names as content data, not localization labels.
- Enforce deterministic name selection rules:
  - no duplicate full name inside a club;
  - no repeated surname inside the same club under normal pool capacity;
  - no surname used more than two times in the generated league under normal pool capacity;
  - if a surname appears twice in a league, the first names must differ.
- Add quality tests:
  - a 22-player squad has at least 20-21 different surnames;
  - no surname appears more than once in the same club;
  - same seed produces the same generated names;
  - different seeds produce different generated names;
  - in the generated league, a surname appears at most twice and duplicated surnames have different first names.

## What NOT to implement

- Do not add real player databases.
- Do not add staff generation.
- Do not add youth intake.
- Do not add scouting fog.
- Do not add UI.
- Do not translate generated names.
- Do not start Phase 21.

## Expected files

- `packages/content/src/identity/name-cultures.ts`
- `packages/content/src/identity/name-cultures.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/audits/NEW_CAREER_WORLD_GENERATION_REPORT.md`

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused name-culture and fake-player tests
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001 --identity-review`
- `pnpm cli career --save=phase20-world-a --seed=world-a --new-world-preview`

## Definition of Done

- Generated squads no longer show obvious surname repetition.
- The current fake league satisfies the surname variety limits.
- Determinism and different-seed variation are tested.
- The Phase 20 report and `docs/PROJECT_STATUS.md` record the rework.


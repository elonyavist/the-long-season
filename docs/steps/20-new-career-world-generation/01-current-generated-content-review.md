# 01 - Current Generated Content Review

## Goal

Review how fake league, player, identity, lineup, career, and CLI content is currently generated before changing behavior.

This step must identify which generated data is already seed-driven, which data is still effectively fixed across new games, and where repeated names or repeated squad structures can make different careers feel too similar.

## What to implement

- Review the current content generation flow for:
  - fake league system creation;
  - generated clubs;
  - generated players;
  - generated identities;
  - nationality distribution;
  - default lineups and reserve players;
  - career bootstrap paths;
  - CLI season/career inspection commands.
- Identify whether the current `--seed` is acting as a match/season seed, a world seed, or both.
- Identify all places where generated players can repeat too visibly across new games.
- Identify where a persisted career save should store the generated world seed and generator version.
- Document the findings in `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not change generation behavior yet.
- Do not add new domain contracts yet.
- Do not create new CLI commands yet.
- Do not modify player abilities, potential, or nationality distribution yet.
- Do not add youth intake, scouting, growth, staff, market AI, contracts, wages, or UI.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/20-new-career-world-generation/02-career-world-seed-contract.md` only if a lesson learned changes future work.

## Required checks

- `rg -n "createFakeLeagueSystem|generateFakePlayersForClubs|playerIdentities|identity-review|career|save=|seed" packages apps docs requirements.md`
- `rg -n "Player[0-9]+ No[0-9]+|displayName|firstName|lastName|potential|birthDate" packages apps docs requirements.md`
- `pnpm check`

## Definition of Done

- The current generation path is understood.
- The step records whether current saves have a true world seed.
- The next step has enough information to define a minimal career world seed contract.
- `docs/PROJECT_STATUS.md` records the review result and next action.

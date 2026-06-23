# 04 - Player Generation Sanity Review

## Goal

Review generated player quality before the UI starts presenting squads as a core
screen.

The step should verify that current ability, potential, role templates,
division bands, age profiles, and rarity exceptions remain credible after the
latest generator work.

## Expected files

- `docs/audits/PRE_UI_PLAYER_GENERATION_SANITY_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Use the Step 01 scope and existing player-generation inspection commands.
- Create `docs/audits/PRE_UI_PLAYER_GENERATION_SANITY_REVIEW.md`.
- Review multiple generated worlds and selected clubs.
- Inspect at least:
  - role-appropriate attribute caps;
  - third-division current ability;
  - rare high-potential players;
  - young prospect distribution;
  - veteran quality exceptions;
  - nationality/name variety;
  - squad role coverage.
- Pay special attention to user-facing believability:
  - defenders should not look like elite finishers;
  - attackers should not look like elite markers;
  - third-division players should not already look like first-division stars;
  - potential exceptions should create stories without breaking the division.
- Classify findings by gameplay impact.
- Do not tune generation unless the step proves a scoped pre-UI blocker.

## What NOT to implement

- Do not change generation bands by default.
- Do not change rarity budgets by default.
- Do not add scouting fog.
- Do not expose hidden potential.
- Do not create UI contracts.
- Do not change names or club identity patterns unless a direct blocker is
  proven.

## Required checks

- `test -f docs/audits/PRE_UI_PLAYER_GENERATION_SANITY_REVIEW.md`
- `pnpm cli simulate-season --seed=world-a --player-generation-report`
- `pnpm cli simulate-season --seed=world-b --player-generation-report`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `git diff --check`

## Definition of Done

- The report states whether generated squads are believable enough for a first
  squad/dashboard UI.
- Any concern is tied to role, division, age, or user-facing believability.
- `docs/PROJECT_STATUS.md` records Step 04 as complete or blocked.

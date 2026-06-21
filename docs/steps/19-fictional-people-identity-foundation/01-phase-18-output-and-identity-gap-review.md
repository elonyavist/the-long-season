# 01 - Phase 18 Output And Identity Gap Review

## Goal

Review current player-name output after Phase 18 and confirm the exact identity gap before changing content generation.

This step keeps the phase grounded: the project should prove why identity work is the next useful foundation before touching domain or content contracts.

## What to review

- `docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`
- Current season output with top scorer/top assist/top saves.
- Current fixture detail output.
- Current career market apply and inspect output.
- Current fake player generation code.
- Existing `Player` entity fields for names, nationality-adjacent data, and birth date.
- Requirements sections on players, staff/scouting, content/modding, localization, and real-data/IP policy.

## What to produce

- A short identity-gap note in `docs/PROJECT_STATUS.md`.
- Optional updates to the next step document if the review changes the expected identity contract.

## What NOT to implement

- Do not change code in this step.
- Do not create name pools.
- Do not change player generation.
- Do not add staff contracts.
- Do not add UI.
- Do not add localization catalog entries.

## Expected files

- `docs/PROJECT_STATUS.md`
- `docs/steps/19-fictional-people-identity-foundation/02-person-identity-domain-contract.md` only if a lesson learned changes future work.

## Required checks

- `test -f docs/audits/PLAYABLE_LOOP_READINESS_REPORT.md`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006`
- `pnpm cli career --save=career-demo --inspect`
- `rg -n "Player[0-9]+ No[0-9]+|firstName|lastName|nationality|Staff|staff" packages docs requirements.md`

## Definition of Done

- The current placeholder-name problem is documented.
- The review confirms that names are content, not localization labels.
- The next step is still a small domain/content identity contract, not a gameplay system.
- `docs/PROJECT_STATUS.md` records the review result and next action.

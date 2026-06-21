# Phase 19 - Fictional People Identity Foundation

## Goal

Replace technical placeholder people names with deterministic fictional identities that make squads, transfers, reports, and future staff systems feel credible.

The project currently has enough career persistence to prove that a decision can survive between commands, but the experience still reads as a prototype because players are named like `Player18 No10`. Before building the first playable career loop, the game needs a believable identity foundation for football people.

## Product intent

Names and nationalities are not UI labels. They are game content.

The player should see squads that look plausible for the football world being simulated:

- lower divisions should be mostly domestic players, with a smaller number of nearby or low-cost foreign players;
- second divisions should still be strongly domestic, but with more European and international variety;
- top divisions should contain more international players, especially in stronger or richer clubs;
- names should match the generated person's name culture and nationality context;
- names must remain fictional, deterministic, and independent from real player databases;
- staff identity should reuse the same people foundation later, without introducing staff gameplay in this phase.

## Step order

1. `01-phase-18-output-and-identity-gap-review.md`
2. `02-person-identity-domain-contract.md`
3. `03-name-culture-pools.md`
4. `04-nationality-distribution-model.md`
5. `05-player-identity-generation.md`
6. `06-staff-identity-readiness.md`
7. `07-identity-cli-review-and-quality-report.md`

## Phase constraints

- Preserve deterministic output.
- Do not use real player, staff, agent, or coach databases.
- Do not imply real-world leagues, clubs, or licensed data.
- Do not translate generated names through i18n.
- Do localize labels around names, such as nationality labels, headings, statuses, and CLI report text.
- Keep generated identities content-owned, not engine-owned.
- Keep domain contracts language-agnostic.
- Do not add staff gameplay.
- Do not add scouting fog, youth intake, contracts, wages, agents, media, UI, or AI market behavior.
- Do not add automatic market or squad recommendations.
- Do not start the first playable career loop in this phase.

## Phase-level checks

At the end of the phase, run:

- focused tests for every touched package;
- `pnpm check`;
- a CLI roster/identity review command for one third-division fake club;
- a CLI roster/identity review command for a stronger/top-division fixture profile if implemented by the step;
- `pnpm cli simulate-season --seed=demo-001`;
- `pnpm cli career --seed=demo-001 --save=career-demo --apply-market-demo=pro01-affordable-permanent`;
- `pnpm cli career --save=career-demo --inspect`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.

## Definition of Done

- People identity has a small documented domain contract.
- Fictional name culture pools exist in content, not in engine.
- Nationality distribution is deterministic and depends on league nation, division, and club strength/reputation.
- Fake generated players no longer use `PlayerXX NoYY` display names.
- Staff identity needs are documented without adding staff gameplay.
- CLI can review generated identities and nationality distribution.
- A quality report states whether generated squads look credible enough before the first playable career loop.
- `docs/PROJECT_STATUS.md` explains the adopted identity model and next action.

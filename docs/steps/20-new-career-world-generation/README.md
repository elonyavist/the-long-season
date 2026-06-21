# Phase 20 - New Career World Generation

## Goal

Make each new career create a distinct fictional football world while preserving deterministic reproducibility.

The project currently has credible fictional identities, nationality distribution, career storage, transfer persistence, and CLI inspection. The next core gap is that fake content can still feel like the same world every time. A new game should create its own squads, names, nationalities, ages, prospects, and rare talents from a world seed, then persist that world inside the career save.

This phase is about new career creation, not match-by-match regeneration. Once a career is created, the generated people and squads must stay stable inside that save.

## Product intent

The player should feel that every new save can contain different stories:

- a third-division club may have mostly domestic players, with a few foreign players;
- a squad may have strong first-team players, rotation players, veterans, prospects, and rare high-upside players;
- a lower-division save can occasionally contain a rough diamond, but not every save should guarantee a wonderkid;
- names should remain fictional and deterministic;
- the same world seed should recreate the same career world;
- different world seeds should produce visibly different squads;
- flags are presentation assets tied to nationality metadata, not domain or engine logic.

## Step order

1. `01-current-generated-content-review.md`
2. `02-career-world-seed-contract.md`
3. `03-generated-player-archetypes.md`
4. `04-seeded-squad-generation.md`
5. `05-potential-age-and-prospect-distribution.md`
6. `06-cli-new-career-world-creation-preview.md`
7. `07-flag-asset-readiness.md`
8. `08-world-generation-quality-report.md`

## Phase constraints

- Preserve deterministic output.
- Generate people and squads per new career/world seed, not per fixture or per CLI render.
- Persist generated career world data once a career is created.
- Do not use real player, staff, or youth databases.
- Do not use real club roster data.
- Do not add youth intake gameplay.
- Do not add growth/decline simulation beyond initial generated age/potential data.
- Do not add scouting fog, scout reports, or hidden UI ranges in this phase.
- Do not add staff gameplay.
- Do not add transfer AI, loans, contracts, wages, or market windows.
- Do not add UI.
- Do not expose exact potential as normal user-facing information.
- Keep domain contracts language-agnostic.
- Keep generated content content-owned, not engine-owned.
- Keep flags as presentation asset mapping; domain and engine should know nationality keys, not SVG paths.

## Phase-level checks

At the end of the phase, run:

- focused tests for every touched package;
- `pnpm check`;
- `pnpm cli simulate-season --seed=demo-001`;
- `pnpm cli simulate-season --seed=demo-001 --identity-review`;
- a new-career/world preview or create command added by the phase;
- the same command with at least two different world seeds to verify visible variation;
- `pnpm cli career --save=<saveId> --inspect` if the phase writes a career save;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.

## Definition of Done

- The project has an explicit career world seed contract.
- Generated players can be varied by career/world seed.
- Generated squads include documented archetypes such as veterans, regulars, rotation players, prospects, and rare high-upside players.
- Age and potential distribution is deterministic, plausible, and tested.
- Repeated generated full names are reduced or explicitly reported as a remaining blocker.
- A CLI path can inspect or create a new career world from a seed.
- Nationality flag asset mapping is ready for future UI without coupling flags to domain/engine logic.
- A quality report states whether world generation is credible enough for the next playable career-loop phase.
- `docs/PROJECT_STATUS.md` explains the adopted world-generation model and next action.

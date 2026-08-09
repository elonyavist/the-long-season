# Step 06B7D - Checkpoint L4.2: Career Exit And Renewal

## Status

Done: `STOP / RETHINK`. The exit branch is reached and safe, but renewal remains
below target. Step 06B7E diagnoses generated ceiling versus realization.

## Goal

Decide whether the previously untested outfield exit owner restores credible
ten-season succession without eliminating exceptional veteran careers.

## Frozen Population And Before-State

- the same seven canary worlds, ten seasons, three competitions and exactly
  seven workers;
- new locked profile and cache contract;
- paired before-state:
  `simulation-out/phase81a-youth-minute-pathway-l4-1-7x10.json`, report hash
  `a3e411b27734c4df7e6b1addaabbcfb0`;
- only the Step 06B7C exit hazard differs.

## Frozen Gates

- all L4.1 academy-participation and promotion gates remain green;
- at least one real outfield age-`33/34` retirement exercises the new branch;
- season-ten active opening-senior share is `<= 0.60` of the `8,316` opening
  senior denominator (before: `0.7251`);
- season-ten opening-origin leaderboard share `<= 0.50`;
- season-ten career-generated leaderboard share `>= 0.30`;
- every world has at least one career-generated scorer or assist leader;
- at least one active `33+` player and one `33+` leader remain observed;
- unknown origin, stable-ID, department, finance, rating, rarity and academy
  reconciliation failures are zero.

## Decision

- **GO:** all gates pass; open 06B8.
- **REFINE:** only implementation, reachability or reconciliation fails; reopen
  06B7C without changing thresholds.
- **STOP / RETHINK:** the exit branch is exercised and safe but renewal still
  fails. Do not tune the curve after output; generation-quality conservation is
  the next lifecycle question and requires a new owner decision.

## Expected Files

- canonical generational-succession report module and tests only where frozen
  facts/gates must be exposed
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`; one locked `7 x 10 x 7` profile
- `docs/audits/PHASE_81A_CHECKPOINT_L4_2_CAREER_EXIT_AND_RENEWAL.md` **(new)**
- `docs/audits/README.md`
- this document, `06b8-checkpoint-l5-integrated-7x10-html.md`, phase README and
  `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-career-exit-renewal-l4-2-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-career-exit-renewal-l4-2-7x10.json
pnpm check
git diff --check
graphify update .
```

The checkpoint and repository gate run alone. Real command exit codes are
captured without a pipe.

## Definition Of Done

L4.2 records one decision. Only `GO` opens 06B8.

## Recorded Outcome

- report hash: `e645d8e11fb82df4cb19eb3e32e41e2b`;
- soft outfield age-`33/34` retirements: `403`;
- opening-senior survival: `5,450/8,316` (`65.54%`) against `<=60%`;
- generated leaders: `22/420` (`5.24%`) against `>=30%`;
- opening-origin leaders: `398/420` (`94.76%`) against `<=50%`;
- active `33+` players / leader rows: `2,638 / 268`.

The hazard improved every renewal measure and preserved older-player
reachability, but did not pass. Its probabilities remain frozen; L4.3 now
attributes the residual quality gap before another behaviour change.

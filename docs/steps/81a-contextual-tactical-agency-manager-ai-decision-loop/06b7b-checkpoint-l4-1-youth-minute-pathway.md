# Step 06B7B - Checkpoint L4.1: Youth-Minute Pathway

## Status

Done: `STOP / RETHINK`. Academy participation is correctly exercised, but the
renewal targets fail; Step 06B7C owns the previously untested exit lifecycle.

## Goal

Decide whether canonical academy match exposure repairs the demonstrated
development-conversion break without manufacturing results or weakening any
existing player-world invariant.

## Frozen Population And Baseline

- the same seven L1 canary worlds, ten seasons and three competitions;
- exactly seven workers, running alone;
- new locked profile/cache contract; no pre-06B7A shard is reusable;
- paired before-state is
  `simulation-out/phase81a-generational-succession-l4-final-7x10.json`, SHA-256
  `584f478f84233c9341c40dded50e89dae59e54b0697fdb43613e0f99c8d77aa0`;
- that before-state used the same command, worlds and engine except for the one
  academy-participation path added by 06B7A.

## Frozen Gates

### Participation truth

- academy fixture, appearance and minute counts are all positive;
- unknown origin, duplicate accrual, closed-month accrual and participation
  reconciliation failures are exactly `0`;
- every observed academy fixture contributes exactly `90` minutes;
- academy minutes per active player-month are within `90..270`, before any
  separately recorded senior minutes;
- at least one real player-month demonstrates the senior-load replacement
  branch and at least one demonstrates the full three-fixture branch;
- identical replay produces an identical report hash.

### Renewal outcome

The Step 06B7 targets remain unchanged:

- season-ten opening-origin leaderboard share `<= 0.50`;
- season-ten career-generated leaderboard share `>= 0.30`;
- every world has at least one career-generated scorer or assist leader;
- every competition-world has at least one completed academy-to-senior
  promotion over ten seasons;
- unknown origins and stable-ID failures are `0`;
- exceptional `33+` leaders remain reachable rather than forced to zero.

### Carried invariants

- current/potential ordering, rating scale, rarity budgets, academy/senior
  roster health, hard value cap and generated age distribution remain green;
- L2/L3 match-minute, substitution, availability and injury readers do not
  treat low-detail academy fixtures as senior matches;
- goals, assists, tables and transfer facts remain owned by their existing
  canonical producers.

## Decision

- **GO:** every participation, renewal and carried gate passes; open Step 06B8.
- **REFINE:** only an implementation/reconciliation defect in 06B7A fails;
  reopen 06B7A with all thresholds unchanged.
- **STOP / RETHINK:** the pathway is correctly exercised but renewal still
  fails. Do not increase fixture volume after seeing the output; identify the
  next lifecycle owner before another behaviour change.

## Expected Files

- canonical generational-succession report module and tests only where the
  frozen facts/gates must be exposed
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`; one locked L4.1 profile, exactly `7 x 10 x 7`
- `docs/audits/PHASE_81A_CHECKPOINT_L4_1_YOUTH_MINUTE_PATHWAY.md` **(new)**
- `docs/audits/README.md`
- this document, `06b8-checkpoint-l5-integrated-7x10-html.md`, phase README and
  `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-youth-minute-pathway-l4-1-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-youth-minute-pathway-l4-1-7x10.json
pnpm check
git diff --check
graphify update .
```

The checkpoint and repository gate run alone. Capture the real command exit
code without a pipe.

## Definition Of Done

L4.1 has one recorded `GO`, `REFINE` or `STOP / RETHINK`; only `GO` opens 06B8.

## Recorded Outcome

- report hash: `a3e411b27734c4df7e6b1addaabbcfb0`;
- academy appearances/minutes: `997,917 / 89,812,530`;
- missing/invalid participation rows: `0 / 0`;
- competition-worlds without a promotion: `0/21`;
- career-generated leader rows: `12/420` (`2.86%`) against `>= 30%`;
- opening-origin leader rows: `408/420` (`97.14%`) against `<= 50%`;
- worlds with a generated leader: `6/7` against `7/7`.

The pathway is valid but insufficient, so no fixture count or threshold moved.
The cohort also exposed that the prior retirement ablation had frozen exit
probability and therefore never tested the lifecycle now owned by 06B7C.

# Step 09 - Phase Report, Second Cohort And World-Extension Handoff

## Status

Not started.

## Entry Gate

- Phase 80, Phase 80A, Phase 81, Phase 82A, and Phase 82B Steps 01-08 are Done.
- Repository, build, persistence, browser, accessibility, and bounded race
  diagnostic gates are green.
- No Phase 82B production change remains pending.

## Goal

Close Phase 82B on non-vacuous race evidence, run and replay the second
checkpointed `50 x 20` over the completed competitive market, measure market
density against the frozen bands, and hand control to the world-extension work.

## Why This Phase Owns A Second Cohort

The 2026-08-02 phase order runs Phase 81 before the market phases. Phase 81
Step 12 therefore already ran the first checkpointed `50 x 20`, and it ran it
against a world with no loans, no postures, and no races. That run is valid
evidence for the accepted tactical match engine and is not valid evidence for
the market: the behaviour it would need to observe did not exist yet.

Reusing it here would certify a competitive market that the cohort never saw.
Phase 81C Step 07 later adds broad `750 x 10` evidence for complete domestic
fixtures and its free-agent foundation, but it likewise sees
no loans or races. This phase therefore still runs the dedicated completed-
market cohort. The runs answer different populations and none replaces another.

## What To Implement

- Re-run the exact Step 08 bounded race audit and require positive observations.
- Verify participant limits, seller qualification, raises, `outbid`,
  player choice, `lost_to_rival`, free-agent races, serial loans, ownership,
  finance, and stale-state protection.
- Run the checkpointed `50 x 20` with exactly seven workers and 50 stable
  shards, then replay it from checkpoints and require identical ordered shard
  hashes and an identical aggregate hash.
- Measure market density from the cohort against the frozen bands in the
  consolidated world analysis: arrivals per club per season, permanent share,
  contract-expiry share, loan share, fee-bearing share, and mean contract
  duration. Record every measured value, inside band or not.
- Re-measure the Phase 81C free-agent cycle at cohort scale - peak, trough, and
  drain attributed between signings and exits - now that loans and races both
  exist. Loans compete with free-agent signings for the same squad gaps, so this
  is the first run where the channel is observed under full competition. Report
  it beside the Phase 81C and Step 06 values so a slow erosion across three
  phases is visible rather than inferred.
- Run `pnpm check`, web build, Playwright, dependency, diff, and Graphify gates.
- Write the Phase 82B report with delivered behaviour, verification, measured
  density, warnings, and cleanup.
- Update active documentation so the world-extension work is the only next
  action after Phase 82B.
- Keep Phase 79 Step 14 Reopened, paused, unrun, and unclaimed.

## What NOT To Implement

- No production fix, tuning, threshold relaxation, seed exception, warning
  suppression, or report fabrication.
- No reuse of Phase 81 Step 15, Phase 81A Step 16 or Phase 81C Step 07 as
  completed-market evidence.
- No band adjustment driven by the measured result. The bands are frozen before
  the run; a miss is reported as a miss and owned by a named successor.
- No world-extension implementation.
- No Phase 79 Step 14/15 implementation.

## Expected Files

- `docs/audits/PHASE_82B_COMPETITIVE_TRANSFER_RACE_REPORT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- Phase 82B README
- this step document
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/transfer-race-audit.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Every bounded race gate has positive observations and passes.
- The second checkpointed `50 x 20` completes and replays with 50 stable shards
  and exactly seven workers, producing identical ordered shard hashes and an
  identical aggregate hash.
- Every frozen market-density band has a measured value recorded against it,
  and any miss is stated plainly with a named owner.
- The free-agent cycle still reaches its frozen trough under full competition,
  reported beside its Phase 81C and Step 06 values.
- Repository, browser, persistence, accessibility, dependency, diff, and
  Graphify gates pass.
- Phase 82B is complete.
- The world-extension work is the only next action; Phase 79 Step 14 remains
  paused, unrun, and unclaimed.

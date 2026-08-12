# Step 06B29 - Development-Horizon Role Succession

## Status

Done - rejected after L6.9 returned `REFINE: target_eligibility`.

## TESI

L6.8 showed that requiring a prospective successor's public P50 to sit within
the `0.5` ready-successor tolerance duplicates the canonical market score. A
role-succession need is a rebuilding decision, not a request for a player who
is already ready. The AI may prefer a prime-age player whose public P50 is
within the existing versioned `weakestQualityGap = 2.0` of the exact-role
group's current average, while retaining the complete generic fallback.

This is a new football hypothesis, not a relaxed L6.8 target. The `2.0` margin
already owns how far below squad quality a rebuilding target may sit; no new
post-output number is introduced.

## Product Contract

- only exact-role `role_succession` needs use the tier;
- age `18..29`, matching the engine's existing prime-successor horizon;
- only public current/P50 assessment, role, age and versioned content enter;
- stored potential, origin and future leaderboard facts are impossible inputs;
- seller safety, willingness, affordability, talk limits, stable ties and the
  generic fallback remain byte-identical;
- the branch remains analysis-only until L6.9; only `GO` collapses it into the
  single product path, every other verdict removes it.

## Reachability

Real generated worlds must show both a selected development-horizon target and
a succession fallback. A unit fixture also proves that the candidate can beat
a stronger-current veteran without bypassing any commercial filter.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and test;
- `packages/engine/src/career/advance-career-month.ts` and
  `advance-career-season.ts` for the temporary analysis seam;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`,
  `career-sections.ts`, `career-sections.test.ts`,
  `role-aware-market-reachability.test.ts`, `report-registry.ts` and
  `report-planner.test.ts`;
- `packages/i18n/src/labels.ts`;
- 06B29A, Phase README, status, audit/index and Graphify output.

No growth, aging, intake, retirement, match, lineup, fatigue, injury, finance,
save, formation or HTML rule changes.

## Outcome

The report hash `3d3f075d895e176424b7d4fc90d6c4c5` is again
byte-identical between arms: `4,040` fulfilled succession episodes, `5,198`
acquisitions and zero delta in age mix or downstream renewal. Widening the
quality horizon from the L6.8 half-point tolerance to the existing two-point
rebuilding margin still does not expose a distinct viable prime-age target.

The candidate is rejected and removed in full. This rules out target ordering
as the immediate owner. 06B29B instruments the canonical market funnel to
separate supply, seller safety, willingness, commercial affordability and
public-quality availability before another gameplay change.

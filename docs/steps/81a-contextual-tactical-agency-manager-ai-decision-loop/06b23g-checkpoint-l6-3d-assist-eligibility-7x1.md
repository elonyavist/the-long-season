# Step 06B23G - Checkpoint L6.3D Assist Eligibility 7 x 1

## Status

Done - `GO: assist semantics`; residual owner `dead_ball_supply`.

## Question

Does 06B23F reproduce the external non-dead-ball assist population without
hiding a separate dead-ball supply problem inside the same denominator?

## Frozen Population

- only entrypoint: `pnpm cli simulation-report`;
- profile: `phase81a-assist-eligibility-l6-3d-7x1`;
- seed prefix: `phase81a-assist-eligibility-l6-3d-v1`, unused elsewhere;
- exactly `7` worlds, `1` season and `7` workers;
- First Division is the historical comparison population; all divisions still
  simulate through the canonical career path;
- standard JSON output, no HTML and no cache reuse;
- no seed, target, module, denominator or reader changes after execution.

## Frozen Measurements

From durable goal events, every goal belongs to exactly one existing class:
penalty, self-created, distinct uncredited creator, credited assist.

Derive without storing duplicate facts:

```text
nonSetPieceGoalCount = totalGoalCount - penaltyGoalCount
nonSetPieceAssistedShare = creditedAssistGoalCount / nonSetPieceGoalCount
allGoalAssistedShare = creditedAssistGoalCount / totalGoalCount
deadBallGoalShare = penaltyGoalCount / totalGoalCount
```

The external comparisons remain semantically explicit:

| Metric | Target | Tolerance / material floor |
|---|---:|---:|
| non-set-piece assisted share | `0.7511574074` | `+/- 0.02` |
| all-goal assisted share | `0.6709744120` | `+/- 0.02` |
| external dead-ball goal share | `0.1067459292` | material gap `0.02` |

The game currently has penalty goals but no direct-free-kick goal path. Its row
is therefore named `deadBallGoalShare` for comparison but reports its exact
composition; no direct-free-kick count is inferred.

The checkpoint also carries top-ten assist mean, top-ten scorer mean, goal
rate, actor reachability, all four mutually exclusive goal classes, selection
fallbacks and every existing reconciliation fact. These are guardrails or
diagnostics; they cannot rewrite the three frozen comparisons.

## Decision

- **GO: assist semantics** when non-set-piece assisted share is inside its band,
  reconciliation is zero and ordinary eligible/ineligible branches remain
  reachable.
- If GO holds and all-goal share also holds, no residual assist-supply owner
  opens.
- If GO holds, all-goal share is too high and dead-ball share is below the
  external fact by at least `0.02`, record **residual: dead_ball_supply**. This
  opens only an attribution step for penalties/direct free kicks; it does not
  reopen 06B23F.
- **REFINE** when non-set-piece share misses or a 06B23F structural guardrail
  fails. Reopen only 06B23F with the external target unchanged.
- **STOP / RETHINK** on missing or double-counted goals, nonzero
  reconciliation, profile drift, fallback selection or an outcome that cannot
  be classified by the frozen truth table.

Top-ten assist concentration cannot independently turn this one-season
semantic checkpoint green or red. The later fresh `7 x 10` owns the career
leader distribution and generational renewal together.

## What NOT To Implement

- no gameplay, probability, penalty, direct-free-kick or creator change;
- no all-goal rescaling;
- no new report entrypoint or bespoke simulator;
- no HTML;
- no cached comparison presented as fresh evidence.

## Expected Files

- `apps/cli/src/commands/simulation-report/assist-supply-attribution.ts` and
  test: derived denominators and total decision, without a second goal reader;
- `apps/cli/src/commands/simulation-report/career-sections.ts`: expose the new
  checkpoint through the existing observer/report assembly;
- `apps/cli/src/commands/simulation-report/historical-simulation-targets.ts`
  and test: version the two external denominators and tolerances;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`: locked `7 x 1 x 7` profile;
- `packages/i18n/src/labels.ts`: profile presentation in all five languages;
- this step, Phase README, `docs/PROJECT_STATUS.md`, generated audit and index.

## Required Verification And Command

```bash
nvm use 24.16.0
pnpm exec vitest run apps/cli/src/commands/simulation-report/assist-supply-attribution.test.ts apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-assist-eligibility-l6-3d-7x1 \
  --format=json \
  --report-output=simulation-out/phase81a-assist-eligibility-l6-3d-7x1.json
git diff --check
graphify update .
```

The simulation runs alone after the full code gate. Exit `1` is a valid
REFINE/owner outcome only when reconciliation and structure remain sound.

## Outcome

The fresh profile completed with exit `0`, report decision `PASS`, all four
goal kinds reached and zero reconciliation. Non-set-piece assisted share is
`0.7578`, inside `0.7512 +/- 0.02`; 06B23F is accepted.

All-goal assisted share remains high at `0.7188` because penalty goals are only
`0.0515` of game goals against external dead-ball `0.1067`. The material gap is
`0.0552`, so the preregistered truth table records residual
`dead_ball_supply`. 06B23H must split penalty awards, penalty conversion and
direct-free-kick goals before any correction.

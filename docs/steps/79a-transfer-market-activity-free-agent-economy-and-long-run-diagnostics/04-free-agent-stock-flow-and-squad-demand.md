# Step 04 - Free-Agent Stock, Flow And Squad Demand

## Status

Done.

## Gate Refinement

Step 06 proved two supply edges that refine, rather than replace, this policy:
low-ability outfield free agents step down after two unattached seasons, while
goalkeepers receive five seasons because their later career curve otherwise
empties emergency supply. Replenishment keeps department priority but may sign
an affordable non-preferred free agent only while the club is below the hard
18-player floor. A retirement is deferred if it would empty the player's broad
department. These rules do not generate replacements, pad complete squads, or
automate the selected club.

## Goal

Bring the useful free-agent population to a bounded, football-credible
equilibrium without deleting players to satisfy a ratio or inflating senior
squads beyond their intended shape.

## Decision Contract

Use Step 02 evidence to classify the closing pool by:

- age;
- public/current ability;
- time unattached;
- source event;
- prior club status where available;
- later outcome: signed, preliminary activation, retirement, career step-down,
  or still unattached.

Before changing behavior, state whether the dominant problem is:

1. excessive expiry/release inflow;
2. insufficient demand for useful free agents;
3. squads stopping recruitment too early;
4. careers retaining non-viable unattached players too long;
5. an incorrect denominator or classification;
6. a combination, with measured contribution from each.

## Candidate Owners To Inspect

- AI renewal, expiry, and release decisions;
- free-agent eligibility and ranking;
- ordinary free-agent market recruitment;
- post-season squad replenishment and its target/department stop condition;
- preliminary-agreement activation;
- retirement and career-step-down policy.

The phase may adjust more than one owner only when stock/flow accounting proves
that one isolated correction cannot resolve the imbalance.

## Expected Files

- focused files and tests under `packages/engine/src/career/`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
  and tests only for factual stock/flow reporting
- `docs/audits/TRANSFER_MARKET_79A_DIAGNOSTIC_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Define an employable/useful free-agent diagnostic without exposing hidden
  potential or introducing UI policy into the engine.
- Add focused tests for at least:
  - useful prime-age free agent receives credible interest;
  - structurally complete clubs do not accumulate arbitrary surplus players;
  - low-value aging free agents may remain unattached and exit naturally;
  - same-day departures do not create illegal immediate churn;
  - selected-club decisions remain explicit;
  - squad and goalkeeper floors remain intact.
- Apply the smallest evidence-backed policy change.
- Verify the pool stock/flow equation after the change.
- Verify the correction does not manufacture wage or squad-size collapse.
- Update the diagnostic report and project status.

## What NOT To Implement

- No deletion based only on exceeding the free-agent-share threshold.
- No mandatory signing, hidden selected-club signing, roster padding, global
  squad-size increase, or generated replacement wave.
- No hidden-potential filtering.
- No lowering the `0.25` monitor threshold to make current output pass.
- No change to permanent-transfer policy; Step 03 owns it.
- No `50 x 20` or larger cohort.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run test
pnpm --filter @game/simulation-tools run typecheck
pnpm check
git diff --check
```

Use named representative worlds and small focused cohorts only.

## Definition Of Done

- The former accumulation mechanism is measured and covered by focused tests.
- Useful players have a credible route back into employment.
- Non-viable unattached players leave only through explicit career lifecycle
  policy.
- Free-agent stock reaches a bounded trajectory in representative 20-season
  worlds without artificial deletion or squad inflation.
- Structural squad, goalkeeper, contract, finance, and window checks pass.

# Step 06B29J - Public-Runway Successor Selection

## Status

Done - `STOP / RETHINK`; candidate rejected and removed on 2026-08-12.

## User-Facing Reason

A club buying a future successor should prefer a player who is both good enough
for its role and visibly capable of improving. Today it can buy a 21-29-year-old
whose public projection is already almost exhausted, producing an older squad
without a credible handover story. The AI must not see hidden potential; it may
use only the same public current and P50 projection available to the manager.

## Candidate

For a `role_succession` need only, build nested subsets from candidates that
already passed every ordinary seller, willingness, fee, wage and cash check:

1. exact required primary role, age `18..29`, public P50 ability at or above the
   existing club-local succession floor;
2. inside that set, public runway
   `p50Ability - currentAbility >= 0.5`.

Choose the highest existing generic score from the runway subset when nonempty;
otherwise choose the highest existing generic score from the qualified
prime-age subset; if that too is empty, keep the ordinary winner. Stable player
ID remains the final tie-breaker. There is no bonus, new score, budget, extra
market action, formation knowledge or stored-potential read.

The candidate is analysis-only until L6.14. Any verdict other than `GO` removes
the branch, flag, profile and labels. `GO` collapses it into the sole production
path and removes the flag in the same step.

## Frozen Paired Checkpoint L6.14

- same seven L6.11 seeds and ten seasons, exactly seven workers;
- control: read-only L6.11 candidate cache;
- candidate: fresh public-runway worlds with a distinct checkpoint identity;
- same player population and deterministic streams until the first target
  selection that the new subset changes;
- L6.12B and L6.13 are evaluated directly on the candidate facts.

### Required Movement

- at least `35` real choices where a public-runway qualified player exists and
  the ordinary qualified winner is outside that subset;
- candidate generated-prime acquisition count at least `80%` of control
  (`>= 71` from the frozen 88-row control);
- low-growth share among eligible generated prime-age acquisitions falls by at
  least `0.15` from control `61/88 = 0.693182`;
- insufficient-room share inside low-growth rows falls by at least `0.20` from
  control `43/61 = 0.704918`;
- local replacement capacity delta `>= +0.03`, positive in `>= 5/7` worlds;
- career-generated leader share delta `>= +0.03`, positive in `>= 5/7` worlds.

### Guardrails

- division replacement capacity `>= 0.50` and delta `>= -0.02`;
- formation retention delta `>= -0.02`, with `>= 5/7` candidate worlds at
  `>= 0.75`;
- transfer-acquisition volume ratio `0.80..1.05`;
- First-Division champion mean `72..88`;
- zero reconciliation or population-signature failures;
- L6.12B candidate denominator `>= 35` and all existing structural gate readers
  remain unchanged.

`GO` requires every movement and guardrail. A moved target pool without local
and leader realization is `REFINE`; a guardrail or structural failure is
`STOP_RETHINK`.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and test;
- `packages/engine/src/career/advance-career-month.ts` and
  `advance-career-season.ts`;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/report-registry.ts`, planner test and
  `packages/i18n/src/labels.ts`;
- this document, L6.13 audit/index, Phase README and `docs/PROJECT_STATUS.md`.

No content, persistence, web, HTML, development-rate, match or save change.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-public-runway-succession-l6-14-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-public-runway-succession-l6-14-7x10.json
git diff --check
```

## Outcome

The paired run reconciled all worlds and wrote SHA-256
`8b554337245fba5a668dc41ea94da4a60a088adf608fba1fb7112775b99dbc15`.
The public-runway preference strongly moved the intended acquisition facts:

- changed ordinary winner: `5,702` observed decisions;
- eligible generated prime-age acquisitions: `88 -> 266`;
- low-growth share: `0.6932 -> 0.4060`;
- insufficient-room share among low-growth rows: `0.7049 -> 0.2778`;
- local replacement: `+0.0352`, positive in `5/7` worlds.

It failed the linked outcome and a material guardrail:

- career-generated leader share: `0.2429 -> 0.2238` (`-0.0190`), positive in
  only `2/7` worlds;
- transfer acquisitions: `4,968 -> 6,329`, ratio `1.2740` against `<= 1.05`.

The correct verdict is `STOP / RETHINK`: the candidate buys and develops more
visible-runway players, but creates excessive churn and fewer leaders. The
branch, flag, profile, labels and candidate-only tests are removed. The JSON is
historical evidence only and cannot be rendered as the current product.

The next step is observation-only: identify why already developed
career-generated players do not enter the season-ten leader set. No further
target-selection or development change opens from L6.14.

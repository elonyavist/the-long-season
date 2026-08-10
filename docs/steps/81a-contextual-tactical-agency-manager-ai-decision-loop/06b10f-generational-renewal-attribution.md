# Step 06B10F - Generational-Renewal Attribution

## Status

**Done on 2026-08-09.** The locked `7 x 10` population identifies
`development_realization`; no broad intake, promotion, selection or exit edit
is authorized.

## Goal

Locate the loss between annual generation and season-ten leadership without
assuming that more generated players is the remedy.

## Method

Keep separate denominators for generated, developed to senior quality,
promoted, selected, given material minutes and reaching leaderboards. Reuse the
canonical origin and participation facts already owned by the generational
succession report module.

Production inspection found that `selectedPlayerCount / registeredSeniorCount`
is not a legal funnel: selected academy call-ups are deliberately not registered
seniors, and the real value is therefore `1.4138`. The old ratio is retained for
historical reports but is not used here. Two non-derived row counts are added at
the canonical season observation instead:

- `seniorQualityPlayerCount`: current ability at least the same competition's
  frozen opening-senior median;
- `seniorQualityMaterialMinutePlayerCount`: above the same quality floor and at
  least `900` minutes in that season.

The ordered owner bands are frozen before the new output:

1. career-generated/opening population below `0.50`: intake quality/quantity;
2. season-ten generated senior-quality share below `0.25`: development
   realization;
3. mature academy-to-candidate below `0.25` or candidate-to-promotion below
   `0.50`: promotion opportunity;
4. material-minute players below `0.50` of generated senior-quality players:
   selection opportunity;
5. all upstream ratios healthy but opening-senior survival above `0.60`:
   exit/retention balance;
6. all upstream ratios healthy and only leadership remains red while 06B10E
   owns actor allocation: downstream actor allocation.

An empty denominator is `not_attributed`, never zero. The first broken stage
owns the result; later ratios cannot excuse it.

## Exit

Name exactly one immediate owner: intake quality/quantity, development
realization, promotion/selection opportunity, or exit/retention balance. An
unresolved multi-owner span returns `STOP / RETHINK`; no broad renewal edit is
authorized.

## Expected Files

- `apps/cli/src/commands/simulation-report/generational-succession.ts` and
  tests;
- `owner-attribution.ts` and tests for the single-owner decision;
- `report-registry.ts` and planner tests: bump only the locked owner-profile
  shard suffix because the generational row contract gained two facts;
- this step, phase README and project status.

## Required Checks

All funnel reconciliations and classification branches reachable on real data,
focused tests, `pnpm check`, `git diff --check`, `graphify update .`.

## Outcome

The ordered funnel stops at its second stage:

| Fact | Observed |
|---|---:|
| career-generated / opening population | `0.7985` |
| season-ten generated senior-quality share | `0.1090` |
| mature academy / candidate | `0.6688` |
| candidate / promotion | `0.6228` |
| senior-quality material minutes / senior quality | `0.7693` |
| opening-senior survival | `0.5456` |
| reconciliation failures | `0` |

Intake quantity, promotion and material selection all clear their frozen bands.
The generated population exists and gets minutes, but too few reach the opening
senior-quality floor by season ten. Step 06B13 therefore owns development
realization only.

## Verification

- locked artifact:
  `simulation-out/phase81a-l5-1-owner-attribution-7x10-retry.json`;
- `7` worlds x `10` seasons, exactly `7` workers, process exit `0`;
- focused generational and owner-attribution tests pass;
- the complete repository gate is recorded by Step 06B10H after the shared
  measurement-only tranche is documented.

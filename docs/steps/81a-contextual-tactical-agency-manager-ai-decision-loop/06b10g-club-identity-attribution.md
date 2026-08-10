# Step 06B10G - Club-Identity Attribution

## Status

**Done on 2026-08-09.** The locked cohort identifies
`annual_intake_identity_erosion`.

## Goal

Attribute the exact four-replicated-formation retention failure (`0.8905`), not
a different modal-shape statistic.

## Method

Join each failed competition-season to opening/current club role vectors,
annual intake allocations, current ability and canonical AI selections. Compare
same-quality clubs whose role vector remained near or moved away from their
opening identity.

`planCompetitionAnnualIntakePositions(...)` is a candidate only when role
distance predicts the exact gate failure while the league role deck remains
healthy.

## Exit

`annual_intake_identity_erosion` or `STOP / RETHINK`. No formation is stored,
assigned or protected.

## Expected Files

- the canonical four-replicated-formation gate owner and tests;
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and tests;
- `generational-succession.ts` only for existing role-plan facts;
- this step, phase README and project status.

## Required Checks

Metric identity test against integrated L5, real-data causal reachability,
focused tests, `pnpm check`, `git diff --check`, `graphify update .`.

## Outcome

- exact four-replicated-formation retention: `0.8905`;
- annual league role-plan invariant: healthy;
- same-quality changed-shape clubs: `393`;
- opening-role distance when shape changed: `0.1763`;
- opening-role distance when shape stayed stable: `0.0857`;
- reconciliation failures: `0`.

The league deck remains balanced, but clubs that drift farther from their own
opening role vector are materially more likely to lose their replicated shape.
Step 06B16 may therefore preserve a soft club role blueprint inside the annual
league allocation. It may not store, assign or protect a formation.

## Verification

The facts come from the same locked
`phase81a-l5-1-owner-attribution-7x10-retry.json` run as 06B10F. The owner test
uses the exact integrated-L5 retention reader rather than a modal-shape proxy.

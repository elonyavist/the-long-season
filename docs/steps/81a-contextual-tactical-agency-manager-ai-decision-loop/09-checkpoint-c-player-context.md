# Step 09 - Checkpoint C: Player Context

## Status

**Done on 2026-08-13: `REFINE: product_premise_review`.** Every player-context,
structural, dominance and blind-neutral gate passed. Only the unchanged
`+0.045/-0.045` adversarial materiality target remained red. Steps 07-08 stay
closed; Step 09A owns the MVP product-premise amendment.

## Goal

Verify structural Leverage survives real players and populations and that squad
identity, not catalog order or fixture construction, explains formation choice.

## Experiment

Use paired career counterfactuals. Hold snapshot, rosters, availability,
fitness, morale, home/away, opponent, XI/formation when isolating tactics, and
match seed constant. Vary only the tested policy. Formation-policy changes that
alter the XI are reported separately.

Analytically recalculate `R / N_eff` and ubiquity over all signatures. Never use
the maximum-32 Monte Carlo subset for that gate.

Reuse the seven numeric A2 targets that really were frozen before squad
identity was implemented: top share `<=0.50`, at least `6` formations, `10/10`
roles, at least `3` identity modal shapes, reorder invariance `1.0`, no avoidable
out-of-position slots, and all `8` identities in each set. Do not invent a
post-output “relative improvement” target.

Re-run the larger B2 population after Steps 07-08. Its analytic diversity,
original dominance and blind-neutral gates remain binding. The
`+0.045/-0.045` materiality target is reported, not discarded. If it is the
only red after player and lateral execution are both causally present, C names
`product_premise_review`; it does not reopen those absolved implementations.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_C_PLAYER_CONTEXT.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-section.test.ts`; the
  checkpoint decision is a pure truth table, including the fail-closed paths;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`; register one locked `phase81a-c` composition using
  existing A2, downstream B2 and original-dominance producers;
- `packages/i18n/src/labels.ts`; visible profile title and description in all
  five supported languages;
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `09a-mvp-own-squad-agency-contract.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-c --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-c-player-context.json
pnpm check
git diff --check
```

## Decision

- `GO` opens Step 10 only when A2, analytic diversity, dominance, blind neutral
  and the unchanged materiality arms all pass.
- `REFINE: product_premise_review` when every structural/player/side gate passes
  and only `+0.045/-0.045` remains red. This opens a preregistered target-premise
  checkpoint; it may not reopen 07/08 or tune result variance.
- `REFINE: player_context` reopens only the demonstrated structural owner.
- `STOP / RETHINK` records catalog dependence, a universal strategy, failed
  reconciliation, missing telemetry or contradictory seed-set owners.

## Result

The locked `42`-world composition returned real exit `1` and
`REFINE_PRODUCT_PREMISE`. A2 passes at `0.1270/0.1349` top-formation share,
`14/11` distinct shapes, all ten roles, all eight identities and zero avoidable
out-of-position slots. Both untouched downstream populations retain six of
nine best-response signatures, ubiquity `3.1971/3.1601`, material cycles,
blind neutrality and the three original dominance gates.

Optimistic player-aware response arms reach `+0.02258/-0.01832` and
`+0.02162/-0.01629`. These are evidence against the old `+0.045/-0.045`
contract, not replacement targets. The accepted MVP already defers
opponent-aware AI, so Step 09A must freeze an own-squad, season-level agency
contract before any later implementation or measurement.

Artifact:
`simulation-out/phase81a-checkpoint-c-player-context.json`, SHA-256
`4605f3aba8965de954b0fda85c258f5b9b9764cdcf2677a77ed86a7aad0bd766`.

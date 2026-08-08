# Step 09 - Checkpoint C: Player Context

## Status

Not started; requires Steps 07-08 Done.

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

Use the numeric relative targets preregistered before Step 08. Primary gates:
tie-decided share improves by that frozen amount, catalog reorder is invariant,
club choice is stable at comparable availability, all ten roles are reachable,
original dominance semantics pass, and B ceiling/exposure/context-free targets
reproduce out of sample.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_C_PLAYER_CONTEXT.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `10-manager-opponent-read.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-c --workers=7
pnpm check
git diff --check
```

## Decision

GO opens Step 10. REFINE reopens only 07/08. STOP records player-context
collapse, catalog-order dependence, or a restored universal strategy.

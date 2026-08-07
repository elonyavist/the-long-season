# Step 12 - Checkpoint D: Manager And AI Agency

## Status

Not started; requires Steps 10-11 Done.

## Goal

Prove observable information lets manager and AI realize the structural ceiling
without hidden access or a universal exploit against fixed AI formation policy.

## Experiment

Pair informed-correct, informed-exposed, blind/non-commit, AI same-read,
AI-low-confidence, pre-match, and half-time policies. In replay, each action is
derived only from `OpponentRead`; no Checkpoint B oracle enters product paths.

D preregisters the five-component pre-persistence profile. It excludes
`formation_history` and records it as `not_observed`; it never substitutes live
formation, reconstructs history, or treats absence as a neutral formation. The
report therefore answers whether route, pressing/risk, lateral, half-time, and
sample/confidence evidence can realize agency without historical formation.

Targets:

- `realized_manager_agency >= +0.045`;
- `realized_manager_exposure <= -0.045`;
- blind/non-commit `|delta| <= 0.015`;
- all branches reachable;
- no AI-only input;
- no universal human tactic exploits squad-owned AI formation;
- `best_response_ubiquity_multiple <= 4` over available signatures.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_D_MANAGER_AI_AGENCY.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/live-match/live-match-control-gate.ts`
- `apps/cli/src/commands/tactical-agency-report.ts`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `13-tactical-chapters-and-canonical-explanation.md`

## Required Checks

```bash
nvm use 24
pnpm cli tactical-agency-report --checkpoint=d --workers=7
pnpm web:visual:qa
pnpm check
git diff --check
```

Each gate runs alone.

## Decision

- **GO:** the five-component read meets the targets and opens Step 13. The report
  states explicitly that historical formation was not needed to establish D.
- **REFINE:** an implemented five-component fact or manager/AI mapping is wrong;
  reopen only 10/11 and repeat D.
- **STOP / RETHINK:** the correctly implemented five-component information set
  cannot realize the target. Do not blame hidden information and do not open
  Step 14 speculatively; reconsider phase order before adding the sixth fact.

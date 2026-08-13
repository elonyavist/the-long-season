# Step 12C - Checkpoint D2: Specialised Own-Squad Agency

## Status

**Ready.** Step 12B is green; both D2 populations remain ungenerated and
uninspected.

## Goal

Decide the specialised-plan product on two untouched populations, then measure
historical football on enough seasons to make rare upset readers interpretable.

## Locked Population

- focused sets: `phase81a-specialised-own-squad-c` and
  `phase81a-specialised-own-squad-d`, seven worlds each;
- eight identity clubs, 34 fixtures, eight paired seeds and four arms;
- historical lane: the same seven worlds for five seasons per set;
- exactly seven workers; sets decided independently;
- renewal explicitly `not_evaluated`.

## Frozen Gates

All effect bands remain those of Step 09A and Amendment A8. Each set also needs
all six profiles and three focuses, at least six modal complete policies,
maximum modal share `<= 0.35`, exact reorder invariance, `>=4/6` causal policy
movement, all A2/no-dominance gates, every powered historical reader and zero
opponent-source reads.

## Expected Files

- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.test.ts`
- `apps/cli/src/commands/simulation-report/own-squad-agency-section.ts`
- `apps/cli/src/commands/simulation-report/own-squad-agency-section.test.ts`
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/audits/PHASE_81A_CHECKPOINT_D2_SPECIALISED_OWN_SQUAD_AGENCY.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `13-tactical-chapters-and-canonical-explanation.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-d2-specialised-own-squad-agency \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-d2-specialised.json
pnpm check
git diff --check
graphify update .
```

Run the checkpoint and `pnpm check` separately.

## Decision

- **GO:** both focused and powered historical sets pass; Step 13 opens.
- **REFINE:** only an attributed selector, plan execution, result-resolution or
  historical owner reopens; no frozen value moves.
- **STOP / RETHINK:** opponent-free specialised plans still cannot produce the
  bounded effect, blind choice wins, variance must be removed, or one universal
  plan returns.

## Definition Of Done

D2 records population, raw metrics, reconciliation and GO/REFINE/STOP twice;
no output is interpreted as renewal evidence; only GO opens Step 13.

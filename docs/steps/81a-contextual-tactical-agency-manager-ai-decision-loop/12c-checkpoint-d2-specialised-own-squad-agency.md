# Step 12C - Checkpoint D2: Specialised Own-Squad Agency

## Status

**Done — `REFINE`.** Both fresh D2 sets preserve structural policy variety and
blind neutrality, but correct fit and mismatch remain below the frozen season-
point magnitude. Step 12D owns translation attribution; Step 13 stays closed.

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
- `12-checkpoint-d-own-squad-agency.md`. Its obsolete runnable profile is
  removed when D2 becomes the sole current owner; the frozen D audit and git
  commit retain the historical evidence without a misleading live command.
- this step document
- `12d-checkpoint-d2-translation-attribution.md`. D2 cannot name a gameplay
  owner from points alone, so the next observational step is documented before
  any coefficient is authorized.
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

## Outcome — 2026-08-13

The locked report ran alone with seven workers for `1,650,669 ms`, exited `1`
and wrote hash `0bd9ef5a0aec25d888a220418997eac3`. D2-C/D2-D measured own-fit
`+0.4531/+0.2009`, mismatch `-0.3415/-0.4955`, blind
`-0.2500/-0.2076`, and fit-minus-mismatch `0.7946/0.6964`. Both sets retain
eight distinct modal policies at maximum share `0.125`, all three focuses,
exact reorder invariance, `6/6` constant-quality policy movement and zero
opponent reads.

The focused eight-club sample did not observe `high_press`, and D2-D also did
not observe `balanced`; an all-club read-only diagnostic found those plans
reachable, so this remains a sampled coverage failure rather than dead content.
Historical readers also remain red. No target moved and no gameplay correction
was inferred. The adopted verdict is `REFINE`; Step 12D measures canonical xG,
goal and point translation on the same paired replay.

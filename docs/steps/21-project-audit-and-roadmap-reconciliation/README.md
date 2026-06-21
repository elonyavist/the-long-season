# Phase 21 - Project Audit And Roadmap Reconciliation

## Goal

Run a full project audit before opening the first playable career-loop phase.

Phases 00-20 created a deterministic simulation core, fixture inspection, player stats, tactics, manual tactical changes, fitness, manual lineup rotation, squad/formation fit, localization, career persistence, permanent transfers, fictional identities, and new career world generation. The project now has enough moving parts that the next phase should not be selected only from momentum.

This phase checks whether the current code, documentation, audits, and roadmap still agree with each other, then recommends the next implementation phase from evidence.

## Product intent

The player-facing goal remains a deterministic offline football manager where the user makes the meaningful choices:

- choose a club and start a distinct fictional career world;
- inspect squad, players, identities, formation fit, condition, market options, and saved career state;
- choose lineups, tactics, tactical switches, and market actions manually;
- see decisions persist and create believable consequences over time.

Before adding more career systems, this phase should answer whether the foundation is coherent enough for a playable loop, or whether a focused rework is needed first.

## Step order

1. `01-documentation-state-audit.md`
2. `02-code-boundary-and-dead-code-audit.md`
3. `03-determinism-and-save-consistency-audit.md`
4. `04-product-loop-readiness-audit.md`
5. `05-roadmap-dependency-reconciliation.md`
6. `06-risk-and-priority-report.md`
7. `07-next-phase-spec-recommendation.md`

## Phase constraints

- Preserve deterministic output.
- Do not implement gameplay features in this phase.
- Do not start the next phase.
- Do not rewrite requirements, project rules, or roadmap documents unless a step explicitly documents a narrow correction.
- Do not fix source code during the audit unless the active step explicitly allows a scoped correction.
- Do not hide findings in chat; record them in `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md` and `docs/PROJECT_STATUS.md`.
- Keep user-facing manager choice boundaries intact: no automatic lineup, tactic, market, or squad-need decisions should be introduced.
- Keep localization policy in mind when reviewing CLI/UI-facing text.
- Do not add dead code, compatibility leftovers, unused helpers, or deferred cleanup.

## Phase-level checks

At the end of the phase, run the checks required by the active audit findings. Unless blocked, include:

- `pnpm check`;
- `pnpm cli simulate-season --seed=demo-001`;
- `pnpm cli simulate-season --seed=world-a --identity-review`;
- `pnpm cli simulate-season --seed=world-b --identity-review`;
- `pnpm cli career --save=phase21-audit-world --seed=world-a --new-world-preview`;
- `pnpm cli career --save=phase21-audit-world --inspect`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`.

The audit may add focused `rg`, dependency, or package-level checks inside individual steps.

## Definition of Done

- `docs/audits/PROJECT_ROADMAP_AND_CODE_AUDIT.md` exists.
- Documentation state, code boundaries, determinism, save consistency, product-loop readiness, and roadmap dependencies have been reviewed.
- Findings are prioritized as blocker/high/medium/low.
- The next phase recommendation is explicit and evidence-based.
- `docs/PROJECT_STATUS.md` explains whether the project should proceed to a playable career loop or complete a focused rework first.
- The project still identifies exactly one active implementation step.


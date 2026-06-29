# Engine Safety Net Command Pack

Date: 2026-06-25
Phase: `62-engine-safety-net-and-deterministic-regression-gates`

## Purpose

Use this command pack after phases that touch match simulation, season
simulation, career fixture progression, player-state consequences, player/world
generation, or balance gates.

The goal is to protect the user's trust and fun. A warning is a design signal:
inspect whether the football world still feels credible before changing
thresholds or tuning numbers.

## Mandatory Setup

Run Node 24 before every package command:

```sh
source ~/.nvm/nvm.sh
nvm use 24
```

## Fast Local Gates

Run these after narrow engine changes.

```sh
pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts
```

Purpose:

- protects full-season determinism;
- verifies table/player-stat consistency;
- catches accidental drift through the compact season golden sentinel.

```sh
pnpm exec vitest run packages/engine/src/match-engine/simulate-match.test.ts
pnpm exec vitest run packages/engine/src/match-engine/step-match.test.ts
```

Purpose:

- protects match repeatability;
- protects low-event and no-event match credibility;
- verifies causal event attribution and explanation trace non-interference.

```sh
pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts
```

Purpose:

- protects current selected-club fixture progression;
- verifies match result application, condition deltas, and deterministic report
  facts before broader career advancement changes.

```sh
pnpm --filter @game/engine run typecheck
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/cli run typecheck
```

Purpose:

- catches contract drift across engine, domain, content, UI read models, and
  CLI adapter code.

```sh
git diff --check
```

Purpose:

- catches whitespace issues before handoff.

## Adapter Smoke Checks

Run these when a phase touches CLI composition, career saves, or read models
used by the web UI.

```sh
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
```

Purpose:

- verifies the human-readable season and fixture inspections still run;
- checks that structured match explanations remain available without making
  localized prose the regression oracle.

```sh
pnpm cli career --save=phase-safety-check --seed=world-a --new-world-preview
pnpm cli career --save=phase-safety-check --summary
pnpm cli career --save=phase-safety-check --set-lineup-demo=pro01-first-team
pnpm cli career --save=phase-safety-check --set-tactic-demo=pro01-balanced
pnpm cli career --save=phase-safety-check --advance-next-fixture
```

Purpose:

- verifies career save creation, summary reading, and current fixture
  progression through the CLI adapter;
- catches storage/composition mistakes outside the pure engine tests.

Note:

- `--advance-next-fixture` is expected to reject a save without saved lineup and
  tactic. Prepare the save first when the smoke check is meant to verify a
  successful fixture advance.

## Balance And Plausibility Gates

Run these after phases that touch match probabilities, player quality,
generation, growth/decline, squad turnover, table spread, or balance targets.

```sh
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Purpose:

- fast balance smoke;
- protects goals per match, win/draw rates, table spread, first/last points,
  and upset proxy ranges.

Warnings must trigger a gameplay review, not automatic threshold tuning. Ask:

- does the warning hurt the manager's sense of a credible football world?
- is the issue caused by a real engine bug, missing career rule, or just natural
  variance?
- would changing the threshold hide a real design problem?

## Heavier Confidence Runs

Use heavier runs before closing phases that can affect long-term career
structure.

Recommended confidence gate:

```sh
pnpm cli ten-season-report --seed-prefix=long-run --worlds=250 --seasons=30 --report-output=docs/audits/LONG_RUN_CONFIDENCE_REPORT.md
```

Purpose:

- checks that squad structure, youth/turnover, and long-term career state do
  not collapse across many worlds.

Operational stress gate:

```sh
pnpm cli ten-season-report --seed-prefix=stress --worlds=10000 --seasons=50 --report-output=docs/audits/LONG_RUN_STRESS_REPORT.md
```

Purpose:

- expensive runtime confidence only;
- not a normal local step gate unless the active phase explicitly requires it.

The long-run gate can emit warnings or failures. Record the command actually
run, the report path, and the gameplay interpretation in the phase report.

## Full Local Closeout

Run this before closing a phase that touched multiple packages:

```sh
pnpm check
graphify update .
```

Purpose:

- `pnpm check` verifies the repository-level test/build/typecheck contract;
- `graphify update .` keeps the architecture graph current after source
  changes.

## Project Rule Cross-Reference

This command pack follows `docs/PROJECT_RULES.md`:

- engine/domain emit structured facts only;
- localized prose is presentation, not engine truth;
- gameplay warnings protect fun and credibility, not only numeric neatness;
- Node 24 must be active before installing dependencies or running package
  commands;
- Playwright/browser QA remains mandatory only for web/UI phases, not for this
  engine-only phase.

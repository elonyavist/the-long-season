# Phase 64 - Match Consequences And Player State Reactivity

## Goal

Make played career fixtures change player state in a football-plausible,
deterministic, and manager-visible way.

Phase 41 and Phase 42 already made fitness spend and recovery meaningful.
Phase 63 then centralized season advancement. Phase 64 must now make the
selected club's matchday create bounded form and morale consequences, so lineup
choices, results, and player performances matter across weeks.

## Product intent

The user should feel that:

- a match leaves traces beyond the scoreline;
- good or bad performances can affect short-term form;
- wins, losses, and visible involvement can affect morale;
- rotation and selection become meaningful without the game telling the manager
  what to do;
- post-match output answers "what changed?" through facts, not advice.

## Architecture intent

Add a narrow engine rule around existing career fixture progression:

- `progressNextCareerFixture` remains the one-fixture career matchday entry
  point;
- existing fitness spend/recovery remains intact;
- new form/morale consequences are pure, deterministic, bounded, and
  language-agnostic;
- CLI may render inspection output, but it must not own consequence rules;
- future web UI can consume the same structured facts.

The implementation should prefer one deep module over scattered helper logic.

## Binding constraints

- Engine/domain emit structured facts only.
- Do not persist rendered prose.
- Do not introduce LLM or narrative content.
- Do not add injuries.
- Do not add team talks.
- Do not add a personality system.
- Do not add training, staff, medical, facilities, contracts, economy, or
  market behavior.
- Do not tune match scoring, table balance, player generation, or long-run
  thresholds just to make reports greener.
- Do not auto-rotate, auto-pick lineups, or provide automatic user advice.
- Do not make hidden manager decisions for the selected club.
- If durable bench/minutes data is not available, do not fake detailed bench
  morale. Document the limitation and keep v1 to facts currently supported.
- Keep all deltas bounded and explainable by user-facing football reasons.
- Preserve deterministic output for the same save, seed, preparation, and match
  config.

## Ordered steps

1. [01-current-player-state-and-match-consequence-audit.md](01-current-player-state-and-match-consequence-audit.md)
2. [02-consequence-model-and-state-contract.md](02-consequence-model-and-state-contract.md)
3. [03-engine-post-match-player-state-module.md](03-engine-post-match-player-state-module.md)
4. [04-progress-fixture-integration-and-structured-facts.md](04-progress-fixture-integration-and-structured-facts.md)
5. [05-cli-post-match-reactivity-output.md](05-cli-post-match-reactivity-output.md)
6. [06-next-fixture-reactivity-and-season-boundary-checks.md](06-next-fixture-reactivity-and-season-boundary-checks.md)
7. [07-regression-smokes-and-long-run-sanity.md](07-regression-smokes-and-long-run-sanity.md)
8. [07a-content-rare-prodigy-test-runtime-stabilization.md](07a-content-rare-prodigy-test-runtime-stabilization.md)
9. [08-phase-report-and-next-phase-decision.md](08-phase-report-and-next-phase-decision.md)

## Phase-level checks

Run these at the end of the phase unless a step explicitly blocks earlier:

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts
pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts
pnpm exec vitest run packages/engine/src/career/player-season-rollover.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/i18n run typecheck
pnpm cli career --save=phase64-check --seed=world-a --new-world-preview
pnpm cli career --save=phase64-check --set-lineup-demo=pro01-first-team
pnpm cli career --save=phase64-check --set-tactic-demo=pro01-balanced
pnpm cli career --save=phase64-check --advance-next-fixture --fixture-explanation
pnpm cli career --save=phase64-check --summary
pnpm cli career --save=phase64-check --squad
pnpm cli ten-season-report --seed=phase64-world --seasons=10
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
pnpm check
git diff --check
```

If code changes are made, also run:

```bash
graphify update .
```

## Definition of Done

- Current player state and matchday consequence behavior is audited.
- A bounded consequence model is documented before implementation.
- A pure engine module applies form/morale consequences from structured match
  facts without mutating input.
- `progressNextCareerFixture` returns structured player-state consequence facts
  alongside existing condition changes.
- CLI career advancement can show concise localized consequence inspection
  output.
- Changed form/morale can affect the next fixture through the existing
  team-strength state multiplier path where caller content supplies curves.
- Season rollover remains deterministic and normalizes/reset states according
  to existing season-boundary rules.
- Smokes prove no obvious matchday/career/long-run regression.
- The phase report names the next phase and residual risks.

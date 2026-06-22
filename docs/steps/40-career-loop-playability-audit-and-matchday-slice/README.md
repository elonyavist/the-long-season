# Phase 40 - Career Loop Playability Audit And Matchday Slice

## Goal

Audit the current career loop from the manager's point of view and create one
small matchday slice that proves whether the game is becoming playable before
adding UI or more career systems.

This phase exists because the engine is now explainable enough to inspect
matches, but the next product question is not "can the CLI print more data?".
The question is whether a manager can start a career, understand the club,
prepare a match, play it, read the consequences, and know what to do next.

## Product intent

The user should feel that:

- the selected club is a real project, not only a generated table row;
- squad, tactic, formation, condition, and next fixture are connected;
- match explanation helps understanding without giving automatic advice;
- post-match consequences are readable enough to support future UI work;
- missing pieces are identified from gameplay friction, not from abstract
  completeness.

## Context

Phase 39 made the match engine easier to inspect through deterministic fixture
explanation traces. Phases 23-29 already created durable career state, match
preparation, season rollover, development, generated people, and club identity.

Phase 40 should tie those outputs together and decide whether the current loop
is ready for a UI prototype or whether one more core gameplay blocker should be
fixed first.

## Step order

1. `01-phase-39-output-review.md`
2. `02-career-loop-playability-spec.md`
3. `03-career-state-matchday-readiness-audit.md`
4. `04-career-fixture-explanation-readiness.md`
5. `05-season-rollover-and-development-loop-smoke.md`
6. `06-playability-friction-report-and-next-decision.md`

## Phase constraints

- Do not build UI in this phase.
- Do not add a new career system unless a step documents it as a blocker.
- Do not tune match probabilities, player generation, or table spread.
- Do not add automatic tactical advice, automatic lineup selection, or hidden
  manager decisions.
- Do not add LLM-generated gameplay content.
- Do not create more CLI inspection surfaces unless they directly support this
  phase's matchday slice.
- Preserve deterministic output by seed and save ID.
- Keep engine/domain data language-agnostic.
- CLI-visible text must use localization keys.
- Every finding must be framed around user playability and fun, not just clean
  metrics.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched career/engine/content/CLI/i18n files;
- `pnpm check`;
- `pnpm cli career --save=phase40-check --seed=world-a --new-world-preview`;
- `pnpm cli career --save=phase40-check --summary`;
- `pnpm cli career --save=phase40-check --squad`;
- `pnpm cli career --save=phase40-check --advance-next-fixture`;
- a representative fixed-seed fixture explanation command, if still separate
  from career flow;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- The current career loop is audited as a user journey.
- The phase identifies which existing commands already support the journey and
  which parts are still fragmented.
- A minimal matchday slice is either available or a clear blocker is recorded.
- Post-match, rollover, and development consequences are smoke-tested from the
  same career viewpoint.
- The final report states whether to move toward UI, fix one core blocker, or
  run another simulation audit first.
- `docs/PROJECT_STATUS.md` records Phase 40 as complete or blocked.

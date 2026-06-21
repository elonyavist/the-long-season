# Phase 28 - Player Development And Aging V1

## Goal

Make players grow, stagnate, or decline across seasons in a credible deterministic way.

This phase is central to the game. The user should be able to simulate several seasons and see young prospects develop unevenly, older players decline, and only rare lower-division players become high-level stars.

## Product intent

- Potential is not a guarantee.
- Young players can improve, but most do not become stars.
- Rare prodigies can become special if conditions and random development align.
- Older players decline in a role-sensitive way.
- Development must respect division, current ability, potential class, age, position, and playing time.
- Hidden potential should not become exact user-facing truth.

## Step order

1. `01-development-model-spec.md`
2. `02-player-growth-engine.md`
3. `03-aging-and-decline-engine.md`
4. `04-potential-realization-and-variance.md`
5. `05-development-report-cli-lab.md`
6. `06-phase-report-and-phase-29-readiness.md`

## Phase constraints

- Do not implement training UI.
- Do not implement staff effects unless explicitly included as inert future hooks.
- Do not implement youth intake.
- Do not implement scouting fog changes.
- Do not expose exact hidden potential.
- Do not make growth purely random; it must be seeded and explainable.
- Do not change match scoring calibration unless development breaks balance and the issue is documented.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched domain/engine/content/CLI/i18n files;
- `pnpm check`;
- deterministic development report smoke over multiple seasons;
- strict balance report if player quality affects season outcomes;
- `git diff --check`.

## Definition of Done

- Player growth is deterministic and tested.
- Aging/decline is deterministic and tested.
- Potential realization is uneven and bounded.
- Lower-division long-run outcomes remain credible.
- A lab report can inspect player evolution across seasons.


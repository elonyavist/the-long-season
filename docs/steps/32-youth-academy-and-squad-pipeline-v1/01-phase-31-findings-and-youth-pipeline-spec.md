# Step 01 - Phase 31 Findings And Youth Pipeline Spec

## Goal

Turn the Phase 31 long-run findings and the youth-academy design discussion into measurable Phase 32 success criteria before changing code.

## Context

Phase 31 made senior squads structurally stable through exits, intake, squad maintenance, and simple transfer turnover. The model now survives `250` worlds x `30` seasons, but it still depends heavily on external generated intake.

The next credibility improvement is a youth pipeline:

- first-team squads target roughly `23..25` players;
- each club starts with a bounded youth roster;
- youth players enter at `15..17`;
- youth players leave the youth roster after `19` through promotion, release, or external movement;
- not every interesting young player becomes a star;
- lower-division youth outliers must remain rare.

## Expected files

- `docs/audits/YOUTH_ACADEMY_PIPELINE_SPEC.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read `docs/audits/CAREER_SQUAD_REFRESH_ANOMALY_REWORK_REPORT.md`.
- Read `docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`.
- Record the Phase 31 state:
  - `50` x `10` PASS;
  - `250` x `30` PASS;
  - `10,000` x `50` blocked by runner runtime, not by model failure.
- Define the youth population target:
  - initial youth per club;
  - annual intake min/max;
  - youth age range;
  - youth exit age;
  - expected total active player range.
- Define youth quality rules by division and club tier.
- Define non-goals for Phase 32.
- Define long-run metrics needed to prove the youth pipeline is bounded.

## What NOT to implement

- Do not write code.
- Do not create youth players yet.
- Do not change Phase 31 thresholds.
- Do not solve the `10,000` x `50` runtime blocker here.

## Required checks

- `test -f docs/audits/CAREER_SQUAD_REFRESH_ANOMALY_REWORK_REPORT.md`
- `test -f docs/audits/CAREER_SQUAD_REFRESH_LONG_RUN_GATES_REPORT.md`
- `git diff --check`

## Definition of Done

- The youth academy spec exists.
- Phase 32 numeric targets are explicit enough to avoid overpopulation.
- The next implementation step can start without re-litigating youth roster size.

# Future Step Queue

## Goal

Keep future work visible as an incremental queue without implementing it before it becomes the active documented step.

## Why we implement it this way

`requirements.md` is explicit that the project grows by phase gates: first `pnpm cli doctor`, then `pnpm cli simulate-season --seed=demo-001`, then later systems. This file is not a permanent ban list. It is a queue of work that can become real steps after the current gate is complete. The queue is iterative: after each completed step, reorder, split, or refine future candidates based on test results and gameplay evidence.

## What to implement

- When a phase gate is complete, create the next numbered step group under `docs/steps/`.
- Convert exactly one future item into a small implementation step.
- Give that step the same required Markdown sections as the existing step files.
- Keep only one active implementation step at a time.
- Split broad future items into the smallest independently testable next step.
- Revisit this queue after each completed phase gate.

## What NOT to implement

- Do not implement a future item while another step is active.
- Do not treat this queue as permission to bundle several systems into one step.
- Do not change `docs/PROJECT_RULES.md` just to start the next phase.
- Do not bypass phase gates from `requirements.md`.
- Do not promote a large system as one step when it can be split into smaller feedback loops.

Future candidates:

- React and Vite shell.
- SQLite, OPFS, IndexedDB, and save migrations.
- Web Worker and Comlink.
- Tauri and desktop packaging.
- UI package or design system.
- Localization and locale packs.
- Modding editor.
- Staff and scouting.
- Youth intake and youth leagues.
- Facilities and stadium upgrades.
- Media, event cards, president stories, and narrative corpus.
- Advanced market, agents, loans, sell-on clauses, and deadline day.
- Steam, store pages, demo funnel, onboarding, or business integration.

## Allowed dependencies

- None. This is documentation only.

## Expected files

- `docs/steps/99-future/README.md`

## Required tests

- No tests.

## Definition of Done

- Future work is visible.
- The next feature can be promoted into a documented step without changing `docs/PROJECT_RULES.md`.
- The project still identifies one active step at a time.
- Future candidates are treated as a queue to refine iteratively, not a fixed roadmap.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Read `docs/steps/99-future/README.md`. If the current phase gate is complete, choose the smallest useful future slice, create one next-step document for it, and stop there. Do not implement multiple future systems at once.

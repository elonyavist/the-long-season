# 01 - Current Bench Flow Audit And Target Contract

## Goal

Document the current bench implementation and lock the target substitute
selection contract before code changes.

## Expected Files

- `docs/audits/SHARED_BENCH_BOARD_UX_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Review the current match-preparation bench flow:
  - inline `BenchSelectionGrid` inside `CareerMatchPreparationScreen`;
  - older `BenchSelectionPanel` component and whether it still has an active
    caller;
  - read-model blockers for missing, duplicate, and XI/bench overlap;
  - helper action behavior for `Auto`, `Riempi`, and `Svuota`.
- Record the target contract:
  - 8 fixed reserve slots `S1` to `S8`;
  - empty slot shows `+`;
  - filled slot shows number, surname, and role;
  - no drag/drop;
  - no role change;
  - add/remove contextual menu only;
  - at least one goalkeeper required;
  - no duplicate with XI or inside bench;
  - candidate ordering by overall/current ability, then form, then stable
    football order.
- Identify which logic belongs in `@game/ui`, `apps/web/features`, and shared
  UI components.

## What NOT To Implement

- Do not change source code in this step.
- Do not introduce a new component yet.
- Do not change validation behavior yet.
- Do not implement Inbox/Posta.

## Required Checks

```sh
nvm use 24
test -f docs/audits/SHARED_BENCH_BOARD_UX_AUDIT.md
git diff --check
```

## Definition Of Done

- The audit explains why the bench must become a shared mini-board, not a card
  grid.
- The target contract is specific enough for implementation.
- The roadmap records Phase 59 as the next tactical-workspace improvement
  before Inbox/Posta.

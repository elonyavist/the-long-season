# Step 02 - Accepted Graphical And Structural Rework Inventory

## Status

Active. Waiting for the user's concrete rework list.

## Goal

Turn the user's graphical and structural change requests into one evidence-
backed, ordered, non-overlapping implementation plan without guessing product
decisions or modifying code.

## Required Input

For every requested rework, capture:

- affected screen, state, journey, or structural owner;
- current problem and visible/reproducible evidence;
- desired outcome;
- whether it is visual, interaction, read-model, command/runtime, persistence,
  simulation, or cross-cutting work;
- explicit non-goals;
- desktop/narrow/accessibility expectations where applicable.

Screenshots, recordings, or concrete examples may be attached incrementally.
Missing details become explicit questions; they are not filled with invented
requirements.

## What To Implement

- Reproduce each reported issue against the current product.
- Query the code graph and inspect only the relevant owners.
- Build one accepted inventory with stable IDs, dependencies, risks, and
  verification evidence.
- Separate visual-only work from structural work that changes state, commands,
  persistence, simulation, or ownership.
- Identify which reworks can be safely grouped and which require separate
  steps.
- Create the later ordered Phase 80 step documents only after the inventory is
  accepted.
- Reserve the final two documents for integrated QA/cleanup and the
  checkpointed `50 x 20` closeout using the seven-worker policy.

## What NOT To Implement

- No React, CSS, read-model, engine, persistence, config, or gameplay change.
- No generic redesign based only on personal preference.
- No placeholder implementation step without an accepted inventory item.
- No finance expansion or other previously planned Phase 80 scope.
- No test-threshold change and no long run.

## Expected Files

- `docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_INVENTORY.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- `docs/steps/80-graphical-and-structural-rework/README.md`
- `docs/steps/80-graphical-and-structural-rework/02-accepted-graphical-and-structural-rework-inventory.md`
- later Phase 80 step documents created from the accepted inventory

## Required Checks

```bash
test -f docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_INVENTORY.md
git diff --check
graphify update .
```

Run only the browser/dev-server checks needed to reproduce supplied issues. No
production implementation or long run belongs to this step.

## Definition Of Done

- Every requested rework has current evidence, desired outcome, owner,
  dependencies, non-goals, and verification criteria.
- Visual and structural responsibilities are separated cleanly.
- Open product decisions are resolved by the user rather than guessed.
- Later implementation steps map one-to-one to accepted inventory items or
  justified cohesive batches.
- The final Phase 80 documents reserve complete QA and one checkpointed
  seven-worker `50 x 20`.

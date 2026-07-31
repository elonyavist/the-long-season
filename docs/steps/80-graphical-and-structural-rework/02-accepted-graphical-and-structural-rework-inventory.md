# Step 02 - Accepted Graphical And Structural Rework Inventory

## Status

Done.

The accepted inventory contains five evidence-backed reworks: achieved versus
upside potential-star language, Market pagination/debounced filters/age
selects, Squad age/order/debounced search, canonical money presentation and
input handling, and transfer-offer dialog draft stability. Steps 03-09 now own
their ordered implementation, integrated QA, and resumable closeout.

Verification: inventory artifact exists; current ownership and screenshots
were inspected; diff and Graphify checks pass. No production code or long run
was executed.

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
- Reserve the final two documents for integrated QA/cleanup and the Phase 80A
  handoff. The checkpointed `50 x 20` is now reserved only for final Phase
  80B.

## What NOT To Implement

- No React, CSS, read-model, engine, persistence, config, or gameplay change.
- No generic redesign based only on personal preference.
- No placeholder implementation step without an accepted inventory item.
- No finance expansion or other previously planned Phase 80 scope.
- No test-threshold change and no long run.

## Expected Files

- `docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_INVENTORY.md`
- `docs/audits/README.md`
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
- The final Phase 80 documents reserve complete QA and a truthful Phase 80A
  handoff; Phase 80B owns the only seven-worker `50 x 20`.

## Adopted Solution

- Lock the five accepted items as `P80-R01` through `P80-R05` in
  `docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_INVENTORY.md`.
- Preserve Phase 79D's lower/upper uncertainty while visually separating
  achieved rating from future upside.
- Put deterministic Market pagination and Squad row facts in `@game/ui`;
  keep only input timing and rendering in React.
- Reuse one `250 ms` debounce owner for typed filters, while selects remain
  immediate.
- Preserve exact locale-aware money instead of introducing compact or
  language-independent formatting.
- Give the shared full-screen dialog an explicit dismissal policy and opt the
  transactional Market workflow out of backdrop dismissal.
- Preserve the repository-wide seven-worker policy. The final run's seed,
  report path, ignored checkpoint path, `50` shards, and exactly `7` workers
  are frozen by the accepted Phase 80B contract instead of this phase.

## Verification Result

```bash
test -f docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_INVENTORY.md
git diff --check
graphify update .
```

All documentation checks pass. The attempted focused browser replay did not
reach an application assertion because the sandboxed Vite server missed its
bounded startup window; the audit records the source-level dismissal seam
without claiming automated reproduction.

## Next Action

Execute Step 03 only: implement the shared achieved-versus-upside star
language without changing player ratings, potential projection, development,
sorting, or valuation.

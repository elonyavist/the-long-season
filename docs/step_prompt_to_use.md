Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and the phase README:

PHASE_DIR_TO_EXECUTE: docs/steps/79-transfer-market-windows-negotiations-and-market-workspace

If PHASE_DIR_TO_EXECUTE does not exist, stop and report the missing phase directory.
If the phase README does not exist, stop and report the missing file.
Do not infer or create implementation steps unless explicitly asked.

Goal:
Execute the whole documented phase, one step at a time, without waiting for user approval between steps.

Follow the mandatory phase execution loop:

1. Read project status.
2. Read the phase README and identify the ordered step documents for this phase.
3. Confirm the current active step:
   - if `docs/PROJECT_STATUS.md` already points to a step inside this phase, start from that step;
   - otherwise start from the first step in the phase that is not marked `Done`;
   - if all phase steps are already `Done`, stop and report that the phase is complete.
4. For each step, in order:
   - read the active step document fully;
   - if the step document does not exist, stop and report the missing file;
   - update `docs/PROJECT_STATUS.md` if this step is now active;
   - implement only this step;
   - do not implement anything listed under “What NOT to implement”;
   - do not create or modify files outside this step’s “Expected files”, except:
     - `docs/PROJECT_STATUS.md`
     - the next relevant step document, only if a lesson learned changes future work.
   - on every step you have to check the costraint in "docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md" and update the step as done
5. Run the required tests/checks for the current step.
6. If something fails:
   - fix the current step before moving on;
   - rerun the required checks;
   - if the failure cannot be fixed without breaking scope, stop and update `docs/PROJECT_STATUS.md` with the blocker.
7. Comment with JSDoc/TSDoc every new or modified file and every exported function/type where useful for a junior developer.
8. After each completed step, update `docs/PROJECT_STATUS.md` with:
   - current active step
   - step status
   - adopted solution
   - verification result
   - next action
   - any blocker, if the step could not be completed
   - any lesson learned that affects future steps.
9. Continue automatically to the next documented step in the same phase.
10. Stop only when:
   - every documented step in the phase is complete;
   - a step file is missing;
   - a blocker cannot be fixed inside the current step scope;
   - the project rules would be violated;
   - the implementation requires a product/design decision that cannot be resolved from the docs.
11. At the end of the phase:
   - run the phase-level checks if listed;
   - run `pnpm check` unless the phase explicitly says not to;
   - update `docs/PROJECT_STATUS.md` marking the phase complete or blocked;
   - report what changed, what was verified, and what I should manually inspect.

Use the project rules as binding constraints.
Keep every implementation minimal, deterministic, and consistent with the existing architecture.
Do not add dead code, compatibility leftovers, unused helpers, or deferred cleanup unless explicitly documented as a blocker or future step.
Do not start the next phase.

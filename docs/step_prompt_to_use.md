Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and the active step document:

STEP_PATH_TO_EXECUTE: docs/steps/02-season-simulation/02-fixtures-and-results.md

If STEP_PATH_TO_EXECUTE does not exist, stop and report the missing file. Do not infer or create an implementation step unless explicitly asked.

Follow the mandatory execution loop:

1. Read project status.
2. Confirm that STEP_PATH_TO_EXECUTE is the active step, or update `docs/PROJECT_STATUS.md` if this step is now active.
3. Implement only this step.
4. Do not implement anything listed under “What NOT to implement”.
5. Do not create or modify files outside “Expected files”, except:
   - `docs/PROJECT_STATUS.md`
   - the next relevant step document, only if a lesson learned changes future work.
6. Run the required tests/checks for this step.
7. If something fails, fix the current step before moving on.
8. Comments with JSDoc every file and function
8. Update `docs/PROJECT_STATUS.md` with:
   - current active step
   - step status
   - adopted solution
   - verification result
   - next action
   - any blocker, if the step could not be completed
9. Stop after this step. Do not start the next step.

Use the project rules as binding constraints. Keep the implementation minimal, deterministic, and consistent with the existing architecture.
PHASE_DIR_TO_EXECUTE: docs/steps/81b-player-career-trajectory-population-and-recruitment-engine

Execute the whole documented phase, one step at a time, without waiting for
approval between steps.

If PHASE_DIR_TO_EXECUTE or its README does not exist, stop and report it.
Do not infer or create implementation steps unless explicitly asked.

## Read once, at the start of the phase

Read these in full, once. They do not change between steps, so do not reread
them for each step.

1. `requirements.md` - product and architecture intent.
2. `docs/PROJECT_RULES.md` - the rules for specific kinds of work (web motion,
   accessibility, LLM content, simulation execution, beta saves). The
   always-active rules are already loaded from `AGENTS.md`; do not reread them.
3. `docs/steps/README.md` - the iterative workflow.
4. The phase README in PHASE_DIR_TO_EXECUTE - locked decisions, accepted
   amendments, validation ladder, clean-code gate, phase-level checks.
5. The phase's design contract in `docs/audits/`, if the README names one.
6. `docs/PROJECT_STATUS.md` - live constraints and the active step.

If a constraint in `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` applies to this
phase, the phase README should already carry it. Read the roadmap only when the
README points at it or when you are closing the phase; it is `161 KB` and mostly
describes phases that are already done.

## Read per step

Only two things:

- `docs/PROJECT_STATUS.md` - to confirm the active step and check nothing in
  `Live Constraints` changed.
- The active step document, in full.

Everything else you need comes from **reading the code you are about to
change**. The documents describe intent; the code is what is true. Where they
disagree, the code wins and the document gets corrected in the same step.

## Per-step loop

1. Confirm the active step:
   - if `docs/PROJECT_STATUS.md` points to a step inside this phase, start there;
   - otherwise start from the first step not marked `Done`;
   - if all steps are `Done`, stop and report the phase complete.
2. Read the active step document in full.
3. Read the production code the step owns before writing anything. Verify the
   step's claims against it. A step document written before the code was
   inspected is often wrong about scope; correcting it is part of the step, not
   a distraction from it.
4. Implement only this step. Do not implement anything under
   "What NOT To Implement".
5. Do not create or modify files outside the step's "Expected Files", except:
   - `docs/PROJECT_STATUS.md`;
   - the next step document, only if a lesson changes future work;
   - a file you must refactor inside the step's own scope - add it to
     "Expected Files" and explain the ownership first.
6. Record unrelated cleanup for its owning step instead of widening scope
   silently.
7. Add JSDoc/TSDoc to new or materially changed exported functions and types,
   written for a junior developer: say why, not what.
8. Run the step's Required Checks. If something fails, fix it and rerun. If it
   cannot be fixed inside scope, stop and record the blocker in the step
   document and in `docs/PROJECT_STATUS.md`.

## After each step

Record in the **step document**: status, adopted solution, verification output,
next action, any blocker, any lesson that changes future work.

Then update `docs/PROJECT_STATUS.md` with only:
- the active step and the phase progress row;
- anything new that constrains *future* work;
- deletion of anything that has stopped constraining anything.

`docs/PROJECT_STATUS.md` has a hard `300` line budget. It is a live snapshot,
not a log. History belongs in `git log` and in the phase reports under
`docs/audits/`.

## Standing constraints

They are in `AGENTS.md` and already loaded. Keep every implementation minimal,
deterministic, and consistent with the existing architecture.

## Stop only when

- every documented step in the phase is complete;
- a step file is missing;
- a blocker cannot be fixed inside the current step scope;
- the project rules would be violated;
- the work needs a product decision the documents cannot resolve.

## At the end of the phase

- run the phase-level checks listed in the phase README;
- run `pnpm check` unless the phase says not to;
- update `docs/PROJECT_STATUS.md` marking the phase complete or blocked;
- report what changed, what was verified, and what I should inspect by hand.

Do not start the next phase.

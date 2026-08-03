# Always-Active Rules

These are loaded in every session. They are **not** repeated in
`docs/PROJECT_RULES.md` - that file owns the rules that apply to specific kinds
of work, and points here for these. One source each, no drift.

## Never Duplicate Information

- Store only what cannot be derived; share the derivation. A second field
  holding a derived value is duplication even inside one type.
- If something is used in more than one place, extract it into a shared module.
- A test whose job is to prove two tables agree means there should be one table.

## Never Leave Residue

- No dead code, orphaned helper, unused export, stale fixture, or leftover i18n
  key. When a change makes something redundant, remove it in the same change.
- Prefer total typed mappings with `satisfies` and exhaustiveness guards. A `??`
  default over a total mapping is a guess where a build failure belongs.
- Compatibility is not a reason to keep unused code. Preserved code needs an
  active caller or a documented removal path.

## Engine Determinism

Inside `packages/engine`: no `Math.random()`, `Date.now()`, `new Date()`,
`crypto.randomUUID()`, `performance.now()`, or any real clock. Use seeded RNG
from `shared`, derived streams by stable key, and `GameDate` epoch-day.

Do not use `Object.keys/values/entries` for order-sensitive simulation. Every
sort needs a deterministic final tie-breaker.

## Package Boundaries

```
domain, shared, i18n -> nothing
engine, content, storage -> domain, shared
ui -> domain
simulation-tools -> domain, engine, shared
apps/cli -> engine, content, storage, simulation-tools, i18n, ui, shared
apps/web -> engine, content, storage, i18n, ui, shared
```

Storage and content must never import engine. Packages must never import from
`apps/*`. `pnpm depcruise` enforces this.

## Localization

No hardcoded user-facing text. Domain and engine emit structured
language-agnostic keys, never rendered prose. Supported: `it`, `en`, `de`, `es`,
`fr`, with English as the deterministic fallback.

## Step Discipline

- One documented step at a time. Only its `Expected Files`, plus
  `docs/PROJECT_STATUS.md` and the next step document when a lesson changes
  future work.
- If a refactor inside the step's own scope is needed, add the file to
  `Expected Files` and explain the ownership before editing it.
- Read the production code before trusting what a step document says about it.
  Documents describe intent; the code is what is true. Where they disagree, the
  code wins and the document is corrected in the same step.
- `docs/PROJECT_STATUS.md` is a live snapshot with a hard `300` line budget.
  Per-step detail belongs in the step document; history belongs in `git log`.

## Local Commands

- Run `nvm use 24` before project commands in a new shell.
- `pnpm check` is the single local gate.
- **Never commit unless explicitly asked.**

## graphify

This project has a knowledge graph at `graphify-out/` with god nodes, community
structure, and cross-file relationships. It holds **code only** - no document is
in it, so graph silence never means a document is silent.

When the user types `/graphify`, invoke the `skill` tool with
`skill: "graphify"` before doing anything else.

- `graphify explain "<symbol>"` before opening a file: the typed call
  neighbourhood with `file:line`, for about the cost of one `grep` and a
  twentieth of the file. `graphify path "<A>" "<B>"` for how two things connect.
- `graphify affected "<symbol>" --depth 2` before editing anything shared. It
  answers what else must change, which `grep` cannot, and it is the machine-made
  first draft of a step's `Expected Files`. A fixture duplicating a shipped
  constant surfaces here and otherwise only as a red test.
- `graphify query "<question>"` only when no symbol name is known. Its
  natural-language traversal costs several times a `grep`; prefer `explain`.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review, or
  when explain/affected/path do not surface enough.
- A `post-commit` hook rebuilds the graph (AST-only, no API cost, detached, log
  at `~/.cache/graphify-rebuild.log`), so a dirty `graphify-out/` afterwards is
  expected and not a reason to skip graphify. The hook lives in untracked
  `.git/hooks/`, so a fresh clone needs `graphify hook install`. Run
  `graphify update .` by hand only to query code changed but not yet committed.
- Skip graphify only when the task is about stale graph output, or the user says
  not to use it.

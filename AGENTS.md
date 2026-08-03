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

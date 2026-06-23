# 02 - Web Workspace Scaffold And Boundary Rules

## Goal

Create the minimal `apps/web` workspace and prove it fits the monorepo.

The scaffold should be a Vite + React TypeScript app with no gameplay behavior
and no custom screen design beyond a placeholder shell.

## Expected files

- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/tsconfig.node.json`, if Vite requires it.
- `apps/web/vite.config.ts`
- `apps/web/index.html`
- `apps/web/src/main.tsx`
- `apps/web/src/App.tsx`
- `apps/web/src/app/App.tsx`, if the local structure prefers nested app files.
- `apps/web/src/**/*.test.ts` or `*.test.tsx` focused on scaffold behavior.
- `package.json`, only if root scripts are needed.
- `pnpm-lock.yaml`, if dependencies are installed or workspace links change.
- `tsconfig.base.json`, only if a web path alias is needed.
- `.dependency-cruiser.cjs`, only if Step 01 decided the executable boundary
  must change here.
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Add `@game/web` under `apps/web`.
- Use Vite + React + TypeScript.
- Keep dependencies minimal:
  - React;
  - React DOM;
  - Vite;
  - TypeScript/testing dependencies already used by the repo where possible.
- Configure scripts:
  - `dev`;
  - `build`;
  - `preview`;
  - `typecheck`;
  - `test`, if a focused web test is added.
- Render a placeholder app shell only.
- Ensure the scaffold imports no engine/content/storage modules yet.
- Ensure the scaffold has no hardcoded final user-facing text beyond temporary
  placeholders covered by this scaffold step.

## What NOT to implement

- Do not build the real main menu yet.
- Do not build the dashboard yet.
- Do not connect career data yet.
- Do not add browser persistence.
- Do not add routing libraries unless a later step proves they are needed.
- Do not add a component library.
- Do not add Tailwind or design frameworks unless explicitly justified.
- Do not add economics, market, squad, tactic, lineup, or match screens.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run build`
- `pnpm --filter @game/web run test` if tests exist.
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- `apps/web` exists as a buildable workspace app.
- The app shell compiles and builds.
- Package boundaries still pass.
- No gameplay or screen scope has leaked into the scaffold.

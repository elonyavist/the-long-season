# 03 - Install Zustand And Tailwind Tooling

## Goal

Install only the tooling needed for the documented web foundation:

- Zustand for client state;
- Tailwind CSS for shared styling utilities;
- Tailwind's official Vite integration.

## Expected files

- `package.json`
- `pnpm-lock.yaml`
- `apps/web/package.json`
- `apps/web/src/styles/*`
- `apps/web/vite.config.*` or equivalent Vite config file if needed
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Run `nvm use 24` before any install command.
- Install dependencies from the repository root with pnpm.
- Add only required dependencies:
  - `zustand`;
  - `tailwindcss`;
  - `@tailwindcss/vite`.
- Configure Tailwind for the current Vite app with the smallest working setup.
- Keep existing CSS imported and working.
- Do not remove existing CSS during this step.
- Add a minimal smoke test or typecheck proof that the tooling is available.

## What NOT to implement

- Do not migrate app state yet.
- Do not move folders yet.
- Do not rewrite visual styling yet.
- Do not install UI kits or component libraries.
- Do not add Tailwind plugins unless a later step proves they are needed.

## Required checks

- `node --version` after `nvm use 24`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`

## Definition of Done

- The web app builds with Zustand and Tailwind installed.
- No user-facing UI behavior changed.
- `docs/PROJECT_STATUS.md` identifies Step 04 as the next action.

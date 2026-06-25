# Step 02 - Skin Contract And Token Taxonomy

## Goal

Replace the weak Phase 60 palette contract with a skin contract that can support
real visual identities.

The main correction is token taxonomy. Components need tokens for what a color
does, not just broad variables like panel, raised, and accent.

## Expected files

- `apps/web/src/app/theme-palettes.ts`
- `apps/web/src/app/theme-palettes.test.ts`
- `apps/web/src/styles/tokens.css`
- `docs/audits/WEB_VISUAL_IDENTITY_TARGET.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Rename the concept in code only if it improves clarity; keeping
  `theme-palettes` is acceptable if the exported contract clearly documents
  skin behavior.
- Redefine the variable contract around UI responsibilities:
  - app background;
  - shell surface;
  - panel surface;
  - elevated panel surface;
  - table header surface;
  - table row surface;
  - table alternate row surface;
  - selected row surface;
  - border;
  - strong border;
  - text;
  - muted text;
  - heading text;
  - primary action surface;
  - primary action hover;
  - primary action text;
  - secondary action surface;
  - focus ring.
- Keep semantic colors outside the skin contract.
- Keep football-field colors outside the skin contract.
- Update focused tests so the contract rejects pitch, suitability, form, danger,
  and success variables.

## What NOT to implement

- Do not apply final component styling yet beyond the minimal CSS variable
  definitions needed to compile.
- Do not keep obsolete variables unless they are still actively consumed and
  documented for migration in later steps.
- Do not touch `apps/web/src/assets/campo-calcio.svg`.
- Do not change tactical pitch grass colors.

## Required checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test -- theme-palettes.test.ts
git diff --check
```

## Definition of Done

- The skin contract describes visual hierarchy rather than generic colors.
- Tests prove the contract remains bounded.
- The field and semantic colors are not exposed as user-skin variables.


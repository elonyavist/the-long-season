# 02 - Theme Palette Contract And Boundaries

## Goal

Define a stable, small theme contract and the six allowed football-manager UI
palettes.

## Expected Files

- `apps/web/src/app/theme-palettes.ts`
- `apps/web/src/app/theme-palettes.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Add a typed theme-palette contract with stable ids.
- Include at least these palette ids:
  - `classic-green`;
  - `nocturne-navy`;
  - `dugout-navy`;
  - `heritage-cream`;
  - `azzurri-office`;
  - `violet-director`;
  - `programme-ivory`;
  - `clubhouse-sage`;
  - `touchline-stone`.
- Each palette should expose only the UI chrome variables needed by the app,
  for example:
  - app background;
  - panel surface;
  - raised surface;
  - line/border;
  - muted line;
  - text;
  - muted text;
  - accent;
  - accent-strong;
  - button surface.
- Keep the contract intentionally small; do not model every CSS color as a
  preference.
- Add tests for:
  - exactly nine palettes;
  - unique ids;
  - default palette id;
  - no pitch-specific or semantic keys in the theme contract.

## What NOT To Implement

- Do not apply the palettes in CSS yet.
- Do not add settings UI yet.
- Do not include pitch grass or suitability colors in the contract.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test -- theme-palettes.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Theme palette data is typed and test-covered.
- The contract protects non-themeable football and semantic colors.

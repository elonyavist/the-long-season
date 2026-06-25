# Web Visual Identity QA

Date: 2026-06-24
Phase: `61-web-visual-identity-system-rework`
Status: Passed with residual art-direction risks

## Automated Evidence

Command:

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/theme-palette.spec.ts
git diff --check
```

Result:

- Web typecheck passed.
- Web test suite passed.
- Web production build passed.
- Playwright visual QA passed for the three accepted skins.
- `git diff --check` passed.
- `apps/web/src/assets/campo-calcio.svg` has no diff.

Screenshots were written to:

```text
/tmp/the-long-season-phase61
```

Each accepted skin has app-entry, dashboard, and match-preparation screenshots
for desktop and narrow viewports.

## Skins Reviewed

- `floodlight-navy`
- `club-office`
- `press-room`

## Automated Visual Guards

The Playwright spec verifies:

- selected skin reaches the document root;
- desktop and narrow viewports do not horizontally overflow;
- semantic red/green colors remain stable;
- tactical pitch grass colors remain stable;
- primary action, button hover, borders, table header, table row, and selected
  row have visible hierarchy;
- every accepted skin can render app entry, dashboard, and match preparation.

## Manual Art-Direction Review

Accepted:

- The default dark skin now reads as a coherent retro football-manager control
  room instead of a generic green dashboard.
- Gold is concentrated in active navigation, primary actions, counters, and
  selected emphasis rather than flooding every surface.
- Match-preparation squad tables now have distinct header, row, alternate-row,
  and selected-row surfaces.
- Light skins now use paper/archive surface hierarchy instead of dark-theme
  assumptions with brighter colors.
- Tactical field colors and the supplied pitch SVG remain stable.
- Field and bench foreground text no longer inherits light-skin dark text, so
  the football surfaces stay readable across skins.

Residual risks:

- The web UI still needs deeper art direction for typography, spacing, and
  decorative restraint before it is final-product quality.
- The light skins are usable and coherent, but they should be reviewed again
  after Inbox/Posta and Squad screens exist because those sections will stress
  table density more than the current prototype.
- Some old CSS aliases remain intentionally as migration bridges while existing
  components are moved to the hierarchy tokens.

## Decision

Phase 61 visual identity work is strong enough to resume product-section work.
The next phase should not add more theme features. It should build the next real
manager decision section on top of this bounded skin system.

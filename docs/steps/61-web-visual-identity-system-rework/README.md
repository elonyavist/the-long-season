# Phase 61 - Web Visual Identity System Rework

## Goal

Replace the weak Phase 60 palette result with a coherent retro-premium
football-management visual identity system.

This phase is not about adding more colors. It is about turning the current web
theme feature into a small set of believable, production-quality skins that
feel like they belong in a Championship Manager / Football Manager style game:
dense, serious, readable, club-office driven, and built for repeated use.

The tactical field is not part of this rework. The supplied pitch SVG and
football-field colors must stay stable.

## Product Decisions

- The current nine-palette implementation is a technical foundation, not an
  accepted final visual result.
- The game should have fewer, stronger visual identities instead of many
  decorative color variants.
- Palette choices must read as football-manager skins, not generic app themes.
- Light skins need their own surface hierarchy; they must not be dark skins
  with brighter hex values.
- UI color work must preserve the manager's ability to scan tables, blockers,
  Inbox/Posta messages, match preparation, and primary actions quickly.
- Visual quality is a user-experience requirement. Passing contrast and layout
  tests is not enough if the screen looks amateurish.

## Target Skin Set

The final public ids were later reduced to three skins with the strongest
identity:

1. `floodlight-navy` - default night-match navy/ink, crisp ivory, controlled
   gold.
2. `club-office` - muted green-grey office skin, low glare.
3. `press-room` - charcoal/slate, ivory, subdued accent for news/dashboard.

Skins that do not earn a clear football-management identity should be removed,
not renamed.

## Non-Themeable Surfaces

The following must not be changed by this phase:

- `apps/web/src/assets/campo-calcio.svg`;
- tactical pitch grass and stripe colors;
- tactical pitch markings if they are part of field readability;
- bench mini-field football surface unless a later pitch-art phase owns it;
- role-suitability colors;
- fitness arrows;
- danger/success/warning semantic colors.

## Ordered Steps

1. `01-current-palette-failure-review-and-target-lock.md`
2. `02-skin-contract-and-token-taxonomy.md`
3. `03-palette-reduction-and-preference-migration.md`
4. `04-dark-skin-surface-hierarchy-rework.md`
5. `05-light-skin-surface-hierarchy-rework.md`
6. `06-settings-picker-localization-and-tests.md`
7. `07-visual-qa-and-art-direction-gate.md`
8. `08-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

Run after the final step:

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/theme-palette.spec.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement In This Phase

- Do not implement Inbox/Posta Decision Center.
- Do not implement new gameplay systems.
- Do not implement market, squad, youth, finance, staff, calendar, archive, or
  matchday features.
- Do not touch `apps/web/src/assets/campo-calcio.svg`.
- Do not recolor the tactical pitch through user preferences.
- Do not theme role-suitability, fitness, warning, danger, or success semantics.
- Do not keep a palette just to preserve the old count of nine.
- Do not add decorative blobs, gradients, image backgrounds, or skin gimmicks.
- Do not hardcode visible UI labels outside i18n.
- Do not leave obsolete palette ids without a documented compatibility fallback.

## Definition Of Done

- The project has one documented visual identity target for web skins.
- The palette set is reduced or replaced with a small set of coherent
  football-manager skins.
- Token ownership separates surfaces, table states, action states, text, muted
  text, focus, and semantic colors.
- Dark skins and light skins both have appropriate surface hierarchy.
- `campo-calcio.svg` and tactical field colors are unchanged.
- The settings picker reflects only accepted skins.
- Old stored palette ids fall back deterministically to a valid skin.
- All visible palette labels are localized in the five supported languages.
- Desktop and narrow Playwright screenshots exist for every accepted skin.
- The visual QA report includes manual art-direction acceptance, not only
  automated layout checks.
- `pnpm check` passes.
- The final report recommends exactly one next phase.

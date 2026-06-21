# Phase 29 - Club Identity And World Calendar V1

## Goal

Replace placeholder club names and strengthen calendar/world identity before ten-season reporting.

The user should no longer inspect long-run reports full of `PRO01`-style clubs. Club names should be fictional but rooted in cities and league level.

## Product intent

- Club identity should feel tied to nation and division.
- Third-division clubs should usually come from smaller or mid-sized cities.
- Higher divisions should use larger or more prominent cities.
- The model must support Italy, England, Spain, Germany, and France.
- Club names remain fictional and IP-safe.
- Calendar data should support credible long-run reporting without pretending to be a complete real-world rules engine yet.

## Step order

1. `01-club-identity-source-data-spec.md`
2. `02-city-based-club-generation.md`
3. `03-club-identity-in-career-worlds.md`
4. `04-world-calendar-v1-review.md`
5. `05-club-identity-and-calendar-report.md`

## Phase constraints

- Do not use real club names.
- Do not imply official licenses.
- Do not add UI.
- Do not implement full real-world competition rules unless explicitly scoped.
- Do not implement promotions/relegations unless they are documented as a minimal future-prep placeholder.
- Keep content deterministic and offline.

## Phase-level checks

At the end of the phase, run:

- focused content/CLI/i18n tests for touched files;
- `pnpm check`;
- identity review command for at least two seeds;
- career new-world preview for at least two seeds;
- `git diff --check`.

## Definition of Done

- Generated clubs have fictional city-based names.
- Club identity varies by seed where appropriate.
- Naming avoids obvious duplicates in the same league.
- Current calendar limitations are documented before Phase 30.
- Long-run reports can reference readable club names.


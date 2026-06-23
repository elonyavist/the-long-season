# Phase 45 - Career Presentation Decomposition And View-Model Readiness

## Goal

Reduce `apps/cli/src/commands/career/format.ts` complexity after the Phase 44
simulate-season split.

The goal is not to create UI. The goal is to make career presentation easier to
trace, test, and later map to UI-facing view models without changing career
behavior, save schema, market rules, match engine rules, player development, or
career progression.

The current career formatter owns many output families in one large file:

- new career world preview;
- persisted career summary;
- persisted career inspection;
- match preparation save output;
- fixture advancement output;
- squad and youth academy inspection;
- development and season rollover reports;
- permanent-transfer application output;
- shared labels, fixture lines, money, player rows, and helper formatting.

Phase 45 should split by real output family and keep the command adapter
unchanged unless imports need to move.

## Product intent

- Preserve current user-visible behavior unless a step explicitly documents a
  wording-only cleanup.
- Do not add UI, web packages, or formal UI view-model contracts yet.
- Make career output easier for a junior developer to locate by feature:
  summary, preparation, matchday, roster, youth, development, market, rollover.
- Keep user-facing career text localized through `@game/i18n`.
- Keep gameplay credibility and user agency unchanged.

## Architecture intent

- Prefer deep CLI presentation modules that own one career output family.
- Do not create pass-through wrappers. A moved module must own meaningful
  formatting locality.
- Keep reusable gameplay and diagnostic meaning outside CLI.
- Keep CLI format modules as adapters over structured facts returned by engine,
  content, storage, and simulation packages.
- Preserve deterministic smoke output for current career commands.

## Ordered steps

1. `01-career-format-responsibility-audit.md`
2. `02-career-overview-output-module.md`
3. `03-career-preparation-output-module.md`
4. `04-career-matchday-output-module.md`
5. `05-career-roster-and-development-output-module.md`
6. `06-career-market-and-rollover-output-module.md`
7. `07-career-presentation-boundary-review.md`
8. `08-phase-report-and-next-phase-decision.md`

## Phase-level checks

- Focused tests for every touched CLI module.
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck` when localized output is touched.
- `pnpm check`
- `pnpm cli career --save=phase45-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-check --summary`
- `pnpm cli career --save=phase45-check --inspect`
- `pnpm cli career --save=phase45-check --squad`
- `pnpm cli career --save=phase45-check --youth-academy`
- `pnpm cli career --save=phase45-check --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase45-check --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase45-check --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase45-check --development-report`
- `pnpm cli career --save=phase45-market --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-market --apply-market-demo=pro01-affordable-permanent`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## What NOT to implement in this phase

- No UI.
- No new package.
- No formal shared UI view-model package.
- No gameplay behavior changes.
- No match engine tuning.
- No player generation tuning.
- No save schema changes.
- No new career command flags.
- No localization rewrites unless a moved output exposes a missing key.
- No moving engine/content/storage logic into CLI.
- No moving CLI presentation text into engine/content/storage/simulation-tools.
- No broad rewrite of `career.ts` or `parse-career-args.ts`.
- No dead wrappers, compatibility aliases, or temporary duplicate renderers.

## Definition of Done

- `career/format.ts` is meaningfully smaller and easier to trace.
- Career output is grouped by output family in named CLI-local modules.
- Existing career CLI behavior remains stable.
- Localized output still passes the presentation-text guard.
- Remaining presentation risks are documented with one concrete next-phase
  recommendation.
- `docs/PROJECT_STATUS.md` records verification and the recommended next phase.

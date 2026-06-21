# Phase 24 - Player Generation Quality Rework

## Goal

Rework fictional player generation so squads feel credible by division, club tier, role, age, current ability, and potential.

The current playable loop works, but the long-term fun depends on whether players make sense. Third-division squads must not look like compressed first-division squads with inflated attributes. A lower-division save should occasionally create a memorable outlier, a late-career specialist, or a serious prospect, but those cases must be rare and testable.

## Product intent

- Use the Football Manager-like visible attribute scale already defined by the project: `0..20`.
- Treat the current third division like an Italian Serie C-level competition.
- Most third-division players should not be viable first-division starters after six or seven seasons.
- In a promoted third-division squad, only `1..3` original players should plausibly remain useful in the first division, usually as reserves or strong narrative exceptions.
- Almost every club may have `1..2` interesting young players, but only a small minority of those prospects should become first-division strong.
- A third-division league may contain `1..4` "white-fly" players: unusually strong cases caused by age, career context, or high potential.
- Attributes must be role-coherent. A defender should not randomly have high finishing, an attacker should not randomly have high tackling, and a goalkeeper should use a goalkeeper-specific profile.
- Current ability, potential, role fit, and rarity are separate concepts. A low-division wonderkid can have modest current ability and high potential without already being a top player.

## Step order

1. `01-current-generator-audit.md`
2. `02-division-and-club-tier-attribute-bands.md`
3. `03-role-based-attribute-templates.md`
4. `04-age-potential-and-prospect-archetypes.md`
5. `05-rarity-budget-and-white-fly-rules.md`
6. `06-player-generation-quality-tests.md`
7. `07-cli-generation-quality-report.md`
8. `08-phase-report-and-next-phase-decision.md`

## Phase constraints

- Do not use real player databases, real rosters, or scraped third-party data.
- Do not change match-engine algorithms or scoring calibration to hide generation problems.
- Do not add growth/progression simulation in this phase.
- Do not add youth academy intake, scouting missions, staff effects, contracts, wages, or transfer negotiation changes.
- Do not auto-pick market needs for the manager.
- Do not change the public `Player` domain shape unless the audit proves that the current shape cannot represent the required model.
- Preserve deterministic generation by world seed.
- Keep generated player names and nationalities fictional.
- Keep user-facing CLI labels localized through the existing i18n layer.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched content files;
- focused tests for touched CLI/i18n files, if the CLI report is added;
- `pnpm --filter @game/content run typecheck`;
- `pnpm check`;
- `pnpm cli simulate-season --seed=world-a --identity-review`;
- `pnpm cli simulate-season --seed=world-b --identity-review`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- the new player-generation quality CLI report command created in this phase;
- `git diff --check`.

## Definition of Done

- The current generator has an explicit before/after audit.
- Division and club-tier bands exist as deterministic content-generation data.
- Role templates cap irrelevant attributes and emphasize role-primary attributes.
- Age and potential archetypes separate current ability from future ceiling.
- Lower-division outliers are controlled by deterministic rarity budgets.
- Tests fail if third-division squads become broadly overpowered or role-incoherent again.
- A CLI report lets the user inspect generation quality across seeds.
- The phase report records whether career-match-preparation persistence should return as the next phase.

# Step 06B7G - Checkpoint L4.4: Development And Renewal

## Status

**REFINE recorded.** Step 06B7F1 closed green with the `v8` public-projection
bundle aligned to the new development model, but the `7 x 10` checkpoint exited
`1`. No threshold below moved and L5 remains closed.

## Goal

Verify that the attributed development correction produces believable
ten-season renewal without replacing the old-player monoculture with a youth
monoculture.

## Frozen Population

- the same seven canary worlds, ten seasons and three divisions;
- exactly seven workers and a fresh profile/cache contract;
- L4.2 is the paired before-state; only Step 06B7F differs.

## Frozen Gates

- every L4.2 academy, origin, promotion, exit-reachability and structural
  reconciliation gate remains green;
- in at least `5/7` worlds, mature annual-intake current P90 reaches the
  opening-senior current median in at least `2/3` divisions;
- season-ten opening-senior survival share is `<= 0.60`;
- season-ten opening-origin leaderboard share is `<= 0.50`;
- career-generated leaderboard share is `0.30..0.60` inclusive;
- every world contains a career-generated scorer or assist leader;
- at least one active `33+` player and one `33+` leader remain observed;
- current never exceeds stored potential and no ability leaves `1..20`;
- intake counts, role coverage and accepted-potential distributions remain
  unchanged from L4.3 for the same seeds.

### Pre-execution measurement clarification

L4.3 serialized every world/division's opening-senior count and current median,
accepted-intake count and accepted-potential P90, but did not serialize intake
role counts. Before any L4.4 output exists:

- those historical generation facts are frozen as canonical signature
  `972f0c28ae8416ffa703a1cb9ea8bb1c` and must match exactly;
- role coverage is observed directly by L4.4 and every division row must reach
  all `10` canonical roles;
- the report must not claim an exact historical role-count comparison that the
  L4.3 artifact cannot support;
- ability invariants traverse the generated ability structure itself; no second
  attribute-name table is introduced.

The upper `0.60` bound is deliberate: passing renewal by making the leaderboard
almost entirely annual-youth output is a different monoculture, not success.

## Decision

- **GO:** every gate passes; open 06B8.
- **REFINE:** reachability, reconciliation or a frozen non-behaviour fact fails;
  reopen 06B7F without moving targets.
- **STOP / RETHINK:** the coefficient is reached and safe but renewal remains
  below target or overshoots into youth monoculture. Do not tune after output.

## Expected Files

- canonical generational-succession report module and tests only for the frozen
  L4.4 facts and decision
- `apps/cli/src/commands/simulation-report/career-sections.ts`; dispatches the
  new decision over the same canonical world facts and worker path
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`; one locked `7 x 10 x 7` profile and fresh cache
- `packages/i18n/src/labels.ts`; visible profile title in all five locales
- `docs/audits/PHASE_81A_CHECKPOINT_L4_4_DEVELOPMENT_AND_RENEWAL.md` **(new)**
- `docs/audits/README.md`
- this document, phase README, 06B8 and `docs/PROJECT_STATUS.md`

## Required Command

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-development-renewal-l4-4-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-development-renewal-l4-4-7x10.json
```

## Definition Of Done

L4.4 records one decision. Only `GO` opens L5.

## Recorded Result

- report hash: `d7c730cbc6b0a619b76e616aa619f7b8`;
- decision: `REFINE`; failed gates:
  `generation_input_signature`, `accepted_intake_role_coverage`,
  `mature_intake_development_parity`, `opening_senior_survival_share`,
  `opening_leaderboard_share`, `generated_leaderboard_share`;
- `4,303,475` ability pairs observed with zero potential/range violation;
- development parity `0/7`; opening survival `0.6354`; generated leader share
  `0.0690`; generated leaders nevertheless reachable in `7/7` worlds;
- all `21` annual-intake division rows reach `8/10` roles and always omit
  `wing_back` and `wide_midfielder`.

The preregistered REFINE owner was too narrow: code inspection locates the role
gap in `YOUTH_ACADEMY_POSITION_PLAN` and `positionForIntakeSlot(...)`, both
content generation rather than Step 06B7F. This ownership contradiction blocks
a blind growth retry. The full reasoning is recorded in
`PHASE_81A_CHECKPOINT_L4_4_DEVELOPMENT_AND_RENEWAL.md`.

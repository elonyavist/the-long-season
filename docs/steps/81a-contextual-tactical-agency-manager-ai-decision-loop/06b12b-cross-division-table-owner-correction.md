# Step 06B12B - Cross-Division Table Owner Correction

## Status

Reopened and closed on 2026-08-09. Fresh-seed 06B12C rejected the global
conversion reduction because it traded a tiny goals excess for materially more
draws. The hierarchy correction remains; the conversion part was removed in
the same tranche with no compatibility residue.

## User-Facing Reason

Strong and weak clubs should feel different because their footballers are
different, while a shot should not become a goal too easily in every league.
The correction must preserve surprise seasons and avoid hidden rank bonuses.

## Entry Evidence

The powered `7 x 10` corpus contains `70` seasons per division with zero
reconciliation, fallback or unavailable-player failures. It confirmed:

- First Division champion `69.5286`, spread `43.7143` and PPG deviation
  `0.3577`, all below their frozen minima;
- Second Division goals per match `2.7586`, just above `2.7578`;
- Third Division draw share `0.2916`, above `0.2868`, while its spread and PPG
  deviation sit close to the historical lower side;
- season-level Third-Division draw share correlates `-0.4346` with spread and
  `-0.4031` with PPG deviation. The draw excess follows compressed population
  hierarchy; it is not evidence for a direct draw rule.

Across all three divisions goal rates sit above their historical means. The
shared conversion content is therefore the goal owner. No division label enters
the match engine.

## Frozen Correction

1. Keep tier effects inside existing senior rarity lanes. Set hierarchy scale
   to `2.0` in First Division, `1.0` in Second and `1.25` in Third. Youth stays
   `1.0`. The Second Division remains byte-identical because its hierarchy
   already passes.
2. Preserve the canonical `0.058/0.111/0.195` conversion bands. A trial
   reduction to `0.055/0.105/0.185` was rejected by 06B12C: total scoring moved
   inside every band, but Third-Division draw share worsened to `0.2987`.
3. Preserve opportunity volume, tactics, actor choice, RNG draw count and all
   on-target/block/keeper semantics.

The 06B12A seeds are calibration evidence only after this correction. A fresh
locked 06B12C `7 x 10` profile must validate it.

## What NOT To Implement

- no club-rank, expected-points or division bonus in a match;
- no direct draw manipulation or post-result rewrite;
- no age, origin or formation term;
- no widening of any historical target;
- no change to Second-Division senior hierarchy or any youth hierarchy;
- no compatibility layer for beta saves.

## Expected Files

- `packages/content/src/generators/player-current-ability-bands.ts` and tests;
- `packages/content/src/generators/gameplay-config.ts` and tests prove the
  rejected trial left no shipped conversion change;
- `apps/cli/src/commands/simulate-season.test.ts`: the real Third-Division
  report histogram moves inside the same rarity lane and keeps all `396`
  players reconciled;
- generation, rarity, wage and potential tests reached by those owners;
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts` only if the shared canonical
  identity hash moves, always together;
- this step, phase README and project status;
- the next checkpoint document.

## Required Checks

Focused content and match-calibration tests, real generated reachability of all
three scales, shared CLI/web identity, `pnpm check`, `git diff --check`, and
`graphify update .`.

## Verification

- focused content/generation suite: `6` files, `50` tests, green;
- real Third-Division hierarchy edge reaches `>= 2.0`; no generated player
  enters the `15+` report bucket and all `396` reconcile;
- shared CLI/web identity hash moved together to `aca4502a`;
- `pnpm check`: `302` files, `2324` tests, `874` modules, exit `0`;
- the first full run exposed only the owned Third-Division histogram record;
  it was measured, explained and then the complete check passed.
- 06B12C rejected only the conversion arm; the accepted hierarchy arm proceeds
  to a fresh validation without a direct result rule.

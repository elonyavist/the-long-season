# Step 06B7F - Potential-Room Development Realization

## Status

Done; handoff to Step 06B7G through the completed 06B7F1 re-baseline. L4.3 attributed the renewal failure to
development realization in `7/7` complete worlds. The repository gate then
proved that changing realization also invalidates the versioned public
projection/economy bundle.

## Goal

Let a well-used high-upside youth realize a credible part of stored potential
by ages `23..25`, without inflating ordinary players or changing who is
generated.

## Frozen Diagnosis And Solution

The production monthly delta is capped by
`MAX_SINGLE_MONTH_GROWTH = 0.08`. At the canonical academy load of `270`
minutes, a neutral age-`17..20` core attribute therefore receives at most
`0.08 x 0.85 x 0.75 = 0.051` before deterministic variance. The role-weighted
path cannot close the measured first-division gap before age-feasible potential
compression removes it.

Adopt one change, chosen before implementation output:

- advance the cap from `0.08` to `0.18`;
- retain age, minutes, performance, environment, room taper, role relevance,
  hard caps and potential compression byte-for-byte;
- retain the same rule for academy and senior players: origin is never read;
- do not raise stored potential or repair it after compression.

Why `0.18`: at three full academy matches per active month, the neutral core
ceiling is about `0.115` per month at ages `17..20`. Across ten active months,
the high-room path can gain about one core point per year; role weighting and
the later `0.65/0.35` age bands reduce the role-level path. A room of one point
still receives at most one fifth of that delta and tapers further as it closes.

## Required Proof

- real generated players exercise positive growth above the old `0.08` cap's
  reachable monthly delta; no synthetic satisfying fixture is sufficient;
- a deterministic high-room trajectory with canonical `270` monthly minutes
  improves materially by age `24` and never crosses potential;
- an ordinary one-point-room trajectory remains bounded and cannot become a
  star from the coefficient alone;
- zero-minute growth remains exactly zero;
- goalkeeper/outfield aging, potential monotonicity, reload determinism and all
  existing Phase 75 development tests remain green.

## Expected Files

- `packages/engine/src/career/player-development.ts` and test; the existing
  canonical monthly owner and its focused trajectory/reachability proof
- `apps/cli/src/commands/simulation-report/generational-succession.ts` and test
  only if a real-data reachability counter is required by L4.4
- this document, `06b7g-checkpoint-l4-4-development-and-renewal.md`, phase
  README, 06B8 and `docs/PROJECT_STATUS.md`

## What Not To Implement

- no generation, potential allocation, exit, injury, selection, result or
  transfer change;
- no academy-origin bonus, direct leaderboard correction or age-25 boost;
- no second development path and no retained `0.08` compatibility branch.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/player-development.test.ts packages/engine/src/career/player-development-policy.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

One production constant owns the correction, real data reaches the changed
range, controlled trajectories preserve room sensitivity and the repository
gate is green. Only L4.4 can judge long-run success.

## Recorded Implementation And Blocker

- production monthly cap: `0.08 -> 0.18`; no other gameplay coefficient moved;
- focused development suite: `34/34` green;
- controlled `270`-minute path: high-room striker `8 -> 11.708` by the end of
  the declared trajectory; ordinary room remains capped at `9`; a real monthly
  delta above the old interval is reached;
- the first full `pnpm check` correctly stopped on the stale calibration
  contract; Step 06B7F1 then aligned it and closed green.

The complete deterministic matrix moves both goalkeeper and outfield bands.
This is not a golden snapshot: `playerRatingScale`, public projection, player
value, asking price and AI market policy are cross-versioned. Re-recording the
test while L4.4 runs with `v7` would let gameplay use new development with stale
market beliefs and invalidate L5's transfer/economy claims.

### Accepted beta amendment

The owner confirmed that beta saves require no compatibility. Insert one
re-baseline step before L4.4:

1. replace the current `v7` bundle with the measured `v8`; no compatibility
   catalog or legacy selector remains;
2. bump the linked valuation/asking/market version chain atomically;
3. reject old beta version stamps explicitly;
4. run L4.4 and L5 only on the aligned `v8` bundle.

Rejected: pinning the new matrix only in a test, an analysis-only valuation
override, or retaining unused `v7` compatibility. The Step 14 schema reset may
still invalidate the then-current beta saves; beta compatibility is not a
product constraint.

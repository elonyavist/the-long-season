# Step 08 - AI Market Targeting And Squad Protection

## Status

Ready.

## Goal

Make AI clubs use the same windows, deadlines, affordability, transfer, and
preliminary-agreement rules while protecting believable squad structure.

## User-Visible Outcome

Other clubs buy, sell, renew, release, and secure expiring players coherently.
They do not hoard players, bankrupt themselves, or strip a squad below useful
football depth.

## Scope

1. Derive deterministic target needs from department depth, age, quality,
   expiry, annual wage load, budget, division, and reputation.
2. Submit permanent offers only inside the club's active competition window.
3. Use preliminary agreements only for eligible final-six-month targets.
4. Route every offer and response through the same selected-club negotiation,
   exposure, affordability, and atomic-completion owners.
5. Protect minimum senior size, goalkeeper coverage, department depth, and
   annual wage headroom before selling or completing a purchase.
6. Prefer a bounded number of active talks; do not solve squad needs by sending
   unbounded offers simply because pending money is not reserved.
7. Process same-day AI decisions in stable club and negotiation order.
8. Never automate the selected club's response, contract choice, preliminary
   agreement, or lineup consequence.
9. Emit structured history and informational market facts without turning all
   AI activity into blocking Posta.

## Implementation Contract

- AI is a policy client of canonical commands, not a privileged mutation path.
- Targeting may be simple, but every choice must have a football reason and a
  deterministic test.
- Pending exposure informs AI risk limits but does not mutate actual budgets.
- Reuse existing Phase 78 turnover and squad-protection policy or replace it
  explicitly after caller proof; do not run both.

## Expected Files

- current AI contract/turnover/squad-protection Modules/tests identified by
  Step 01
- focused market-targeting and AI negotiation orchestration Modules/tests under
  `packages/engine/`
- package exports only where required
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No omniscient perfect optimizer, random transfer churn, unbounded offer fan-
  out, selected-club automation, or separate AI transfer commit path.
- No scouting fog, shortlist personality, media rumor, or auction simulation.
- No hidden squad replenishment used to conceal a broken market decision.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Inspect strong, average, weak, rich, poor, aging, shallow, and expiry-heavy
  clubs across both windows.
- Review accepted and rejected AI stories as football decisions, not only
  invariant passes.

## Completion Criteria

- AI uses canonical market commands and no bypass path remains.
- Squads and finances remain structurally credible after AI decisions.
- Selected-club decisions remain explicit.
- Step 09 is the only next implementation step.

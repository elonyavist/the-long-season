# Step 06B5B - Carried Substitution Restoration

## Status

**Done (2026-08-08).** The final repeated population reached `3.827381`
substitutions per team-match with zero rule violations; Checkpoint L3 is `GO`.

## Measured Finding

The completed post-06B5A `7 x 2` measured:

- `9148` time-loss injuries over `421062.55` player match-hours;
- `21.7260/1000h`, inside the frozen `20..50` injury band;
- zero unavailable selected players, lifecycle omissions, consequence
  mismatches, invalid substitution minutes or rule-limit violations;
- mean substitutions `3.184718` against the unchanged `3.5..4.9` band;
- season means `3.225801` and `3.143635`.

The raw population rejects the tempting attribution that injury replacements
reduce the count. Teams with zero time-loss injuries averaged `3.097842`
substitutions; one injury averaged `3.340944`, two averaged `3.579515`, and
three averaged `4.0`. Injury incidence remains owned and frozen by 06B5A.

## First Frozen Correction

The canonical automatic policy currently evaluates one command at half time,
two sequential commands at minute `60`, two at `70`, and one at `80`. The first
attempt added a third sequential evaluation at minute `60`.

It is an opportunity, never a forced substitution:

- every evaluation reads the team produced by the previous accepted command;
- the outgoing player must still meet an existing condition/performance rule;
- the incoming player must still satisfy the existing positional and bounded
  quality rules;
- the domain validator still owns the maximum of five and window legality;
- no threshold, formation, injury probability or recovery curve changes.

A three-player hour-mark window is a normal football operation and is the
smallest extension supported by the earlier L2 evidence: adding the second
minute-60 evaluation moved the original population materially, while further
coefficient or seed search would not address this owner.

## Expected Files

- `packages/engine/src/team-selection/ai-in-game-decisions.ts` and test; the
  attempted boundary is measured and removed when falsified
- `packages/engine/src/use-cases/simulate-season.ts` and test; compact reason
  counts preserve rejected/no-change policy facts that accepted commands cannot
  reconstruct
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test; the
  canonical report projects and aggregates those reason counts
- `packages/simulation-tools/src/season-recap/season-recap.test.ts`; its manual
  progression fixture supplies zero values for the two new exact fact maps
- `apps/cli/src/commands/simulation-report/report-registry.ts`; gameplay facts
  require a fresh L3 cache identity
- Checkpoint L3 document and audit
- phase `README.md` and `docs/PROJECT_STATUS.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/team-selection/ai-in-game-decisions.test.ts --maxWorkers=7
pnpm cli simulation-report --profile=phase81a-availability-aging-l3-7x2 --workers=7 --format=json --report-output=simulation-out/phase81a-availability-aging-l3-7x2.json
pnpm check
git diff --check
graphify update .
```

Every gate runs alone. The same seeds and frozen L3 targets decide the result.
Only `GO` opens Step 06B6.

## First Attempt Result And Diagnostic Refinement

The third hour-mark evaluation moved the population only from `3.184718` to
`3.186702`; injury incidence remained green at `21.7344/1000h`. The attempted
boundary is therefore removed rather than retained as ineffective code.

Before changing candidate quality or condition thresholds, the existing
canonical decision reasons are retained as compact per-side counts in season
progression and projected by the report. This is instrumentation, not a new
policy: it records the reasons already emitted by the one AI decision owner and
allows the same `7 x 2` to distinguish `no_material_change`,
`no_legal_substitute` and command rejection. The next correction, if any, is
owned only by the dominant measured branch.

The first diagnostic run counted `53,219 no_legal_substitute` reasons against
`76,155 low_condition` signals and zero rejected commands. Before interpreting
that aggregate, the canonical reason now names the exact replacement-funnel
break: substitution limit already reached, no available bench, no positionally
credible bench, or credible cover below the quality floor. This is required to
avoid treating a healthy competition limit as a selection defect.

## Owner And Second Frozen Correction

The exact funnel on the unchanged population is decisive:

- `1,250` substitution limits already reached;
- `11` exhausted benches;
- `342` benches without positionally credible cover;
- `51,616` credible replacements rejected by the quality floor.

The owner is the bounded regression allowed for a low-condition replacement.
It moves from `2` to `3` ability points. The existing value for a genuinely
exhausted player was already `3`; this makes the routine low-condition branch
consistent without changing when fatigue is detected. Poor-performance and
score-response changes remain at `0.75`, invalid positional fits remain
forbidden, and the validator still caps every side at five. The repeated real
population must both reduce `quality_floor` and move substitution volume into
the frozen band; a fixture-only test is not reachability evidence.

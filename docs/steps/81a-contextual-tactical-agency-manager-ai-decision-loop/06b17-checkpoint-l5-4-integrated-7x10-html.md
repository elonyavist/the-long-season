# Step 06B17 - Checkpoint L5.4: Integrated 7 x 10 JSON And HTML

## Status

**Done - REFINE (2026-08-10).** The locked fresh `7 x 10` completed at exactly
seven workers. Canonical JSON and byte-stable desktop HTML exist; zero final
reconciliation failures remain. The `100 x 10`, B2 and Steps 07-16 stay closed.

## Goal

Play one fresh, consultable ten-season population and decide whether the world
now combines realistic tables, player use, leaders, generational renewal,
domestic redistribution and tactical identity without hidden outcome control.

## Locked Population

- profile `phase81a-integrated-l5-4-7x10`;
- fresh prefix `phase81a-integrated-l5-4-v1`;
- exactly seven worlds x ten seasons x all three divisions;
- exactly seven workers, canonical career execution and real transfer path;
- one canonical diagnostic JSON artifact;
- English desktop HTML rebuilt only with `--from-report`, with no simulation,
  formula or gate in the renderer;
- all worlds and all seasons remain inspectable; no curated examples.

## Frozen Gates

### Market distribution and identity owner response

- first-division season-ten local one-to-one replacement capacity is `>= 0.20`
  against L5.3C before-state `0.0641`;
- first-division division-wide capacity remains `>= 0.50` against `0.5256`;
- annual-academy realization retains parity in at least `6/7` worlds and at
  least `0.75` of senior-quality annual-academy players reach `900` minutes;
- role-scoped need, recruitable-need and exact-role candidate branches each
  have a positive real observation; structural/department needs remain
  reachable; zero target mismatches and zero market reconciliation failures;
- six-formation and four-replicated-formation retention are each `>= 0.95`;
- top-share-at-most-0.30 and all-ten-roles retention are each `>= 0.95`;
- absolute top-formation share is `<= 0.50`; all selection fallbacks, missing
  sources, missing stable IDs and formation reconciliations are `0`.

The `0.20` local-capacity target is frozen as a material response: it requires
more than tripling the measured local availability without pretending that all
credible replacements must already belong to the incumbent's club. It is not
changed after output.

### Carried player-world targets

First division only, using the frozen Big Five register:

- age-33+ mean starts `12..17`, minutes `1100..1500`;
- season-ten career-generated leader share `>= 0.30`, opening leader share
  `<= 0.50`, and every world has a career-generated leader;
- top-ten scorers mean `14.5..18.5`, assists `8..10.5`;
- scorer mean age `25.5..28.5`, assist mean age `25..28.5`;
- age-33+ scorer and assist shares each `<= 0.12`;
- at least one real age-33+ leader remains observed across the cohort.

The current player target register is not tightened to the healthier-looking
L5.3C facts and is not relaxed if 06B16 moves too little.

### Tables, match lifecycle and world integrity

- First, Second and Third Division use only their own frozen historical bands
  for champion/last points, spread, PPG deviation, goals per match and draws;
- the powered hierarchy decision and every currently carried substitution,
  exact-minute, condition, rotation, availability, injury, economy, valuation,
  stable-ID, rarity and development guardrail remain green;
- unavailable starters, identical-XI full seasons and every reconciliation or
  fallback count are `0`;
- transfers preserve integer-EUR fees, buyer/seller division facts, legal
  contracts, budgets and seller/squad floors.

## Decision

- **GO:** every frozen automatic gate passes, JSON/HTML reconcile, deterministic
  rebuild is byte-identical and complete HTML inspection finds no engine-
  critical contradiction. This opens the `100 x 10` L1 main run.
- **REFINE:** one named 06B16 owner responds but misses its frozen target, or a
  carried owner regresses. The artifact remains valid evidence and only the
  demonstrated owner reopens through a new documented step.
- **STOP / RETHINK:** the response requires forced outcomes, hidden AI facts, a
  synthetic external pool, a protected formation or a second simulator.

## What NOT To Implement

- no gameplay change, target edit or extra seed after this checkpoint starts;
- no continuation from an old shard or cache identity;
- no 100 x 10 before GO;
- no HTML-only fact, calculation or different decision;
- no direct player/club outcome correction.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test
  own the locked fresh profile, cache identity and exactly-seven-worker request;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test own the
  exhaustive L5.4 route by composing existing canonical observers;
- `apps/cli/src/commands/simulation-report/renewal-architecture-attribution.ts`
  and test only if its existing evaluator must expose a reusable gate result;
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and test let a
  canonical integrated observer omit the L5.1 paired-table oracle while still
  emitting the same player/selection/identity facts; the old attribution
  profiles keep the oracle-required default. The first L5.4 artifact exposed a
  pre-decision instrumentation mismatch: the observer omitted the oracle but
  the shared evaluator still counted its absent 70 rows as one reconciliation
  failure. The evaluator therefore receives an explicit total
  `required | not_requested` table-lane contract; L5.1 remains fail-closed and
  the player-only L5.4 reader cannot fail on a fact it was forbidden to create;
- `apps/cli/src/commands/simulation-report/report-html.ts` and test only if an
  already-recorded fact cannot be displayed; the renderer never calculates it;
- `packages/i18n/src/labels.ts` owns profile labels in all five languages;
- `simulation-out/phase81a-integrated-l5-4-7x10.json` and `.html`;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_4_INTEGRATED.md` **(new)**;
- `docs/audits/README.md`, this step, phase README,
  `docs/PROJECT_STATUS.md`, L1 and B2 handoff documents only after the result.

Every additional file is listed here with its owner before modification.

## Required Commands

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-integrated-l5-4-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-integrated-l5-4-7x10.json
pnpm cli simulation-report --from-report=simulation-out/phase81a-integrated-l5-4-7x10.json --format=html --report-output=simulation-out/phase81a-integrated-l5-4-7x10.html
pnpm check
git diff --check
graphify update .
```

The simulation and repository gate run alone. Real command exit codes are
captured without a pipe. An HTML renderer that writes a truthful REFINE report
may exit non-zero only after the artifact exists.

## Definition Of Done

- fresh 7 x 10 completed at exactly seven workers;
- every gate and its population appears in canonical JSON;
- HTML is a byte-stable view of that JSON and is visually inspectable on
  desktop;
- one truthful GO / REFINE / STOP decision and named owner are recorded;
- the audit, phase handoff and project status agree with the artifact.

## Outcome

- report decision `FAIL`, checkpoint decision `REFINE`, report hash
  `78c8b85ffe71b61295a7e5ff131eebb2`;
- Step 06B16's exact-role market response is live: `1,034,001` role needs,
  `661,080` recruitable observations and `7,311` exact-role targets, with zero
  mismatch or missing-target reconciliation;
- local replacement capacity improved from `0.0641` to `0.1011` but missed
  `0.20`; division capacity is `0.4719` against `0.50`;
- mature-academy parity is `7/7` and material-minute realization is `0.9245`;
- age-33+ players still average `22.27` starts and `1,829.67` minutes; generated
  leaders reach `0.2786`, while opening leaders retain `0.7214`;
- four-replicated-formation retention is `0.8810`, but every-role retention is
  `1`, maximum top-formation share is `0.3333`, and all selection fallbacks and
  formation reconciliations are zero;
- First-Division champion points average `72.2571`, narrowly below the frozen
  `72.3842` lower bound; every other division-table family passes;
- JSON and HTML SHA-256 are recorded in
  `PHASE_81A_CHECKPOINT_L5_4_INTEGRATED.md`; two HTML rebuilds are byte-identical.
- final `pnpm check` passed `305` files / `2,346` tests with zero dependency,
  typecheck or custom-check failure; Graphify and `git diff --check` are clean.

## Handoff

Only a new preregistered correction tranche may reopen the demonstrated owners:
renewal supply/distribution, age-aware selection and actor allocation, soft
club-identity persistence, and the existing First-Division hierarchy owner.
No `100 x 10` is authorized.

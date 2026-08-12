# Step 06B29E - Structural Succession Wage Buffer

## Status

Done - `REFINE`, candidate rejected and removed on 2026-08-12.

## Goal

Test the owner identified by L6.9D without creating budget or changing the
market ranking. A club recruiting for the canonical `role_succession` reason
may use up to `100%` of its existing annual wage budget rather than the normal
`98%` planning ceiling. Transfer-fee capacity, immediate cash, player demand,
seller protection, willingness and every real contract constraint remain
unchanged.

This is a candidate, not an adopted product rule. The temporary analysis switch
has a Phase 81A closeout owner and must disappear after the paired decision:

- `GO`: collapse the candidate into the sole production path and delete the
  switch, candidate scenario and branch-specific fixtures;
- `REFINE` or `STOP_RETHINK`: delete the candidate and all its seams.

## Why This Is Narrow

`evaluateCareerContractCapacity(...)` already owns the typed
`allowFullWageBudgetForStructuralRepair` rule. This step does not add a second
formula. It only passes that existing permission when the live need contains
`role_succession`. A need of any other kind keeps the `98%` planning buffer.

## Frozen Paired Checkpoint L6.10

Run the same `7` worlds for `10` seasons in both arms with exactly `7` workers:

- control: current product, ordinary `98%` planning ceiling;
- candidate: full existing wage budget only for `role_succession`;
- identical seed prefix, footballers, content and observation schema;
- both arms are fresh and have isolated checkpoint directories;
- population signatures, reconciliation and world completion fail closed.

Targets frozen before the candidate output exists:

| Path | GO condition |
| --- | --- |
| canonical wage block | control share minus candidate share `>= 0.15` |
| prime-age acquisitions | candidate minus control share `>= 0.10` |
| generated prime-age acquisitions | candidate minus control share `>= 0.03` |
| local replacement capacity | delta `>= 0.05` and same direction in `>= 5/7` worlds |
| career-generated leader share | delta `>= 0.05` and same direction in `>= 5/7` worlds |

Product guardrails:

- division replacement capacity `>= 0.50`;
- four-replicated-formation retention delta `>= -0.02`, with at least `5/7`
  candidate worlds healthy;
- completed transfer volume ratio `<= 1.05`;
- mean first-division champion points remains in `72..88`.

`GO` requires every target and guardrail. A leader gain without the upstream
wage-block and local-replacement path is `STOP_RETHINK`, not success. A failed
guardrail is also `STOP_RETHINK`. Otherwise the outcome is `REFINE`, the
candidate is removed and the next owner is measured rather than guessed.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and its test: consume the
  existing structural-repair capacity rule only for the candidate and expose
  the canonical terminal-stage observer;
- `packages/engine/src/career/advance-career-month.ts` and
  `advance-career-season.ts`: temporary analysis-switch propagation with an
  explicit removal owner;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`: carry the
  analysis switch into the canonical career advancement path;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and its test:
  paired execution and the frozen L6.10 evaluator;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and its test: one reachable pure decision rule for the linked path;
- `apps/cli/src/commands/simulation-report/report-registry.ts`, its tests and
  planner tests: locked `7 x 10` profile, isolated candidate cache and L6.9D
  control reuse;
- `packages/i18n/src/labels.ts`: profile labels in all five supported languages;
- this document, the L6.9D document/audit, audit index, Phase README and
  `docs/PROJECT_STATUS.md`.

No content, persistence, web, HTML, squad-generation or match-engine change.

## Pre-Evidence Instrument Correction

The first attempted execution produced only `STOP_RETHINK` instrumentation
failures and is invalid gameplay evidence. Two faults were found before any
candidate comparison existed:

1. L6.9D was an affordability attribution and did not collect renewal episodes
   or population signatures. Reusing it as the control for downstream renewal
   was impossible. L6.10 therefore runs both arms fresh with the richer common
   observation contract; the population and targets do not change.
2. The candidate switch reached `CareerWorldProjectionInput` but was not
   forwarded from `createCareerWorldProjection(...)` to the canonical career
   inspection. It therefore could not affect gameplay. The typed propagation
   is now explicit and tested through the real engine reachability case.

The invalid artifact reported `14` reconciliation and `14` signature failures,
and no product comparison. Cache suffix `v2` prevents any invalid checkpoint
from entering the corrected run.

## Valid Outcome

The corrected fresh paired run reconciled every world and all `14` population
signatures. Artifact:
`simulation-out/phase81a-succession-wage-buffer-l6-10-7x10.json`, SHA-256
`d8bfdc16ed7e37848b310555561023be876f48cc60bf4c7fbe799427a855bb60`.

The candidate removed the observed wage block but broke the linked path:

| Fact | Control | Candidate | Delta |
| --- | ---: | ---: | ---: |
| wage-block share | 0.580990 | 0.003955 | -0.577035 |
| prime-age acquisition share | 0.164951 | 0.110764 | -0.054187 |
| generated prime-age acquisition share | 0.022094 | 0.019881 | -0.002213 |
| local replacement capacity | 0.043956 | 0.065934 | +0.021978 (`3/7`) |
| career-generated leader share | 0.235714 | 0.200000 | -0.035714 (`1/7`) |
| completed transfer acquisitions | 5,163 | 4,535 | ratio `0.878365` |

The result is not “insufficient effect”: spending the last two percent on role
succession crowds out more useful market work and reduces the desired
prime-age and leader outcomes. The analysis switch, engine branch, profile and
labels are removed. The existing `98%` planning buffer remains the sole product
rule.

After wage capacity was relaxed, the dominant terminal state became
`qualified_prime_age_loses_generic_score`: `5,166 / 8,092 = 0.638408`. That
opens only a financially unchanged selection experiment among already
affordable candidates.

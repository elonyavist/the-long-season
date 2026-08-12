# Step 06B29F - Qualified Prime-Age Succession Selection

## Status

Done - `REFINE`, target owner solved but product candidate rejected on
2026-08-12.

## Goal

Test the next owner exposed by L6.10 without changing any budget or score.
Within a live `role_succession` need, if the ordinary affordable candidate set
contains at least one player who:

- has the exact required primary role;
- is aged `18..29` on the public assessment;
- has public P50 ability at or above the existing club-local succession floor;

the candidate selects the highest existing generic score inside that qualified
subset. If the subset is empty, selection is byte-for-byte the ordinary
generic ranking. No stored potential, hidden ceiling, new score, money, extra
market action or formation information is introduced.

The switch is analysis-only with a Phase 81A closeout owner. `GO` collapses it
into the sole product path; every other verdict removes it completely.

## Frozen Paired Checkpoint L6.11

- profile `phase81a-qualified-succession-selection-l6-11-7x10`;
- same `7` seeds x `10` seasons as the rich L6.10 control, exactly `7` workers;
- control reuses the reconciled L6.10 control facts; candidate has a distinct
  checkpoint identity and changes only the qualified-subset preference;
- signatures, reconciliation and completion fail closed.

Targets frozen before candidate output:

| Path | GO condition |
| --- | --- |
| qualified candidate loses generic score | control share minus candidate share `>= 0.15` |
| prime-age acquisition share | candidate minus control `>= 0.05` |
| generated prime-age acquisition share | candidate minus control `>= 0.02` |
| local replacement capacity | delta `>= 0.03`, positive in `>= 5/7` worlds |
| career-generated leader share | delta `>= 0.03`, positive in `>= 5/7` worlds |

Unchanged guardrails: division replacement capacity `>= 0.50`; formation
retention delta `>= -0.02` with `>= 5/7` candidate worlds at `>= 0.75`;
transfer-volume ratio `<= 1.05`; first-division champion mean `72..88`.

`GO` requires the entire linked path. Downstream leadership without target and
local movement, or any guardrail failure, is `STOP_RETHINK`. Otherwise the
decision is `REFINE` and the next owner is measured.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and test;
- `packages/engine/src/career/advance-career-month.ts` and
  `advance-career-season.ts`;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/report-registry.ts`, planner test and
  `packages/i18n/src/labels.ts`;
- this document, 06B29E, audits/index, Phase README and status.

No content, persistence, web, HTML, squad generation, player development or
match-engine change.

## Outcome

The paired run reconciled every world and population signature. Artifact:
`simulation-out/phase81a-qualified-succession-selection-l6-11-7x10.json`,
SHA-256 `794b4330876cebe540eab9475bbf639cef65ad1702270420794361267653a01f`.

The target-selection path moved decisively:

- `qualified_prime_age_loses_generic_score`: share reduction `0.263537`;
- prime-age acquisition share: `0.164951 -> 0.436578` (`+0.271627`);
- career-generated prime-age share: `0.022094 -> 0.069992` (`+0.047898`).

The downstream path did not reach its frozen floors:

- local replacement: `+0.021978`, coherent in `3/7` worlds;
- career-generated leaders: `+0.007143`, coherent in `4/7` worlds;
- transfer volume remained guarded at ratio `0.962231`, formation retention was
  unchanged and division replacement improved `+0.032967`.

The result is `REFINE / downstream_realization`. The preference is not adopted:
it proves the target owner but does not yet prove that the acquired players get
the minutes, retention and development needed to become club-local successors
or leaders. The candidate switch, selection branch, executable profile and
labels are removed after a read-only cached downstream funnel is registered.

# Career Squad Refresh Spec

Date: 2026-06-22
Phase: `31-career-squad-refresh-and-transfer-turnover-simulation`
Scope: deterministic long-run career squad lifecycle

## Phase 30 Findings

Phase 30 proved that match output is credible enough to preserve for now, but career-world structure fails over long runs.

Observed blockers:

- the `world-a` ten-season report ended with age 30+ share around `0.74`;
- the `world-b` ten-season report ended with age 30+ share around `0.75`;
- the 50-world batch observation was `50/50` failures because age 30+ share stayed around `0.715..0.793`;
- transfer turnover was unavailable;
- squad turnover was unavailable;
- player development and aging worked mechanically, but there was no matching exit, intake, or movement loop.

## Phase 31 Goal

Phase 31 must make the closed career world survive repeated season rollover without squad collapse.

The implementation must add:

- deterministic player exits;
- deterministic new-player intake;
- squad-size and broad role coverage maintenance;
- minimal deterministic transfer turnover;
- real long-run refresh metrics;
- long-run validation gates.

## Non-Goals

Phase 31 must not implement:

- UI;
- full market negotiation;
- contracts, wages, agents, loans, auctions, installments, or swap deals;
- automatic user lineup selection;
- automatic user tactic selection;
- match-scoring tuning unless the final report proves the refresh loop broke balance.

The system may maintain the world, but the manager must still decide tactics, lineup, and market strategy.

## Long-Run Squad Health Targets

The final Phase 31 report must measure at least:

- minimum squad size per club;
- average squad size per club;
- maximum squad size per club;
- clubs below minimum squad size;
- clubs without natural goalkeeper coverage;
- broad role or department coverage warnings;
- age buckets: `under_21`, `age_22_to_29`, `age_30_plus`;
- exits per season;
- exits by reason;
- intake players per season;
- transfer-turnover moves per season;
- duplicate ownership failures;
- missing player reference failures;
- deterministic mismatch failures.

Initial target gates:

- no club below minimum viable squad size;
- no club without natural goalkeeper coverage;
- age 30+ share must not remain around Phase 30 failure levels after long runs;
- refresh and transfer metrics must be real values, not unavailable placeholders;
- match balance must remain inside `calibration-v1` strict bounds.

## Validation Ladder

Phase 31 has three validation levels:

1. `50` worlds x `10` seasons: smoke proof.
2. `250` worlds x `30` seasons: development regression proof.
3. `10,000` worlds x `50` seasons: final hard proof.

The `10,000` x `50` hard gate is intentionally expensive and must not run inside `pnpm check`.

## Step Ownership

- Step 02 owns exits only.
- Step 03 owns intake generation only.
- Step 04 owns squad structure maintenance only.
- Step 05 owns simple inter-club movement only.
- Step 06 owns long-run integration.
- Step 07 owns metrics and anomaly scoring.
- Step 08 owns batch gates and reports.
- Step 09 owns the final decision.

## Decision

Proceed with Phase 31 implementation. Do not move to UI exploration until the final Phase 31 report either passes the long-run gates or explicitly blocks the next phase with reproducible failing seeds.

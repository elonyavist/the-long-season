# Candidate Market Phase — Market Balance And Economy Review

## Goal

Audit and tune the full market loop before adding more career systems on top.

## Why this phase exists

Market systems can easily break a manager game: too many transfers, impossible bargains, runaway budgets, unrealistic squad churn, or player willingness that feels arbitrary. This phase is a stop-and-review gate.

## Possible Scope

- Batch market simulation reports.
- Transfer count by division/category.
- Average fees by category and player quality.
- Wage distribution if Phase 19 exists.
- Loan count and destination-category distribution.
- Rejection reason distribution.
- AI market balance if Phase 21 exists.
- Exploit tests for valuation and exchange deals.
- Final market score and next-phase recommendation.

## What NOT to include

- New market features.
- Youth systems.
- UI.
- Major economy redesign unless the audit proves a blocker.

## Extension Points

- Balance reports should live outside presentation code.
- Metrics should be deterministic and content-profile driven.
- Findings should create focused rework phases instead of being fixed ad hoc.

## Phase Gate Question

Is the market credible enough to support youth, staff, finance, promotion/relegation, and longer career loops?

## Manual Inspection Target

The user should be able to inspect:

- market balance report;
- accepted limitations;
- critical/high findings;
- recommendation for the next career-system phase.

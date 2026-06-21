# Candidate Market Phase — Loans MVP

## Goal

Add simple manual loans, especially to support young players and lower-division squad building.

## Why this phase exists

Loans are important to the project vision: lower divisions should receive young prospects from bigger clubs, and the user's young players should later go out for minutes. Loans must be modeled differently from permanent transfers because ownership does not change.

## Possible Scope

- Add `TransferKind: "loan"`.
- Model owner club and temporary club.
- Model loan start/end dates or season-length loan.
- Model simple expected-minutes context.
- Validate player willingness for loans.
- Validate parent-club willingness for young/fringe players.
- Return player to owner club at loan end.
- CLI loan preview/apply inspection.

## What NOT to include

- Buy option.
- Buy obligation.
- Recall clauses unless a later step explicitly adds them.
- Wage-share detail unless Phase 19 already supports wages.
- Loan penalties.
- Multiple simultaneous loan clauses.
- Automatic loan placement.

## Extension Points

- Loan willingness should consider age, current club category, destination category, expected role, and player ambition.
- Loan state should not erase the owner-club relationship.
- Future player growth can consume loan appearances/minutes when that system exists.

## Phase Gate Question

Can a young first-division player plausibly accept a lower-division loan while a star senior player rejects an unrealistic loan destination?

## Manual Inspection Target

The user should be able to inspect:

- a plausible young-player loan;
- a rejected unrealistic loan;
- the destination squad including the loanee;
- the owner club still retaining long-term ownership.

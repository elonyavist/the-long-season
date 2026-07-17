# Career Inbox Future Message Extension Matrix

Date: 2026-07-14  
Phase: `73-inbox-posta-decision-center-and-career-attention-workflow`  
Status: binding future-work register; no runtime implementation

## Purpose

Posta can grow only when a complete gameplay workflow owns the facts and the
manager decision behind a message. This register prevents attractive but empty
notifications from appearing before their underlying system exists.

The engine remains the source of structured gameplay truth. Domain contracts
store language-agnostic facts and lifecycle state. Presentation code may explain
those facts, but it must not infer urgency, invent a person, or create a decision
that the manager cannot complete.

## Extension Gate

A future message area may enter production only when all of these conditions
are true:

1. its workflow can be completed end to end in the current career;
2. its decisive facts survive save/load through the canonical career store;
3. its attention level is a product rule owned outside presentation code;
4. its resolution is derived from game state, not a generic dismiss command;
5. its action opens a real destination where the manager can act;
6. deterministic IDs, same-date batching, season ownership, and tests exist;
7. ordinary updates are grouped so Posta does not become notification noise.

## Future Workflow Matrix

| Area | Real workflow prerequisite | Required structured facts | Product decision still required | Future resolution condition | Destination | Ownership | Phase 73 status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Market | A playable transfer workflow covering received offers, outgoing offers, negotiation state, acceptance/rejection, and transfer completion. | Stable negotiation ID; player and clubs; direction; fee and budget impact; offer state; response/deadline date; permitted manager actions. | Which incoming offers are blocking versus important; whether expiring offers stop `Continue`; same-date offer grouping policy. | Negotiation reaches a terminal state or the required manager response is committed. | Market negotiation detail. | Domain: negotiation/message facts. Engine: AI response and deadlines. Storage: negotiation and lifecycle. UI/Web: list, detail, action route. | **Not implemented in Phase 73.** |
| Player contracts | A real player-contract model and a complete offer, counter-offer, renewal, expiry, and release workflow. | Contract ID; player; club; wage/term clauses supported by the model; expiry; negotiation state; response/deadline; permitted actions. | Which expiries are important; when a response becomes blocking; how agents and grouped renewals should behave. | Contract is signed, rejected, withdrawn, expired, or otherwise terminal in persisted state. | Player contract negotiation. | Domain: contract/message facts. Engine: negotiation and expiry rules. Storage: contract and lifecycle. UI/Web: contract workspace and action route. | **Not implemented in Phase 73.** |
| Finances | A modeled club-economy cycle with persisted income, expenditure, budget rules, and consequences the manager can influence. | Accounting period; balance and budget deltas; category breakdown; threshold or rule breached; forecast horizon; available corrective actions. | Which financial facts deserve information, importance, or a hard stop; reporting cadence; whether ordinary monthly statements enter Posta at all. | The reporting item is acknowledged, or a genuine required corrective decision is committed and the breached rule is cleared. | Finances overview or corrective-decision screen. | Domain: economic facts. Engine: accounting and thresholds. Storage: ledger/snapshot and lifecycle. UI/Web: financial explanation and action route. | **Not implemented in Phase 73.** |
| Youth academy | A playable academy workflow for intake, development review, age-out, promotion, transfer, and release decisions. | Player IDs; age and academy status; potential tier already owned by the engine; age-out date; eligible destinations; decision deadline; selected action. | Which exceptional prospects are important; when age-out becomes blocking; how many youth updates are grouped into one review. | Every required selected-club youth decision is committed, or the informational review is acknowledged. | Youth academy decision workspace. | Domain: academy decision/message facts. Engine: intake, development, and eligibility. Storage: youth state and lifecycle. UI/Web: review and decision route. | **Not implemented in Phase 73.** |
| Staff | Persisted staff people whose roles and contracts measurably affect an implemented system, plus hiring, renewal, dismissal, and vacancy workflows. | Staff ID; role; affected modeled system; contract/vacancy facts; candidate or negotiation state; deadline; permitted actions. | Which vacancies are blocking; whether performance advice is information or importance; how to avoid repetitive staff messages. | Vacancy/contract/appointment decision reaches a persisted terminal state or an informational review is acknowledged. | Staff role or negotiation detail. | Domain: staff and decision facts. Engine: measurable effects and AI decisions. Storage: staff/contract/lifecycle. UI/Web: staff workspace and action route. | **Not implemented in Phase 73.** |

## Current Implemented Boundary

Phase 73 implements only workflows backed by current durable facts:

- one blocking `matchday` message whose action changes from match preparation
  to match entry without changing identity;
- one informational `match_result` summary for a committed played fixture;
- one important `season_rollover` summary when the canonical season archive is
  created.

Ordinary player condition, form, and morale changes are not split into separate
messages. The committed fixture currently persists the score and match report,
but not a dedicated severity fact for exceptional consequences. Presentation
therefore cannot promote those changes to important attention.

## Review Rule

When one of the five areas receives a real playable phase, that phase must
update this matrix before adding a message category. The row should move from
`Not implemented` to an evidence link naming the workflow tests, persistence
contract, attention policy, resolution rule, and destination screen.

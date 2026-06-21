# Market Roadmap

This document is the market-specific roadmap for The Long Season.

It is an orientation map, not an executable implementation plan. Before any phase becomes active, it must be converted into `docs/steps/<phase>/` step documents and executed with the normal project loop.

## Design Principle

The market must be deep enough to create believable squad-building decisions, but not so complex that the game becomes a financial/legal simulator.

Every market action should answer three separate questions:

1. Can the buying club afford it?
2. Does the selling club accept the operation?
3. Does the player accept the destination and sporting context?

This separation is mandatory because money alone must not make every transfer possible.

Examples:

- a first-division star striker should reject a third-division club in normal conditions;
- a first-division young prospect may accept a second-division loan for minutes;
- an aging or fringe player may accept a lower category if the sporting role makes sense;
- a club with weak formation coverage may inspect available players, but the game must not auto-recommend who to buy.

## Manager-Control Rule

The market must expose facts and let the manager decide.

Allowed:

- show formation coverage;
- show natural/adapted/weak role fit;
- show player value, category, reputation, age, and availability facts;
- show structured accept/reject reasons after a user-declared action.

Not allowed:

- automatic signings;
- hidden best-buy recommendations;
- automatic squad-needs advice presented as instructions;
- automatic sale decisions;
- automatic loan destinations chosen by the system.

## Complexity Policy

Keep:

- permanent transfers;
- loans;
- contracts and wages;
- scouting/fog of war;
- AI club market behavior;
- simple negotiations;
- transfer windows;
- one-player exchange deals;
- simple installments after future-budget state exists.

Avoid or remove from the planned scope:

- sell-on percentages;
- appearance/goal bonuses;
- complex loan buy options or obligations;
- multiple-player exchanges;
- agent fee detail;
- highly legalistic clauses;
- deadline-day theatrics before the basic market loop works.

## Candidate Market Phase Sequence

Phase numbers in this folder are market-roadmap candidates, not binding `docs/steps/` phase numbers.

`docs/steps/16-career-systems-dependency-map/` must run first and decide whether this sequence can start immediately or whether shared career-state, economy, calendar, scouting, or youth foundations must be inserted.

1. [Market MVP Permanent Transfers](phases/phase-16-market-mvp-permanent-transfers.md)
2. [Career State And Transfer Persistence](phases/phase-17-career-state-and-transfer-persistence.md)
3. [Loans MVP](phases/phase-18-loans-mvp.md)
4. [Contracts And Wages](phases/phase-19-contracts-and-wages.md)
5. [Scouting And Information Quality](phases/phase-20-scouting-and-information-quality.md)
6. [AI Club Market Behavior](phases/phase-21-ai-club-market-behavior.md)
7. [Negotiation V1](phases/phase-22-negotiation-v1.md)
8. [Transfer Windows And Registration](phases/phase-23-transfer-windows-and-registration.md)
9. [Structured Transfer Deals](phases/phase-24-structured-transfer-deals.md)
10. [Market Balance And Economy Review](phases/phase-25-market-balance-and-economy-review.md)

## Mandatory Gate Before Each Market Phase

Before starting each phase:

1. Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/ROADMAP_PHASES_07_20.md`, and this roadmap.
2. Review the previous phase output manually.
3. Check if the previous phase created unrealistic market behavior, automatic advice, dead code, or state that is too hard to extend.
4. Rework the previous phase first if needed.
5. Create executable step docs only for the phase being implemented.
6. Keep all user-facing market text localized.

## Long-Term Shape

The market should eventually connect to:

- formation fit and squad depth;
- player ambition and career stage;
- club reputation and division;
- budgets and wages;
- scouting knowledge;
- youth development and loans;
- AI clubs and world evolution;
- season calendar and transfer windows;
- career saves.

The first MVP must not pretend to solve all of that. It must create the contracts and state shape that allow those systems to arrive later without rewriting the market core.

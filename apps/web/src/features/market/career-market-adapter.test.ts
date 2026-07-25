import { describe, expect, it } from "vitest";

import { createTestCareerFixture } from "../../test-fixtures/career-fixture";
import { presentCareerMarket } from "./career-market-adapter";

describe("presentCareerMarket", () => {
  it("projects window, finance, and every non-selected-club target from canonical facts", () => {
    const fixture = createTestCareerFixture("market-presentation");
    const presentation = presentCareerMarket(fixture.career);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    // Window state is resolved from the competition-owned catalog.
    expect(presentation.window.status).toMatch(/^(open|closed)$/);
    expect(presentation.window.currentDateIso).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Finance strip mirrors the selected club's canonical account.
    const finance = fixture.career.clubFinanceState?.accounts[fixture.career.selectedClubId];
    expect(presentation.finance.cashBalance).toBe(finance?.cashBalance);
    expect(presentation.finance.transferBudget).toBe(finance?.availableTransferBudget);
    expect(presentation.finance.annualWageHeadroom).toBe(
      Math.max(0, (finance?.annualWageBudget ?? 0) - (finance?.committedAnnualWage ?? 0)),
    );

    // Every target belongs to another club or is a free agent; never the selected club.
    const selectedClub = fixture.career.gameState.clubs[fixture.career.selectedClubId];
    const selectedIds = new Set((selectedClub?.playerIds ?? []).map(String));
    expect(presentation.targets.length).toBeGreaterThan(0);
    for (const target of presentation.targets) {
      expect(selectedIds.has(target.playerId)).toBe(false);
    }
    expect(new Set(presentation.targets.map((target) => target.playerId)).size).toBe(
      presentation.targets.length,
    );
  });

  it("exposes public levels and eligibility without hidden ability numbers", () => {
    const fixture = createTestCareerFixture("market-public-levels");
    const presentation = presentCareerMarket(fixture.career);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    const target = presentation.targets[0];
    expect(target?.currentLevel).toMatch(/^(leading|first_team|squad|depth)$/);
    expect(target?.potentialLevel).toMatch(/^(leading|first_team|squad|depth)$/);
    expect(target?.value).toBeGreaterThan(0);
    expect(target).not.toHaveProperty("currentAbility");
    expect(target).not.toHaveProperty("potentialAbility");

    // Eligibility is always the structured engine answer, never a bare boolean.
    for (const candidate of presentation.targets) {
      if (candidate.eligibility.status === "allowed") {
        expect(candidate.eligibility.action).toMatch(
          /^(submit_transfer_offer|submit_free_agent_contract_offer|submit_preliminary_agreement)$/,
        );
      } else {
        expect(candidate.eligibility.reason).toMatch(
          /^(outside_transfer_window|negotiation_already_open|future_agreement_already_exists|preliminary_not_yet_eligible)$/,
        );
      }
    }
  });

  it("reports zero pending exposure and no negotiations for a fresh career", () => {
    const fixture = createTestCareerFixture("market-pending-exposure");
    const presentation = presentCareerMarket(fixture.career);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    expect(presentation.finance.pendingExposure).toMatchObject({
      transferFees: 0,
      annualWages: 0,
      signingBonuses: 0,
      immediateCash: 0,
      openNegotiationCount: 0,
    });
    expect(presentation.negotiations).toHaveLength(0);
  });

  it("fails explicitly when the canonical market source is absent", () => {
    const fixture = createTestCareerFixture("market-missing-source");
    const { seniorSquadState: _seniorSquadState, ...careerWithoutSeniorSquad } = fixture.career;

    const presentation = presentCareerMarket(careerWithoutSeniorSquad);

    expect(presentation).toMatchObject({
      status: "error",
      messageKey: "career.market.error.missingData",
    });
  });
});

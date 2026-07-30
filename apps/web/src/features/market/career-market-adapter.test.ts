import { afterEach, describe, expect, it, vi } from "vitest";

import * as careerEngine from "@game/engine";
import {
  askingPriceCurves,
  playerPotentialProjectionPolicy,
  playerValuationConfig,
} from "@game/content";
import { buildCareerMarketView } from "@game/ui";

import { createTestCareerFixture } from "../../test-fixtures/career-fixture";
import { isInteractiveMarketRowTarget } from "./CareerMarketScreen";
import { presentCareerMarket } from "./career-market-adapter";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("presentCareerMarket", () => {
  it("projects window, finance, and every non-selected-club target from canonical facts", () => {
    const fixture = createTestCareerFixture("market-presentation");
    const presentation = presentCareerMarket(fixture.career, playerValuationConfig, askingPriceCurves);

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
    expect(presentation.targets).toHaveLength(1_166);
    for (const target of presentation.targets) {
      expect(selectedIds.has(target.playerId)).toBe(false);
      expect(fixture.career.gameState.playerIds.map(String)).toContain(target.playerId);
    }
    expect(new Set(presentation.targets.map((target) => target.playerId)).size).toBe(
      presentation.targets.length,
    );
    expect(countTargetsByTier(presentation.targets)).toEqual({
      first_division: 396,
      second_division: 396,
      third_division: 374,
      free_agent: 0,
    });
    for (const target of presentation.targets) {
      if (target.employment.status === "free_agent") continue;
      expect(target.employment.competitionId).toMatch(/^competition:/);
      expect(target.employment.competitionName.length).toBeGreaterThan(0);
    }
  });

  it("exposes global ratings and eligibility without hidden ability numbers", () => {
    const fixture = createTestCareerFixture("market-public-levels");
    const presentation = presentCareerMarket(fixture.career, playerValuationConfig, askingPriceCurves);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    const assessedPlayers = presentation.targets.flatMap((target) => {
      const player = fixture.career.gameState.players[
        fixture.career.gameState.playerIds.find((playerId) => String(playerId) === target.playerId)!
      ];
      return player === undefined ? [] : [player];
    });
    const expectedByPlayerId = new Map(
      careerEngine.derivePublicPlayerAssessments({
        ratingScale: playerValuationConfig.ratingScale,
        potentialProjectionPolicy: playerPotentialProjectionPolicy,
        currentDate: fixture.career.gameState.calendar.currentDate,
        players: assessedPlayers,
      }).map((assessment) => [String(assessment.playerId), assessment]),
    );

    const target = presentation.targets[0];
    expect(target?.currentRating.stars).toBeGreaterThanOrEqual(1);
    expect(target?.currentRating.stars).toBeLessThanOrEqual(6);
    expect(target?.potentialRange.lowerStars).toBeGreaterThanOrEqual(1);
    expect(target?.potentialRange.upperStars).toBeLessThanOrEqual(6);
    expect(target?.potentialRange.lowerStars).toBeLessThanOrEqual(
      target?.potentialRange.upperStars ?? 0,
    );
    expect(target?.publicValue).toBeGreaterThan(0);
    expect(target).not.toHaveProperty("currentAbility");
    expect(target).not.toHaveProperty("potentialAbility");
    for (const candidate of presentation.targets) {
      expect(candidate.currentRating).toEqual(
        expectedByPlayerId.get(candidate.playerId)?.currentRating,
      );
      expect(candidate.potentialRange).toEqual(
        (() => {
          const expected = expectedByPlayerId.get(candidate.playerId);
          return expected === undefined
            ? undefined
            : {
                lowerStars: expected.potentialProjection.lowerRating.stars,
                upperStars: expected.potentialProjection.upperRating.stars,
              };
        })(),
      );
    }

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
    const presentation = presentCareerMarket(fixture.career, playerValuationConfig, askingPriceCurves);

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

  it("keeps exact attributes and archive statistics lazy and cached per opened target", () => {
    const selectStatistics = vi.spyOn(careerEngine, "selectCareerPlayerStatistics");
    const fixture = createTestCareerFixture("market-lazy-player-detail");
    const presentation = presentCareerMarket(fixture.career, playerValuationConfig, askingPriceCurves);

    expect(presentation.status).toBe("ready");
    expect(selectStatistics).not.toHaveBeenCalled();
    if (presentation.status !== "ready") return;

    const view = buildCareerMarketView(presentation);
    expect(view.status).toBe("ready");
    expect(selectStatistics).not.toHaveBeenCalled();
    if (view.status !== "ready") return;

    const firstTarget = presentation.targets[0];
    const secondTarget = presentation.targets[1];
    expect(firstTarget).toBeDefined();
    expect(secondTarget).toBeDefined();
    if (firstTarget === undefined || secondTarget === undefined) return;

    const firstDetail = view.targets.resolveDetail(firstTarget.playerId);
    expect(firstDetail?.playerId).toBe(firstTarget.playerId);
    expect(firstDetail?.roles.every(
      (role) => role.suitability === "natural" || role.suitability === "adapted",
    )).toBe(true);
    expect(firstDetail?.attributeGroups).toHaveLength(3);
    expect(firstDetail).not.toHaveProperty("currentAbilities");
    expect(firstDetail).not.toHaveProperty("potentialAbility");
    expect(selectStatistics).toHaveBeenCalledTimes(1);
    expect(selectStatistics).toHaveBeenLastCalledWith({
      careerState: fixture.career,
      playerId: fixture.career.gameState.playerIds.find(
        (playerId) => String(playerId) === firstTarget.playerId,
      ),
    });

    expect(view.targets.resolveDetail(firstTarget.playerId)).toBe(firstDetail);
    expect(selectStatistics).toHaveBeenCalledTimes(1);

    const secondDetail = view.targets.resolveDetail(secondTarget.playerId);
    expect(secondDetail?.playerId).toBe(secondTarget.playerId);
    expect(secondDetail).not.toBe(firstDetail);
    expect(selectStatistics).toHaveBeenCalledTimes(2);

    expect(view.targets.resolveDetail("player:not-a-market-target")).toBeUndefined();
    expect(selectStatistics).toHaveBeenCalledTimes(2);
  });

  it("fails explicitly when the canonical market source is absent", () => {
    const fixture = createTestCareerFixture("market-missing-source");
    const { seniorSquadState: _seniorSquadState, ...careerWithoutSeniorSquad } = fixture.career;

    const presentation = presentCareerMarket(
      careerWithoutSeniorSquad,
      playerValuationConfig,
      askingPriceCurves,
    );

    expect(presentation).toMatchObject({
      status: "error",
      messageKey: "career.market.error.missingData",
    });
  });
});

function countTargetsByTier(
  targets: Extract<ReturnType<typeof presentCareerMarket>, { status: "ready" }>["targets"],
) {
  const counts = {
    first_division: 0,
    second_division: 0,
    third_division: 0,
    free_agent: 0,
  };
  for (const target of targets) counts[target.employment.sourceTier] += 1;
  return counts;
}

describe("Market row activation guard", () => {
  it("recognizes nested labels, forms, tabs, menus, and native controls", () => {
    const closest = vi.fn<(selector: string) => Element | null>(
      () => ({}) as Element,
    );
    const target = { closest } as unknown as EventTarget;
    const row = {} as HTMLTableRowElement;

    expect(isInteractiveMarketRowTarget(target, row)).toBe(true);
    expect(closest).toHaveBeenCalledOnce();
    expect(closest.mock.calls[0]?.[0]).toContain("label");
    expect(closest.mock.calls[0]?.[0]).toContain("form");
    expect(closest.mock.calls[0]?.[0]).toContain("[role='tab']");
    expect(closest.mock.calls[0]?.[0]).toContain("[role='menu']");
    expect(isInteractiveMarketRowTarget(row, row)).toBe(false);
  });
});

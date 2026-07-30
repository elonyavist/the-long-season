import { describe, expect, it } from "vitest";
import { playerValuationConfig } from "@game/content";

import { createPreparedTestCareerFixture, createTestCareerFixture } from "../../test-fixtures/career-fixture";
import { previewCareerContractOffer, presentCareerSquad } from "./career-squad-adapter";

describe("presentCareerSquad", () => {
  it("projects the complete selected-club roster from canonical career facts", () => {
    const fixture = createTestCareerFixture("squad-presentation");
    const presentation = presentCareerSquad(fixture.career, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    const club = fixture.career.gameState.clubs[fixture.career.selectedClubId];
    expect(presentation.selectedClubName).toBe(club?.name);
    expect(presentation.players).toHaveLength(club?.playerIds.length ?? 0);
    expect(presentation.profilesByPlayerId.size).toBe(presentation.players.length);
    expect(new Set(presentation.players.map((player) => player.playerId)).size).toBe(
      presentation.players.length,
    );
  });

  it("exposes public ratings and annual contract facts without hidden ability numbers", () => {
    const fixture = createTestCareerFixture("squad-public-levels");
    const presentation = presentCareerSquad(fixture.career, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    const player = presentation.players[0];
    const profile = player === undefined
      ? undefined
      : presentation.profilesByPlayerId.get(player.playerId);

    expect(player?.currentRating.stars).toBeGreaterThanOrEqual(1);
    expect(player?.currentRating.stars).toBeLessThanOrEqual(6);
    expect((player?.currentRating.stars ?? 0) * 2).toBe(Math.round(
      (player?.currentRating.stars ?? 0) * 2,
    ));
    expect(player?.potentialRange.lowerStars).toBeGreaterThanOrEqual(1);
    expect(player?.potentialRange.upperStars).toBeLessThanOrEqual(6);
    expect(player?.potentialRange.lowerStars).toBeLessThanOrEqual(
      player?.potentialRange.upperStars ?? 0,
    );
    expect(profile?.currentRating).toEqual(player?.currentRating);
    expect(profile?.potentialRange).toEqual(player?.potentialRange);
    expect(profile?.contract.activeContract.annualWage).toBeGreaterThan(0);
    expect(profile?.contract.activeContract).not.toHaveProperty("monthlyWage");
    expect(player).not.toHaveProperty("currentAbility");
    expect(player).not.toHaveProperty("potentialAbility");
    expect(profile).not.toHaveProperty("currentAbility");
    expect(profile).not.toHaveProperty("potentialAbility");
  });

  it("projects role-aware detail and coverage-aware current and career statistics", () => {
    const fixture = createTestCareerFixture("squad-role-aware-detail");
    const presentation = presentCareerSquad(fixture.career, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    const profiles = [...presentation.profilesByPlayerId.values()];
    const goalkeeper = profiles.find((profile) => profile.primaryRole === "goalkeeper");
    const outfield = profiles.find((profile) => profile.primaryRole !== "goalkeeper");
    expect(goalkeeper).toBeDefined();
    expect(outfield).toBeDefined();
    if (goalkeeper === undefined || outfield === undefined) return;

    expect(goalkeeper.roles.every(
      (role) => role.suitability === "natural" || role.suitability === "adapted",
    )).toBe(true);
    expect(goalkeeper.attributeGroups.map((group) => group.family)).toEqual([
      "goalkeeping",
      "mental",
      "physical",
    ]);
    expect(outfield.attributeGroups.map((group) => group.family)).toEqual([
      "technical",
      "mental",
      "physical",
    ]);
    expect(outfield.statistics.currentSeason.events).not.toHaveProperty("saves");
    expect(goalkeeper.statistics.currentSeason.events).toHaveProperty("saves");
    expect(goalkeeper.statistics.currentSeason).toMatchObject({
      scope: "current_season",
      participation: { coverage: "complete", appearances: 0 },
      events: { coverage: "complete", goals: 0, assists: 0, saves: 0 },
    });
    expect(goalkeeper.statistics.career).toMatchObject({
      scope: "career",
      participation: { coverage: "complete", appearances: 0 },
      events: { coverage: "complete", goals: 0, assists: 0, saves: 0 },
    });
  });

  it("projects exact XI and bench slot ownership for explicit plan commands", () => {
    const fixture = createPreparedTestCareerFixture("squad-selection-slots");
    const presentation = presentCareerSquad(fixture.career, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    const starter = presentation.players.find((player) => player.selection === "starting_xi");
    const substitute = presentation.players.find((player) => player.selection === "substitute");
    expect(starter?.selectedLineupSlotKey).toBeDefined();
    expect(starter?.selectedBenchSlotKey).toBeUndefined();
    expect(substitute?.selectedBenchSlotKey).toMatch(/^bench:/);
    expect(substitute?.selectedLineupSlotKey).toBeUndefined();

    const occupiedChoice = substitute?.lineupSlotChoices.find(
      (choice) => choice.slotKey === starter?.selectedLineupSlotKey,
    );
    expect(occupiedChoice).toMatchObject({
      occupantPlayerId: starter?.playerId,
      occupantName: `${starter?.firstName} ${starter?.lastName}`,
      occupantCurrentRating: starter?.currentRating,
    });
    expect(presentation.placementContext.lineupSlots).toEqual(
      fixture.draft.tacticalBoardDraft.slots.map((slot) => ({
        slotKey: slot.slotId,
        ...(slot.playerId === null ? {} : { playerId: slot.playerId }),
      })),
    );
    expect(presentation.placementContext.benchSlots).toEqual(
      Array.from({ length: 8 }, (_, index) => {
        const slotKey = `bench:${String(index + 1).padStart(2, "0")}`;
        const playerId = fixture.draft.selectedBenchPlayerIdsBySlot[slotKey];
        return {
          slotKey,
          ...(playerId === undefined ? {} : { playerId }),
        };
      }),
    );
  });

  it("uses the selected formation catalog labels for side-specific XI choices", () => {
    const fixture = createPreparedTestCareerFixture("squad-side-specific-slots");
    const presentation = presentCareerSquad(fixture.career, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    const choices = presentation.players[0]?.lineupSlotChoices;
    expect(choices?.find((choice) => choice.slotKey === "st-right")?.labelKey).toBe(
      "career.matchPreparation.slot.stRight",
    );
    expect(choices?.find((choice) => choice.slotKey === "st-left")?.labelKey).toBe(
      "career.matchPreparation.slot.stLeft",
    );
  });

  it("previews renewal finances through canonical annual wage and cash rules", () => {
    const fixture = createTestCareerFixture("squad-contract-finance-preview");
    const presentation = presentCareerSquad(fixture.career, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;
    const player = presentation.players[0];
    const profile = player === undefined
      ? undefined
      : presentation.profilesByPlayerId.get(player.playerId);
    expect(profile).toBeDefined();
    if (player === undefined || profile === undefined) return;

    const preview = previewCareerContractOffer(fixture.career, player.playerId, {
      durationYears: 2,
      annualWage: profile.contract.activeContract.annualWage,
      squadStatus: profile.contract.activeContract.squadStatus,
      bonuses: profile.contract.activeContract.bonuses,
    });

    expect(preview.status).toBe("affordable");
    if (preview.status !== "affordable") return;
    expect(preview.projectedCommittedAnnualWage).toBe(preview.currentCommittedAnnualWage);
    expect(preview.projectedRemainingAnnualWageBudget).toBe(
      preview.currentRemainingAnnualWageBudget,
    );
    expect(preview.projectedCashBalance).toBe(
      preview.currentCashBalance - profile.contract.activeContract.bonuses.signingBonus,
    );
  });

  it("fails explicitly when the canonical senior-squad source is absent", () => {
    const fixture = createTestCareerFixture("squad-missing-source");
    const { seniorSquadState: _seniorSquadState, ...careerWithoutSeniorSquad } = fixture.career;
    const presentation = presentCareerSquad(
      careerWithoutSeniorSquad,
      fixture.draft,
      playerValuationConfig,
    );

    expect(presentation).toMatchObject({
      status: "error",
      messageKey: "career.squad.error.missingData",
    });
  });

  it("indexes contract history once instead of rescanning it for every player", () => {
    const fixture = createTestCareerFixture("squad-history-index");
    const seniorSquad = fixture.career.seniorSquadState;
    expect(seniorSquad).toBeDefined();
    if (seniorSquad === undefined) return;

    let historyReads = 0;
    const observedHistory = new Proxy(seniorSquad.contractHistory, {
      get(target, property, receiver) {
        if (typeof property === "string" && Object.hasOwn(target, property)) {
          historyReads += 1;
        }
        return Reflect.get(target, property, receiver);
      },
    });
    const observedCareer = {
      ...fixture.career,
      seniorSquadState: {
        ...seniorSquad,
        contractHistory: observedHistory,
      },
    };

    const presentation = presentCareerSquad(observedCareer, fixture.draft, playerValuationConfig);

    expect(presentation.status).toBe("ready");
    expect(historyReads).toBe(seniorSquad.contractHistoryEntryIds.length);
  });
});

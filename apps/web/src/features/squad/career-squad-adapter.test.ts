import { describe, expect, it } from "vitest";

import { createPreparedTestCareerFixture, createTestCareerFixture } from "../../test-fixtures/career-fixture";
import { previewCareerContractOffer, presentCareerSquad } from "./career-squad-adapter";

describe("presentCareerSquad", () => {
  it("projects the complete selected-club roster from canonical career facts", () => {
    const fixture = createTestCareerFixture("squad-presentation");
    const presentation = presentCareerSquad(fixture.career, fixture.draft);

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

  it("exposes public levels and annual contract facts without hidden ability numbers", () => {
    const fixture = createTestCareerFixture("squad-public-levels");
    const presentation = presentCareerSquad(fixture.career, fixture.draft);

    expect(presentation.status).toBe("ready");
    if (presentation.status !== "ready") return;

    const player = presentation.players[0];
    const profile = player === undefined
      ? undefined
      : presentation.profilesByPlayerId.get(player.playerId);

    expect(player?.currentLevel).toMatch(/^(leading|first_team|squad|depth)$/);
    expect(player?.potentialLevel).toMatch(/^(leading|first_team|squad|depth)$/);
    expect(profile?.contract.activeContract.annualWage).toBeGreaterThan(0);
    expect(profile?.contract.activeContract).not.toHaveProperty("monthlyWage");
    expect(player).not.toHaveProperty("currentAbility");
    expect(player).not.toHaveProperty("potentialAbility");
  });

  it("projects exact XI and bench slot ownership for explicit plan commands", () => {
    const fixture = createPreparedTestCareerFixture("squad-selection-slots");
    const presentation = presentCareerSquad(fixture.career, fixture.draft);

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
    });
  });

  it("previews renewal finances through canonical annual wage and cash rules", () => {
    const fixture = createTestCareerFixture("squad-contract-finance-preview");
    const presentation = presentCareerSquad(fixture.career, fixture.draft);

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
    );

    expect(presentation).toMatchObject({
      status: "error",
      messageKey: "career.squad.error.missingData",
    });
  });
});

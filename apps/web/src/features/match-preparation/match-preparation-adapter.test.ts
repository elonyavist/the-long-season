import { describe, expect, it } from "vitest";

import {
  buildWebCareerState,
  type WebCareerSaveId,
  type WebCareerState,
} from "../../runtime/web-career-runtime";
import { orderPlayerOptionsForLineupSlot } from "../../shared/lib/player-position-ordering";
import {
  applyMatchPreparationSelectionAction,
  buildCareerTacticalBoardPlayers,
  buildDurableMatchPreparation,
  buildMatchPreparationView,
  createMatchPreparationDraft,
  isMatchPreparationDraftDirty,
  moveMatchPreparationBoardSlot,
  selectMatchPreparationFormation,
  selectMatchPreparationBenchPlayer,
  selectMatchPreparationPlayer,
  selectMatchPreparationTactic,
} from "./match-preparation-adapter";

describe("loaded-career match-preparation adapter", () => {
  it("uses the selected club's generated players instead of demo identities", () => {
    const career = careerState("real-squad");
    const draft = createMatchPreparationDraft(career);
    const view = buildMatchPreparationView(career, draft);
    const club = career.gameState.clubs[career.selectedClubId];
    if (club === undefined) throw new Error("Expected selected club");
    const firstPlayer = club?.playerIds[0] === undefined ? undefined : career.gameState.players[club.playerIds[0]];
    if (firstPlayer === undefined) throw new Error("Expected selected-club player");

    expect(view.lineup.slots[0]?.playerOptions).toHaveLength(club.playerIds.length);
    expect(view.lineup.slots[0]?.playerOptions[0]?.name).toBe(`${firstPlayer.firstName} ${firstPlayer.lastName}`);
    expect(view.lineup.slots[0]?.playerOptions.some((player) => player.playerId.startsWith("player:demo"))).toBe(false);
    expect(buildCareerTacticalBoardPlayers(career)).toHaveLength(club.playerIds.length);
  });

  it("keeps XI and bench mutually exclusive while editing", () => {
    const career = careerState("exclusive");
    const playerId = career.gameState.clubs[career.selectedClubId]?.playerIds[0];
    if (playerId === undefined) throw new Error("Expected selected-club player");
    const lineup = selectMatchPreparationPlayer(createMatchPreparationDraft(career), "gk", playerId);

    const bench = selectMatchPreparationBenchPlayer(lineup, "bench:01", playerId);

    expect(bench.selectedPlayerIdsBySlot.gk).toBeUndefined();
    expect(bench.selectedBenchPlayerIdsBySlot["bench:01"]).toBe(playerId);
  });

  it("orders a role specialist above a raw-average outlier without duplicating selections", () => {
    const career = careerState("role-strength");
    const club = career.gameState.clubs[career.selectedClubId];
    if (club === undefined) throw new Error("Expected selected club");
    const strikers = club.playerIds
      .map((playerId) => career.gameState.players[playerId])
      .filter((player) => player?.primaryRole === "striker");
    const specialist = strikers[0];
    const rawOutlier = strikers[1];
    if (specialist === undefined || rawOutlier === undefined) throw new Error("Expected two selected-club strikers");

    const specialistAbilities = strikerSpecialistAbilities(specialist.abilities);
    const rawOutlierAbilities = strikerRawOutlierAbilities(rawOutlier.abilities);
    const weakenedPlayers = Object.fromEntries(
      Object.entries(career.gameState.players).map(([playerId, player]) => {
        const baseline = mapTestAbilities(player.abilities, () => 1);
        return [playerId, { ...player, abilities: baseline, potential: baseline }];
      }),
    ) as WebCareerState["gameState"]["players"];
    const shapedCareer: WebCareerState = {
      ...career,
      gameState: {
        ...career.gameState,
        players: {
          ...weakenedPlayers,
          [specialist.id]: { ...specialist, abilities: specialistAbilities, potential: specialistAbilities },
          [rawOutlier.id]: { ...rawOutlier, abilities: rawOutlierAbilities, potential: rawOutlierAbilities },
        },
      },
    };
    const formationDraft = selectMatchPreparationFormation(createMatchPreparationDraft(shapedCareer), "4-2-3-1");
    const strikerSlot = buildMatchPreparationView(shapedCareer, formationDraft).lineup.slots.find(
      (slot) => slot.slotKey === "st",
    );
    const specialistOption = strikerSlot?.playerOptions.find((player) => player.playerId === specialist.id);
    const outlierOption = strikerSlot?.playerOptions.find((player) => player.playerId === rawOutlier.id);
    if (specialistOption === undefined || outlierOption === undefined) throw new Error("Expected striker options");

    expect(specialistOption.currentAbility).toBeGreaterThan(outlierOption.currentAbility ?? 0);
    expect(orderPlayerOptionsForLineupSlot("st", strikerSlot?.playerOptions ?? [])[0]?.playerId).toBe(specialist.id);

    const selected = applyMatchPreparationSelectionAction(shapedCareer, formationDraft, "auto");
    const selectedIds = [
      ...Object.values(selected.selectedPlayerIdsBySlot),
      ...Object.values(selected.selectedBenchPlayerIdsBySlot),
    ];
    expect(new Set(selectedIds).size).toBe(selectedIds.length);
  });

  it("round-trips exact formation, coordinates, roles, XI, bench, and tactic", () => {
    const career = careerState("round-trip");
    let draft = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
    draft = selectMatchPreparationTactic(draft, "tactic:balanced");
    draft = moveMatchPreparationBoardSlot(draft, "rm", 0.83, 0.43);
    const durable = buildDurableMatchPreparation(career, draft);
    if (durable === undefined) throw new Error("Expected complete preparation");

    const rehydrated = createMatchPreparationDraft({ ...career, matchPreparation: durable });

    expect(rehydrated.isSaved).toBe(true);
    expect(rehydrated.selectedFormationId).toBe(draft.selectedFormationId);
    expect(rehydrated.selectedPlayerIdsBySlot).toEqual(draft.selectedPlayerIdsBySlot);
    expect(rehydrated.selectedBenchPlayerIdsBySlot).toEqual(draft.selectedBenchPlayerIdsBySlot);
    expect(rehydrated.selectedTacticProfileId).toBe(draft.selectedTacticProfileId);
    expect(rehydrated.tacticalBoardDraft).toEqual(draft.tacticalBoardDraft);
  });

  it("keeps a completed fixture plan editable but unconfirmed for the next fixture", () => {
    const career = careerState("next-fixture-draft");
    let draft = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
    draft = selectMatchPreparationTactic(draft, "tactic:balanced");
    const durable = buildDurableMatchPreparation(career, draft);
    if (durable === undefined) throw new Error("Expected complete preparation");

    const { targetFixtureId: _completedFixtureId, ...carriedPreparation } = durable;
    const carried = createMatchPreparationDraft({ ...career, matchPreparation: carriedPreparation });

    expect(carried.selectedPlayerIdsBySlot).toEqual(draft.selectedPlayerIdsBySlot);
    expect(carried.selectedBenchPlayerIdsBySlot).toEqual(draft.selectedBenchPlayerIdsBySlot);
    expect(carried.selectedTacticProfileId).toBe(draft.selectedTacticProfileId);
    expect(carried.isSaved).toBe(false);
  });

  it("keeps the just-played fixture confirmed until its full-time review is acknowledged", () => {
    const career = careerState("full-time-review");
    let draft = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
    draft = selectMatchPreparationTactic(draft, "tactic:balanced");
    const durable = buildDurableMatchPreparation(career, draft);
    if (durable === undefined) throw new Error("Expected complete preparation");
    const targetFixtureId = durable.targetFixtureId;
    if (targetFixtureId === undefined) throw new Error("Expected targeted fixture id");
    const fixture = career.gameState.fixtures[targetFixtureId];
    if (fixture === undefined) throw new Error("Expected targeted fixture");

    const reviewed = createMatchPreparationDraft({
      ...career,
      matchPreparation: durable,
      gameState: {
        ...career.gameState,
        fixtures: {
          ...career.gameState.fixtures,
          [fixture.id]: {
            ...fixture,
            result: { played: true, homeGoals: 1, awayGoals: 0 },
          },
        },
      },
    });

    expect(reviewed.isSaved).toBe(true);
  });

  it("does not produce a durable payload from an incomplete draft", () => {
    const career = careerState("incomplete");

    expect(buildDurableMatchPreparation(career, createMatchPreparationDraft(career))).toBeUndefined();
  });

  it("derives dirty state only from durable preparation facts", () => {
    const career = careerState("dirty");
    const baseline = createMatchPreparationDraft(career);
    const playerId = career.gameState.clubs[career.selectedClubId]?.playerIds[0];
    if (playerId === undefined) throw new Error("Expected selected-club player");

    const changedLineup = selectMatchPreparationPlayer(baseline, "gk", playerId);
    const restoredLineup = selectMatchPreparationPlayer(changedLineup, "gk", undefined);
    const changedFormation = selectMatchPreparationFormation(baseline, "4-3-3");
    const restoredFormation = selectMatchPreparationFormation(changedFormation, "4-4-2");

    expect(isMatchPreparationDraftDirty(career, baseline)).toBe(false);
    expect(isMatchPreparationDraftDirty(career, changedLineup)).toBe(true);
    expect(isMatchPreparationDraftDirty(career, restoredLineup)).toBe(false);
    expect(isMatchPreparationDraftDirty(career, changedFormation)).toBe(true);
    expect(isMatchPreparationDraftDirty(career, restoredFormation)).toBe(false);
    expect(isMatchPreparationDraftDirty(career, selectMatchPreparationTactic(baseline, "tactic:balanced"))).toBe(true);
  });
});

function careerState(suffix: string) {
  return buildWebCareerState({
    saveId: `save:adapter-${suffix}` as WebCareerSaveId,
    worldSeed: `adapter-${suffix}-seed`,
  });
}

type WebPlayerAbilities = WebCareerState["gameState"]["players"][keyof WebCareerState["gameState"]["players"]]["abilities"];

const STRIKER_CORE_KEYS = new Set([
  "technical.finishing",
  "technical.technique",
  "physical.heading",
  "mental.anticipation",
  "mental.composure",
]);

const STRIKER_SECONDARY_KEYS = new Set([
  "technical.dribbling",
  "technical.penalties",
  "physical.pace",
  "physical.strength",
  "physical.agility",
  "mental.positioning",
]);

const STRIKER_ALLOWED_KEYS = new Set([
  "technical.passing",
  "technical.crossing",
  "technical.freeKicks",
  "physical.stamina",
  "mental.vision",
  "mental.determination",
  "mental.leadership",
]);

function strikerSpecialistAbilities(abilities: WebPlayerAbilities): WebPlayerAbilities {
  return mapTestAbilities(abilities, (key) => {
    if (STRIKER_CORE_KEYS.has(key)) return 18;
    if (STRIKER_SECONDARY_KEYS.has(key)) return 12;
    if (STRIKER_ALLOWED_KEYS.has(key)) return 5;
    return 1;
  });
}

function strikerRawOutlierAbilities(abilities: WebPlayerAbilities): WebPlayerAbilities {
  return mapTestAbilities(abilities, (key) => {
    if (STRIKER_ALLOWED_KEYS.has(key)) return 20;
    if (STRIKER_CORE_KEYS.has(key) || STRIKER_SECONDARY_KEYS.has(key)) return 7;
    return 3;
  });
}

function mapTestAbilities(
  abilities: WebPlayerAbilities,
  valueForKey: (key: string) => number,
): WebPlayerAbilities {
  return Object.fromEntries(
    Object.entries(abilities).map(([groupKey, group]) => [
      groupKey,
      Object.fromEntries(
        Object.keys(group).map((abilityKey) => [abilityKey, valueForKey(`${groupKey}.${abilityKey}`)]),
      ),
    ]),
  ) as unknown as WebPlayerAbilities;
}

import type { FakeLeagueSystem } from "@game/content";
import {
  previewPermanentTransfer,
  type EvaluatePermanentTransferInput,
  type PermanentTransferApplyPreview,
} from "@game/engine";
import type {
  MessageKey,
  Translator,
} from "@game/i18n";

import {
  MARKET_DEMO_PROFILE_PRO01_AFFORDABLE_PERMANENT,
  MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED,
  type MarketDemoProfileKey,
} from "./profile-keys.ts";

type CliGameState = EvaluatePermanentTransferInput["gameState"];
type CliMarketState = EvaluatePermanentTransferInput["marketState"];
type CliIntent = EvaluatePermanentTransferInput["intent"];
type ClubId = FakeLeagueSystem["clubIds"][number];
type PlayerId = FakeLeagueSystem["playerIds"][number];
type CliPlayer = CliGameState["players"][PlayerId];
type CliPlayerAbilities = CliPlayer["abilities"];
type CliMoney = CliMarketState["clubBudgets"][ClubId]["transferBudget"];
type CliClubTransferBudget = CliMarketState["clubBudgets"][ClubId];

interface MarketDemoScenario {
  readonly selectedClubId: ClubId;
  readonly buyingClubId: ClubId;
  readonly sellingClubId: ClubId;
  readonly targetPlayerId: PlayerId;
  readonly gameState: CliGameState;
  readonly marketState: CliMarketState;
}

/**
 * Formats a standalone permanent-transfer market inspection.
 */
export function formatMarketDemoOutput(
  league: FakeLeagueSystem,
  seed: string,
  profileKey: MarketDemoProfileKey,
  text: Translator,
): readonly string[] {
  const scenario = buildMarketDemoScenario(league, profileKey);
  const intent: CliIntent = {
    buyingClubId: scenario.buyingClubId,
    sellingClubId: scenario.sellingClubId,
    playerId: scenario.targetPlayerId,
  };
  const preview = previewPermanentTransfer({
    gameState: scenario.gameState,
    marketState: scenario.marketState,
    intent,
  });
  const buyerBudgetBefore = scenario.marketState.clubBudgets[scenario.buyingClubId]?.transferBudget;
  const buyerBudgetAfter = preview.marketState.clubBudgets[scenario.buyingClubId]?.transferBudget;
  const lines = [
    text("market.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("season.competition")}: ${league.competition.name}`,
    `${text("market.demo")}: ${profileKey}`,
    `${text("setup.selectedClub")}: ${clubLabel(scenario.selectedClubId, scenario.gameState)}`,
    `${text("market.transferKind")}: ${text("market.transferKind.permanent")}`,
    `${text("market.buyingClub")}: ${clubLabel(scenario.buyingClubId, scenario.gameState)}`,
    `${text("market.sellingClub")}: ${clubLabel(scenario.sellingClubId, scenario.gameState)}`,
    `${text("market.targetPlayer")}: ${playerLabel(scenario.targetPlayerId, scenario.gameState)}`,
    `${text("market.status")}: ${formatMarketStatus(preview, text)}`,
    `${text("market.transferValue")}: ${formatMoney(preview.transferFee)}`,
    `${text("market.buyerBudgetBefore")}: ${formatMoney(buyerBudgetBefore)}`,
    `${text("market.buyerBudgetAfter")}: ${formatMoney(buyerBudgetAfter)}`,
    text("market.inspectionOnly"),
  ];

  lines.push(`${text("market.reasons")}:`);
  lines.push(...formatReasonLines(preview, text));
  lines.push(`${text("market.rosterPreview")}:`);
  lines.push(...formatRosterPreviewLines(scenario, preview, text));

  return lines;
}

function buildMarketDemoScenario(league: FakeLeagueSystem, profileKey: MarketDemoProfileKey): MarketDemoScenario {
  if (profileKey === MARKET_DEMO_PROFILE_PRO01_AFFORDABLE_PERMANENT) {
    return buildAffordableScenario(league);
  }

  if (profileKey === MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED) {
    return buildStarRejectedScenario(league);
  }

  return buildAffordableScenario(league);
}

function buildAffordableScenario(league: FakeLeagueSystem): MarketDemoScenario {
  const selectedClubId = requiredClubId(league, 1);
  const sellingClubId = requiredClubId(league, 18);
  const targetPlayerId = requiredClubPlayerId(league, sellingClubId, 10);

  return {
    selectedClubId,
    buyingClubId: selectedClubId,
    sellingClubId,
    targetPlayerId,
    gameState: gameStateFromLeague(league),
    marketState: marketStateFixture([
      [selectedClubId, money(6_000_000_00)],
      [sellingClubId, money(500_000_00)],
    ]),
  };
}

function buildStarRejectedScenario(league: FakeLeagueSystem): MarketDemoScenario {
  const selectedClubId = requiredClubId(league, 1);
  const sellingClubId = requiredClubId(league, 2);
  const targetPlayerId = requiredClubPlayerId(league, sellingClubId, 10);
  const gameState = gameStateFromLeague(league);
  const sellingClub = gameState.clubs[sellingClubId];
  const targetPlayer = gameState.players[targetPlayerId];

  if (sellingClub === undefined || targetPlayer === undefined) {
    throw new Error(`Cannot build market demo scenario: ${profileKeyLabel(MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED)}`);
  }

  return {
    selectedClubId,
    buyingClubId: selectedClubId,
    sellingClubId,
    targetPlayerId,
    gameState: {
      ...gameState,
      clubs: {
        ...gameState.clubs,
        [sellingClubId]: {
          ...sellingClub,
          category: "first_division",
          reputation: 10,
        },
      },
      players: {
        ...gameState.players,
        [targetPlayerId]: {
          ...targetPlayer,
          abilities: abilitiesFixture(16),
          potential: abilitiesFixture(18),
        },
      },
    },
    marketState: marketStateFixture([
      [selectedClubId, money(100_000_000_00)],
      [sellingClubId, money(0)],
    ]),
  };
}

function gameStateFromLeague(league: FakeLeagueSystem): CliGameState {
  return {
    meta: {
      seed: "market-demo",
      rngAlgorithmVersion: "market-demo",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: league.seasonStartDate,
      currentSeasonId: league.seasonId,
    },
    players: league.players,
    playerIds: league.playerIds,
    playerStates: league.playerStates,
    clubs: league.clubsById,
    clubIds: league.clubIds,
    fixtures: {},
    fixtureIds: [],
  };
}

function marketStateFixture(rows: readonly (readonly [ClubId, CliMoney])[]): CliMarketState {
  const clubBudgets: Record<ClubId, CliClubTransferBudget> = {} as Record<ClubId, CliClubTransferBudget>;
  const clubBudgetIds: ClubId[] = [];

  for (const [clubId, transferBudget] of rows) {
    clubBudgets[clubId] = {
      clubId,
      transferBudget,
    };
    clubBudgetIds.push(clubId);
  }

  return {
    clubBudgets,
    clubBudgetIds,
  };
}

function formatReasonLines(preview: PermanentTransferApplyPreview, text: Translator): readonly string[] {
  const lines: string[] = [];

  if (preview.reasons.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    for (const reason of preview.reasons) {
      lines.push(`  ${text(presentationMessageKey("market.reason", reason.code))}`);
    }
  }

  if (preview.willingness?.reasons !== undefined && preview.willingness.reasons.length > 0) {
    lines.push(`  ${text("market.playerWillingness")}:`);
    for (const reason of preview.willingness.reasons) {
      lines.push(`    ${text(presentationMessageKey("market.willingnessReason", reason.code))}`);
    }
  }

  return lines;
}

function formatRosterPreviewLines(
  scenario: MarketDemoScenario,
  preview: PermanentTransferApplyPreview,
  text: Translator,
): readonly string[] {
  if (preview.status === "rejected") {
    return [`  ${text("market.rosterPreviewRejected")}`];
  }

  const buyingBefore = scenario.gameState.clubs[scenario.buyingClubId]?.playerIds.length ?? 0;
  const buyingAfter = preview.gameState.clubs[scenario.buyingClubId]?.playerIds.length ?? buyingBefore;
  const sellingBefore = scenario.gameState.clubs[scenario.sellingClubId]?.playerIds.length ?? 0;
  const sellingAfter = preview.gameState.clubs[scenario.sellingClubId]?.playerIds.length ?? sellingBefore;

  return [
    `  ${text("market.buyingClub")}: ${buyingBefore} -> ${buyingAfter}`,
    `  ${text("market.sellingClub")}: ${sellingBefore} -> ${sellingAfter}`,
  ];
}

function formatMarketStatus(preview: PermanentTransferApplyPreview, text: Translator): string {
  return text(preview.status === "accepted" ? "market.status.accepted" : "market.status.rejected");
}

function formatMoney(value: CliMoney | undefined): string {
  if (value === undefined) {
    return "EUR --";
  }

  return `EUR ${(value / 100).toFixed(2)}`;
}

function abilitiesFixture(value: number): CliPlayerAbilities {
  const ability = value as CliPlayerAbilities["technical"]["finishing"];

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}

function requiredClubId(league: FakeLeagueSystem, oneBasedClubNumber: number): ClubId {
  const clubId = league.clubIds[oneBasedClubNumber - 1];

  if (clubId === undefined) {
    throw new Error(`Cannot build market demo without club ${oneBasedClubNumber}`);
  }

  return clubId;
}

function requiredClubPlayerId(league: FakeLeagueSystem, clubId: ClubId, oneBasedSlotNumber: number): PlayerId {
  const playerId = league.clubsById[clubId]?.playerIds[oneBasedSlotNumber - 1];

  if (playerId === undefined) {
    throw new Error(`Cannot build market demo without player ${oneBasedSlotNumber}`);
  }

  return playerId;
}

function playerLabel(playerId: PlayerId, gameState: CliGameState): string {
  const player = gameState.players[playerId];
  return player === undefined ? String(playerId) : `${player.firstName} ${player.lastName}`;
}

function clubLabel(clubId: ClubId, gameState: CliGameState): string {
  return gameState.clubs[clubId]?.shortName ?? String(clubId);
}

function money(value: number): CliMoney {
  return value as CliMoney;
}

function presentationMessageKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}

function profileKeyLabel(profileKey: MarketDemoProfileKey): string {
  return profileKey;
}

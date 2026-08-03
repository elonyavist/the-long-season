import type { CanonicalPlayerRole } from "@game/engine";
import type { MessageKey, Translator } from "@game/i18n";
import { toISO } from "@game/shared";

import { CLI_CAREER_WORLD_GENERATOR_VERSION } from "./scenarios.ts";
import type {
  CliCareerState,
  CliClubFinanceAccount,
  CliClubFinanceState,
  CliGameState,
  CliMoney,
  ClubId,
  PlayerId,
} from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];
type CliFixture = CliGameState["fixtures"][CliFixtureId];

/**
 * Formats one canonical lineup role for CLI output.
 *
 * Lineup slots carry the manager's canonical role, so presentation reuses the
 * canonical role labels rather than keeping a second four-way vocabulary of its
 * own.
 */
export function formatLineupRole(canonicalRole: CanonicalPlayerRole, text: Translator): string {
  return text(presentationMessageKey("career.player.role", canonicalRole));
}

/** Formats a tactic slider value with stable CLI precision. */
export function formatTacticKnob(value: number): string {
  return value.toFixed(2);
}

/** Formats optional seeded-world metadata shared by career overview and roster views. */
export function formatCareerWorldMetadataLines(careerState: CliCareerState, text: Translator): readonly string[] {
  if (careerState.careerWorld === undefined) {
    return [];
  }

  return [
    `${text("career.worldSeed")}: ${careerState.careerWorld.worldSeed}`,
    `${text("career.generatorVersion")}: ${careerState.careerWorld.generatorVersion}`,
  ];
}

/** Formats the next selected-club fixture, preserving the localized empty-state line. */
export function formatNextSelectedClubFixtureLines(
  careerState: CliCareerState,
  fixture: CliFixture | undefined,
  text: Translator,
): readonly string[] {
  if (fixture === undefined) {
    return [`  ${text("career.noNextSelectedClubFixture")}`];
  }

  return [
    `  ${fixture.id} ${toISO(fixture.date)} ${text("career.fixtureRound", {
      round: String(fixture.roundNumber),
    })}: ${clubLabel(fixture.homeClubId, careerState.gameState)} vs ${clubLabel(fixture.awayClubId, careerState.gameState)}`,
  ];
}

/** Finds the first unplayed fixture involving the selected club in schedule order. */
export function findNextSelectedClubFixture(careerState: CliCareerState): CliFixture | undefined {
  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];

    if (fixture === undefined || fixture.result?.played === true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      return fixture;
    }
  }

  return undefined;
}

/** Counts played selected-club fixtures for compact career inspection output. */
export function countPlayedSelectedClubFixtures(careerState: CliCareerState): number {
  let count = 0;

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];
    if (fixture === undefined || fixture.result?.played !== true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      count += 1;
    }
  }

  return count;
}

/** Formats persisted transfer history for career inspection output. */
export function formatTransferHistoryLines(careerState: CliCareerState, text: Translator): readonly string[] {
  if (careerState.transferHistory.length === 0) {
    return [`  ${text("career.noTransferHistory")}`];
  }

  return careerState.transferHistory.map((entry) => {
    const base = text("career.historyEntry", {
      sequence: String(entry.sequenceNumber),
      player: playerLabel(entry.playerId, careerState.gameState),
      seller: entry.kind === "permanent_transfer"
        ? clubLabel(entry.sellingClubId, careerState.gameState)
        : text("career.market.employment.free_agent"),
      buyer: clubLabel(entry.buyingClubId, careerState.gameState),
    });

    const commercialFacts = entry.kind === "permanent_transfer"
      ? [
          `${text("career.historyPublicValue")}: ${formatMoney(entry.publicValue)}`,
          `${text("career.historyAskingPrice")}: ${formatMoney(entry.initialAskingPrice)}`,
          `${text("career.historyOfferedFee")}: ${formatMoney(entry.offeredFee)}`,
          ...(entry.counterFee === undefined
            ? []
            : [`${text("career.historyCounterFee")}: ${formatMoney(entry.counterFee)}`]),
          `${text("career.historyAgreedFee")}: ${formatMoney(entry.agreedFee)}`,
          `${text("career.historyFee")}: ${formatMoney(entry.completedFee)}`,
        ]
      : [
          `${text("career.historyPublicValue")}: ${formatMoney(entry.publicValue)}`,
          `${text("career.historyFee")}: ${formatMoney(entry.completedFee)}`,
        ];

    return `  ${base}; ${commercialFacts.join("; ")}; ${text(
      "career.historyDate",
    )}: ${toISO(entry.occurredOn)}`;
  });
}

/** Formats selected and transfer-affected clubs for career inspection output. */
export function formatAffectedClubLines(careerState: CliCareerState, text: Translator): readonly string[] {
  return affectedClubIds(careerState).map((clubId) => {
    const club = careerState.gameState.clubs[clubId];
    const account = careerState.clubFinanceState === undefined
      ? undefined
      : findClubFinanceAccount(careerState.clubFinanceState, clubId);

    return `  ${clubLabel(clubId, careerState.gameState)}: ${text("career.clubRosterSize")}=${
      club?.playerIds.length ?? 0
    } ${text("career.clubBudget")}=${formatMoney(account?.availableTransferBudget)}`;
  });
}

/** Finds one canonical club-finance account without relying on record order. */
export function findClubFinanceAccount(
  financeState: CliClubFinanceState,
  clubId: ClubId,
): CliClubFinanceAccount | undefined {
  for (const financeClubId of financeState.clubIds) {
    if (financeClubId === clubId) {
      return financeState.accounts[financeClubId];
    }
  }

  return undefined;
}

function affectedClubIds(careerState: CliCareerState): readonly ClubId[] {
  const seen = new Set<string>();
  const clubIds: ClubId[] = [];

  pushUniqueClubId(clubIds, seen, careerState.selectedClubId);

  for (const entry of careerState.transferHistory) {
    pushUniqueClubId(clubIds, seen, entry.buyingClubId);
    if (entry.kind === "permanent_transfer") {
      pushUniqueClubId(clubIds, seen, entry.sellingClubId);
    }
  }

  return clubIds;
}

function pushUniqueClubId(clubIds: ClubId[], seen: Set<string>, clubId: ClubId): void {
  if (seen.has(clubId)) {
    return;
  }

  seen.add(clubId);
  clubIds.push(clubId);
}

export function formatMoney(value: CliMoney | undefined): string {
  if (value === undefined) {
    return "EUR --";
  }

  return `EUR ${(value / 100).toFixed(2)}`;
}

export function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

export function playerLabel(playerId: PlayerId, gameState: CliGameState): string {
  const player = gameState.players[playerId];
  return player === undefined ? String(playerId) : `${player.firstName} ${player.lastName}`;
}

export function clubLabel(clubId: ClubId, gameState: CliGameState): string {
  return gameState.clubs[clubId]?.name ?? String(clubId);
}

export function presentationMessageKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}

export function compareAscii(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

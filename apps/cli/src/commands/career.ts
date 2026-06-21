import { createFakeLeagueSystem, type FakeLeagueSystem } from "@game/content";
import {
  applyCareerPermanentTransfer,
  type ApplyCareerPermanentTransferInput,
  type ApplyCareerPermanentTransferResult,
} from "@game/engine";
import {
  createTranslator,
  formatSupportedLanguages,
  parseLanguageCode,
  type MessageKey,
  type SupportedLanguage,
  type Translator,
} from "@game/i18n";
import {
  JsonCareerStorage,
  StorageError,
  type SaveCareerInput,
} from "@game/storage";
import { toISO } from "@game/shared";

import {
  DEFAULT_SIMULATE_SEASON_SEED,
  MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED,
  SUPPORTED_MARKET_DEMO_PROFILES,
  type MarketDemoProfileKey,
} from "./simulate-season/profile-keys.ts";

type CliCareerState = ApplyCareerPermanentTransferInput["careerState"];
type CliGameState = CliCareerState["gameState"];
type CliMarketState = CliCareerState["marketState"];
type CliIntent = ApplyCareerPermanentTransferInput["intent"];
type ClubId = FakeLeagueSystem["clubIds"][number];
type PlayerId = FakeLeagueSystem["playerIds"][number];
type CliPlayer = CliGameState["players"][PlayerId];
type CliPlayerAbilities = CliPlayer["abilities"];
type CliMoney = CliMarketState["clubBudgets"][ClubId]["transferBudget"];
type CliClubTransferBudget = CliMarketState["clubBudgets"][ClubId];
type CliSaveId = SaveCareerInput["saveId"];

/** Minimal IO adapter used by command tests. */
export interface CareerCommandIo {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
}

/** Optional adapters for deterministic command tests. */
export interface CareerCommandOptions {
  /** Directory used by the JSON career storage adapter. */
  readonly storageDirectoryPath?: string;
}

type ParsedCareerArgs =
  | {
      readonly ok: true;
      readonly seed: string;
      readonly saveId: CliSaveId;
      readonly language: SupportedLanguage;
      readonly mode: "apply";
      readonly marketDemo: MarketDemoProfileKey;
    }
  | {
      readonly ok: true;
      readonly seed: string;
      readonly saveId: CliSaveId;
      readonly language: SupportedLanguage;
      readonly mode: "inspect";
    }
  | {
      readonly ok: false;
      readonly language: SupportedLanguage;
      readonly message: string;
    };

interface CareerMarketScenario {
  readonly selectedClubId: ClubId;
  readonly buyingClubId: ClubId;
  readonly sellingClubId: ClubId;
  readonly targetPlayerId: PlayerId;
  readonly gameState: CliGameState;
  readonly marketState: CliMarketState;
}

/**
 * Runs the deterministic career CLI command.
 *
 * @example
 * await runCareerCommand(["--seed=demo-001", "--save=career-demo", "--apply-market-demo=pro01-affordable-permanent"]);
 */
export async function runCareerCommand(
  args: readonly string[],
  io: CareerCommandIo = defaultIo(),
  options: CareerCommandOptions = {},
): Promise<number> {
  const parsed = parseCareerArgs(args);
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(text("career.usage", { marketProfiles: formatSupportedMarketDemoProfiles() }));
    return 1;
  }

  const storage = new JsonCareerStorage({
    directoryPath: options.storageDirectoryPath ?? "saves/career",
  });

  if (parsed.mode === "inspect") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      for (const line of formatCareerInspectOutput({ careerState, text })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  const league = createFakeLeagueSystem();
  const scenario = buildMarketDemoScenario(league, parsed.marketDemo);
  const careerState = careerStateFromScenario(parsed.saveId, scenario);
  const intent: CliIntent = {
    buyingClubId: scenario.buyingClubId,
    sellingClubId: scenario.sellingClubId,
    playerId: scenario.targetPlayerId,
  };
  const result = applyCareerPermanentTransfer({ careerState, intent });
  const careerSaveWritten = result.status === "accepted";

  if (careerSaveWritten) {
    await storage.saveCareer({
      saveId: parsed.saveId,
      name: String(parsed.saveId),
      state: result.careerState,
    });
  }

  for (const line of formatCareerMarketApplyOutput({
    league,
    seed: parsed.seed,
    saveId: parsed.saveId,
    profileKey: parsed.marketDemo,
    scenario,
    result,
    careerSaveWritten,
    text,
  })) {
    io.stdout(line);
  }

  return 0;
}

/**
 * Parses career command arguments without performing side effects.
 */
function parseCareerArgs(args: readonly string[]): ParsedCareerArgs {
  let seed = DEFAULT_SIMULATE_SEASON_SEED;
  let saveId: CliSaveId | undefined;
  let marketDemo: MarketDemoProfileKey | undefined;
  let language: SupportedLanguage = "en";
  let inspect = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === undefined) {
      continue;
    }

    const languageResult = parseLanguageArgument(args, index, language);
    if (languageResult.handled) {
      if (!languageResult.ok) {
        return { ok: false, language, message: languageResult.message };
      }

      language = languageResult.language;
      index += languageResult.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === "--seed") {
      const value = args[index + 1];
      if (value === undefined || value.length === 0) {
        return { ok: false, language, message: createTranslator(language)("season.error.seedRequired") };
      }

      seed = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--seed=")) {
      const value = arg.slice("--seed=".length);
      if (value.length === 0) {
        return { ok: false, language, message: createTranslator(language)("season.error.seedRequired") };
      }

      seed = value;
      continue;
    }

    if (arg === "--save") {
      const value = args[index + 1];
      const parsedSaveId = parseSaveId(value);
      if (parsedSaveId === undefined) {
        return { ok: false, language, message: createTranslator(language)("career.error.saveRequired") };
      }

      saveId = parsedSaveId;
      index += 1;
      continue;
    }

    if (arg.startsWith("--save=")) {
      const parsedSaveId = parseSaveId(arg.slice("--save=".length));
      if (parsedSaveId === undefined) {
        return { ok: false, language, message: createTranslator(language)("career.error.saveRequired") };
      }

      saveId = parsedSaveId;
      continue;
    }

    if (arg === "--apply-market-demo") {
      if (inspect) {
        return { ok: false, language, message: createTranslator(language)("career.error.inspectWithApply") };
      }

      const parsedMarketDemo = parseMarketDemo(args[index + 1], language);
      if (!parsedMarketDemo.ok) {
        return { ok: false, language, message: parsedMarketDemo.message };
      }

      marketDemo = parsedMarketDemo.marketDemo;
      index += 1;
      continue;
    }

    if (arg.startsWith("--apply-market-demo=")) {
      if (inspect) {
        return { ok: false, language, message: createTranslator(language)("career.error.inspectWithApply") };
      }

      const parsedMarketDemo = parseMarketDemo(arg.slice("--apply-market-demo=".length), language);
      if (!parsedMarketDemo.ok) {
        return { ok: false, language, message: parsedMarketDemo.message };
      }

      marketDemo = parsedMarketDemo.marketDemo;
      continue;
    }

    if (arg === "--inspect") {
      if (marketDemo !== undefined) {
        return { ok: false, language, message: createTranslator(language)("career.error.inspectWithApply") };
      }

      inspect = true;
      continue;
    }

    return { ok: false, language, message: createTranslator(language)("cli.error.unknownArgument", { arg }) };
  }

  if (saveId === undefined) {
    return { ok: false, language, message: createTranslator(language)("career.error.saveRequired") };
  }

  if (inspect) {
    return {
      ok: true,
      seed,
      saveId,
      language,
      mode: "inspect",
    };
  }

  if (marketDemo === undefined) {
    return {
      ok: false,
      language,
      message: createTranslator(language)("career.error.modeRequired"),
    };
  }

  return {
    ok: true,
    seed,
    saveId,
    mode: "apply",
    marketDemo,
    language,
  };
}

type ParsedLanguageArgument =
  | {
      readonly handled: false;
    }
  | {
      readonly handled: true;
      readonly ok: true;
      readonly language: SupportedLanguage;
      readonly consumedNext: boolean;
    }
  | {
      readonly handled: true;
      readonly ok: false;
      readonly message: string;
    };

function parseLanguageArgument(
  args: readonly string[],
  index: number,
  currentLanguage: SupportedLanguage,
): ParsedLanguageArgument {
  const arg = args[index];
  if (arg === undefined) {
    return { handled: false };
  }

  if (arg === "--lang") {
    const value = args[index + 1];
    const parsedLanguage = parseLanguageCode(value);

    if (parsedLanguage === undefined) {
      return {
        handled: true,
        ok: false,
        message:
          value === undefined || value.length === 0
            ? createTranslator(currentLanguage)("cli.error.langRequiresValue", { supported: formatSupportedLanguages() })
            : createTranslator(currentLanguage)("cli.error.unsupportedLanguage", {
                value,
                supported: formatSupportedLanguages(),
              }),
      };
    }

    return { handled: true, ok: true, language: parsedLanguage, consumedNext: true };
  }

  if (arg.startsWith("--lang=")) {
    const value = arg.slice("--lang=".length);
    const parsedLanguage = parseLanguageCode(value);

    if (parsedLanguage === undefined) {
      return {
        handled: true,
        ok: false,
        message: createTranslator(currentLanguage)("cli.error.unsupportedLanguage", {
          value,
          supported: formatSupportedLanguages(),
        }),
      };
    }

    return { handled: true, ok: true, language: parsedLanguage, consumedNext: false };
  }

  return { handled: false };
}

function parseSaveId(value: string | undefined): CliSaveId | undefined {
  if (value === undefined || value.length === 0 || value === "save:") {
    return undefined;
  }

  return (value.startsWith("save:") ? value : `save:${value}`) as CliSaveId;
}

type ParsedMarketDemo =
  | {
      readonly ok: true;
      readonly marketDemo: MarketDemoProfileKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

function parseMarketDemo(value: string | undefined, language: SupportedLanguage): ParsedMarketDemo {
  if (value === undefined || value.length === 0) {
    return {
      ok: false,
      message: createTranslator(language)("career.error.applyMarketDemoRequired", {
        supported: formatSupportedMarketDemoProfiles(),
      }),
    };
  }

  if (!isMarketDemoProfileKey(value)) {
    return {
      ok: false,
      message: createTranslator(language)("market.error.unsupportedValue", {
        value,
        supported: formatSupportedMarketDemoProfiles(),
      }),
    };
  }

  return { ok: true, marketDemo: value };
}

function isMarketDemoProfileKey(value: string): value is MarketDemoProfileKey {
  return SUPPORTED_MARKET_DEMO_PROFILES.includes(value as MarketDemoProfileKey);
}

function careerStateFromScenario(saveId: CliSaveId, scenario: CareerMarketScenario): CliCareerState {
  return {
    saveId,
    schemaVersion: 1,
    selectedClubId: scenario.selectedClubId,
    gameState: scenario.gameState,
    marketState: scenario.marketState,
    transferHistory: [],
  };
}

function buildMarketDemoScenario(league: FakeLeagueSystem, profileKey: MarketDemoProfileKey): CareerMarketScenario {
  if (profileKey === MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED) {
    return buildStarRejectedScenario(league);
  }

  return buildAffordableScenario(league);
}

function buildAffordableScenario(league: FakeLeagueSystem): CareerMarketScenario {
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

function buildStarRejectedScenario(league: FakeLeagueSystem): CareerMarketScenario {
  const selectedClubId = requiredClubId(league, 1);
  const sellingClubId = requiredClubId(league, 2);
  const targetPlayerId = requiredClubPlayerId(league, sellingClubId, 10);
  const gameState = gameStateFromLeague(league);
  const sellingClub = gameState.clubs[sellingClubId];
  const targetPlayer = gameState.players[targetPlayerId];

  if (sellingClub === undefined || targetPlayer === undefined) {
    throw new Error(profileKeyLabel(MARKET_DEMO_PROFILE_PRO01_STAR_REJECTED));
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
      seed: "career-demo",
      rngAlgorithmVersion: "career-demo",
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

function formatCareerMarketApplyOutput(input: {
  readonly league: FakeLeagueSystem;
  readonly seed: string;
  readonly saveId: CliSaveId;
  readonly profileKey: MarketDemoProfileKey;
  readonly scenario: CareerMarketScenario;
  readonly result: ApplyCareerPermanentTransferResult;
  readonly careerSaveWritten: boolean;
  readonly text: Translator;
}): readonly string[] {
  const buyerBudgetBefore = input.scenario.marketState.clubBudgets[input.scenario.buyingClubId]?.transferBudget;
  const buyerBudgetAfter = input.result.careerState.marketState.clubBudgets[input.scenario.buyingClubId]?.transferBudget;
  const lines = [
    input.text("career.marketApply.title"),
    `${input.text("season.seed")}: ${input.seed}`,
    `${input.text("season.competition")}: ${input.league.competition.name}`,
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("market.demo")}: ${input.profileKey}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.scenario.selectedClubId, input.scenario.gameState)}`,
    `${input.text("market.transferKind")}: ${input.text("market.transferKind.permanent")}`,
    `${input.text("market.buyingClub")}: ${clubLabel(input.scenario.buyingClubId, input.scenario.gameState)}`,
    `${input.text("market.sellingClub")}: ${clubLabel(input.scenario.sellingClubId, input.scenario.gameState)}`,
    `${input.text("market.targetPlayer")}: ${playerLabel(input.scenario.targetPlayerId, input.scenario.gameState)}`,
    `${input.text("market.status")}: ${formatCareerTransferStatus(input.result, input.text)}`,
    `${input.text("market.transferValue")}: ${formatMoney(input.result.transferFee)}`,
    `${input.text("market.buyerBudgetBefore")}: ${formatMoney(buyerBudgetBefore)}`,
    `${input.text("market.buyerBudgetAfter")}: ${formatMoney(buyerBudgetAfter)}`,
    `${input.text("career.saveWritten")}: ${input.text(input.careerSaveWritten ? "common.yes" : "common.no")}`,
    `${input.text("career.transferHistoryEntries")}: ${input.result.careerState.transferHistory.length}`,
    `${input.text("market.reasons")}:`,
    ...formatReasonLines(input.result, input.text),
    `${input.text("career.rosterPersisted")}:`,
    ...formatRosterPersistedLines(input.scenario, input.result, input.text),
  ];

  return lines;
}

function formatReasonLines(result: ApplyCareerPermanentTransferResult, text: Translator): readonly string[] {
  const lines: string[] = [];

  if (result.reasons.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    for (const reason of result.reasons) {
      lines.push(`  ${text(presentationMessageKey("market.reason", reason.code))}`);
    }
  }

  if (result.willingness?.reasons !== undefined && result.willingness.reasons.length > 0) {
    lines.push(`  ${text("market.playerWillingness")}:`);
    for (const reason of result.willingness.reasons) {
      lines.push(`    ${text(presentationMessageKey("market.willingnessReason", reason.code))}`);
    }
  }

  return lines;
}

function formatRosterPersistedLines(
  scenario: CareerMarketScenario,
  result: ApplyCareerPermanentTransferResult,
  text: Translator,
): readonly string[] {
  if (result.status === "rejected") {
    return [`  ${text("career.rosterNotPersisted")}`];
  }

  const buyingBefore = scenario.gameState.clubs[scenario.buyingClubId]?.playerIds.length ?? 0;
  const buyingAfter = result.careerState.gameState.clubs[scenario.buyingClubId]?.playerIds.length ?? buyingBefore;
  const sellingBefore = scenario.gameState.clubs[scenario.sellingClubId]?.playerIds.length ?? 0;
  const sellingAfter = result.careerState.gameState.clubs[scenario.sellingClubId]?.playerIds.length ?? sellingBefore;

  return [
    `  ${text("market.buyingClub")}: ${buyingBefore} -> ${buyingAfter}`,
    `  ${text("market.sellingClub")}: ${sellingBefore} -> ${sellingAfter}`,
  ];
}

function formatCareerInspectOutput(input: {
  readonly careerState: CliCareerState;
  readonly text: Translator;
}): readonly string[] {
  const selectedClub = input.careerState.gameState.clubs[input.careerState.selectedClubId];
  const selectedBudget = findClubTransferBudget(input.careerState.marketState, input.careerState.selectedClubId);
  const lines = [
    input.text("career.inspect.title"),
    `${input.text("career.save")}: ${input.careerState.saveId}`,
    `${input.text("setup.selectedClub")}: ${clubLabel(input.careerState.selectedClubId, input.careerState.gameState)}`,
    `${input.text("career.selectedClubRosterSize")}: ${selectedClub?.playerIds.length ?? 0}`,
    `${input.text("career.selectedClubTransferFunds")}: ${formatMoney(selectedBudget?.transferBudget)}`,
    `${input.text("career.transferHistory")}:`,
    ...formatTransferHistoryLines(input.careerState, input.text),
    `${input.text("career.affectedClubs")}:`,
    ...formatAffectedClubLines(input.careerState, input.text),
  ];

  return lines;
}

function formatTransferHistoryLines(careerState: CliCareerState, text: Translator): readonly string[] {
  if (careerState.transferHistory.length === 0) {
    return [`  ${text("career.noTransferHistory")}`];
  }

  return careerState.transferHistory.map((entry) => {
    const base = text("career.historyEntry", {
      sequence: String(entry.sequenceNumber),
      player: playerLabel(entry.playerId, careerState.gameState),
      seller: clubLabel(entry.sellingClubId, careerState.gameState),
      buyer: clubLabel(entry.buyingClubId, careerState.gameState),
    });

    return `  ${base}; ${text("career.historyFee")}: ${formatMoney(entry.transferFee)}; ${text(
      "career.historyDate",
    )}: ${toISO(entry.occurredOn)}`;
  });
}

function formatAffectedClubLines(careerState: CliCareerState, text: Translator): readonly string[] {
  return affectedClubIds(careerState).map((clubId) => {
    const club = careerState.gameState.clubs[clubId];
    const budget = findClubTransferBudget(careerState.marketState, clubId);

    return `  ${clubLabel(clubId, careerState.gameState)}: ${text("career.clubRosterSize")}=${
      club?.playerIds.length ?? 0
    } ${text("career.clubBudget")}=${formatMoney(budget?.transferBudget)}`;
  });
}

function affectedClubIds(careerState: CliCareerState): readonly ClubId[] {
  const seen = new Set<string>();
  const clubIds: ClubId[] = [];

  pushUniqueClubId(clubIds, seen, careerState.selectedClubId);

  for (const entry of careerState.transferHistory) {
    pushUniqueClubId(clubIds, seen, entry.buyingClubId);
    pushUniqueClubId(clubIds, seen, entry.sellingClubId);
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

function findClubTransferBudget(marketState: CliMarketState, clubId: ClubId): CliClubTransferBudget | undefined {
  for (const budgetClubId of marketState.clubBudgetIds) {
    if (budgetClubId === clubId) {
      return marketState.clubBudgets[budgetClubId];
    }
  }

  return undefined;
}

function formatCareerTransferStatus(result: ApplyCareerPermanentTransferResult, text: Translator): string {
  return text(result.status === "accepted" ? "market.status.accepted" : "market.status.rejected");
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
    throw new Error(String(oneBasedClubNumber));
  }

  return clubId;
}

function requiredClubPlayerId(league: FakeLeagueSystem, clubId: ClubId, oneBasedSlotNumber: number): PlayerId {
  const playerId = league.clubsById[clubId]?.playerIds[oneBasedSlotNumber - 1];

  if (playerId === undefined) {
    throw new Error(String(oneBasedSlotNumber));
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

function formatSupportedMarketDemoProfiles(): string {
  return SUPPORTED_MARKET_DEMO_PROFILES.join("|");
}

function defaultIo(): CareerCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}

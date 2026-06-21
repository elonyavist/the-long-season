import {
  FORMATION_KEYS,
  isFormationKey,
  type FormationKey,
} from "@game/engine";
import {
  createTranslator,
  formatSupportedLanguages,
  parseLanguageCode,
  type SupportedLanguage,
  type Translator,
} from "@game/i18n";

import {
  DEFAULT_SIMULATE_SEASON_SEED,
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  SUPPORTED_CONDITION_DEMO_PROFILES,
  SUPPORTED_DEMO_SETUP_PROFILES,
  SUPPORTED_LINEUP_DEMO_PROFILES,
  SUPPORTED_MARKET_DEMO_PROFILES,
  type ConditionDemoProfileKey,
  type LineupDemoProfileKey,
  type MarketDemoProfileKey,
  type SetupDemoProfileKey,
} from "./profile-keys.ts";

/**
 * Parsed command arguments.
 */
export type ParsedSimulateSeasonArgs =
  | {
      readonly ok: true;
      readonly seed: string;
      readonly roundNumber: number | undefined;
      readonly fixtureId: string | undefined;
      readonly setupDemo: SetupDemoProfileKey | undefined;
      readonly manualTacticSwitch: ParsedManualTacticSwitchValue | undefined;
      readonly conditionDemo: ConditionDemoProfileKey | undefined;
      readonly lineupDemo: LineupDemoProfileKey | undefined;
      readonly marketDemo: MarketDemoProfileKey | undefined;
      readonly formationFit: FormationKey | undefined;
      readonly language: SupportedLanguage;
    }
  | {
      readonly ok: false;
      readonly message: string;
      readonly language: SupportedLanguage;
    };

/** Parsed value for a manual tactic-switch declaration. */
export interface ParsedManualTacticSwitchValue {
  /** First minute where the target profile should apply. */
  readonly minute: number;
  /** Target saved demo profile key. */
  readonly profileKey: SetupDemoProfileKey;
}

/** Parsed round-number argument result. */
type ParsedRoundNumber =
  | {
      readonly ok: true;
      readonly roundNumber: number;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed fixture ID argument result. */
type ParsedFixtureId =
  | {
      readonly ok: true;
      readonly fixtureId: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed setup-demo argument result. */
type ParsedSetupDemo =
  | {
      readonly ok: true;
      readonly setupDemo: SetupDemoProfileKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed condition-demo argument result. */
type ParsedConditionDemo =
  | {
      readonly ok: true;
      readonly conditionDemo: ConditionDemoProfileKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed lineup-demo argument result. */
type ParsedLineupDemo =
  | {
      readonly ok: true;
      readonly lineupDemo: LineupDemoProfileKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed market-demo argument result. */
type ParsedMarketDemo =
  | {
      readonly ok: true;
      readonly marketDemo: MarketDemoProfileKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed formation-fit argument result. */
type ParsedFormationFit =
  | {
      readonly ok: true;
      readonly formationFit: FormationKey;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/** Parsed manual tactic-switch argument result. */
type ParsedManualTacticSwitch =
  | {
      readonly ok: true;
      readonly manualTacticSwitch: ParsedManualTacticSwitchValue;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

/**
 * Parses supported simulate-season command arguments.
 */
export function parseArgs(args: readonly string[]): ParsedSimulateSeasonArgs {
  let seed = DEFAULT_SIMULATE_SEASON_SEED;
  let roundNumber: number | undefined;
  let fixtureId: string | undefined;
  let setupDemo: SetupDemoProfileKey | undefined;
  let manualTacticSwitch: ParsedManualTacticSwitchValue | undefined;
  let conditionDemo: ConditionDemoProfileKey | undefined;
  let lineupDemo: LineupDemoProfileKey | undefined;
  let marketDemo: MarketDemoProfileKey | undefined;
  let formationFit: FormationKey | undefined;
  let language: SupportedLanguage = "en";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === undefined) {
      continue;
    }

    if (arg === "--lang") {
      const value = args[index + 1];
      const parsedLanguage = parseLanguageCode(value);

      if (parsedLanguage === undefined) {
        return {
          ok: false,
          language,
          message:
            value === undefined || value.length === 0
              ? createTranslator(language)("cli.error.langRequiresValue", { supported: formatSupportedLanguages() })
              : createTranslator(language)("cli.error.unsupportedLanguage", {
                  value,
                  supported: formatSupportedLanguages(),
                }),
        };
      }

      language = parsedLanguage;
      index += 1;
      continue;
    }

    if (arg.startsWith("--lang=")) {
      const value = arg.slice("--lang=".length);
      const parsedLanguage = parseLanguageCode(value);

      if (parsedLanguage === undefined) {
        return {
          ok: false,
          language,
          message: createTranslator(language)("cli.error.unsupportedLanguage", {
            value,
            supported: formatSupportedLanguages(),
          }),
        };
      }

      language = parsedLanguage;
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

    if (arg === "--round") {
      const value = args[index + 1];
      const parsedRound = parseRoundNumber(value, createTranslator(language));

      if (!parsedRound.ok) {
        return { ...parsedRound, language };
      }

      roundNumber = parsedRound.roundNumber;
      index += 1;
      continue;
    }

    if (arg.startsWith("--round=")) {
      const parsedRound = parseRoundNumber(arg.slice("--round=".length), createTranslator(language));

      if (!parsedRound.ok) {
        return { ...parsedRound, language };
      }

      roundNumber = parsedRound.roundNumber;
      continue;
    }

    if (arg === "--fixture") {
      const value = args[index + 1];
      const parsedFixture = parseFixtureId(value, createTranslator(language));

      if (!parsedFixture.ok) {
        return { ...parsedFixture, language };
      }

      fixtureId = parsedFixture.fixtureId;
      index += 1;
      continue;
    }

    if (arg.startsWith("--fixture=")) {
      const parsedFixture = parseFixtureId(arg.slice("--fixture=".length), createTranslator(language));

      if (!parsedFixture.ok) {
        return { ...parsedFixture, language };
      }

      fixtureId = parsedFixture.fixtureId;
      continue;
    }

    if (arg === "--setup-demo") {
      const value = args[index + 1];
      const parsedSetupDemo = parseSetupDemo(value, createTranslator(language));

      if (!parsedSetupDemo.ok) {
        return { ...parsedSetupDemo, language };
      }

      setupDemo = parsedSetupDemo.setupDemo;
      index += 1;
      continue;
    }

    if (arg.startsWith("--setup-demo=")) {
      const parsedSetupDemo = parseSetupDemo(arg.slice("--setup-demo=".length), createTranslator(language));

      if (!parsedSetupDemo.ok) {
        return { ...parsedSetupDemo, language };
      }

      setupDemo = parsedSetupDemo.setupDemo;
      continue;
    }

    if (arg === "--manual-tactic-switch") {
      const value = args[index + 1];
      const parsedManualTacticSwitch = parseManualTacticSwitch(value, createTranslator(language));

      if (!parsedManualTacticSwitch.ok) {
        return { ...parsedManualTacticSwitch, language };
      }

      manualTacticSwitch = parsedManualTacticSwitch.manualTacticSwitch;
      index += 1;
      continue;
    }

    if (arg.startsWith("--manual-tactic-switch=")) {
      const parsedManualTacticSwitch = parseManualTacticSwitch(
        arg.slice("--manual-tactic-switch=".length),
        createTranslator(language),
      );

      if (!parsedManualTacticSwitch.ok) {
        return { ...parsedManualTacticSwitch, language };
      }

      manualTacticSwitch = parsedManualTacticSwitch.manualTacticSwitch;
      continue;
    }

    if (arg === "--condition-demo") {
      const value = args[index + 1];
      const parsedConditionDemo = parseConditionDemo(value, createTranslator(language));

      if (!parsedConditionDemo.ok) {
        return { ...parsedConditionDemo, language };
      }

      conditionDemo = parsedConditionDemo.conditionDemo;
      index += 1;
      continue;
    }

    if (arg.startsWith("--condition-demo=")) {
      const parsedConditionDemo = parseConditionDemo(arg.slice("--condition-demo=".length), createTranslator(language));

      if (!parsedConditionDemo.ok) {
        return { ...parsedConditionDemo, language };
      }

      conditionDemo = parsedConditionDemo.conditionDemo;
      continue;
    }

    if (arg === "--lineup-demo") {
      const value = args[index + 1];
      const parsedLineupDemo = parseLineupDemo(value, createTranslator(language));

      if (!parsedLineupDemo.ok) {
        return { ...parsedLineupDemo, language };
      }

      lineupDemo = parsedLineupDemo.lineupDemo;
      index += 1;
      continue;
    }

    if (arg.startsWith("--lineup-demo=")) {
      const parsedLineupDemo = parseLineupDemo(arg.slice("--lineup-demo=".length), createTranslator(language));

      if (!parsedLineupDemo.ok) {
        return { ...parsedLineupDemo, language };
      }

      lineupDemo = parsedLineupDemo.lineupDemo;
      continue;
    }

    if (arg === "--market-demo") {
      const value = args[index + 1];
      const parsedMarketDemo = parseMarketDemo(value, createTranslator(language));

      if (!parsedMarketDemo.ok) {
        return { ...parsedMarketDemo, language };
      }

      marketDemo = parsedMarketDemo.marketDemo;
      index += 1;
      continue;
    }

    if (arg.startsWith("--market-demo=")) {
      const parsedMarketDemo = parseMarketDemo(arg.slice("--market-demo=".length), createTranslator(language));

      if (!parsedMarketDemo.ok) {
        return { ...parsedMarketDemo, language };
      }

      marketDemo = parsedMarketDemo.marketDemo;
      continue;
    }

    if (arg === "--formation-fit") {
      const value = args[index + 1];
      const parsedFormationFit = parseFormationFit(value, createTranslator(language));

      if (!parsedFormationFit.ok) {
        return { ...parsedFormationFit, language };
      }

      formationFit = parsedFormationFit.formationFit;
      index += 1;
      continue;
    }

    if (arg.startsWith("--formation-fit=")) {
      const parsedFormationFit = parseFormationFit(arg.slice("--formation-fit=".length), createTranslator(language));

      if (!parsedFormationFit.ok) {
        return { ...parsedFormationFit, language };
      }

      formationFit = parsedFormationFit.formationFit;
      continue;
    }

    return { ok: false, language, message: createTranslator(language)("cli.error.unknownArgument", { arg }) };
  }

  return {
    ok: true,
    seed,
    roundNumber,
    fixtureId,
    setupDemo,
    manualTacticSwitch,
    conditionDemo,
    lineupDemo,
    marketDemo,
    formationFit,
    language,
  };
}

/**
 * Formats supported setup-demo profiles for usage and error messages.
 */
export function formatSupportedSetupDemoProfiles(): string {
  return SUPPORTED_DEMO_SETUP_PROFILES.join("|");
}

/**
 * Formats supported condition-demo profiles for usage and error messages.
 */
export function formatSupportedConditionDemoProfiles(): string {
  return SUPPORTED_CONDITION_DEMO_PROFILES.join("|");
}

/**
 * Formats supported lineup-demo profiles for usage and error messages.
 */
export function formatSupportedLineupDemoProfiles(): string {
  return SUPPORTED_LINEUP_DEMO_PROFILES.join("|");
}

/**
 * Formats supported market-demo profiles for usage and error messages.
 */
export function formatSupportedMarketDemoProfiles(): string {
  return SUPPORTED_MARKET_DEMO_PROFILES.join("|");
}

/**
 * Parses one positive round number argument.
 */
function parseRoundNumber(value: string | undefined, text: Translator): ParsedRoundNumber {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: text("round.error.requiresPositive") };
  }

  if (!/^[1-9][0-9]*$/.test(value)) {
    return { ok: false, message: text("round.error.requiresPositive") };
  }

  return { ok: true, roundNumber: Number(value) };
}

/**
 * Parses one stable fixture ID argument.
 */
function parseFixtureId(value: string | undefined, text: Translator): ParsedFixtureId {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: text("fixture.error.requiresNonEmpty") };
  }

  if (!/^fixture:[A-Za-z0-9:_-]+$/.test(value)) {
    return { ok: false, message: text("fixture.error.requiresNamespaced") };
  }

  return { ok: true, fixtureId: value };
}

/**
 * Parses the deterministic setup-demo profile key.
 */
function parseSetupDemo(value: string | undefined, text: Translator): ParsedSetupDemo {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: text("setup.error.requiresValue", { supported: formatSupportedSetupDemoProfiles() }) };
  }

  if (!isSetupDemoProfileKey(value)) {
    return {
      ok: false,
      message: text("setup.error.unsupportedValue", { value, supported: formatSupportedSetupDemoProfiles() }),
    };
  }

  return { ok: true, setupDemo: value };
}

/**
 * Parses one manual tactic-switch declaration in `<minute>:<profile>` form.
 */
function parseManualTacticSwitch(value: string | undefined, text: Translator): ParsedManualTacticSwitch {
  if (value === undefined || value.length === 0) {
    return {
      ok: false,
      message: text("manualSwitch.error.requiresValue", { profile: DEMO_SETUP_PROFILE_PRO01_ATTACKING }),
    };
  }

  const separatorIndex = value.indexOf(":");

  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return {
      ok: false,
      message: text("manualSwitch.error.requiresValue", { profile: DEMO_SETUP_PROFILE_PRO01_ATTACKING }),
    };
  }

  const minuteValue = value.slice(0, separatorIndex);
  const profileValue = value.slice(separatorIndex + 1);

  if (!/^[1-9][0-9]*$/.test(minuteValue)) {
    return { ok: false, message: text("manualSwitch.error.minutePositive") };
  }

  if (!isSetupDemoProfileKey(profileValue)) {
    return {
      ok: false,
      message: text("manualSwitch.error.unsupportedProfile", {
        value: profileValue,
        supported: formatSupportedSetupDemoProfiles(),
      }),
    };
  }

  return {
    ok: true,
    manualTacticSwitch: {
      minute: Number(minuteValue),
      profileKey: profileValue,
    },
  };
}

/**
 * Parses the deterministic condition-demo profile key.
 */
function parseConditionDemo(value: string | undefined, text: Translator): ParsedConditionDemo {
  if (value === undefined || value.length === 0) {
    return {
      ok: false,
      message: text("condition.error.requiresValue", { supported: formatSupportedConditionDemoProfiles() }),
    };
  }

  if (!isConditionDemoProfileKey(value)) {
    return {
      ok: false,
      message: text("condition.error.unsupportedValue", {
        value,
        supported: formatSupportedConditionDemoProfiles(),
      }),
    };
  }

  return { ok: true, conditionDemo: value };
}

/**
 * Parses the deterministic lineup-demo profile key.
 */
function parseLineupDemo(value: string | undefined, text: Translator): ParsedLineupDemo {
  if (value === undefined || value.length === 0) {
    return {
      ok: false,
      message: text("lineup.error.requiresValue", { supported: formatSupportedLineupDemoProfiles() }),
    };
  }

  if (!isLineupDemoProfileKey(value)) {
    return {
      ok: false,
      message: text("lineup.error.unsupportedValue", {
        value,
        supported: formatSupportedLineupDemoProfiles(),
      }),
    };
  }

  return { ok: true, lineupDemo: value };
}

/**
 * Parses the deterministic market-demo profile key.
 */
function parseMarketDemo(value: string | undefined, text: Translator): ParsedMarketDemo {
  if (value === undefined || value.length === 0) {
    return {
      ok: false,
      message: text("market.error.requiresValue", { supported: formatSupportedMarketDemoProfiles() }),
    };
  }

  if (!isMarketDemoProfileKey(value)) {
    return {
      ok: false,
      message: text("market.error.unsupportedValue", {
        value,
        supported: formatSupportedMarketDemoProfiles(),
      }),
    };
  }

  return { ok: true, marketDemo: value };
}

/**
 * Parses one supported formation key for squad-fit inspection.
 */
function parseFormationFit(value: string | undefined, text: Translator): ParsedFormationFit {
  if (value === undefined || value.length === 0) {
    return { ok: false, message: text("formation.error.requiresValue", { supported: formatSupportedFormationKeys() }) };
  }

  if (!isFormationKey(value)) {
    return {
      ok: false,
      message: text("formation.error.unsupportedValue", { value, supported: formatSupportedFormationKeys() }),
    };
  }

  return { ok: true, formationFit: value };
}

/**
 * Checks whether a string is one of the supported setup-demo profiles.
 */
function isSetupDemoProfileKey(value: string): value is SetupDemoProfileKey {
  for (const profileKey of SUPPORTED_DEMO_SETUP_PROFILES) {
    if (value === profileKey) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a string is one of the supported condition-demo profiles.
 */
function isConditionDemoProfileKey(value: string): value is ConditionDemoProfileKey {
  for (const profileKey of SUPPORTED_CONDITION_DEMO_PROFILES) {
    if (value === profileKey) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a string is one of the supported lineup-demo profiles.
 */
function isLineupDemoProfileKey(value: string): value is LineupDemoProfileKey {
  for (const profileKey of SUPPORTED_LINEUP_DEMO_PROFILES) {
    if (value === profileKey) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a string is one of the supported market-demo profiles.
 */
function isMarketDemoProfileKey(value: string): value is MarketDemoProfileKey {
  for (const profileKey of SUPPORTED_MARKET_DEMO_PROFILES) {
    if (value === profileKey) {
      return true;
    }
  }

  return false;
}

/**
 * Formats supported formation keys for usage and error messages.
 */
function formatSupportedFormationKeys(): string {
  return FORMATION_KEYS.join("|");
}

import {
  createTranslator,
  formatSupportedLanguages,
  parseLanguageCode,
  type SupportedLanguage,
} from "@game/i18n";

import {
  DEFAULT_SIMULATE_SEASON_SEED,
  SUPPORTED_MARKET_DEMO_PROFILES,
  type MarketDemoProfileKey,
} from "../simulate-season/profile-keys.ts";
import type { CliSaveId } from "./types.ts";

/**
 * Parsed career command intent. It is deliberately small so the public command
 * orchestrator can switch on one mode without knowing argument parsing details.
 */
export type ParsedCareerArgs =
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
      readonly ok: true;
      readonly seed: string;
      readonly saveId: CliSaveId;
      readonly language: SupportedLanguage;
      readonly mode: "summary";
    }
  | {
      readonly ok: true;
      readonly seed: string;
      readonly saveId: CliSaveId;
      readonly language: SupportedLanguage;
      readonly mode: "advanceNextFixture";
    }
  | {
      readonly ok: true;
      readonly seed: string;
      readonly saveId: CliSaveId;
      readonly language: SupportedLanguage;
      readonly mode: "newWorldPreview";
    }
  | {
      readonly ok: false;
      readonly language: SupportedLanguage;
      readonly message: string;
    };

/**
 * Parses career command arguments without performing IO, storage, or gameplay
 * side effects.
 */
export function parseCareerArgs(args: readonly string[]): ParsedCareerArgs {
  let seed = DEFAULT_SIMULATE_SEASON_SEED;
  let saveId: CliSaveId | undefined;
  let marketDemo: MarketDemoProfileKey | undefined;
  let language: SupportedLanguage = "en";
  let inspect = false;
  let summary = false;
  let advanceNextFixture = false;
  let newWorldPreview = false;

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
      if (inspect || summary || advanceNextFixture || newWorldPreview) {
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
      if (inspect || summary || advanceNextFixture || newWorldPreview) {
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
      if (marketDemo !== undefined || summary || advanceNextFixture || newWorldPreview) {
        return { ok: false, language, message: createTranslator(language)("career.error.inspectWithApply") };
      }

      inspect = true;
      continue;
    }

    if (arg === "--summary") {
      if (marketDemo !== undefined || inspect || advanceNextFixture || newWorldPreview) {
        return { ok: false, language, message: createTranslator(language)("career.error.inspectWithApply") };
      }

      summary = true;
      continue;
    }

    if (arg === "--advance-next-fixture") {
      if (marketDemo !== undefined || inspect || summary || newWorldPreview) {
        return { ok: false, language, message: createTranslator(language)("career.error.inspectWithApply") };
      }

      advanceNextFixture = true;
      continue;
    }

    if (arg === "--new-world-preview") {
      if (marketDemo !== undefined || inspect || summary || advanceNextFixture) {
        return { ok: false, language, message: createTranslator(language)("career.error.inspectWithApply") };
      }

      newWorldPreview = true;
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

  if (summary) {
    return {
      ok: true,
      seed,
      saveId,
      language,
      mode: "summary",
    };
  }

  if (advanceNextFixture) {
    return {
      ok: true,
      seed,
      saveId,
      language,
      mode: "advanceNextFixture",
    };
  }

  if (newWorldPreview) {
    return {
      ok: true,
      seed,
      saveId,
      language,
      mode: "newWorldPreview",
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

/** Formats the supported profile list for localized usage/error messages. */
export function formatSupportedMarketDemoProfiles(): string {
  return SUPPORTED_MARKET_DEMO_PROFILES.join("|");
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

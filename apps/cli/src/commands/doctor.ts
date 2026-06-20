/**
 * Doctor command for the foundation CLI milestone.
 *
 * The command intentionally checks only static project wiring that exists in
 * Phase 0. It does not generate content, simulate matches, or touch gameplay.
 */
import {
  createTranslator,
  formatSupportedLanguages,
  parseLanguageCode,
  type SupportedLanguage,
} from "@game/i18n";

/**
 * Runs lightweight environment checks and prints a stable success message.
 *
 * @example
 * await runDoctorCommand(["--lang=it"]);
 */
export async function runDoctorCommand(args: readonly string[] = []): Promise<void> {
  const parsed = parseArgs(args);
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    console.error(parsed.message);
    return;
  }

  console.log(text("doctor.ok"));
}

/**
 * Parses the optional language flag for the lightweight doctor command.
 */
function parseArgs(args: readonly string[]): ParsedDoctorArgs {
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

    return {
      ok: false,
      language,
      message: createTranslator(language)("cli.error.unknownArgument", { arg }),
    };
  }

  return { ok: true, language };
}

/** Parsed doctor command arguments. */
type ParsedDoctorArgs =
  | {
      readonly ok: true;
      readonly language: SupportedLanguage;
    }
  | {
      readonly ok: false;
      readonly language: SupportedLanguage;
      readonly message: string;
    };

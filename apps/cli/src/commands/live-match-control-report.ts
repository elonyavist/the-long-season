import {
  createLiveMatchControlReport,
  DEFAULT_LIVE_MATCH_CONTROL_SEED_PREFIX,
  DEFAULT_LIVE_MATCH_CONTROL_WORLD_COUNT,
} from "./live-match-control-report-data.ts";
import { createTranslator } from "@game/i18n";

const text = createTranslator("en");

/** Minimal structured IO used by the deterministic gate command and tests. */
export interface LiveMatchControlReportCommandIo {
  readonly stdout: (line: string) => void;
  readonly stderr: (line: string) => void;
}

/** Runs the Phase 77 report and writes one machine-readable JSON document. */
export function runLiveMatchControlReportCommand(
  args: readonly string[],
  io: LiveMatchControlReportCommandIo = defaultIo(),
): number {
  const normalizedArgs = args[0] === "--" ? args.slice(1) : args;
  const parsed = parseArgs(normalizedArgs);
  if (!parsed.ok) {
    io.stderr(JSON.stringify({ error: parsed.message }));
    return 1;
  }

  const report = createLiveMatchControlReport({
    seedPrefix: parsed.seedPrefix,
    worldCount: parsed.worldCount,
  });
  io.stdout(JSON.stringify(report, null, parsed.compact ? 0 : 2));
  return report.status === "pass" ? 0 : 1;
}

interface ParsedArgsOk {
  readonly ok: true;
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly compact: boolean;
}

interface ParsedArgsInvalid {
  readonly ok: false;
  readonly message: string;
}

function parseArgs(args: readonly string[]): ParsedArgsOk | ParsedArgsInvalid {
  let seedPrefix = DEFAULT_LIVE_MATCH_CONTROL_SEED_PREFIX;
  let worldCount = DEFAULT_LIVE_MATCH_CONTROL_WORLD_COUNT;
  let compact = false;

  for (const arg of args) {
    if (arg === "--compact") {
      compact = true;
      continue;
    }
    if (arg.startsWith("--seed-prefix=")) {
      seedPrefix = arg.slice("--seed-prefix=".length);
      if (seedPrefix.length === 0) {
        return { ok: false, message: text("tenSeason.error.seedPrefixRequired") };
      }
      continue;
    }
    if (arg.startsWith("--worlds=")) {
      const value = arg.slice("--worlds=".length);
      worldCount = Number(value);
      if (!Number.isSafeInteger(worldCount) || worldCount <= 0) {
        return { ok: false, message: text("tenSeason.error.worldsInvalid", { value }) };
      }
      continue;
    }
    return { ok: false, message: text("cli.error.unknownArgument", { arg }) };
  }

  return { ok: true, seedPrefix, worldCount, compact };
}

function defaultIo(): LiveMatchControlReportCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}

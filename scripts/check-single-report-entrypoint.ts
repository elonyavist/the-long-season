import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const COMMAND_ROOT = join(ROOT, "apps/cli/src/commands");
const ALLOWED_REPORT_ROOT = join(COMMAND_ROOT, "simulation-report");
const ALLOWED_REPORT_SHELL = join(COMMAND_ROOT, "simulation-report.ts");
const ALLOWED_REPORT_SHELL_TEST = join(COMMAND_ROOT, "simulation-report.test.ts");
const RETIRED_SYMBOLS = [
  "runBalanceReportCommand",
  "runTenSeasonReportCommand",
  "runSeasonRecapReportCommand",
  "runTacticalShapeReportCommand",
  "runTacticalAgencyReportCommand",
  "runHardCapReachabilityReportCommand",
] as const;
const RETIRED_COMMANDS = [
  "balance-report",
  "ten-season-report",
  "season-recap-report",
  "tactical-shape-report",
  "tactical-agency-report",
  "hard-cap-reachability-report",
] as const;

/** Fails when a second report shell or compatibility alias reappears. */
async function main(): Promise<void> {
  const violations: string[] = [];
  for await (const file of sourceFiles(COMMAND_ROOT)) {
    const isAllowed = file === ALLOWED_REPORT_SHELL
      || file === ALLOWED_REPORT_SHELL_TEST
      || file.startsWith(`${ALLOWED_REPORT_ROOT}/`);
    if (!isAllowed && /report/u.test(relative(COMMAND_ROOT, file))) {
      violations.push(`${relative(ROOT, file)}: report code lives outside simulation-report ownership`);
    }
    const source = await readFile(file, "utf8");
    for (const symbol of RETIRED_SYMBOLS) {
      if (source.includes(symbol)) violations.push(`${relative(ROOT, file)}: retired symbol ${symbol}`);
    }
  }

  const indexSource = await readFile(join(ROOT, "apps/cli/src/index.ts"), "utf8");
  const dispatchedReports = [...indexSource.matchAll(/command === "([^"]*-report)"/gu)]
    .map((match) => match[1]);
  if (dispatchedReports.length !== 1 || dispatchedReports[0] !== "simulation-report") {
    violations.push(`apps/cli/src/index.ts: report dispatches are ${dispatchedReports.join(", ") || "none"}`);
  }

  const labels = await readFile(join(ROOT, "packages/i18n/src/labels.ts"), "utf8");
  const cliPackage = await readFile(join(ROOT, "apps/cli/package.json"), "utf8");
  for (const retired of RETIRED_COMMANDS) {
    const availableCommandLines = labels.split("\n").filter((line) =>
      line.includes('"cli.availableCommands"') && line.includes(retired)
    );
    if (availableCommandLines.length > 0) {
      violations.push(`packages/i18n/src/labels.ts: available commands still advertise ${retired}`);
    }
    if (cliPackage.includes(`"${retired}"`)) {
      violations.push(`apps/cli/package.json: package script still exposes ${retired}`);
    }
  }

  if (violations.length > 0) {
    console.error("Single report entrypoint check failed:");
    for (const violation of violations) console.error(`  ${violation}`);
    process.exitCode = 1;
    return;
  }
  console.log("Single report entrypoint check: OK (simulation-report only)");
}

async function* sourceFiles(directory: string): AsyncGenerator<string> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (extname(entry.name) === ".ts") yield path;
  }
}

await main();

/**
 * CLI application entrypoint.
 *
 * This entrypoint keeps command dispatch thin: parse the command name, call the
 * matching command module, and set a non-zero exit code for unknown commands.
 */
import { runDoctorCommand } from "./commands/doctor.ts";
import { runBalanceReportCommand } from "./commands/balance-report.ts";
import { runCareerCommand } from "./commands/career.ts";
import { runSimulateSeasonCommand } from "./commands/simulate-season.ts";
import { runTacticalShapeReportCommand } from "./commands/tactical-shape-report.ts";
import { runTenSeasonReportCommand } from "./commands/ten-season-report.ts";
import { createTranslator } from "@game/i18n";

/**
 * Dispatches the CLI command requested by the user.
 *
 * @example
 * await runCli(["doctor"]);
 */
export async function runCli(args: readonly string[]): Promise<void> {
  const normalizedArgs = args[0] === "--" ? args.slice(1) : args;
  const [command, ...commandArgs] = normalizedArgs;
  const text = createTranslator("en");

  if (command === "doctor") {
    await runDoctorCommand(commandArgs);
    return;
  }

  if (command === "simulate-season") {
    const exitCode = await runSimulateSeasonCommand(commandArgs);

    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }

    return;
  }

  if (command === "balance-report") {
    const exitCode = await runBalanceReportCommand(commandArgs);

    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }

    return;
  }

  if (command === "ten-season-report") {
    const exitCode = await runTenSeasonReportCommand(commandArgs);

    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }

    return;
  }

  if (command === "tactical-shape-report") {
    const exitCode = await runTacticalShapeReportCommand(commandArgs);

    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }

    return;
  }

  if (command === "career") {
    const exitCode = await runCareerCommand(commandArgs);

    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }

    return;
  }

  console.error(text("cli.error.unknownCommand", { command: command ?? "<none>" }));
  console.error(text("cli.availableCommands"));
  process.exitCode = 1;
}

await runCli(process.argv.slice(2));

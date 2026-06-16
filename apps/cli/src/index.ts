/**
 * CLI application entrypoint.
 *
 * This entrypoint keeps command dispatch thin: parse the command name, call the
 * matching command module, and set a non-zero exit code for unknown commands.
 */
import { runDoctorCommand } from "./commands/doctor.ts";
import { runSimulateSeasonCommand } from "./commands/simulate-season.ts";

/**
 * Dispatches the CLI command requested by the user.
 *
 * @example
 * await runCli(["doctor"]);
 */
export async function runCli(args: readonly string[]): Promise<void> {
  const normalizedArgs = args[0] === "--" ? args.slice(1) : args;
  const [command, ...commandArgs] = normalizedArgs;

  if (command === "doctor") {
    await runDoctorCommand();
    return;
  }

  if (command === "simulate-season") {
    const exitCode = await runSimulateSeasonCommand(commandArgs);

    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }

    return;
  }

  console.error(`Unknown command: ${command ?? "<none>"}`);
  console.error("Available commands: doctor, simulate-season");
  process.exitCode = 1;
}

await runCli(process.argv.slice(2));

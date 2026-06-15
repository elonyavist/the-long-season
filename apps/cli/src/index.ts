/**
 * CLI application entrypoint.
 *
 * This entrypoint keeps command dispatch thin: parse the command name, call the
 * matching command module, and set a non-zero exit code for unknown commands.
 */
import { runDoctorCommand } from "./commands/doctor.ts";

/**
 * Dispatches the CLI command requested by the user.
 *
 * @example
 * await runCli(["doctor"]);
 */
export async function runCli(args: readonly string[]): Promise<void> {
  const normalizedArgs = args[0] === "--" ? args.slice(1) : args;
  const [command] = normalizedArgs;

  if (command === "doctor") {
    await runDoctorCommand();
    return;
  }

  console.error(`Unknown command: ${command ?? "<none>"}`);
  console.error("Available commands: doctor");
  process.exitCode = 1;
}

await runCli(process.argv.slice(2));

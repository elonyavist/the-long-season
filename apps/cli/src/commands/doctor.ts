/**
 * Doctor command for the foundation CLI milestone.
 *
 * The command intentionally checks only static project wiring that exists in
 * Phase 0. It does not generate content, simulate matches, or touch gameplay.
 */

/**
 * Runs lightweight environment checks and prints a stable success message.
 *
 * @example
 * await runDoctorCommand();
 */
export async function runDoctorCommand(): Promise<void> {
  console.log("The Long Season doctor: OK");
}

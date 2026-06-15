/**
 * Shared technical errors used by deterministic utility modules.
 *
 * These errors intentionally avoid game-specific names so `shared` can remain
 * reusable by engine, storage, content, and tooling without importing domain
 * concepts.
 */

/**
 * Error thrown when a shared utility receives an invalid value.
 *
 * @example
 * throw new SharedValueError("seed must not be empty");
 */
export class SharedValueError extends Error {
  /**
   * Creates an error with a stable name for test assertions and logs.
   */
  public constructor(message: string) {
    super(message);
    this.name = "SharedValueError";
  }
}

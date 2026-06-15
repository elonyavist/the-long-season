/**
 * Public entrypoint for persistence boundaries.
 *
 * Storage may depend on domain/shared, but never on engine. Concrete storage
 * exports are introduced in the JSON storage step.
 */
export {};

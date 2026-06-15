/**
 * Dependency Cruiser rules for The Long Season package graph.
 *
 * These rules make the project package boundaries executable. They intentionally
 * target source imports only; package manifests can be tightened later if a
 * documented step needs manifest-level checks.
 */
module.exports = {
  forbidden: [
    {
      name: "domain-must-stay-isolated",
      severity: "error",
      comment: "Domain must not import any package or app code.",
      from: { path: "^packages/domain/src" },
      to: { path: "^(packages/(?!domain)|apps/|@game/(?!domain$))" },
    },
    {
      name: "shared-must-stay-isolated",
      severity: "error",
      comment: "Shared must remain technical and dependency-free.",
      from: { path: "^packages/shared/src" },
      to: { path: "^(packages/(?!shared)|apps/|@game/(?!shared$))" },
    },
    {
      name: "engine-may-only-use-domain-and-shared",
      severity: "error",
      comment: "Engine must not depend on content, storage, UI, apps, or future outer layers.",
      from: { path: "^packages/engine/src" },
      to: { path: "^(packages/(content|storage)|apps/|@game/(content|storage)$)" },
    },
    {
      name: "content-must-not-import-engine-or-storage",
      severity: "error",
      comment: "Content can describe data and generators, but not engine or persistence behavior.",
      from: { path: "^packages/content/src" },
      to: { path: "^(packages/(engine|storage)/|@game/(engine|storage)$)" },
    },
    {
      name: "storage-must-not-import-engine-or-content",
      severity: "error",
      comment: "Storage persists snapshots and must never know engine or content rules.",
      from: { path: "^packages/storage/src" },
      to: { path: "^(packages/(engine|content)/|@game/(engine|content)$)" },
    },
    {
      name: "packages-must-not-import-apps",
      severity: "error",
      comment: "Packages are reusable inner layers and must not depend on app shells.",
      from: { path: "^packages/" },
      to: { path: "^apps/" },
    },
    {
      name: "cli-must-not-import-domain-directly",
      severity: "error",
      comment: "The CLI should go through engine/content/storage/shared boundaries, not domain directly.",
      from: { path: "^apps/cli/src" },
      to: { path: "^(packages/domain/src|@game/domain$)" },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    enhancedResolveOptions: {
      conditionNames: ["import", "node", "default"],
      extensions: [".ts", ".js", ".json"],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.base.json",
    },
  },
};

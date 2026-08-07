import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";

/**
 * Where a CLI command's output artifacts actually land.
 *
 * `pnpm --filter @game/cli` runs with `apps/cli` as the process working
 * directory, so a relative `--report-output=docs/audits/x.md` typed at the
 * repository root writes to `apps/cli/docs/audits/x.md` unless something walks
 * back up. Every reporting command needs the same answer, and two of them had
 * already written it out separately before this became a third - which is
 * exactly the duplication that ends with the copies disagreeing.
 */

/**
 * Resolves a CLI output path against the workspace root.
 *
 * An absolute path is the caller's own decision and is returned untouched.
 *
 * @example
 * const path = await resolveWorkspaceOutputPath("docs/audits/report.md");
 */
export async function resolveWorkspaceOutputPath(path: string): Promise<string> {
  if (isAbsolute(path)) return path;

  return join(await findWorkspaceRoot(), path);
}

/**
 * Writes a UTF-8 text artifact, creating the parent folder when needed.
 *
 * @example
 * await writeWorkspaceTextFile("docs/audits/report.md", rendered);
 */
export async function writeWorkspaceTextFile(path: string, contents: string): Promise<void> {
  const resolvedPath = await resolveWorkspaceOutputPath(path);
  await mkdir(dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, contents, "utf8");
}

/**
 * Walks upward until the monorepo workspace marker is found.
 *
 * Falls back to the working directory rather than throwing: a CLI that cannot
 * find the marker is being run somewhere unusual, and refusing to write at all
 * would be a worse answer than writing where it was started.
 */
async function findWorkspaceRoot(): Promise<string> {
  let current = process.cwd();

  while (true) {
    try {
      await access(join(current, "pnpm-workspace.yaml"));
      return current;
    } catch {
      const parent = dirname(current);
      if (parent === current) return process.cwd();
      current = parent;
    }
  }
}

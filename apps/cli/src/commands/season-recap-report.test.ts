import { describe, expect, it } from "vitest";

import { runSeasonRecapReportCommand } from "./season-recap-report.ts";

function collectingIo() {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return { io: { stdout: (line: string) => stdout.push(line), stderr: (line: string) => stderr.push(line) }, stdout, stderr };
}

describe("runSeasonRecapReportCommand argument handling", () => {
  it("refuses to run without an output path rather than discarding the run", () => {
    const { io, stderr } = collectingIo();

    return runSeasonRecapReportCommand(["--worlds=1"], io).then((exitCode) => {
      expect(exitCode).toBe(1);
      expect(stderr.join("\n")).toContain("--report-output");
    });
  });

  it("refuses an unknown option instead of ignoring it", async () => {
    // A silently ignored `--seasons-count=20` would run the default and report
    // a population nobody asked for.
    const { io, stderr } = collectingIo();

    expect(await runSeasonRecapReportCommand(["--report-output=out.md", "--seasons-count=20"], io))
      .toBe(1);
    expect(stderr.join("\n")).toContain("--seasons-count");
  });

  it("refuses a malformed argument", async () => {
    const { io, stderr } = collectingIo();

    expect(await runSeasonRecapReportCommand(["worlds=2", "--report-output=out.md"], io)).toBe(1);
    expect(stderr.join("\n")).toContain("worlds=2");
  });

  it("refuses a non-positive world count", async () => {
    const { io, stderr } = collectingIo();

    expect(await runSeasonRecapReportCommand(["--report-output=out.md", "--worlds=0"], io)).toBe(1);
    expect(stderr.join("\n")).toContain("--worlds must be a positive integer");
  });

  it("refuses an unsupported language rather than quietly using English", async () => {
    const { io, stderr } = collectingIo();

    expect(await runSeasonRecapReportCommand(["--report-output=out.md", "--language=xx"], io))
      .toBe(1);
    expect(stderr.join("\n")).toContain("--language must be one of");
  });

  it("prints usage beside the error", async () => {
    const { io, stderr } = collectingIo();
    await runSeasonRecapReportCommand([], io);

    expect(stderr.join("\n")).toContain("Usage: season-recap-report");
  });
});

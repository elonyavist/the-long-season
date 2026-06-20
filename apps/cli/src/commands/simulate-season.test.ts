import assert from "node:assert/strict";
import { test } from "vitest";

import {
  DEFAULT_SIMULATE_SEASON_SEED,
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  DEMO_SETUP_PROFILE_PRO01_BALANCED,
  DEMO_SETUP_PROFILE_PRO01_DEFENSIVE,
  runSimulateSeasonCommand,
} from "./simulate-season.ts";

/**
 * CLI simulate-season tests exercise argument parsing and deterministic output
 * through injected IO rather than spawning a child process.
 */

test("simulate-season accepts --seed with equals syntax", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=custom-seed"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes("Seed: custom-seed"), true);
  assert.equal(io.stdoutLines.includes("Final table:"), true);
});

test("simulate-season accepts --seed with separate value", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed", "separate-seed"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stdoutLines.includes("Seed: separate-seed"), true);
});

test("simulate-season uses the fixed default seed", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand([], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stdoutLines.includes(`Seed: ${DEFAULT_SIMULATE_SEASON_SEED}`), true);
});

test("same seed produces same CLI output", async () => {
  const first = captureIo();
  const second = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-cli"], first), 0);
  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-cli"], second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season prints real season player summaries", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=demo-001"], io);
  const topScorerLine = io.stdoutLines.find((line) => line.startsWith("Top scorer: "));
  const topAssistLine = io.stdoutLines.find((line) => line.startsWith("Top assist: "));
  const topGoalkeeperSavesLine = io.stdoutLines.find((line) => line.startsWith("Top goalkeeper saves: "));

  assert.equal(exitCode, 0);
  assert.notEqual(topScorerLine, undefined);
  assert.notEqual(topScorerLine, "Top scorer: unavailable in aggregate engine v1");
  assert.match(topScorerLine ?? "", /^Top scorer: Player[0-9]{2} No[0-9]{2} \(PRO[0-9]{2}\) - [0-9]+ goals$/);
  assert.match(topAssistLine ?? "", /^Top assist: Player[0-9]{2} No[0-9]{2} \(PRO[0-9]{2}\) - [0-9]+ assists?$/);
  assert.match(
    topGoalkeeperSavesLine ?? "",
    /^Top goalkeeper saves: Player[0-9]{2} No[0-9]{2} \(PRO[0-9]{2}\) - [0-9]+ saves?$/,
  );
});

test("simulate-season can print one round's fixture results", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=demo-001", "--round=1"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stdoutLines.includes("Round 1 fixtures:"), true);
  assert.equal(io.stdoutLines.some((line) => /^fixture:[0-9]{6} PRO[0-9]{2} [0-9]+-[0-9]+ PRO[0-9]{2}$/.test(line)), true);
  assert.equal(io.stdoutLines.some((line) => line.startsWith("  Scorers: ")), true);
});

test("same seed and round produce same fixture detail output", async () => {
  const first = captureIo();
  const second = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-round", "--round=2"], first), 0);
  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-round", "--round=2"], second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season can print one fixture's structured match detail", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=demo-001", "--fixture=fixture:000001"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines[0], "The Long Season fixture detail");
  assert.equal(io.stdoutLines.includes("Seed: demo-001"), true);
  assert.equal(io.stdoutLines.includes("Fixture: fixture:000001"), true);
  assert.equal(io.stdoutLines.includes("Competition: Demo Third Division"), true);
  assert.equal(io.stdoutLines.includes("Final table:"), false);
  assert.equal(io.stdoutLines.some((line) => line.startsWith("Top scorer: ")), false);
  assert.equal(io.stdoutLines.some((line) => line.startsWith("Top assist: ")), false);
  assert.equal(io.stdoutLines.some((line) => line.startsWith("Top goalkeeper saves: ")), false);
  assert.equal(io.stdoutLines.includes("fixture:000001 PRO04 5-0 PRO18"), true);
  assert.equal(io.stdoutLines.includes("Events:"), true);
  assert.equal(io.stdoutLines.some((line) => / GOAL PRO[0-9]{2} Player[0-9]{2} No[0-9]{2}.* shot=[a-z_]+ chance=[a-z_]+$/.test(line)), true);
  assert.equal(io.stdoutLines.some((line) => / GOAL .* creator=Player[0-9]{2} No[0-9]{2} /.test(line)), true);
  assert.equal(io.stdoutLines.some((line) => / SAVE PRO[0-9]{2} Player[0-9]{2} No[0-9]{2} vs PRO[0-9]{2} shot=[a-z_]+ chance=[a-z_]+$/.test(line)), true);
  assert.equal(io.stdoutLines.includes("Player stats (all starters):"), true);
  assert.equal(io.stdoutLines.includes("  Player              Club  G A Sh SoT Sv"), true);
  assert.equal(io.stdoutLines.some((line) => /^  Player[0-9]{2} No[0-9]{2}\s+PRO[0-9]{2}\s+/.test(line)), true);
  assert.equal(fixturePlayerStatLines(io.stdoutLines).length, 22);
  assert.equal(io.stdoutLines.includes("  Player04 No10       PRO04 3 0  5   4  0"), true);
  assert.equal(io.stdoutLines.includes("  Player04 No05       PRO04 0 0  1   0  0"), true);
  assert.equal(io.stdoutLines.includes("  Player18 No05       PRO18 0 0  0   0  0"), true);
});

test("simulate-season applies the deterministic tactic and lineup setup demo", async () => {
  const defaultIo = captureIo();
  const demoIo = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--seed=demo-001"], defaultIo), 0);
  assert.equal(
    await runSimulateSeasonCommand(["--seed=demo-001", `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`], demoIo),
    0,
  );

  assert.equal(demoIo.stderrLines.length, 0);
  assert.equal(demoIo.stdoutLines.includes(`Setup demo: ${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`), true);
  assert.equal(demoIo.stdoutLines.includes("Selected club: PRO01"), true);
  assert.equal(
    demoIo.stdoutLines.includes("Tactic: mentality=attacking pressing=0.85 directness=0.75 width=0.80 risk=0.70"),
    true,
  );
  assert.equal(demoIo.stdoutLines.includes("Lineup role changes:"), true);
  assert.equal(demoIo.stdoutLines.includes("  slot:08: Player01 No08 midfielder -> attacker"), true);
  assert.equal(demoIo.stdoutLines.includes("  slot:09: Player01 No09 midfielder -> attacker"), true);
  assert.equal(demoIo.stdoutLines.includes("Final table:"), true);
  assert.notDeepEqual(demoIo.stdoutLines, defaultIo.stdoutLines);
});

test("simulate-season supports balanced and defensive setup demo profiles", async () => {
  const balanced = captureIo();
  const defensive = captureIo();

  assert.equal(
    await runSimulateSeasonCommand(["--seed=demo-001", `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_BALANCED}`], balanced),
    0,
  );
  assert.equal(
    await runSimulateSeasonCommand(["--seed=demo-001", `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_DEFENSIVE}`], defensive),
    0,
  );

  assert.equal(balanced.stderrLines.length, 0);
  assert.equal(balanced.stdoutLines.includes(`Setup demo: ${DEMO_SETUP_PROFILE_PRO01_BALANCED}`), true);
  assert.equal(
    balanced.stdoutLines.includes("Tactic: mentality=balanced pressing=0.50 directness=0.50 width=0.50 risk=0.50"),
    true,
  );
  assert.equal(balanced.stdoutLines.includes("  none"), true);

  assert.equal(defensive.stderrLines.length, 0);
  assert.equal(defensive.stdoutLines.includes(`Setup demo: ${DEMO_SETUP_PROFILE_PRO01_DEFENSIVE}`), true);
  assert.equal(
    defensive.stdoutLines.includes("Tactic: mentality=defensive pressing=0.35 directness=0.30 width=0.40 risk=0.20"),
    true,
  );
  assert.equal(defensive.stdoutLines.includes("  slot:10: Player01 No10 attacker -> midfielder"), true);
  assert.equal(defensive.stdoutLines.includes("  slot:11: Player01 No11 attacker -> midfielder"), true);
});

test("same seed and setup demo produce same tactic inspection output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed=repeatable-setup-demo", "--setup-demo", DEMO_SETUP_PROFILE_PRO01_ATTACKING];

  assert.equal(await runSimulateSeasonCommand(args, first), 0);
  assert.equal(await runSimulateSeasonCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season fixture detail can include setup demo context", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(
    ["--seed=demo-001", "--fixture=fixture:000001", `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines[0], "The Long Season fixture detail");
  assert.equal(io.stdoutLines.includes(`Setup demo: ${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`), true);
  assert.equal(io.stdoutLines.includes("Final table:"), false);
  assert.equal(io.stdoutLines.includes("Events:"), true);
  assert.equal(io.stdoutLines.includes("Player stats (all starters):"), true);
});

test("simulate-season fixture detail can inspect a non-applicable manual tactic switch", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(
    [
      "--seed=demo-001",
      "--fixture=fixture:000001",
      `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_BALANCED}`,
      `--manual-tactic-switch=46:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`,
    ],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines[0], "The Long Season fixture detail");
  assert.equal(io.stdoutLines.includes("Manual tactic switch:"), true);
  assert.equal(io.stdoutLines.includes("  Selected club: PRO01"), true);
  assert.equal(io.stdoutLines.includes(`  Initial profile: ${DEMO_SETUP_PROFILE_PRO01_BALANCED}`), true);
  assert.equal(io.stdoutLines.includes(`  Switch: 46' -> ${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`), true);
  assert.equal(io.stdoutLines.includes("  Applies to fixture: no"), true);
  assert.equal(io.stdoutLines.includes("  Reason: PRO01 is not playing this fixture"), true);
  assert.equal(io.stdoutLines.includes("Profile timeline:"), true);
  assert.equal(io.stdoutLines.includes("  unchanged: fixture:000001 PRO04 5-0 PRO18"), true);
  assert.equal(io.stdoutLines.includes("Events:"), true);
  assert.equal(io.stdoutLines.includes("Player stats (all starters):"), true);
});

test("simulate-season fixture detail applies a manual tactic switch when the selected club plays", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(
    [
      "--seed=demo-001",
      "--fixture=fixture:000006",
      `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_BALANCED}`,
      `--manual-tactic-switch=46:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`,
    ],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes("Manual tactic switch:"), true);
  assert.equal(io.stdoutLines.includes("  Selected club: PRO01"), true);
  assert.equal(io.stdoutLines.includes("  Applies to fixture: yes"), true);
  assert.equal(io.stdoutLines.includes("Profile timeline:"), true);
  assert.equal(io.stdoutLines.includes(`  1'-45': ${DEMO_SETUP_PROFILE_PRO01_BALANCED}`), true);
  assert.equal(io.stdoutLines.includes(`  46'-90': ${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`), true);
  assert.equal(
    io.stdoutLines.some((line) => /^fixture:000006 PRO17 [0-9]+-[0-9]+ PRO01$/.test(line)),
    true,
  );
  assert.equal(io.stdoutLines.includes("Events:"), true);
  assert.equal(io.stdoutLines.includes("Player stats (all starters):"), true);
});

test("same seed and manual tactic switch produce same fixture detail output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = [
    "--seed=repeatable-manual-switch",
    "--fixture=fixture:000006",
    `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_BALANCED}`,
    `--manual-tactic-switch=46:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`,
  ];

  assert.equal(await runSimulateSeasonCommand(args, first), 0);
  assert.equal(await runSimulateSeasonCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season fixture detail prints durable causal defender context for blocks", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=demo-001", "--fixture=fixture:000002"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(
    io.stdoutLines.some((line) =>
      / BLOCK PRO[0-9]{2} defender=Player[0-9]{2} No[0-9]{2} shot=[a-z_]+ chance=[a-z_]+$/.test(line)
    ),
    true,
  );
});

test("simulate-season keeps the round output as the season view", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=demo-001", "--round=1"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stdoutLines.includes("The Long Season simulated season"), true);
  assert.equal(io.stdoutLines.includes("Final table:"), true);
  assert.equal(io.stdoutLines.includes("Round 1 fixtures:"), true);
  assert.equal(io.stdoutLines.includes("The Long Season fixture detail"), false);
});

test("same seed and fixture produce same structured match detail output", async () => {
  const first = captureIo();
  const second = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-fixture", "--fixture=fixture:000001"], first), 0);
  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-fixture", "--fixture=fixture:000001"], second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season rejects invalid round arguments", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--round=abc"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--round requires a positive integer value");
});

test("simulate-season rejects invalid fixture arguments", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--fixture=000001"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--fixture requires a namespaced fixture ID");
});

test("simulate-season rejects invalid setup demo arguments", async () => {
  const missing = captureIo();
  const unsupported = captureIo();
  const supportedValues = "pro01-balanced|pro01-attacking|pro01-defensive";

  assert.equal(await runSimulateSeasonCommand(["--setup-demo="], missing), 1);
  assert.equal(missing.stdoutLines.length, 0);
  assert.equal(missing.stderrLines[0], `--setup-demo requires a supported value: ${supportedValues}`);

  assert.equal(await runSimulateSeasonCommand(["--setup-demo=balanced-pro02"], unsupported), 1);
  assert.equal(unsupported.stdoutLines.length, 0);
  assert.equal(
    unsupported.stderrLines[0],
    `Unsupported --setup-demo value: balanced-pro02. Supported values: ${supportedValues}`,
  );
});

test("simulate-season rejects invalid manual tactic switch arguments", async () => {
  const withoutFixture = captureIo();
  const withoutSetupDemo = captureIo();
  const malformed = captureIo();
  const invalidProfile = captureIo();
  const invalidMinute = captureIo();
  const supportedValues = "pro01-balanced|pro01-attacking|pro01-defensive";

  assert.equal(
    await runSimulateSeasonCommand([`--manual-tactic-switch=46:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`], withoutFixture),
    1,
  );
  assert.equal(withoutFixture.stdoutLines.length, 0);
  assert.equal(withoutFixture.stderrLines[0], "--manual-tactic-switch requires --fixture=<fixtureId>");

  assert.equal(
    await runSimulateSeasonCommand(
      ["--fixture=fixture:000001", `--manual-tactic-switch=46:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`],
      withoutSetupDemo,
    ),
    1,
  );
  assert.equal(withoutSetupDemo.stdoutLines.length, 0);
  assert.equal(withoutSetupDemo.stderrLines[0], "--manual-tactic-switch requires --setup-demo=<initialProfile>");

  assert.equal(await runSimulateSeasonCommand(["--manual-tactic-switch=abc"], malformed), 1);
  assert.equal(malformed.stdoutLines.length, 0);
  assert.equal(
    malformed.stderrLines[0],
    "--manual-tactic-switch requires <minute>:<profile>, for example 46:pro01-attacking",
  );

  assert.equal(await runSimulateSeasonCommand(["--manual-tactic-switch=46:bad-profile"], invalidProfile), 1);
  assert.equal(invalidProfile.stdoutLines.length, 0);
  assert.equal(
    invalidProfile.stderrLines[0],
    `Unsupported --manual-tactic-switch profile: bad-profile. Supported values: ${supportedValues}`,
  );

  assert.equal(
    await runSimulateSeasonCommand(
      [
        "--fixture=fixture:000001",
        `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_BALANCED}`,
        `--manual-tactic-switch=91:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`,
      ],
      invalidMinute,
    ),
    1,
  );
  assert.equal(invalidMinute.stdoutLines.length, 0);
  assert.equal(invalidMinute.stderrLines[0], "--manual-tactic-switch minute must be between 1 and 90: 91");
});

test("simulate-season exits nonzero for a missing fixture", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--fixture=fixture:999999"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "Fixture not found: fixture:999999");
});

test("simulate-season exits nonzero for a missing round", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--round=999"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "Round not found: 999");
});

test("simulate-season exits nonzero on invalid args", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--unknown"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "Unknown argument: --unknown");
});

/**
 * Creates an IO adapter that records written lines for assertions.
 */
function captureIo() {
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];

  return {
    stdoutLines,
    stderrLines,
    stdout: (line: string) => {
      stdoutLines.push(line);
    },
    stderr: (line: string) => {
      stderrLines.push(line);
    },
  };
}

/**
 * Extracts rendered player-stat rows from fixture detail command output.
 */
function fixturePlayerStatLines(lines: readonly string[]): readonly string[] {
  return lines.filter((line) => /^  Player[0-9]{2} No[0-9]{2}\s+PRO[0-9]{2}\s+[0-9]/.test(line));
}

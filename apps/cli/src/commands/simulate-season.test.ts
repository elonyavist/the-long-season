import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CONDITION_DEMO_PROFILE_PRO01_SEASON,
  DEFAULT_SIMULATE_SEASON_SEED,
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  DEMO_SETUP_PROFILE_PRO01_BALANCED,
  DEMO_SETUP_PROFILE_PRO01_DEFENSIVE,
  LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM,
  LINEUP_DEMO_PROFILE_PRO01_ROTATED,
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

test("simulate-season can inspect formation fit without printing the season table", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=demo-001", "--formation-fit=4-2-3-1"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines[0], "The Long Season formation fit");
  assert.equal(io.stdoutLines.includes("Seed: demo-001"), true);
  assert.equal(io.stdoutLines.includes("Selected club: PRO01"), true);
  assert.equal(io.stdoutLines.includes("Squad size: 22"), true);
  assert.equal(io.stdoutLines.includes("Selected formation: 4-2-3-1"), true);
  assert.equal(io.stdoutLines.includes("Inspection only: no lineup is auto-selected and no transfer action is created."), true);
  assert.equal(io.stdoutLines.includes("Formation slots:"), true);
  assert.equal(io.stdoutLines.includes("Covered slots:"), true);
  assert.equal(io.stdoutLines.includes("Adapted/weak slots:"), true);
  assert.equal(io.stdoutLines.includes("Missing slots:"), true);
  assert.equal(io.stdoutLines.includes("Surplus groups:"), true);
  assert.equal(io.stdoutLines.includes("Fit warnings:"), true);
  assert.equal(io.stdoutLines.includes("Market-need hints:"), true);
  assert.equal(io.stdoutLines.includes("Final table:"), false);
  assert.equal(io.stdoutLines.includes("  rb right_full_back best=natural natural=1 adapted=1 weak=8"), true);
  assert.equal(io.stdoutLines.includes("  am attacking_midfielder best=adapted natural=0 adapted=3 weak=7"), true);
  assert.equal(io.stdoutLines.includes("  weak_depth:defensive_midfielder"), true);
  assert.equal(io.stdoutLines.includes("  weak_depth:attacking_midfielder"), true);
  assert.equal(
    io.stdoutLines.includes(
      "  consider:defensive_midfielder, consider:attacking_midfielder, surplus:wide_players, surplus:center_backs",
    ),
    true,
  );
});

test("same seed and formation fit produce same inspection output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed=repeatable-formation-fit", "--formation-fit=4-4-2"];

  assert.equal(await runSimulateSeasonCommand(args, first), 0);
  assert.equal(await runSimulateSeasonCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season rejects unsupported formation fit keys", async () => {
  const io = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--formation-fit=2-3-5"], io), 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0]?.startsWith("Unsupported --formation-fit value: 2-3-5."), true);
});

test("simulate-season can print a deterministic condition demo", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(
    ["--seed=demo-001", `--condition-demo=${CONDITION_DEMO_PROFILE_PRO01_SEASON}`],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes(`Condition demo: ${CONDITION_DEMO_PROFILE_PRO01_SEASON}`), true);
  assert.equal(io.stdoutLines.includes("  Selected club: PRO01"), true);
  assert.equal(io.stdoutLines.includes("  Season fitness lifecycle: enabled"), true);
  assert.equal(io.stdoutLines.includes("  Rules: match cost=8 daily recovery=5 clamp=0..100"), true);
  assert.equal(io.stdoutLines.includes("  First selected club fixture: fixture:000006 PRO17 0-2 PRO01"), true);
  assert.equal(io.stdoutLines.includes("  After first match selected starters fitness: 92"), true);
  assert.equal(io.stdoutLines.includes("  Before next selected fixture fitness after 7 days recovery: 100"), true);
  assert.equal(io.stdoutLines.includes("  Selected club final table: PRO01 position 1, 65 pts, GD +31"), true);
  assert.equal(io.stdoutLines.includes("  Final selected club condition:"), true);
  assert.equal(io.stdoutLines.includes("  Player              Start Final Delta"), true);
  assert.equal(conditionPlayerRows(io.stdoutLines).length, 11);
  assert.equal(io.stdoutLines.includes("  Player01 No01         100    92    -8"), true);
});

test("simulate-season can inspect the deterministic first-team lineup demo", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(
    ["--seed=demo-001", `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM}`],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes(`Lineup demo: ${LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM}`), true);
  assert.equal(io.stdoutLines.includes("  Selected club: PRO01"), true);
  assert.equal(io.stdoutLines.includes("  Applied to fixtures: no (profile inspection only)"), true);
  assert.equal(io.stdoutLines.includes("  Changes from first team:"), true);
  assert.equal(io.stdoutLines.includes("  none"), true);
  assert.equal(io.stdoutLines.includes("  slot:01 Player01 No01 gk"), true);
  assert.equal(io.stdoutLines.includes("  slot:11 Player01 No11 attacker"), true);
  assert.equal(lineupStarterRows(io.stdoutLines).length, 11);
});

test("simulate-season can inspect the deterministic rotated lineup demo", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(
    ["--seed=demo-001", `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes(`Lineup demo: ${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`), true);
  assert.equal(io.stdoutLines.includes("  Selected club: PRO01"), true);
  assert.equal(io.stdoutLines.includes("  slot:01: Player01 No01 -> Player01 No12 (gk)"), true);
  assert.equal(io.stdoutLines.includes("  slot:05: Player01 No05 -> Player01 No13 (defender)"), true);
  assert.equal(io.stdoutLines.includes("  slot:08: Player01 No08 -> Player01 No15 (midfielder)"), true);
  assert.equal(io.stdoutLines.includes("  slot:11: Player01 No11 -> Player01 No16 (attacker)"), true);
  assert.equal(io.stdoutLines.includes("  slot:01 Player01 No12 gk"), true);
  assert.equal(io.stdoutLines.includes("  slot:05 Player01 No13 defender"), true);
  assert.equal(io.stdoutLines.includes("  slot:08 Player01 No15 midfielder"), true);
  assert.equal(io.stdoutLines.includes("  slot:11 Player01 No16 attacker"), true);
  assert.equal(lineupStarterRows(io.stdoutLines).length, 11);
});

test("simulate-season fixture detail can apply a selected lineup demo", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(
    ["--seed=demo-001", "--fixture=fixture:000006", `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines[0], "The Long Season fixture detail");
  assert.equal(io.stdoutLines.includes(`Lineup override: ${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`), true);
  assert.equal(io.stdoutLines.includes("  Selected club: PRO01"), true);
  assert.equal(io.stdoutLines.some((line) => /^  Fixture: fixture:000006 PRO17 [0-9]+-[0-9]+ PRO01$/.test(line)), true);
  assert.equal(io.stdoutLines.includes("  Applies to fixture: yes"), true);
  assert.equal(io.stdoutLines.includes("  slot:01 Player01 No12 gk"), true);
  assert.equal(io.stdoutLines.includes("  slot:05 Player01 No13 defender"), true);
  assert.equal(io.stdoutLines.includes("  Player01 No01 replaced by Player01 No12"), true);
  assert.equal(io.stdoutLines.includes("  Player01 No11 replaced by Player01 No16"), true);
  assert.equal(io.stdoutLines.includes("  Selected starters spend 8 fitness"), true);
  assert.equal(io.stdoutLines.includes("  Player01 No12 expected fitness 92"), true);
  assert.equal(io.stdoutLines.includes("  Player01 No01 expected fitness 100"), true);
  assert.equal(io.stdoutLines.includes("Events:"), true);
  assert.equal(io.stdoutLines.includes("Player stats (all starters):"), true);
  assert.equal(fixturePlayerStatLines(io.stdoutLines).length, 22);
  assert.equal(io.stdoutLines.some((line) => /^  Player01 No12\s+PRO01\s+/.test(line)), true);
});

test("simulate-season fixture lineup demo reports non-applicable fixtures", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(
    ["--seed=demo-001", "--fixture=fixture:000001", `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes(`Lineup override: ${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`), true);
  assert.equal(io.stdoutLines.includes("  Applies to fixture: no"), true);
  assert.equal(io.stdoutLines.includes("  Reason: PRO01 is not playing this fixture"), true);
  assert.equal(
    io.stdoutLines.includes("  Selected starters spend 0 fitness because the selected club is not playing"),
    true,
  );
  assert.equal(io.stdoutLines.includes("fixture:000001 PRO04 5-0 PRO18"), true);
});

test("same seed and lineup demo produce same inspection output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed=repeatable-lineup-demo", `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`];

  assert.equal(await runSimulateSeasonCommand(args, first), 0);
  assert.equal(await runSimulateSeasonCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("same seed and fixture lineup demo produce same fixture detail output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed=repeatable-fixture-lineup", "--fixture=fixture:000006", `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`];

  assert.equal(await runSimulateSeasonCommand(args, first), 0);
  assert.equal(await runSimulateSeasonCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season default output does not include lineup demo inspection", async () => {
  const io = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--seed=demo-001"], io), 0);
  assert.equal(io.stdoutLines.some((line) => line.startsWith("Lineup demo: ")), false);
  assert.equal(io.stdoutLines.includes("The Long Season formation fit"), false);
});

test("same seed and condition demo produce same output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed=repeatable-condition", `--condition-demo=${CONDITION_DEMO_PROFILE_PRO01_SEASON}`];

  assert.equal(await runSimulateSeasonCommand(args, first), 0);
  assert.equal(await runSimulateSeasonCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
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

test("simulate-season rejects invalid condition demo arguments", async () => {
  const missing = captureIo();
  const unsupported = captureIo();
  const withRound = captureIo();
  const withFixture = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--condition-demo="], missing), 1);
  assert.equal(missing.stdoutLines.length, 0);
  assert.equal(missing.stderrLines[0], "--condition-demo requires a supported value: pro01-season");

  assert.equal(await runSimulateSeasonCommand(["--condition-demo=pro02-season"], unsupported), 1);
  assert.equal(unsupported.stdoutLines.length, 0);
  assert.equal(
    unsupported.stderrLines[0],
    "Unsupported --condition-demo value: pro02-season. Supported values: pro01-season",
  );

  assert.equal(
    await runSimulateSeasonCommand(["--round=1", `--condition-demo=${CONDITION_DEMO_PROFILE_PRO01_SEASON}`], withRound),
    1,
  );
  assert.equal(withRound.stdoutLines.length, 0);
  assert.equal(withRound.stderrLines[0], "--condition-demo cannot be combined with --round or --fixture");

  assert.equal(
    await runSimulateSeasonCommand(
      ["--fixture=fixture:000001", `--condition-demo=${CONDITION_DEMO_PROFILE_PRO01_SEASON}`],
      withFixture,
    ),
    1,
  );
  assert.equal(withFixture.stdoutLines.length, 0);
  assert.equal(withFixture.stderrLines[0], "--condition-demo cannot be combined with --round or --fixture");
});

test("simulate-season rejects invalid lineup demo arguments", async () => {
  const missing = captureIo();
  const unsupported = captureIo();
  const withRound = captureIo();
  const withConditionDemo = captureIo();
  const withManualSwitch = captureIo();
  const supportedValues = "pro01-first-team|pro01-rotated";

  assert.equal(await runSimulateSeasonCommand(["--lineup-demo="], missing), 1);
  assert.equal(missing.stdoutLines.length, 0);
  assert.equal(missing.stderrLines[0], `--lineup-demo requires a supported value: ${supportedValues}`);

  assert.equal(await runSimulateSeasonCommand(["--lineup-demo=pro01-random"], unsupported), 1);
  assert.equal(unsupported.stdoutLines.length, 0);
  assert.equal(
    unsupported.stderrLines[0],
    `Unsupported --lineup-demo value: pro01-random. Supported values: ${supportedValues}`,
  );

  assert.equal(await runSimulateSeasonCommand(["--round=1", `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`], withRound), 1);
  assert.equal(withRound.stdoutLines.length, 0);
  assert.equal(
    withRound.stderrLines[0],
    "--lineup-demo cannot be combined with --round, --condition-demo, or --manual-tactic-switch",
  );

  assert.equal(
    await runSimulateSeasonCommand(
      [
        `--condition-demo=${CONDITION_DEMO_PROFILE_PRO01_SEASON}`,
        `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`,
      ],
      withConditionDemo,
    ),
    1,
  );
  assert.equal(withConditionDemo.stdoutLines.length, 0);
  assert.equal(
    withConditionDemo.stderrLines[0],
    "--lineup-demo cannot be combined with --round, --condition-demo, or --manual-tactic-switch",
  );

  assert.equal(
    await runSimulateSeasonCommand(
      [
        "--fixture=fixture:000006",
        `--setup-demo=${DEMO_SETUP_PROFILE_PRO01_BALANCED}`,
        `--manual-tactic-switch=46:${DEMO_SETUP_PROFILE_PRO01_ATTACKING}`,
        `--lineup-demo=${LINEUP_DEMO_PROFILE_PRO01_ROTATED}`,
      ],
      withManualSwitch,
    ),
    1,
  );
  assert.equal(withManualSwitch.stdoutLines.length, 0);
  assert.equal(
    withManualSwitch.stderrLines[0],
    "--lineup-demo cannot be combined with --round, --condition-demo, or --manual-tactic-switch",
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

/**
 * Extracts rendered condition rows from condition-demo command output.
 */
function conditionPlayerRows(lines: readonly string[]): readonly string[] {
  return lines.filter((line) => /^  Player01 No[0-9]{2}\s+100\s+92\s+-8$/.test(line));
}

/**
 * Extracts rendered starter rows from lineup-demo command output.
 */
function lineupStarterRows(lines: readonly string[]): readonly string[] {
  return lines.filter((line) => /^  slot:[0-9]{2} Player01 No[0-9]{2} (gk|defender|midfielder|attacker)$/.test(line));
}

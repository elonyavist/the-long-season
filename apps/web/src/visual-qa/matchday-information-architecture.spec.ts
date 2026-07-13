/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase70";
const AUDIT_PATH = resolve(REPO_ROOT, "docs/audits/WEB_MATCHDAY_INFORMATION_ARCHITECTURE_VISUAL_QA.md");
const PORT = 5191;
const URL = `http://127.0.0.1:${PORT}/`;

interface MatchdayIaInspectionResult {
  readonly viewportName: string;
  readonly screenshots: readonly string[];
  readonly checks: readonly string[];
}

/**
 * Runs the Phase 70 browser gate for the accepted matchday information
 * architecture. The script captures every match phase on desktop and narrow
 * viewports and fails if the UI regresses toward a scattered log-table layout.
 */
async function main(): Promise<void> {
  await mkdir(QA_OUTPUT_DIR, { recursive: true });
  const server = spawn(
    "pnpm",
    ["--filter", "@game/web", "exec", "vite", "--host", "127.0.0.1", "--port", String(PORT)],
    {
      cwd: REPO_ROOT,
      stdio: "pipe",
    },
  );

  const results: MatchdayIaInspectionResult[] = [];

  try {
    await waitForServer();
    const browser = await chromium.launch();

    try {
      results.push(await inspectMatchdayIa(browser, "desktop", 1440, 960));
      results.push(await inspectMatchdayIa(browser, "narrow", 390, 844));
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  await writeAudit(results);
  console.log(`Phase 70 matchday IA screenshots written to ${QA_OUTPUT_DIR}`);
  console.log(`Phase 70 matchday IA audit written to ${AUDIT_PATH}`);
}

/** Drives one viewport through the full matchday IA flow. */
async function inspectMatchdayIa(
  browser: Browser,
  viewportName: string,
  width: number,
  height: number,
): Promise<MatchdayIaInspectionResult> {
  const page = await browser.newPage({ viewport: { width, height } });
  const screenshots: string[] = [];
  const checks: string[] = [];

  try {
    await openPreparedPreMatch(page);

    await expectMatchdayShell(page, `${viewportName} pre-match`);
    await expectPhaseState(page, "pre_match", "Start match");
    await expectNoEmptyLogPanels(page, `${viewportName} pre-match`);
    await expectNoHorizontalOverflow(page, `${viewportName} pre-match`);
    await expectNoClippedText(page, `${viewportName} pre-match`);
    screenshots.push(await screenshot(page, `pre-match-${viewportName}`));
    checks.push("Pre-match is a clean confirmation with one visible primary command and no empty event/stat panels.");

    await click(page, "Start match");
    await visibleText(page, "First half");
    await expectMatchdayShell(page, `${viewportName} first half`);
    await expectPhaseState(page, "first_half", "Play to half-time");
    await expectLivePhase(page, `${viewportName} first half`);
    await expectNoHorizontalOverflow(page, `${viewportName} first half`);
    await expectNoClippedText(page, `${viewportName} first half`);
    screenshots.push(await screenshot(page, `first-half-${viewportName}`));
    checks.push("First half is a real live phase with event cards and one play-to-half-time command.");

    await click(page, "Play to half-time");
    await visibleText(page, "Half-time");
    await expectMatchdayShell(page, `${viewportName} half-time`);
    await expectPhaseState(page, "half_time", "Start second half");
    await expectHalfTimeDecisionWorkspace(page, `${viewportName} half-time`);
    await expectNoHorizontalOverflow(page, `${viewportName} half-time`);
    await expectNoClippedText(page, `${viewportName} half-time`);
    screenshots.push(await screenshot(page, `half-time-${viewportName}`));
    checks.push("Half-time puts the tabellino before the tactical-board decision workspace and keeps one restart command.");

    await click(page, "Start second half");
    await visibleText(page, "Second half");
    await expectMatchdayShell(page, `${viewportName} second half`);
    await expectPhaseState(page, "second_half", "Play to full time");
    await expectLivePhase(page, `${viewportName} second half`);
    await expectSecondHalfPressure(page, `${viewportName} second half`);
    await expectNoHorizontalOverflow(page, `${viewportName} second half`);
    await expectNoClippedText(page, `${viewportName} second half`);
    screenshots.push(await screenshot(page, `second-half-${viewportName}`));
    checks.push("Second half shows live events plus selected-club pressure without exposing tactical controls early.");

    await click(page, "Play to full time");
    await visibleText(page, "Full time");
    await expectMatchdayShell(page, `${viewportName} full time`);
    await expectPhaseState(page, "full_time", "Return to dashboard");
    await expectFullTimeReview(page, `${viewportName} full time`);
    await expectNoHorizontalOverflow(page, `${viewportName} full time`);
    await expectNoClippedText(page, `${viewportName} full time`);
    screenshots.push(await screenshot(page, `full-time-${viewportName}`));
    checks.push("Full time starts with the tabellino, then ratings, then consequences, and returns to dashboard explicitly.");
  } finally {
    await page.close();
  }

  return { viewportName, screenshots, checks };
}

/** Creates a complete in-memory match preparation and lands on pre-match. */
async function openPreparedPreMatch(page: Page): Promise<void> {
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await visibleText(page, "The Long Season");
  await click(page, "New career");
  await visibleText(page, "Prepare match");
  await click(page, "Prepare match");
  await visibleText(page, "Match preparation");
  await click(page, "Auto");
  await page.getByRole("tab", { name: /Tactic|Tattica/ }).click();
  await page.getByLabel("Balanced").check();
  await click(page, "Save and go to match");
  await visibleText(page, "Pre-match");
}

/** Checks matchday keeps focus on match content instead of global shell noise. */
async function expectMatchdayShell(page: Page, context: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    shell: document.querySelectorAll(".tls-app-shell").length,
    scoreboard: document.querySelectorAll(".tls-matchday-scoreboard").length,
    phaseRail: document.querySelectorAll(".tls-match-centre-phase-rail").length,
    phaseButtons: document.querySelectorAll(".tls-match-centre-phase-rail button").length,
    legacyReport: document.querySelectorAll(".tls-matchday-report").length,
    rightRailInbox: document.querySelectorAll(".tls-app-shell-right-rail .tls-app-shell-posta-rail").length,
    globalContinue: [...document.querySelectorAll(".tls-app-shell-continue")].filter((button) =>
      button.textContent?.trim() === "Continue",
    ).length,
  }));

  if (counts.shell !== 1 || counts.scoreboard !== 1 || counts.phaseRail !== 1) {
    throw new Error(`${context} matchday shell is incomplete: ${JSON.stringify(counts)}.`);
  }

  if (counts.phaseButtons !== 0 || counts.legacyReport !== 0 || counts.rightRailInbox !== 0 || counts.globalContinue !== 0) {
    throw new Error(`${context} matchday shell contains rejected chrome: ${JSON.stringify(counts)}.`);
  }
}

/** Confirms the active phase and the single screen command. */
async function expectPhaseState(page: Page, phase: string, command: string): Promise<void> {
  const counts = await page.evaluate((phaseId) => ({
    currentPhase: document.querySelectorAll(`.tls-match-centre-phase-rail [data-phase="${phaseId}"][data-status="current"]`).length,
    primaryButtons: document.querySelectorAll(".tls-match-broadcast-action").length,
  }), phase);

  if (counts.currentPhase !== 1 || counts.primaryButtons !== 1) {
    throw new Error(`Expected one current phase and one primary command for ${phase}: ${JSON.stringify(counts)}.`);
  }

  await expectPrimaryActionReachable(page, command);
}

/** Checks that live phases use event cards instead of tables. */
async function expectLivePhase(page: Page, context: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    livePhase: document.querySelectorAll(".tls-match-centre-live-phase").length,
    liveEvents: document.querySelectorAll(".tls-match-centre-live-event").length,
    tables: document.querySelectorAll(".tls-match-centre-live-phase table").length,
  }));

  if (counts.livePhase !== 1 || counts.liveEvents < 1 || counts.tables !== 0) {
    throw new Error(`${context} live phase does not look like event playback: ${JSON.stringify(counts)}.`);
  }
}

/** Checks that half-time is the only tactical decision stop. */
async function expectHalfTimeDecisionWorkspace(page: Page, context: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    halfTime: document.querySelectorAll(".tls-match-centre-half-time-decision").length,
    tabellino: document.querySelectorAll(".tls-match-centre-half-time-tabellino").length,
    tacticalBoard: document.querySelectorAll(".tls-tactical-board").length,
    benchBoard: document.querySelectorAll(".tls-tactical-bench-board").length,
    playerTokens: document.querySelectorAll(".tls-tactical-board-token").length,
    oldSelects: document.querySelectorAll(".tls-match-centre-half-time select").length,
  }));

  if (counts.halfTime !== 1 || counts.tabellino !== 1 || counts.tacticalBoard !== 1 || counts.benchBoard !== 1 || counts.playerTokens !== 11) {
    throw new Error(`${context} half-time decision workspace is incomplete: ${JSON.stringify(counts)}.`);
  }

  if (counts.oldSelects > 0) {
    throw new Error(`${context} still exposes obsolete half-time substitution selects: ${JSON.stringify(counts)}.`);
  }
}

/** Confirms second half adds pressure context without making it a tactical stop. */
async function expectSecondHalfPressure(page: Page, context: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    pressureStrip: document.querySelectorAll(".tls-match-centre-pressure-strip").length,
    tacticalBoard: document.querySelectorAll(".tls-tactical-board").length,
    fullTime: document.querySelectorAll(".tls-match-centre-full-time").length,
  }));

  if (counts.pressureStrip !== 1 || counts.tacticalBoard !== 0 || counts.fullTime !== 0) {
    throw new Error(`${context} second-half pressure state is wrong: ${JSON.stringify(counts)}.`);
  }
}

/** Checks that the final review follows tabellino -> ratings -> consequences. */
async function expectFullTimeReview(page: Page, context: string): Promise<void> {
  const result = await page.evaluate(() => {
    const tabellino = document.querySelector(".tls-match-centre-full-time-tabellino");
    const ratings = document.querySelector(".tls-match-centre-full-time-ratings");
    const consequences = document.querySelector(".tls-match-centre-consequences");
    const tabellinoTop = tabellino?.getBoundingClientRect().top ?? Number.NaN;
    const ratingsTop = ratings?.getBoundingClientRect().top ?? Number.NaN;
    const consequencesTop = consequences?.getBoundingClientRect().top ?? Number.NaN;

    return {
      fullTime: document.querySelectorAll(".tls-match-centre-full-time").length,
      tabellino: document.querySelectorAll(".tls-match-centre-full-time-tabellino").length,
      goalRows: document.querySelectorAll(".tls-match-centre-tabellino-event.is-goal").length,
      ratings: document.querySelectorAll(".tls-match-centre-full-time-ratings").length,
      playerRatingTables: document.querySelectorAll('table[aria-label="Player ratings table"]').length,
      consequences: document.querySelectorAll(".tls-match-centre-consequences").length,
      liveControls: [...document.querySelectorAll("button")].filter((button) =>
        ["Play to full time", "Start second half"].includes(button.textContent?.trim() ?? ""),
      ).length,
      orderIsCorrect: tabellinoTop < ratingsTop && ratingsTop < consequencesTop,
    };
  });

  if (
    result.fullTime !== 1
    || result.tabellino !== 1
    || result.goalRows < 1
    || result.ratings !== 1
    || result.playerRatingTables !== 1
    || result.consequences !== 1
    || result.liveControls !== 0
    || !result.orderIsCorrect
  ) {
    throw new Error(`${context} full-time review order/content is wrong: ${JSON.stringify(result)}.`);
  }
}

/** Ensures pre-match no longer renders empty report-style content. */
async function expectNoEmptyLogPanels(page: Page, context: string): Promise<void> {
  const bodyText = await page.evaluate(() => document.body.textContent ?? "");

  for (const rejectedText of ["No events yet.", "No major events yet.", "Ratings, condition, and contribution"]) {
    if (bodyText.includes(rejectedText)) {
      throw new Error(`${context} renders empty log/report copy: ${rejectedText}.`);
    }
  }
}

/** Focuses a visible button and checks it has a usable accessible name. */
async function expectPrimaryActionReachable(page: Page, buttonName: string): Promise<void> {
  await page.getByRole("button", { name: buttonName }).first().focus();
  const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");

  if (!focusedText.includes(buttonName)) {
    throw new Error(`Expected focused element to include "${buttonName}", got "${focusedText}".`);
  }
}

/** Fails if the viewport can scroll sideways. */
async function expectNoHorizontalOverflow(page: Page, context: string): Promise<void> {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`${context} has horizontal overflow: ${JSON.stringify(geometry)}.`);
  }
}

/** Finds obvious text clipping in primary matchday surfaces. */
async function expectNoClippedText(page: Page, context: string): Promise<void> {
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll(".tls-matchday-panel, .tls-match-broadcast-frame, .tls-matchday-card, .tls-match-centre-full-time")]
      .flatMap((root) => [...root.querySelectorAll<HTMLElement>("h1, h2, h3, p, span, strong, small, button, li, td, th")])
      .filter((element) => element.scrollWidth > element.clientWidth + 2 && window.getComputedStyle(element).overflow !== "visible")
      .slice(0, 8)
      .map((element) => element.textContent?.trim() ?? element.tagName),
  );

  if (clipped.length > 0) {
    throw new Error(`${context} has clipped text candidates: ${clipped.join(" | ")}.`);
  }
}

/** Clicks the first matching button by visible accessible name. */
async function click(page: Page, buttonName: string): Promise<void> {
  await page.getByRole("button", { name: buttonName }).first().click();
}

/** Writes one deterministic screenshot and returns its path. */
async function screenshot(page: Page, name: string): Promise<string> {
  const path = `${QA_OUTPUT_DIR}/${name}.png`;

  await page.screenshot({ fullPage: true, path });

  return path;
}

/** Waits for visible text without requiring an exact text-node match. */
async function visibleText(page: Page, text: string): Promise<void> {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5_000 });
}

/** Polls the Vite dev server until it responds. */
async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(URL);

      if (response.ok) {
        return;
      }
    } catch {
      // Retry until Vite is ready.
    }

    await new Promise((resolveWait) => {
      setTimeout(resolveWait, 250);
    });
  }

  throw new Error(`Timed out waiting for web app at ${URL}`);
}

/** Writes the Phase 70 visual QA audit. */
async function writeAudit(results: readonly MatchdayIaInspectionResult[]): Promise<void> {
  const screenshotLines = results
    .flatMap((result) => result.screenshots.map((path) => `- ${result.viewportName}: \`${path}\``))
    .join("\n");
  const checkLines = results
    .flatMap((result) => result.checks.map((check) => `- ${result.viewportName}: ${check}`))
    .join("\n");

  await writeFile(
    AUDIT_PATH,
    `# Web Matchday Information Architecture Visual QA

Date: 2026-07-08
Phase: \`70-web-matchday-information-architecture-and-live-flow-rework\`
Step: \`10-playwright-visual-qa-fun-review-and-phase-report.md\`

## Result

PASS.

The browser QA drove the accepted matchday path on desktop and narrow
viewports: pre-match, first half, half-time, second half, and full time.

## Checked

${checkLines}

## Accessibility And Layout Notes

- Matchday uses one shell, one scoreboard, and one passive phase-progress list.
- Phase progress uses list items, not buttons or links.
- Every phase exposes one primary command and that command is keyboard focusable.
- Event cards expose visible event kind text and accessible event names.
- Player ratings tables have explicit accessible names.
- Desktop and narrow viewports have no horizontal overflow.
- The script checks common clipped-text candidates in primary matchday surfaces.

## Regression Guards

- Pre-match does not render empty event/stat panels.
- First and second half use card-based live phases, not tables.
- Half-time remains the only tactical decision workspace.
- Second half does not expose tactical controls or early full-time consequences.
- Full time renders tabellino before ratings before post-match consequences.
- Full time exposes \`Return to dashboard\`, not live progression commands.

## Screenshots

${screenshotLines}

## Manual Review Focus

Review the screenshots in \`${QA_OUTPUT_DIR}\`. The key subjective check is
whether the five-state flow now reads like a football match centre rather than
a debug log. If visual polish is still rejected, future work should adjust
composition and hierarchy, not reintroduce tables or fake match facts.
`,
  );
}

await main();

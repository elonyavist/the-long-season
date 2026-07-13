/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase69";
const AUDIT_PATH = resolve(REPO_ROOT, "docs/audits/WEB_UI_FULL_REBUILD_VISUAL_QA.md");
const PORT = 5190;
const URL = `http://127.0.0.1:${PORT}/`;

interface UiRebuildInspectionResult {
  readonly viewportName: string;
  readonly screenshots: readonly string[];
  readonly checks: readonly string[];
}

/**
 * Runs the final Phase 69 browser QA gate.
 *
 * The script starts the web app, drives the accepted first-MVP path through the
 * rebuilt UI, captures desktop/narrow screenshots, and writes a Markdown audit
 * that can be reviewed without opening the browser console.
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

  const results: UiRebuildInspectionResult[] = [];

  try {
    await waitForServer();
    const browser = await chromium.launch();

    try {
      results.push(await inspectRebuiltUi(browser, "desktop", 1440, 960));
      results.push(await inspectRebuiltUi(browser, "narrow", 390, 844));
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  await writeAudit(results);
  console.log(`Phase 69 full rebuild screenshots written to ${QA_OUTPUT_DIR}`);
  console.log(`Phase 69 full rebuild audit written to ${AUDIT_PATH}`);
}

/** Drives the current browser-visible MVP flow for one viewport. */
async function inspectRebuiltUi(
  browser: Browser,
  viewportName: string,
  width: number,
  height: number,
): Promise<UiRebuildInspectionResult> {
  const page = await browser.newPage({ viewport: { width, height } });
  const screenshots: string[] = [];
  const checks: string[] = [];

  try {
    await page.goto(URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await visibleText(page, "The Long Season");
    await expectAppEntry(page, viewportName);
    await expectNoHorizontalOverflow(page, `${viewportName} app entry`);
    screenshots.push(await screenshot(page, `app-entry-${viewportName}`));
    checks.push("App entry has a main landmark, action navigation, no theme picker, and no horizontal overflow.");

    await page.getByRole("button", { name: "New career" }).click();
    await visibleText(page, "Dashboard");
    await expectCareerShellLandmarks(page, viewportName);
    await expectNoLegacyUi(page, `${viewportName} dashboard`);
    await expectPrimaryActionReachable(page, "Prepare match");
    await expectNoHorizontalOverflow(page, `${viewportName} dashboard`);
    screenshots.push(await screenshot(page, `dashboard-${viewportName}`));
    checks.push("Dashboard uses the rebuilt app shell, current navigation, one primary action, and no legacy dashboard action list.");

    await page.getByRole("button", { name: "Prepare match" }).first().click();
    await visibleText(page, "Match preparation");
    await expectCareerShellLandmarks(page, viewportName);
    await expectMatchPreparationWorkspace(page, viewportName);
    await expectPrimaryActionReachable(page, "Auto");
    await expectNoHorizontalOverflow(page, `${viewportName} match preparation`);
    screenshots.push(await screenshot(page, `match-preparation-${viewportName}`));
    checks.push("Match preparation keeps the tactical board as the approved anchor and exposes the bench board.");

    await page.getByRole("button", { name: "Auto" }).click();
    await page.getByRole("tab", { name: /Tactic|Tattica/ }).click();
    await page.getByLabel("Balanced").check();
    await page.getByRole("button", { name: "Save and go to match" }).click();
    await visibleText(page, "Pre-match");
    await expectMatchdayFrame(page, viewportName, "pre-match");
    await expectPrimaryActionReachable(page, "Start match");
    await expectNoHorizontalOverflow(page, `${viewportName} pre-match`);
    screenshots.push(await screenshot(page, `pre-match-${viewportName}`));
    checks.push("Pre-match uses a focused match centre frame without Inbox/Posta or global Continue noise.");

    await page.getByRole("button", { name: "Start match" }).click();
    await visibleText(page, "Half-time");
    await visibleText(page, "Tactical board");
    await expectMatchdayFrame(page, viewportName, "half-time");
    await expectHalfTimeWorkspace(page, viewportName);
    await expectPrimaryActionReachable(page, "Start second half");
    await expectNoHorizontalOverflow(page, `${viewportName} half-time`);
    screenshots.push(await screenshot(page, `half-time-${viewportName}`));
    checks.push("Half-time is a real decision stop with tactical board, bench, validation, and one primary continuation action.");

    await page.getByRole("button", { name: "Start second half" }).click();
    await visibleText(page, "Full time");
    await visibleText(page, "Continue");
    await expectMatchdayFrame(page, viewportName, "full-time");
    await expectFullTimeReview(page, viewportName);
    await expectPrimaryActionReachable(page, "Continue");
    await expectNoHorizontalOverflow(page, `${viewportName} full time`);
    screenshots.push(await screenshot(page, `full-time-${viewportName}`));
    checks.push("Full time separates result, key events, ratings, and consequences without falling back to a raw log table.");
  } finally {
    await page.close();
  }

  return { viewportName, screenshots, checks };
}

/** Checks the rebuilt landing screen without assuming a saved career exists. */
async function expectAppEntry(page: Page, viewportName: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    main: document.querySelectorAll("main").length,
    actionNav: document.querySelectorAll("nav").length,
    themePickers: document.querySelectorAll('[name="web-theme-palette"]').length,
    themeDataAttr: document.documentElement.getAttribute("data-theme-palette"),
    buttons: [...document.querySelectorAll("button")].map((button) => button.textContent?.trim()).filter(Boolean),
  }));

  if (counts.main !== 1 || counts.actionNav < 1) {
    throw new Error(`${viewportName} app entry landmark check failed: ${JSON.stringify(counts)}.`);
  }

  if (counts.themePickers !== 0 || counts.themeDataAttr !== null) {
    throw new Error(`${viewportName} app entry still exposes rejected theme-palette UI: ${JSON.stringify(counts)}.`);
  }

  if (!counts.buttons.includes("New career") || !counts.buttons.includes("Continue career")) {
    throw new Error(`${viewportName} app entry does not expose the expected career actions: ${JSON.stringify(counts)}.`);
  }
}

/** Checks the persistent career shell landmarks and current navigation marker. */
async function expectCareerShellLandmarks(page: Page, viewportName: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    shell: document.querySelectorAll(".tls-app-shell").length,
    main: document.querySelectorAll("main.tls-app-shell-main").length,
    asides: document.querySelectorAll("aside").length,
    navs: document.querySelectorAll("nav").length,
    currentItems: document.querySelectorAll('[aria-current="page"]').length,
  }));

  if (counts.shell !== 1 || counts.main !== 1 || counts.asides < 2 || counts.navs < 1 || counts.currentItems !== 1) {
    throw new Error(`${viewportName} shell landmark check failed: ${JSON.stringify(counts)}.`);
  }
}

/** Guards the rebuilt dashboard and screens from deleted legacy UI surfaces. */
async function expectNoLegacyUi(page: Page, context: string): Promise<void> {
  const legacyCounts = await page.evaluate(() => ({
    careerShellBridge: document.querySelectorAll(".tls-career-shell").length,
    oldDashboardGrid: document.querySelectorAll(".tls-dashboard-grid").length,
    oldActionList: document.querySelectorAll(".tls-dashboard-action-list").length,
    themePickers: document.querySelectorAll('[name="web-theme-palette"]').length,
    oldReport: document.querySelectorAll(".tls-matchday-report").length,
  }));

  if (Object.values(legacyCounts).some((count) => count > 0)) {
    throw new Error(`${context} still renders legacy UI: ${JSON.stringify(legacyCounts)}.`);
  }
}

/** Checks the board-first preparation workspace. */
async function expectMatchPreparationWorkspace(page: Page, viewportName: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    tacticalBoards: document.querySelectorAll(".tls-tactical-board").length,
    benchBoards: document.querySelectorAll(".tls-tactical-bench-board").length,
    benchSlots: document.querySelectorAll("[data-bench-slot-id]").length,
    helperButtons: [...document.querySelectorAll("button")].filter((button) =>
      ["Auto", "Fill gaps", "Clear"].includes(button.textContent?.trim() ?? ""),
    ).length,
  }));

  if (counts.tacticalBoards !== 1 || counts.benchBoards !== 1 || counts.benchSlots !== 8 || counts.helperButtons < 3) {
    throw new Error(`${viewportName} preparation workspace is incomplete: ${JSON.stringify(counts)}.`);
  }
}

/** Checks that matchday is focused on the match, not on global shell attention. */
async function expectMatchdayFrame(page: Page, viewportName: string, phase: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    shell: document.querySelectorAll(".tls-app-shell").length,
    scoreboard: document.querySelectorAll(".tls-matchday-scoreboard").length,
    phaseRail: document.querySelectorAll(".tls-match-centre-phase-rail").length,
    rightRailInbox: document.querySelectorAll(".tls-app-shell-right-rail .tls-app-shell-posta-rail").length,
    shellContinue: [...document.querySelectorAll(".tls-app-shell-continue")].filter((button) =>
      button.textContent?.includes("Continue"),
    ).length,
  }));

  if (counts.shell !== 1 || counts.scoreboard !== 1 || counts.phaseRail !== 1) {
    throw new Error(`${viewportName} ${phase} matchday frame is incomplete: ${JSON.stringify(counts)}.`);
  }

  if (counts.rightRailInbox !== 0 || counts.shellContinue !== 0) {
    throw new Error(`${viewportName} ${phase} matchday frame still has global shell noise: ${JSON.stringify(counts)}.`);
  }
}

/** Checks that half-time exposes the shared tactical-board workspace. */
async function expectHalfTimeWorkspace(page: Page, viewportName: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    tacticalBoards: document.querySelectorAll(".tls-tactical-board").length,
    benchBoards: document.querySelectorAll(".tls-tactical-bench-board").length,
    playerTokens: document.querySelectorAll(".tls-tactical-board-token").length,
    benchSlots: document.querySelectorAll("[data-bench-slot-id]").length,
    oldSubstitutionSelects: document.querySelectorAll(".tls-match-centre-half-time select").length,
  }));

  if (counts.tacticalBoards !== 1 || counts.benchBoards !== 1 || counts.playerTokens !== 11 || counts.benchSlots !== 8) {
    throw new Error(`${viewportName} half-time tactical workspace is incomplete: ${JSON.stringify(counts)}.`);
  }

  if (counts.oldSubstitutionSelects > 0) {
    throw new Error(`${viewportName} half-time still exposes the old substitution form: ${JSON.stringify(counts)}.`);
  }
}

/** Checks that full time presents a result review, not only a raw event table. */
async function expectFullTimeReview(page: Page, viewportName: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    finalReview: document.querySelectorAll(".tls-match-centre-full-time").length,
    keyEvents: document.querySelectorAll(".tls-match-centre-key-event").length,
    finalRatings: document.querySelectorAll(".tls-match-centre-full-time-ratings").length,
    consequenceCards: document.querySelectorAll(".tls-match-centre-consequence-card").length,
    oldReport: document.querySelectorAll(".tls-matchday-report").length,
  }));

  if (counts.finalReview !== 1 || counts.finalRatings !== 1 || counts.keyEvents < 1 || counts.consequenceCards < 1) {
    throw new Error(`${viewportName} full-time review is incomplete: ${JSON.stringify(counts)}.`);
  }

  if (counts.oldReport > 0) {
    throw new Error(`${viewportName} full-time still renders the old report layout: ${JSON.stringify(counts)}.`);
  }
}

/** Focuses a visible button and confirms the active element has an accessible label. */
async function expectPrimaryActionReachable(page: Page, buttonName: string): Promise<void> {
  await page.getByRole("button", { name: buttonName }).first().focus();
  const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");

  if (!focusedText.includes(buttonName)) {
    throw new Error(`Expected focused element to include "${buttonName}", got "${focusedText}".`);
  }
}

/** Guards against horizontal overflow in the current viewport. */
async function expectNoHorizontalOverflow(page: Page, context: string): Promise<void> {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`${context} has horizontal overflow: ${JSON.stringify(geometry)}.`);
  }
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

/** Polls the Vite dev server until the local app is available. */
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

/** Writes the final visual QA audit for Phase 69. */
async function writeAudit(results: readonly UiRebuildInspectionResult[]): Promise<void> {
  const screenshotLines = results
    .flatMap((result) => result.screenshots.map((path) => `- ${result.viewportName}: \`${path}\``))
    .join("\n");
  const checkLines = results
    .flatMap((result) => result.checks.map((check) => `- ${result.viewportName}: ${check}`))
    .join("\n");

  await writeFile(
    AUDIT_PATH,
    `# Web UI Full Rebuild Visual QA

Date: 2026-07-06
Phase: \`69-web-ui-full-rebuild-around-tactical-board\`
Step: \`14-visual-qa-accessibility-and-phase-report.md\`

## Result

PASS.

The browser QA drove the rebuilt first-MVP web flow on desktop and narrow
viewports: app entry, dashboard, match preparation, pre-match, half-time, and
full time.

## Checked

${checkLines}

## Accessibility And Layout Notes

- App entry exposes one \`main\` landmark and an action navigation.
- Career screens expose one shell, one main content landmark, a left navigation
  rail, and a right context/attention rail.
- Exactly one navigation item uses \`aria-current="page"\` on career screens.
- Primary actions are keyboard focusable on dashboard, preparation, pre-match,
  half-time, and full time.
- Desktop and narrow viewports have no horizontal overflow.
- Matchday hides global Inbox/Posta and shell Continue while the manager is
  inside the match centre.

## Regression Guards

- No rejected theme-palette picker or root \`data-theme-palette\` attribute.
- No deleted legacy career-shell bridge selectors.
- No old dashboard action-list/grid.
- No old matchday raw-report layout.
- Half-time uses the shared tactical board and fixed 8-slot bench board.
- Full time separates result review, key events, ratings, and consequences.

## Screenshots

${screenshotLines}

## Manual Review Focus

Review the screenshots in \`${QA_OUTPUT_DIR}\` and the running app. The current
implementation is strong enough to resume MVP product work if the visual
language is accepted, but it is still an in-memory prototype: persistence,
section depth, and real career saves remain future work.
`,
  );
}

await main();

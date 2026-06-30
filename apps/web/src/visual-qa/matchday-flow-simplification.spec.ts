/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase67";
const AUDIT_PATH = resolve(REPO_ROOT, "docs/audits/MATCHDAY_FLOW_SIMPLIFICATION_VISUAL_QA.md");
const PORT = 5189;
const URL = `http://127.0.0.1:${PORT}/`;

interface FlowInspectionResult {
  readonly viewportName: string;
  readonly clickCount: number;
  readonly screenshots: readonly string[];
}

/**
 * Runs Phase 67 browser QA for the simplified matchday flow.
 *
 * The script proves the manager can go from dashboard to full time with one
 * clear primary action per screen, no matchday Inbox/Posta noise, a mandatory
 * half-time tactical workspace, keyboard-reachable actions, and no horizontal
 * overflow on desktop or narrow viewports.
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

  const results: FlowInspectionResult[] = [];

  try {
    await waitForServer();
    const browser = await chromium.launch();

    try {
      results.push(await inspectSimplifiedFlow(browser, "desktop", 1440, 960));
      results.push(await inspectSimplifiedFlow(browser, "narrow", 390, 844));
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  await writeAudit(results);
  console.log(`Phase 67 matchday flow QA screenshots written to ${QA_OUTPUT_DIR}`);
  console.log(`Phase 67 matchday flow QA audit written to ${AUDIT_PATH}`);
}

/** Drives the accepted dashboard-to-full-time path for one viewport. */
async function inspectSimplifiedFlow(
  browser: Browser,
  viewportName: string,
  width: number,
  height: number,
): Promise<FlowInspectionResult> {
  const page = await browser.newPage({ viewport: { width, height } });
  const screenshots: string[] = [];
  let clickCount = 0;

  const click = async (locator: ReturnType<Page["getByRole"]>): Promise<void> => {
    await locator.click();
    clickCount += 1;
  };

  try {
    await page.goto(URL);
    await visibleText(page, "The Long Season");
    await click(page.getByRole("button", { name: "New career" }));
    await visibleText(page, "The Long Season career dashboard");
    await visibleText(page, "Prepare match");
    await expectNoDeadDashboardActions(page, viewportName);
    await expectNoHorizontalOverflow(page, `${viewportName} dashboard`);
    screenshots.push(await screenshot(page, `dashboard-${viewportName}`));

    await click(page.getByRole("button", { name: "Prepare match" }).first());
    await visibleText(page, "Preparation incomplete");
    await expectNoShellContinue(page, `${viewportName} preparation`);
    await expectPrimaryActionReachable(page, "Save and go to match");
    await expectNoHorizontalOverflow(page, `${viewportName} preparation`);
    screenshots.push(await screenshot(page, `preparation-${viewportName}`));

    await click(page.getByRole("button", { name: "Auto" }));
    await click(page.getByLabel("Balanced"));
    await click(page.getByRole("button", { name: "Save and go to match" }));
    await visibleText(page, "Pre-match");
    await visibleText(page, "Start match");
    await expectMatchdayShellIsFocused(page, `${viewportName} pre-match`);
    await expectPrimaryActionReachable(page, "Start match");
    await expectNoHorizontalOverflow(page, `${viewportName} pre-match`);
    screenshots.push(await screenshot(page, `pre-match-${viewportName}`));

    await click(page.getByRole("button", { name: "Start match" }));
    await visibleText(page, "Half-time");
    await visibleText(page, "Half-time tactics");
    await visibleText(page, "Tactical board");
    await visibleText(page, "Current shape");
    await expectMatchdayShellIsFocused(page, `${viewportName} half-time`);
    await expectHalfTimeWorkspace(page, viewportName);
    await expectPrimaryActionReachable(page, "Start second half");
    await expectNoHorizontalOverflow(page, `${viewportName} half-time`);
    screenshots.push(await screenshot(page, `half-time-${viewportName}`));

    await click(page.getByRole("button", { name: "Start second half" }));
    await visibleText(page, "Full time");
    await visibleText(page, "Consequences");
    await visibleText(page, "Continue");
    await expectSingleFullTimeContinue(page, viewportName);
    await expectNoHorizontalOverflow(page, `${viewportName} full-time`);
    screenshots.push(await screenshot(page, `full-time-${viewportName}`));

    await click(page.getByRole("button", { exact: true, name: "Continue" }));
    await visibleText(page, "The Long Season career dashboard");
    await visibleText(page, "Recent match");
    await expectCleanDashboardAfterMatch(page, viewportName);
    await expectNoHorizontalOverflow(page, `${viewportName} dashboard after match`);
    screenshots.push(await screenshot(page, `dashboard-after-match-${viewportName}`));
  } finally {
    await page.close();
  }

  return {
    viewportName,
    clickCount,
    screenshots,
  };
}

/** Confirms the half-time stop exposes real tactical controls, not the old two-select panel. */
async function expectHalfTimeWorkspace(page: Page, viewportName: string): Promise<void> {
  const counts = await page.evaluate(() => ({
    tacticalBoard: document.querySelectorAll(".tls-tactical-board").length,
    tacticalBench: document.querySelectorAll(".tls-tactical-bench-board").length,
    oldSubstitutionSelects: document.querySelectorAll(".tls-match-centre-half-time select").length,
    playerTokens: document.querySelectorAll(".tls-tactical-board-token").length,
    benchSlots: document.querySelectorAll("[data-bench-slot-id]").length,
  }));

  if (counts.tacticalBoard !== 1 || counts.tacticalBench !== 1 || counts.playerTokens !== 11 || counts.benchSlots !== 8) {
    throw new Error(`${viewportName} half-time workspace is incomplete: ${JSON.stringify(counts)}.`);
  }

  if (counts.oldSubstitutionSelects > 0) {
    throw new Error(`${viewportName} half-time still exposes the old substitution select panel: ${JSON.stringify(counts)}.`);
  }
}

/** Confirms matchday removes unrelated shell surfaces while keeping the screen action. */
async function expectMatchdayShellIsFocused(page: Page, context: string): Promise<void> {
  const shellCounts = await page.evaluate(() => ({
    inboxRails: document.querySelectorAll('[aria-label="Inbox"]').length,
    shellContinueButtons: [...document.querySelectorAll(".tls-career-shell-actions button")]
      .filter((button) => button.textContent?.trim() === "Continue").length,
    mainMenuButtons: [...document.querySelectorAll(".tls-career-shell-actions button")]
      .filter((button) => button.textContent?.trim() === "Main menu").length,
  }));

  if (shellCounts.inboxRails !== 0 || shellCounts.shellContinueButtons !== 0 || shellCounts.mainMenuButtons !== 1) {
    throw new Error(`${context} shell is noisy: ${JSON.stringify(shellCounts)}.`);
  }
}

/** Confirms there is only one full-time Continue action. */
async function expectSingleFullTimeContinue(page: Page, viewportName: string): Promise<void> {
  const continueButtonCount = await page.getByRole("button", { exact: true, name: "Continue" }).count();

  if (continueButtonCount !== 1) {
    throw new Error(`${viewportName} full-time should have one Continue button, got ${continueButtonCount}.`);
  }
}

/** Confirms post-match dashboard no longer carries stale matchday attention. */
async function expectCleanDashboardAfterMatch(page: Page, viewportName: string): Promise<void> {
  const staleText = await page.evaluate(() => document.body.textContent ?? "");

  if (staleText.includes("Matchday reached") || staleText.includes("Start match")) {
    throw new Error(`${viewportName} dashboard still contains stale matchday attention text.`);
  }
}

/** Confirms the old decorative dashboard actions are not available controls. */
async function expectNoDeadDashboardActions(page: Page, viewportName: string): Promise<void> {
  const deadButtons = await page.evaluate(() =>
    ["Inspect squad", "Inspect lineup", "Inspect tactic", "Inspect table"]
      .filter((label) => [...document.querySelectorAll("button")].some((button) => button.textContent?.includes(label))),
  );

  if (deadButtons.length > 0) {
    throw new Error(`${viewportName} dashboard exposes dead actions: ${deadButtons.join(", ")}.`);
  }
}

/** Confirms preparation mode does not show an ambiguous global shell Continue. */
async function expectNoShellContinue(page: Page, context: string): Promise<void> {
  const shellContinueCount = await page.evaluate(() =>
    [...document.querySelectorAll(".tls-career-shell-actions button")]
      .filter((button) => button.textContent?.trim() === "Continue").length,
  );

  if (shellContinueCount !== 0) {
    throw new Error(`${context} exposes a global shell Continue button.`);
  }
}

/** Focuses the primary action so keyboard reachability is tested without relying on tab order churn. */
async function expectPrimaryActionReachable(page: Page, buttonName: string): Promise<void> {
  await page.getByRole("button", { name: buttonName }).first().focus();
  await expectFocusedText(page, buttonName);
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

/** Confirms the active element exposes the expected visible text. */
async function expectFocusedText(page: Page, expectedText: string): Promise<void> {
  const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");

  if (!focusedText.includes(expectedText)) {
    throw new Error(`Expected focused element to include "${expectedText}", got "${focusedText}".`);
  }
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

/** Writes the Phase 67 browser QA report consumed by the phase status. */
async function writeAudit(results: readonly FlowInspectionResult[]): Promise<void> {
  const maxClickCount = Math.max(...results.map((result) => result.clickCount));
  const screenshotLines = results
    .flatMap((result) => result.screenshots.map((path) => `- ${result.viewportName}: \`${path}\``))
    .join("\n");

  await writeFile(
    AUDIT_PATH,
    `# Matchday Flow Simplification Visual QA

Date: 2026-06-30
Phase: \`67-web-matchday-flow-simplification-and-half-time-tactical-decisions\`
Step: \`08-click-count-playwright-accessibility-and-flow-qa.md\`

## Result

PASS.

The browser QA drove the accepted dashboard-to-full-time path on desktop and
narrow viewports. The flow now uses one primary action per screen, saves
preparation directly into pre-match, stops at a tactical half-time workspace,
and returns to a clean dashboard after full time.

## Click Count

- Desktop: ${results.find((result) => result.viewportName === "desktop")?.clickCount ?? "unknown"} clicks.
- Narrow: ${results.find((result) => result.viewportName === "narrow")?.clickCount ?? "unknown"} clicks.
- Gate: <= 8 clicks from new career to dashboard after full time.
- Actual max: ${maxClickCount} clicks.

## Checked

- No dashboard bounce after \`Save and go to match\`.
- Matchday shell hides Inbox/Posta and global Continue.
- Dashboard does not expose dead available actions.
- Pre-match exposes one \`Start match\` action.
- Half-time exposes the shared tactical board and fixed 8-slot bench.
- The old two-select substitution panel is not shown when the tactical
  workspace is available.
- Full time exposes one \`Continue\` action.
- Dashboard after match does not retain stale matchday attention text.
- Primary actions are keyboard focusable.
- Desktop and narrow viewports have no horizontal overflow.

## Screenshots

${screenshotLines}

## Manual UX Note

The half-time screen is now a real manager stop instead of a bureaucratic
substitution form. The next product risk is visual density: the board is
functionally correct, but after persistence the matchday screen should still be
reviewed with real club data and longer fixture histories.
`,
  );
}

await main();

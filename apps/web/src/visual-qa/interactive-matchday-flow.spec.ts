/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase66";
const PORT = 5188;
const URL = `http://127.0.0.1:${PORT}/`;

/**
 * Runs Phase 66 browser QA for the interactive matchday flow.
 *
 * The script proves the user can enter matchday directly, stop at half-time,
 * make a substitution decision, continue to full time, and return to the
 * dashboard without horizontal overflow or a raw log-table presentation.
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

  try {
    await waitForServer();
    const browser = await chromium.launch();

    try {
      await inspectContinuePath(browser, "desktop", 1440, 960);
      await inspectDashboardActionPath(browser, "narrow", 390, 844);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Phase 66 interactive matchday QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Verifies the desktop Continue path into the match centre. */
async function inspectContinuePath(
  browser: Browser,
  name: string,
  width: number,
  height: number,
): Promise<void> {
  const page = await browser.newPage({ viewport: { width, height } });

  try {
    await openPreparedDashboard(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-ready-${name}.png` });
    await expectPrimaryFocusPath(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await inspectInteractiveMatchday(page, name);
  } finally {
    await page.close();
  }
}

/** Verifies the dashboard primary action path into the match centre. */
async function inspectDashboardActionPath(
  browser: Browser,
  name: string,
  width: number,
  height: number,
): Promise<void> {
  const page = await browser.newPage({ viewport: { width, height } });

  try {
    await openPreparedDashboard(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-ready-${name}.png` });
    await page.getByRole("button", { exact: true, name: "Go to match" }).click();
    await inspectInteractiveMatchday(page, name);
  } finally {
    await page.close();
  }
}

/** Opens a new demo career, completes preparation, and returns to dashboard. */
async function openPreparedDashboard(page: Page): Promise<void> {
  await page.goto(URL);
  await visibleText(page, "The Long Season");
  await page.getByRole("button", { name: "New career" }).click();
  await visibleText(page, "The Long Season career dashboard");
  await expectNoHorizontalOverflow(page, "initial dashboard");

  await page.getByRole("button", { name: "Prepare match" }).first().click();
  await visibleText(page, "Preparation incomplete");
  await page.getByRole("button", { name: "Auto" }).click();
  await page.getByLabel("Balanced").check();
  await page.getByRole("button", { name: "Save preparation" }).click();
  await visibleText(page, "Preparation saved");
  await page.locator(".tls-preparation-dashboard").click();
  await visibleText(page, "Preparation complete");
  await visibleText(page, "Go to match");
  await expectNoHorizontalOverflow(page, "prepared dashboard");
}

/** Drives pre-match, half-time, substitution, full-time, and dashboard return. */
async function inspectInteractiveMatchday(page: Page, name: string): Promise<void> {
  await visibleText(page, "Matchday");
  await visibleText(page, "Pre-match");
  await page.locator(".tls-match-centre").waitFor({ state: "visible", timeout: 5_000 });
  await expectMatchCentreStructure(page, "pre-match");
  await expectNoHorizontalOverflow(page, `${name} pre-match`);
  await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/matchday-pre-match-${name}.png` });

  await page.getByRole("button", { name: "Kick off" }).click();
  await visibleText(page, "Half-time");
  await visibleText(page, "Half-time decisions");
  await visibleText(page, "Player off");
  await visibleText(page, "Player on");
  await expectMatchCentreStructure(page, "half-time");
  await expectNoHorizontalOverflow(page, `${name} half-time`);
  await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/matchday-half-time-${name}.png` });

  await applyFirstAvailableSubstitution(page);
  await visibleText(page, "Applied substitutions");
  await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/matchday-half-time-substitution-${name}.png` });

  await page.getByRole("button", { name: "Second half" }).click();
  await visibleText(page, "Full time");
  await visibleText(page, "Consequences");
  await visibleText(page, "Form and morale");
  await expectMatchCentreStructure(page, "full-time");
  await expectNoHorizontalOverflow(page, `${name} full-time`);
  await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/matchday-full-time-${name}.png` });

  await page.locator(".tls-matchday-dashboard").click();
  await visibleText(page, "Recent match");
  await visibleText(page, "no next fixture");
  await expectNoHorizontalOverflow(page, `${name} dashboard after match`);
  await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-after-match-${name}.png` });
}

/** Chooses the first valid half-time substitution option pair and applies it. */
async function applyFirstAvailableSubstitution(page: Page): Promise<void> {
  const selects = page.locator(".tls-match-centre-half-time select");
  const selectCount = await selects.count();

  if (selectCount !== 2) {
    throw new Error(`Expected 2 half-time substitution selects, got ${selectCount}.`);
  }

  for (let index = 0; index < selectCount; index += 1) {
    const optionValue = await selects.nth(index).locator("option").nth(1).getAttribute("value");

    if (optionValue === null || optionValue.length === 0) {
      throw new Error(`Missing substitution option for select ${index}.`);
    }

    await selects.nth(index).selectOption(optionValue);
  }

  await page.getByRole("button", { name: "Apply substitution" }).click();
}

/** Confirms the match centre uses hierarchy, cards, and rating rows instead of a raw log table. */
async function expectMatchCentreStructure(page: Page, context: string): Promise<void> {
  await page.locator(".tls-matchday-scoreboard").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-match-centre-phase-rail").waitFor({ state: "visible", timeout: 5_000 });

  if (context !== "pre-match") {
    await page.locator(".tls-match-centre-player-table").waitFor({ state: "visible", timeout: 5_000 });
  }

  const structure = await page.evaluate(() => ({
    oldReportCount: document.querySelectorAll(".tls-matchday-report").length,
    eventCardCount: document.querySelectorAll(".tls-match-centre-event-card").length,
    playerTableCount: document.querySelectorAll(".tls-match-centre-player-table").length,
    scoreboardCount: document.querySelectorAll(".tls-matchday-scoreboard").length,
  }));

  if (structure.oldReportCount > 0) {
    throw new Error(`${context} still renders the old report layout: ${JSON.stringify(structure)}.`);
  }

  if (structure.scoreboardCount !== 1 || (context !== "pre-match" && structure.playerTableCount !== 1)) {
    throw new Error(`${context} is missing match-centre hierarchy: ${JSON.stringify(structure)}.`);
  }

  if (context !== "pre-match" && structure.eventCardCount === 0) {
    throw new Error(`${context} has no event cards, so it reads like an empty report: ${JSON.stringify(structure)}.`);
  }
}

/** Confirms keyboard focus reaches the primary shell Continue action. */
async function expectPrimaryFocusPath(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Dashboard" }).focus();
  await expectFocusedText(page, "Dashboard");
  await page.keyboard.press("Tab");
  await expectFocusedText(page, "Main menu");
  await page.keyboard.press("Tab");
  await expectFocusedText(page, "Continue");
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

await main();

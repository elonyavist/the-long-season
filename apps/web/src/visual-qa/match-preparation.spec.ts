/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase52";
const PORT = 5176;
const URL = `http://127.0.0.1:${PORT}/`;

/**
 * Runs focused browser QA for the Phase 52 match-preparation web slice.
 *
 * The script starts the local Vite app, drives the manager journey from menu
 * to saved preparation, writes screenshots under `/tmp`, and throws on layout,
 * keyboard, or flow regressions.
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
      await inspectDashboardPath(browser, "desktop", 1366, 900);
      await inspectInboxPath(browser, "narrow", 390, 844);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Phase 52 match-preparation QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Verifies the desktop dashboard-to-preparation-to-matchday path. */
async function inspectDashboardPath(
  browser: Browser,
  name: string,
  width: number,
  height: number,
): Promise<void> {
  const page = await browser.newPage({ viewport: { width, height } });

  try {
    await page.goto(URL);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/main-menu-${name}.png` });
    await page.getByRole("button", { name: "New career" }).click();
    await visibleText(page, "missing saved lineup");
    await visibleText(page, "missing saved tactic");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-before-preparation-${name}.png` });

    await page.getByRole("button", { name: "Prepare match" }).click();
    await visibleText(page, "Preparation incomplete");
    await expectNoHorizontalOverflow(page, name);
    await expectPreparationFocusPath(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/preparation-empty-${name}.png` });

    await completePreparation(page);
    await visibleText(page, "Preparation saved");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/preparation-saved-${name}.png` });

    await page.locator(".tls-preparation-dashboard").click();
    await visibleText(page, "Preparation complete");
    await visibleText(page, "none");
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Matchday reached");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-matchday-${name}.png` });
  } finally {
    await page.close();
  }
}

/** Verifies the narrow Inbox/Posta action path into match preparation. */
async function inspectInboxPath(
  browser: Browser,
  name: string,
  width: number,
  height: number,
): Promise<void> {
  const page = await browser.newPage({ viewport: { width, height } });

  try {
    await page.goto(URL);
    await page.getByRole("button", { name: "New career" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Match preparation required");
    await page
      .getByRole("complementary", { name: "Inbox" })
      .getByRole("button", { name: "Prepare match" })
      .click();
    await visibleText(page, "Preparation incomplete");
    await expectNoHorizontalOverflow(page, name);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/preparation-inbox-${name}.png` });

    await completePreparation(page);
    await page.locator(".tls-preparation-dashboard").click();
    await visibleText(page, "Preparation complete");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-cleared-${name}.png` });
  } finally {
    await page.close();
  }
}

/** Selects a full valid lineup, chooses a tactic, and saves the preparation. */
async function completePreparation(page: Page): Promise<void> {
  const selects = page.locator(".tls-preparation-slot select");
  const slotCount = await selects.count();

  if (slotCount !== 11) {
    throw new Error(`Expected 11 lineup selects, got ${slotCount}.`);
  }

  for (let index = 0; index < slotCount; index += 1) {
    await selects.nth(index).selectOption(`player:demo-${String(index + 1).padStart(2, "0")}`);
  }

  await page.getByLabel("Balanced").check();
  await page.getByRole("button", { name: "Save preparation" }).click();
}

/** Confirms the important keyboard path reaches the first lineup select. */
async function expectPreparationFocusPath(page: Page): Promise<void> {
  await page.locator(".tls-preparation-dashboard").focus();
  await expectFocusedText(page, "Dashboard");
  await page.keyboard.press("Tab");
  await expectFocusedText(page, "Select player");
}

/** Guards against horizontal overflow in the current viewport. */
async function expectNoHorizontalOverflow(page: Page, name: string): Promise<void> {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`${name} viewport has horizontal overflow: ${JSON.stringify(geometry)}.`);
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

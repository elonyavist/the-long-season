/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase65";
const PORT = 5186;
const URL = `http://127.0.0.1:${PORT}/`;

/**
 * Runs focused browser QA for the first playable web matchday slice.
 *
 * The script starts the Vite app, drives the manager from dashboard to match
 * preparation, matchday, result report, and dashboard return, then writes
 * screenshots outside the repo for manual visual inspection.
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
      await inspectMatchdayFlow(browser, "desktop", 1440, 960);
      await inspectMatchdayFlow(browser, "narrow", 390, 844);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Phase 65 matchday playable-slice QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Verifies the complete prepare-to-result-to-dashboard flow in one viewport. */
async function inspectMatchdayFlow(
  browser: Browser,
  name: string,
  width: number,
  height: number,
): Promise<void> {
  const page = await browser.newPage({ viewport: { width, height } });

  try {
    await page.goto(URL);
    await visibleText(page, "The Long Season");
    await page.getByRole("button", { name: "New career" }).click();
    await visibleText(page, "The Long Season career dashboard");
    await expectNoHorizontalOverflow(page, `${name} dashboard start`);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-start-${name}.png` });

    await page.getByRole("button", { name: "Prepare match" }).click();
    await visibleText(page, "Preparation incomplete");
    await page.getByRole("button", { name: "Auto" }).click();
    await page.getByLabel("Balanced").check();
    await page.getByRole("button", { name: "Save preparation" }).click();
    await visibleText(page, "Preparation saved");
    await expectPrimaryFocusPath(page);
    await expectNoHorizontalOverflow(page, `${name} preparation saved`);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/preparation-saved-${name}.png` });

    await page.locator(".tls-preparation-dashboard").click();
    await visibleText(page, "Preparation complete");
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Matchday reached");
    await expectNoHorizontalOverflow(page, `${name} dashboard matchday reached`);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-matchday-reached-${name}.png` });

    await page
      .getByRole("complementary", { name: "Inbox" })
      .getByRole("button", { name: "Open matchday" })
      .click();
    await visibleText(page, "Ready to play");
    await page.getByRole("button", { name: "Play match" }).click();
    await visibleText(page, "Full time");
    await visibleText(page, "Key events");
    await visibleText(page, "Player stats");
    await visibleText(page, "Form and morale");
    await expectNoHorizontalOverflow(page, `${name} matchday result`);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/matchday-result-${name}.png` });

    await page.locator(".tls-matchday-next").getByRole("button", { name: "Dashboard" }).click();
    await visibleText(page, "Recent match");
    await visibleText(page, "fixture:000003");
    await visibleText(page, "no next fixture");
    await expectNoHorizontalOverflow(page, `${name} dashboard after match`);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-after-match-${name}.png` });
  } finally {
    await page.close();
  }
}

/** Confirms keyboard focus reaches the key action controls in a predictable order. */
async function expectPrimaryFocusPath(page: Page): Promise<void> {
  await page.locator(".tls-preparation-dashboard").focus();
  await expectFocusedText(page, "Dashboard");
  await page.keyboard.press("Tab");
  await expectFocusedText(page, "Auto");
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

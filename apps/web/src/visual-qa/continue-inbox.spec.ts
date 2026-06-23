/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase50";
const PORT = 5174;
const URL = `http://127.0.0.1:${PORT}/`;

/**
 * Runs a focused browser QA pass for the Phase 50 Continue/InBox flow.
 *
 * This script intentionally avoids a full test-runner dependency. It starts
 * the local Vite app, drives Chromium with Playwright, writes screenshots to
 * `/tmp`, and throws on any missing screen state.
 */
async function main(): Promise<void> {
  await mkdir(QA_OUTPUT_DIR, { recursive: true });
  const server = spawn(
    "pnpm",
    ["--filter", "@game/web", "run", "dev", "--", "--host", "127.0.0.1", "--port", String(PORT)],
    {
      cwd: REPO_ROOT,
      stdio: "pipe",
    },
  );

  try {
    await waitForServer();
    const browser = await chromium.launch();

    try {
      await inspectViewport(browser, "desktop", 1366, 900);
      await inspectViewport(browser, "narrow", 390, 844);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }
}

async function inspectViewport(
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
    await visibleText(page, "S.S. Perugia");
    await visibleText(page, "Inbox");
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Match preparation required");
    await visibleText(page, "Action required");
    await visibleText(page, "Prepare match");
    await page.screenshot({
      path: `${QA_OUTPUT_DIR}/continue-inbox-${name}.png`,
      fullPage: true,
    });
  } finally {
    await page.close();
  }
}

async function visibleText(page: Page, text: string): Promise<void> {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5_000 });
}

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

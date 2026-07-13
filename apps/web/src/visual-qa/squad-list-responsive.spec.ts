/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Locator, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const OUTPUT_DIR = "/tmp/the-long-season-phase69-step04a";
const PORT = 5193;
const URL = `http://127.0.0.1:${PORT}/`;

/** Runs responsive browser QA for the compact match-preparation squad list. */
async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const server = spawn(
    "pnpm",
    ["--filter", "@game/web", "exec", "vite", "--host", "127.0.0.1", "--port", String(PORT)],
    { cwd: REPO_ROOT, stdio: "pipe" },
  );

  try {
    await waitForServer();
    const browser = await chromium.launch();

    try {
      await inspectSquadList(browser, "desktop", 1440, 960);
      await inspectSquadList(browser, "narrow", 390, 844);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Responsive squad-list screenshots written to ${OUTPUT_DIR}`);
}

/** Exercises filtering, sorting, selection, and overflow checks for one viewport. */
async function inspectSquadList(browser: Browser, name: string, width: number, height: number): Promise<void> {
  const page = await browser.newPage({ viewport: { width, height } });

  try {
    await openMatchPreparation(page);
    const panel = page.locator(".tls-preparation-squad-panel");
    const tableWrap = page.locator(".tls-preparation-squad-table-wrap");

    await assertVisibleColumns(page);
    await assertNoHorizontalOverflow(page, `${name} page`);
    await assertNoHorizontalOverflow(tableWrap, `${name} squad table`);
    await panel.screenshot({ path: resolve(OUTPUT_DIR, `squad-list-${name}.png`) });

    await page.getByRole("button", { name: "Auto" }).click();
    await requireCount(page.locator('.tls-preparation-squad-status[data-status="selected"]'), 11, `${name} XI markers`);
    await requireCount(page.locator('.tls-preparation-squad-status[data-status="bench"]'), 8, `${name} bench markers`);

    const defenderFilter = page.getByRole("button", { name: "DEF", exact: true });
    await defenderFilter.focus();
    await page.keyboard.press("Enter");
    await requireMinimumCount(page.locator(".tls-preparation-squad-table tbody tr"), 1, `${name} filtered rows`);
    await assertVisiblePositionCodes(page, new Set(["TD", "DC", "TS"]));
    await panel.screenshot({ path: resolve(OUTPUT_DIR, `squad-list-${name}-defenders.png`) });
    if (name === "desktop") {
      await panel.screenshot({ path: resolve(OUTPUT_DIR, "squad-list-filtered.png") });
    }

    await page.getByRole("button", { name: "All", exact: true }).click();
    await page.getByRole("button", { name: "Cond.", exact: true }).click();
    const playerButton = page.locator(".tls-preparation-squad-player").first();
    await playerButton.click();
    await page.getByRole("tab", { name: "Squad", exact: true }).click();
    await requireCount(page.locator('.tls-preparation-squad-table tr[data-selected="true"]'), 1, `${name} focused row`);
    await assertNoHorizontalOverflow(tableWrap, `${name} selected squad table`);
    await panel.screenshot({ path: resolve(OUTPUT_DIR, `squad-list-${name}-selected.png`) });
    if (name === "desktop") {
      await panel.screenshot({ path: resolve(OUTPUT_DIR, "squad-list-selected-player.png") });
    }
  } finally {
    await page.close();
  }
}

/** Opens the current demo career directly into match preparation. */
async function openMatchPreparation(page: Page): Promise<void> {
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "New career" }).click();
  await page.getByRole("button", { name: "Prepare match" }).first().click();
  await page.getByRole("heading", { name: "Squad list" }).waitFor();
}

/** Confirms the compact list exposes exactly the accepted information hierarchy. */
async function assertVisibleColumns(page: Page): Promise<void> {
  const headers = await page.locator(".tls-preparation-squad-table thead th").allTextContents();

  if (headers.length !== 5 || headers.some((header) => header.includes("Foot"))) {
    throw new Error(`Unexpected squad-list columns: ${JSON.stringify(headers)}.`);
  }

  const expected = ["Name", "Pos.", "Age", "%", "St."];
  for (const label of expected) {
    if (!headers.some((header) => header.includes(label))) {
      throw new Error(`Missing squad-list column ${label}: ${JSON.stringify(headers)}.`);
    }
  }
}

/** Confirms department filtering only leaves accepted canonical position codes. */
async function assertVisiblePositionCodes(page: Page, acceptedCodes: ReadonlySet<string>): Promise<void> {
  const codes = await page.locator(".tls-preparation-squad-position").allTextContents();

  if (codes.length === 0 || codes.some((code) => !acceptedCodes.has(code.trim()))) {
    throw new Error(`Unexpected filtered position codes: ${JSON.stringify(codes)}.`);
  }
}

/** Rejects any horizontal overflow in the page or one scroll container. */
async function assertNoHorizontalOverflow(target: Page | Locator, context: string): Promise<void> {
  const dimensions =
    "viewportSize" in target
      ? await target.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
      : await target.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));

  if (dimensions.scrollWidth > dimensions.clientWidth + 1) {
    throw new Error(`${context} has horizontal overflow: ${JSON.stringify(dimensions)}.`);
  }
}

/** Requires an exact locator count with a useful failure message. */
async function requireCount(locator: Locator, expected: number, context: string): Promise<void> {
  const count = await locator.count();

  if (count !== expected) {
    throw new Error(`${context}: expected ${expected}, received ${count}.`);
  }
}

/** Requires at least one matching row after a user-facing filter. */
async function requireMinimumCount(locator: Locator, expectedMinimum: number, context: string): Promise<void> {
  const count = await locator.count();

  if (count < expectedMinimum) {
    throw new Error(`${context}: expected at least ${expectedMinimum}, received ${count}.`);
  }
}

/** Waits for the local Vite server before opening browser pages. */
async function waitForServer(): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 30_000) {
    try {
      const response = await fetch(URL);
      if (response.ok) {
        return;
      }
    } catch {
      // The server is still starting.
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 200));
  }

  throw new Error("Timed out waiting for the web visual-QA server.");
}

void main();

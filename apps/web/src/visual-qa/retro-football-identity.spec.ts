/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase53";
const PORT = 5177;
const URL = `http://127.0.0.1:${PORT}/`;

/**
 * Runs Phase 53 browser QA for the retro-football web identity.
 *
 * The script keeps the check user-centered: it opens the career, verifies that
 * the shell/dashboard/InBox/preparation surfaces render as football-management
 * screens, completes the Phase 52 preparation journey, and stores screenshots
 * outside the repository for manual inspection.
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
      await inspectDesktop(browser);
      await inspectNarrow(browser);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Phase 53 retro-football UI QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Verifies desktop shell, dashboard, pitch preparation, and Continue flow. */
async function inspectDesktop(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  try {
    await page.goto(URL);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/main-menu-desktop.png` });

    await page.getByRole("button", { name: "New career" }).click();
    await expectRetroShell(page, "desktop");
    await expectDashboardControlRoom(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-control-room-desktop.png` });

    await page.getByRole("button", { name: "Prepare match" }).click();
    await expectPreparationBoard(page, "desktop");
    await expectPreparationKeyboardPath(page);
    await page.evaluate(() => {
      window.scrollTo({ top: 0, left: 0 });
    });
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/match-preparation-pitch-desktop.png` });

    await completePreparation(page);
    await visibleText(page, "Preparation saved");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/match-preparation-saved-desktop.png` });

    await page.locator(".tls-preparation-dashboard").click();
    await visibleText(page, "Preparation complete");
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Matchday reached");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-matchday-desktop.png` });
  } finally {
    await page.close();
  }
}

/** Verifies narrow shell stacking, Inbox path, pitch layout, and no overflow. */
async function inspectNarrow(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await page.goto(URL);
    await page.getByRole("button", { name: "New career" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Match preparation required");
    await expectRetroShell(page, "narrow");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/inbox-attention-narrow.png` });

    await page
      .getByRole("complementary", { name: "Inbox" })
      .getByRole("button", { name: "Prepare match" })
      .click();
    await expectPreparationBoard(page, "narrow");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/match-preparation-pitch-narrow.png` });

    await completePreparation(page);
    await page.locator(".tls-preparation-dashboard").click();
    await visibleText(page, "Preparation complete");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-cleared-narrow.png` });
  } finally {
    await page.close();
  }
}

/** Confirms the football-management shell landmarks and geometry are intact. */
async function expectRetroShell(page: Page, viewportName: string): Promise<void> {
  await page.locator(".tls-career-shell-operations").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-career-shell-crest").waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("navigation", { name: "Career navigation" }).waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("complementary", { name: "Inbox" }).waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("main", { name: "Selected career screen" }).waitFor({ state: "visible", timeout: 5_000 });
  await expectNoHorizontalOverflow(page, viewportName);
}

/** Confirms the dashboard first viewport behaves like a control room. */
async function expectDashboardControlRoom(page: Page): Promise<void> {
  await page.locator(".tls-dashboard-command-center").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-dashboard-match-desk").waitFor({ state: "visible", timeout: 5_000 });
  await visibleText(page, "missing saved lineup");
  await visibleText(page, "missing saved tactic");
}

/** Confirms the preparation page exposes the pitch, squad list, and tactics. */
async function expectPreparationBoard(page: Page, viewportName: string): Promise<void> {
  await visibleText(page, "Preparation incomplete");
  await page.locator(".tls-preparation-pitch").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-squad-table").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-player-detail").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-tactic").waitFor({ state: "visible", timeout: 5_000 });
  await expectNoHorizontalOverflow(page, viewportName);

  const slotCount = await page.locator(".tls-preparation-slot select").count();

  if (slotCount !== 11) {
    throw new Error(`Expected 11 lineup selects, got ${slotCount}.`);
  }
}

/** Confirms keyboard users can reach the first player selector from the panel action. */
async function expectPreparationKeyboardPath(page: Page): Promise<void> {
  await page.locator(".tls-preparation-dashboard").focus();
  await expectFocusedText(page, "Dashboard");
  await page.keyboard.press("Tab");
  await expectFocusedText(page, "Select player");
}

/** Selects a complete manual lineup, tactic, and save action. */
async function completePreparation(page: Page): Promise<void> {
  const selects = page.locator(".tls-preparation-slot select");
  const slotCount = await selects.count();

  for (let index = 0; index < slotCount; index += 1) {
    await selects.nth(index).selectOption(`player:demo-${String(index + 1).padStart(2, "0")}`);
  }

  await page.getByLabel("Balanced").check();
  await page.getByRole("button", { name: "Save preparation" }).click();

  const selectedRows = await page.locator(".tls-preparation-squad-table tbody tr[data-status='selected']").count();

  if (selectedRows !== 11) {
    throw new Error(`Expected 11 selected squad rows after preparation, got ${selectedRows}.`);
  }
}

/** Guards against viewport-breaking horizontal overflow. */
async function expectNoHorizontalOverflow(page: Page, viewportName: string): Promise<void> {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`${viewportName} viewport has horizontal overflow: ${JSON.stringify(geometry)}.`);
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

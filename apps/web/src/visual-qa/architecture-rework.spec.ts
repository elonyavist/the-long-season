/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase55";
const PORT = 5179;
const URL = `http://127.0.0.1:${PORT}/`;

/**
 * Runs Phase 55 browser QA after the web architecture and styling rework.
 *
 * The script verifies the existing playable browser flow still works after file
 * moves, Zustand state migration, and Tailwind setup. It writes screenshots
 * outside the repository so visual regressions can be inspected manually.
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
      await inspectDesktopFlow(browser);
      await inspectNarrowFlow(browser);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Phase 55 architecture rework QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Verifies the desktop main menu, dashboard, preparation workspace, and Continue readiness. */
async function inspectDesktopFlow(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  try {
    await page.goto(URL);
    await page.getByRole("button", { name: "New career" }).focus();
    await expectFocusedText(page, "New career");
    await expectNoHorizontalOverflow(page, "desktop main menu");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/main-menu-desktop.png` });

    await page.getByRole("button", { name: "New career" }).click();
    await visibleText(page, "Dashboard");
    await visibleText(page, "missing saved lineup");
    await visibleText(page, "missing saved tactic");
    await expectShellLandmarks(page);
    await expectNoHorizontalOverflow(page, "desktop dashboard");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-desktop.png` });

    await page.getByRole("button", { name: "Prepare match" }).click();
    await expectWorkspace(page, "desktop preparation");
    await changeFormation(page, "4-2-3-1");
    await completePreparation(page);
    await expectKeyboardPath(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/preparation-ready-desktop.png` });

    await page.getByRole("button", { name: "Save preparation" }).click();
    await visibleText(page, "Preparation saved");
    await page.locator(".tls-preparation-dashboard").click();
    await visibleText(page, "Preparation complete");
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Matchday reached");
    await expectNoHorizontalOverflow(page, "desktop matchday");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-matchday-desktop.png` });
  } finally {
    await page.close();
  }
}

/** Verifies the narrow left-rail stack and Inbox/Posta route into preparation. */
async function inspectNarrowFlow(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await page.goto(URL);
    await page.getByRole("button", { name: "New career" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Match preparation required");
    await expectNarrowShellOrder(page);
    await page
      .getByRole("complementary", { name: "Inbox" })
      .getByRole("button", { name: "Prepare match" })
      .click();
    await expectWorkspace(page, "narrow preparation");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/preparation-narrow.png` });
  } finally {
    await page.close();
  }
}

/** Confirms the core career shell landmarks are still named after the folder migration. */
async function expectShellLandmarks(page: Page): Promise<void> {
  await page.getByRole("banner").waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("navigation", { name: "Career navigation" }).waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("complementary", { name: "Inbox" }).waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("main", { name: "Selected career screen" }).waitFor({ state: "visible", timeout: 5_000 });
}

/** Confirms the narrow layout keeps Inbox/Posta before the selected screen content. */
async function expectNarrowShellOrder(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => {
    const aside = document.querySelector(".tls-career-shell-inbox-rail");
    const main = document.querySelector(".tls-career-shell-content");

    if (aside === null || main === null) {
      return null;
    }

    return {
      asideTop: aside.getBoundingClientRect().top,
      mainTop: main.getBoundingClientRect().top,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  if (geometry === null) {
    throw new Error("Missing narrow shell geometry nodes.");
  }

  if (geometry.asideTop >= geometry.mainTop) {
    throw new Error(`Expected Inbox/Posta before selected content, got ${JSON.stringify(geometry)}.`);
  }

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`Narrow shell has horizontal overflow: ${JSON.stringify(geometry)}.`);
  }
}

/** Confirms the tactical workspace still exposes all primary preparation controls. */
async function expectWorkspace(page: Page, viewportName: string): Promise<void> {
  await visibleText(page, "Preparation incomplete");
  await page.locator(".tls-preparation-formation-select select").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-pitch").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-bench").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-squad-table").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-tactic").waitFor({ state: "visible", timeout: 5_000 });
  await expectNoHorizontalOverflow(page, viewportName);

  const lineupSelectCount = await page.locator(".tls-preparation-slot select").count();
  const benchSelectCount = await page.locator(".tls-preparation-bench-slot select").count();

  if (lineupSelectCount !== 11) {
    throw new Error(`Expected 11 lineup selects, got ${lineupSelectCount}.`);
  }

  if (benchSelectCount !== 8) {
    throw new Error(`Expected 8 bench selects, got ${benchSelectCount}.`);
  }
}

/** Changes formation and confirms the control keeps the manager-selected value. */
async function changeFormation(page: Page, formationId: string): Promise<void> {
  const formationSelect = page.locator(".tls-preparation-formation-select select");

  await formationSelect.selectOption(formationId);

  const selectedFormationId = await formationSelect.evaluate((element) => (element as HTMLSelectElement).value);

  if (selectedFormationId !== formationId) {
    throw new Error(`Expected formation ${formationId}, got ${selectedFormationId}.`);
  }
}

/** Selects a full manual XI, eight substitutes, and one tactic profile. */
async function completePreparation(page: Page): Promise<void> {
  const lineupSelects = page.locator(".tls-preparation-slot select");
  const benchSelects = page.locator(".tls-preparation-bench-slot select");

  for (let index = 0; index < 11; index += 1) {
    await lineupSelects.nth(index).selectOption(`player:demo-${String(index + 1).padStart(2, "0")}`);
  }

  for (let index = 0; index < 8; index += 1) {
    await benchSelects.nth(index).selectOption(`player:demo-${String(index + 12).padStart(2, "0")}`);
  }

  await page.getByLabel("Balanced").check();
  await visibleText(page, "Ready to save");
}

/** Confirms keyboard tab order still reaches the primary preparation controls. */
async function expectKeyboardPath(page: Page): Promise<void> {
  await page.locator(".tls-preparation-dashboard").focus();
  const seen = {
    formation: false,
    lineup: false,
    bench: false,
    tactic: false,
    save: false,
  };

  for (let index = 0; index < 90; index += 1) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const activeElement = document.activeElement;

      return {
        formation: activeElement?.matches(".tls-preparation-formation-select select") ?? false,
        lineup: activeElement?.matches(".tls-preparation-slot select") ?? false,
        bench: activeElement?.matches(".tls-preparation-bench-slot select") ?? false,
        tactic: activeElement?.matches("input[name='match-preparation-tactic']") ?? false,
        save: activeElement?.matches(".tls-preparation-save button") ?? false,
      };
    });

    seen.formation ||= focused.formation;
    seen.lineup ||= focused.lineup;
    seen.bench ||= focused.bench;
    seen.tactic ||= focused.tactic;
    seen.save ||= focused.save;
  }

  if (!seen.formation || !seen.lineup || !seen.bench || !seen.tactic || !seen.save) {
    throw new Error(`Keyboard path missed required controls: ${JSON.stringify(seen)}.`);
  }
}

/** Guards against viewport-breaking horizontal overflow. */
async function expectNoHorizontalOverflow(page: Page, viewportName: string): Promise<void> {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`${viewportName} has horizontal overflow: ${JSON.stringify(geometry)}.`);
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
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15_000) {
    try {
      const response = await fetch(URL);

      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
  }

  throw new Error(`Timed out waiting for ${URL}.`);
}

await main();

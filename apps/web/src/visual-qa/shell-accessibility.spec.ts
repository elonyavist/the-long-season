/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase51";
const PORT = 5175;
const URL = `http://127.0.0.1:${PORT}/`;

/**
 * Runs focused browser QA for the Phase 51 career shell layout.
 *
 * The script keeps the verification intentionally close to user behavior:
 * open the app, start the demo career, inspect the shell, continue until the
 * first attention stop, and capture desktop/narrow screenshots outside the
 * repository.
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

  console.log(`Phase 51 web shell QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Verifies the desktop shell layout, landmarks, current nav state, and focus path. */
async function inspectDesktop(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  try {
    await page.goto(URL);
    await page.getByRole("button", { name: "New career" }).focus();
    await expectFocusedText(page, "New career");
    await page.screenshot({
      fullPage: true,
      path: `${QA_OUTPUT_DIR}/main-menu-desktop.png`,
    });

    await page.getByRole("button", { name: "New career" }).click();
    await expectShellLandmarks(page);
    await expectDesktopGeometry(page);
    await expectCurrentDashboardNav(page);
    await expectShellFocusPath(page);
    await page.screenshot({
      fullPage: true,
      path: `${QA_OUTPUT_DIR}/career-shell-desktop-before-continue.png`,
    });

    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Match preparation required");
    await visibleText(page, "Action required");
    await visibleText(page, "Prepare match");
    await page.screenshot({
      fullPage: true,
      path: `${QA_OUTPUT_DIR}/career-shell-desktop-after-continue.png`,
    });
  } finally {
    await page.close();
  }
}

/** Verifies the narrow stacked shell and guards against horizontal overflow. */
async function inspectNarrow(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await page.goto(URL);
    await page.getByRole("button", { name: "New career" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expectShellLandmarks(page);
    await expectNarrowGeometry(page);
    await visibleText(page, "Match preparation required");
    await page.screenshot({
      fullPage: true,
      path: `${QA_OUTPUT_DIR}/career-shell-narrow-after-continue.png`,
    });
  } finally {
    await page.close();
  }
}

/** Confirms the core shell landmarks are rendered and named. */
async function expectShellLandmarks(page: Page): Promise<void> {
  await page.getByRole("banner").waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("navigation", { name: "Career navigation" }).waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("complementary", { name: "Inbox" }).waitFor({ state: "visible", timeout: 5_000 });
  await page.getByRole("main", { name: "Selected career screen" }).waitFor({ state: "visible", timeout: 5_000 });
}

/** Confirms the desktop Inbox rail stays left of the central content. */
async function expectDesktopGeometry(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => {
    const aside = document.querySelector(".tls-career-shell-inbox-rail");
    const main = document.querySelector(".tls-career-shell-content");

    if (aside === null || main === null) {
      return null;
    }

    const asideBox = aside.getBoundingClientRect();
    const mainBox = main.getBoundingClientRect();

    return {
      asideLeft: asideBox.left,
      asideRight: asideBox.right,
      mainLeft: mainBox.left,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  if (geometry === null) {
    throw new Error("Missing desktop shell geometry nodes.");
  }

  if (geometry.asideLeft >= geometry.mainLeft || geometry.asideRight >= geometry.mainLeft) {
    throw new Error(`Expected left Inbox rail before central content, got ${JSON.stringify(geometry)}.`);
  }

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`Desktop shell has horizontal overflow: ${JSON.stringify(geometry)}.`);
  }
}

/** Confirms narrow layout stacks Inbox before central content without horizontal overflow. */
async function expectNarrowGeometry(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => {
    const aside = document.querySelector(".tls-career-shell-inbox-rail");
    const main = document.querySelector(".tls-career-shell-content");

    if (aside === null || main === null) {
      return null;
    }

    const asideBox = aside.getBoundingClientRect();
    const mainBox = main.getBoundingClientRect();

    return {
      asideTop: asideBox.top,
      mainTop: mainBox.top,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  if (geometry === null) {
    throw new Error("Missing narrow shell geometry nodes.");
  }

  if (geometry.asideTop >= geometry.mainTop) {
    throw new Error(`Expected narrow Inbox rail before central content, got ${JSON.stringify(geometry)}.`);
  }

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`Narrow shell has horizontal overflow: ${JSON.stringify(geometry)}.`);
  }
}

/** Confirms the selected dashboard section communicates current-page state. */
async function expectCurrentDashboardNav(page: Page): Promise<void> {
  const current = await page.getByRole("button", { name: "Dashboard" }).getAttribute("aria-current");

  if (current !== "page") {
    throw new Error(`Expected Dashboard nav aria-current="page", got ${String(current)}.`);
  }
}

/** Confirms keyboard focus moves from current nav to the primary shell actions. */
async function expectShellFocusPath(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Dashboard" }).focus();
  await expectFocusedText(page, "Dashboard");
  await page.keyboard.press("Tab");
  await expectFocusedText(page, "Main menu");
  await page.keyboard.press("Tab");
  await expectFocusedText(page, "Continue");
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

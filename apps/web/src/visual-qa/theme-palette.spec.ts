/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

import { WEB_THEME_PALETTE_IDS } from "../app/theme-palettes.ts";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase61";
const PORT = 5184;
const URL = `http://127.0.0.1:${PORT}/`;

/** Runs browser QA for all user-selectable web UI palettes. */
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
      for (const paletteId of WEB_THEME_PALETTE_IDS) {
        await inspectPalette(browser, paletteId);
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Phase 61 theme-palette QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Captures app-entry, dashboard, and match-preparation evidence for one palette. */
async function inspectPalette(browser: Browser, paletteId: string): Promise<void> {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  try {
    await openAppEntryWithPalette(desktop, paletteId);
    await expectThemeApplied(desktop, paletteId);
    await expectStableSemanticColors(desktop);
    await expectNoHorizontalOverflow(desktop, `${paletteId} app-entry desktop`);
    await desktop.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/${paletteId}-app-entry-desktop.png` });

    await desktop.getByRole("button", { name: "New career" }).click();
    await visibleText(desktop, "Dashboard");
    await desktop.getByRole("button", { name: "Dashboard" }).waitFor({ state: "visible", timeout: 5_000 });
    await expectThemeApplied(desktop, paletteId);
    await expectNoHorizontalOverflow(desktop, `${paletteId} dashboard desktop`);
    await desktop.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/${paletteId}-dashboard-desktop.png` });

    await desktop.getByRole("button", { name: "Prepare match" }).click();
    await desktop.getByRole("button", { name: "Auto" }).click();
    await visibleText(desktop, "Current shape");
    await expectThemeApplied(desktop, paletteId);
    await expectSkinArtDirection(desktop, paletteId);
    await expectHoverAndBorderAlignment(desktop, paletteId);
    await expectPitchGrassStable(desktop);
    await expectNoHorizontalOverflow(desktop, `${paletteId} preparation desktop`);
    await desktop.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/${paletteId}-match-preparation-desktop.png` });
  } finally {
    await desktop.close();
  }

  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await openAppEntryWithPalette(narrow, paletteId);
    await expectThemeApplied(narrow, paletteId);
    await expectNoHorizontalOverflow(narrow, `${paletteId} app-entry narrow`);
    await narrow.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/${paletteId}-app-entry-narrow.png` });

    await narrow.getByRole("button", { name: "New career" }).click();
    await visibleText(narrow, "Dashboard");
    await expectNoHorizontalOverflow(narrow, `${paletteId} dashboard narrow`);
    await narrow.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/${paletteId}-dashboard-narrow.png` });

    await narrow.getByRole("button", { name: "Prepare match" }).click();
    await narrow.getByRole("button", { name: "Auto" }).click();
    await expectSkinArtDirection(narrow, paletteId);
    await expectHoverAndBorderAlignment(narrow, paletteId);
    await expectPitchGrassStable(narrow);
    await expectNoHorizontalOverflow(narrow, `${paletteId} preparation narrow`);
    await narrow.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/${paletteId}-match-preparation-narrow.png` });
  } finally {
    await narrow.close();
  }
}

/** Opens the app-entry settings screen and selects the requested palette. */
async function openAppEntryWithPalette(page: Page, paletteId: string): Promise<void> {
  await page.goto(URL);
  await page.locator(`input[name="web-theme-palette"][value="${paletteId}"]`).check();
  await page.waitForFunction((expected) => document.documentElement.dataset.themePalette === expected, paletteId);
}

/** Confirms the selected palette reached the document root. */
async function expectThemeApplied(page: Page, paletteId: string): Promise<void> {
  const appliedPaletteId = await page.evaluate(() => document.documentElement.dataset.themePalette);

  if (appliedPaletteId !== paletteId) {
    throw new Error(`Expected palette ${paletteId}, got ${appliedPaletteId ?? "none"}.`);
  }
}

/** Confirms semantic colors remain stable across palettes. */
async function expectStableSemanticColors(page: Page): Promise<void> {
  const colors = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);

    return {
      red: styles.getPropertyValue("--tls-color-red").trim(),
      green: styles.getPropertyValue("--tls-color-green").trim(),
    };
  });

  if (colors.red !== "#c35f43" || colors.green !== "#6aae75") {
    throw new Error(`Expected stable semantic red/green, got ${JSON.stringify(colors)}.`);
  }
}

/** Confirms the tactical pitch grass is not recolored by user palettes. */
async function expectPitchGrassStable(page: Page): Promise<void> {
  await page.locator(".tls-tactical-board-svg").waitFor({ state: "visible", timeout: 5_000 });

  const grass = await page.evaluate(() => {
    const rects = [...document.querySelectorAll(".tls-tactical-board-svg rect")];

    return rects
      .map((rect) => rect.getAttribute("fill"))
      .filter((fill): fill is string => fill !== null && fill.startsWith("#"));
  });

  if (!grass.includes("#6b834c") || !grass.includes("#637a44")) {
    throw new Error(`Expected stable tactical pitch grass, got ${JSON.stringify(grass)}.`);
  }
}

/** Checks visible hierarchy signals that screenshot generation alone cannot assert. */
async function expectSkinArtDirection(page: Page, paletteId: string): Promise<void> {
  const styles = await page.evaluate(() => {
    const readStyle = (selector: string, property: keyof CSSStyleDeclaration) => {
      const element = document.querySelector(selector);

      if (element === null) {
        return "";
      }

      const value = getComputedStyle(element)[property];

      return typeof value === "string" ? value : "";
    };

      return {
      primaryButtonBackground: readStyle(".tls-menu-button-primary", "backgroundImage"),
      primaryButtonColor: readStyle(".tls-menu-button-primary", "color"),
      tableHeaderBackground: readStyle(".tls-preparation-squad-table th", "backgroundColor"),
      tableRowBackground: readStyle(".tls-preparation-squad-table tbody tr", "backgroundColor"),
      selectedRowBackground: readStyle(".tls-preparation-squad-table tr[data-status='selected'] td", "backgroundColor"),
    };
  });

  for (const [name, value] of Object.entries(styles)) {
    if (value === "" || value === "rgba(0, 0, 0, 0)") {
      throw new Error(`${paletteId} missing ${name} hierarchy color: ${JSON.stringify(styles)}.`);
    }
  }

  if (styles.tableHeaderBackground === styles.tableRowBackground) {
    throw new Error(`${paletteId} table header is not distinct from rows: ${JSON.stringify(styles)}.`);
  }

  if (styles.selectedRowBackground === styles.tableRowBackground) {
    throw new Error(`${paletteId} selected row is not distinct: ${JSON.stringify(styles)}.`);
  }

  if (styles.primaryButtonBackground === styles.primaryButtonColor) {
    throw new Error(`${paletteId} primary action lacks visible contrast: ${JSON.stringify(styles)}.`);
  }
}

/** Checks that each skin keeps actionable hover states and panel/table borders visible. */
async function expectHoverAndBorderAlignment(page: Page, paletteId: string): Promise<void> {
  const beforeHover = await readInteractiveChrome(page);

  await page.locator(".tls-menu-button:not(:disabled)").first().hover();

  const afterHover = await readInteractiveChrome(page);

  for (const [name, value] of Object.entries(afterHover)) {
    if (value === "" || value === "rgba(0, 0, 0, 0)") {
      throw new Error(`${paletteId} missing ${name} hover/border value: ${JSON.stringify(afterHover)}.`);
    }
  }

  if (
    beforeHover.buttonBackgroundColor === afterHover.buttonBackgroundColor &&
    beforeHover.buttonBackground === afterHover.buttonBackground &&
    beforeHover.buttonBorderColor === afterHover.buttonBorderColor
  ) {
    throw new Error(`${paletteId} button hover is not visibly distinct: ${JSON.stringify({ beforeHover, afterHover })}.`);
  }
}

/** Reads a small set of app-chrome styles that should stay coherent across skins. */
async function readInteractiveChrome(page: Page): Promise<{
  buttonBackground: string;
  buttonBackgroundColor: string;
  buttonBorderColor: string;
  panelBorderColor: string;
  tableBorderColor: string;
}> {
  return page.evaluate(() => {
    const readStyle = (selector: string, property: keyof CSSStyleDeclaration) => {
      const element = document.querySelector(selector);

      if (element === null) {
        return "";
      }

      const value = getComputedStyle(element)[property];

      return typeof value === "string" ? value : "";
    };

    return {
      buttonBackground: readStyle(".tls-menu-button:not(:disabled)", "backgroundImage"),
      buttonBackgroundColor: readStyle(".tls-menu-button:not(:disabled)", "backgroundColor"),
      buttonBorderColor: readStyle(".tls-menu-button:not(:disabled)", "borderTopColor"),
      panelBorderColor: readStyle(".tls-preparation-lineup", "borderTopColor"),
      tableBorderColor: readStyle(".tls-preparation-squad-table-wrap", "borderTopColor"),
    };
  });
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

/** Waits for visible text, which keeps the script resilient to Vite timing. */
async function visibleText(page: Page, text: string): Promise<void> {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5_000 });
}

/** Polls the local Vite server until it accepts browser navigation. */
async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(URL);

      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until Vite is ready.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  throw new Error(`Timed out waiting for Vite at ${URL}`);
}

await main();

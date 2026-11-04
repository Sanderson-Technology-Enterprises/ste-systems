import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import AxeBuilder from "@axe-core/playwright";
import { setDockedViewport } from "./workbench-helpers";

test.beforeEach(setDockedViewport);

const require = createRequire(import.meta.url);
const layoutManifest = require("layout-style-css/manifest.json");
const uiManifest = require("ui-style-kit-css/manifest.json");
const COMBINATION_FACTORS = {
  layouts: layoutManifest.personalities.length,
  recipes: layoutManifest.recipes.length,
  densities: 3,
  presets: uiManifest.presets.length,
  sharedThemes: uiManifest.themes.length,
};

test("native editorial workflow descriptions retain readable contrast", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  await lab
    .getByLabel("Preview style", { exact: true })
    .selectOption("editorial-luxe");
  await lab
    .getByLabel("Preview palette", { exact: true })
    .selectOption("native");
  const result = await new AxeBuilder({ page })
    .include("#motion-guide-preview .usk-step")
    .withRules(["color-contrast"])
    .analyze();
  expect(
    result.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map(({ target }) => target),
    })),
  ).toEqual([]);
});

test("native color exports retain preset roles and provide the selected format without clipboard access", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./components/#atlas-motion");
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error("Clipboard unavailable");
    };
  });
  const lab = page.locator("#motion-guide-preview");
  await lab
    .getByLabel("Preview palette", { exact: true })
    .selectOption("native");
  const editor = lab.locator("[data-custom-theme-editor]");
  await editor.locator("summary").click();
  await editor.getByLabel("Primary hex", { exact: true }).fill("#654321");
  await editor
    .getByRole("button", { name: "Copy theme CSS", exact: true })
    .click();
  const output = editor.getByLabel("Custom theme variables", { exact: true });
  await expect(output).toHaveValue(/\.client-custom-theme\s*\{/);
  await expect(output).toHaveValue(/--saas-primary-rgb: 101 67 33;/);
  await editor
    .getByRole("button", { name: "Copy variables JSON", exact: true })
    .click();
  expect(
    JSON.parse(await output.inputValue()).variables["--saas-primary-rgb"],
  ).toBe("101 67 33");
});

test("modal and tooltip presence retain their motion shells through entrance and exit", async ({
  page,
}) => {
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  await lab.locator("[data-motion-settings] summary").click();
  await lab.getByLabel("Motion preset", { exact: true }).selectOption("slide");
  await lab.getByLabel("Exit preset", { exact: true }).selectOption("form");
  for (const name of ["duration", "delay"]) {
    const control = lab.getByLabel(`Random ${name}`, { exact: true });
    await control.focus();
    await control.press("Space");
  }
  await lab
    .getByRole("button", { name: "Preview confirmation", exact: true })
    .click();
  const modal = page.getByRole("dialog", { name: "Publish this preview?" });
  await expect(modal).toHaveAttribute("data-ms-phase", "in");
  const frames = await modal.evaluate(async (element) => {
    const frames = [];
    for (let index = 0; index < 4; index++) {
      await new Promise(requestAnimationFrame);
      frames.push(getComputedStyle(element).transform);
    }
    return frames;
  });
  expect(new Set(frames).size).toBeGreaterThan(1);
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(modal).toHaveAttribute("data-ms-phase", "out");
  await expect(modal).not.toBeVisible();
  await expect(
    lab.getByRole("button", { name: "Preview confirmation", exact: true }),
  ).toBeFocused();
  await lab.getByRole("button", { name: "Preview help", exact: true }).hover();
  const tip = lab.getByRole("tooltip");
  await expect(tip.locator("[data-tooltip-motion]")).toHaveAttribute(
    "data-ms-phase",
    "in",
  );
  await page.mouse.move(0, 0);
  await expect(tip.locator("[data-tooltip-motion]")).toHaveAttribute(
    "data-ms-phase",
    "out",
  );
  await expect(tip).not.toBeVisible();
});

test("all public layout primitives and wrapper measures are selectable and contained", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  const explorer = lab.locator("[data-layout-explorer]");
  await explorer.locator("summary").click();
  await expect(
    explorer.getByLabel("Layout primitive", { exact: true }).locator("option"),
  ).toHaveCount(layoutManifest.primitives.length);
  for (const primitive of layoutManifest.primitives) {
    await explorer
      .getByLabel("Layout primitive", { exact: true })
      .selectOption(primitive);
    await expect(explorer.locator("[data-active-primitive]")).toHaveAttribute(
      "data-active-primitive",
      primitive,
    );
  }
  for (const wrapper of layoutManifest.wrappers) {
    await lab
      .getByLabel("Preview wrapper", { exact: true })
      .selectOption(wrapper);
    await expect(lab.locator(`.ly-wrapper--${wrapper}`).first()).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("main configuration applies every recipe and spacing density and keeps them shareable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  await page.getByRole("button", { name: "Layout", exact: true }).click();
  const controls = page.locator("[data-inspector-panel]");
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  const workspace = page.locator(".client-workspace");
  const fingerprints: string[] = [];
  for (const recipe of layoutManifest.recipes) {
    await controls
      .getByRole("combobox", { name: "Recipe", exact: true })
      .selectOption(recipe);
    await expect(workspace).toHaveAttribute("data-layout-recipe", recipe);
    fingerprints.push(
      await workspace.evaluate((element) => {
        const style = getComputedStyle(
          element.querySelector("[data-workspace-cards]") ?? element,
        );
        return `${style.gridTemplateAreas}|${style.gridTemplateColumns}`;
      }),
    );
    expect(new URL(page.url()).searchParams.get("recipe")).toBe(recipe);
  }
  expect(new Set(fingerprints).size).toBeGreaterThanOrEqual(4);
  const gaps: string[] = [];
  for (const density of ["compact", "normal", "spacious"]) {
    await controls
      .getByRole("combobox", { name: "Spacing density", exact: true })
      .selectOption(density);
    await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
      "data-ly-density",
      density,
    );
    gaps.push(
      await workspace.evaluate(
        (element) =>
          getComputedStyle(
            element.querySelector("[data-workspace-cards]") ?? element,
          ).gap,
      ),
    );
    expect(new URL(page.url()).searchParams.get("density")).toBe(density);
  }
  expect(new Set(gaps).size).toBe(3);
});

test("client playground exposes every counted configuration factor and applies real recipe and density changes", async ({
  page,
}) => {
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  for (const [label, count] of [
    ["Preview layout", COMBINATION_FACTORS.layouts],
    ["Preview recipe", COMBINATION_FACTORS.recipes],
    ["Preview density", COMBINATION_FACTORS.densities],
    ["Preview style", COMBINATION_FACTORS.presets],
    ["Preview palette", COMBINATION_FACTORS.sharedThemes + 1],
  ] as const) {
    await expect(
      lab.getByLabel(label, { exact: true }).locator("option"),
    ).toHaveCount(count);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await lab.getByLabel("Preview recipe", { exact: true }).selectOption("docs");
  await expect(lab.locator("[data-playground-recipe]")).toHaveAttribute(
    "data-playground-recipe",
    "docs",
  );
  await expect(
    lab.locator('[data-playground-recipe="docs"] [data-ly-area="nav"]'),
  ).toBeVisible();
  await lab
    .getByLabel("Preview density", { exact: true })
    .selectOption("spacious");
  await expect(lab.locator("[data-motion-browser]")).toHaveAttribute(
    "data-ly-density",
    "spacious",
  );
  await lab
    .getByLabel("Preview palette", { exact: true })
    .selectOption("native");
  await expect(lab.locator("[data-motion-browser]")).not.toHaveAttribute(
    "data-theme",
  );
  await lab
    .getByLabel("Preview style", { exact: true })
    .selectOption("cyberpunk");
  await expect(lab.locator("[data-motion-browser]")).toHaveAttribute(
    "data-ui",
    "cyberpunk",
  );
});

test("feedback reflexes and hover intensity use visible library effects", async ({
  page,
}) => {
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  const action = lab.getByRole("button", {
    name: "Success reflex",
    exact: true,
  });
  await action.click();
  await expect(action).toHaveAttribute("data-surface-feedback", "success");
  expect(
    await action.evaluate((element) => element.getAnimations().length),
  ).toBeGreaterThan(0);
  await expect(action).not.toHaveAttribute("data-surface-feedback");
  await lab
    .getByLabel("Hover intensity", { exact: true })
    .selectOption("strong");
  const queue = lab.getByRole("button", { name: "Queue release", exact: true });
  const hasHover = await page.evaluate(
    () => matchMedia("(hover: hover)").matches,
  );
  if (!hasHover) {
    await expect(lab.locator("[data-motion-browser]")).toHaveCSS(
      "--interactive-surface-lift-hover",
      "-8px",
    );
    return; // The library deliberately suppresses hover lift on touch-only devices.
  }
  // Instant centering avoids a smooth document scroll moving the target under sticky chrome.
  await queue.evaluate((e) =>
    e.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await queue.hover();
  await expect
    .poll(() =>
      queue.evaluate((element) => getComputedStyle(element).translate),
    )
    .toBe("0px -8px");
  await lab
    .getByLabel("Hover intensity", { exact: true })
    .selectOption("subtle");
  await queue.evaluate((e) =>
    e.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await queue.hover();
  await expect
    .poll(() =>
      queue.evaluate((element) => getComputedStyle(element).translate),
    )
    .toBe("0px -2px");
});

test("client color edits paint the preview and copy actual JSON and CSS variables", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  await lab.locator("[data-custom-theme-editor] summary").first().click();
  const editor = lab.locator("[data-custom-theme-editor]");
  await expect(
    editor.getByRole("button", { name: "Apply custom colors", exact: true }),
  ).toBeEnabled();
  await editor.getByLabel("Primary hex", { exact: true }).fill("#123456");
  await editor
    .getByRole("button", { name: "Apply custom colors", exact: true })
    .click();
  await expect
    .poll(() =>
      lab
        .locator("[data-motion-browser]")
        .evaluate((element) =>
          getComputedStyle(element)
            .getPropertyValue("--usk-primary-rgb")
            .trim(),
        ),
    )
    .toBe("18 52 86");
  await editor
    .getByRole("button", { name: "Copy variables JSON", exact: true })
    .click();
  const data = JSON.parse(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(data.variables["--usk-primary-rgb"]).toBe("18 52 86");
  await editor
    .getByRole("button", { name: "Copy theme CSS", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "--usk-primary-rgb: 18 52 86;",
  );
});

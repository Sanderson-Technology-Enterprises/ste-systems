import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { setDockedViewport } from "./workbench-helpers";

test.beforeEach(setDockedViewport);

// Read the authoritative source without loading its Next.js JSON-module imports.
const catalog = readFileSync("app/data/catalog.ts", "utf8");
const values = (name: string) =>
  [
    ...catalog
      .match(
        new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`),
      )![1]
      .matchAll(/"([^"]+)"/g),
  ].map((match) => match[1]);
const LAYOUT_PERSONALITIES = values("LAYOUT_PERSONALITIES");
const LAYOUT_RECIPES = values("LAYOUT_RECIPES");

test("application content remains reachable at minimum, default and maximum inspector widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  await page.getByRole("button", { name: "Layout", exact: true }).click();
  const divider = page.getByRole("separator", {
    name: "Resize settings panel",
  });
  for (const size of [240, 320, "maximum"] as const) {
    await divider.focus();
    if (size === "maximum") await divider.press("End");
    else {
      await divider.dblclick();
      if (size === 240)
        for (let step = 0; step < 5; step++) await divider.press("ArrowLeft");
      await expect(divider).toHaveAttribute("aria-valuenow", String(size));
    }
    const rail = (await page.locator(".inspector-rail").boundingBox())!;
    for (const selector of [".inspector-panel-root", ".inspector-divider"]) {
      const box = (await page.locator(selector).boundingBox())!;
      expect(box.y).toBeCloseTo(rail.y, 0);
      expect(box.height).toBeCloseTo(rail.height, 0);
    }
    for (const recipe of LAYOUT_RECIPES) {
      await page.getByLabel("Recipe", { exact: true }).selectOption(recipe);
      expect(
        await page
          .locator(".client-workspace")
          .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
        `${size}/${recipe}`,
      ).toBe(true);
      const host = page.getByRole("region", {
        name: "Live preview content",
        exact: true,
      });
      await host.evaluate((e) => {
        e.scrollTop = e.scrollHeight;
      });
      const footer = (await page
        .locator(".client-workspace footer")
        .boundingBox())!;
      const port = (await host.boundingBox())!;
      expect(footer.y + footer.height).toBeLessThanOrEqual(
        port.y + port.height + 1,
      );
    }
  }
});

test("all seven recipes and twenty personalities retain readable geometry at wide and constrained widths", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  await page.getByRole("button", { name: "Layout", exact: true }).click();
  for (const width of [1920, 1280]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const personality of LAYOUT_PERSONALITIES) {
      await page
        .getByLabel("Layout personality", { exact: true })
        .selectOption(personality);
      for (const recipe of LAYOUT_RECIPES) {
        await page.getByLabel("Recipe", { exact: true }).selectOption(recipe);
        await expect
          .poll(
            () =>
              page.locator(".client-workspace").evaluate((root) => {
                const style = getComputedStyle(root);
                const available =
                  root.clientWidth -
                  parseFloat(style.paddingLeft) -
                  parseFloat(style.paddingRight);
                const main = root.querySelector(".workbench-main");
                const cards = [
                  ...root.querySelectorAll("[data-workspace-card]"),
                ];
                return {
                  overflow: root.scrollWidth > root.clientWidth + 1,
                  narrowMain:
                    !!main &&
                    main.getBoundingClientRect().width <
                      Math.min(448, available) - 1,
                  narrowCard: cards.some(
                    (card) =>
                      card.getBoundingClientRect().width <
                      Math.min(352, available) - 1,
                  ),
                  clipped: [
                    ...root.querySelectorAll("p, h3, h4, a, button"),
                  ].some((node) => node.scrollWidth > node.clientWidth + 1),
                };
              }),
            { message: `${width}px / ${personality} / ${recipe}` },
          )
          .toEqual({
            overflow: false,
            narrowMain: false,
            narrowCard: false,
            clipped: false,
          });
      }
    }
  }
});

test("responsive frame uses page flow and Drawer without overwriting desktop preferences", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  const divider = page.getByRole("separator", {
    name: "Resize settings panel",
  });
  await divider.focus();
  await divider.press("ArrowRight");
  const remembered = await divider.getAttribute("aria-valuenow");
  for (const width of [320, 390, 768, 1023, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const host = page.getByRole("region", {
      name: "Live preview content",
      exact: true,
    });
    await expect(host).toHaveCSS(
      "overflow-y",
      width < 1024 ? "visible" : "auto",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width < 1024) {
      await page
        .getByRole("button", { name: "Open settings", exact: true })
        .click();
      const drawer = page.getByRole("dialog", { name: "Workbench settings" });
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).not.toBeVisible();
    } else {
      await expect(divider).toHaveAttribute("aria-valuenow", remembered!);
      const rail = (await page.locator(".inspector-rail").boundingBox())!;
      const panel = (await page
        .locator(".inspector-panel-root")
        .boundingBox())!;
      expect(rail.height).toBeCloseTo(panel.height, 0);
    }
  }
  await page.setViewportSize({ width: 1440, height: 500 });
  await expect(
    page.getByRole("region", { name: "Live preview content", exact: true }),
  ).toHaveCSS("overflow-y", "visible");
  await expect(page.locator(".inspector-rail")).toBeVisible();
  await expect(divider).toHaveAttribute("aria-valuenow", remembered!);
});

test("configuration updates preserve preview scroll and samples while view switches reset preview scroll", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Retained client sample");
  const host = page.getByRole("region", {
    name: "Live preview content",
    exact: true,
  });
  await host.evaluate((e) => {
    e.scrollTop = 200;
  });
  await page
    .getByLabel("Visual style", { exact: true })
    .selectOption("editorial-luxe");
  expect(await host.evaluate((e) => e.scrollTop)).toBe(200);
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  expect(await host.evaluate((e) => e.scrollTop)).toBe(0);
  await page
    .getByRole("button", { name: "Component showcase", exact: true })
    .click();
  expect(await host.evaluate((e) => e.scrollTop)).toBe(0);
  await expect(page.getByLabel("Project name", { exact: true })).toHaveValue(
    "Retained client sample",
  );
});

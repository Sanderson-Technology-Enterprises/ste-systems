import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { setDockedViewport } from "./workbench-helpers";

test.beforeEach(setDockedViewport);
const require = createRequire(import.meta.url);
const presets: string[] = require("ui-style-kit-css/manifest.json").presets.map(
  (preset: string | { id: string }) =>
    typeof preset === "string" ? preset : preset.id,
);

/** Report actual computed text-bearing geometry instead of trusting authored classes. */
async function spacingViolations(root: import("@playwright/test").Locator) {
  return root.evaluate((scope) =>
    [
      ...scope.querySelectorAll<HTMLElement>(
        "div,aside,main,nav,header,footer,section,article,form,fieldset,details,summary,span,button,input,select,textarea,a[href]",
      ),
    ].flatMap((element) => {
      if (
        !element.getClientRects().length ||
        element.closest("[hidden],.ly-visually-hidden,[aria-hidden=true]")
      )
        return [];
      if (
        !element.textContent?.trim() &&
        !element.matches("button,input,select,textarea")
      )
        return [];
      const style = getComputedStyle(element);
      if (
        !element.checkVisibility({
          opacityProperty: true,
          visibilityProperty: true,
          contentVisibilityAuto: true,
        }) ||
        /(?:sr-only|visually-hidden)/.test(element.className)
      )
        return [];
      if (style.visibility !== "visible" || style.opacity === "0") return [];
      const horizontal = element.matches(
        "span,button,input,select,textarea,a[href]",
      )
        ? 3
        : 2;
      const sides = [
        style.paddingTop,
        style.paddingRight,
        style.paddingBottom,
        style.paddingLeft,
      ].map(parseFloat);
      return sides.some(
        (value, index) => value < (index % 2 ? horizontal : 2) - 0.1,
      )
        ? [
            {
              element: `${element.tagName}.${element.className}`,
              padding: sides,
            },
          ]
        : [];
    }),
  );
}

test("site header and live preview keep text clear of borders and the light logo has a backing", async ({
  page,
}) => {
  await page.goto("./lab/#workbench");
  const copy = page.locator(".site-header .brand-copy");
  expect(
    await copy.evaluate((element) =>
      Math.min(
        ...["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].map(
          (key) => parseFloat(getComputedStyle(element)[key as "paddingTop"]),
        ),
      ),
    ),
  ).toBeGreaterThanOrEqual(2);
  const chrome = page.locator(
    "[data-workbench-preview] .motion-browser-chrome",
  );
  expect(
    await chrome.evaluate((element) =>
      parseFloat(getComputedStyle(element).paddingLeft),
    ),
  ).toBeGreaterThanOrEqual(16);
  await page.goto("./");
  await page
    .locator(".experience")
    .evaluate((element) => element.setAttribute("data-mode", "light"));
  const backing = page.locator(".site-header .brand-logo-backing");
  await expect(backing).toBeVisible();
  expect(
    await backing.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).toBe("rgb(7, 17, 31)");
  expect(
    await backing.evaluate((element) => getComputedStyle(element).padding),
  ).toBe("6px");
  await backing.screenshot({ path: "output/nav-logo-light-backing.png" });
});

test("every visual preset retains text padding in native and named modes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  const preview = page.locator("[data-workbench-preview]");
  const failures: {
    scope: string;
    violations: Awaited<ReturnType<typeof spacingViolations>>;
  }[] = [];
  for (const preset of presets) {
    await page.getByLabel("Visual style", { exact: true }).selectOption(preset);
    for (const scheme of ["native", "midnight-gold"]) {
      await page
        .getByLabel("Color scheme", { exact: true })
        .selectOption(scheme);
      for (const mode of ["light", "dark", "contrast"]) {
        await page
          .getByLabel("Display mode", { exact: true })
          .selectOption(mode);
        const violations = await spacingViolations(preview);
        if (violations.length)
          failures.push({ scope: `${preset}/${scheme}/${mode}`, violations });
      }
    }
  }
  expect(failures).toEqual([]);
});

test("shared site shells keep minimum text clearance across public pages", async ({
  page,
}) => {
  const failures = [];
  for (const route of [
    "./",
    "./lab/",
    "./components/",
    "./components/reference/",
  ]) {
    await page.goto(route);
    const violations = await spacingViolations(page.locator("body"));
    if (violations.length) failures.push({ route, violations });
  }
  expect(failures).toEqual([]);
});

test("application and primitive views retain text clearance in every preset", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  const failures = [];
  for (const preset of presets) {
    await page.getByLabel("Visual style", { exact: true }).selectOption(preset);
    for (const name of ["Application workspace", "Layout primitives"]) {
      await page.getByRole("button", { name, exact: true }).click();
      const violations = await spacingViolations(
        page.locator("[data-workbench-preview]"),
      );
      if (violations.length) failures.push({ preset, view: name, violations });
    }
  }
  expect(failures).toEqual([]);
});

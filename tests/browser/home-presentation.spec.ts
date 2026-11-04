import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage mode previews preserve default appearance and legacy Lab URLs", async ({
  page,
}) => {
  await page.goto("./?site-mode=unknown");
  await expect(page.locator(".home-experience")).toHaveAttribute(
    "data-mode",
    "dark",
  );
  await page.goto("./?site-mode=contrast");
  await expect(page.locator(".home-experience")).toHaveAttribute(
    "data-mode",
    "contrast",
  );
  await page.goto("./?layout=editorial&ui=cyberpunk&theme=native&mode=light");
  await expect(page).toHaveURL(/\/lab\/\?.*mode=light/);
  await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ui",
    "cyberpunk",
  );
  await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-mode",
    "light",
  );
});

test("orbit number and caption contrast against every opaque gradient stop", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const mode of ["light", "dark", "contrast"]) {
    await page.goto(`./?site-mode=${mode}`);
    await expect(page.locator(".home-experience")).toHaveAttribute(
      "data-mode",
      mode,
    );
    const contrast = await page
      .locator(".home-observatory-core")
      .evaluate((core) => {
        const rgb = (value: string) =>
          (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const luminance = (color: number[]) =>
          color
            .map((c) => c / 255)
            .map((c) =>
              c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
            )
            .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
        const stops =
          getComputedStyle(core).backgroundImage.match(/rgb\([^)]*\)/g) ?? [];
        const minimum = (selector: string) => {
          const foreground = luminance(
            rgb(getComputedStyle(core.querySelector(selector)!).color),
          );
          return Math.min(
            ...stops.map((stop) => {
              const background = luminance(rgb(stop));
              return (
                (Math.max(foreground, background) + 0.05) /
                (Math.min(foreground, background) + 0.05)
              );
            }),
          );
        };
        return {
          stops: stops.length,
          number: minimum("strong"),
          caption: minimum("small"),
        };
      });
    expect(contrast.stops).toBeGreaterThan(1);
    expect(contrast.number, `${mode} count contrast`).toBeGreaterThanOrEqual(7);
    expect(contrast.caption, `${mode} caption contrast`).toBeGreaterThanOrEqual(
      4.5,
    );
  }
});

test("light-mode footer gives the unchanged silver logo a padded navy backing", async ({
  page,
}) => {
  await page.goto("./?site-mode=light");
  const backing = page.locator(".site-footer .brand-logo-backing");
  await expect(backing).toBeVisible();
  await expect(backing).toHaveCSS("background-color", "rgb(7, 17, 31)");
  await expect(backing).toHaveCSS("padding", "6px");
  const image = (await backing.locator("img").boundingBox())!;
  expect(image.width).toBeCloseTo(128, 0);
  expect(image.height).toBeCloseTo(96, 0);
});

test("package cards keep readable tablet columns and full-width single-line actions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 974, height: 1032 });
  await page.goto("./?site-mode=light#libraries");
  const cards = page.locator(".package-overview-card");
  const bounds = await cards.evaluateAll((elements) =>
    elements.map((e) => ({
      width: e.getBoundingClientRect().width,
      top: Math.round(e.getBoundingClientRect().top),
    })),
  );
  expect(Math.min(...bounds.map((b) => b.width))).toBeGreaterThanOrEqual(320);
  expect(new Set(bounds.map((b) => b.top)).size).toBe(2);
  for (const width of [320, 390, 768, 974, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const card of await cards.all()) {
      const actions = await card
        .locator(".package-overview-actions")
        .evaluate((e) =>
          [...e.querySelectorAll("a")].map((a) => {
            const range = document.createRange();
            range.selectNodeContents(a.firstChild!);
            return {
              lines: range.getClientRects().length,
              width: a.getBoundingClientRect().width,
              parent: e.getBoundingClientRect().width,
            };
          }),
        );
      for (const action of actions) {
        expect(action.lines, `button label at ${width}px`).toBe(1);
        expect(
          Math.abs(action.width - action.parent),
          `button width at ${width}px`,
        ).toBeLessThan(5);
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("homepage copy and interactive states retain contrast in all supported modes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const mode of ["light", "dark", "contrast"]) {
    await page.setViewportSize({ width: 974, height: 1032 });
    await page.goto(`./?site-mode=${mode}`);
    await expect(page.locator(".home-experience")).toHaveAttribute(
      "data-mode",
      mode,
    );
    const result = await new AxeBuilder({ page })
      .include(".home-experience")
      .withRules(["color-contrast"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      mode,
    ).toEqual([]);
    await page.locator(".home-orbit-control").last().hover();
    const hover = await new AxeBuilder({ page })
      .include(".home-observatory")
      .withRules(["color-contrast"])
      .analyze();
    expect(
      hover.violations.map((v) => v.nodes.map((n) => n.target)),
      `${mode} orbit hover`,
    ).toEqual([]);
  }
});

test("orbit count stays on one line inside its circle at phone, tablet and desktop sizes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./?site-mode=light");
  for (const width of [320, 390, 512, 768, 974, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const result = await page
      .locator(".home-observatory-core")
      .evaluate((core) => {
        const number = core.querySelector("strong")!;
        const range = document.createRange();
        range.selectNodeContents(number);
        const text = range.getBoundingClientRect();
        const circle = core.getBoundingClientRect();
        return {
          lines: range.getClientRects().length,
          inset: Math.min(text.left - circle.left, circle.right - text.right),
          fontSize: parseFloat(getComputedStyle(number).fontSize),
        };
      });
    expect(result.lines, `number lines at ${width}px`).toBe(1);
    expect(
      result.inset,
      `number edge clearance at ${width}px`,
    ).toBeGreaterThanOrEqual(8);
    expect(result.fontSize).toBeGreaterThanOrEqual(16);
  }
});

test("live light-mode homepage retains working tablet navigation and orbit controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 974, height: 1032 });
  await page.goto("./?site-mode=light");
  await expect(page.locator(".home-experience")).toHaveAttribute(
    "data-mode",
    "light",
  );
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  await menu.click();
  await expect(page.locator("#primary-navigation-panel")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close menu", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.locator("#primary-navigation-panel")).toBeHidden();
  await page.locator(".home-orbit-control").last().click();
  await expect(page.locator("#home-observatory-detail h2")).toHaveText(
    "Motion Style CSS",
  );
  await expect(page).toHaveURL(/site-mode=light/);
});

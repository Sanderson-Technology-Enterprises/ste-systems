import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("motion showcase presents a varied component workspace with real local interactions", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  const browser = lab.locator("[data-motion-browser]");
  await expect(browser).toHaveCount(1);
  await expect(browser.locator("[data-motion-item]")).toHaveCount(6);
  await expect(
    browser.getByRole("heading", { name: "Actions & states" }),
  ).toBeVisible();
  await expect(browser.getByLabel("Project name")).toHaveValue(
    "Northstar workspace",
  );
  await expect(
    browser.getByRole("progressbar", { name: "Release readiness" }),
  ).toHaveAttribute("aria-valuenow", "68");
  await expect(
    browser.getByRole("table", { name: "Release activity" }).getByRole("row"),
  ).toHaveCount(5);
  await browser.getByLabel("Project name").fill("Motion study");
  await browser
    .getByRole("button", { name: "Save draft", exact: true })
    .click();
  await expect(
    browser.getByText("Motion study saved in this preview.", { exact: true }),
  ).toBeVisible();
  await browser
    .getByRole("searchbox", { name: "Filter activity" })
    .fill("nothing-matches");
  await expect(
    browser.getByText("No matching activity.", { exact: true }),
  ).toBeVisible();
  await browser.getByRole("searchbox", { name: "Filter activity" }).fill("");
  await browser
    .getByRole("button", { name: "Preview confirmation", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Publish this preview?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    browser.getByRole("button", { name: "Preview confirmation", exact: true }),
  ).toBeFocused();
  const shadows = await browser
    .locator("[data-motion-item] > .interactive-surface")
    .evaluateAll((cards) =>
      cards.map((card) => getComputedStyle(card).boxShadow),
    );
  expect(new Set(shadows).size).toBe(3);
  await lab.screenshot({
    path: "output/motion-showcase-interactions.png",
    style: ".site-header, .skip-link, nextjs-portal { visibility: hidden; }",
  });
  expect(errors).toEqual([]);
});

test("preview appearance changes rendered colors and desktop panels form balanced rows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  const backgrounds: string[] = [];
  for (const mode of ["light", "dark"]) {
    await lab.getByLabel("Preview appearance").selectOption(mode);
    await expect(lab.locator("[data-motion-browser]")).toHaveAttribute(
      "data-mode",
      mode,
    );
    await expect(lab.locator("[data-motion-preview]")).toHaveAttribute(
      "data-configuration-motion-state",
      "idle",
    );
    backgrounds.push(
      await lab
        .locator("[data-motion-browser]")
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    );
  }
  expect(new Set(backgrounds).size).toBe(2);
  const geometry = await lab
    .locator('[data-playground-recipe] [data-ly-recipe="card-grid"]')
    .evaluate((grid) => {
      const style = getComputedStyle(grid);
      const available =
        grid.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const gap = parseFloat(style.columnGap);
      const minimum =
        22 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      return {
        columns: Math.max(
          1,
          Math.min(6, Math.floor((available + gap) / (minimum + gap))),
        ),
        minimum: Math.min(minimum, available),
        panels: [...grid.children].map((element) => {
          const box = element.getBoundingClientRect(),
            paint = getComputedStyle(element);
          return {
            top: Math.round(box.top),
            outerWidth:
              box.width +
              parseFloat(paint.marginLeft) +
              parseFloat(paint.marginRight),
          };
        }),
      };
    });
  expect(geometry.panels).toHaveLength(6);
  for (const panel of geometry.panels)
    expect(panel.outerWidth).toBeGreaterThanOrEqual(geometry.minimum - 1);
  expect(
    geometry.panels.filter((panel) => panel.top === geometry.panels[0].top),
  ).toHaveLength(geometry.columns);
  await lab.screenshot({
    path: "output/motion-showcase-desktop.png",
    style: ".site-header, .skip-link, nextjs-portal { visibility: hidden; }",
  });
});

test("motion showcase isolates targets, restores staggered panels and respects reduced motion", async ({
  page,
}) => {
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  const shell = lab.locator("[data-motion-preview]");
  await lab.getByLabel("Motion target").selectOption("featured");
  await lab.getByRole("button", { name: "Play exit", exact: true }).click();
  await expect(lab.locator("[data-motion-featured]")).toHaveAttribute(
    "data-ms-exited",
    "true",
  );
  await expect(shell).not.toHaveAttribute("data-ms-exited", "true");
  await expect(
    lab.getByRole("button", { name: "Play entrance", exact: true }),
  ).toBeFocused();
  await lab.getByRole("button", { name: "Reset preview", exact: true }).click();
  await expect(lab.locator("[data-motion-featured]")).not.toHaveAttribute(
    "data-ms-exited",
    "true",
  );
  await lab.getByRole("button", { name: "Play stagger", exact: true }).click();
  await expect(lab.locator("[data-motion-item]").last()).toHaveAttribute(
    "data-ms-phase",
    "in",
  );
  await lab.getByRole("button", { name: "Cancel motion", exact: true }).click();
  await expect(lab.locator("[data-motion-status]")).toContainText("cancelled");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await lab.getByLabel("Motion target").selectOption("workspace");
  await lab.getByRole("button", { name: "Play entrance", exact: true }).click();
  await expect(lab.locator("[data-motion-status]")).toContainText("skipped");
});

test("motion workspace stays contained across reference styles, modes and the embedded guide", async ({
  page,
}) => {
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  for (const style of [
    "minimal-saas",
    "data-terminal",
    "editorial-luxe",
    "maximalist",
  ]) {
    await lab.getByLabel("Preview style").selectOption(style);
    for (const mode of ["dark", "light"]) {
      await lab.getByLabel("Preview appearance").selectOption(mode);
      await expect(lab.locator("[data-motion-browser]")).toHaveAttribute(
        "data-ui",
        style,
      );
      await expect(lab.locator("[data-motion-browser]")).toHaveAttribute(
        "data-mode",
        mode,
      );
      await expect(lab.locator("[data-motion-preview]")).toHaveAttribute(
        "data-configuration-motion-state",
        "idle",
      );
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${style}/${mode}/${width}`,
        ).toBe(true);
        await expect(
          lab.getByRole("button", { name: "Play entrance", exact: true }),
        ).toBeVisible();
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await lab.screenshot({
    path: "output/motion-showcase-mobile.png",
    style: ".site-header, .skip-link, nextjs-portal { visibility: hidden; }",
  });
  await page.goto("./components/#atlas-motion");
  const guide = page.locator("#motion-guide-preview");
  await expect(guide.locator("[data-motion-item]")).toHaveCount(6);
  await expect(guide.getByRole("heading", { level: 4 })).toHaveCount(6);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await guide.screenshot({
    path: "output/motion-showcase-guide-mobile.png",
    style: ".site-header, .skip-link, nextjs-portal { visibility: hidden; }",
  });
});

test("motion specimens remain accessible across styles, modes and keyboard confirmation", async ({
  page,
}) => {
  await page.goto("./components/#atlas-motion");
  const lab = page.locator("#motion-guide-preview");
  for (const style of [
    "minimal-saas",
    "data-terminal",
    "editorial-luxe",
    "maximalist",
  ]) {
    await lab.getByLabel("Preview style").selectOption(style);
    for (const mode of ["dark", "light"]) {
      await lab.getByLabel("Preview appearance").selectOption(mode);
      await expect(lab.locator("[data-motion-browser]")).toHaveAttribute(
        "data-ui",
        style,
      );
      await expect(lab.locator("[data-motion-browser]")).toHaveAttribute(
        "data-mode",
        mode,
      );
      await expect(lab.locator("[data-motion-preview]")).toHaveAttribute(
        "data-configuration-motion-state",
        "idle",
      );
      const action = lab.getByRole("button", { name: /queue release/i });
      await action.hover();
      await action.focus();
      await expect(action).toBeFocused();
      const result = await new AxeBuilder({ page })
        .include("#motion-guide-preview")
        .analyze();
      expect(
        result.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map(({ target }) => target),
        })),
        `${style}/${mode}`,
      ).toEqual([]);
    }
  }
  const trigger = lab.getByRole("button", { name: /preview confirmation/i });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Publish this preview?" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

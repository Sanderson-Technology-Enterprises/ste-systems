import { expect, test } from "@playwright/test";

test("homepage presents a concise developer portal", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("./");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Design every layer. Keep one interface.",
    }),
  ).toBeVisible();
  await expect(page.locator(".brand-banner")).toHaveCount(0);
  await expect(page.locator(".configuration-console")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open lab" })).toHaveAttribute(
    "href",
    "/ste-systems/lab/",
  );
  await expect(
    page.getByRole("heading", {
      name: "Use one library or combine all three.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Install the complete stack." }),
  ).toBeVisible();
});

test("lab route retains the complete configurable experience", async ({
  page,
}) => {
  await page.goto("./lab/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Configure the system. Inspect every layer.",
    }),
  ).toBeVisible();
  await expect(page.locator(".configuration-console")).toBeVisible();

  const menu = page.getByRole("button", { name: "Open lab sections" });
  await expect(menu).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeHidden();
  await menu.click();
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Integration" }),
  ).toBeVisible();
});

test("lab configuration controls remain available while the page scrolls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./lab/");

  const controls = page.locator(".configuration-shell");
  await controls.scrollIntoViewIfNeeded();
  const initialTop = await controls.evaluate(
    (element) => element.getBoundingClientRect().top,
  );

  await page.locator("#interactions").scrollIntoViewIfNeeded();
  const scrolledState = await controls.evaluate((element) => ({
    position: getComputedStyle(element).position,
    top: element.getBoundingClientRect().top,
    viewportHeight: window.innerHeight,
  }));

  expect(scrolledState.position).toBe("sticky");
  expect(scrolledState.top).toBeGreaterThanOrEqual(0);
  expect(scrolledState.top).toBeLessThanOrEqual(initialTop + 2);
  expect(scrolledState.top).toBeLessThan(scrolledState.viewportHeight);

  await page.getByLabel(/03.*Palette/).selectOption("ocean-steel");
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-theme",
    "ocean-steel",
  );
});

test("component route exposes the searchable atlas", async ({ page }) => {
  await page.goto(
    "./components/?layout=editorial&ui=cyberpunk&theme=ocean-steel&mode=light",
  );

  await expect(
    page.getByRole("heading", { level: 1, name: /Component Atlas/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search components and contracts" }),
  ).toBeVisible();
  await expect(page.locator(".configuration-console")).toHaveCount(0);
  await expect(page.locator(".atlas-experience")).toHaveAttribute(
    "data-theme",
    "midnight-gold",
  );
  await expect(page.locator("[data-atlas-specimen]").first()).toBeVisible();
});

test("homepage and lab remain collision-free across the responsive matrix", async ({
  page,
}) => {
  const viewports = [
    { width: 305, height: 568 },
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1248, height: 800 },
    { width: 1249, height: 800 },
    { width: 1366, height: 768 },
    { width: 1440, height: 1000 },
  ];
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const route of ["./", "./lab/", "./components/"]) {
      await page.goto(route);
      await expect(
        page.locator(route === "./components/" ? "h1#atlas-title" : "h1"),
      ).toHaveCount(1);
      const mainContent = page.locator("main#main-content");
      await expect(mainContent).toHaveCount(1);
      const skipLink = page.getByRole("link", { name: "Skip to main content" });
      await skipLink.focus();
      await expect(skipLink).toBeFocused();
      await skipLink.press("Enter");
      await expect(mainContent).toBeFocused();

      const menu = page.getByRole("button", {
        name: /Open menu|Open lab sections|Open atlas sections/,
      });
      if (await menu.isVisible()) {
        await menu.click();
        await expect(page.locator(".navigation-toggle")).toHaveAttribute(
          "aria-expanded",
          "true",
        );
      }

      await page.evaluate(() => document.fonts.ready);

      const headerHealth = await page
        .locator(".site-header")
        .evaluate((header) => {
          const brand = header.querySelector<HTMLElement>(".brand");
          const navigation =
            header.querySelector<HTMLElement>(".site-navigation");
          const visibleLabels = Array.from(
            header.querySelectorAll<HTMLElement>(
              ".brand-copy, .navigation-toggle, .navigation-link, .navigation-actions .site-action",
            ),
          ).filter((label) => label.getClientRects().length > 0);
          const overflowingLabels = visibleLabels
            .map((label) => ({
              label:
                label.getAttribute("aria-label") ??
                label.textContent?.trim() ??
                "unlabeled header control",
              overflow: label.scrollWidth - label.clientWidth,
            }))
            // Integer DOM metrics can differ by one CSS pixel after font and
            // device-pixel rounding without producing visible clipping.
            .filter(({ overflow }) => overflow > 1);

          return {
            brandClearsNavigation:
              brand !== null && navigation !== null
                ? brand.getBoundingClientRect().right <=
                  navigation.getBoundingClientRect().left
                : false,
            labelsFit: overflowingLabels.length === 0,
            noHorizontalOverflow:
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
            overflowingLabels,
          };
        });

      expect(
        headerHealth,
        `${route} at ${viewport.width}x${viewport.height}`,
      ).toEqual({
        brandClearsNavigation: true,
        labelsFit: true,
        noHorizontalOverflow: true,
        overflowingLabels: [],
      });

      if (route === "./lab/" && viewport.width === 768) {
        const labHeroColumnCount = await page
          .locator(".lab-hero")
          .evaluate(
            (hero) =>
              getComputedStyle(hero)
                .gridTemplateColumns.split(/\s+/)
                .filter(Boolean).length,
          );
        expect(labHeroColumnCount).toBe(1);
      }
    }
  }

  expect(runtimeErrors).toEqual([]);
});

test("legacy shared configurations redirect to the lab", async ({ page }) => {
  await page.goto("./?layout=split-screen&ui=cyberpunk#workbench");

  await expect(page).toHaveURL(
    /\/ste-systems\/lab\/\?layout=split-screen&ui=cyberpunk&theme=midnight-gold&mode=dark#workbench$/,
  );
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-ly-layout",
    "split-screen",
  );
});

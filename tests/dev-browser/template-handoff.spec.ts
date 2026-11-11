import { expect, test } from "@playwright/test";

test("industrial file, visual link, comparison and printed brief share the selected template", async ({
  page,
  browser,
}) => {
  await page.goto("/lab/?template=industrial");
  const preview = page.frameLocator('iframe[title="Website design preview"]');
  await preview
    .getByRole("button", { name: "Operator panel", exact: true })
    .click();
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await page
    .getByRole("button", { name: "Save as option A", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save as option B", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare options", exact: true })
    .click();
  for (const option of ["A", "B"])
    await expect(
      page
        .frameLocator(`iframe[title="Option ${option} preview"]`)
        .locator("h1"),
    ).toHaveText("Line A operator panel");
  await page.getByRole("button", { name: "Use option A", exact: true }).click();
  await page
    .getByRole("button", { name: "Review and save", exact: true })
    .click();
  await page.getByLabel("What you like").fill("Keep the operator controls");
  const pendingFile = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download design file", exact: true })
    .click();
  const file = await (await pendingFile).path();
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await fresh.goto(new URL("/lab/", page.url()).href);
  await fresh.getByLabel("Open design file").setInputFiles(file!);
  await expect(
    fresh
      .frameLocator('iframe[title="Website design preview"]')
      .getByRole("heading", { name: "Line A operator panel", exact: true }),
  ).toBeVisible();
  await fresh
    .getByRole("button", { name: "Review and save", exact: true })
    .click();
  await expect(fresh.getByLabel("What you like")).toHaveValue(
    "Keep the operator controls",
  );
  await context.close();
  await page
    .getByRole("button", { name: "Copy visual link", exact: true })
    .click();
  const link = await page.getByLabel("Visual link").inputValue();
  expect(link).not.toContain("operator controls");
  const shared = await browser.newContext();
  const sharedPage = await shared.newPage();
  await sharedPage.goto(link);
  await expect(
    sharedPage
      .frameLocator('iframe[title="Website design preview"]')
      .getByRole("heading", { name: "Line A operator panel", exact: true }),
  ).toBeVisible();
  await shared.close();
  const revision = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("ste-systems:design-plan:v1")!).revision,
  );
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printCalled = "true";
    };
  });
  await page
    .getByRole("button", {
      name: "Print design preference brief / PDF",
      exact: true,
    })
    .click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-print-called",
    "true",
    { timeout: 30000 },
  );
  await expect(page.locator(".studio-brief")).toContainText(
    "Industrial dashboard / PLC · operator",
  );
  await expect(page.locator(".studio-brief pre")).toContainText(
    `"revision": ${revision}`,
  );
  await expect(page.locator(".studio-brief img")).toHaveAttribute(
    "src",
    /^data:image\/png/,
  );
});

test("phone chooser uses compact contained rows and returns to preview with keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab/?choose=type");
  await expect(page.locator(".website-template-card")).toHaveCount(6);
  const firstCard = page.locator(".website-template-card").first();
  const thumbnail = (await firstCard
    .locator(".studio-template-thumbnail")
    .boundingBox())!;
  const label = (await firstCard.locator("h3").boundingBox())!;
  expect(thumbnail.x + thumbnail.width).toBeLessThanOrEqual(label.x);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", {
      name: "Start with Inventory management",
      exact: true,
    })
    .click();
  await expect(page.locator("#lab-title")).toBeFocused();
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  await expect(frame.locator('[data-template="inventory"]')).toBeVisible();
  await page
    .getByRole("button", { name: "Phone preview", exact: true })
    .click();
  expect(await frame.locator("body").evaluate(() => innerWidth)).toBe(390);
  expect(
    await frame
      .locator("body")
      .evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Change website type", exact: true })
    .last()
    .click();
  await page
    .getByRole("button", { name: "Continue your saved plan", exact: true })
    .click();
  await expect(frame.locator('[data-template="inventory"]')).toBeVisible();
});

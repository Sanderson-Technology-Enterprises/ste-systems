import { expect, test } from "@playwright/test";

test("template links commit once and preserve a returning client's style and notes", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.has("template")).toBe(false);
  await page.evaluate(() => {
    const key = "ste-systems:design-plan:v1";
    const plan = JSON.parse(localStorage.getItem(key)!);
    plan.design.configuration.ui = "art-deco";
    plan.design.motion.entrance = "blueprint";
    plan.notes.requests = "Keep my private note";
    localStorage.setItem(key, JSON.stringify(plan));
  });
  await page.goto("/lab/?template=inventory");
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("ste-systems:design-plan:v1")!),
  );
  expect(saved.preview.scenario).toBe("inventory");
  expect(saved.design.configuration.ui).toBe("art-deco");
  expect(saved.design.motion.entrance).toBe("blueprint");
  expect(saved.notes.requests).toBe("Keep my private note");
  await page.reload();
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("ste-systems:design-plan:v1")!)
          .revision,
    ),
  ).toBe(saved.revision);
});

test("an unselected fresh plan is not autosaved", async ({ page }) => {
  await page.goto("/lab/");
  await expect(
    page.getByRole("heading", {
      name: "Choose your website type",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("ste-systems:design-plan:v1"),
    ),
  ).toBeNull();
});

test("home presents six rendered starters before technical exploration", async ({
  page,
}) => {
  await page.goto("/");
  const gallery = page.getByRole("region", {
    name: "Choose your website type",
    exact: true,
  });
  await expect(gallery.locator(".website-template-card")).toHaveCount(6);
  await expect(gallery.locator("iframe")).toHaveCount(6);
  for (const link of await gallery.getByRole("link").all())
    await expect(link).toBeInViewport({ ratio: 0.75 });
  const starterTop = (await gallery.boundingBox())!.y;
  expect(starterTop).toBeLessThan(
    (await page.locator(".home-observatory").boundingBox())!.y,
  );
  await gallery
    .getByRole("link", { name: "Start with Newsletter", exact: true })
    .click();
  await expect(
    page
      .frameLocator('iframe[title="Website design preview"]')
      .locator('[data-template="newsletter"]'),
  ).toBeVisible();
});

test("chooser replaces editing and template changes and start over are undoable", async ({
  page,
}) => {
  await page.goto("/lab/?choose=type");
  await page
    .getByRole("button", { name: "Start with Marketing site", exact: true })
    .click();
  await page.getByLabel("Business name", { exact: true }).fill("Client name");
  await page
    .getByRole("button", { name: "Change website type", exact: true })
    .first()
    .click();
  await expect(
    page.locator('iframe[title="Website design preview"]'),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Start with Inventory management",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Business name", { exact: true })).toHaveValue(
    "Client name",
  );
  await page
    .getByRole("button", { name: "Review and save", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page
      .frameLocator('iframe[title="Website design preview"]')
      .locator('[data-template="business"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start over", exact: true }).click();
  await page
    .getByRole("button", { name: "Start with Blog", exact: true })
    .click();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByLabel("Business name", { exact: true })).toHaveValue(
    "",
  );
  await page
    .getByRole("button", { name: "Review and save", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByLabel("Business name", { exact: true })).toHaveValue(
    "Client name",
  );
});

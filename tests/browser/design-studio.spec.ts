import { expect, test, type Page } from "@playwright/test";

/** Opens a client decision group through desktop navigation or the mobile drawer. */
async function group(page: Page, name: string) {
  const opener = page.getByRole("button", {
    name: "Open settings",
    exact: true,
  });
  if (await opener.isVisible()) await opener.click();
  await page.getByRole("button", { name, exact: true }).last().click();
}

test("studio preserves complete selections after reload and portable fresh-context import", async ({
  page,
  browser,
}) => {
  await page.goto("lab/");
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  await group(page, "Page layout");
  await page.getByLabel("Content width", { exact: true }).selectOption("wide");
  await group(page, "Effects");
  await page.getByRole("button", { name: "Expressive", exact: true }).click();
  await page.reload();
  await group(page, "Page layout");
  await expect(page.getByLabel("Content width", { exact: true })).toHaveValue(
    "wide",
  );
  await group(page, "Review and save");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download design file", exact: true })
    .click();
  const file = await (await downloadPromise).path();
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await fresh.goto(
    new URL("lab/", test.info().project.use.baseURL as string).href,
  );
  await group(fresh, "Review and save");
  await fresh.getByLabel("Open design file").setInputFiles(file!);
  await expect(fresh.getByText(/Design file opened/)).toBeVisible();
  await group(fresh, "Page layout");
  await expect(fresh.getByLabel("Content width", { exact: true })).toHaveValue(
    "wide",
  );
  await context.close();
});

test("client scenarios provide real local sample outcomes", async ({
  page,
}) => {
  await page.goto("lab/");
  await group(page, "Preview");
  await page.getByLabel("Preview scenario").selectOption("storefront");
  if (
    await page
      .getByRole("button", { name: "Show preview", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Show preview", exact: true })
      .click();
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  await frame
    .getByRole("button", { name: "Add Field notebook to cart" })
    .click();
  await expect(frame.getByRole("status")).toContainText("Added Field notebook");
  await frame.getByRole("button", { name: /View cart/ }).click();
  await expect(
    frame.getByRole("heading", { name: "Your sample cart" }),
  ).toBeVisible();
});

test("saved alternatives remain independent and compare the same viewport", async ({
  page,
}) => {
  await page.goto("lab/");
  await group(page, "Compare");
  await page
    .getByRole("button", { name: "Save as option A", exact: true })
    .click();
  await group(page, "Style and colors");
  await page
    .getByLabel("Visual style", { exact: true })
    .selectOption("art-deco");
  await group(page, "Compare");
  await page
    .getByRole("button", { name: "Save as option B", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare options", exact: true })
    .click();
  await expect(page.getByText(/ui: minimal-saas → art-deco/)).toBeVisible();
  await page.getByRole("button", { name: "Use option A", exact: true }).click();
  await group(page, "Style and colors");
  await expect(page.getByLabel("Visual style", { exact: true })).toHaveValue(
    "minimal-saas",
  );
});

test("device controls change the actual preview viewport and icons render", async ({
  page,
}) => {
  await page.goto("lab/");
  await page
    .getByRole("button", { name: "Phone preview", exact: true })
    .click();
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  await expect(frame.locator("[data-scenario-root]")).toBeVisible();
  const iframe = page.locator('iframe[title="Website design preview"]');
  await expect(iframe).toHaveCSS("width", "390px");
  await expect(frame.locator("usk-icon").first().locator("svg")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("business inquiry and booking request show validation and honest sample confirmation", async ({
  page,
}) => {
  await page.goto("lab/");
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  await frame
    .getByRole("button", { name: /Request a quote/ })
    .first()
    .click();
  await frame.getByRole("button", { name: "Try sample inquiry" }).click();
  await expect(frame.getByText(/Enter a name and a valid email/)).toBeVisible();
  await frame.getByLabel("Your name").fill("Example Client");
  await frame.getByLabel("Email address").fill("client@example.com");
  await frame.getByRole("button", { name: "Try sample inquiry" }).click();
  await expect(frame.getByRole("status")).toContainText(
    "No message has been sent",
  );
  await group(page, "Preview");
  await page.getByLabel("Preview scenario").selectOption("booking");
  await frame
    .getByRole("button", { name: "Explore this service" })
    .first()
    .click();
  await frame.getByRole("button", { name: "Try sample request" }).click();
  await expect(frame.getByText(/Enter a name and a valid email/)).toBeVisible();
  await frame.getByLabel("Your name").fill("Example Client");
  await frame.getByLabel("Email address").fill("client@example.com");
  await frame.getByRole("button", { name: "Try sample request" }).click();
  await expect(frame.getByText("No appointment was booked")).toBeVisible();
});

test("portal search and detail stay local and never imply approval", async ({
  page,
}) => {
  await page.goto("lab/");
  await group(page, "Preview");
  await page.getByLabel("Preview scenario").selectOption("portal");
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  await frame.getByLabel("Search records").fill("missing");
  await expect(frame.getByText("No matching records")).toBeVisible();
  await frame.getByLabel("Search records").fill("Website");
  await frame.getByRole("button", { name: "Open Website direction" }).click();
  await frame.getByRole("button", { name: "Try marking reviewed" }).click();
  await expect(frame.getByRole("status")).toContainText(
    "not been approved or submitted",
  );
});

test("invalid files preserve the draft and visual links omit private project content", async ({
  page,
  browser,
}) => {
  await page.goto("lab/");
  await group(page, "Preview");
  await page.getByLabel("Business name").fill("Private Example Co");
  await group(page, "Review and save");
  await page.getByLabel("What you like").fill("Private consultation note");
  await page.getByLabel("Open design file").setInputFiles({
    name: "invalid.ste-design.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":99}'),
  });
  await expect(page.getByText(/working design is unchanged/)).toBeVisible();
  await group(page, "Preview");
  await expect(page.getByLabel("Business name")).toHaveValue(
    "Private Example Co",
  );
  await group(page, "Review and save");
  await page.getByRole("button", { name: "Copy visual link" }).click();
  const link = await page.getByLabel("Visual link").inputValue();
  expect(link).not.toContain("Private");
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await fresh.goto(link);
  await group(fresh, "Preview");
  await expect(fresh.getByLabel("Business name")).toHaveValue("");
  await context.close();
});

test("preview capture and printable brief refer to one revision", async ({
  page,
}) => {
  await page.goto("lab/");
  await group(page, "Review and save");
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printCalled = "true";
    };
  });
  const revision = Number(
    (await page.getByText(/Revision \d+ · Saved locally/).textContent())?.match(
      /Revision (\d+)/,
    )?.[1],
  );
  await page
    .getByRole("button", { name: "Print design preference brief / PDF" })
    .click();
  await expect(page.locator(".studio-notice")).toContainText("Brief prepared", {
    timeout: 30000,
  });
  await expect(page.locator("body")).toHaveAttribute(
    "data-print-called",
    "true",
  );
  await expect(page.locator(".studio-brief img")).toHaveAttribute(
    "src",
    /^data:image\/png/,
  );
  await expect(page.locator(".studio-brief pre")).toContainText(
    `"revision": ${revision}`,
  );
});

test("mobile settings return focus to preview and keep the design state", async ({
  page,
}) => {
  await page.goto("lab/");
  await page.getByRole("button", { name: "Open settings" }).click();
  await page
    .getByRole("button", { name: "Page layout", exact: true })
    .last()
    .click();
  await page.getByLabel("Content width", { exact: true }).selectOption("wide");
  await page.getByRole("button", { name: "Show preview" }).click();
  await expect(
    page.getByRole("button", { name: "Open settings" }),
  ).toBeFocused();
  await expect(
    page.locator('iframe[title="Website design preview"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByLabel("Content width", { exact: true })).toHaveValue(
    "wide",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("storage write failure keeps the working design and portable download", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === "ste-systems:design-plan:v1")
        throw new DOMException("Storage blocked", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.goto("lab/");
  await expect(page.getByText(/Not saved locally/)).toBeVisible();
  await group(page, "Preview");
  await page.getByLabel("Business name").fill("Working in memory");
  await group(page, "Review and save");
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download design file" }).click();
  const file = await promise;
  expect(file.suggestedFilename()).toMatch(/\.ste-design\.json$/);
  await group(page, "Preview");
  await expect(page.getByLabel("Business name")).toHaveValue(
    "Working in memory",
  );
});

test("gallery presents every visual style with rendered examples and palette swatches", async ({
  page,
}) => {
  await page.goto("lab/");
  await group(page, "Style and colors");
  await page.getByRole("button", { name: /Browse all 20 styles/ }).click();
  await expect(page.locator(".studio-gallery-card")).toHaveCount(20);
  await expect(
    page
      .locator(".studio-gallery-card")
      .first()
      .locator(".studio-gallery-swatch"),
  ).toHaveCount(3);
  await expect(
    page
      .locator(".studio-gallery-card")
      .first()
      .locator(".studio-style-description"),
  ).not.toBeEmpty();
  await expect(page.locator(".studio-gallery iframe").first()).toBeVisible();
});

test("random motion discovery saves a fixed effect and advanced timing survives reload", async ({
  page,
}) => {
  await page.goto("lab/");
  await group(page, "Effects");
  await page.getByRole("button", { name: "Surprise me" }).click();
  await page.getByText(/Advanced animation/).click();
  const selected = await page.getByLabel("Entrance effect").inputValue();
  expect(selected).not.toBe("random");
  await page.getByLabel("Delay (ms)").fill("125");
  await page.getByLabel("Delay (ms)").blur();
  await page.reload();
  await group(page, "Effects");
  await page.getByText(/Advanced animation/).click();
  await expect(page.getByLabel("Entrance effect")).toHaveValue(selected);
  await expect(page.getByLabel("Delay (ms)")).toHaveValue("125");
});

test("fullscreen preview restores its control after Escape", async ({
  page,
}) => {
  await page.goto("lab/");
  await page.getByRole("button", { name: "Fullscreen preview" }).click();
  await expect(
    page.getByRole("button", { name: "Exit fullscreen" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Fullscreen preview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fullscreen preview" }),
  ).toBeFocused();
});

test("the home and editor controls use published package icons", async ({
  page,
}) => {
  await page.goto("");
  await expect(
    page.locator('[data-hero-action="primary"] usk-icon svg'),
  ).toBeVisible();
  await page.goto("lab/");
  await expect(
    page.locator(".inspector-rail usk-icon svg").first(),
  ).toBeVisible();
});

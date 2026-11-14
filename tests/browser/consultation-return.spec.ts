import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** The public return remains visible during template discovery and after committing a starter. */
test("consultation return survives the template chooser and keyboard activation", async ({
  page,
}) => {
  await page.goto(
    "lab/?choose=type&source=customized-platforms&service=website-design-development",
  );
  const back = page.getByRole("link", {
    name: "Return to your consultation at Customized Platforms",
    exact: true,
  });
  await expect(back).toHaveAttribute(
    "href",
    "https://customizedplatforms.com/contact?context=website-design-development",
  );
  await page
    .getByRole("button", { name: "Start with Marketing site", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Change website type", exact: true }),
  ).toBeVisible();
  await expect(back).toBeVisible();
  await expect(back).toHaveClass(/interactive-surface/);
  const contrast = await new AxeBuilder({ page })
    .include('aside[aria-label="Your consultation"]')
    .withRules(["color-contrast"])
    .analyze();
  expect(contrast.violations).toEqual([]);
  await page.route(
    "https://customizedplatforms.com/contact?context=website-design-development",
    (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<h1>Consultation return fixture</h1>",
      }),
  );
  await back.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Consultation return fixture" }),
  ).toBeVisible();
});

/** Shared-direction cleanup must not erase the validated commercial source before the return component hydrates. */
test("consultation return survives shared-direction restoration and reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => {} },
    });
  });
  await page.goto("lab/?template=business");
  await page
    .getByRole("button", { name: "Review and save", exact: true })
    .last()
    .click();
  await page
    .getByRole("button", { name: "Copy visual link", exact: true })
    .click();
  const share = new URL(
    await page.getByLabel("Visual link", { exact: true }).inputValue(),
  );
  share.search =
    "source=customized-platforms&service=web-applications&email=private%40example.com";
  await page.goto(share.href);
  const back = page.getByRole("link", {
    name: "Return to your consultation at Customized Platforms",
    exact: true,
  });
  await expect(back).toHaveAttribute(
    "href",
    "https://customizedplatforms.com/contact?context=web-applications",
  );
  await expect(page).toHaveURL(
    /\?source=customized-platforms&service=web-applications$/,
  );
  await page.reload();
  await expect(back).toHaveAttribute(
    "href",
    "https://customizedplatforms.com/contact?context=web-applications",
  );
});

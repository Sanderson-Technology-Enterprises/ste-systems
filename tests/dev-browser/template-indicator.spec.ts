import { expect, test } from "@playwright/test";

test("development toolbar is absent from the editor and its preview", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  await expect(
    page.getByRole("heading", { name: "Website design studio", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open Next.js Dev Tools" }),
  ).toHaveCount(0);
  const preview = page.frameLocator('iframe[title="Website design preview"]');
  await expect(preview.locator("[data-scenario-root]")).toBeVisible();
  await expect(
    preview.getByRole("button", { name: "Open Next.js Dev Tools" }),
  ).toHaveCount(0);
});

test("home template icons hydrate without diagnostics and thumbnails have no toolbar", async ({
  page,
}) => {
  const diagnostics: string[] = [];
  page.on("console", (message) => {
    if (/hydration|hydrated|server rendered html/i.test(message.text()))
      diagnostics.push(message.text());
  });
  await page.goto("/");
  const gallery = page.getByRole("region", {
    name: "Choose your website type",
    exact: true,
  });
  await expect(page.locator(".site-header usk-icon svg").last()).toBeVisible();
  expect(diagnostics).toEqual([]);
  await expect(
    page.getByRole("button", { name: "Open Next.js Dev Tools" }),
  ).toHaveCount(0);
  const first = gallery.frameLocator(
    'iframe[title="Marketing site starter preview"]',
  );
  await gallery
    .locator('iframe[title="Marketing site starter preview"]')
    .scrollIntoViewIfNeeded();
  await expect(first.locator('[data-template="business"]')).toBeVisible({
    timeout: 15000,
  });
  await expect(
    first.getByRole("button", { name: "Open Next.js Dev Tools" }),
  ).toHaveCount(0);
});

test("preview handshake recovers when frames hydrate before their parent listener", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const listen = window.addEventListener.bind(window);
    window.addEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      if (type === "message")
        setTimeout(() => listen(type, listener, options), 1000);
      else listen(type, listener, options);
    }) as typeof window.addEventListener;
  });
  await page.goto("/");
  await expect(
    page
      .frameLocator('iframe[title="Marketing site starter preview"]')
      .locator('[data-template="business"]'),
  ).toBeVisible({ timeout: 5000 });
});

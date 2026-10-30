import { expect, test } from "@playwright/test";

test("configuration disclosure exposes form semantics and restores keyboard focus", async ({
  page,
}) => {
  await page.goto("lab/");
  const trigger = page.getByRole("button", { name: "Open lab configuration" });
  await expect(trigger).not.toHaveAttribute("aria-haspopup");
  await trigger.click();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("combobox", { name: "01 / Layout", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("successive copy results each update the live region", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => {} },
    });
  });
  await page.goto("components/");
  const block = page.locator('[data-guide-code="layout-install"]');
  const status = block.getByRole("status");
  await block.getByRole("button").click();
  await expect(status).toHaveText("Copied.");
  await status.evaluate((node) => {
    node.setAttribute("data-updates", "0");
    new MutationObserver(() =>
      node.setAttribute(
        "data-updates",
        String(Number(node.getAttribute("data-updates")) + 1),
      ),
    ).observe(node, { childList: true, subtree: true, characterData: true });
  });
  await block.getByRole("button").click();
  await expect(status).not.toHaveAttribute("data-updates", "0");
});

test("phone users can see all five guide choices and select them with the keyboard", async ({
  page,
}) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("components/");
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(5);
    for (const tab of await tabs.all()) {
      const box = await tab.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(12);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width - 12);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await tabs.first().focus();
    await page.keyboard.press("End");
    await expect(tabs.last()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/#atlas-react$/);
  }
});

test("native palette changes survive reload and omit the theme from copied markup", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (value: string) => {
          document.documentElement.dataset.clipboard = value;
        },
      },
    });
  });
  await page.goto("lab/");
  await page.getByRole("button", { name: "Open lab configuration" }).click();
  await page
    .getByRole("combobox", { name: "03 / Palette", exact: true })
    .selectOption("native");
  await page
    .getByRole("combobox", { name: "02 / Visual style", exact: true })
    .selectOption("bauhaus");
  await expect(page.locator(".lab-experience")).not.toHaveAttribute(
    "data-theme",
  );
  await page
    .getByRole("button", { name: "Copy configuration", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-clipboard",
    /data-ui="bauhaus"/,
  );
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-clipboard",
    /data-theme/,
  );
  await page
    .getByRole("button", { name: "Share configuration", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-clipboard",
    /theme=native/,
  );
  await page.reload();
  await expect(page.locator(".lab-experience")).toHaveAttribute(
    "data-ui",
    "bauhaus",
  );
  await expect(page.locator(".lab-experience")).not.toHaveAttribute(
    "data-theme",
  );
  await page.getByRole("button", { name: "Open lab configuration" }).click();
  await expect(
    page.getByRole("combobox", { name: "03 / Palette", exact: true }),
  ).toHaveValue("native");
  await page.getByRole("button", { name: "Reset configuration" }).click();
  await expect(page.locator(".lab-experience")).toHaveAttribute(
    "data-theme",
    "midnight-gold",
  );
});

test("the home page offers a client path, readable attribution, and compact brand images", async ({
  page,
}) => {
  await page.goto("");
  const serviceLink = page.locator(".hero-service-link");
  await expect(serviceLink).toHaveAttribute(
    "href",
    "https://customizedplatforms.com/",
  );
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page
        .locator(".brand-owner")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(12);
    await expect(page.locator(".brand-logo")).toHaveAttribute(
      "srcset",
      /ste-systems-logo-128.webp/,
    );
  }
  const gap = await page.locator("#client-systems").evaluate((el) => {
    const heading = el.querySelector(".section-heading")!;
    return (
      heading.nextElementSibling!.getBoundingClientRect().top -
      heading.getBoundingClientRect().bottom
    );
  });
  expect(gap).toBeLessThanOrEqual(80);
});

test("all five reference guides remain readable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("components/");
  await page
    .getByRole("link", { name: "Read all guides without interactive previews" })
    .click();
  for (const name of [
    "Layout Style CSS",
    "UI Style Kit CSS",
    "Interactive Surface CSS",
    "Motion Style CSS",
    "STE USK React",
  ]) {
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator("pre").last()).toContainText("useState");
  await expect(
    page.getByRole("link", { name: "View full Lab", exact: true }),
  ).toHaveAttribute("href", /\/lab\/$/);
  await context.close();
});

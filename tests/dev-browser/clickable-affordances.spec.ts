import { expect, test } from "@playwright/test";

/** All semantic action targets participate in the shared interaction system before activation. */
test("home, studio and component guides expose interactive surfaces on their clickable elements", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/lab/?template=business",
    "/components/",
    "/components/reference/",
  ]) {
    await page.goto(route);
    await expect(page.locator(".experience")).toBeVisible();
    const missing = await page
      .locator(".experience")
      .locator(
        'a[href], button, summary, input, select, textarea, [role="button"], [role="tab"], [role="link"]',
      )
      .evaluateAll((elements) =>
        elements
          .filter((e) => !e.classList.contains("interactive-surface"))
          .map((e) => ({
            tag: e.tagName,
            text: (e.textContent || e.getAttribute("aria-label") || "")
              .trim()
              .slice(0, 65),
            classes: e.className,
          })),
      );
    expect(missing, `missing surfaces on ${route}`).toEqual([]);
  }
});

test("guide disclosures show a pointer, keyboard focus and an honest open state", async ({
  page,
}) => {
  await page.goto("/lab/#install");
  const summary = page.getByText("Advanced library examples", { exact: true });
  await expect(summary).toHaveCSS("cursor", "pointer");
  const idle = await summary.evaluate((e) =>
    Number(getComputedStyle(e, "::before").opacity),
  );
  await summary.hover();
  await expect
    .poll(() =>
      summary.evaluate((e) => Number(getComputedStyle(e, "::before").opacity)),
    )
    .toBeGreaterThan(idle);
  await summary.focus();
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(summary.locator("..")).toHaveAttribute("open", "");
  const outline = await summary.evaluate(
    (e) => getComputedStyle(e).outlineStyle,
  );
  expect(outline).not.toBe("none");
});

test("cold guide bookmarks retain the browser-opened disclosure without hydration diagnostics", async ({
  page,
}) => {
  const diagnostics: string[] = [];
  page.on("console", (message) => {
    if (/hydration|hydrated|server rendered html/i.test(message.text()))
      diagnostics.push(message.text());
  });
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.continue();
  });
  await page.goto("/lab/#install");
  await expect(page.locator(".studio-reference")).toHaveAttribute("open", "");
  await expect(
    page.getByRole("heading", {
      name: "Install one package or the complete stack.",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Style and colors", exact: true })
    .click();
  expect(diagnostics).toEqual([]);
});

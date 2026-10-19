import { expect, test } from "@playwright/test";

/** Keeps the private toolkit visible without advertising inaccessible destinations. */
test("client systems showcase private foundations with public company links", async ({
  page,
}) => {
  await page.goto("./");
  const section = page.getByRole("region", {
    name: "Systems built for client applications.",
  });
  for (const name of ["STE USK React", "STE-Core", "STE-SDK"]) {
    await expect(
      section.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await expect(section.locator("article a")).toHaveCount(0);
  await expect(section.getByRole("link")).toHaveCount(2);
  for (const [name, href] of [
    ["Explore Customized Platforms", "https://customizedplatforms.com/"],
    [
      "Visit Sanderson Technology Enterprises LLC",
      "https://sandersontechnologyenterprises.com/",
    ],
  ]) {
    const link = section.getByRole("link", { name });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
  await expect(
    page.getByRole("link", { name: "Client systems", exact: true }),
  ).toHaveAttribute("href", "#client-systems");
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const cards = await section.locator("article").evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y, right: rect.right };
      }),
    );
    expect(cards).toHaveLength(3);
    expect(cards.every((card) => card.x >= 0 && card.right <= width)).toBe(
      true,
    );
    if (width === 390) expect(cards[1].y).toBeGreaterThan(cards[0].y);
    else expect(Math.abs(cards[1].y - cards[0].y)).toBeLessThan(2);
  }
  await page.goto("./components/#atlas-react");
  const panel = page.getByRole("tabpanel", {
    name: "STE USK React",
    exact: true,
  });
  await expect(panel.getByRole("link")).toHaveCount(0);
  await expect(panel.getByRole("navigation")).toHaveCount(0);
  await expect(panel.getByText(/STE-Core and STE-SDK/)).toBeVisible();
  await expect(
    panel.getByRole("textbox", { name: "Project name" }),
  ).toBeVisible();
});

import { expect, test, type Locator } from "@playwright/test";

/** Reports words whose text fragments cross line boundaries, excluding legal punctuation breaks. */
async function splitWords(target: Locator) {
  return target.evaluateAll((elements) => {
    const broken: string[] = [];
    for (const element of elements) {
      if (!element.getBoundingClientRect().width) continue;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (const match of node.textContent!.matchAll(/[\p{L}\p{N}]+/gu)) {
          const range = document.createRange();
          range.setStart(node, match.index!);
          range.setEnd(node, match.index! + match[0].length);
          if (range.getClientRects().length > 1) broken.push(match[0]);
        }
      }
    }
    return broken;
  });
}

test("brand and diagram labels keep complete words across narrow and desktop widths", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".home-observatory-core small")).toBeAttached();
  for (const width of [280, 320, 390, 768, 1345, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await splitWords(
        page.locator(
          ".brand-title, .brand-owner, .home-observatory-core small",
        ),
      ),
      `words at ${width}px`,
    ).toEqual([]);
    for (const label of await page
      .locator(".brand-title, .brand-owner, .home-observatory-core small")
      .all()) {
      const contained = await label.evaluate((e) => {
        const range = document.createRange();
        range.selectNodeContents(e);
        const text = range.getBoundingClientRect(),
          box = e.getBoundingClientRect();
        return text.left >= box.left - 1 && text.right <= box.right + 1;
      });
      expect(contained, `label fits its slot at ${width}px`).toBe(true);
    }
  }
});

test("labeled action icons are larger than adjacent text in the editor and live preview", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  const buttons = page.locator(".inspector-groups button");
  await expect(
    buttons.first().locator("usk-icon").locator("svg"),
  ).toBeVisible();
  for (const button of await buttons.all()) {
    const size = await button.evaluate((e) => ({
      icon: e.querySelector("usk-icon")!.getBoundingClientRect().width,
      font: parseFloat(getComputedStyle(e).fontSize),
    }));
    expect(size.icon).toBeGreaterThanOrEqual(size.font * 1.4);
  }
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  const action = frame.getByRole("button", {
    name: "Request a quote",
    exact: true,
  });
  await expect(action.locator("usk-icon").locator("svg")).toBeVisible();
  const size = await action.evaluate((e) => ({
    icon: e.querySelector("usk-icon")!.getBoundingClientRect().width,
    font: parseFloat(getComputedStyle(e).fontSize),
  }));
  expect(size.icon).toBeGreaterThanOrEqual(size.font * 1.4);
});

test("icon family and treatment belong to Style and colors and remain saved", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  await page
    .getByRole("button", { name: "Style and colors", exact: true })
    .click();
  await page
    .getByLabel("Icon family", { exact: true })
    .selectOption("art-deco");
  await page
    .getByLabel("Icon treatment", { exact: true })
    .selectOption("monochrome");
  await page.getByRole("button", { name: "Effects", exact: true }).click();
  await expect(page.getByLabel("Icon family", { exact: true })).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("button", { name: "Style and colors", exact: true })
    .click();
  await expect(page.getByLabel("Icon family", { exact: true })).toHaveValue(
    "art-deco",
  );
  await expect(page.getByLabel("Icon treatment", { exact: true })).toHaveValue(
    "monochrome",
  );
  const motion = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("ste-systems:design-plan:v1")!).design
        .motion,
  );
  await page
    .getByRole("button", { name: "Reset appearance", exact: true })
    .click();
  await expect(page.getByLabel("Icon family", { exact: true })).toHaveValue(
    "auto",
  );
  await expect(page.getByLabel("Icon treatment", { exact: true })).toHaveValue(
    "themed",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("ste-systems:design-plan:v1")!).design
          .motion,
    ),
  ).toEqual(motion);
});

test("preview words stay intact and long installation tokens have their own horizontal scroll", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  await page
    .getByLabel("Business name", { exact: true })
    .fill("Lakeshore Manufacturing Solutions");
  await page
    .getByLabel("Headline", { exact: true })
    .fill("Personalization for thoughtful manufacturing.");
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(frame.locator("h1")).toHaveText(
      "Personalization for thoughtful manufacturing.",
    );
    expect(
      await splitWords(frame.locator("h1, h2, h3, p, button, strong")),
    ).toEqual([]);
    const readable = await frame.locator("h1").evaluate((e) => {
      const range = document.createRange();
      range.selectNodeContents(e);
      const right = Math.max(
        ...[...range.getClientRects()].map((rect) => rect.right),
      );
      const root = document.documentElement;
      return {
        right,
        width: innerWidth,
        scroll: root.scrollWidth,
        overflow: getComputedStyle(root).overflowX,
        bodyOverflow: getComputedStyle(document.body).overflowX,
      };
    });
    expect(
      readable.right <= readable.width ||
        (readable.scroll >= readable.right &&
          readable.overflow !== "clip" &&
          readable.bodyOverflow !== "clip"),
      `complete text remains reachable at ${width}px: ${JSON.stringify(readable)}`,
    ).toBe(true);
  }
  await page.goto("/");
  await page.setViewportSize({ width: 320, height: 900 });
  const command = page.locator(".quick-start-command pre").first();
  await expect(command).toBeAttached();
  expect(await splitWords(command)).toEqual([]);
  expect(await command.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(
    true,
  );
  await expect(command).toHaveCSS("overflow-x", "auto");
});

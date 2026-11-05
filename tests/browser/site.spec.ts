import { openWorkbenchGroup, showAdvancedExamples } from "./workbench-helpers";
import { expect, type Page, test } from "@playwright/test";

const resourceUrls = [
  "https://github.com/Foscat/Layout-Style-CSS",
  "https://github.com/Foscat/Layout-Style-CSS/wiki",
  "https://www.npmjs.com/package/layout-style-css",
  "https://foscat.github.io/Layout-Style-CSS/",
  "https://github.com/Foscat/ui-style-kit-css",
  "https://github.com/Foscat/ui-style-kit-css/wiki",
  "https://www.npmjs.com/package/ui-style-kit-css",
  "https://foscat.github.io/ui-style-kit-css/",
  "https://github.com/Foscat/Interactive-Surface-CSS",
  "https://github.com/Foscat/Interactive-Surface-CSS/wiki",
  "https://www.npmjs.com/package/interactive-surface-css",
  "https://foscat.github.io/Interactive-Surface-CSS/",
];

const configurationStorageKey = "interface-systems-lab:configuration:v1";
const companyUrl = "https://sandersontechnologyenterprises.com/";
const canonicalUrl = "https://stesystems.com/";
const labUrl = `${canonicalUrl}lab/`;
const corporateOrganizationId = `${companyUrl}#organization`;
const repositoryUrl =
  "https://github.com/Sanderson-Technology-Enterprises/ste-systems";
const socialImageUrl = `${canonicalUrl}ste-systems-social-preview.png`;
const socialImageAlt =
  "STE Systems: four CSS layers for structure, appearance, interaction, and motion. Motion Style CSS is the newest addition.";
const websiteId = `${canonicalUrl}#website`;
const webpageId = `${canonicalUrl}#webpage`;
const labWebpageId = `${labUrl}#webpage`;
const applicationId = `${labUrl}#application`;
const packagesId = `${canonicalUrl}#packages`;

type ExpectedConfiguration = {
  layout: string;
  ui: string;
  theme: string;
  mode: string;
};

type StructuredDataNode = {
  "@id"?: string;
  "@type"?: string;
  [key: string]: unknown;
};

const defaultConfiguration: ExpectedConfiguration = {
  layout: "bento",
  ui: "minimal-saas",
  theme: "midnight-gold",
  mode: "dark",
};

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

type RgbaColor = RgbColor & { alpha: number };

function parseComputedRgb(value: string): RgbaColor {
  const components = value.match(/[\d.]+/g)?.map(Number);
  if (components === undefined || components.length < 3) {
    throw new Error(`Unable to parse computed color: ${value}`);
  }

  const [rawRed, rawGreen, rawBlue, alpha = 1] = components;
  if (
    rawRed === undefined ||
    rawGreen === undefined ||
    rawBlue === undefined ||
    alpha < 0 ||
    alpha > 1
  ) {
    throw new Error(`Invalid computed color, received: ${value}`);
  }

  // Chromium serializes color-mix() results as normalized color(srgb) channels.
  const channelScale = value.startsWith("color(srgb ") ? 255 : 1;
  const red = rawRed * channelScale;
  const green = rawGreen * channelScale;
  const blue = rawBlue * channelScale;

  return { red, green, blue, alpha };
}

/** Composites a computed CSS color over an opaque rendered backdrop. */
function compositeColor(color: RgbaColor, backdrop: RgbColor): RgbColor {
  return {
    red: color.red * color.alpha + backdrop.red * (1 - color.alpha),
    green: color.green * color.alpha + backdrop.green * (1 - color.alpha),
    blue: color.blue * color.alpha + backdrop.blue * (1 - color.alpha),
  };
}

function relativeLuminance(color: RgbColor): number {
  const linearize = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * linearize(color.red) +
    0.7152 * linearize(color.green) +
    0.0722 * linearize(color.blue)
  );
}

function contrastRatio(
  foreground: string,
  background: string | readonly string[],
): number {
  const backgroundLayers = Array.isArray(background)
    ? background
    : [background];
  const effectiveBackground = [...backgroundLayers]
    .reverse()
    .reduce<RgbColor>(
      (backdrop, layer) => compositeColor(parseComputedRgb(layer), backdrop),
      { red: 255, green: 255, blue: 255 },
    );
  const effectiveForeground = compositeColor(
    parseComputedRgb(foreground),
    effectiveBackground,
  );
  const foregroundLuminance = relativeLuminance(effectiveForeground);
  const backgroundLuminance = relativeLuminance(effectiveBackground);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

async function expectRootConfiguration(
  page: Page,
  configuration: ExpectedConfiguration,
) {
  const root = page.locator("[data-workbench-preview]");

  await expect(root).toHaveAttribute("data-ly-layout", configuration.layout);
  await expect(root).toHaveAttribute("data-ui", configuration.ui);
  await expect(root).toHaveAttribute("data-theme", configuration.theme);
  await expect(root).toHaveAttribute("data-mode", configuration.mode);
  await expect(root).not.toHaveAttribute("data-layout", /.+/);
}

async function readStoredConfiguration(page: Page) {
  return page.evaluate((storageKey) => {
    const value = window.localStorage.getItem(storageKey);
    return value === null ? null : (JSON.parse(value) as unknown);
  }, configurationStorageKey);
}

async function openLabConfiguration(page: Page) {
  await openWorkbenchGroup(page, "Appearance");
}

test.beforeEach(async ({ page }) => {
  // Dock-specific cases start at desktop; responsive cases explicitly resize.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./lab/");
});

/** Keeps Lab hero actions on the UI kit's padded, centered button contract. */
test("workbench view controls retain UI-kit geometry", async ({ page }) => {
  for (const name of [
    "Component showcase",
    "Application workspace",
    "Layout primitives",
  ]) {
    const button = page.getByRole("button", { name, exact: true });
    await expect(button).toHaveClass(/usk-button/);
    expect(
      await button.evaluate((e) =>
        parseFloat(getComputedStyle(e).paddingInlineStart),
      ),
    ).toBeGreaterThanOrEqual(3);
  }
});

/** Keeps the four site-owned orbit captions on one aligned row at desktop. */
test("workbench rail exposes every configuration group", async ({ page }) => {
  for (const name of [
    "Appearance",
    "Layout",
    "Interaction",
    "Motion",
    "Export",
  ])
    await expect(
      page
        .locator(".inspector-rail")
        .getByRole("button", { name, exact: true }),
    ).toBeVisible();
});

/**
 * Guards package-owned heading typography against Lab-specific CSS overrides.
 * A plain heading in the same configured root supplies the library baseline.
 */
test("preview headings use the selected UI kit typography", async ({
  page,
}) => {
  const result = await page
    .locator("[data-workbench-preview]")
    .evaluate((root) => {
      const h = root.querySelector("h3")!;
      const ref = document.createElement("h3");
      ref.textContent = "Reference";
      root.append(ref);
      const read = (e: Element) => {
        const s = getComputedStyle(e);
        return [s.fontFamily, s.fontSize, s.fontWeight, s.lineHeight];
      };
      const pair = [read(h), read(ref)];
      ref.remove();
      return pair;
    });
  expect(result[0]).toEqual(result[1]);
});

/** Verifies the compact Lab navigation keeps usable hit areas and visible icons. */
test("Lab header and inspector controls expose usable touch targets", async ({
  page,
}) => {
  for (const name of ["Open lab sections", "Collapse settings panel"]) {
    const box = (await page
      .getByRole("button", { name, exact: true })
      .boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function readStructuredData(page: Page): Promise<StructuredDataNode[]> {
  const nodes = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.flatMap((script) => {
        const value = JSON.parse(script.textContent ?? "{}") as {
          "@graph"?: Record<string, unknown>[];
        };
        return value["@graph"] ?? [value];
      }),
    );

  return nodes as StructuredDataNode[];
}

test("exported 404 retains branded ecosystem paint @cross-engine", async ({
  page,
}) => {
  const response = await page.goto("./missing-interface-proof");
  expect(response?.status()).toBe(404);

  const root = page.locator("main.not-found");
  await expect(root).toHaveAttribute(
    "data-ly-layout",
    defaultConfiguration.layout,
  );
  await expect(root).toHaveAttribute("data-ui", defaultConfiguration.ui);
  await expect(root).toHaveAttribute("data-theme", defaultConfiguration.theme);
  await expect(root).toHaveAttribute("data-mode", defaultConfiguration.mode);

  const returnAction = page.getByRole("link", {
    name: "Return to STE Systems",
  });
  const paint = await root.evaluate((element) => {
    const action = element.querySelector<HTMLElement>("a");
    if (action === null) {
      throw new Error("Expected the themed 404 return action.");
    }

    const rootStyle = getComputedStyle(element);
    const actionStyle = getComputedStyle(action);
    return {
      actionBackground: actionStyle.backgroundColor,
      actionColor: actionStyle.color,
      actionHeight: action.getBoundingClientRect().height,
      actionPaddingEnd: Number.parseFloat(actionStyle.paddingInlineEnd),
      actionPaddingStart: Number.parseFloat(actionStyle.paddingInlineStart),
      rootBackground: rootStyle.backgroundColor,
      rootColor: rootStyle.color,
      themeToken: rootStyle.getPropertyValue("--usk-bg-rgb").trim(),
    };
  });

  await expect(returnAction).toHaveAttribute("href", "/ste-systems/");
  expect(paint.themeToken).not.toBe("");
  expect(paint.rootBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(paint.actionBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(
    contrastRatio(paint.rootColor, paint.rootBackground),
  ).toBeGreaterThanOrEqual(4.5);
  expect(
    contrastRatio(paint.actionColor, paint.actionBackground),
  ).toBeGreaterThanOrEqual(4.5);
  expect(paint.actionHeight).toBeGreaterThanOrEqual(44);
  expect(paint.actionPaddingStart).toBeGreaterThan(0);
  expect(paint.actionPaddingEnd).toBeGreaterThan(0);
});

test("lab shell separates editor paint and preserves its guide destinations", async ({
  page,
}) => {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expectRootConfiguration(page, defaultConfiguration);
  for (const id of ["top", "workbench", "guides", "install", "libraries"])
    await expect(page.locator("#" + id)).toHaveCount(1);
  await expect(page.locator(".lab-editor-experience")).not.toHaveAttribute(
    "data-ui",
  );
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toHaveAttribute("href", "#main-content");
});

test("compact header discloses every navigation destination without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 799, height: 700 });
  await page.goto("./lab/");

  const menu = page.getByRole("button", { name: /lab sections/i });
  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });

  await expect(menu).toBeVisible();
  await expect(menu).toHaveAccessibleName("Open lab sections");
  await expect(menu).toHaveClass(/interactive-surface/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toBeHidden();
  await expect(page.getByText(/Scroll for more/i)).toHaveCount(0);

  await menu.click();

  await expect(menu).toHaveAccessibleName("Close lab sections");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(navigation).toBeVisible();
  for (const label of ["Top", "Workbench", "Guides", "Install", "Packages"]) {
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
  }
  await expect(
    page
      .locator("#primary-navigation-panel")
      .getByRole("link", { name: /Component guides/i }),
  ).toBeVisible();
  await expect(
    page
      .locator("#primary-navigation-panel")
      .getByRole("link", { name: /Back to overview/i }),
  ).toBeVisible();
  await expect(
    page
      .locator("#primary-navigation-panel")
      .getByRole("link", { name: /GitHub/i }),
  ).toBeVisible();
  await expect(
    page.locator("#primary-navigation-panel a.interactive-surface.site-action"),
  ).toHaveCount(8);

  const widthContract = await page.evaluate(() => {
    const primaryNavigation =
      document.querySelector<HTMLElement>(".primary-nav");
    if (primaryNavigation === null) {
      throw new Error("Primary navigation is missing.");
    }

    return {
      clientWidth: document.documentElement.clientWidth,
      navigationClientWidth: primaryNavigation.clientWidth,
      navigationOverflowX: getComputedStyle(primaryNavigation).overflowX,
      navigationScrollWidth: primaryNavigation.scrollWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(widthContract.scrollWidth).toBe(widthContract.clientWidth);
  expect(widthContract.navigationScrollWidth).toBeLessThanOrEqual(
    widthContract.navigationClientWidth,
  );
  expect(["auto", "scroll"]).not.toContain(widthContract.navigationOverflowX);
});

test("Lab configuration lives in one resizable inspector instead of a header popover", async ({
  page,
}) => {
  await expect(page.locator("#lab-configuration-panel")).toHaveCount(0);
  await expect(
    page.getByRole("separator", { name: "Resize settings panel" }),
  ).toBeVisible();
  await expect(page.locator("[data-inspector-panel]")).toBeVisible();
  await page
    .getByRole("button", { name: "Collapse settings panel", exact: true })
    .click();
  await expect(page.locator("[data-inspector-panel]")).toBeHidden();
  await page
    .getByRole("button", { name: "Expand settings panel", exact: true })
    .click();
  await expect(page.locator("[data-inspector-panel]")).toBeVisible();
});

test("header branding links home while navigation retains a full hit area", async ({
  page,
}) => {
  await expect(page.locator(".site-header .brand")).toHaveAttribute(
    "href",
    "/ste-systems/",
  );
  const button = page.getByRole("button", { name: "Open lab sections" });
  const box = (await button.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await button.click();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
});

test("featured three-library proof follows the active Lab configuration", async ({
  page,
}) => {
  await showAdvancedExamples(page, "Package integration proofs");
  await openWorkbenchGroup(page, "Appearance");
  await page
    .getByLabel("Color scheme", { exact: true })
    .selectOption("ocean-steel");
  const frame = page.frameLocator('[data-integration-fixture="all-canonical"]');
  await expect(frame.locator("[data-fixture-root]")).toHaveAttribute(
    "data-theme",
    "ocean-steel",
  );
});

test("dark home accents and cards keep their intended visual strength", async ({
  page,
}) => {
  await page.goto("./");
  const paint = await page.evaluate(() => {
    const alpha = (
      selector: string,
      property: "backgroundColor" | "borderTopColor",
    ) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing ${selector} dark-mode surface.`);
      const value = getComputedStyle(element)[property];
      return Number(value.match(/rgba?\([^)]*,\s*([\d.]+)\)$/)?.[1] ?? 1);
    };
    return {
      card: alpha(".package-overview-card", "backgroundColor"),
      ring: alpha(".home-orbit-ring-1", "borderTopColor"),
    };
  });
  expect(paint.card).toBeGreaterThanOrEqual(0.8);
  expect(paint.ring).toBeGreaterThanOrEqual(0.6);
});

test("responsive navigation shows its menu trigger only below the desktop breakpoint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  await expect(
    page.locator(
      '.site-navigation[data-presentation="responsive"] .navigation-toggle',
    ),
  ).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.locator(
      '.site-navigation[data-presentation="responsive"] .navigation-toggle',
    ),
  ).toBeVisible();
});

test("editor groups remain outside the independently painted preview", async ({
  page,
}) => {
  await expect(
    page.locator("[data-workbench-preview] .inspector-rail"),
  ).toHaveCount(0);
  await page
    .getByLabel("Visual style", { exact: true })
    .selectOption("cyberpunk");
  await expect(page.locator("[data-editor-chrome]").first()).toHaveAttribute(
    "data-ui",
    "minimal-saas",
  );
  await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ui",
    "cyberpunk",
  );
});

test("application workbench keeps real app-shell geometry bounded on mobile", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  await openWorkbenchGroup(page, "Layout");
  await page.getByLabel("Recipe", { exact: true }).selectOption("app-shell");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator(".client-workspace")).toHaveAttribute(
      "data-ly-recipe",
      "app-shell",
    );
    await expectNoHorizontalOverflow(page);
  }
});

test("footer closes with the complete four-library ecosystem", async ({
  page,
}) => {
  await expect(page.locator(".site-footer")).toContainText(
    "One semantic interface. Four focused CSS libraries.",
  );
});

test("Lab legacy section anchors open the corresponding editor group", async ({
  page,
}) => {
  /** Exercise a bookmarked entry before testing hydrated same-document changes. */
  await page.goto("about:blank");
  for (const [hash, group] of [
    ["layouts", "Layout"],
    ["ui-native", "Appearance"],
    ["interactions", "Interaction"],
    ["motion", "Motion"],
  ]) {
    await page.goto("./lab/#" + hash);
    await expect(page.locator("[data-inspector-panel] h2")).toHaveText(group);
    await expect(page).toHaveURL(new RegExp(`#${hash}$`));
  }
});

test("short desktop viewports use page flow and retain the inspector rail @cross-engine", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 400 });
  await page.goto("./lab/#workbench");
  await expect(page.locator(".inspector-rail")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Live preview content", exact: true }),
  ).toHaveCSS("overflow-y", "visible");
  const reset = page.getByRole("button", {
    name: "Reset configuration",
    exact: true,
  });
  await reset.scrollIntoViewIfNeeded();
  await expect(reset).toBeInViewport();
});

test("primary navigation keeps anchored sections below the sticky header @cross-engine", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of [768, 1024, 1248, 1440]) {
    await test.step(`${width}px viewport`, async () => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("./lab/");
      await page.evaluate(() => document.fonts.ready.then(() => true));

      const anchorContract = await page.evaluate(() => {
        const body = document.body;
        const header = document.querySelector<HTMLElement>(".site-header");
        const root = document.querySelector<HTMLElement>(
          ".lab-editor-experience > [data-editor-chrome]",
        );
        const navigation = document.querySelector<HTMLElement>(".primary-nav");
        const target = document.querySelector<HTMLElement>("#guides");
        if (
          header === null ||
          root === null ||
          navigation === null ||
          target === null
        ) {
          throw new Error(
            "Expected sticky-header anchor landmarks are missing.",
          );
        }

        return {
          bodyFontFamily: getComputedStyle(body).fontFamily,
          headerBorderWidth: Number.parseFloat(
            getComputedStyle(header).borderBottomWidth,
          ),
          headerHeight: header.getBoundingClientRect().height,
          navigationFontFamily: getComputedStyle(navigation).fontFamily,
          rootFontFamily: getComputedStyle(root).fontFamily,
          targetScrollMargin: Number.parseFloat(
            getComputedStyle(target).scrollMarginBlockStart,
          ),
        };
      });
      expect(anchorContract.bodyFontFamily).toMatch(/Geist/i);
      expect(anchorContract.navigationFontFamily).toBe(
        anchorContract.rootFontFamily,
      );
      expect(anchorContract.targetScrollMargin).toBeGreaterThanOrEqual(
        anchorContract.headerHeight + 16,
      );

      const menu = page.getByRole("button", { name: /lab sections/i });
      const navigation = page.getByRole("navigation", {
        name: "Primary navigation",
      });
      await expect(menu).toBeVisible();
      await expect(navigation).toBeHidden();
      await menu.click();
      await expect(navigation).toBeVisible();

      await page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Guides", exact: true })
        .click();
      await expect
        .poll(() => page.evaluate(() => window.location.hash))
        .toBe("#guides");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(navigation).toBeHidden();

      const geometry = await page.evaluate(() => {
        const header = document.querySelector<HTMLElement>(".site-header");
        const target = document.querySelector<HTMLElement>("#guides");
        if (header === null || target === null) {
          throw new Error(
            "Expected sticky header and anchor landmarks are missing.",
          );
        }

        return {
          headerBottom: header.getBoundingClientRect().bottom,
          targetTop: target.getBoundingClientRect().top,
        };
      });

      expect(geometry.targetTop).toBeGreaterThanOrEqual(geometry.headerBottom);
    });
  }
});

test("compact header tab order follows the disclosed navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./lab/");

  const header = page.locator(".site-header");
  const menu = header.getByRole("button", { name: /lab sections/i });
  const navigation = header.getByRole("navigation", {
    name: "Primary navigation",
  });
  const geometry = await header.evaluate((element) => {
    const brand = element.querySelector<HTMLElement>(".brand");
    const menuButton =
      element.querySelector<HTMLButtonElement>(".navigation-toggle");
    if (brand === null || menuButton === null) {
      throw new Error("Expected header regions are missing.");
    }

    const brandBounds = brand.getBoundingClientRect();
    const menuBounds = menuButton.getBoundingClientRect();

    return {
      headerHeight: element.getBoundingClientRect().height,
      menuFollowsBrand: menuBounds.left >= brandBounds.right,
      menuTargetValid: menuBounds.width > 0 && menuBounds.height >= 44,
      pageHasNoInlineOverflow:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    };
  });

  expect(geometry).toMatchObject({
    menuFollowsBrand: true,
    menuTargetValid: true,
    pageHasNoInlineOverflow: true,
  });
  expect(geometry.headerHeight).toBeGreaterThanOrEqual(44);
  const logo = (await header.locator(".brand-logo").boundingBox())!;
  const headerBox = (await header.boundingBox())!;
  expect(logo.y).toBeGreaterThanOrEqual(headerBox.y);
  expect(logo.y + logo.height).toBeLessThanOrEqual(
    headerBox.y + headerBox.height,
  );

  // Starting on the brand isolates header traversal from the independent skip-link contract.
  await header.getByRole("link", { name: "STE Systems home" }).focus();
  await page.keyboard.press("Tab");
  await expect(menu).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(navigation).toBeVisible();

  const tabOrder: string[] = [];
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    tabOrder.push(
      await page.evaluate(
        () => document.activeElement?.getAttribute("href") ?? "",
      ),
    );
  }

  expect(tabOrder).toEqual([
    "#top",
    "#workbench",
    "#guides",
    "#install",
    "#libraries",
    "/ste-systems/components/",
    "/ste-systems/",
    repositoryUrl,
  ]);

  const targetContract = await page
    .locator("#primary-navigation-panel a")
    .evaluateAll((links) =>
      links.map((link) => {
        const bounds = link.getBoundingClientRect();
        return {
          height: bounds.height,
          textFits: link.clientWidth >= link.scrollWidth,
          width: bounds.width,
        };
      }),
    );
  expect(targetContract).toHaveLength(8);
  expect(
    targetContract.every(
      ({ height, textFits, width }) => height >= 44 && textFits && width > 0,
    ),
  ).toBe(true);
});

test("compact navigation dismisses predictably from keyboard, outside pointer, link, and resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 799, height: 700 });
  await page.goto("./lab/");

  const menu = page.locator(".navigation-toggle");
  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });

  await menu.click();
  await navigation.getByRole("link", { name: "Top" }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  await expect(navigation).toBeHidden();

  await menu.click();
  await navigation.getByRole("link", { name: "Top" }).focus();
  const panelBounds = await page
    .locator("#primary-navigation-panel")
    .boundingBox();
  const viewport = page.viewportSize();
  if (panelBounds === null || viewport === null) {
    throw new Error("Expected a measurable disclosure panel and viewport.");
  }
  const outsidePointerY = panelBounds.y + panelBounds.height + 8;
  expect(outsidePointerY).toBeLessThan(viewport.height);
  await page.mouse.click(8, outsidePointerY);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).not.toBeFocused();
  await expect(navigation).toBeHidden();

  await menu.click();
  await navigation.getByRole("link", { name: "Install" }).click();
  await expect
    .poll(() => page.evaluate(() => window.location.hash))
    .toBe("#install");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toBeHidden();

  await menu.click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toBeVisible();
  await expect(navigation).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();

  await page.setViewportSize({ width: 799, height: 700 });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toBeHidden();
});

test("renders the production metadata and complete resource directory", async ({
  page,
}, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("./");
  await expect(page).toHaveTitle(/STE Systems/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".brand-logo")).toBeVisible();
  await expect(page.locator(".brand-logo")).toHaveAttribute(
    "src",
    /ste-systems-logo-128\.webp$/,
  );
  await expect
    .poll(() =>
      page
        .locator(".brand-logo")
        .evaluate(
          (image: HTMLImageElement) =>
            image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
        ),
    )
    .toBe(true);
  await expect(
    page.getByText("A product of Sanderson Technology Enterprises LLC").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Design every layer/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Use one layer or compose all four.",
    }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    canonicalUrl,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    canonicalUrl,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    socialImageUrl,
  );
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    socialImageAlt,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    socialImageUrl,
  );
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    "content",
    socialImageAlt,
  );
  for (const [selector, asset] of [
    ['link[rel="shortcut icon"]', "favicon.ico"],
    ['link[rel="icon"][sizes="any"]', "favicon.ico"],
    ['link[rel="icon"][sizes="32x32"]', "favicon-32x32.png"],
    ['link[rel="icon"][sizes="16x16"]', "favicon-16x16.png"],
    ['link[rel="apple-touch-icon"]', "apple-touch-icon.png"],
  ] as const) {
    await expect(page.locator(selector)).toHaveAttribute(
      "href",
      `${canonicalUrl}${asset}`,
    );
  }
  for (const [name, expected] of [
    ["google-site-verification", process.env.GOOGLE_SITE_VERIFICATION?.trim()],
    ["msvalidate.01", process.env.BING_SITE_VERIFICATION?.trim()],
  ] as const) {
    const tag = page.locator(`meta[name="${name}"]`);
    if (expected) {
      await expect(tag).toHaveCount(1);
      await expect(tag).toHaveAttribute("content", expected);
    } else {
      await expect(tag).toHaveCount(0);
    }
  }

  const structuredData = await readStructuredData(page);
  const node = (type: string) =>
    structuredData.filter((candidate) => candidate["@type"] === type);
  for (const type of ["Organization", "WebSite", "WebPage", "ItemList"]) {
    expect(node(type), type).toHaveLength(1);
  }
  expect(node("SoftwareApplication")).toHaveLength(0);
  const organization = node("Organization")[0]!;
  expect(organization).toMatchObject({
    "@id": corporateOrganizationId,
    description:
      "Software studio building creator-owned web platforms, private content systems, admin dashboards, and operational workflows for specialized businesses.",
    image:
      "https://sandersontechnologyenterprises.com/assets/social-preview.png",
    legalName: "Sanderson Technology Enterprises LLC",
    logo: "https://sandersontechnologyenterprises.com/assets/icon-512.png",
    name: "Sanderson Technology Enterprises",
    sameAs: ["https://github.com/Sanderson-Technology-Enterprises"],
    slogan: "Strategic Platform Development",
    url: companyUrl,
  });
  expect(node("WebSite")[0]).toMatchObject({
    "@id": websiteId,
    publisher: { "@id": corporateOrganizationId },
    url: canonicalUrl,
  });
  expect(node("WebPage")[0]).toMatchObject({
    "@id": webpageId,
    isPartOf: { "@id": websiteId },
    publisher: { "@id": corporateOrganizationId },
    url: canonicalUrl,
  });
  expect(node("ItemList")[0]).toMatchObject({
    "@id": packagesId,
    url: `${canonicalUrl}#libraries`,
    itemListElement: [
      {
        item: {
          codeRepository: "https://github.com/Foscat/Layout-Style-CSS",
          name: "layout-style-css",
          programmingLanguage: "CSS",
          url: "https://www.npmjs.com/package/layout-style-css",
          version: "3.2.3",
        },
      },
      {
        item: {
          codeRepository: "https://github.com/Foscat/ui-style-kit-css",
          name: "ui-style-kit-css",
          programmingLanguage: "CSS",
          url: "https://www.npmjs.com/package/ui-style-kit-css",
          version: "2.7.1",
        },
      },
      {
        item: {
          codeRepository: "https://github.com/Foscat/Interactive-Surface-CSS",
          name: "interactive-surface-css",
          programmingLanguage: "CSS",
          url: "https://www.npmjs.com/package/interactive-surface-css",
          version: "1.7.3",
        },
      },
      {
        item: {
          codeRepository:
            "https://github.com/Sanderson-Technology-Enterprises/motion-style-css",
          name: "@sanderson-technology-enterprises/motion-style-css",
          programmingLanguage: "CSS",
          url: "https://www.npmjs.com/package/@sanderson-technology-enterprises/motion-style-css",
          version: "1.0.0",
        },
      },
    ],
    numberOfItems: 4,
  });

  await page.goto("./lab/");
  /** Resource landmarks are progressively disclosed by the public Guides section. */
  await showAdvancedExamples(page);
  await expect(
    page.getByRole("heading", { name: /Test responsive layout recipes/i }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    labUrl,
  );
  const labStructuredData = await readStructuredData(page);
  const labNode = (type: string) =>
    labStructuredData.filter((candidate) => candidate["@type"] === type);
  expect(labNode("ItemList")).toHaveLength(0);
  expect(labNode("WebPage")[0]).toMatchObject({
    "@id": labWebpageId,
    isPartOf: { "@id": websiteId },
    publisher: { "@id": corporateOrganizationId },
    url: labUrl,
  });
  expect(labNode("SoftwareApplication")[0]).toMatchObject({
    "@id": applicationId,
    codeRepository: repositoryUrl,
    isAccessibleForFree: true,
    logo: `${canonicalUrl}ste-systems-logo.png`,
    operatingSystem: "Any",
    publisher: { "@id": corporateOrganizationId },
    url: labUrl,
  });

  for (const [name, version] of [
    ["layout-style-css", "3.2.3"],
    ["ui-style-kit-css", "2.7.1"],
    ["interactive-surface-css", "1.7.3"],
    ["@sanderson-technology-enterprises/motion-style-css", "1.0.0"],
  ]) {
    const packageEntry = page.locator(`[data-package="${name}"]`);
    await expect(packageEntry.getByRole("heading", { name })).toBeAttached();
    await expect(
      packageEntry.getByText(`v${version}`, { exact: true }),
    ).toBeAttached();
  }

  for (const url of resourceUrls) {
    await expect(page.locator(`a[href="${url}"]`).first()).toBeAttached();
  }

  await page.screenshot({
    path: `.tmp/observatory-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(runtimeErrors).toEqual([]);
});

test(
  "representative configurations remain healthy across engines",
  { tag: "@cross-engine" },
  async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));

    const configurations: ExpectedConfiguration[] = [
      defaultConfiguration,
      {
        layout: "split-screen",
        ui: "maximalist",
        theme: "cyber-lime",
        mode: "contrast",
      },
    ];

    for (const [index, configuration] of configurations.entries()) {
      // The shared setup already loads the default configuration.
      if (index > 0) {
        const query = new URLSearchParams(configuration).toString();
        await page.goto(`./lab/?${query}`);
      }
      await expectRootConfiguration(page, configuration);
      await showAdvancedExamples(page);
      await showAdvancedExamples(page, "Package integration proofs");
      await expect(
        page.locator("#ui-native [data-ui-category]").first(),
      ).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        labUrl,
      );
      for (const section of [
        ".site-header",
        "#workbench",
        "#layouts",
        "#ui-native",
        "#interactions",
        "#integrate",
        "#install",
        ".site-footer",
      ]) {
        await expect(page.locator(section)).toBeVisible();
      }
      const paint = await page
        .locator(".lab-editor-experience")
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            background: style.backgroundColor,
            backgroundImage: style.backgroundImage,
            color: style.color,
          };
        });
      expect(
        paint.background !== "rgba(0, 0, 0, 0)" ||
          paint.backgroundImage !== "none",
      ).toBe(true);
      expect(paint.color).not.toBe("rgba(0, 0, 0, 0)");

      const developerAction = page.getByRole("button", {
        name: "Component showcase",
        exact: true,
      });
      const installAction = page.getByRole("button", {
        name: "Application workspace",
        exact: true,
      });
      await developerAction.focus();
      await page.keyboard.press("Tab");
      await expect(installAction).toBeFocused();
      const focusStyle = await installAction.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          focusVisible: element.matches(":focus-visible"),
          outlineStyle: style.outlineStyle,
          outlineWidth: Number.parseFloat(style.outlineWidth),
        };
      });
      expect(focusStyle.focusVisible).toBe(true);
      expect(focusStyle.outlineStyle).not.toBe("none");
      expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);
      await expectNoHorizontalOverflow(page);
    }

    expect(runtimeErrors).toEqual([]);
  },
);

test("integration fixtures expose every published library ownership combination", async ({
  page,
}) => {
  await page.goto("./lab/");
  await showAdvancedExamples(page, "Package integration proofs");

  const integrationLab = page.locator("#integrate");
  await expect(
    integrationLab.getByRole("heading", {
      name: "Complete three-library stack",
    }),
  ).toBeVisible();
  await expect(
    integrationLab.locator('[data-integration-group="legacy"]'),
  ).toHaveCount(0);
  await expect(
    integrationLab.locator('[data-integration-fixture="all-legacy"]'),
  ).toHaveCount(0);
  await integrationLab.locator("details").evaluateAll((details) => {
    for (const detail of details) (detail as HTMLDetailsElement).open = true;
  });

  for (const fixtureId of [
    "layout-only",
    "ui-only",
    "interactive-only",
    "motion-only",
    "layout-ui",
    "layout-interactive",
    "ui-interactive",
    "all-canonical",
    "all-motion",
  ]) {
    const fixture = integrationLab.locator(
      `[data-integration-fixture="${fixtureId}"]`,
    );
    await fixture.scrollIntoViewIfNeeded();
    await expect(fixture).toBeVisible();
    await expect(
      page
        .frameLocator(`[data-integration-fixture="${fixtureId}"]`)
        .locator("[data-fixture-root]"),
    ).toHaveAttribute("data-fixture-id", fixtureId);
  }
});

test("keeps workbench controls, state, and copy affordances functional", async ({
  page,
}) => {
  await openWorkbenchGroup(page, "Layout");
  await page
    .getByLabel("Layout personality", { exact: true })
    .selectOption("bauhaus");
  await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ly-layout",
    "bauhaus",
  );
  await openWorkbenchGroup(page, "Export");
  await expect(
    page.getByRole("button", { name: "Copy configuration JSON", exact: true }),
  ).toBeVisible();
});

/** Each client setting must reach the same atomic polite region as legacy controls. */
test("atomic polite configuration region announces every editor choice", async ({
  page,
}) => {
  for (const choice of [
    {
      group: "Layout",
      label: "Layout personality",
      value: "bauhaus",
      message: "Layout changed to Bauhaus.",
    },
    {
      group: "Layout",
      label: "Recipe",
      value: "docs",
      message: "Recipe changed to Docs.",
    },
    {
      group: "Layout",
      label: "Spacing density",
      value: "spacious",
      message: "Spacing density changed to spacious.",
    },
    {
      group: "Appearance",
      label: "Visual style",
      value: "cyberpunk",
      message: "Visual style changed to Cyberpunk.",
    },
    {
      group: "Appearance",
      label: "Color scheme",
      value: "native",
      message: "Palette changed to Preset default.",
    },
    {
      group: "Appearance",
      label: "Display mode",
      value: "contrast",
      message: "Mode changed to High contrast.",
    },
  ]) {
    await openWorkbenchGroup(page, choice.group);
    await page
      .getByLabel(choice.label, { exact: true })
      .selectOption(choice.value);
    await expect(page.locator(".configuration-status")).toHaveText(
      choice.message,
    );
    await expect(page.locator(".configuration-status")).toHaveAttribute(
      "aria-atomic",
      "true",
    );
  }
});

test("the polite region re-announces repeated identical feedback", async ({
  page,
}) => {
  await openLabConfiguration(page);
  const liveRegion = page.locator(".configuration-status");
  const randomize = page.getByRole("button", {
    name: "Randomize configuration",
  });
  const message = "A randomized interface configuration is ready.";

  await randomize.click();
  await expect(liveRegion).toHaveText(message);
  await liveRegion.evaluate((element) => {
    const changes: string[] = [];
    element.dataset.observedChanges = JSON.stringify(changes);
    new MutationObserver(() => {
      changes.push(element.textContent ?? "");
      element.dataset.observedChanges = JSON.stringify(changes);
    }).observe(element, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  });

  await randomize.click();
  await expect
    .poll(() =>
      liveRegion.evaluate((element) =>
        JSON.parse(element.dataset.observedChanges ?? "[]"),
      ),
    )
    .not.toEqual([]);
  await expect(liveRegion).toHaveText(message);
});

test("install copy feedback restarts its timer", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page
    .getByRole("button", {
      name: "Copy Install all three code for The canonical three-library stack",
    })
    .click();
  let copyButton = page.getByRole("button", {
    name: "Copied Install all three code for The canonical three-library stack",
  });
  await expect(copyButton).toBeVisible();

  await page.waitForTimeout(900);
  await copyButton.click();
  await page.waitForTimeout(1_000);
  copyButton = page.getByRole("button", {
    name: "Copied Install all three code for The canonical three-library stack",
  });
  await expect(copyButton).toBeVisible();

  await page.waitForTimeout(900);
  await expect(
    page.getByRole("button", {
      name: "Copy Install all three code for The canonical three-library stack",
    }),
  ).toBeVisible();
});

test("install clipboard failure uses the shared feedback region", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Clipboard unavailable", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("./lab/");

  await page
    .getByRole("button", {
      name: "Copy Install all three code for The canonical three-library stack",
    })
    .click();
  const retryCopy = page.getByRole("button", {
    name: "Retry copy Install all three code for The canonical three-library stack",
  });
  await expect(retryCopy).toHaveText("Retry copy");
  await expect(retryCopy).toHaveAccessibleName(
    "Retry copy Install all three code for The canonical three-library stack",
  );
  await expect(page.locator(".configuration-status")).toHaveText(
    "Clipboard access failed. Copy the visible Install all three code for The canonical three-library stack manually.",
  );
});

test("configuration query overrides storage and persists across reloads", async ({
  page,
}) => {
  await page.evaluate(
    ({ storageKey, configuration }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(configuration));
    },
    {
      storageKey: configurationStorageKey,
      configuration: {
        layout: "cyberpunk",
        ui: "bauhaus",
        theme: "ocean-steel",
        mode: "light",
      },
    },
  );

  const configured: ExpectedConfiguration = {
    layout: "mondrian",
    ui: "retro-glass",
    theme: "rose-quartz",
    mode: "contrast",
  };
  await page.goto(
    "./lab/?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast",
  );

  await expectRootConfiguration(page, configured);
  await expect.poll(() => readStoredConfiguration(page)).toEqual(configured);
  expect(new URL(page.url()).search).toBe(
    "?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast",
  );

  await page.goto("./lab/");
  expect(new URL(page.url()).search).toBe("");
  await expectRootConfiguration(page, configured);
  await expect.poll(() => readStoredConfiguration(page)).toEqual(configured);

  await page.reload();
  expect(new URL(page.url()).search).toBe("");
  await expectRootConfiguration(page, configured);
});

test("configuration hydration recovers from invalid query and storage data", async ({
  page,
}) => {
  await page.evaluate(
    (key) => localStorage.setItem(key, "{broken"),
    configurationStorageKey,
  );
  await page.goto(
    "./lab/?layout=invalid&ui=invalid&theme=invalid&mode=invalid",
  );
  await expectRootConfiguration(page, defaultConfiguration);
  await expect(page.getByLabel("Visual style", { exact: true })).toHaveValue(
    "minimal-saas",
  );
  await expect(page.getByLabel("Color scheme", { exact: true })).toHaveValue(
    "midnight-gold",
  );
  await expect(page.getByLabel("Display mode", { exact: true })).toHaveValue(
    "dark",
  );
});

test("configuration controls update URL and storage, while reset removes both", async ({
  page,
}) => {
  await openWorkbenchGroup(page, "Layout");
  await page
    .getByLabel("Layout personality", { exact: true })
    .selectOption("split-screen");
  await openWorkbenchGroup(page, "Appearance");
  await page.getByLabel("Visual style", { exact: true }).selectOption("y2k");
  await page
    .getByLabel("Color scheme", { exact: true })
    .selectOption("arctic-indigo");
  await page
    .getByLabel("Display mode", { exact: true })
    .selectOption("contrast");
  const configured = {
    layout: "split-screen",
    ui: "y2k",
    theme: "arctic-indigo",
    mode: "contrast",
  };
  await expectRootConfiguration(page, configured);
  await expect.poll(() => readStoredConfiguration(page)).toEqual(configured);
  await page
    .getByRole("button", { name: "Reset configuration", exact: true })
    .click();
  await expectRootConfiguration(page, defaultConfiguration);
  await expect.poll(() => readStoredConfiguration(page)).toBeNull();
  expect(new URL(page.url()).search).toBe("");
});

test("configuration randomize persists a catalog-valid combination", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999;
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Randomize configuration", exact: true })
    .click();
  const configured = {
    layout: "editorial",
    ui: "neo-noir",
    theme: "walnut-clay",
    mode: "contrast",
  };
  await expectRootConfiguration(page, configured);
  await expect
    .poll(() => readStoredConfiguration(page))
    .toEqual({ ...configured, recipe: "card-grid", density: "spacious" });
});

test("semantic specimen surfaces declare all three documented levels", async ({
  page,
}) => {
  const cards = page.locator(
    "[data-workbench-preview] [data-motion-item] > .interactive-surface",
  );
  await expect(cards).toHaveCount(6);
  const levels = await cards.evaluateAll((elements) => [
    ...new Set(elements.map((e) => e.getAttribute("data-surface-level"))),
  ]);
  expect(levels.sort()).toEqual(["1", "2", "3"]);
});

test("configuration copy and share export matching markup and URL", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(
    "./lab/?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast",
  );
  await openWorkbenchGroup(page, "Export");
  await page
    .getByRole("button", { name: "Copy root markup", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'data-ui="retro-glass"',
  );
  await page
    .getByRole("button", { name: "Copy configuration link", exact: true })
    .click();
  const url = new URL(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(url.searchParams.get("ui")).toBe("retro-glass");
  expect(url.hash).toBe("#workbench");
  await expect(page.locator("[data-motion-status]")).toContainText("Copied.");
});

test("configuration copy and share expose manual fallback text on clipboard failure", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("Unavailable");
        },
      },
    }),
  );
  await page.reload();
  await openWorkbenchGroup(page, "Export");
  await page
    .getByRole("button", { name: "Copy root markup", exact: true })
    .click();
  await expect(
    page.getByLabel("Configuration export", { exact: true }),
  ).toHaveValue(/data-ui=/);
  await page
    .getByRole("button", { name: "Copy configuration link", exact: true })
    .click();
  await expect(
    page.getByLabel("Configuration export", { exact: true }),
  ).toHaveValue(/#workbench$/);
});

test("fits the viewport and honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");

  const defaultRunnerMotion = await page
    .locator(".home-orbit-runner")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        const duration = style.animationDuration;
        const numericDuration = Number.parseFloat(duration) || 0;
        return {
          animationCount: element.getAnimations().length,
          duration,
          durationMs: duration.endsWith("ms")
            ? numericDuration
            : numericDuration * 1_000,
          name: style.animationName,
        };
      }),
    );
  expect(defaultRunnerMotion.length).toBeGreaterThan(0);
  expect(
    defaultRunnerMotion.every(
      ({ animationCount, durationMs, name }) =>
        name !== "none" && durationMs > 0 && animationCount > 0,
    ),
  ).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });

  await expectNoHorizontalOverflow(page);

  const reducedRunnerMotion = await page
    .locator(".home-orbit-runner")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        const duration = style.animationDuration;
        const numericDuration = Number.parseFloat(duration) || 0;
        return {
          animationCount: element.getAnimations().length,
          duration,
          durationMs: duration.endsWith("ms")
            ? numericDuration
            : numericDuration * 1_000,
          name: style.animationName,
        };
      }),
    );
  expect(reducedRunnerMotion.length).toBe(defaultRunnerMotion.length);
  expect(
    reducedRunnerMotion.every(
      ({ animationCount, durationMs, name }) =>
        name === "none" && durationMs <= 1 && animationCount === 0,
    ),
  ).toBe(true);
  const menu = page.locator(".navigation-toggle");
  const navigation = page.locator(".primary-nav");
  if (await menu.isVisible()) {
    await expect(navigation).toBeHidden();
    await menu.click();
  }
  await expect(navigation).toBeVisible();
});

test("stays responsive across mobile portrait, mobile landscape, tablet, and desktop sizes", async ({
  page,
}) => {
  const viewports = [
    // A classic 15px scrollbar leaves a 305px content box in a 320px window.
    { width: 305, height: 568 },
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
    { width: 799, height: 700 },
    { width: 1024, height: 768 },
    { width: 1248, height: 800 },
    { width: 1249, height: 800 },
    { width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("./lab/");

    await expectNoHorizontalOverflow(page);

    const menu = page.getByRole("button", { name: /lab sections/i });
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(navigation).toBeHidden();
    await menu.click();
    await expect(navigation).toBeVisible();

    const panel = page.locator("#primary-navigation-panel");
    const panelGeometry = await panel.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        bottom: bounds.bottom,
        canScrollVertically: element.scrollHeight > element.clientHeight,
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      };
    });
    expect(panelGeometry.left).toBeGreaterThanOrEqual(0);
    expect(panelGeometry.right).toBeLessThanOrEqual(
      panelGeometry.viewportWidth,
    );
    expect(panelGeometry.top).toBeGreaterThanOrEqual(0);
    expect(panelGeometry.bottom).toBeLessThanOrEqual(
      panelGeometry.viewportHeight,
    );
    await panel.getByRole("link", { name: /GitHub/i }).scrollIntoViewIfNeeded();
    await expect(panel.getByRole("link", { name: /GitHub/i })).toBeVisible();
    await expect(panel.getByRole("link", { name: /GitHub/i })).toBeInViewport();
    await page.keyboard.press("Escape");
    await expect(navigation).toBeHidden();

    await expectNoHorizontalOverflow(page);
    await showAdvancedExamples(page);
    await expect(
      page.getByRole("heading", { name: /Test responsive layout recipes/i }),
    ).toBeVisible();

    const sectionHealth = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          ".observatory-legend li, .product-preview, .proof-card, .install-step, .library-list li",
        ),
      ).map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          height: rect.height,
          width: rect.width,
          viewportWidth: window.innerWidth,
        };
      }),
    );

    for (const item of sectionHealth) {
      expect(item.width).toBeLessThanOrEqual(item.viewportWidth);
      expect(item.height).toBeGreaterThan(20);
    }
  }
});

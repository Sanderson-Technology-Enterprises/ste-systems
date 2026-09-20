import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

import { collectExportIssues } from "../scripts/verify-export.mjs";

test("the GitHub Pages export satisfies the production SEO contract", async () => {
  const issues = await collectExportIssues();

  assert.deepEqual(issues, []);
});

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
/** Expected CSS ceiling for the complete ui-style-kit-css 2.4 preset matrix. */
const nextCssBudgetBytes = 2304 * 1024;
/** Expected font ceiling for all ui-style-kit-css 2.4 identities. */
const exportedFontBudgetBytes = 2560 * 1024;
const outRoot = path.join(repositoryRoot, "out");
const googleVerificationFile = "google5abb0289b99a9f42.html";
const googleVerificationText =
  "google-site-verification: google5abb0289b99a9f42.html";
const pagesBasePath = "/ste-systems";
const canonicalUrl = "https://stesystems.com/";
const labUrl = `${canonicalUrl}lab/`;
const componentsUrl = `${canonicalUrl}components/`;
const healthUrl = `${canonicalUrl}health/`;
const corporateUrl = "https://sandersontechnologyenterprises.com/";
const corporateOrganizationId = `${corporateUrl}#organization`;
const repositoryUrl =
  "https://github.com/Sanderson-Technology-Enterprises/ste-systems";
const siteTitle = "STE Systems | Accessible Three-Library Design System";
const siteDescription =
  "STE Systems is the accessible three-library design system from Sanderson Technology Enterprises LLC, combining layout, visual identity, and interaction primitives in one interface.";
const socialImageUrl = `${canonicalUrl}ste-systems-social-preview.png`;
const socialImageAlt =
  "STE Systems social preview with the text \u201c3 libraries, 1 interface, and 176,400 possibilities\u201d over layout, identity, and interaction.";
const websiteId = `${canonicalUrl}#website`;
const webpageId = `${canonicalUrl}#webpage`;
const labWebpageId = `${labUrl}#webpage`;
const applicationId = `${labUrl}#application`;
const packagesId = `${canonicalUrl}#packages`;
const staleLabUrls = [
  "https://foscat.github.io/interface-systems-lab/",
  "https://github.com/Foscat/interface-systems-lab",
  "https://sanderson-technology-enterprises.github.io/interface-systems-lab/",
  "https://github.com/Sanderson-Technology-Enterprises/interface-systems-lab",
];

test("the Pages artifact publishes the exact Google verification file at its root", async () => {
  const verificationText = await readFile(
    path.join(outRoot, googleVerificationFile),
    "utf8",
  );

  assert.equal(verificationText, googleVerificationText);
});

function structuredDataNodes(html) {
  return Array.from(
    html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
    (match) => JSON.parse(match[1]),
  ).flatMap((value) => value["@graph"] ?? [value]);
}

function nodesOfType(nodes, type) {
  return nodes.filter((node) => node["@type"] === type);
}

function localAssetReferences(html) {
  return Array.from(
    html.matchAll(/(?:href|src)="([^"]+)"/g),
    (match) => match[1],
  ).filter(
    (reference) =>
      !reference.startsWith("https://") &&
      !reference.startsWith("http://") &&
      !reference.startsWith("data:") &&
      !reference.startsWith("#") &&
      !reference.startsWith("mailto:") &&
      !reference.startsWith("tel:"),
  );
}

async function artifactFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await artifactFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push({ path: entryPath, size: (await stat(entryPath)).size });
    }
  }
  return files;
}

test("the Pages artifact publishes the transferred canonical identity", async () => {
  const [index, lab, components, notFound, robots, sitemap] = await Promise.all(
    [
      "index.html",
      "lab/index.html",
      "components/index.html",
      "404.html",
      "robots.txt",
      "sitemap.xml",
    ].map((fileName) =>
      readFile(path.join(repositoryRoot, "out", fileName), "utf8"),
    ),
  );
  const shippingOutput = [
    index,
    lab,
    components,
    notFound,
    robots,
    sitemap,
  ].join("\n");

  assert.ok(index.includes(`<link rel="canonical" href="${canonicalUrl}"`));
  assert.ok(index.includes(`<title>${siteTitle}</title>`));
  assert.ok(
    index.includes(`<meta name="description" content="${siteDescription}"`),
  );
  assert.ok(
    index.includes(
      '<meta name="author" content="Sanderson Technology Enterprises LLC"',
    ),
  );
  assert.ok(
    index.includes(
      '<meta name="publisher" content="Sanderson Technology Enterprises LLC"',
    ),
  );
  assert.ok(lab.includes(`<link rel="canonical" href="${labUrl}"`));
  assert.ok(
    components.includes(`<link rel="canonical" href="${componentsUrl}"`),
  );
  assert.ok(index.includes(`property="og:url" content="${canonicalUrl}"`));
  assert.ok(index.includes(`property="og:image" content="${socialImageUrl}"`));
  assert.match(
    index,
    new RegExp(`property="og:image:alt" content="${socialImageAlt}"`),
  );
  assert.ok(index.includes(`name="twitter:image" content="${socialImageUrl}"`));
  assert.match(
    index,
    new RegExp(`name="twitter:image:alt" content="${socialImageAlt}"`),
  );
  for (const asset of [
    "favicon.ico",
    "favicon-32x32.png",
    "favicon-16x16.png",
    "apple-touch-icon.png",
  ]) {
    assert.ok(index.includes(`href="${canonicalUrl}${asset}"`));
    await access(path.join(repositoryRoot, "out", asset));
  }
  assert.match(index, new RegExp(`href="${corporateUrl}"`, "g"));
  assert.ok(
    (index.match(new RegExp(`href="${corporateUrl}"`, "g"))?.length ?? 0) >= 2,
  );
  for (const staleUrl of staleLabUrls) {
    assert.equal(shippingOutput.includes(staleUrl), false, staleUrl);
  }
});

test("the Pages artifact publishes a monitor-friendly health page", async () => {
  const health = await readFile(
    path.join(outRoot, "health", "index.html"),
    "utf8",
  );

  assert.ok(health.includes("STE Systems is online."));
  assert.ok(health.includes(`href="${healthUrl}"`));
  assert.ok(health.includes('name="robots" content="noindex, nofollow"'));
  assert.ok(health.includes('data-theme="midnight-gold"'));
});

test("route structured data separates the overview, lab, and atlas", async () => {
  const [index, lab, components] = await Promise.all([
    readFile(path.join(repositoryRoot, "out", "index.html"), "utf8"),
    readFile(path.join(repositoryRoot, "out", "lab", "index.html"), "utf8"),
    readFile(
      path.join(repositoryRoot, "out", "components", "index.html"),
      "utf8",
    ),
  ]);
  const nodes = structuredDataNodes(index);
  const labNodes = structuredDataNodes(lab);
  const atlasNodes = structuredDataNodes(components);
  const requiredTypes = ["Organization", "WebSite", "WebPage", "ItemList"];

  for (const type of requiredTypes) {
    assert.equal(nodesOfType(nodes, type).length, 1, type);
  }
  assert.equal(nodesOfType(nodes, "SoftwareApplication").length, 0);
  for (const type of [
    "Organization",
    "WebSite",
    "WebPage",
    "SoftwareApplication",
  ]) {
    assert.equal(nodesOfType(labNodes, type).length, 1, `lab ${type}`);
  }
  assert.equal(nodesOfType(labNodes, "ItemList").length, 0);

  const organization = nodesOfType(nodes, "Organization")[0];
  assert.equal(organization["@id"], corporateOrganizationId);
  assert.equal(organization.url, corporateUrl);
  assert.equal(organization.name, "Sanderson Technology Enterprises");
  assert.equal(organization.legalName, "Sanderson Technology Enterprises LLC");
  assert.equal(organization.slogan, "Strategic Platform Development");
  assert.equal(
    organization.description,
    "Software studio building creator-owned web platforms, private content systems, admin dashboards, and operational workflows for specialized businesses.",
  );
  assert.equal(
    organization.logo,
    "https://sandersontechnologyenterprises.com/assets/icon-512.png",
  );
  assert.equal(
    organization.image,
    "https://sandersontechnologyenterprises.com/assets/social-preview.png",
  );
  assert.deepEqual(organization.sameAs, [
    "https://github.com/Sanderson-Technology-Enterprises",
  ]);

  for (const type of ["WebSite", "WebPage"]) {
    const node = nodesOfType(nodes, type)[0];
    assert.equal(node.url, canonicalUrl, type);
    assert.equal(node.publisher["@id"], corporateOrganizationId, type);
  }
  const website = nodesOfType(nodes, "WebSite")[0];
  assert.equal(website["@id"], websiteId);
  const webpage = nodesOfType(nodes, "WebPage")[0];
  assert.equal(webpage["@id"], webpageId);
  assert.equal(webpage.isPartOf["@id"], websiteId);
  const labWebpage = nodesOfType(labNodes, "WebPage")[0];
  assert.equal(labWebpage["@id"], labWebpageId);
  assert.equal(labWebpage.url, labUrl);
  assert.equal(labWebpage.isPartOf["@id"], websiteId);
  const application = nodesOfType(labNodes, "SoftwareApplication")[0];
  assert.equal(application["@id"], applicationId);
  assert.equal(application.url, labUrl);
  assert.equal(application.codeRepository, repositoryUrl);
  assert.equal(application.isAccessibleForFree, true);
  assert.equal(application.operatingSystem, "Any");
  assert.equal(application.logo, `${canonicalUrl}ste-systems-logo.png`);
  assert.equal(nodesOfType(atlasNodes, "WebPage")[0].url, componentsUrl);
  assert.equal(
    nodesOfType(atlasNodes, "SoftwareApplication")[0].url,
    componentsUrl,
  );

  const packages = nodesOfType(nodes, "ItemList")[0];
  assert.equal(packages["@id"], packagesId);
  assert.equal(packages.url, `${canonicalUrl}#libraries`);
  assert.equal(packages.numberOfItems, 3);
  assert.deepEqual(
    packages.itemListElement.map((entry) => ({
      codeRepository: entry.item.codeRepository,
      name: entry.item.name,
      programmingLanguage: entry.item.programmingLanguage,
      url: entry.item.url,
      version: entry.item.version,
    })),
    [
      {
        codeRepository: "https://github.com/Foscat/Layout-Style-CSS",
        name: "layout-style-css",
        programmingLanguage: "CSS",
        url: "https://www.npmjs.com/package/layout-style-css",
        version: "3.2.0",
      },
      {
        codeRepository: "https://github.com/Foscat/ui-style-kit-css",
        name: "ui-style-kit-css",
        programmingLanguage: "CSS",
        url: "https://www.npmjs.com/package/ui-style-kit-css",
        version: "2.4.0",
      },
      {
        codeRepository: "https://github.com/Foscat/Interactive-Surface-CSS",
        name: "interactive-surface-css",
        programmingLanguage: "CSS",
        url: "https://www.npmjs.com/package/interactive-surface-css",
        version: "1.7.0",
      },
    ],
  );
});

test("exported documents separate 404 identity and keep local assets Pages-safe", async () => {
  const [index, lab, components, notFound] = await Promise.all([
    readFile(path.join(repositoryRoot, "out", "index.html"), "utf8"),
    readFile(path.join(repositoryRoot, "out", "lab", "index.html"), "utf8"),
    readFile(
      path.join(repositoryRoot, "out", "components", "index.html"),
      "utf8",
    ),
    readFile(path.join(repositoryRoot, "out", "404.html"), "utf8"),
  ]);
  const nodeTypes = structuredDataNodes(notFound).map((node) => node["@type"]);

  for (const homeType of ["WebPage", "SoftwareApplication", "ItemList"]) {
    assert.equal(nodeTypes.includes(homeType), false, homeType);
  }
  assert.doesNotMatch(notFound, /<link rel="canonical"/);
  assert.doesNotMatch(notFound, /<meta property="og:/);
  assert.doesNotMatch(notFound, /<meta name="twitter:/);

  for (const [documentName, html] of [
    ["index", index],
    ["lab", lab],
    ["components", components],
    ["404", notFound],
  ]) {
    for (const reference of localAssetReferences(html)) {
      assert.match(
        reference,
        /^\/ste-systems(?:\/|$)/,
        `${documentName} asset is not Pages-safe: ${reference}`,
      );
    }
  }
});

test("crawler routes and manifest remain stable and Pages-aware", async () => {
  const [robots, sitemap, manifestSource, index, socialImage] =
    await Promise.all([
      readFile(path.join(repositoryRoot, "out", "robots.txt"), "utf8"),
      readFile(path.join(repositoryRoot, "out", "sitemap.xml"), "utf8"),
      readFile(
        path.join(repositoryRoot, "out", "manifest.webmanifest"),
        "utf8",
      ),
      readFile(path.join(repositoryRoot, "out", "index.html"), "utf8"),
      readFile(
        path.join(repositoryRoot, "out", "ste-systems-social-preview.png"),
      ),
    ]);
  const manifest = JSON.parse(manifestSource);

  assert.match(
    index,
    /<link rel="manifest" href="\/ste-systems\/manifest\.webmanifest"/,
  );
  assert.ok(robots.includes(`Sitemap: ${canonicalUrl}sitemap.xml`));
  const host = robots.match(/^Host:\s*(.+)$/m)?.[1]?.trim();
  if (host !== undefined) {
    const parsedHost = new URL(host);
    assert.equal(parsedHost.pathname, "/");
    assert.equal(parsedHost.search, "");
    assert.equal(parsedHost.hash, "");
  }
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 3);
  assert.ok(sitemap.includes(`<loc>${canonicalUrl}</loc>`));
  assert.ok(sitemap.includes(`<loc>${labUrl}</loc>`));
  assert.ok(sitemap.includes(`<loc>${componentsUrl}</loc>`));
  assert.doesNotMatch(sitemap, /<lastmod>/);
  for (const key of ["id", "start_url", "scope"]) {
    assert.equal(manifest[key], "/ste-systems/", key);
  }
  assert.deepEqual(manifest.icons, [
    {
      src: "/ste-systems/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/ste-systems/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/ste-systems/maskable-icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ]);
  for (const icon of manifest.icons) {
    await access(
      path.join(
        repositoryRoot,
        "out",
        icon.src.slice(pagesBasePath.length + 1),
      ),
    );
  }
  assert.deepEqual(
    [...socialImage.subarray(0, 8)],
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  );
  assert.equal(socialImage.readUInt32BE(16), 1200);
  assert.equal(socialImage.readUInt32BE(20), 630);
  for (const [name, expected] of [
    ["google-site-verification", process.env.GOOGLE_SITE_VERIFICATION?.trim()],
    ["msvalidate.01", process.env.BING_SITE_VERIFICATION?.trim()],
  ]) {
    const tags = Array.from(
      index.matchAll(
        new RegExp(
          `<meta name="${name.replace(".", "\\.")}" content="([^"]*)"`,
          "g",
        ),
      ),
    );
    if (expected) {
      assert.equal(tags.length, 1, name);
      assert.equal(tags[0]?.[1], expected, name);
    } else {
      assert.equal(tags.length, 0, name);
    }
  }
});

test("the exported routes stay within separate deterministic budgets", async () => {
  const [index, lab, components] = await Promise.all([
    readFile(path.join(repositoryRoot, "out", "index.html")),
    readFile(path.join(repositoryRoot, "out", "lab", "index.html")),
    readFile(path.join(repositoryRoot, "out", "components", "index.html")),
  ]);
  const staticFiles = await artifactFiles(
    path.join(repositoryRoot, "out", "_next", "static"),
  );
  const totalByExtension = (pattern) =>
    staticFiles
      .filter((file) => pattern.test(file.path))
      .reduce((total, file) => total + file.size, 0);
  const budgets = [
    ["raw index.html", index.length, 96 * 1024],
    ["raw lab/index.html", lab.length, 256 * 1024],
    ["raw components/index.html", components.length, 768 * 1024],
    ["Next.js JavaScript", totalByExtension(/\.js$/), 1024 * 1024],
    ["Next.js CSS", totalByExtension(/\.css$/), nextCssBudgetBytes],
    [
      "exported fonts",
      totalByExtension(/\.(?:woff2?|ttf|otf)$/),
      exportedFontBudgetBytes,
    ],
  ];

  for (const [label, actual, budget] of budgets) {
    assert.ok(actual <= budget, `${label}: ${actual} > ${budget}`);
  }
});

const exportFixtureRoot = path.join(
  repositoryRoot,
  "out",
  "fixtures",
  "generated",
);
const fixtureIds = [
  "layout-only",
  "ui-only",
  "interactive-only",
  "layout-ui",
  "layout-interactive",
  "ui-interactive",
  "all-canonical",
];

test("the Pages artifact contains every isolated integration fixture", async () => {
  const page = await readFile(
    path.join(repositoryRoot, "out", "lab", "index.html"),
    "utf8",
  );

  for (const id of fixtureIds) {
    const fixturePath = path.join(exportFixtureRoot, `${id}.html`);
    const fixture = await readFile(fixturePath, "utf8");
    assert.match(
      page,
      new RegExp(`src="/ste-systems/fixtures/generated/${id}\\.html"`),
    );
    assert.doesNotMatch(fixture, /https?:\/\//);

    const stylesheetLinks = Array.from(
      fixture.matchAll(/<link rel="stylesheet" href="([^"]+)">/g),
      (match) => match[1],
    );
    assert.ok(stylesheetLinks.length > 0, id);
    for (const href of stylesheetLinks) {
      assert.match(href, /^\.\/assets\//, `${id}: ${href}`);
      await access(path.resolve(path.dirname(fixturePath), href));
    }
  }
});

test("the package directory links to Pages-prefixed standalone fixtures", async () => {
  const page = await readFile(
    path.join(repositoryRoot, "out", "lab", "index.html"),
    "utf8",
  );

  for (const id of ["layout-only", "ui-only", "interactive-only"]) {
    assert.match(
      page,
      new RegExp(
        `data-standalone-fixture="${id}"[^>]+href="/ste-systems/fixtures/generated/${id}\\.html"`,
      ),
    );
  }
});

test("the Pages artifact stages the pinned Layout v3 core", async () => {
  const layoutCorePath = path.join(
    exportFixtureRoot,
    "assets",
    "layout-style-css",
    "3.2.0",
    "layout-style-css.css",
  );
  const layoutCore = await readFile(layoutCorePath, "utf8");
  assert.match(layoutCore, /\.ly-grid\s*\{/);
  assert.match(layoutCore, /--ly-pane-min/);
});

test("the Pages artifact keeps generated fixtures free of private paths", async () => {
  const lab = await readFile(path.join(outRoot, "lab", "index.html"), "utf8");
  const exportedFixtureHtml = await Promise.all(
    fixtureIds.map((id) =>
      readFile(path.join(exportFixtureRoot, `${id}.html`), "utf8"),
    ),
  );
  const exportedHtml = [lab, ...exportedFixtureHtml].join("\n");

  assert.doesNotMatch(exportedHtml, /node_modules/);
  assert.doesNotMatch(
    exportedHtml,
    /layout-style-css\/(?:legacy\.css|integrations\/ui-style-kit\.css)/,
  );
});

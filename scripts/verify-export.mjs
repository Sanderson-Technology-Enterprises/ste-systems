import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const exportRoot = path.join(repositoryRoot, "out");
/** Maximum CSS payload for the complete ui-style-kit-css 2.4 preset matrix. */
const nextCssBudgetBytes = 2304 * 1024;
/** Maximum bundled font payload for all ui-style-kit-css 2.4 identities. */
const exportedFontBudgetBytes = 2560 * 1024;
const googleVerificationFile = "google5abb0289b99a9f42.html";
const googleVerificationText =
  "google-site-verification: google5abb0289b99a9f42.html";
const basePath = "/ste-systems";
const siteUrl = "https://stesystems.com/";
const labUrl = `${siteUrl}lab/`;
const componentsUrl = `${siteUrl}components/`;
const corporateUrl = "https://sandersontechnologyenterprises.com/";
const customizedPlatformsUrl = "https://customizedplatforms.com/";
const corporateOrganizationId = `${corporateUrl}#organization`;
const corporateGithub = "https://github.com/Sanderson-Technology-Enterprises";
const repositoryUrl = `${corporateGithub}/ste-systems`;
const siteTitle = "STE Systems | Accessible Three-Library Design System";
const siteDescription =
  "STE Systems is the accessible three-library design system from Sanderson Technology Enterprises LLC, combining layout, visual identity, and interaction primitives in one interface.";
const socialImageUrl = `${siteUrl}ste-systems-social-preview.png`;
const socialImageAlt =
  "STE Systems social preview with the text \u201c3 libraries, 1 interface, and 176,400 possibilities\u201d over layout, identity, and interaction.";
const labLogoUrl = `${siteUrl}ste-systems-logo.png`;
const websiteId = `${siteUrl}#website`;
const webpageId = `${siteUrl}#webpage`;
const labWebpageId = `${labUrl}#webpage`;
const applicationId = `${labUrl}#application`;
const atlasWebpageId = `${componentsUrl}#webpage`;
const atlasApplicationId = `${componentsUrl}#application`;
const packagesId = `${siteUrl}#packages`;
const corporateDescription =
  "Software studio building creator-owned web platforms, private content systems, admin dashboards, and operational workflows for specialized businesses.";
const staleLabUrls = [
  ["https://foscat.github.io", "/interface-systems-lab/"].join(""),
  ["https://github.com/Foscat", "/interface-systems-lab"].join(""),
  [
    "https://sanderson-technology-enterprises.github.io",
    "/interface-systems-lab/",
  ].join(""),
  [corporateGithub, "/interface-systems-lab"].join(""),
];

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

async function readExportFile(relativePath, issues) {
  try {
    return await readFile(path.join(exportRoot, relativePath));
  } catch {
    issues.push(`Missing export file: ${relativePath}`);
    return Buffer.alloc(0);
  }
}

function requireText(haystack, needle, label, issues) {
  if (!haystack.includes(needle)) {
    issues.push(`Missing ${label}: ${needle}`);
  }
}

function rejectText(haystack, needle, label, issues) {
  if (haystack.includes(needle)) {
    issues.push(`Found ${label}: ${needle}`);
  }
}

function requireExact(actual, expected, label, issues) {
  if (actual !== expected) {
    issues.push(
      `${label} must be ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`,
    );
  }
}

function readStructuredDataNodes(html, documentName, issues) {
  const nodes = [];
  const scripts = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  );

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]);
      nodes.push(...(parsed["@graph"] ?? [parsed]));
    } catch {
      issues.push(`${documentName} contains invalid JSON-LD`);
    }
  }

  return nodes;
}

function requireSingleSchemaNode(nodes, type, documentName, issues) {
  const matches = nodes.filter((node) => node["@type"] === type);
  if (matches.length !== 1) {
    issues.push(
      `${documentName} must contain one ${type} schema node, found ${matches.length}`,
    );
  }
  return matches[0];
}

async function validateLocalAssets(html, documentName, issues) {
  const references = new Set(
    Array.from(
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
    ),
  );

  for (const reference of references) {
    if (!reference.startsWith(`${basePath}/`)) {
      issues.push(`${documentName} asset is not Pages-aware: ${reference}`);
      continue;
    }

    const pathname = reference.split(/[?#]/, 1)[0];
    const exportedPath = pathname.slice(basePath.length + 1);
    const relativePath =
      exportedPath === ""
        ? "index.html"
        : pathname.endsWith("/")
          ? path.join(exportedPath, "index.html")
          : exportedPath;
    const resolvedPath = path.resolve(exportRoot, relativePath);
    const exportRelativePath = path.relative(exportRoot, resolvedPath);
    if (
      exportRelativePath.startsWith("..") ||
      path.isAbsolute(exportRelativePath)
    ) {
      issues.push(`${documentName} asset escapes the export: ${reference}`);
      continue;
    }
    await readExportFile(exportRelativePath, issues);
  }
}

async function collectArtifactFiles(directory, issues) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    issues.push(
      `Missing artifact directory: ${path.relative(exportRoot, directory)}`,
    );
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectArtifactFiles(entryPath, issues)));
    } else if (entry.isFile()) {
      files.push({ path: entryPath, size: (await stat(entryPath)).size });
    }
  }
  return files;
}

function enforceArtifactBudget(actual, budget, label, issues) {
  if (actual > budget) {
    issues.push(`${label} exceeds ${budget} bytes: ${actual}`);
  }
}

function validateStructuredData(index, lab, components, notFound, issues) {
  const indexNodes = readStructuredDataNodes(index, "index.html", issues);
  const labNodes = readStructuredDataNodes(lab, "lab/index.html", issues);
  const atlasNodes = readStructuredDataNodes(
    components,
    "components/index.html",
    issues,
  );
  const notFoundNodes = readStructuredDataNodes(notFound, "404.html", issues);
  const organization = requireSingleSchemaNode(
    indexNodes,
    "Organization",
    "index.html",
    issues,
  );
  const website = requireSingleSchemaNode(
    indexNodes,
    "WebSite",
    "index.html",
    issues,
  );
  const webpage = requireSingleSchemaNode(
    indexNodes,
    "WebPage",
    "index.html",
    issues,
  );
  const labWebpage = requireSingleSchemaNode(
    labNodes,
    "WebPage",
    "lab/index.html",
    issues,
  );
  const application = requireSingleSchemaNode(
    labNodes,
    "SoftwareApplication",
    "lab/index.html",
    issues,
  );
  const atlasWebpage = requireSingleSchemaNode(
    atlasNodes,
    "WebPage",
    "components/index.html",
    issues,
  );
  const atlasApplication = requireSingleSchemaNode(
    atlasNodes,
    "SoftwareApplication",
    "components/index.html",
    issues,
  );
  const packages = requireSingleSchemaNode(
    indexNodes,
    "ItemList",
    "index.html",
    issues,
  );

  if (indexNodes.some((node) => node["@type"] === "SoftwareApplication")) {
    issues.push(
      "index.html incorrectly contains lab-only SoftwareApplication schema",
    );
  }
  if (labNodes.some((node) => node["@type"] === "ItemList")) {
    issues.push(
      "lab/index.html incorrectly contains homepage-only ItemList schema",
    );
  }

  if (organization) {
    requireExact(
      organization["@id"],
      corporateOrganizationId,
      "Organization @id",
      issues,
    );
    requireExact(
      organization.name,
      "Sanderson Technology Enterprises",
      "Organization name",
      issues,
    );
    requireExact(
      organization.legalName,
      "Sanderson Technology Enterprises LLC",
      "Organization legalName",
      issues,
    );
    requireExact(
      organization.slogan,
      "Strategic Platform Development",
      "Organization slogan",
      issues,
    );
    requireExact(
      organization.description,
      corporateDescription,
      "Organization description",
      issues,
    );
    requireExact(organization.url, corporateUrl, "Organization URL", issues);
    requireExact(
      organization.logo,
      `${corporateUrl}assets/icon-512.png`,
      "Organization logo",
      issues,
    );
    requireExact(
      organization.image,
      `${corporateUrl}assets/social-preview.png`,
      "Organization image",
      issues,
    );
    requireExact(
      JSON.stringify(organization.sameAs),
      JSON.stringify([corporateGithub]),
      "Organization sameAs",
      issues,
    );
  }

  if (website) {
    requireExact(website["@id"], websiteId, "WebSite @id", issues);
    requireExact(website.url, siteUrl, "WebSite URL", issues);
    requireExact(website.image, socialImageUrl, "WebSite image", issues);
    requireExact(
      website.publisher?.["@id"],
      corporateOrganizationId,
      "WebSite publisher",
      issues,
    );
  }
  if (webpage) {
    requireExact(webpage["@id"], webpageId, "WebPage @id", issues);
    requireExact(webpage.url, siteUrl, "WebPage URL", issues);
    requireExact(
      webpage.isPartOf?.["@id"],
      websiteId,
      "WebPage isPartOf",
      issues,
    );
    requireExact(
      webpage.publisher?.["@id"],
      corporateOrganizationId,
      "WebPage publisher",
      issues,
    );
  }
  if (labWebpage) {
    requireExact(labWebpage["@id"], labWebpageId, "Lab WebPage @id", issues);
    requireExact(labWebpage.url, labUrl, "Lab WebPage URL", issues);
    requireExact(
      labWebpage.isPartOf?.["@id"],
      websiteId,
      "Lab WebPage isPartOf",
      issues,
    );
    requireExact(
      labWebpage.publisher?.["@id"],
      corporateOrganizationId,
      "Lab WebPage publisher",
      issues,
    );
  }
  if (application) {
    requireExact(
      application["@id"],
      applicationId,
      "SoftwareApplication @id",
      issues,
    );
    requireExact(application.url, labUrl, "SoftwareApplication URL", issues);
    requireExact(
      application.publisher?.["@id"],
      corporateOrganizationId,
      "SoftwareApplication publisher",
      issues,
    );
    requireExact(
      application.codeRepository,
      repositoryUrl,
      "SoftwareApplication repository",
      issues,
    );
    requireExact(
      application.isAccessibleForFree,
      true,
      "SoftwareApplication free access",
      issues,
    );
    requireExact(
      application.operatingSystem,
      "Any",
      "SoftwareApplication operating system",
      issues,
    );
    requireExact(
      application.logo,
      labLogoUrl,
      "SoftwareApplication logo",
      issues,
    );
  }
  if (atlasWebpage) {
    requireExact(
      atlasWebpage["@id"],
      atlasWebpageId,
      "Atlas WebPage @id",
      issues,
    );
    requireExact(atlasWebpage.url, componentsUrl, "Atlas WebPage URL", issues);
  }
  if (atlasApplication) {
    requireExact(
      atlasApplication["@id"],
      atlasApplicationId,
      "Atlas SoftwareApplication @id",
      issues,
    );
    requireExact(
      atlasApplication.url,
      componentsUrl,
      "Atlas SoftwareApplication URL",
      issues,
    );
  }
  if (packages) {
    requireExact(packages["@id"], packagesId, "ItemList @id", issues);
    requireExact(packages.url, `${siteUrl}#libraries`, "ItemList URL", issues);
    requireExact(packages.numberOfItems, 3, "ItemList count", issues);
    const packageContracts = (packages.itemListElement ?? []).map((entry) => ({
      codeRepository: entry.item?.codeRepository,
      name: entry.item?.name,
      programmingLanguage: entry.item?.programmingLanguage,
      url: entry.item?.url,
      version: entry.item?.version,
    }));
    requireExact(
      JSON.stringify(packageContracts),
      JSON.stringify([
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
      ]),
      "ItemList package contracts",
      issues,
    );
  }

  for (const type of ["WebPage", "SoftwareApplication", "ItemList"]) {
    if (notFoundNodes.some((node) => node["@type"] === type)) {
      issues.push(`404.html incorrectly contains home-only ${type} schema`);
    }
  }
}

/**
 * Validates the exact files GitHub Pages receives, including the root-level
 * verification resource, rather than relying on source intent.
 *
 * @returns {Promise<string[]>} Actionable problems found in the export.
 */
export async function collectExportIssues() {
  const issues = [];
  const index = (await readExportFile("index.html", issues)).toString("utf8");
  const lab = (await readExportFile("lab/index.html", issues)).toString("utf8");
  const components = (
    await readExportFile("components/index.html", issues)
  ).toString("utf8");
  const notFound = (await readExportFile("404.html", issues)).toString("utf8");
  const robots = (await readExportFile("robots.txt", issues)).toString("utf8");
  const sitemap = (await readExportFile("sitemap.xml", issues)).toString(
    "utf8",
  );
  const manifest = (
    await readExportFile("manifest.webmanifest", issues)
  ).toString("utf8");
  const browserConfig = (
    await readExportFile("browserconfig.xml", issues)
  ).toString("utf8");
  const socialImage = await readExportFile(
    "ste-systems-social-preview.png",
    issues,
  );
  const googleVerification = (
    await readExportFile(googleVerificationFile, issues)
  ).toString("utf8");
  const shippingOutput = [
    index,
    lab,
    components,
    notFound,
    robots,
    sitemap,
    manifest,
    browserConfig,
  ].join("\n");

  // Generous raw-size ceilings catch accidental payload duplication without
  // turning normal framework chunk movement into a brittle snapshot.
  const nextStaticFiles = await collectArtifactFiles(
    path.join(exportRoot, "_next", "static"),
    issues,
  );
  const totalByExtension = (pattern) =>
    nextStaticFiles
      .filter((file) => pattern.test(file.path))
      .reduce((total, file) => total + file.size, 0);
  enforceArtifactBudget(
    Buffer.byteLength(index),
    96 * 1024,
    "Raw index.html",
    issues,
  );
  enforceArtifactBudget(
    Buffer.byteLength(lab),
    256 * 1024,
    "Raw lab/index.html",
    issues,
  );
  enforceArtifactBudget(
    Buffer.byteLength(components),
    768 * 1024,
    "Raw components/index.html",
    issues,
  );
  enforceArtifactBudget(
    totalByExtension(/\.js$/),
    1024 * 1024,
    "Total Next.js JavaScript",
    issues,
  );
  enforceArtifactBudget(
    totalByExtension(/\.css$/),
    nextCssBudgetBytes,
    "Total Next.js CSS",
    issues,
  );
  enforceArtifactBudget(
    totalByExtension(/\.(?:woff2?|ttf|otf)$/),
    exportedFontBudgetBytes,
    "Total exported fonts",
    issues,
  );

  requireText(index, '<html lang="en">', "document language", issues);
  requireText(index, `<title>${siteTitle}</title>`, "document title", issues);
  requireText(
    index,
    `<meta name="description" content="${siteDescription}"`,
    "meta description",
    issues,
  );
  requireText(
    index,
    '<meta name="author" content="Sanderson Technology Enterprises LLC"',
    "author metadata",
    issues,
  );
  requireText(
    index,
    '<meta name="publisher" content="Sanderson Technology Enterprises LLC"',
    "publisher metadata",
    issues,
  );
  requireText(
    index,
    `<link rel="canonical" href="${siteUrl}"`,
    "canonical URL",
    issues,
  );
  requireText(
    lab,
    `<link rel="canonical" href="${labUrl}"`,
    "lab canonical URL",
    issues,
  );
  requireText(
    components,
    `<link rel="canonical" href="${componentsUrl}"`,
    "component atlas canonical URL",
    issues,
  );
  requireText(
    index,
    `property="og:url" content="${siteUrl}"`,
    "Open Graph URL",
    issues,
  );
  requireText(
    index,
    `property="og:image" content="${socialImageUrl}"`,
    "Open Graph image",
    issues,
  );
  requireText(
    index,
    `property="og:image:alt" content="${socialImageAlt}"`,
    "Open Graph image alt",
    issues,
  );
  requireText(
    index,
    `name="twitter:image" content="${socialImageUrl}"`,
    "Twitter image",
    issues,
  );
  requireText(
    index,
    `name="twitter:image:alt" content="${socialImageAlt}"`,
    "Twitter image alt",
    issues,
  );
  requireText(
    index,
    'name="twitter:card" content="summary_large_image"',
    "Twitter card",
    issues,
  );
  for (const asset of [
    "favicon.ico",
    "favicon-32x32.png",
    "favicon-16x16.png",
    "apple-touch-icon.png",
  ]) {
    requireText(
      index,
      `href="${siteUrl}${asset}"`,
      `absolute metadata icon ${asset}`,
      issues,
    );
  }
  requireText(
    index,
    `<link rel="manifest" href="${basePath}/manifest.webmanifest"`,
    "manifest path",
    issues,
  );
  requireText(
    index,
    `${basePath}/_next/`,
    "Pages-prefixed application assets",
    issues,
  );
  requireText(index, "Design every layer.", "primary page content", issues);
  requireExact(
    googleVerification,
    googleVerificationText,
    "Google verification file contents",
    issues,
  );
  requireText(
    lab,
    "Configure the system. Inspect every layer.",
    "lab primary content",
    issues,
  );
  requireText(
    components,
    "Every contract. Live, inspectable, and ready to copy.",
    "component atlas primary content",
    issues,
  );
  requireText(
    notFound,
    "This interface is outside the system.",
    "custom 404 content",
    issues,
  );

  const companyLinkCount = (
    index.match(new RegExp(`href="${corporateUrl}"`, "g")) ?? []
  ).length;
  if (companyLinkCount < 2) {
    issues.push(
      `Expected at least two corporate links, found ${companyLinkCount}`,
    );
  }
  requireText(
    index,
    `href="${customizedPlatformsUrl}"`,
    "Customized Platforms link",
    issues,
  );

  for (const staleUrl of staleLabUrls) {
    rejectText(shippingOutput, staleUrl, "superseded Lab URL", issues);
  }

  const notFoundRobotDirectives = [
    ...notFound.matchAll(/<meta name="robots" content="([^"]+)"/g),
  ].map((match) => match[1].toLowerCase());
  if (!notFoundRobotDirectives.some((value) => value.includes("noindex"))) {
    issues.push("Custom 404 is missing a noindex directive");
  }
  if (
    notFoundRobotDirectives.some(
      (value) =>
        /(?:^|,\s*)index(?:,|$)/.test(value) && !value.includes("noindex"),
    )
  ) {
    issues.push("Custom 404 contains a conflicting index directive");
  }
  rejectText(notFound, '<link rel="canonical"', "404 canonical", issues);
  rejectText(notFound, '<meta property="og:', "404 Open Graph tag", issues);
  rejectText(notFound, '<meta name="twitter:', "404 Twitter tag", issues);

  const headingCount = (index.match(/<h1(?:\s|>)/g) ?? []).length;
  requireExact(headingCount, 1, "home h1 count", issues);
  const labHeadingCount = (lab.match(/<h1(?:\s|>)/g) ?? []).length;
  requireExact(labHeadingCount, 1, "lab h1 count", issues);
  const atlasTitleCount = (
    components.match(/<h1\s+id="atlas-title"(?:\s|>)/g) ?? []
  ).length;
  requireExact(atlasTitleCount, 1, "component atlas title count", issues);

  for (const url of resourceUrls) {
    requireText(lab, `href="${url}"`, "library resource link", issues);
  }

  await validateLocalAssets(index, "index.html", issues);
  await validateLocalAssets(lab, "lab/index.html", issues);
  await validateLocalAssets(components, "components/index.html", issues);
  await validateLocalAssets(notFound, "404.html", issues);
  validateStructuredData(index, lab, components, notFound, issues);

  // Absolute metadata URLs still need a corresponding file in the Pages artifact.
  for (const metadataIcon of [
    "favicon.ico",
    "favicon-32x32.png",
    "favicon-16x16.png",
    "apple-touch-icon.png",
  ]) {
    await readExportFile(metadataIcon, issues);
  }

  requireText(robots, "User-Agent: *", "robots rule", issues);
  requireText(robots, "Allow: /", "robots allow directive", issues);
  requireText(
    robots,
    `Sitemap: ${siteUrl}sitemap.xml`,
    "robots sitemap",
    issues,
  );
  if (/^Host:/m.test(robots)) {
    issues.push("robots.txt must not emit a project-path Host directive");
  }
  requireExact(
    (sitemap.match(/<loc>/g) ?? []).length,
    3,
    "sitemap location count",
    issues,
  );
  requireText(sitemap, `<loc>${siteUrl}</loc>`, "sitemap location", issues);
  requireText(sitemap, `<loc>${labUrl}</loc>`, "lab sitemap location", issues);
  requireText(
    sitemap,
    `<loc>${componentsUrl}</loc>`,
    "component atlas sitemap location",
    issues,
  );
  rejectText(sitemap, "<lastmod>", "unstable sitemap lastmod", issues);

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
      requireExact(tags.length, 1, `${name} tag count`, issues);
      requireExact(tags[0]?.[1], expected, `${name} token`, issues);
    } else if (tags.length > 0) {
      issues.push(`Unexpected ${name} tag without a configured token`);
    }
  }

  if (manifest) {
    try {
      const parsedManifest = JSON.parse(manifest);
      for (const key of ["id", "start_url", "scope"]) {
        requireExact(
          parsedManifest[key],
          `${basePath}/`,
          `Manifest ${key}`,
          issues,
        );
      }
      requireExact(
        JSON.stringify(parsedManifest.icons),
        JSON.stringify([
          {
            src: `${basePath}/android-chrome-192x192.png`,
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${basePath}/android-chrome-512x512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${basePath}/maskable-icon-512x512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ]),
        "Manifest icon descriptors",
        issues,
      );
      for (const icon of parsedManifest.icons ?? []) {
        if (!icon.src.startsWith(`${basePath}/`)) {
          issues.push(`Manifest icon is not Pages-aware: ${icon.src}`);
        } else {
          await readExportFile(icon.src.slice(basePath.length + 1), issues);
        }
      }
    } catch {
      issues.push("manifest.webmanifest is not valid JSON");
    }
  }

  requireText(
    browserConfig,
    `${siteUrl}mstile-150x150.png`,
    "canonical Microsoft tile",
    issues,
  );
  requireText(
    browserConfig,
    "<TileColor>#07111f</TileColor>",
    "Microsoft tile color",
    issues,
  );

  if (socialImage.length >= 24) {
    requireExact(
      socialImage.subarray(0, 8).toString("hex"),
      "89504e470d0a1a0a",
      "Social image PNG signature",
      issues,
    );
    const width = socialImage.readUInt32BE(16);
    const height = socialImage.readUInt32BE(20);
    if (width !== 1200 || height !== 630) {
      issues.push(`Social image must be 1200x630, found ${width}x${height}`);
    }
  }

  return issues;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const issues = await collectExportIssues();

  if (issues.length > 0) {
    console.error("GitHub Pages export verification failed:\n");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log(
      "GitHub Pages export verified: SEO, base paths, and resources are production-ready.",
    );
  }
}

const basePath = "";
const origin = "https://stesystems.com";
const productionUrl = `${origin}/`;
const labPath = "/lab/";
const componentsPath = "/components/";

export const SITE = {
  basePath,
  origin,
  name: "STE Systems",
  title: "STE Systems | Accessible Three-Library Design System",
  description:
    "STE Systems is the accessible three-library design system from Sanderson Technology Enterprises LLC, combining layout, visual identity, and interaction primitives in one interface.",
  url: productionUrl,
  labPath,
  labUrl: new URL(labPath.replace(/^\/+/, ""), productionUrl).href,
  componentsPath,
  componentsUrl: new URL(componentsPath.replace(/^\/+/, ""), productionUrl)
    .href,
  repository: "https://github.com/Sanderson-Technology-Enterprises/ste-systems",
  socialImage: `${productionUrl}ste-systems-social-preview.png`,
  socialImageAlt:
    "STE Systems social preview with the text \u201c3 libraries, 1 interface, and 218,400 possibilities\u201d over layout, identity, and interaction.",
  brandLogoPath: "ste-systems-logo.png",
  brandLogo: `${productionUrl}ste-systems-logo.png`,
  brandLogoAlt: "STE Systems logo",
  owner: {
    name: "Sanderson Technology Enterprises",
    legalName: "Sanderson Technology Enterprises LLC",
    title: "Sanderson Technology Enterprises | Strategic Platform Development",
    slogan: "Strategic Platform Development",
    url: "https://sandersontechnologyenterprises.com/",
    github: "https://github.com/Sanderson-Technology-Enterprises",
    organizationId: "https://sandersontechnologyenterprises.com/#organization",
    logo: "https://sandersontechnologyenterprises.com/assets/icon-512.png",
    image:
      "https://sandersontechnologyenterprises.com/assets/social-preview.png",
    description:
      "Software studio building creator-owned web platforms, private content systems, admin dashboards, and operational workflows for specialized businesses.",
  },
  customizedPlatforms: {
    name: "Customized Platforms",
    url: "https://customizedplatforms.com/",
  },
  productLine: "A product of Sanderson Technology Enterprises LLC",
  locale: "en_US",
} as const;

type VerificationEnvironment = Readonly<Record<string, string | undefined>>;

type VerificationMetadata = {
  google?: string;
  other?: Record<string, string>;
};

/** Prefixes local export assets only when a Pages base path is explicitly supplied. */
export function withBasePath(
  path: string,
  requestedBasePath = process.env.PAGES_BASE_PATH ?? "",
): string {
  const trimmedBasePath = requestedBasePath.trim();
  const normalizedBasePath = trimmedBasePath
    ? `/${trimmedBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "")}`;

  if (!normalizedBasePath || normalizedBasePath === "/") {
    return normalizedPath;
  }

  return normalizedPath === "/"
    ? `${normalizedBasePath}/`
    : `${normalizedBasePath}${normalizedPath}`;
}

/** Resolves metadata assets against the canonical site URL, never the host root. */
export function absoluteSiteAsset(path: string): string {
  return new URL(path.replace(/^\/+/, ""), SITE.url).href;
}

/** Omits optional ownership-verification tags until a real trimmed token exists. */
export function buildVerificationMetadata(
  environment: VerificationEnvironment = process.env,
): VerificationMetadata | undefined {
  const google = environment.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = environment.BING_SITE_VERIFICATION?.trim();

  if (!google && !bing) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

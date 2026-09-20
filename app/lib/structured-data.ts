import { ECOSYSTEM_PACKAGES } from "../data/ecosystem";
import { SITE } from "./site";

const packageItems = ECOSYSTEM_PACKAGES.map((pkg, index) => ({
  "@type": "ListItem",
  position: index + 1,
  item: {
    "@type": "SoftwareSourceCode",
    name: pkg.name,
    description: pkg.summary,
    version: pkg.version,
    codeRepository: pkg.links.repository,
    url: pkg.links.npm,
    programmingLanguage: "CSS",
  },
}));

export function buildHomeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE.url}#webpage`,
        name: SITE.title,
        url: SITE.url,
        description: SITE.description,
        isPartOf: { "@id": `${SITE.url}#website` },
        publisher: { "@id": SITE.owner.organizationId },
        inLanguage: "en-US",
      },
      {
        "@type": "ItemList",
        "@id": `${SITE.url}#packages`,
        name: "STE Systems packages",
        url: `${SITE.url}#libraries`,
        numberOfItems: ECOSYSTEM_PACKAGES.length,
        itemListElement: packageItems,
      },
    ],
  };
}

export function buildLabStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE.labUrl}#webpage`,
        name: `Live interface lab | ${SITE.name}`,
        url: SITE.labUrl,
        description:
          "Configure and inspect all three STE Systems CSS libraries on one semantic interface.",
        isPartOf: { "@id": `${SITE.url}#website` },
        publisher: { "@id": SITE.owner.organizationId },
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE.labUrl}#application`,
        name: `${SITE.name} live lab`,
        url: SITE.labUrl,
        description:
          "A configurable interface workbench for layout, visual identity, and interaction states.",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        codeRepository: SITE.repository,
        publisher: { "@id": SITE.owner.organizationId },
        logo: SITE.brandLogo,
      },
    ],
  };
}

/** Builds schema metadata for the exhaustive, manifest-backed component route. */
export function buildAtlasStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE.componentsUrl}#webpage`,
        name: `Component Atlas | ${SITE.name}`,
        url: SITE.componentsUrl,
        description:
          "An exhaustive atlas of the layout, visual, native-element, and interaction contracts published by the three STE Systems CSS libraries.",
        isPartOf: { "@id": `${SITE.url}#website` },
        publisher: { "@id": SITE.owner.organizationId },
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE.componentsUrl}#application`,
        name: `${SITE.name} Component Atlas`,
        url: SITE.componentsUrl,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        codeRepository: SITE.repository,
        publisher: { "@id": SITE.owner.organizationId },
      },
    ],
  };
}

/** Escapes opening tags so embedded JSON-LD cannot terminate its script node. */
export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

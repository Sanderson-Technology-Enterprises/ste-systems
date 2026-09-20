import type { Metadata } from "next";

import { ComponentAtlas } from "../components/atlas/ComponentAtlas";
import { ExternalLinkIcon } from "../components/Icons";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { ATLAS_COVERAGE } from "../data/atlas";
import { ECOSYSTEM_PACKAGES } from "../data/ecosystem";
import {
  ATLAS_NAVIGATION_ACTIONS,
  ATLAS_NAVIGATION_ITEMS,
} from "../data/navigation";
import { SITE } from "../lib/site";
import {
  buildAtlasStructuredData,
  serializeStructuredData,
} from "../lib/structured-data";

const atlasDescription =
  "Explore every published layout, UI, native-element, and interaction contract in the three STE Systems CSS libraries.";

export const metadata: Metadata = {
  title: "Component Atlas",
  description: atlasDescription,
  alternates: { canonical: SITE.componentsUrl },
  openGraph: {
    type: "website",
    url: SITE.componentsUrl,
    title: `Component Atlas | ${SITE.name}`,
    description: atlasDescription,
    siteName: SITE.name,
    locale: SITE.locale,
    images: [
      {
        url: SITE.socialImage,
        width: 1200,
        height: 630,
        alt: SITE.socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Component Atlas | ${SITE.name}`,
    description: atlasDescription,
    images: [{ url: SITE.socialImage, alt: SITE.socialImageAlt }],
  },
};

const serializedAtlasStructuredData = serializeStructuredData(
  buildAtlasStructuredData(),
);

/**
 * Renders the exhaustive Component Atlas route and direct library resources.
 *
 * @returns The statically exported Component Atlas page.
 */
export default function ComponentsPage() {
  return (
    <div
      className="experience atlas-experience ly-root ly-page"
      data-ly-layout="synthwave"
      data-mode="dark"
      data-theme="midnight-gold"
      data-ui="minimal-saas"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedAtlasStructuredData }}
      />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader
        actionItems={ATLAS_NAVIGATION_ACTIONS}
        brandHref="/"
        menuLabel="Atlas sections"
        navigationItems={ATLAS_NAVIGATION_ITEMS}
        presentation="disclosure"
      />

      <main id="main-content" tabIndex={-1}>
        <section
          aria-labelledby="atlas-title"
          className="atlas-hero ly-wrapper ly-section ly-stack ly-gap-8"
          id="atlas-top"
        >
          <div className="atlas-hero-copy ly-stack ly-gap-4">
            <p className="section-label">Exhaustive component reference</p>
            <h1 id="atlas-title">
              Component Atlas
              <span>Every contract. Live, inspectable, and ready to copy.</span>
            </h1>
            <p className="lede">
              Search the complete published surface of all three libraries,
              inspect the consumer HTML for any rendered element, and copy a
              clean subtree without lab-only attributes.
            </p>
          </div>

          <dl className="atlas-hero-metrics">
            <div>
              <dt>Layout contracts</dt>
              <dd>
                {ATLAS_COVERAGE.layout.wrappers.length +
                  ATLAS_COVERAGE.layout.primitives.length +
                  ATLAS_COVERAGE.layout.recipes.length +
                  ATLAS_COVERAGE.layout.areas.length +
                  ATLAS_COVERAGE.layout.personalities.length}
              </dd>
            </div>
            <div>
              <dt>UI visual classes</dt>
              <dd>
                {ATLAS_COVERAGE.ui.semanticSelectors.length +
                  ATLAS_COVERAGE.ui.universalVisualSuffixes.length}
              </dd>
            </div>
            <div>
              <dt>Native elements</dt>
              <dd>
                {Object.values(ATLAS_COVERAGE.ui.nativeElements).flat().length}
              </dd>
            </div>
          </dl>

          <nav
            className="atlas-package-rail"
            aria-label="Library package and demo links"
          >
            {ECOSYSTEM_PACKAGES.map((pkg) => (
              <article key={pkg.name}>
                <span>{pkg.layer}</span>
                <strong>{pkg.name}</strong>
                <div>
                  <a
                    href={pkg.links.npm}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    npm <ExternalLinkIcon />
                    <span className="ly-visually-hidden">
                      {" "}
                      (opens in a new tab)
                    </span>
                  </a>
                  <a
                    href={pkg.links.demo}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Demo <ExternalLinkIcon />
                    <span className="ly-visually-hidden">
                      {" "}
                      (opens in a new tab)
                    </span>
                  </a>
                </div>
              </article>
            ))}
          </nav>
        </section>

        <div className="ly-wrapper atlas-workspace">
          <ComponentAtlas />
        </div>
      </main>

      <SiteFooter companyUrl={SITE.owner.url} />
    </div>
  );
}

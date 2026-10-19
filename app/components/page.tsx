import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";

import { LibraryGuides } from "../components/guides/LibraryGuides";
import { ArrowRightIcon } from "../components/Icons";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import {
  ATLAS_NAVIGATION_ACTIONS,
  ATLAS_NAVIGATION_ITEMS,
} from "../data/navigation";
import { SITE, withBasePath } from "../lib/site";
import {
  buildAtlasStructuredData,
  serializeStructuredData,
} from "../lib/structured-data";

const atlasDescription =
  "Learn Layout Style CSS, UI Style Kit CSS, Interactive Surface CSS, and STE USK React with concise guides, examples, and copyable code.";

export const metadata: Metadata = {
  title: "Components & library guides",
  description: atlasDescription,
  alternates: { canonical: SITE.componentsUrl },
  openGraph: {
    type: "website",
    url: SITE.componentsUrl,
    title: `Components & library guides | ${SITE.name}`,
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
    title: `Components & library guides | ${SITE.name}`,
    description: atlasDescription,
    images: [{ url: SITE.socialImage, alt: SITE.socialImageAlt }],
  },
};

const serializedAtlasStructuredData = serializeStructuredData(
  buildAtlasStructuredData(),
);

/**
 * Renders four focused library guides and a handoff to the configurable Lab.
 *
 * @returns The statically exported Components & library guides page.
 */
export default function ComponentsPage() {
  /** Read the actual compiled example at build time so displayed JSX cannot drift. */
  const reactSource = readFileSync(
    path.join(process.cwd(), "app/components/guides/ReactProjectExample.tsx"),
    "utf8",
  ).trim();
  const labHref = withBasePath(SITE.labPath);
  return (
    <div
      className="experience atlas-experience ly-root ly-page"
      data-ly-layout="minimal-saas"
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
        menuLabel="Library guides"
        navigationItems={ATLAS_NAVIGATION_ITEMS}
        presentation="disclosure"
      />

      <main id="main-content" tabIndex={-1}>
        <section
          aria-labelledby="atlas-title"
          className="guide-hero ly-wrapper ly-stack ly-gap-6"
          id="atlas-top"
        >
          <p className="section-label">The ecosystem, explained</p>
          <h1 id="atlas-title">Components &amp; library guides</h1>
          <p className="lede">
            Three CSS libraries for structure, appearance, and interaction. One
            React library that brings them together. Learn the essentials here,
            then explore the complete system in the Lab.
          </p>
          <a
            className="usk-button interactive-surface guide-lab-cta"
            data-ui-variant="primary"
            data-surface-variant="accent"
            data-surface-level="2"
            href={labHref}
          >
            View full Lab <ArrowRightIcon />
          </a>
          <a
            className="guide-reference-link"
            href={withBasePath("/components/reference/")}
          >
            Read all guides without interactive previews
          </a>
        </section>
        <div className="ly-wrapper guide-workspace">
          <LibraryGuides reactSource={reactSource} />
        </div>
        <section
          className="ly-wrapper guide-lab-banner"
          aria-labelledby="guide-lab-title"
        >
          <div className="usk-card guide-lab-banner-inner ly-stack ly-gap-4">
            <p className="section-label">Go from reference to exploration</p>
            <h2 id="guide-lab-title">See the whole system in action</h2>
            <p>
              Try layout personalities, visual presets, themes, and interaction
              states together in the full STE Systems Lab.
            </p>
            <a
              className="usk-button interactive-surface guide-lab-cta"
              data-ui-variant="primary"
              data-surface-variant="accent"
              data-surface-level="2"
              href={labHref}
            >
              View full Lab <ArrowRightIcon />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter companyUrl={SITE.owner.url} />
    </div>
  );
}

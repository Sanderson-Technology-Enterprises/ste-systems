import type { Metadata } from "next";

import { ClientSystems } from "./components/ClientSystems";
import { ConfigurationReference } from "./components/ConfigurationReference";
import { FeatureShowcase } from "./components/FeatureShowcase";
import { HomeHeroActions } from "./components/HeroActions";
import { HomeObservatory } from "./components/HomeObservatory";
import { WebsiteTemplateGallery } from "./components/studio/WebsiteTemplateGallery";
import { HomeExperience } from "./components/HomeExperience";
import { ExternalLinkIcon } from "./components/Icons";
import { LegacyLabRedirect } from "./components/LegacyLabRedirect";
import { QuickStartCopy } from "./components/QuickStartCopy";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import {
  HOME_NAVIGATION_ACTIONS,
  HOME_NAVIGATION_ITEMS,
} from "./data/navigation";
import { SUPPORTED_COMBINATIONS_LABEL } from "./data/atlas";
import { NPM_INSTALL } from "./data/ecosystem";
import { SITE, withBasePath } from "./lib/site";
import {
  buildHomeStructuredData,
  serializeStructuredData,
} from "./lib/structured-data";

const companyUrl = SITE.owner.url;

export const metadata: Metadata = {
  description: SITE.description,
  category: "technology",
  classification: "Developer tools",
  keywords: [
    "CSS design system",
    "CSS layout library",
    "accessible interface components",
    "layout-style-css",
    "ui-style-kit-css",
    "interactive-surface-css",
    "frontend development",
  ],
  alternates: { canonical: SITE.url },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
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
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.socialImage, alt: SITE.socialImageAlt }],
  },
};

const serializedHomeStructuredData = serializeStructuredData(
  buildHomeStructuredData(),
);

/** Introduces the exact CSS package versions used by the site. */
function QuickStartSection() {
  return (
    <section
      className="section-band ly-section"
      id="get-started"
      aria-labelledby="get-started-title"
    >
      <div className="ly-wrapper quick-start-layout ly-grid ly-gap-8">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">Quick start</p>
          <h2 id="get-started-title">Install the complete stack.</h2>
          <p>
            Install the exact CSS package versions used by this site. Choose the
            imports for the libraries your application needs.
          </p>
          <a
            className="interactive-surface site-action ly-self-start"
            data-surface-variant="subtle"
            data-surface-level="1"
            href={withBasePath(`${SITE.labPath}#install`)}
          >
            View every installation option
          </a>
        </div>
        <QuickStartCopy command={NPM_INSTALL} />
      </div>
    </section>
  );
}

/** Directs readers to the configurable Lab from the fixed homepage. */
function LabInvitationSection() {
  return (
    <section
      className="section-band ly-section"
      id="lab"
      aria-labelledby="lab-title"
    >
      <div className="ly-wrapper lab-invitation ly-split ly-gap-8 ly-items-center">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">Interactive lab</p>
          <h2 id="lab-title">Configure once. Inspect every layer.</h2>
          <p>
            Explore {SUPPORTED_COMBINATIONS_LABEL} supported combinations across
            layout presets, page structures, spacing, visual styles, and color
            schemes. Light, dark, and high-contrast modes are available in
            addition to these combinations.
          </p>
        </div>
        <a
          className="interactive-surface site-action"
          data-surface-variant="accent"
          data-surface-level="2"
          href={withBasePath(SITE.labPath)}
        >
          Open the configurable lab
        </a>
      </div>
    </section>
  );
}

/** Connects the public library examples with the studio's application services. */
function CompanySection() {
  return (
    <section
      className="company-section section-band ly-section"
      id="company"
      aria-labelledby="company-title"
    >
      <div className="ly-wrapper company-overview ly-split ly-gap-8 ly-items-start">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">About the studio</p>
          <h2 id="company-title">Software built around your business.</h2>
          <p>
            Sanderson Technology Enterprises LLC builds custom applications and
            the reusable systems behind them. STE Systems introduces its public
            CSS libraries and private application toolkit.
          </p>
        </div>
        <article className="conversion-path ly-stack ly-gap-4 ly-items-start ly-pad-4">
          <p className="section-label">Custom application development</p>
          <h3>Build tools around the way you work.</h3>
          <p>
            STE builds creator-owned platforms, private systems, admin tools,
            and operational workflows for specialized businesses.
          </p>
          <a
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            href={companyUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Discover {SITE.owner.legalName}
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
          <a
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            href={SITE.customizedPlatforms.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Explore {SITE.customizedPlatforms.name}
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
        </article>
      </div>
    </section>
  );
}

/**
 * Renders the spacious-density overview route for the four-library interface
 * system and its adoption paths.
 *
 * @returns The exported STE Systems homepage.
 */
export default function Home() {
  return (
    <HomeExperience>
      <LegacyLabRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedHomeStructuredData }}
      />
      <a className="interactive-surface skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader
        actionItems={HOME_NAVIGATION_ACTIONS}
        brandHref="#top"
        menuLabel="Menu"
        navigationItems={HOME_NAVIGATION_ITEMS}
        presentation="responsive"
      />

      {/* A programmatic focus target lets the skip link transfer focus reliably. */}
      <main id="main-content" tabIndex={-1}>
        <section
          className="hero home-hero home-template-entry ly-wrapper ly-section ly-split ly-gap-6 ly-items-start"
          id="top"
          aria-labelledby="home-title"
        >
          <div className="hero-copy ly-stack ly-gap-6">
            <p className="section-label">STE client design studio</p>
            <h1 id="home-title">
              Plan the look and feel
              <br />
              <em>of your STE website.</em>
            </h1>
            <p className="lede">
              Explore styles, colors, layouts, icons, and motion in working
              sample websites. Save a complete design preference brief for STE
              to implement.
            </p>
            <HomeHeroActions />
          </div>

          <WebsiteTemplateGallery compact />
        </section>
        <section
          className="ly-wrapper ly-section ly-stack ly-gap-4"
          aria-labelledby="system-exploration-title"
        >
          <h2 id="system-exploration-title">
            Explore how the design system works
          </h2>
          <HomeObservatory />
        </section>
        <FeatureShowcase />
        <ConfigurationReference />
        <ClientSystems />
        <QuickStartSection />
        <LabInvitationSection />
        <CompanySection />
      </main>

      <SiteFooter companyUrl={companyUrl} />
    </HomeExperience>
  );
}

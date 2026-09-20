import type { Metadata } from "next";

import { CombinedWorkbench } from "../components/CombinedWorkbench";
import { LabHeroActions } from "../components/HeroActions";
import { InstallGuide } from "../components/InstallGuide";
import { InterfaceObservatory } from "../components/InterfaceObservatory";
import { LabControls } from "../components/LabControls";
import { LabExperience } from "../components/LabExperience";
import { InteractionLab } from "../components/labs/InteractionLab";
import { IntegrationLab } from "../components/labs/IntegrationLab";
import { LayoutLab } from "../components/labs/LayoutLab";
import { UiNativeLab } from "../components/labs/UiNativeLab";
import { LibraryDirectory } from "../components/LibraryDirectory";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import {
  LAB_NAVIGATION_ACTIONS,
  LAB_NAVIGATION_ITEMS,
} from "../data/navigation";
import { SITE } from "../lib/site";
import {
  buildLabStructuredData,
  serializeStructuredData,
} from "../lib/structured-data";

const labDescription =
  "Configure layout, visual style, palette, and mode, then inspect all three STE Systems CSS libraries on shared semantic markup.";

export const metadata: Metadata = {
  title: "Configurable CSS workbench",
  description: labDescription,
  alternates: { canonical: SITE.labUrl },
  openGraph: {
    type: "website",
    url: SITE.labUrl,
    title: `Configurable CSS workbench | ${SITE.name}`,
    description: labDescription,
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
    title: `Configurable CSS workbench | ${SITE.name}`,
    description: labDescription,
    images: [{ url: SITE.socialImage, alt: SITE.socialImageAlt }],
  },
};

const serializedLabStructuredData = serializeStructuredData(
  buildLabStructuredData(),
);

/**
 * Renders the configurable package workbench and its focused laboratory
 * sections under the shared Lab experience provider.
 *
 * @returns The exported STE Systems Lab route.
 */
export default function Lab() {
  return (
    <LabExperience>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedLabStructuredData }}
      />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader
        actionItems={LAB_NAVIGATION_ACTIONS}
        brandHref="/"
        menuLabel="Lab sections"
        navigationItems={LAB_NAVIGATION_ITEMS}
        presentation="disclosure"
      />

      {/* A programmatic focus target lets the skip link transfer focus reliably. */}
      <main id="main-content" tabIndex={-1}>
        <section
          className="hero lab-hero ly-wrapper ly-section ly-split ly-gap-8 ly-items-center"
          id="top"
          aria-labelledby="lab-title"
        >
          <div className="hero-copy ly-stack ly-gap-6">
            <p className="section-label">Configurable package workbench</p>
            <h1 id="lab-title">Configure the system. Inspect every layer.</h1>
            <p className="lede">
              Change layout, visual style, palette, and mode, then inspect how
              all three libraries behave on the same semantic markup.
            </p>
            <LabHeroActions />
          </div>

          <InterfaceObservatory />
        </section>

        <div
          className="configuration-shell ly-wrapper ly-wrapper--workspace"
          data-ly-density="compact"
        >
          <LabControls />
        </div>

        <CombinedWorkbench />
        <LayoutLab />
        <UiNativeLab />
        <InteractionLab />
        <IntegrationLab />
        <InstallGuide />
        <LibraryDirectory />
      </main>

      <SiteFooter companyUrl={SITE.owner.url} />
    </LabExperience>
  );
}

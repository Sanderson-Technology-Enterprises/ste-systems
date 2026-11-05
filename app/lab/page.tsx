import type { Metadata } from "next";

import { EditorChrome as InterfaceRoot } from "../components/EditorChrome";
import { LabWorkbench } from "../components/LabWorkbench";
import { AdvancedLabExamples } from "../components/AdvancedLabExamples";
import { InstallGuide } from "../components/InstallGuide";
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
import { SITE, withBasePath } from "../lib/site";
import {
  buildLabStructuredData,
  serializeStructuredData,
} from "../lib/structured-data";

const labDescription =
  "Configure layout, visual style, palette, and mode, then inspect the four STE Systems CSS layers on shared semantic markup.";

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
    <LabExperience stableEditor>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedLabStructuredData }}
      />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <InterfaceRoot
        preset="minimal-saas"
        theme="midnight-gold"
        mode="dark"
        data-editor-chrome
      >
        <SiteHeader
          actionItems={LAB_NAVIGATION_ACTIONS}
          brandHref="/"
          menuLabel="Lab sections"
          navigationItems={LAB_NAVIGATION_ITEMS}
          presentation="disclosure"
        />
      </InterfaceRoot>

      {/* A programmatic focus target lets the skip link transfer focus reliably. */}
      <main id="main-content" tabIndex={-1}>
        <InterfaceRoot
          preset="minimal-saas"
          theme="midnight-gold"
          mode="dark"
          data-editor-chrome
        >
          <section
            className="workbench-introduction ly-wrapper ly-stack ly-gap-3"
            id="top"
            aria-labelledby="lab-title"
          >
            <div className="hero-copy ly-stack ly-gap-3">
              <p className="section-label">Client configuration workbench</p>
              <h1 id="lab-title">Find your interface.</h1>
              <p className="lede">
                Explore every layout, visual style, and color scheme in one live
                preview. Use the left rail to customize, inspect motion, and
                export your choices.
              </p>
            </div>
          </section>
        </InterfaceRoot>
        <LabWorkbench />
        <InterfaceRoot
          preset="minimal-saas"
          theme="midnight-gold"
          mode="dark"
          data-editor-chrome
        >
          <section
            id="guides"
            className="ly-wrapper ly-section ly-stack ly-gap-4"
            aria-labelledby="try-lab-title"
          >
            <h2 id="try-lab-title">Guides and integration examples</h2>
            <p>
              <a href={withBasePath("/components/")}>
                Read the component guides
              </a>{" "}
              for APIs, accessibility guidance, and copyable examples. The
              advanced examples below isolate library behavior without adding
              another configuration menu.
            </p>
          </section>
        </InterfaceRoot>
        <AdvancedLabExamples title="Advanced library examples">
          <LayoutLab />
          <UiNativeLab />
          <InteractionLab />
        </AdvancedLabExamples>
        <AdvancedLabExamples
          title="Package integration proofs"
          anchor="integrate"
        >
          <IntegrationLab />
        </AdvancedLabExamples>
        <InterfaceRoot
          preset="minimal-saas"
          theme="midnight-gold"
          mode="dark"
          data-editor-chrome
        >
          <InstallGuide />
          <LibraryDirectory />
        </InterfaceRoot>
      </main>

      <InterfaceRoot
        preset="minimal-saas"
        theme="midnight-gold"
        mode="dark"
        data-editor-chrome
      >
        <SiteFooter companyUrl={SITE.owner.url} />
      </InterfaceRoot>
    </LabExperience>
  );
}

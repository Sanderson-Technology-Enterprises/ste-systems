import type { Metadata } from "next";

import { EditorChrome as InterfaceRoot } from "../components/EditorChrome";
import { LabWorkbench } from "../components/LabWorkbench";
import { StudioReferences } from "../components/studio/StudioReferences";
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
  "Create a complete STE website design preference brief with interactive previews, styles, comparison, and portable files.";

export const metadata: Metadata = {
  title: "Client design studio",
  description: labDescription,
  alternates: { canonical: SITE.labUrl },
  openGraph: {
    type: "website",
    url: SITE.labUrl,
    title: `Client design studio | ${SITE.name}`,
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
    title: `Client design studio | ${SITE.name}`,
    description: labDescription,
    images: [{ url: SITE.socialImage, alt: SITE.socialImageAlt }],
  },
};

const serializedLabStructuredData = serializeStructuredData(
  buildLabStructuredData(),
);

/**
 * Renders the client studio first and retains developer references in a disclosure.
 * The editor remains stable while the isolated preview owns client styling.
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
      <a className="interactive-surface skip-link" href="#main-content">
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
        <LabWorkbench />
        <StudioReferences>
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
                <a
                  className="interactive-surface"
                  href={withBasePath("/components/")}
                >
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
        </StudioReferences>
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

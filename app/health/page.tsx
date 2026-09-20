import type { Metadata } from "next";

import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import type { NavigationItem } from "../data/navigation";
import { DEFAULT_CONFIGURATION } from "../lib/configuration";
import { SITE, withBasePath } from "../lib/site";

const healthUrl = `${SITE.url}health/`;

const healthNavigationItems = [
  { label: "Overview", href: "/" },
  { label: "Lab", href: SITE.labPath },
  { label: "Components", href: "/components/" },
] as const satisfies readonly NavigationItem[];

const healthNavigationActions = [
  {
    label: "GitHub",
    href: SITE.repository,
    external: true,
    variant: "subtle",
  },
] as const satisfies readonly NavigationItem[];

export const metadata: Metadata = {
  title: "Service health",
  description: "Deployment health page for the STE Systems static site.",
  alternates: { canonical: healthUrl },
  robots: { index: false, follow: false },
};

/**
 * Renders a stable public target for Render and third-party uptime monitors.
 *
 * @returns The statically exported STE Systems health page.
 */
export default function HealthPage() {
  return (
    <div
      className="experience ly-root ly-page"
      data-ly-density="spacious"
      data-ly-layout={DEFAULT_CONFIGURATION.layout}
      data-ui={DEFAULT_CONFIGURATION.ui}
      data-theme={DEFAULT_CONFIGURATION.theme}
      data-mode={DEFAULT_CONFIGURATION.mode}
    >
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader
        actionItems={healthNavigationActions}
        brandHref="/"
        menuLabel="Menu"
        navigationItems={healthNavigationItems}
        presentation="responsive"
      />

      <main id="main-content" tabIndex={-1}>
        <section
          className="hero ly-wrapper ly-section ly-stack ly-gap-8"
          id="top"
          aria-labelledby="health-title"
        >
          <div className="hero-copy ly-stack ly-gap-6">
            <p className="section-label">Render service health</p>
            <h1 id="health-title">STE Systems is online.</h1>
            <p>
              The production static export is responding and ready to serve the
              three-library design system.
            </p>
          </div>

          <article
            className="conversion-path ly-stack ly-gap-4 ly-items-start"
            aria-label="Deployment status"
          >
            <p className="section-label">Current status</p>
            <p className="live-status" role="status">
              Operational
            </p>
            <p>
              Canonical host: <code>stesystems.com</code>
            </p>
            <a
              className="interactive-surface site-action"
              data-surface-variant="accent"
              data-surface-level="2"
              href={withBasePath("/")}
            >
              Return to STE Systems
            </a>
          </article>
        </section>
      </main>

      <SiteFooter companyUrl={SITE.owner.url} />
    </div>
  );
}

import type { Metadata } from "next";

import { DEFAULT_CONFIGURATION } from "./lib/configuration";
import { withBasePath } from "./lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested STE Systems page does not exist.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return (
    <main
      className="not-found ly-root ly-page saas-page"
      data-ly-layout={DEFAULT_CONFIGURATION.layout}
      data-ui={DEFAULT_CONFIGURATION.ui}
      data-theme={DEFAULT_CONFIGURATION.theme}
      data-mode={DEFAULT_CONFIGURATION.mode}
    >
      <div className="saas-surface saas-surface-lg ly-wrapper ly-wrapper--prose ly-section ly-stack">
        <p className="not-found-code saas-kicker">404</p>
        <h1 className="saas-title">This interface is outside the system.</h1>
        <p className="saas-copy">
          The requested page does not exist. Return to the lab to explore the
          live CSS ecosystem.
        </p>
        <a
          className="saas-button-pill interactive-surface site-action"
          data-surface-variant="primary"
          data-surface-level="2"
          href={withBasePath("/")}
        >
          Return to STE Systems
        </a>
      </div>
    </main>
  );
}

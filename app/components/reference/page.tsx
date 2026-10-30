import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  CSS_GUIDE_EXAMPLES,
  INTERACTION_GUIDE_HTML,
  LIBRARY_GUIDES,
} from "../../data/library-guides";
import { SITE, withBasePath } from "../../lib/site";
import { SiteFooter } from "../SiteFooter";

export const metadata: Metadata = {
  title: "Library reference",
  description:
    "Read all five library guides, API references, and examples without interactive previews.",
  alternates: { canonical: SITE.componentsUrl },
};

/** Presents selectable source using native HTML without a clipboard or hydration dependency. */
function ReferenceCode({
  source,
  label,
}: {
  readonly source: string;
  readonly label: string;
}) {
  return (
    <div className="guide-code">
      <pre tabIndex={0} aria-label={label}>
        <code>{source}</code>
      </pre>
    </div>
  );
}

/** Exports the same authored guide data as a fully readable, script-independent reference. */
export default function LibraryReferencePage() {
  const reactSource = readFileSync(
    path.join(process.cwd(), "app/components/guides/ReactProjectExample.tsx"),
    "utf8",
  ).trim();
  return (
    <div
      className="experience atlas-experience ly-root ly-page"
      data-ui="minimal-saas"
      data-theme="midnight-gold"
      data-mode="dark"
      data-ly-layout="minimal-saas"
    >
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="ly-wrapper guide-reference-page ly-stack ly-gap-8"
      >
        <header className="guide-hero ly-stack ly-gap-4">
          <a href={withBasePath(SITE.componentsPath)}>
            Back to interactive guides
          </a>
          <h1>Library reference</h1>
          <p>
            All five guides in one readable page. Select code to copy it
            manually; interactive previews are available in the main guides.
          </p>
          <nav
            className="guide-resource-links ly-cluster ly-gap-4"
            aria-label="Guide reference sections"
          >
            {LIBRARY_GUIDES.map((guide) => (
              <a key={guide.id} href={`#atlas-${guide.id}`}>
                {guide.name}
              </a>
            ))}
          </nav>
          <a
            className="usk-button interactive-surface guide-lab-cta"
            href={withBasePath(SITE.labPath)}
          >
            View full Lab
          </a>
        </header>
        {LIBRARY_GUIDES.map((guide) => (
          <section
            id={`atlas-${guide.id}`}
            key={guide.id}
            className="guide-panel ly-stack ly-gap-4"
            aria-labelledby={`reference-${guide.id}`}
          >
            <h2 id={`reference-${guide.id}`}>{guide.name}</h2>
            <p>{guide.summary}</p>
            <p>Version {guide.version}</p>
            <div className="guide-columns">
              <div className="guide-documentation ly-stack ly-gap-4">
                <h3>Installation and imports</h3>
                <ReferenceCode
                  source={guide.install}
                  label={`${guide.name} installation`}
                />
                <ReferenceCode
                  source={guide.imports}
                  label={`${guide.name} imports`}
                />
                <h3>Essential API</h3>
                <dl className="guide-reference-definitions ly-stack ly-gap-3">
                  {guide.concepts.map((concept) => (
                    <div key={concept.api}>
                      <dt>
                        <code>{concept.api}</code>
                      </dt>
                      <dd>{concept.description}</dd>
                    </div>
                  ))}
                </dl>
                {guide.id === "react" && (
                  <p>
                    STE USK React supplies the guide tabs and Lab configuration
                    button used on this website. It sits alongside the private
                    STE-Core application foundation and STE-SDK developer tools.
                    The CSS libraries retain ownership of structure, appearance,
                    and interaction styling.
                  </p>
                )}
                {guide.links.length > 0 && (
                  <nav
                    className="guide-resource-links ly-cluster ly-gap-3"
                    aria-label={`${guide.name} resources`}
                  >
                    {guide.links.map((link) => (
                      <a key={link.label} href={link.href}>
                        {link.label}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
              <div className="guide-examples ly-stack ly-gap-4">
                <h3>Examples</h3>
                {guide.id === "layout" || guide.id === "ui" ? (
                  CSS_GUIDE_EXAMPLES[guide.id].map((example) => (
                    <article key={example.id} className="ly-stack ly-gap-3">
                      <h4>{example.title}</h4>
                      <p>{example.description}</p>
                      <ReferenceCode
                        label={example.title}
                        source={example.html}
                      />
                    </article>
                  ))
                ) : (
                  <ReferenceCode
                    label={`${guide.name} example source`}
                    source={
                      guide.id === "react"
                        ? reactSource
                        : INTERACTION_GUIDE_HTML
                    }
                  />
                )}
              </div>
            </div>
          </section>
        ))}
      </main>
      <SiteFooter companyUrl={SITE.owner.url} />
    </div>
  );
}

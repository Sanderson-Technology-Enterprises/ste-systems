import { ECOSYSTEM_PACKAGES } from "../data/ecosystem";
import { SITE, withBasePath } from "../lib/site";
import { ArrowRightIcon, ExternalLinkIcon } from "./Icons";

const packageLabAnchors: Record<
  (typeof ECOSYSTEM_PACKAGES)[number]["name"],
  string
> = {
  "layout-style-css": "layouts",
  "ui-style-kit-css": "ui-native",
  "interactive-surface-css": "interactions",
  "@sanderson-technology-enterprises/motion-style-css": "motion",
};

export function FeatureShowcase() {
  return (
    <section
      className="section-band ly-section"
      id="libraries"
      aria-labelledby="libraries-title"
    >
      <div className="ly-wrapper">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">Four focused CSS libraries</p>
          <h2 id="libraries-title">Use one layer or compose all four.</h2>
          <p>
            Each package owns one interface layer and remains useful on its own.
            Combine them when you need the complete system.
          </p>
        </div>

        <ol className="package-overview-grid ly-grid ly-gap-6">
          {ECOSYSTEM_PACKAGES.map((pkg, index) => (
            <li
              className="package-overview-card ly-stack ly-gap-4"
              key={pkg.name}
            >
              <header className="ly-stack ly-gap-2">
                <span className="library-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="eyebrow">{pkg.layer}</p>
                <h3>{pkg.displayName}</h3>
                <code>
                  {pkg.name}@{pkg.version}
                </code>
              </header>
              <p className="muted-copy">{pkg.summary}</p>
              <div className="package-overview-actions ly-cluster ly-gap-2">
                <a
                  className="interactive-surface site-action"
                  data-surface-variant="subtle"
                  data-surface-level="1"
                  href={withBasePath(
                    `${SITE.labPath}#${packageLabAnchors[pkg.name]}`,
                  )}
                >
                  Test this layer
                  <ArrowRightIcon />
                </a>
                <a
                  className="interactive-surface site-action"
                  data-surface-variant="subtle"
                  data-surface-level="1"
                  href={pkg.links.npm}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  npm
                  <ExternalLinkIcon />
                  <span className="ly-visually-hidden">
                    {` for ${pkg.displayName} (opens in a new tab)`}
                  </span>
                </a>
                <a
                  className="interactive-surface site-action"
                  data-surface-variant="subtle"
                  data-surface-level="1"
                  href={pkg.links.demo}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Live demo
                  <ExternalLinkIcon />
                  <span className="ly-visually-hidden">
                    {` for ${pkg.displayName} (opens in a new tab)`}
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

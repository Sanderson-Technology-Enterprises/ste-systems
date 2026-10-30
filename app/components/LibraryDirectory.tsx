import { ECOSYSTEM_PACKAGES, type ResourceLink } from "../data/ecosystem";
import { withBasePath } from "../lib/site";
import { ExternalLinkIcon } from "./Icons";

const resourceLabels: Record<ResourceLink, string> = {
  repository: "Repository",
  wiki: "Wiki",
  npm: "npm package",
  demo: "Live demo",
};

const resourceOrder: readonly ResourceLink[] = [
  "repository",
  "wiki",
  "npm",
  "demo",
];

export function LibraryDirectory() {
  return (
    <section
      className="section-band ly-section"
      id="libraries"
      aria-labelledby="libraries-title"
    >
      <div className="ly-wrapper">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div>
            <p className="section-label">Directory</p>
            <h2 id="libraries-title">Package resources.</h2>
          </div>
          <p>
            Adopt one layer or combine the four. Every library remains
            independently useful, documented, and versioned.
          </p>
        </div>

        <ol className="library-list ly-stack ly-gap-0">
          {ECOSYSTEM_PACKAGES.map((pkg, index) => (
            <li
              className="ly-grid ly-grid--fixed ly-gap-4 site-pad-block-6"
              data-package={pkg.name}
              key={pkg.name}
            >
              <span className="library-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="ly-stack ly-gap-2">
                <small className="eyebrow">{pkg.layer}</small>
                <h3>{pkg.name}</h3>
                <p className="muted-copy">{pkg.summary}</p>
              </div>
              <div className="library-entrypoint ly-stack ly-gap-2">
                <code>v{pkg.version}</code>
                <small>Recommended entry point</small>
                <code>{pkg.recommendedEntryPoint}</code>
              </div>
              <div className="ly-stack ly-gap-4">
                <nav
                  className="ly-cluster ly-gap-2"
                  aria-label={`${pkg.displayName} resources`}
                >
                  {resourceOrder.map((resource) => (
                    <a
                      className="interactive-surface site-action"
                      data-surface-variant="subtle"
                      data-surface-level="1"
                      key={resource}
                      href={pkg.links[resource]}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {resourceLabels[resource]}
                      <ExternalLinkIcon />
                      <span className="ly-visually-hidden">
                        {" "}
                        (opens in a new tab)
                      </span>
                    </a>
                  ))}
                </nav>
                <a
                  className="interactive-surface site-action"
                  data-standalone-fixture={pkg.fixture}
                  data-surface-variant="accent"
                  data-surface-level="2"
                  href={withBasePath(`/fixtures/generated/${pkg.fixture}.html`)}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  View {pkg.displayName} standalone proof
                  <ExternalLinkIcon />
                  <span className="ly-visually-hidden">
                    {" "}
                    (opens in a new tab)
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ol>

        <nav
          className="library-next-steps ly-split ly-gap-4 site-pad-block-6"
          aria-label="Library adoption next steps"
        >
          <a
            className="interactive-surface site-action"
            data-surface-variant="primary"
            data-surface-level="2"
            href="#install"
          >
            Choose an installation path
          </a>
          <a
            className="interactive-surface site-action"
            data-surface-variant="accent"
            data-surface-level="2"
            href={withBasePath("/#company")}
          >
            Learn about the studio
          </a>
        </nav>
      </div>
    </section>
  );
}

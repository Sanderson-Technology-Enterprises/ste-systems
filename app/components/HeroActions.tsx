import { SITE, withBasePath } from "../lib/site";
import { ArrowRightIcon } from "./Icons";

export function HomeHeroActions() {
  return (
    <div className="ly-stack ly-gap-4">
      <div className="hero-actions ly-switcher ly-gap-4">
        {/* Explicit tab stops keep adjacent CTA traversal consistent in WebKit's default keyboard mode. */}
        <a
          className="interactive-surface site-action"
          data-hero-action="primary"
          data-surface-variant="accent"
          data-surface-level="2"
          href={withBasePath(SITE.labPath)}
          tabIndex={0}
        >
          Open the lab
          <ArrowRightIcon />
        </a>
        <a
          className="interactive-surface site-action"
          data-hero-action="secondary"
          data-surface-variant="subtle"
          data-surface-level="1"
          href={withBasePath(SITE.componentsPath)}
          tabIndex={0}
        >
          Read component guides
        </a>
      </div>
      <p className="hero-service-copy">
        Need an application for your business?{" "}
        <a
          className="hero-service-link"
          href={SITE.customizedPlatforms.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          Explore Customized Platforms <span aria-hidden="true">↗</span>
          <span className="ly-visually-hidden"> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}

/**
 * Renders the Lab's two in-page calls to action with UI-kit-owned geometry.
 *
 * @returns Padded, centered links into the workbench and installation guide.
 */
export function LabHeroActions() {
  return (
    <div className="hero-actions ly-switcher ly-gap-4">
      {/* Explicit tab stops keep adjacent CTA traversal consistent in WebKit's default keyboard mode. */}
      <a
        className="usk-button interactive-surface site-action"
        data-hero-action="primary"
        data-ui-variant="primary"
        data-surface-variant="accent"
        data-surface-level="2"
        href="#workbench"
        tabIndex={0}
      >
        Jump to the workbench
        <ArrowRightIcon />
      </a>
      <a
        className="usk-button interactive-surface site-action"
        data-hero-action="secondary"
        data-ui-variant="ghost"
        data-surface-variant="subtle"
        data-surface-level="1"
        href="#install"
        tabIndex={0}
      >
        View installation options
      </a>
    </div>
  );
}

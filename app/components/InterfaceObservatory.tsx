"use client";

import { useState } from "react";

import { getUiPrefix } from "../data/catalog";
import { ECOSYSTEM_PACKAGES, type ResourceLink } from "../data/ecosystem";
import { ExternalLinkIcon } from "./Icons";
import { useLabConfiguration } from "./LabExperience";

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

const orbitVariants = ["primary", "accent", "secondary", "subtle"] as const;

export function InterfaceObservatory() {
  const { announce, configuration } = useLabConfiguration();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPackage = ECOSYSTEM_PACKAGES[selectedIndex];
  const prefix = getUiPrefix(configuration.ui);

  return (
    <figure
      className="observatory ly-stack ly-gap-4"
      aria-labelledby="observatory-caption"
    >
      <figcaption id="observatory-caption" className="ly-visually-hidden">
        Interface Observatory: choose structure, identity, or behavior to
        inspect the matching ecosystem library.
      </figcaption>

      <div
        className="observatory-stage"
        aria-label="Interface layer selector"
        role="group"
      >
        {ECOSYSTEM_PACKAGES.map((pkg) => (
          <span
            className={`orbit-ring orbit-ring-${pkg.layer.toLowerCase()}`}
            key={`${pkg.name}-ring`}
            aria-hidden="true"
          >
            <span className="orbit-runner">
              <i />
            </span>
          </span>
        ))}
        {ECOSYSTEM_PACKAGES.map((pkg, index) => (
          <button
            className={`observatory-orbit observatory-orbit-${pkg.layer.toLowerCase()} interactive-surface site-action`}
            data-surface-variant={orbitVariants[index]}
            data-surface-level={orbitVariants[index] === "subtle" ? 1 : 2}
            type="button"
            key={pkg.name}
            aria-pressed={selectedIndex === index}
            aria-controls="observatory-active-package"
            onClick={() => {
              setSelectedIndex(index);
              announce(`${pkg.layer} layer selected: ${pkg.displayName}.`);
            }}
          >
            <span className="orbit-label">{pkg.layer}</span>
          </button>
        ))}
        <span className="observatory-core">
          <b>One</b>
          <small>interface core</small>
        </span>
      </div>

      <ol
        className="observatory-legend"
        aria-label="Interface Observatory layers"
      >
        {ECOSYSTEM_PACKAGES.map((pkg, index) => (
          <li
            className={`${prefix}-surface ly-surface ly-cluster ly-gap-4 ly-items-start ly-pad-4`}
            key={pkg.name}
            data-active={selectedIndex === index}
          >
            <span className="layer-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <strong>{pkg.layer}</strong>
              <small>{pkg.name}</small>
            </div>
          </li>
        ))}
      </ol>

      <article
        className={`observatory-detail ${prefix}-card ly-surface ly-pad-4 ly-stack ly-gap-4`}
        id="observatory-active-package"
      >
        <p className="section-label">Selected layer</p>
        <h2>{selectedPackage.layer}</h2>
        <p>{selectedPackage.summary}</p>
        <code>{selectedPackage.attribute}</code>
        <nav
          className="ly-cluster ly-gap-2"
          aria-label={`Selected ${selectedPackage.displayName} resources`}
        >
          {resourceOrder.map((resource) => (
            <a
              className="interactive-surface site-action"
              data-surface-variant="subtle"
              data-surface-level="1"
              href={selectedPackage.links[resource]}
              key={resource}
              target="_blank"
              rel="noreferrer noopener"
            >
              {resourceLabels[resource]}
              <ExternalLinkIcon />
              <span className="ly-visually-hidden"> (opens in a new tab)</span>
            </a>
          ))}
        </nav>
      </article>
    </figure>
  );
}

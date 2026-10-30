"use client";

import { useState } from "react";

import { SUPPORTED_COMBINATIONS_LABEL } from "../data/atlas";
import { ECOSYSTEM_PACKAGES } from "../data/ecosystem";
import { ExternalLinkIcon } from "./Icons";

/**
 * Renders the four-layer homepage observatory and exposes direct resources for
 * the selected library.
 *
 * @returns The interactive homepage system diagram.
 */
export function HomeObservatory() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPackage = ECOSYSTEM_PACKAGES[selectedIndex];

  return (
    <figure
      className="home-observatory"
      aria-labelledby="home-observatory-caption"
    >
      <figcaption className="ly-visually-hidden" id="home-observatory-caption">
        Four independent CSS libraries orbit one semantic interface. Select a
        layer to inspect its package resources.
      </figcaption>

      <div className="home-observatory-stage">
        {ECOSYSTEM_PACKAGES.map((pkg, index) => (
          <span
            aria-hidden="true"
            className={`home-orbit-ring home-orbit-ring-${index + 1}`}
            key={`${pkg.name}-ring`}
          >
            <span className="home-orbit-runner">
              <i />
            </span>
          </span>
        ))}

        {ECOSYSTEM_PACKAGES.map((pkg, index) => (
          <button
            aria-controls="home-observatory-detail"
            aria-pressed={selectedIndex === index}
            className={`home-orbit-control home-orbit-control-${index + 1}`}
            key={pkg.name}
            onClick={() => setSelectedIndex(index)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {pkg.layer}
          </button>
        ))}

        <span className="home-observatory-core">
          <strong>{SUPPORTED_COMBINATIONS_LABEL}</strong>
          <small>design combinations</small>
        </span>
      </div>

      <a href="#configuration-reference">How this count is calculated</a>

      <article
        className="home-observatory-detail ly-stack ly-gap-4"
        id="home-observatory-detail"
      >
        <span>{selectedPackage.layer}</span>
        <h2>{selectedPackage.displayName}</h2>
        <p>{selectedPackage.summary}</p>
        <code>{selectedPackage.attribute}</code>
        <div className="ly-cluster ly-gap-2">
          <a
            href={selectedPackage.links.npm}
            target="_blank"
            rel="noreferrer noopener"
          >
            npm package <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
          <a
            href={selectedPackage.links.demo}
            target="_blank"
            rel="noreferrer noopener"
          >
            Live demo <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      </article>
    </figure>
  );
}

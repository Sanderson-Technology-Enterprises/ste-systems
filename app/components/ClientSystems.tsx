"use client";

import {
  Card,
  CardBody,
  CardHeader,
  LayoutGrid,
  Link,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { SITE } from "../lib/site";
import { ExternalLinkIcon } from "./Icons";

/** Public descriptions of STE's toolkit, without private repository or documentation links. */
const clientSystems = [
  {
    name: "STE USK React",
    role: "Interface composition",
    access: "Private source · Public npm distribution",
    description:
      "Accessible React components that bring the three CSS libraries together. They power parts of this website and provide reusable interface building blocks for client applications. Version 2.1.0 is publicly distributed through npm; that does not make its source repository public.",
  },
  {
    name: "STE-Core",
    role: "Application foundation",
    access: "Private foundation",
    description:
      "A shared runtime that manages application configuration, execution context, and module lifecycles. It defines how modules connect, while each client application supplies its own business workflows.",
  },
  {
    name: "STE-SDK",
    role: "Developer tooling",
    access: "Private tooling",
    description:
      "Developer tools for inspecting module definitions, validating configuration, and checking compatibility with STE-Core. These checks help developers identify integration problems as they build client applications.",
  },
] as const;

/** Shows the broader client-application toolkit separately from the public CSS package inventory. */
export function ClientSystems() {
  return (
    <section
      className="section-band ly-section"
      id="client-systems"
      aria-labelledby="client-systems-title"
    >
      <div className="ly-wrapper ly-stack ly-gap-8">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">Beyond the interface</p>
          <h2 id="client-systems-title">
            Systems built for client applications.
          </h2>
          <p>
            Sanderson Technology Enterprises LLC builds reusable interface
            components, application foundations, and developer tools for custom
            client applications. The three systems below are part of that
            toolkit.
          </p>
        </div>
        <LayoutGrid minColumnWidth="18rem" gap={6}>
          {clientSystems.map((system) => (
            <Card as="article" key={system.name}>
              <CardHeader className="ly-stack ly-gap-3">
                <p className="eyebrow">{system.role}</p>
                <h3>{system.name}</h3>
                <p>{system.access}</p>
              </CardHeader>
              <CardBody>
                <p>{system.description}</p>
              </CardBody>
            </Card>
          ))}
        </LayoutGrid>
        <nav
          className="ly-cluster ly-gap-4"
          aria-label="Client application services"
        >
          <Link
            href={SITE.customizedPlatforms.url}
            external
            className="site-action"
            data-surface-variant="accent"
            icon={<ExternalLinkIcon />}
          >
            Explore Customized Platforms
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </Link>
          <Link
            href={SITE.owner.url}
            external
            className="site-action"
            data-surface-variant="subtle"
            icon={<ExternalLinkIcon />}
          >
            Visit {SITE.owner.legalName}
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </Link>
        </nav>
      </div>
    </section>
  );
}

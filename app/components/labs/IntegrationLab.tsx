"use client";

import { useEffect, useRef } from "react";

import fixtureCatalog from "../../data/integration-fixtures.json";
import type { LabConfiguration } from "../../lib/configuration";
import { withBasePath } from "../../lib/site";
import { useLabConfiguration } from "../LabExperience";

type FixtureDefinition = (typeof fixtureCatalog)[number];

/**
 * Applies the active menu selection to the same-origin complete-stack proof.
 * Standalone fixture URLs retain their fixed baseline for isolated comparisons.
 *
 * @param frame Loaded iframe owned by this site.
 * @param configuration Current Lab configuration.
 * @returns Nothing; the fixture root receives the four published attributes.
 */
function synchronizeCanonicalFixture(
  frame: HTMLIFrameElement,
  configuration: LabConfiguration,
): void {
  const root = frame.contentDocument?.querySelector<HTMLElement>(
    "[data-fixture-root]",
  );
  if (!root) return;

  root.dataset.lyLayout = configuration.layout;
  root.dataset.ui = configuration.ui;
  root.dataset.theme = configuration.theme;
  root.dataset.mode = configuration.mode;
}

/**
 * Renders a package-isolated proof and optionally mirrors the active menu.
 *
 * @param props Fixture card properties.
 * @param props.fixture Package combination and fixture URL.
 * @param props.configuration Active menu selection for the featured proof only.
 * @returns An integration card with a same-origin fixture frame.
 */
function FixtureCard({
  fixture,
  configuration,
}: {
  fixture: FixtureDefinition;
  configuration?: LabConfiguration;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (configuration && frameRef.current) {
      synchronizeCanonicalFixture(frameRef.current, configuration);
    }
  }, [configuration]);

  return (
    <article
      className="integration-card ly-stack ly-gap-4"
      id={`fixture-${fixture.id}`}
      data-fixture-card={fixture.id}
    >
      <header className="ly-stack ly-gap-2">
        <div className="ly-cluster ly-gap-2">
          <p className="section-label">Isolated proof</p>
          <code>{fixture.packages.join(" + ")}</code>
        </div>
        <h3>{fixture.title}</h3>
        <p className="muted-copy">{fixture.summary}</p>
      </header>
      <iframe
        ref={frameRef}
        className="integration-frame"
        data-integration-fixture={fixture.id}
        loading="lazy"
        referrerPolicy="no-referrer"
        src={withBasePath(`/fixtures/generated/${fixture.id}.html`)}
        title={`${fixture.title} integration proof`}
        onLoad={(event) => {
          if (configuration) {
            synchronizeCanonicalFixture(event.currentTarget, configuration);
          }
        }}
      />
    </article>
  );
}

function FixtureGroup({
  group,
  label,
  fixtures,
}: {
  group: "one" | "pair";
  label: string;
  fixtures: FixtureDefinition[];
}) {
  return (
    <details className="integration-disclosure" data-integration-group={group}>
      <summary>{label}</summary>
      <div className="integration-grid ly-grid ly-gap-6">
        {fixtures.map((fixture) => (
          <FixtureCard fixture={fixture} key={fixture.id} />
        ))}
      </div>
    </details>
  );
}

/**
 * Presents the featured live stack beside fixed standalone comparison proofs.
 *
 * @returns The integration laboratory and adoption links.
 */
export function IntegrationLab() {
  const { configuration } = useLabConfiguration();
  const canonical = fixtureCatalog.find(
    (fixture) => fixture.id === "all-canonical",
  );
  if (canonical === undefined) {
    throw new Error("The canonical integration fixture is missing.");
  }

  const fixturesFor = (group: FixtureDefinition["group"]) =>
    fixtureCatalog.filter((fixture) => fixture.group === group);

  return (
    <section
      className="integration-lab section-band ly-section"
      id="integrate"
      aria-labelledby="integrate-title"
    >
      <div className="ly-wrapper ly-stack ly-gap-8">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Isolated integration laboratory</p>
            <h2 id="integrate-title">
              Verify each adoption path in isolation.
            </h2>
          </div>
          <p>
            The complete-stack proof follows the active menu selection. The
            single- and two-package fixtures retain a fixed baseline so their
            isolated CSS comparisons stay stable.
          </p>
        </div>

        <div data-integration-group="all">
          <FixtureCard configuration={configuration} fixture={canonical} />
        </div>

        <div className="integration-disclosures ly-stack ly-gap-4">
          <FixtureGroup
            fixtures={fixturesFor("one")}
            group="one"
            label="View single-package fixtures"
          />
          <FixtureGroup
            fixtures={fixturesFor("pair")}
            group="pair"
            label="View two-package fixtures"
          />
        </div>

        <nav
          className="integration-paths ly-split ly-gap-4"
          aria-label="Integration adoption paths"
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

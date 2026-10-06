"use client";

import { getUiPrefix } from "../../data/catalog";
import { useLabConfiguration } from "../LabExperience";

const spacingUtilities = [
  ...Array.from({ length: 10 }, (_, index) => `ly-gap-${index}`),
  ...Array.from({ length: 5 }, (_, index) => `ly-pad-${index * 2}`),
] as const;

const alignmentUtilities = [
  "ly-items-start",
  "ly-items-center",
  "ly-items-end",
  "ly-items-stretch",
  "ly-justify-start",
  "ly-justify-center",
  "ly-justify-end",
  "ly-justify-between",
] as const;

const wrapperVariants = [
  "compact",
  "prose",
  "content",
  "workspace",
  "wide",
  "full",
] as const;

type SpecimenLabelProps = {
  children: React.ReactNode;
};

function SpecimenLabel({ children }: SpecimenLabelProps) {
  return (
    <strong className="specimen-label" data-primitive-label>
      {children}
    </strong>
  );
}

/**
 * Demonstrates the current Layout Style CSS wrappers, primitives, recipes, and
 * utilities against the active interface configuration.
 *
 * @returns The interactive layout laboratory section.
 */
export function LayoutLab() {
  const { configuration } = useLabConfiguration();
  const prefix = getUiPrefix(configuration.ui);
  const cardClass = `${prefix}-card ly-surface`;
  const surfaceClass = `${prefix}-surface ly-surface`;

  return (
    <section
      className="section-band ly-section"
      id="layouts"
      aria-labelledby="layouts-title"
    >
      <div className="ly-wrapper ly-wrapper--workspace">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Layout laboratory</p>
            <h2 id="layouts-title">Test responsive layout recipes.</h2>
          </div>
          <p>
            Change the global personality above. The same semantic recipe and
            primitive hooks recompute their geometry without moving a single
            node in reading or keyboard order. This laboratory targets Layout
            Style CSS 3.2.3 with intrinsic grids, resilient panes, Mosaic and
            Action Bar compositions, and canonical attribute recipes.
          </p>
        </div>

        <div
          className="layout-base-grid ly-grid ly-gap-4"
          data-layout-primitive="grid"
          aria-label="Personality-sensitive base grid"
        >
          <p
            className="specimen-intro ly-span-full ly-stack ly-gap-2"
            data-primitive-label
          >
            <strong>Base grid</strong>
            <span>
              This unqualified <code>.ly-grid</code> makes every
              personality&apos;s column rhythm visible.
            </span>
          </p>
          {[
            ["01", "Plan"],
            ["02", "Compose"],
            ["03", "Review"],
            ["04", "Deliver"],
          ].map(([index, label]) => (
            <span
              className={`${cardClass} layout-grid-cell ly-pad-4 ly-stack ly-gap-2`}
              key={index}
            >
              <small>{index}</small>
              <strong>{label}</strong>
            </span>
          ))}
        </div>

        <div className="layout-disclosures ly-stack ly-gap-4">
          <details>
            <summary>View six layout recipes</summary>
            <div className="recipe-atlas ly-stack ly-gap-6">
              <article className="recipe-entry ly-stack ly-gap-4">
                <header className="specimen-heading ly-stack ly-gap-2">
                  <h3>Dashboard</h3>
                  <code>header / nav / main / aside / footer</code>
                </header>
                <div className="ly-wrapper ly-wrapper--content">
                  <section
                    className="recipe-specimen"
                    data-layout-recipe="dashboard"
                    data-ly-recipe="dashboard"
                    aria-label="Dashboard recipe specimen"
                  >
                    <header
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="header"
                    >
                      Pipeline overview
                    </header>
                    <nav
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="nav"
                      aria-label="Dashboard specimen"
                    >
                      Accounts · Work · Reports
                    </nav>
                    <section
                      className={`${cardClass} ly-pad-4`}
                      data-ly-area="main"
                    >
                      <strong>Delivery velocity</strong>
                      <p>Milestone flow stays central at every width.</p>
                    </section>
                    <aside
                      className={`${cardClass} ly-pad-4`}
                      data-ly-area="aside"
                    >
                      <strong>Signals</strong>
                      <p>Three reviews due.</p>
                    </aside>
                    <footer
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="footer"
                    >
                      Updated today
                    </footer>
                  </section>
                </div>
              </article>

              <article className="recipe-entry ly-stack ly-gap-4">
                <header className="specimen-heading ly-stack ly-gap-2">
                  <h3>Documentation</h3>
                  <code>header / nav / main / aside / footer</code>
                </header>
                <div className="ly-wrapper ly-wrapper--content">
                  <section
                    className="recipe-specimen"
                    data-layout-recipe="docs"
                    data-ly-recipe="docs"
                    aria-label="Documentation recipe specimen"
                  >
                    <header
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="header"
                    >
                      System handbook
                    </header>
                    <nav
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="nav"
                      aria-label="Documentation specimen"
                    >
                      Foundations · Recipes · Utilities
                    </nav>
                    <section
                      className={`${cardClass} ly-pad-4`}
                      data-ly-area="main"
                    >
                      <strong>Authoritative content</strong>
                      <p>The reading path remains first in the source.</p>
                    </section>
                    <aside
                      className={`${cardClass} ly-pad-4`}
                      data-ly-area="aside"
                    >
                      <strong>On this page</strong>
                      <p>Named regions · container behavior</p>
                    </aside>
                    <footer
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="footer"
                    >
                      Version 3.2.3
                    </footer>
                  </section>
                </div>
              </article>

              <article className="recipe-entry ly-stack ly-gap-4">
                <header className="specimen-heading ly-stack ly-gap-2">
                  <h3>List detail</h3>
                  <code>primary / secondary / actions</code>
                </header>
                <div className="ly-wrapper ly-wrapper--content">
                  <section
                    className="recipe-specimen"
                    data-layout-recipe="list-detail"
                    data-ly-recipe="list-detail"
                    aria-label="List detail recipe specimen"
                  >
                    <section
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="primary"
                    >
                      <strong>Project index</strong>
                      <p>Northstar · Beacon · Field Notes</p>
                    </section>
                    <article
                      className={`${cardClass} ly-pad-4`}
                      data-ly-area="secondary"
                    >
                      <strong>Northstar</strong>
                      <p>Brand and interface system delivery.</p>
                    </article>
                    <footer
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="actions"
                    >
                      Review · Export · Share
                    </footer>
                  </section>
                </div>
              </article>

              <article className="recipe-entry ly-stack ly-gap-4">
                <header className="specimen-heading ly-stack ly-gap-2">
                  <h3>Split hero</h3>
                  <code>content / media / actions</code>
                </header>
                <div className="ly-wrapper ly-wrapper--content">
                  <section
                    className="recipe-specimen"
                    data-layout-recipe="split-hero"
                    data-ly-recipe="split-hero"
                    aria-label="Split hero recipe specimen"
                  >
                    <div
                      className={`${cardClass} ly-pad-4`}
                      data-ly-area="content"
                    >
                      <strong>Structure that keeps its promise</strong>
                      <p>Content leads before media at narrow widths.</p>
                    </div>
                    <figure
                      className={`${surfaceClass} recipe-media ly-frame ly-frame-16x9`}
                      data-ly-area="media"
                    >
                      <span>Responsive media field</span>
                    </figure>
                    <div
                      className={`${surfaceClass} ly-pad-4`}
                      data-ly-area="actions"
                    >
                      Inspect recipe · Read API
                    </div>
                  </section>
                </div>
              </article>

              <article className="recipe-entry ly-stack ly-gap-4">
                <header className="specimen-heading ly-stack ly-gap-2">
                  <h3>Gallery</h3>
                  <code>repeated direct children</code>
                </header>
                <div className="ly-wrapper ly-wrapper--content">
                  <section
                    className="recipe-specimen"
                    data-layout-recipe="gallery"
                    data-ly-recipe="gallery"
                    aria-label="Gallery recipe specimen"
                  >
                    {["Research", "Identity", "Prototype", "Launch"].map(
                      (label, index) => (
                        <figure className={`${cardClass} ly-pad-4`} key={label}>
                          <span className="gallery-field" aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <figcaption>{label}</figcaption>
                        </figure>
                      ),
                    )}
                  </section>
                </div>
              </article>

              <article className="recipe-entry ly-stack ly-gap-4">
                <header className="specimen-heading ly-stack ly-gap-2">
                  <h3>Card grid</h3>
                  <code>repeated direct children</code>
                </header>
                <div className="ly-wrapper ly-wrapper--content">
                  <section
                    className="recipe-specimen"
                    data-layout-recipe="card-grid"
                    data-ly-recipe="card-grid"
                    aria-label="Card grid recipe specimen"
                  >
                    {["Audit", "Compose", "Validate", "Ship"].map((label) => (
                      <article
                        className={`${cardClass} ly-pad-4 ly-stack ly-gap-2`}
                        key={label}
                      >
                        <strong>{label}</strong>
                        <p>One bounded responsibility.</p>
                      </article>
                    ))}
                  </section>
                </div>
              </article>
            </div>
          </details>

          <details>
            <summary>View composition primitives</summary>
            <div className="primitive-atlas ly-grid ly-gap-4">
              <article
                className={`${cardClass} primitive-specimen ly-stack ly-gap-4 ly-pad-4`}
                data-layout-primitive="stack"
              >
                <SpecimenLabel>Stack</SpecimenLabel>
                <span>First block</span>
                <span>Second block</span>
              </article>

              <article
                className={`${cardClass} primitive-specimen ly-cluster ly-gap-2 ly-pad-4`}
                data-layout-primitive="cluster"
              >
                <SpecimenLabel>Cluster</SpecimenLabel>
                <span>Alpha</span>
                <span>Beta</span>
                <span>Gamma</span>
              </article>

              <article
                className={`${cardClass} primitive-specimen ly-center ly-pad-4`}
                data-layout-primitive="center"
              >
                <SpecimenLabel>Center</SpecimenLabel>
                <p>Bounded and centered.</p>
              </article>

              <article
                className={`${cardClass} primitive-specimen primitive-cover ly-cover ly-pad-4`}
                data-layout-primitive="cover"
              >
                <span>Top</span>
                <span data-ly-cover-center>
                  <SpecimenLabel>Cover center</SpecimenLabel>
                </span>
                <span>Bottom</span>
              </article>

              <article
                className={`${cardClass} primitive-specimen ly-switcher ly-gap-4 ly-pad-4`}
                data-layout-primitive="switcher"
              >
                <span>
                  <SpecimenLabel>Switcher</SpecimenLabel>
                </span>
                <span>Flexible peer</span>
              </article>

              <article
                className={`${cardClass} primitive-specimen ly-sidebar ly-gap-4 ly-pad-4`}
                data-layout-primitive="sidebar"
              >
                <span data-ly-sidebar="side">
                  <SpecimenLabel>Sidebar side</SpecimenLabel>
                </span>
                <span data-ly-sidebar="content">Flexible content region</span>
              </article>

              <article
                className={`${cardClass} primitive-specimen ly-grid ly-gap-2 ly-pad-4`}
                data-layout-primitive="grid-intrinsic"
              >
                <span>
                  <SpecimenLabel>Intrinsic grid</SpecimenLabel>
                </span>
                <span>Two</span>
                <span>Three</span>
              </article>

              <section
                className={`${cardClass} primitive-specimen ly-mosaic ly-span-full ly-gap-2 ly-pad-4`}
                data-layout-primitive="mosaic"
                aria-label="Mosaic composition specimen"
              >
                <article
                  className={`${surfaceClass} ly-span-6 ly-row-span-2 ly-pad-4`}
                >
                  <SpecimenLabel>Mosaic canvas</SpecimenLabel>
                  <p>Primary work stays first in reading and keyboard order.</p>
                </article>
                <article className={`${surfaceClass} ly-span-4 ly-pad-4`}>
                  Signal health
                </article>
                <article className={`${surfaceClass} ly-span-full ly-pad-4`}>
                  System status remains reachable at every width.
                </article>
              </section>

              <div
                className={`${cardClass} primitive-specimen ly-action-bar ly-span-full ly-pad-4`}
                data-layout-primitive="action-bar"
                aria-label="Action Bar composition specimen"
              >
                <div data-ly-actions="start">
                  <SpecimenLabel>Action Bar</SpecimenLabel>
                  <button className={`${prefix}-button`} type="button">
                    Save draft
                  </button>
                </div>
                <div data-ly-actions="end">
                  <button
                    className={`${prefix}-button`}
                    data-ui-variant="primary"
                    type="button"
                  >
                    Publish
                  </button>
                </div>
              </div>

              <div
                className="primitive-query-scope"
                data-layout-query-scope="split"
              >
                <article
                  className={`${cardClass} primitive-specimen ly-split ly-gap-4 ly-pad-4`}
                  data-layout-primitive="split"
                >
                  <span>
                    <SpecimenLabel>Split</SpecimenLabel>
                  </span>
                  <span>Balanced peer</span>
                </article>
              </div>

              <div
                className="primitive-query-scope"
                data-layout-query-scope="panes-2"
              >
                <article
                  className={`${cardClass} primitive-specimen ly-panes ly-gap-4 ly-pad-4`}
                  data-layout-primitive="panes-2"
                  data-pane-count="2"
                >
                  <span>
                    <SpecimenLabel>Two panes</SpecimenLabel>
                  </span>
                  <span>Inspector</span>
                </article>
              </div>

              <div
                className="primitive-query-scope"
                data-layout-query-scope="panes-3"
              >
                <article
                  className={`${cardClass} primitive-specimen ly-panes ly-gap-4 ly-pad-4`}
                  data-layout-primitive="panes-3"
                  data-pane-count="3"
                >
                  <span>
                    <SpecimenLabel>Three panes</SpecimenLabel>
                  </span>
                  <span>Canvas</span>
                  <span>Inspector</span>
                </article>
              </div>

              <div
                className="primitive-query-scope"
                data-layout-query-scope="media"
              >
                <article
                  className={`${cardClass} primitive-specimen ly-media ly-gap-4 ly-pad-4`}
                  data-layout-primitive="media"
                >
                  <span
                    className="media-field"
                    data-ly-media="asset"
                    aria-hidden="true"
                  >
                    4:3
                  </span>
                  <span data-ly-media="content">
                    <SpecimenLabel>Media object</SpecimenLabel>
                    <span>Content follows the asset.</span>
                  </span>
                  <span data-ly-media="actions">Open · Save</span>
                </article>
              </div>

              <article
                className={`${cardClass} primitive-specimen ly-reel ly-gap-4 ly-pad-4`}
                data-layout-primitive="reel"
                aria-label="Scrollable Reel specimen"
                tabIndex={0}
              >
                {["Reel", "Second", "Third", "Fourth"].map((label, index) => (
                  <span className={`${surfaceClass} ly-pad-4`} key={label}>
                    {index === 0 ? (
                      <SpecimenLabel>{label}</SpecimenLabel>
                    ) : (
                      label
                    )}
                  </span>
                ))}
              </article>

              <article
                className={`${cardClass} primitive-specimen ly-frame ly-frame-16x9`}
                data-layout-primitive="frame"
              >
                <span className="frame-field">
                  <SpecimenLabel>Frame 16:9</SpecimenLabel>
                </span>
              </article>

              <article
                className={`${cardClass} primitive-specimen primitive-scroll ly-scroll ly-scroll--bounded ly-pad-4`}
                data-layout-primitive="scroll"
              >
                <SpecimenLabel>Scroll region</SpecimenLabel>
                <p>Bounded content remains reachable.</p>
                <p>Overscroll stays contained.</p>
                <p>Keyboard focus remains visible.</p>
                <p>Logical sizing supports writing modes.</p>
              </article>
            </div>
          </details>

          <details>
            <summary>View wrappers and utilities</summary>
            <div className="wrapper-atlas ly-stack ly-gap-4">
              <div className="ly-stack ly-gap-4">
                <div
                  className={`ly-wrapper ${surfaceClass} wrapper-sample ly-pad-4`}
                >
                  <strong>Plain wrapper</strong>
                  <span>Personality-sensitive measure</span>
                </div>
                {wrapperVariants.map((variant) => (
                  <div
                    className={`ly-wrapper ly-wrapper--${variant} ${surfaceClass} wrapper-sample ly-pad-4`}
                    data-wrapper-variant={variant}
                    key={variant}
                  >
                    <strong>{variant}</strong>
                    <span>Explicit semantic measure</span>
                  </div>
                ))}
              </div>

              <div
                className="ly-wrapper ly-wrapper--breakout breakout-sample"
                data-layout-primitive="breakout"
                data-wrapper-variant="breakout"
              >
                <div
                  className={`${surfaceClass} ly-pad-4`}
                  data-ly-lane="content"
                >
                  <SpecimenLabel>Breakout content lane</SpecimenLabel>
                </div>
                <div className={`${cardClass} ly-pad-4`} data-ly-lane="feature">
                  Feature lane
                </div>
                <div className={`${surfaceClass} ly-pad-4`} data-ly-lane="full">
                  Full lane
                </div>
              </div>

              <div className="utility-inventory ly-cluster ly-gap-2">
                {spacingUtilities.map((utility) => (
                  <span
                    className={`${surfaceClass} utility-chip ${utility}`}
                    data-layout-utility={utility}
                    key={utility}
                  >
                    {utility}
                  </span>
                ))}
              </div>

              <div className="alignment-inventory ly-stack ly-gap-2">
                <strong>Alignment hooks</strong>
                <div className="ly-cluster ly-gap-2">
                  {alignmentUtilities.map((utility) => (
                    <code
                      className={utility}
                      data-alignment-utility={utility}
                      key={utility}
                    >
                      {utility}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}

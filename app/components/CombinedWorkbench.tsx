"use client";

import { useState } from "react";

import { getUiPrefix } from "../data/catalog";
import { useLabConfiguration } from "./LabExperience";
import { formatThemeLabel } from "../lib/configuration";

function formatLabel(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

/**
 * Renders the task-oriented client workspace using the active interface
 * configuration and Layout Style CSS workspace contracts.
 *
 * @returns The combined three-library workbench section.
 */
export function CombinedWorkbench() {
  const { configuration, announce } = useLabConfiguration();
  const [saved, setSaved] = useState(false);
  const prefix = getUiPrefix(configuration.ui);
  const surfaceClass = `${prefix}-surface ly-surface`;
  const cardClass = `${prefix}-card ly-surface`;
  const panelClass = `${prefix}-panel ly-surface`;
  const modeLabel =
    configuration.mode === "contrast"
      ? "High contrast"
      : formatLabel(configuration.mode);

  return (
    <section
      className="section-band ly-section"
      id="workbench"
      aria-labelledby="workbench-title"
    >
      <div className="ly-wrapper ly-wrapper--workspace">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Example client workspace</p>
            <h2 id="workbench-title">See all three layers in one workspace.</h2>
          </div>
          <p>
            Explore a sample project workspace built with all three libraries.
            Layout Style CSS arranges the content, UI Style Kit CSS controls its
            appearance, and Interactive Surface CSS styles control states.
          </p>
        </div>

        <div className="workbench-frame">
          <article
            className="client-workspace"
            data-layout-recipe="app-shell"
            data-ly-density="compact"
            data-ly-recipe="app-shell"
            aria-label="Northstar client delivery workspace"
          >
            <header
              className={`${surfaceClass} workbench-region ly-pad-4`}
              data-ly-area="header"
            >
              <div className="workbench-toolbar ly-cluster ly-gap-4 ly-items-stretch ly-justify-between">
                <div className="ly-stack ly-gap-2">
                  <small>Northstar rebrand</small>
                  <strong>Delivery command center</strong>
                </div>
                <button
                  className={`${prefix}-button-pill`}
                  type="button"
                  onClick={() =>
                    announce("Northstar project direction approved.")
                  }
                >
                  Approve project direction
                </button>
              </div>
            </header>

            <nav
              className={`${panelClass} workbench-region ly-pad-4`}
              data-ly-area="sidebar"
              aria-label="Northstar workspace"
            >
              <p className="workbench-kicker">Atelier One</p>
              <div className="workbench-nav ly-stack ly-gap-2">
                <a
                  className="interactive-surface site-action"
                  data-surface-variant="subtle"
                  data-surface-level="1"
                  aria-current="page"
                  href="#workspace-summary"
                >
                  Project pulse
                </a>
                <a
                  className="interactive-surface site-action"
                  data-surface-variant="subtle"
                  data-surface-level="1"
                  href="#workspace-deliverables"
                >
                  Deliverables
                </a>
                <a
                  className="interactive-surface site-action"
                  data-surface-variant="subtle"
                  data-surface-level="1"
                  href="#workspace-activity"
                >
                  Activity
                </a>
              </div>
            </nav>

            <section
              className={`${surfaceClass} workbench-region workbench-main ly-pad-6 ly-stack ly-gap-6`}
              data-ly-area="main"
              id="workspace-summary"
              aria-labelledby="workspace-title"
            >
              <header className="workbench-main-heading ly-split ly-gap-4 ly-items-start">
                <div className="ly-stack ly-gap-2">
                  <small>Client workspace</small>
                  <h3 id="workspace-title">A confident path to launch</h3>
                </div>
                <span className="workbench-mode">{modeLabel} mode</span>
              </header>

              <dl className="workbench-metrics ly-grid ly-gap-4">
                <div className={`${cardClass} ly-pad-4`}>
                  <dt>Delivery health</dt>
                  <dd>On track</dd>
                </div>
                <div className={`${cardClass} ly-pad-4`}>
                  <dt>Approved milestones</dt>
                  <dd>06 / 08</dd>
                </div>
                <div className={`${cardClass} ly-pad-4`}>
                  <dt>Launch window</dt>
                  <dd>18 days</dd>
                </div>
              </dl>

              <div
                className="workbench-deliverables ly-grid ly-gap-4"
                id="workspace-deliverables"
              >
                <article className={`${cardClass} ly-pad-6 ly-stack ly-gap-4`}>
                  <div className="meta-line ly-cluster ly-justify-between ly-gap-2">
                    <span>Design system</span>
                    <strong>72%</strong>
                  </div>
                  <h4>Northstar interface language</h4>
                  <p>
                    Responsive structure, accessible visual identity, and state
                    mechanics prepared as one maintainable system.
                  </p>
                  <progress value="72" max="100">
                    72%
                  </progress>
                  <div className="ly-cluster ly-gap-2">
                    <button
                      className="interactive-surface site-action"
                      data-surface-variant="primary"
                      data-surface-level="2"
                      type="button"
                      onClick={() =>
                        announce("Project details opened in the demonstration.")
                      }
                    >
                      View project
                    </button>
                    <button
                      className="interactive-surface site-action"
                      data-surface-variant="secondary"
                      data-surface-level="2"
                      type="button"
                      aria-label={
                        saved
                          ? "Remove project from shortlist"
                          : "Save project to shortlist"
                      }
                      aria-pressed={saved}
                      onClick={() => {
                        setSaved((value) => !value);
                        announce(
                          saved
                            ? "Project removed from shortlist."
                            : "Project saved to shortlist.",
                        );
                      }}
                    >
                      {saved ? "Saved" : "Save"}
                    </button>
                  </div>
                </article>

                <article
                  className={`${cardClass} ly-pad-6 ly-stack ly-gap-4`}
                  id="workspace-activity"
                >
                  <small>Latest activity</small>
                  <h4>Decisions stay visible</h4>
                  <ul className="workbench-activity ly-stack ly-gap-4">
                    <li>Navigation model approved by the client team.</li>
                    <li>High-contrast interface review completed.</li>
                    <li>Responsive content model ready for handoff.</li>
                  </ul>
                </article>
              </div>
            </section>

            <aside
              className={`${panelClass} workbench-region ly-pad-4 ly-stack ly-gap-4`}
              data-ly-area="aside"
              aria-label="Workspace inspector"
            >
              <div className="ly-stack ly-gap-2">
                <small>Configuration proof</small>
                <strong>{formatLabel(configuration.layout)}</strong>
              </div>
              <dl className="workbench-config ly-stack ly-gap-4">
                <div>
                  <dt>UI preset</dt>
                  <dd>{formatLabel(configuration.ui)}</dd>
                </div>
                <div>
                  <dt>Palette</dt>
                  <dd>{formatThemeLabel(configuration.theme)}</dd>
                </div>
                <div>
                  <dt>Mode</dt>
                  <dd>{modeLabel}</dd>
                </div>
              </dl>
              <button
                className="interactive-surface site-action"
                data-surface-variant="warning"
                data-surface-level="2"
                type="button"
                onClick={() => announce("Risk review opened.")}
              >
                Review launch risks
              </button>
            </aside>

            <footer
              className={`${surfaceClass} workbench-region ly-pad-4`}
              data-ly-area="footer"
            >
              <div className="ly-cluster ly-justify-between ly-gap-4">
                <small>Semantic DOM order remains the mobile order.</small>
                <strong>Last synchronized today</strong>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </section>
  );
}

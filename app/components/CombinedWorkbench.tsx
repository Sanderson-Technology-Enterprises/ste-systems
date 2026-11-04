"use client";

import { useRef, useState, type MouseEvent } from "react";
import {
  Button,
  Card,
  Layout,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { useLabConfiguration } from "./LabExperience";
import { recipeAreas } from "../lib/playground-options";
import { useRecipeFit } from "./useRecipeFit";
import {
  WorkspaceActivity,
  WorkspaceConfiguration,
  WorkspaceDeliverable,
  WorkspaceMetrics,
  WorkspaceOverview,
  workspaceLabel,
} from "./WorkspaceSections";

/**
 * Apply the selected recipe to content suited to its topology.
 * Parent-owned sample state survives every presentation change.
 * Explicit zero-step padding uses the site's reviewed 2px safety floor.
 * @param props Whether the workspace is inside the unified live preview.
 * @returns Canonical named regions or five independent content cards.
 */
export function CombinedWorkbench({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { configuration, announce } = useLabConfiguration();
  const [saved, setSaved] = useState(false);
  const recipe = configuration.recipe ?? (embedded ? "card-grid" : "app-shell");
  const cards = recipe === "card-grid" || recipe === "gallery";
  const recipeRoot = useRef<HTMLElement>(null);
  useRecipeFit(recipeRoot, JSON.stringify(configuration), !cards);
  const areas = recipeAreas(recipe);
  const modeLabel =
    configuration.mode === "contrast"
      ? "High contrast"
      : workspaceLabel(configuration.mode);

  /** Keep fragment navigation in the bounded preview; compact page flow stays native. */
  function navigateToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const host = recipeRoot.current?.closest<HTMLElement>(
      ".workbench-preview-scroll",
    );
    const target = recipeRoot.current?.querySelector<HTMLElement>(`#${id}`);
    if (!host || !target || getComputedStyle(host).overflowY !== "auto") return;
    event.preventDefault();
    const top =
      target.getBoundingClientRect().top -
      host.getBoundingClientRect().top +
      host.scrollTop -
      16;
    host.scrollTo({ top, behavior: "auto" });
    target.focus({ preventScroll: true });
    const url = new URL(location.href);
    url.hash = id;
    history.replaceState(history.state, "", url);
  }
  const overview = <WorkspaceOverview modeLabel={modeLabel} />;
  const metrics = <WorkspaceMetrics />;
  const deliverable = (
    <WorkspaceDeliverable
      saved={saved}
      onOpen={() => announce("Project details opened in the demonstration.")}
      onSave={() => {
        setSaved((value) => !value);
        announce(
          saved
            ? "Project removed from shortlist."
            : "Project saved to shortlist.",
        );
      }}
    />
  );
  const activity = <WorkspaceActivity />;
  const configurationContent = (
    <WorkspaceConfiguration
      configuration={configuration}
      modeLabel={modeLabel}
      onRisk={() => announce("Risk review opened.")}
    />
  );
  const projectHeader = (
    <Layout.Header
      surface="card"
      padding={4}
      className="workbench-region"
      data-ly-area={areas.header}
    >
      <Layout.Cluster
        gap={4}
        align="stretch"
        justify="between"
        className="workspace-toolbar"
      >
        <div className="ly-stack ly-gap-2">
          <small>Northstar rebrand</small>
          <strong>Delivery command center</strong>
        </div>
        <Button
          onClick={() => announce("Northstar project direction approved.")}
        >
          Approve project direction
        </Button>
      </Layout.Cluster>
    </Layout.Header>
  );
  const navigation = (
    <Layout.Surface
      as="nav"
      surface="card"
      padding={4}
      className="workbench-region workspace-navigation"
      data-ly-area={areas.navigation}
      aria-label="Northstar workspace"
    >
      <p className="workbench-kicker">Atelier One</p>
      <div
        className={`workbench-nav ${cards ? "ly-cluster" : "ly-stack"} ly-gap-2`}
      >
        {[
          ["workspace-summary", "Project pulse"],
          ["workspace-deliverables", "Deliverables"],
          ["workspace-activity", "Activity"],
        ].map(([target, label], index) => (
          <a
            key={target}
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            aria-current={index === 0 ? "page" : undefined}
            href={`#${target}`}
            onClick={(event) => navigateToSection(event, target)}
          >
            {label}
          </a>
        ))}
      </div>
    </Layout.Surface>
  );
  const footer = (
    <Layout.Footer
      surface="card"
      padding={4}
      className="workbench-region"
      data-ly-area={areas.footer}
    >
      <Layout.Cluster justify="between" gap={4}>
        <small>Semantic DOM order remains the mobile order.</small>
        <strong>Last synchronized today</strong>
      </Layout.Cluster>
    </Layout.Footer>
  );
  const primaryOnly = !cards && !areas.header;
  const content = (
    <>
      {!primaryOnly && projectHeader}
      {!primaryOnly && navigation}
      {cards ? (
        <Layout.Recipe
          recipe={recipe}
          className="workspace-card-flow"
          data-workspace-cards
        >
          <Card as="section" className="ly-stack ly-gap-4" data-workspace-card>
            {overview}
          </Card>
          <Card as="section" className="ly-stack ly-gap-4" data-workspace-card>
            <h4>Delivery metrics</h4>
            {metrics}
          </Card>
          <Card as="article" data-workspace-card>
            {deliverable}
          </Card>
          <Card as="article" data-workspace-card>
            {activity}
          </Card>
          <Card
            as="section"
            data-workspace-card
            aria-label="Workspace inspector"
          >
            {configurationContent}
          </Card>
        </Layout.Recipe>
      ) : (
        <>
          <Card
            as="section"
            className="workbench-region workbench-main ly-stack ly-gap-6"
            data-ly-area={areas.main}
          >
            {primaryOnly && projectHeader}
            {primaryOnly && navigation}
            {overview}
            {metrics}
            <Layout.Grid
              minColumnWidth="22rem"
              gap={4}
              className="workbench-deliverables"
            >
              <Card as="article">{deliverable}</Card>
              <Card as="article">{activity}</Card>
            </Layout.Grid>
          </Card>
          <Layout.Surface
            as="aside"
            surface="card"
            padding={4}
            className="workbench-region"
            data-ly-area={areas.aside}
            aria-label="Workspace inspector"
          >
            {configurationContent}
          </Layout.Surface>
        </>
      )}
      {footer}
    </>
  );
  const attributes = {
    className: "client-workspace",
    "data-layout-recipe": recipe,
    "data-ly-density": configuration.density ?? "normal",
    "aria-label": "Northstar client delivery workspace",
  };
  return (
    <section
      className={embedded ? "application-specimen" : "section-band ly-section"}
      id={embedded ? undefined : "workbench"}
      aria-label="Example client workspace"
    >
      <Layout.Wrapper measure="workspace">
        {!embedded && (
          <div className="section-heading">
            <h2>See all three layers in one workspace.</h2>
            <p>
              Explore a sample project workspace built with all three libraries.
            </p>
          </div>
        )}
        <div className="workbench-frame">
          {cards ? (
            <Layout.Stack
              ref={recipeRoot}
              as="article"
              gap={4}
              padding={0}
              {...attributes}
            >
              {content}
            </Layout.Stack>
          ) : (
            <Layout.Recipe
              ref={recipeRoot}
              as="article"
              recipe={recipe}
              padding={0}
              {...attributes}
            >
              {content}
            </Layout.Recipe>
          )}
        </div>
      </Layout.Wrapper>
    </section>
  );
}

"use client";

import {
  Badge,
  Button,
  Layout,
  ProgressBar,
  Text,
} from "@sanderson-technology-enterprises/ste-usk-react";
import type { LabConfiguration } from "../lib/configuration";
import { formatThemeLabel } from "../lib/configuration";

/** Format catalog identifiers without changing their stored values. */
export function workspaceLabel(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

/** Show one overview in either a named main region or an independent card. */
export function WorkspaceOverview({ modeLabel }: { modeLabel: string }) {
  return (
    <header
      id="workspace-summary"
      tabIndex={-1}
      className="workbench-main-heading ly-stack ly-gap-3"
    >
      <small>Client workspace</small>
      <h3 id="workspace-title">A confident path to launch</h3>
      <Badge>{modeLabel} mode</Badge>
    </header>
  );
}

/** Keep compact KPI tiles distinct from wider narrative cards. */
export function WorkspaceMetrics() {
  return (
    <Layout.Grid
      aria-label="Delivery metrics"
      minColumnWidth="10rem"
      gap={4}
      className="workbench-metrics"
    >
      {[
        ["Delivery health", "On track"],
        ["Approved milestones", "06 / 08"],
        ["Launch window", "18 days"],
      ].map(([label, value]) => (
        <Layout.Surface key={label} surface="card" padding={4}>
          <dl>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </dl>
        </Layout.Surface>
      ))}
    </Layout.Grid>
  );
}

/** Parent-owned shortlist state survives topology changes and card reparenting. */
interface WorkspaceDeliverableProps {
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}

/** Render the complete project description and working actions without truncation. */
export function WorkspaceDeliverable({
  saved,
  onSave,
  onOpen,
}: WorkspaceDeliverableProps) {
  return (
    <Layout.Stack gap={4} id="workspace-deliverables" tabIndex={-1}>
      <div className="meta-line ly-cluster ly-justify-between ly-gap-2">
        <span>Design system</span>
        <strong>72%</strong>
      </div>
      <h4>Northstar interface language</h4>
      <Text>
        Responsive structure, accessible visual identity, and state mechanics
        prepared as one maintainable system.
      </Text>
      <ProgressBar value={72} label="Design system completion" />
      <Layout.Cluster gap={2}>
        <Button surfaceLevel={2} onClick={onOpen}>
          View project
        </Button>
        <Button
          variant="secondary"
          surfaceLevel={2}
          aria-label={
            saved
              ? "Remove project from shortlist"
              : "Save project to shortlist"
          }
          aria-pressed={saved}
          onClick={onSave}
        >
          {saved ? "Saved" : "Save"}
        </Button>
      </Layout.Cluster>
    </Layout.Stack>
  );
}

/** Preserve the activity sample in every presentation, with natural-height prose. */
export function WorkspaceActivity() {
  return (
    <Layout.Stack gap={4} id="workspace-activity" tabIndex={-1}>
      <small>Latest activity</small>
      <h4>Decisions stay visible</h4>
      <ul className="workbench-activity ly-stack ly-gap-4">
        <li>Navigation model approved by the client team.</li>
        <li>High-contrast interface review completed.</li>
        <li>Responsive content model ready for handoff.</li>
      </ul>
    </Layout.Stack>
  );
}

/** Display the shared client configuration without including editor geometry. */
export function WorkspaceConfiguration({
  configuration,
  modeLabel,
  onRisk,
}: {
  configuration: LabConfiguration;
  modeLabel: string;
  onRisk: () => void;
}) {
  return (
    <Layout.Stack gap={4}>
      <div className="ly-stack ly-gap-2">
        <small>Configuration proof</small>
        <strong>{workspaceLabel(configuration.layout)}</strong>
      </div>
      <dl className="workbench-config ly-stack ly-gap-4">
        {[
          ["UI preset", workspaceLabel(configuration.ui)],
          ["Palette", formatThemeLabel(configuration.theme)],
          ["Mode", modeLabel],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <Button
        variant="secondary"
        surfaceVariant="warning"
        surfaceLevel={2}
        onClick={onRisk}
      >
        Review launch risks
      </Button>
    </Layout.Stack>
  );
}

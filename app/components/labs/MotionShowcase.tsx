"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Layout,
  ProgressBar,
  SegmentedControl,
  Slider,
  Stepper,
  Table,
  Text,
  type LayoutRecipeName,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { ShowcaseRecipe } from "./ShowcaseRecipe";
import { useSurfaceFeedback } from "../useSurfaceFeedback";
import { AnimatedModal, AnimatedTooltip } from "../AnimatedOverlays";

/** Demo rows belong to this specimen; they never represent live project data. */
const activity = [
  {
    name: "Preview interface",
    owner: "Design",
    state: "Ready",
    variant: "success",
  },
  { name: "Component audit", owner: "QA", state: "Review", variant: "warning" },
  {
    name: "Motion contract",
    owner: "Engineering",
    state: "Active",
    variant: "primary",
  },
  { name: "Release notes", owner: "Docs", state: "Draft", variant: "neutral" },
] as const;

/** A panel's motion shell remains separate from its painted component surface. */
interface SpecimenProps {
  title: string;
  level: 1 | 2 | 3;
  embedded: boolean;
  featured?: boolean;
  children: ReactNode;
}

/**
 * Compose a motion target from the public Card and Layout contracts.
 * @param props Panel content, surface depth, and guide heading context.
 * @returns A dedicated motion shell containing one semantic specimen card.
 */
function Specimen({
  title,
  level,
  embedded,
  featured,
  children,
}: SpecimenProps) {
  const Heading = embedded ? "h4" : "h3";
  return (
    <div data-motion-item data-motion-featured={featured || undefined}>
      <Card interactive surfaceLevel={level} spacing="compact">
        <Card.Body className="ly-stack ly-gap-4">
          <Heading>{title}</Heading>
          {children}
        </Card.Body>
      </Card>
    </div>
  );
}

/**
 * Render working, local-only UI specimens for motion and visual-style comparison.
 * Form edits, filtering, selection, and confirmation remain in component state.
 * @param props Whether the specimen belongs to the embedded component guide.
 * @returns Six varied panels sharing the installed STE component contract.
 */
export function MotionShowcase({
  embedded,
  recipe = "card-grid",
  levelOverride,
}: {
  embedded: boolean;
  recipe?: LayoutRecipeName;
  levelOverride?: 1 | 2 | 3;
}) {
  const [project, setProject] = useState("Northstar workspace");
  const [notice, setNotice] = useState("Your preview is ready to explore.");
  const [pinned, setPinned] = useState(false);
  const [readiness, setReadiness] = useState(68);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("overview");
  const [confirming, setConfirming] = useState(false);
  const feedback = useSurfaceFeedback();
  const feedbackCount = useRef(0);
  const visibleActivity = activity.filter((row) =>
    `${row.name} ${row.owner} ${row.state}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <>
      <header className="ly-cluster ly-justify-between ly-gap-3">
        <div className="ly-stack ly-gap-2">
          <p className="section-label">Northstar / Release studio</p>
          <p>One workspace. Different surfaces. Motion you can compare.</p>
        </div>
        <Badge variant="secondary">Interactive demo · local data</Badge>
      </header>
      <ShowcaseRecipe recipe={recipe}>
        <Specimen
          title="Actions & states"
          level={levelOverride ?? 1}
          embedded={embedded}
        >
          <Layout.Grid minColumnWidth="7rem" gap={3}>
            <Button
              size="sm"
              onClick={() => setNotice("Release queued in this preview.")}
            >
              Queue release
            </Button>
            <Button
              size="sm"
              variant="secondary"
              aria-pressed={pinned}
              onClick={() => setPinned(!pinned)}
            >
              {pinned ? "Release pinned" : "Pin release"}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setNotice("Draft cleared in this preview.")}
            >
              Clear draft
            </Button>
            <AnimatedTooltip content="These controls change this local preview only.">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNotice("All changes stay in this preview.")}
              >
                Preview help
              </Button>
            </AnimatedTooltip>
            <Button size="sm" disabled>
              Unavailable
            </Button>
            <Button size="sm" isLoading>
              Building
            </Button>
          </Layout.Grid>
          <p className="section-label">Context & status</p>
          <Layout.Cluster gap={2}>
            <Badge>Draft</Badge>
            <Badge variant="primary">Active</Badge>
            <Badge variant="success">Ready</Badge>
            <Badge variant="warning">Review</Badge>
            <Badge variant="danger">Blocked</Badge>
          </Layout.Cluster>
          <p>
            Hover or use Tab to compare focus, pressed, loading, and disabled
            states.
          </p>
        </Specimen>

        <Specimen
          title="Fields & choices"
          level={levelOverride ?? 2}
          embedded={embedded}
        >
          <Form
            className="ly-stack ly-gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setNotice(`${project.trim()} saved in this preview.`);
            }}
          >
            <Form.Input
              className="interactive-surface"
              label="Project name"
              value={project}
              required
              onChange={(event) => setProject(event.target.value)}
            />
            <Form.Select
              className="interactive-surface"
              label="Release channel"
              defaultValue="preview"
            >
              <option value="preview">Preview environment</option>
              <option value="stable">Stable environment</option>
              <option value="canary">Canary environment</option>
            </Form.Select>
            <Form.TextArea
              className="interactive-surface"
              label="Release notes"
              rows={2}
              defaultValue="A clear beginning. A considered finish."
            />
            <Layout.Cluster gap={3}>
              <Form.Checkbox
                className="interactive-surface"
                label="Include changelog"
                defaultChecked
              />
              <Form.Toggle
                className="interactive-surface"
                label="Notify team"
                defaultChecked
              />
            </Layout.Cluster>
            <Button type="submit" size="sm">
              Save draft
            </Button>
          </Form>
        </Specimen>

        <Specimen
          title="Progress & stages"
          level={levelOverride ?? 1}
          embedded={embedded}
        >
          <ProgressBar label="Release readiness" value={readiness} showValue />
          <Slider
            label="Readiness preview"
            min={0}
            max={100}
            value={readiness}
            onChange={(event) => setReadiness(Number(event.target.value))}
          />
          <Stepper
            label="Release stages"
            className="ly-stack ly-items-stretch ly-gap-3"
          >
            <Stepper.Step
              className="showcase-stage"
              label="Connect"
              state="complete"
              marker="1"
            >
              <Text>Source connected</Text>
            </Stepper.Step>
            <Stepper.Step
              className="showcase-stage"
              label="Review"
              state="current"
              marker="2"
            >
              <Text>Checking the details</Text>
            </Stepper.Step>
            <Stepper.Step
              className="showcase-stage"
              label="Publish"
              state="upcoming"
              marker="3"
            >
              <Text>Ready when you are</Text>
            </Stepper.Step>
          </Stepper>
        </Specimen>

        <Specimen
          title="Activity & data"
          level={levelOverride ?? 2}
          embedded={embedded}
        >
          <Form.Input
            className="interactive-surface"
            label="Filter activity"
            type="search"
            placeholder="Find a task, owner, or state"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Table>
            <Table.Caption>Release activity</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Task</Table.Th>
                <Table.Th scope="col">Owner</Table.Th>
                <Table.Th scope="col">State</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visibleActivity.map((row) => (
                <Table.Tr key={row.name}>
                  <Table.Th scope="row">{row.name}</Table.Th>
                  <Table.Td>{row.owner}</Table.Td>
                  <Table.Td>
                    <Badge variant={row.variant}>{row.state}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {visibleActivity.length === 0 && <p>No matching activity.</p>}
          <p>
            {visibleActivity.length} of {activity.length} sample tasks
          </p>
        </Specimen>

        <Specimen
          title="Feedback & alerts"
          level={levelOverride ?? 1}
          embedded={embedded}
        >
          <Layout.Cluster gap={3}>
            {(["success", "error", "attention"] as const).map((outcome) => (
              <Button
                key={outcome}
                size="sm"
                variant={
                  outcome === "error"
                    ? "danger"
                    : outcome === "success"
                      ? "primary"
                      : "secondary"
                }
                onClick={(event) => {
                  feedback(event.currentTarget, outcome);
                  feedbackCount.current++;
                  setNotice(
                    `${outcome[0].toUpperCase()}${outcome.slice(1)} feedback replayed. Preview event ${feedbackCount.current}.`,
                  );
                }}
              >
                {outcome[0].toUpperCase()}
                {outcome.slice(1)} reflex
              </Button>
            ))}
          </Layout.Cluster>
          <Alert variant="success" title="Preview feedback">
            {notice}
          </Alert>
          <Alert variant="warning" title="Review before release">
            This workspace uses sample data. Nothing is published.
          </Alert>
          <Form.Input
            className="interactive-surface"
            label="Version label"
            defaultValue="preview candidate"
            error="Use a version such as 1.1.0."
          />
          <Form.Input
            className="interactive-surface"
            label="Managed endpoint"
            value="Local preview only"
            disabled
            readOnly
          />
        </Specimen>

        <Specimen
          title="Review & confirmation"
          level={levelOverride ?? 3}
          embedded={embedded}
          featured
        >
          <Badge variant="success">Ready for your review</Badge>
          <SegmentedControl
            label="Release detail"
            value={channel}
            onValueChange={setChannel}
          >
            <SegmentedControl.Item
              className="interactive-surface"
              value="overview"
            >
              Overview
            </SegmentedControl.Item>
            <SegmentedControl.Item
              className="interactive-surface"
              value="changes"
            >
              Changes
            </SegmentedControl.Item>
          </SegmentedControl>
          <p>
            {channel === "overview"
              ? "A featured surface for a focused entrance or exit. Compare its emphasis with the supporting panels."
              : "Updated controls, accessible feedback, and coordinated panels. Every change here is a local demonstration."}
          </p>
          <Layout.Stack gap={3}>
            <ProgressBar
              label="Review checklist"
              value={3}
              max={4}
              showValue
              formatValue={(value, max) => `${value} of ${max}`}
            />
            <Button onClick={() => setConfirming(true)}>
              Preview confirmation
            </Button>
          </Layout.Stack>
        </Specimen>
      </ShowcaseRecipe>
      <AnimatedModal
        open={confirming}
        onOpenChange={setConfirming}
        title="Publish this preview?"
        description="Inspect the dialog styling and keyboard behavior without publishing anything."
        size="sm"
        footer={
          <Layout.Cluster gap={3}>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Keep editing
            </Button>
            <Button
              onClick={() => {
                setNotice("Confirmation complete. Nothing was published.");
                setConfirming(false);
              }}
            >
              Confirm preview
            </Button>
          </Layout.Cluster>
        }
      >
        <p>
          All changes stay in this local demonstration. Escape returns you to
          the workspace.
        </p>
      </AnimatedModal>
    </>
  );
}

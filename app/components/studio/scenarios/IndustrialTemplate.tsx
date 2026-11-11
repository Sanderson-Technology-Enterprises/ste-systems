"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Layout,
  Meter,
  Metric,
  Svg,
  Table,
  Tabs,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  ScenarioIcon,
  ScenarioScaffold,
  scenarioLevel,
  useSampleOutcome,
  type ScenarioProps,
} from "./ScenarioScaffold";

const ALARMS = [
  {
    id: "filter",
    title: "Filter inspection due",
    equipment: "Air handling AH-01",
    severity: "Attention",
    time: "09:42",
  },
  {
    id: "batch",
    title: "Sample batch complete",
    equipment: "Packing PK-02",
    severity: "Information",
    time: "09:30",
  },
] as const;

/** Simulated equipment overview, operator controls, and alarms never connect to hardware. */
export function IndustrialTemplate({ model, navigate }: ScenarioProps) {
  const [running, setRunning] = useState(false);
  const [setpoint, setSetpoint] = useState("45");
  const [speed, setSpeed] = useState(45);
  const [filter, setFilter] = useState("All");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(
    () => new Set(["batch"]),
  );
  const outcome = useSampleOutcome();
  const alarms = ALARMS.filter(
    (item) =>
      filter === "All" ||
      (filter === "Unacknowledged"
        ? !acknowledged.has(item.id)
        : acknowledged.has(item.id)),
  );
  const reset = () => {
    setRunning(false);
    setSpeed(45);
    setSetpoint("45");
    setAcknowledged(new Set(["batch"]));
    outcome.report("Local equipment simulation reset.");
  };
  const overview = (
    <Layout.Stack gap={4}>
      <h2>Production trend</h2>
      <p>Six fixed sample readings · units per minute</p>
      <Svg
        viewBox="0 0 640 180"
        width="100%"
        height="180"
        role="img"
        aria-label="Sample production trend: 44, 48, 46, 55, 58, 61 units per minute"
      >
        <path
          d="M20 150H620M20 20V150"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <polyline
          points="20,130 140,110 260,120 380,75 500,60 620,45"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
      </Svg>
      <h2>Process overview</h2>
      <Layout.Grid minColumnWidth="12rem" gap={3}>
        {[
          { name: "Feed station", icon: "package" },
          { name: "Assembly cell", icon: "settings" },
          { name: "Packing line", icon: "check" },
        ].map((item, index) => (
          <div key={item.name} data-motion-item>
            <Card
              interactive
              spacing="comfortable"
              surfaceLevel={scenarioLevel(model, (index + 1) as 1 | 2 | 3)}
            >
              <Layout.Stack gap={3}>
                <ScenarioIcon
                  model={model}
                  name={item.icon as "package" | "settings" | "check"}
                  size="2rem"
                />
                <h3>{item.name}</h3>
                <Badge>{running ? "Simulated running" : "Standby"}</Badge>
                <p>Station {index + 1} · local sample</p>
              </Layout.Stack>
            </Card>
          </div>
        ))}
      </Layout.Grid>
    </Layout.Stack>
  );
  const aside = (
    <Card
      interactive
      spacing="comfortable"
      surfaceLevel={scenarioLevel(model, 1)}
    >
      <Layout.Stack gap={3}>
        <h2>Shift snapshot</h2>
        <p>Line A · Training workspace</p>
        <Meter label="Sample material level" value={72} min={0} max={100} />
        <Meter label="Simulated speed" value={speed} min={0} max={100} />
        <Badge>
          {ALARMS.filter((item) => !acknowledged.has(item.id)).length}{" "}
          unacknowledged alarm
        </Badge>
        <Button variant="secondary" onClick={reset}>
          Reset simulation
        </Button>
      </Layout.Stack>
    </Card>
  );
  return (
    <ScenarioScaffold
      model={model}
      navigate={navigate}
      brand="Lineworks"
      navigation={[
        { screen: "overview", label: "Overview" },
        { screen: "operator", label: "Operator panel" },
        { screen: "alarms", label: "Alarms" },
      ]}
      aside={aside}
      notice={outcome.notice}
      error={outcome.error}
    >
      <Layout.Stack gap={5}>
        <Badge>Simulated equipment · no hardware connection</Badge>
        <h1>
          {model.preview.screen === "overview"
            ? model.copy.headline
            : model.preview.screen === "operator"
              ? "Line A operator panel"
              : "Alarm center"}
        </h1>
        <Layout.Grid minColumnWidth="10rem" gap={3}>
          <Metric
            label="Line status"
            value={running ? "Running" : "Standby"}
            detail="Simulation only"
          />
          <Metric
            label="Sample output"
            value="1,260"
            detail="Units this sample shift"
          />
          <Metric
            label="Sample availability"
            value="96.4%"
            detail="Fixed demonstration metric"
          />
        </Layout.Grid>
        {model.preview.screen === "overview" ? (
          overview
        ) : model.preview.screen === "operator" ? (
          <Tabs defaultValue="controls">
            <Tabs.List label="Operator panel sections">
              <Tabs.Tab className="interactive-surface" value="controls">
                Controls
              </Tabs.Tab>
              <Tabs.Tab className="interactive-surface" value="interlocks">
                Interlocks
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="controls">
              <Layout.Stack gap={4}>
                <h2>Simulated line controls</h2>
                <p>These controls change this preview&apos;s local state.</p>
                <Layout.Cluster gap={3}>
                  <Button
                    disabled={running}
                    onClick={() => {
                      setRunning(true);
                      outcome.report(
                        "Simulated line started. No hardware command was sent.",
                      );
                    }}
                    surfaceLevel={scenarioLevel(model, 3)}
                    surfaceFeedback={outcome.feedback}
                  >
                    Start simulated line
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!running}
                    onClick={() => {
                      setRunning(false);
                      outcome.report(
                        "Simulated line stopped. No hardware command was sent.",
                      );
                    }}
                  >
                    Stop simulated line
                  </Button>
                </Layout.Cluster>
                <Form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    const value = Number(setpoint);
                    if (
                      !setpoint.trim() ||
                      !Number.isFinite(value) ||
                      value < 0 ||
                      value > 100
                    )
                      return outcome.report(
                        "Enter a simulated setpoint between 0 and 100 percent.",
                        true,
                      );
                    setSpeed(value);
                    outcome.report(
                      `Simulated setpoint updated to ${value}%. No hardware command was sent.`,
                    );
                  }}
                >
                  <Layout.Stack gap={3}>
                    <Form.Input
                      className="interactive-surface"
                      label="Simulated speed setpoint (%)"
                      type="number"
                      min="0"
                      max="100"
                      value={setpoint}
                      onChange={(event) => setSetpoint(event.target.value)}
                    />
                    <Button type="submit" surfaceFeedback={outcome.feedback}>
                      Apply simulated setpoint
                    </Button>
                  </Layout.Stack>
                </Form>
              </Layout.Stack>
            </Tabs.Panel>
            <Tabs.Panel value="interlocks">
              <Layout.Stack gap={3}>
                <h2>Training interlock display</h2>
                <p>Guard closed: sample ready</p>
                <p>Material available: sample ready</p>
                <p>
                  This display illustrates status presentation. It does not
                  validate a machine&apos;s safety state.
                </p>
              </Layout.Stack>
            </Tabs.Panel>
          </Tabs>
        ) : (
          <Layout.Stack gap={4}>
            <Form.Select
              className="interactive-surface"
              label="Alarm filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              {["All", "Unacknowledged", "Acknowledged"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
            <Table>
              <Table.Caption>Simulated equipment alarms</Table.Caption>
              <Table.Thead>
                <Table.Tr>
                  {["Time", "Alarm", "Equipment", "State", "Action"].map(
                    (label) => (
                      <Table.Th key={label} scope="col">
                        {label}
                      </Table.Th>
                    ),
                  )}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {alarms.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.time}</Table.Td>
                    <Table.Th scope="row">
                      {item.title}
                      <br />
                      <Badge>{item.severity}</Badge>
                    </Table.Th>
                    <Table.Td>{item.equipment}</Table.Td>
                    <Table.Td>
                      {acknowledged.has(item.id)
                        ? "Acknowledged"
                        : "Needs review"}
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="secondary"
                        disabled={acknowledged.has(item.id)}
                        onClick={() => {
                          setAcknowledged((current) =>
                            new Set(current).add(item.id),
                          );
                          outcome.report(
                            `${item.title} acknowledged in this simulation.`,
                          );
                        }}
                      >
                        Acknowledge {item.title}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {!alarms.length && <p>No alarms match this filter.</p>}
          </Layout.Stack>
        )}
      </Layout.Stack>
    </ScenarioScaffold>
  );
}

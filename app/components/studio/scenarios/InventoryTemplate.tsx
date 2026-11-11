"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Layout,
  Metric,
  Table,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  ScenarioIcon,
  ScenarioScaffold,
  scenarioLevel,
  useSampleOutcome,
  type ScenarioProps,
} from "./ScenarioScaffold";

interface StockItem {
  sku: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  minimum: number;
  unit: string;
}
const INITIAL_STOCK: readonly StockItem[] = [
  {
    sku: "BRG-010",
    name: "Precision bearing",
    category: "Parts",
    location: "A-02 · Bin 04",
    quantity: 8,
    minimum: 10,
    unit: "each",
  },
  {
    sku: "GLV-024",
    name: "Workshop gloves",
    category: "Supplies",
    location: "B-01 · Bin 12",
    quantity: 24,
    minimum: 12,
    unit: "pairs",
  },
  {
    sku: "BLT-048",
    name: "Drive belt",
    category: "Parts",
    location: "A-04 · Bin 06",
    quantity: 16,
    minimum: 5,
    unit: "each",
  },
];
interface StockMovement {
  id: number;
  sku: string;
  name: string;
  delta: number;
  balance: number;
  reason: string;
}

/** A searchable stock workspace with validated, explicitly local sample adjustments. */
export function InventoryTemplate({ model, navigate }: ScenarioProps) {
  const [items, setItems] = useState<StockItem[]>(() =>
    INITIAL_STOCK.map((item) => ({ ...item })),
  );
  const [selected, setSelected] = useState("BRG-010");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lowStock, setLowStock] = useState(false);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("Sample receipt");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const outcome = useSampleOutcome();
  const item = items.find((entry) => entry.sku === selected)!;
  const visible = items.filter(
    (entry) =>
      `${entry.sku} ${entry.name} ${entry.location}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (category === "All" || entry.category === category) &&
      (!lowStock || entry.quantity <= entry.minimum),
  );
  const aside = (
    <Card
      interactive
      spacing="comfortable"
      surfaceLevel={scenarioLevel(model, 1)}
    >
      <Layout.Stack gap={3}>
        <ScenarioIcon model={model} name="package" size="3rem" />
        <h2>Location guide</h2>
        <p>A · Parts storage</p>
        <p>B · Workshop supplies</p>
        <h3>Replenishment</h3>
        <p>
          {items.filter((entry) => entry.quantity <= entry.minimum).length} item
          below its sample reorder threshold.
        </p>
        <small>Locations and quantities are fictional examples.</small>
      </Layout.Stack>
    </Card>
  );
  return (
    <ScenarioScaffold
      model={model}
      navigate={navigate}
      brand="Stockroom"
      navigation={[
        { screen: "items", label: "Stock list" },
        { screen: "movement", label: "Movements" },
      ]}
      aside={aside}
      notice={outcome.notice}
      error={outcome.error}
    >
      <Layout.Stack gap={5}>
        <Badge>
          Local demonstration data · no warehouse records are changed
        </Badge>
        <h1>
          {model.preview.screen === "items"
            ? model.copy.headline
            : model.preview.screen === "item"
              ? item.name
              : "Sample stock movements"}
        </h1>
        <Layout.Grid minColumnWidth="10rem" gap={3}>
          <Metric
            label="Stock items"
            value={items.length}
            detail="Sample catalog"
          />
          <Metric
            label="Low stock"
            value={
              items.filter((entry) => entry.quantity <= entry.minimum).length
            }
            detail="At or below minimum"
          />
          <Metric label="Storage locations" value="3" detail="Fictional bins" />
        </Layout.Grid>
        {model.preview.screen === "items" ? (
          <>
            <Layout.Cluster gap={3}>
              <Form.Input
                className="interactive-surface"
                label="Search inventory"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, SKU, or location"
              />
              <Form.Select
                className="interactive-surface"
                label="Inventory category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {["All", "Parts", "Supplies"].map((entry) => (
                  <option key={entry}>{entry}</option>
                ))}
              </Form.Select>
              <Form.Checkbox
                className="interactive-surface"
                label="Low stock only"
                checked={lowStock}
                onChange={(event) => setLowStock(event.target.checked)}
              />
            </Layout.Cluster>
            <Table>
              <Table.Caption>Sample inventory stock</Table.Caption>
              <Table.Thead>
                <Table.Tr>
                  {[
                    "Item / SKU",
                    "Category",
                    "Location",
                    "On hand",
                    "Action",
                  ].map((label) => (
                    <Table.Th key={label} scope="col">
                      {label}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visible.map((entry) => (
                  <Table.Tr key={entry.sku}>
                    <Table.Th scope="row">
                      {entry.name}
                      <br />
                      <small>{entry.sku}</small>
                    </Table.Th>
                    <Table.Td>{entry.category}</Table.Td>
                    <Table.Td>{entry.location}</Table.Td>
                    <Table.Td>
                      {entry.quantity} {entry.unit}
                      <br />
                      {entry.quantity <= entry.minimum && (
                        <Badge>Low stock</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelected(entry.sku);
                          navigate("item");
                        }}
                      >
                        Open {entry.name}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {!visible.length && <p>No items match these filters.</p>}
          </>
        ) : model.preview.screen === "item" ? (
          <Card
            interactive
            spacing="comfortable"
            surfaceLevel={scenarioLevel(model, 2)}
          >
            <Layout.Stack gap={4}>
              <ScenarioIcon model={model} name="package" size="4rem" />
              <Badge>
                {item.sku} · {item.category}
              </Badge>
              <Metric
                label="Available quantity"
                value={`${item.quantity} ${item.unit}`}
              />
              <p>{item.location}</p>
              <p>
                Sample reorder minimum: {item.minimum} {item.unit}
              </p>
              <p>
                Inspect the information hierarchy, stock status, and clarity of
                everyday actions.
              </p>
              <Button
                surfaceLevel={scenarioLevel(model, 3)}
                onClick={() => navigate("movement")}
              >
                Adjust sample stock
              </Button>
              <Button variant="ghost" onClick={() => navigate("items")}>
                Back to stock list
              </Button>
            </Layout.Stack>
          </Card>
        ) : (
          <>
            <Card
              interactive
              spacing="comfortable"
              surfaceLevel={scenarioLevel(model, 2)}
            >
              <Layout.Stack gap={4}>
                <h2>Try a stock adjustment</h2>
                <Form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    const change = Number(delta);
                    if (
                      !delta.trim() ||
                      !Number.isInteger(change) ||
                      change === 0 ||
                      Math.abs(change) > 100000
                    )
                      return outcome.report(
                        "Enter a nonzero whole quantity between -100000 and 100000.",
                        true,
                      );
                    const balance = item.quantity + change;
                    if (balance < 0)
                      return outcome.report(
                        "Sample stock cannot be negative. Reduce the quantity being removed.",
                        true,
                      );
                    if (balance > 1000000)
                      return outcome.report(
                        "The sample stock limit is 1000000 units.",
                        true,
                      );
                    setItems((current) =>
                      current.map((entry) =>
                        entry.sku === selected
                          ? { ...entry, quantity: balance }
                          : entry,
                      ),
                    );
                    setMovements((current) => [
                      {
                        id: current.length + 1,
                        sku: item.sku,
                        name: item.name,
                        delta: change,
                        balance,
                        reason,
                      },
                      ...current,
                    ]);
                    setDelta("");
                    outcome.report(
                      `Sample stock updated to ${balance} ${item.unit}. No warehouse records were changed.`,
                    );
                  }}
                >
                  <Layout.Stack gap={3}>
                    <Form.Select
                      className="interactive-surface"
                      label="Adjustment item"
                      value={selected}
                      onChange={(event) => setSelected(event.target.value)}
                    >
                      {items.map((entry) => (
                        <option key={entry.sku} value={entry.sku}>
                          {entry.name} ({entry.sku})
                        </option>
                      ))}
                    </Form.Select>
                    <p>
                      Current sample quantity: {item.quantity} {item.unit}
                    </p>
                    <Form.Input
                      className="interactive-surface"
                      label="Quantity change"
                      type="number"
                      step="1"
                      value={delta}
                      onChange={(event) => setDelta(event.target.value)}
                      placeholder="For example, 5 or -2"
                    />
                    <Form.Select
                      className="interactive-surface"
                      label="Adjustment reason"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    >
                      {[
                        "Sample receipt",
                        "Sample issue",
                        "Sample count correction",
                      ].map((entry) => (
                        <option key={entry}>{entry}</option>
                      ))}
                    </Form.Select>
                    <Button
                      type="submit"
                      surfaceLevel={scenarioLevel(model, 3)}
                      surfaceFeedback={outcome.feedback}
                    >
                      Apply sample adjustment
                    </Button>
                  </Layout.Stack>
                </Form>
              </Layout.Stack>
            </Card>
            <Table>
              <Table.Caption>Sample stock movements</Table.Caption>
              <Table.Thead>
                <Table.Tr>
                  {["Reference", "Item", "Change", "Balance", "Reason"].map(
                    (label) => (
                      <Table.Th key={label} scope="col">
                        {label}
                      </Table.Th>
                    ),
                  )}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {movements.length ? (
                  movements.map((entry) => (
                    <Table.Tr key={entry.id}>
                      <Table.Th scope="row">
                        DEMO-{String(entry.id).padStart(3, "0")}
                      </Table.Th>
                      <Table.Td>{entry.name}</Table.Td>
                      <Table.Td>
                        {entry.delta > 0 ? "+" : ""}
                        {entry.delta}
                      </Table.Td>
                      <Table.Td>{entry.balance}</Table.Td>
                      <Table.Td>{entry.reason}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>No sample adjustments yet.</Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </>
        )}
      </Layout.Stack>
    </ScenarioScaffold>
  );
}

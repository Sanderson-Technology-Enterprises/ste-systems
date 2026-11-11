"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Layout,
  Modal,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  ScenarioIcon,
  ScenarioScaffold,
  scenarioLevel,
  useSampleOutcome,
  type ScenarioProps,
} from "./ScenarioScaffold";

const PRODUCTS = [
  { name: "Field notebook", category: "Office", price: 18, icon: "file-text" },
  {
    name: "Studio carry bag",
    category: "Everyday",
    price: 42,
    icon: "shopping-bag",
  },
  { name: "Workshop toolkit", category: "Everyday", price: 68, icon: "wrench" },
] as const;

/** Product discovery, details, and an editable sample cart remain local to this preview. */
export function StorefrontTemplate({ model, navigate }: ScenarioProps) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState("Field notebook");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [confirmation, setConfirmation] = useState(false);
  const outcome = useSampleOutcome();
  const product = PRODUCTS.find((item) => item.name === selected)!;
  const count = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  const total = PRODUCTS.reduce(
    (sum, item) => sum + (cart[item.name] ?? 0) * item.price,
    0,
  );
  const visible = PRODUCTS.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || item.category === category),
  );
  const add = (name: string) => {
    if ((cart[name] ?? 0) >= 99)
      return outcome.report(
        "The sample cart supports up to 99 of each item.",
        true,
      );
    setCart((current) => ({ ...current, [name]: (current[name] ?? 0) + 1 }));
    setQuantities((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
    outcome.report(`Added ${name} to the sample cart.`);
  };
  return (
    <ScenarioScaffold
      model={model}
      navigate={navigate}
      brand="Everyday Supply"
      navigation={[
        { screen: "browse", label: "Shop" },
        { screen: "cart", label: `View cart (${count})` },
      ]}
      notice={outcome.notice}
      error={outcome.error}
    >
      <Layout.Stack gap={5}>
        {model.preview.screen === "cart" ? (
          <>
            <h1>Your sample cart</h1>
            {!count ? (
              <p>
                Your cart is empty. Browse the sample products to add an item.
              </p>
            ) : (
              <>
                {Object.entries(cart).map(([name, quantity]) => (
                  <Card
                    interactive
                    key={name}
                    spacing="comfortable"
                    surfaceLevel={scenarioLevel(model, 1)}
                  >
                    <Layout.Stack gap={3}>
                      <h2>{name}</h2>
                      <p>{quantity} in your sample cart</p>
                      <Form.Input
                        className="interactive-surface"
                        label={`${name} quantity`}
                        type="number"
                        min="1"
                        max="99"
                        value={quantities[name] ?? String(quantity)}
                        onChange={(event) =>
                          setQuantities((current) => ({
                            ...current,
                            [name]: event.target.value,
                          }))
                        }
                      />
                      <Layout.Cluster gap={2}>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const raw = quantities[name] ?? String(quantity);
                            const value = Number(raw);
                            if (
                              !raw.trim() ||
                              !Number.isInteger(value) ||
                              value < 1 ||
                              value > 99
                            )
                              return outcome.report(
                                "Enter a whole quantity between 1 and 99.",
                                true,
                              );
                            setCart((current) => ({
                              ...current,
                              [name]: value,
                            }));
                            outcome.report(
                              `Updated ${name} quantity to ${value}.`,
                            );
                          }}
                        >
                          Update {name} quantity
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setCart((current) => {
                              const next = { ...current };
                              delete next[name];
                              return next;
                            });
                            outcome.report(`${name} removed.`);
                          }}
                        >
                          Remove {name}
                        </Button>
                      </Layout.Cluster>
                    </Layout.Stack>
                  </Card>
                ))}
                <strong>Total: ${total}</strong>
                <p>Sample prices and order summary. No payment is collected.</p>
                <Button
                  surfaceLevel={scenarioLevel(model, 3)}
                  onClick={() => {
                    outcome.report(
                      "Sample order reviewed. No order was placed and no payment was collected.",
                    );
                    setConfirmation(true);
                  }}
                >
                  <ScenarioIcon model={model} name="check" />
                  Try sample checkout
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={() => navigate("browse")}>
              Continue browsing
            </Button>
          </>
        ) : model.preview.screen === "product" ? (
          <>
            <Badge>{product.category} · Sample product</Badge>
            <Layout.Center>
              <ScenarioIcon model={model} name={product.icon} size="6rem" />
            </Layout.Center>
            <h1>{product.name}</h1>
            <p>
              Practical materials and a clear purpose. A sample product detail
              for comparing your design.
            </p>
            <strong>${product.price}</strong>
            <Button
              onClick={() => add(product.name)}
              surfaceFeedback={outcome.feedback}
              aria-label={`Add ${product.name} to cart`}
            >
              <ScenarioIcon model={model} name="cart" />
              Add to cart
            </Button>
            <Button variant="secondary" onClick={() => navigate("browse")}>
              Back to products
            </Button>
          </>
        ) : (
          <>
            <Badge>Objects for a thoughtful day</Badge>
            <h1>{model.copy.headline}</h1>
            <p>
              Useful objects, carefully selected. Explore a sample store and its
              everyday interactions.
            </p>
            <Layout.Cluster gap={3}>
              <Form.Input
                className="interactive-surface"
                label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find an everyday essential"
              />
              <Form.Select
                className="interactive-surface"
                label="Product category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {["All", "Office", "Everyday"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Form.Select>
            </Layout.Cluster>
            <Layout.Grid minColumnWidth="14rem" gap={4}>
              {visible.map((item, index) => (
                <div key={item.name} data-motion-item>
                  <Card
                    interactive
                    spacing="comfortable"
                    surfaceLevel={scenarioLevel(
                      model,
                      (index + 1) as 1 | 2 | 3,
                    )}
                  >
                    <Layout.Stack gap={3}>
                      <Layout.Center>
                        <ScenarioIcon
                          model={model}
                          name={item.icon}
                          size="4rem"
                        />
                      </Layout.Center>
                      <Badge>{item.category}</Badge>
                      <h2>{item.name}</h2>
                      <strong>${item.price}</strong>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelected(item.name);
                          navigate("product");
                        }}
                      >
                        View {item.name}
                      </Button>
                      <Button
                        surfaceFeedback={outcome.feedback}
                        aria-label={`Add ${item.name} to cart`}
                        onClick={() => add(item.name)}
                      >
                        <ScenarioIcon model={model} name="cart" />
                        Add to cart
                      </Button>
                    </Layout.Stack>
                  </Card>
                </div>
              ))}
            </Layout.Grid>
            {!visible.length && (
              <p>No matching products. Try another search.</p>
            )}
          </>
        )}
        <Modal
          open={confirmation}
          onOpenChange={setConfirmation}
          title="Sample confirmation"
        >
          <p>{outcome.notice}</p>
          <Button onClick={() => setConfirmation(false)}>
            Close sample confirmation
          </Button>
        </Modal>
      </Layout.Stack>
    </ScenarioScaffold>
  );
}

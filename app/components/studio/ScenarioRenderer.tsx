"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Icon,
  Layout,
  Modal,
  type IconName,
} from "@sanderson-technology-enterprises/ste-usk-react";
import type { PreviewRenderModel } from "../../lib/preview-protocol";
import { recipeAreas } from "../../lib/playground-options";
import { MotionShowcase } from "../labs/MotionShowcase";
import { LayoutExplorer } from "../labs/LayoutExplorer";

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

/** Renders the same curated content in live, comparison, thumbnail, and capture contexts. */
export function ScenarioRenderer({
  model,
  navigate,
}: {
  model: PreviewRenderModel;
  navigate: (screen: string) => void;
}) {
  const { design, copy, preview } = model;
  const [notice, setNotice] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState("Field notebook");
  const [confirmation, setConfirmation] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState<
    "success" | "error" | "attention" | undefined
  >();
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(undefined), 1200);
    return () => clearTimeout(timer);
  }, [feedback]);
  const glyph = (name: IconName, size?: string) => (
    <Icon
      name={name}
      size={size}
      pack={design.iconPack === "auto" ? undefined : design.iconPack}
      variant={design.iconVariant}
    />
  );
  const depth = (level: 1 | 2 | 3) =>
    design.level === "mixed" ? level : design.level;
  const card = (children: ReactNode, level: 1 | 2 | 3 = 2, key?: string) => (
    <div data-motion-item key={key}>
      <Card interactive surfaceLevel={depth(level)} spacing="comfortable">
        <Layout.Stack gap={3}>{children}</Layout.Stack>
      </Card>
    </div>
  );
  const button = (
    label: string,
    action: () => void,
    name: IconName = "arrow-right",
  ) => (
    <Button onClick={action} surfaceLevel={depth(2)}>
      {glyph(name)} {label}
    </Button>
  );
  const submit = (form: HTMLFormElement, message: string) => {
    const data = new FormData(form);
    if (
      !String(data.get("name") ?? "").trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("email") ?? ""))
    ) {
      setFormError("Enter a name and a valid email address to try the sample.");
      setFeedback("error");
      return;
    }
    setFormError("");
    setNotice(message);
    setFeedback("success");
    if (preview.scenario === "booking") navigate("confirmation");
    else setConfirmation(true);
  };
  const inquiry = (booking = false) => (
    <Form
      className="ly-stack ly-gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit(
          event.currentTarget,
          booking
            ? "Sample request received. No appointment has been booked."
            : "Sample inquiry received. No message has been sent.",
        );
      }}
    >
      <Form.Input name="name" label="Your name" required autoComplete="off" />
      <Form.Input
        name="email"
        label="Email address"
        type="email"
        required
        autoComplete="off"
      />
      {booking && (
        <>
          <Form.Select name="service" label="Choose a service">
            <option>Design consultation</option>
            <option>Project planning</option>
            <option>Website review</option>
          </Form.Select>
          <Form.Input label="Preferred date" name="date" type="date" />
        </>
      )}
      <Form.TextArea
        name="message"
        label={booking ? "What would you like to discuss?" : "How can we help?"}
        rows={3}
      />
      {formError && <p role="alert">{formError}</p>}
      <Button type="submit" surfaceLevel={depth(3)} surfaceFeedback={feedback}>
        {glyph(booking ? "calendar" : "mail")}{" "}
        {booking ? "Try sample request" : "Try sample inquiry"}
      </Button>
    </Form>
  );
  const add = (name: string) => {
    setCart((current) => ({ ...current, [name]: (current[name] ?? 0) + 1 }));
    setNotice(`Added ${name} to the sample cart.`);
    setFeedback("success");
  };
  let content: ReactNode;
  let aside: ReactNode = card(
    <>
      <Badge>Considered by design</Badge>
      <h2>Useful details. Room to breathe.</h2>
      <p>
        Explore the spacing, color and character of a design that feels right
        for your business.
      </p>
      {glyph("sparkles", "4rem")}
    </>,
    1,
  );

  if (model.specimen)
    return (
      <Layout.Stack gap={3}>
        <Badge>Website preview</Badge>
        <h2>Your next chapter.</h2>
        {card(
          <>
            <p>A consistent specimen in every visual style.</p>
            <Button>{glyph("arrow-right")} Explore</Button>
          </>,
          2,
        )}
        <Form.Input label="Your email" placeholder="hello@example.com" />
      </Layout.Stack>
    );
  if (preview.scenario === "business") {
    content =
      preview.screen === "inquiry" ? (
        <Layout.Stack gap={4}>
          <h1>Let’s talk about your project.</h1>
          <p>Try this inquiry form to judge its clarity and comfort.</p>
          {inquiry()}
        </Layout.Stack>
      ) : (
        <Layout.Stack gap={5}>
          <Badge>Independent work. Personal service.</Badge>
          <h1>{copy.headline}</h1>
          <p>
            Thoughtful services for people who value practical ideas, clear
            communication and careful delivery.
          </p>
          {button(
            copy.action || "Request a quote",
            () => navigate("inquiry"),
            "mail",
          )}
          <Layout.Grid minColumnWidth="12rem" gap={4}>
            {[
              "Discover the possibilities",
              "Make a considered choice",
              "Build with confidence",
            ].map((title, i) =>
              card(
                <>
                  {glyph((["search", "palette", "check"] as const)[i], "2rem")}
                  <h2>{title}</h2>
                  <p>
                    Focused support, clear next steps and details that work
                    together.
                  </p>
                </>,
                (i + 1) as 1 | 2 | 3,
                title,
              ),
            )}
          </Layout.Grid>
          <blockquote>
            “Everything felt clear, considered and easy to use.”{" "}
            <cite>— A sample client</cite>
          </blockquote>
        </Layout.Stack>
      );
  } else if (preview.scenario === "storefront") {
    const product = PRODUCTS.find((p) => p.name === selected)!;
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    aside = card(
      <>
        <h2>Made for everyday use.</h2>
        <p>
          Useful objects, carefully selected. Explore a sample store before
          discussing your project’s actual commerce features.
        </p>
        {button(`View cart (${count})`, () => navigate("cart"), "cart")}
      </>,
      1,
    );
    content =
      preview.screen === "cart" ? (
        <Layout.Stack gap={4}>
          <h1>Your sample cart</h1>
          {count === 0 ? (
            <p>
              Your cart is empty. Browse the sample products to add an item.
            </p>
          ) : (
            <>
              {Object.entries(cart).map(([name, quantity]) => (
                <Layout.Cluster key={name} gap={3}>
                  <span>
                    {name} × {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCart((c) => {
                        const next = { ...c };
                        delete next[name];
                        return next;
                      });
                      setNotice(`${name} removed.`);
                    }}
                  >
                    Remove {name}
                  </Button>
                </Layout.Cluster>
              ))}
              <strong>
                Total: $
                {PRODUCTS.reduce(
                  (sum, p) => sum + (cart[p.name] ?? 0) * p.price,
                  0,
                )}
              </strong>
              <p>This is a sample summary. No payment is collected.</p>
              {button(
                "Try sample checkout",
                () => {
                  setNotice(
                    "Sample order reviewed. No order was placed and no payment was collected.",
                  );
                  setConfirmation(true);
                },
                "check",
              )}
            </>
          )}
          {button("Continue browsing", () => navigate("browse"), "arrow-left")}
        </Layout.Stack>
      ) : preview.screen === "product" ? (
        <Layout.Stack gap={4}>
          {glyph(product.icon, "5rem")}
          <h1>{product.name}</h1>
          <p>
            Practical materials and a clear purpose. A sample product detail for
            comparing your design.
          </p>
          <strong>${product.price}</strong>
          {button(
            `Add ${product.name} to cart`,
            () => add(product.name),
            "cart",
          )}
          {button("Back to products", () => navigate("browse"), "arrow-left")}
        </Layout.Stack>
      ) : (
        <Layout.Stack gap={4}>
          <h1>Objects for a thoughtful day.</h1>
          <Form.Input
            label="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Form.Select
            label="Product category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["All", "Office", "Everyday"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Form.Select>
          <Layout.Grid minColumnWidth="13rem" gap={4}>
            {PRODUCTS.filter(
              (p) =>
                p.name.toLowerCase().includes(search.toLowerCase()) &&
                (category === "All" || p.category === category),
            ).map((p, i) =>
              card(
                <>
                  {glyph(p.icon, "4rem")}
                  <Badge>{p.category}</Badge>
                  <h2>{p.name}</h2>
                  <strong>${p.price}</strong>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelected(p.name);
                      navigate("product");
                    }}
                  >
                    View {p.name}
                  </Button>
                  <Button
                    surfaceFeedback={feedback}
                    onClick={() => add(p.name)}
                    aria-label={`Add ${p.name} to cart`}
                  >
                    {glyph("cart")} Add to cart
                  </Button>
                </>,
                ((i % 3) + 1) as 1 | 2 | 3,
                p.name,
              ),
            )}
          </Layout.Grid>
          {!PRODUCTS.some(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) &&
              (category === "All" || p.category === category),
          ) && <p>No matching products. Try another search.</p>}
        </Layout.Stack>
      );
  } else if (preview.scenario === "booking") {
    content =
      preview.screen === "confirmation" ? (
        <Layout.Stack gap={4}>
          {glyph("calendar", "4rem")}
          <h1>Your sample request is ready.</h1>
          <p>
            No appointment was booked. This demonstrates how a confirmation can
            feel.
          </p>
          {button("Back to services", () => navigate("services"), "arrow-left")}
        </Layout.Stack>
      ) : preview.screen === "request" ? (
        <Layout.Stack gap={4}>
          <h1>Find a time to talk.</h1>
          {inquiry(true)}
        </Layout.Stack>
      ) : (
        <Layout.Stack gap={4}>
          <Badge>Time for your next step</Badge>
          <h1>Start with a useful conversation.</h1>
          <p>
            Choose the support that fits your project. Booking features are
            agreed separately with STE.
          </p>
          <Layout.Grid minColumnWidth="13rem" gap={4}>
            {["Design consultation", "Project planning", "Website review"].map(
              (title, i) =>
                card(
                  <>
                    {glyph("calendar", "2rem")}
                    <h2>{title}</h2>
                    <p>45 minutes · Sample service</p>
                    {button("Explore this service", () => navigate("request"))}
                  </>,
                  (i + 1) as 1 | 2 | 3,
                  title,
                ),
            )}
          </Layout.Grid>
        </Layout.Stack>
      );
  } else if (preview.scenario === "portal") {
    const records = [
      { name: "Website direction", status: "Ready for review" },
      { name: "Content checklist", status: "In progress" },
      { name: "Launch preparation", status: "Planned" },
    ];
    content =
      preview.screen === "detail" ? (
        <Layout.Stack gap={4}>
          <Badge>Ready for review</Badge>
          <h1>Website direction</h1>
          <p>
            Your project’s visual direction brings colors, typography, spacing
            and behavior together.
          </p>
          {card(
            <>
              <h2>Review checklist</h2>
              <Form.Checkbox label="Read the design notes" />
              <Form.Checkbox label="Compare the alternatives" />
              {button(
                "Try marking reviewed",
                () => {
                  setNotice(
                    "Sample record marked reviewed. Your design preference has not been approved or submitted.",
                  );
                  setFeedback("success");
                },
                "check",
              )}
            </>,
            3,
          )}
          {button("Back to records", () => navigate("records"), "arrow-left")}
        </Layout.Stack>
      ) : (
        <Layout.Stack gap={4}>
          <Badge>Client workspace</Badge>
          <h1>A clear view of your project.</h1>
          <Form.Input
            label="Search records"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Layout.Grid minColumnWidth="13rem" gap={4}>
            {records
              .filter((r) =>
                r.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((r, i) =>
                card(
                  <>
                    {glyph("folder", "2rem")}
                    <h2>{r.name}</h2>
                    <Badge>{r.status}</Badge>
                    {button(`Open ${r.name}`, () => navigate("detail"), "eye")}
                  </>,
                  (i + 1) as 1 | 2 | 3,
                  r.name,
                ),
              )}
          </Layout.Grid>
          {!records.some((r) =>
            r.name.toLowerCase().includes(search.toLowerCase()),
          ) && <p>No matching records. Try another search.</p>}
        </Layout.Stack>
      );
  } else if (preview.scenario === "components") {
    return (
      <MotionShowcase
        recipe={design.configuration.recipe ?? "card-grid"}
        levelOverride={design.level === "mixed" ? undefined : design.level}
        embedded={false}
      />
    );
  } else
    return (
      <LayoutExplorer value={design.primitive} showControls={false} expanded />
    );

  const recipe = design.configuration.recipe ?? "split-hero";
  const areas = recipeAreas(recipe);
  return (
    <Layout.Stack gap={5}>
      <Layout.Header>
        <Layout.Cluster gap={3} className="ly-justify-between">
          <strong>
            {glyph("building")} {copy.name || "Your business"}
          </strong>
          <Layout.Cluster gap={2}>
            <Button
              variant="ghost"
              onClick={() =>
                navigate(
                  {
                    business: "home",
                    storefront: "browse",
                    booking: "services",
                    portal: "records",
                    components: "showcase",
                    primitives: "structure",
                  }[preview.scenario],
                )
              }
            >
              {glyph("home")} Home
            </Button>
            {button(copy.action || "Get in touch", () =>
              navigate(
                {
                  business: "inquiry",
                  storefront: "cart",
                  booking: "request",
                  portal: "detail",
                  components: "showcase",
                  primitives: "structure",
                }[preview.scenario],
              ),
            )}
          </Layout.Cluster>
        </Layout.Cluster>
      </Layout.Header>
      <Badge>Interactive sample · local data only</Badge>
      <Layout.Recipe recipe={recipe} gap={5}>
        {areas.main ? (
          <Layout.Area area={areas.main}>
            <main tabIndex={-1} className="studio-scenario-main">
              {content}
            </main>
          </Layout.Area>
        ) : (
          <Layout.Item>
            <main tabIndex={-1}>{content}</main>
          </Layout.Item>
        )}
        {areas.aside ? (
          <Layout.Area area={areas.aside}>
            <aside>{aside}</aside>
          </Layout.Area>
        ) : (
          <Layout.Item>
            <aside>{aside}</aside>
          </Layout.Item>
        )}
      </Layout.Recipe>
      <p role="status" aria-live="polite">
        {notice || "Sample actions stay inside this preview."}
      </p>
      <Layout.Footer>
        <Layout.Cluster gap={3} className="ly-justify-between">
          <span>© {copy.name || "Your business"} · Sample website</span>
          <span>{glyph("mail")} hello@example.com</span>
        </Layout.Cluster>
      </Layout.Footer>
      <Modal
        open={confirmation}
        onOpenChange={setConfirmation}
        title="Sample confirmation"
      >
        <p>{notice}</p>
        <Button onClick={() => setConfirmation(false)}>
          Close sample confirmation
        </Button>
      </Modal>
    </Layout.Stack>
  );
}

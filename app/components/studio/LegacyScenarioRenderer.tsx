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
import { SCENARIOS } from "../../data/studio-scenarios";
import type { PreviewRenderModel } from "../../lib/preview-protocol";
import { recipeAreas } from "../../lib/playground-options";
import { MotionShowcase } from "../labs/MotionShowcase";
import { LayoutExplorer } from "../labs/LayoutExplorer";

/** Retains booking, portal, and technical specimens behind the additional-examples entry. */
export function LegacyScenarioRenderer({
  model,
  navigate,
}: {
  model: PreviewRenderModel;
  navigate: (screen: string) => void;
}) {
  const { design, copy, preview } = model;
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");

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
      <Form.Input
        className="interactive-surface"
        name="name"
        label="Your name"
        required
        autoComplete="off"
      />
      <Form.Input
        className="interactive-surface"
        name="email"
        label="Email address"
        type="email"
        required
        autoComplete="off"
      />
      {booking && (
        <>
          <Form.Select
            className="interactive-surface"
            name="service"
            label="Choose a service"
          >
            <option>Design consultation</option>
            <option>Project planning</option>
            <option>Website review</option>
          </Form.Select>
          <Form.Input
            className="interactive-surface"
            label="Preferred date"
            name="date"
            type="date"
          />
        </>
      )}
      <Form.TextArea
        className="interactive-surface"
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
  let content: ReactNode;

  const aside: ReactNode = card(
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

  if (preview.scenario === "booking") {
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
              <Form.Checkbox
                className="interactive-surface"
                label="Read the design notes"
              />
              <Form.Checkbox
                className="interactive-surface"
                label="Compare the alternatives"
              />
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
            className="interactive-surface"
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
                  SCENARIOS.find((item) => item.id === preview.scenario)!
                    .screens[0],
                )
              }
            >
              {glyph("home")} Home
            </Button>
            {button(copy.action || "Get in touch", () =>
              navigate(preview.scenario === "booking" ? "request" : "detail"),
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

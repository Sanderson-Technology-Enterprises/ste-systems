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

/** A service-led marketing site keeps its hero separate from page-width services. */
export function MarketingTemplate({ model, navigate }: ScenarioProps) {
  const [confirmation, setConfirmation] = useState(false);
  const outcome = useSampleOutcome();
  const home = model.preview.screen === "home";
  const aside = home ? (
    <Card
      interactive
      spacing="comfortable"
      surfaceLevel={scenarioLevel(model, 1)}
    >
      <Layout.Stack gap={4}>
        <Badge>Considered by design</Badge>
        <h2>Useful details. Room to breathe.</h2>
        <p>
          Explore the spacing, color and character of a design that feels right
          for your business.
        </p>
        <ScenarioIcon model={model} name="sparkles" size="4rem" />
      </Layout.Stack>
    </Card>
  ) : undefined;
  const services = home ? (
    <Layout.Stack gap={5}>
      <section aria-label="Our services">
        <Layout.Stack gap={4}>
          <h2>A thoughtful approach, from start to finish.</h2>
          <Layout.Grid minColumnWidth="14rem" gap={4}>
            {[
              "Discover the possibilities",
              "Make a considered choice",
              "Build with confidence",
            ].map((title, index) => (
              <div key={title} data-motion-item>
                <Card
                  interactive
                  spacing="comfortable"
                  surfaceLevel={scenarioLevel(model, (index + 1) as 1 | 2 | 3)}
                >
                  <Layout.Stack gap={3}>
                    <ScenarioIcon
                      model={model}
                      name={(["search", "palette", "check"] as const)[index]}
                      size="2rem"
                    />
                    <h3>{title}</h3>
                    <p>
                      Focused support, clear next steps and details that work
                      together.
                    </p>
                  </Layout.Stack>
                </Card>
              </div>
            ))}
          </Layout.Grid>
        </Layout.Stack>
      </section>
      <blockquote>
        “Everything felt clear, considered and easy to use.”{" "}
        <cite>— A sample client</cite>
      </blockquote>
    </Layout.Stack>
  ) : undefined;
  return (
    <ScenarioScaffold
      model={model}
      navigate={navigate}
      navigation={[
        { screen: "home", label: "Home" },
        { screen: "inquiry", label: "Contact" },
      ]}
      aside={aside}
      after={services}
      notice={outcome.notice}
      error={outcome.error}
    >
      <Layout.Stack gap={5}>
        {home ? (
          <>
            <Badge>Independent work. Personal service.</Badge>
            <h1>{model.copy.headline}</h1>
            <p>
              Thoughtful services for people who value practical ideas, clear
              communication and careful delivery.
            </p>
            <Button
              surfaceLevel={scenarioLevel(model, 2)}
              onClick={() => navigate("inquiry")}
            >
              <ScenarioIcon model={model} name="mail" />
              {model.copy.action || "Request a quote"}
            </Button>
          </>
        ) : (
          <>
            <h1>Let’s talk about your project.</h1>
            <p>Try this inquiry form to judge its clarity and comfort.</p>
            <Form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                if (
                  !String(data.get("name") ?? "").trim() ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    String(data.get("email") ?? ""),
                  )
                )
                  return outcome.report(
                    "Enter a name and a valid email address to try the sample.",
                    true,
                  );
                outcome.report(
                  "Sample inquiry received. No message has been sent.",
                );
                setConfirmation(true);
              }}
            >
              <Layout.Stack gap={4}>
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
                <Form.TextArea
                  className="interactive-surface"
                  label="How can we help?"
                  name="message"
                  rows={3}
                />
                <Button
                  type="submit"
                  surfaceLevel={scenarioLevel(model, 3)}
                  surfaceFeedback={outcome.feedback}
                >
                  <ScenarioIcon model={model} name="mail" />
                  Try sample inquiry
                </Button>
              </Layout.Stack>
            </Form>
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

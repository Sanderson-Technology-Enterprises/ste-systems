"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Layout,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  ScenarioIcon,
  ScenarioScaffold,
  scenarioLevel,
  useSampleOutcome,
  type ScenarioProps,
} from "./ScenarioScaffold";

const ISSUES = [
  {
    number: 12,
    title: "The value of a slower question",
    topic: "Perspective",
    date: "November 6",
    description: "Making room for the questions that lead to better work.",
  },
  {
    number: 11,
    title: "Small rituals, useful momentum",
    topic: "Practice",
    date: "October 23",
    description: "Simple habits for a little more clarity in your day.",
  },
  {
    number: 10,
    title: "Keep the things that matter",
    topic: "Ideas",
    date: "October 9",
    description:
      "A considered approach to attention, tools, and everyday choices.",
  },
] as const;

/** A publication landing page, subscription demonstration, archive, and readable issue. */
export function NewsletterTemplate({ model, navigate }: ScenarioProps) {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState(12);
  const outcome = useSampleOutcome();
  const issue = ISSUES.find((item) => item.number === selected)!;
  const openIssue = (number: number) => {
    setSelected(number);
    navigate("issue");
  };
  const cover = (
    <Card
      interactive
      surfaceLevel={scenarioLevel(model, 2)}
      spacing="comfortable"
    >
      <Layout.Stack gap={4}>
        <Badge>Issue 12 · Field Notes</Badge>
        <ScenarioIcon model={model} name="mail" size="4rem" />
        <h2>The value of a slower question</h2>
        <p>
          A letter about thoughtful work, everyday ideas, and making room for
          what matters.
        </p>
        <Button variant="secondary" onClick={() => openIssue(12)}>
          Read issue 12
        </Button>
      </Layout.Stack>
    </Card>
  );
  return (
    <ScenarioScaffold
      model={model}
      navigate={navigate}
      brand="Field Notes"
      notice={outcome.notice}
      error={outcome.error}
      navigation={[
        { screen: "landing", label: "Subscribe" },
        { screen: "archive", label: "Archive" },
      ]}
      aside={model.preview.screen === "landing" ? cover : undefined}
    >
      <Layout.Stack gap={5}>
        {model.preview.screen === "landing" ? (
          <>
            <Badge>A letter worth opening</Badge>
            <h1>{model.copy.headline}</h1>
            <p>
              A considered collection of ideas, useful observations, and good
              questions. A new letter every other Friday.
            </p>
            <Form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                  return outcome.report(
                    "Enter a valid email address to try the sample.",
                    true,
                  );
                outcome.report(
                  "Sample signup complete. No subscription was created and no email will be sent.",
                );
              }}
            >
              <Layout.Stack gap={3}>
                <Form.Input
                  className="interactive-surface"
                  label="Newsletter email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="off"
                  required
                />
                <Button
                  type="submit"
                  surfaceLevel={scenarioLevel(model, 3)}
                  surfaceFeedback={outcome.feedback}
                >
                  <ScenarioIcon model={model} name="mail" /> Try sample
                  subscription
                </Button>
                <small>Local signup demonstration · sample publication</small>
              </Layout.Stack>
            </Form>
            <p>Main action preference: {model.copy.action}</p>
          </>
        ) : model.preview.screen === "archive" ? (
          <>
            <Badge>The archive</Badge>
            <h1>Good letters stay useful.</h1>
            <p>Explore the publication&apos;s previous issues.</p>
            {ISSUES.map((item) => (
              <article key={item.number} data-motion-item>
                <Card
                  interactive
                  surfaceLevel={scenarioLevel(model, 1)}
                  spacing="comfortable"
                >
                  <Layout.Stack gap={3}>
                    <Badge>
                      Issue {item.number} · {item.date} · {item.topic}
                    </Badge>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <Button
                      variant="secondary"
                      onClick={() => openIssue(item.number)}
                    >
                      Read issue {item.number}
                    </Button>
                  </Layout.Stack>
                </Card>
              </article>
            ))}
          </>
        ) : (
          <article className="studio-reading">
            <Layout.Stack gap={4}>
              <Badge>
                Field Notes · Issue {issue.number} · {issue.date}
              </Badge>
              <h1>{issue.title}</h1>
              <p>{issue.description}</p>
              <p>
                Some of the most useful progress begins with a pause. Before
                choosing the next tool or adding another task, make a little
                room to understand the question in front of you.
              </p>
              <h2>Notice what keeps coming back.</h2>
              <p>
                Write down one observation from your week. Keep it specific: a
                conversation, a repeated question, or a small detail that made
                something easier. The ordinary details often point toward the
                work that matters.
              </p>
              <blockquote>
                What would become clearer if we gave it a little more attention?
              </blockquote>
              <p>
                Choose one small experiment for the week ahead. Try it, notice
                what changes, and carry the useful parts forward.
              </p>
              <p>
                Until next time,
                <br />
                The Field Notes team
              </p>
              <Button variant="secondary" onClick={() => navigate("archive")}>
                Back to the archive
              </Button>
            </Layout.Stack>
          </article>
        )}
      </Layout.Stack>
    </ScenarioScaffold>
  );
}

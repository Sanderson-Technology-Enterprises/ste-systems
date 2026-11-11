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
  type ScenarioProps,
} from "./ScenarioScaffold";

const STORIES = [
  {
    id: "space",
    title: "Making space for good work",
    category: "Design",
    time: "5 min read",
    intro:
      "Thoughtful spaces and simple choices can make everyday work feel a little clearer.",
    icon: "palette",
  },
  {
    id: "tools",
    title: "Choose tools that earn their place",
    category: "Practice",
    time: "4 min read",
    intro:
      "Start with a useful question before adding another tool to your process.",
    icon: "wrench",
  },
  {
    id: "details",
    title: "The quiet value of small details",
    category: "Design",
    time: "6 min read",
    intro:
      "A closer look at the ordinary decisions that make something easier to use.",
    icon: "sparkles",
  },
] as const;

/** Editorial story discovery and long-form reading share the selected visual system. */
export function BlogTemplate({ model, navigate }: ScenarioProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState("space");
  const story = STORIES.find((item) => item.id === selected)!;
  const visible = STORIES.filter(
    (item) =>
      `${item.title} ${item.intro}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (category === "All" || item.category === category),
  );
  const open = (id: string) => {
    setSelected(id);
    navigate("article");
  };
  const aside = (
    <Card
      interactive
      spacing="comfortable"
      surfaceLevel={scenarioLevel(model, 1)}
    >
      <Layout.Stack gap={4}>
        <ScenarioIcon model={model} name="file-text" size="3rem" />
        <h2>A journal for curious people.</h2>
        <p>
          Original ideas, practical observations, and a more considered approach
          to everyday work.
        </p>
        <h3>About the author</h3>
        <p>
          Alex Morgan writes about design, craft, and building useful things.
        </p>
        <Badge>Sample editorial publication</Badge>
      </Layout.Stack>
    </Card>
  );
  return (
    <ScenarioScaffold
      model={model}
      navigate={navigate}
      brand="The Considered Journal"
      navigation={[{ screen: "index", label: "Stories" }]}
      aside={aside}
    >
      {model.preview.screen === "article" ? (
        <article className="studio-reading">
          <Layout.Stack gap={4}>
            <Badge>
              {story.category} · {story.time}
            </Badge>
            <h1>{story.title}</h1>
            <p>Written by Alex Morgan</p>
            <p>{story.intro}</p>
            <h2>Begin with what is already there.</h2>
            <p>
              Look at the moments that repeat throughout your day. A useful
              change often starts with understanding the work, the people doing
              it, and the small obstacles that have become familiar.
            </p>
            <blockquote>
              Clarity is often the result of removing a little friction.
            </blockquote>
            <h2>Make one deliberate change.</h2>
            <p>
              Choose a detail you can improve. Move a tool closer to where it is
              used. Give an important instruction a clearer place. Make the next
              step easier to recognize.
            </p>
            <p>
              Then pay attention to the result. Keep the changes that help, and
              leave room for the next useful question.
            </p>
            <Button variant="secondary" onClick={() => navigate("index")}>
              Back to stories
            </Button>
            <h2>Related stories</h2>
            {STORIES.filter((item) => item.id !== selected).map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => open(item.id)}
              >
                Read {item.title}
              </Button>
            ))}
          </Layout.Stack>
        </article>
      ) : (
        <Layout.Stack gap={5}>
          <Badge>Design · Work · Everyday ideas</Badge>
          <h1>{model.copy.headline}</h1>
          <p>
            Stories for people who care about how things work and how they feel.
          </p>
          <Layout.Cluster gap={3}>
            <Form.Input
              className="interactive-surface"
              label="Search stories"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a story"
            />
            <Form.Select
              className="interactive-surface"
              label="Story category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {["All", "Design", "Practice"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Layout.Cluster>
          {visible.map((item, index) => (
            <article key={item.id} data-motion-item>
              <Card
                interactive
                spacing="comfortable"
                surfaceLevel={scenarioLevel(
                  model,
                  ((index % 3) + 1) as 1 | 2 | 3,
                )}
              >
                <Layout.Stack gap={3}>
                  <ScenarioIcon model={model} name={item.icon} size="3rem" />
                  <Badge>
                    {item.category} · {item.time}
                  </Badge>
                  <h2>{item.title}</h2>
                  <p>{item.intro}</p>
                  <Button variant="secondary" onClick={() => open(item.id)}>
                    Read {item.title}
                  </Button>
                </Layout.Stack>
              </Card>
            </article>
          ))}
          {!visible.length && (
            <p>No stories match. Try another search or category.</p>
          )}
        </Layout.Stack>
      )}
    </ScenarioScaffold>
  );
}

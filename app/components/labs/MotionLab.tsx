"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Form,
  Layout,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  cancel,
  enter,
  exit,
  presets,
  stagger,
  type Direction,
  type Preset,
} from "@sanderson-technology-enterprises/motion-style-css";

/** Options for the standalone Lab section or its embedded guide specimen. */
interface MotionLabProps {
  embedded?: boolean;
}

/**
 * Exercises the installed motion controller on separate shells. Controls remain
 * outside the animated content, own focus before exit, and stay usable while a
 * phase runs. Cleanup cancels every controller owner and stale status update.
 * @param props Whether to render the compact guide specimen.
 * @returns An interactive entrance, exit, cancellation, and choreography Lab.
 */
export function MotionLab({ embedded = false }: MotionLabProps) {
  const preview = useRef<HTMLDivElement>(null);
  const entrance = useRef<HTMLButtonElement>(null);
  const generation = useRef({ request: 0 });
  const [preset, setPreset] = useState<Preset>("cascade");
  const [direction, setDirection] = useState<Direction>("left");
  const [status, setStatus] = useState(
    "Ready. Choose an effect and play a phase.",
  );
  useEffect(() => {
    const shell = preview.current;
    const operation = generation.current;
    return () => {
      operation.request++;
      if (shell) {
        cancel(shell);
        shell
          .querySelectorAll<HTMLElement>("[data-motion-item]")
          .forEach(cancel);
      }
    };
  }, []);

  /** Runs only the latest request and reports its actual controller outcome. */
  async function play(phase: "in" | "out" | "stagger") {
    const shell = preview.current;
    if (!shell) return;
    const request = ++generation.current.request;
    cancel(shell);
    const items = [
      ...shell.querySelectorAll<HTMLElement>("[data-motion-item]"),
    ];
    items.forEach(cancel);
    if (phase === "out") entrance.current?.focus();
    setStatus("Playing motion.");
    try {
      const options = { preset, direction, duration: 520 };
      const result =
        phase === "stagger"
          ? (shell.removeAttribute("data-ms-exited"),
            await stagger(items, { ...options, interval: 90 }))
          : await (phase === "out" ? exit : enter)(shell, options);
      if (request === generation.current.request)
        setStatus(
          `${phase === "stagger" ? "Choreography" : phase === "out" ? "Exit" : "Entrance"}: ${Array.isArray(result) ? result.map((item) => item.status).join(", ") : result.status}.`,
        );
    } catch {
      if (request === generation.current.request) {
        shell.removeAttribute("data-ms-exited");
        setStatus("The effect could not run. The preview remains available.");
      }
    }
  }

  /** Cancels current work; reset also clears the completed exit marker. */
  function stop(reset: boolean) {
    generation.current.request++;
    if (preview.current) {
      cancel(preview.current);
      preview.current
        .querySelectorAll<HTMLElement>("[data-motion-item]")
        .forEach(cancel);
      if (reset) preview.current.removeAttribute("data-ms-exited");
    }
    setStatus(reset ? "Preview reset." : "Motion cancelled.");
  }

  const id = embedded ? "motion-guide-preview" : "motion";
  const Title = embedded ? "h3" : "h2";
  const CardTitle = embedded ? "h4" : "h3";
  return (
    <section
      id={id}
      className={
        embedded
          ? "ly-stack ly-gap-6"
          : "ly-wrapper ly-section ly-stack ly-gap-6"
      }
      aria-labelledby={`${id}-title`}
    >
      <header
        className={
          embedded ? "ly-stack ly-gap-3" : "section-heading ly-stack ly-gap-3"
        }
      >
        <p className="section-label">Motion Style CSS / New to STE</p>
        <Title id={`${id}-title`}>Motion with a clear beginning and end.</Title>
        <p>
          Ten paired presets for entrances, exits, and coordinated content.
          Motion works on a dedicated shell; structure, appearance, and
          interaction feedback keep their own layers.
        </p>
      </header>
      <Layout.Grid minColumnWidth="13rem" gap={4}>
        <Form.Select
          label="Motion preset"
          value={preset}
          onChange={(event) => setPreset(event.target.value as Preset)}
        >
          {presets.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Motion direction"
          value={direction}
          disabled={preset !== "slide" && preset !== "curtain"}
          onChange={(event) => setDirection(event.target.value as Direction)}
        >
          {["left", "right", "up", "down"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Form.Select>
      </Layout.Grid>
      <Layout.Cluster gap={3}>
        <Button ref={entrance} onClick={() => void play("in")}>
          Play entrance
        </Button>
        <Button variant="secondary" onClick={() => void play("out")}>
          Play exit
        </Button>
        <Button variant="secondary" onClick={() => void play("stagger")}>
          Play stagger
        </Button>
        <Button variant="secondary" onClick={() => stop(false)}>
          Cancel motion
        </Button>
        <Button variant="secondary" onClick={() => stop(true)}>
          Reset preview
        </Button>
      </Layout.Cluster>
      <div ref={preview} data-motion-preview="lab">
        <Layout.Grid minColumnWidth="12rem" gap={4}>
          {([1, 2, 3] as const).map((level) => (
            <div data-motion-item key={level}>
              <Card interactive surfaceLevel={level} spacing="comfortable">
                <Card.Body>
                  <CardTitle>Surface level {level}</CardTitle>
                  <p>
                    Shared component paint and interaction depth stay inside the
                    motion shell.
                  </p>
                </Card.Body>
              </Card>
            </div>
          ))}
        </Layout.Grid>
      </div>
      <p role="status" aria-live="polite">
        {status}
      </p>
      <p>
        Reduced motion is respected automatically. Completed exits hide the
        specimen; the controls remain available to bring it back.
      </p>
    </section>
  );
}

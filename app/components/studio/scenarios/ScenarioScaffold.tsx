"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Badge,
  Button,
  Icon,
  Layout,
  type IconName,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { SCENARIOS } from "../../../data/studio-scenarios";
import { recipeAreas } from "../../../lib/playground-options";
import type { PreviewRenderModel } from "../../../lib/preview-protocol";

export interface ScenarioProps {
  model: PreviewRenderModel;
  navigate: (screen: string) => void;
}

/** Maps public elevation preferences into domain panels without owning their paint. */
export function scenarioLevel(model: PreviewRenderModel, level: 1 | 2 | 3) {
  return model.design.level === "mixed" ? level : model.design.level;
}

/** Uses the plan's supported icon mapping in every template. */
export function ScenarioIcon({
  model,
  name,
  size,
}: {
  model: PreviewRenderModel;
  name: IconName;
  size?: string;
}) {
  return (
    <Icon
      name={name}
      size={size}
      pack={
        model.design.iconPack === "auto" ? undefined : model.design.iconPack
      }
      variant={model.design.iconVariant}
    />
  );
}

/** Reports actual local outcomes and rearms the library's transient feedback state. */
export function useSampleOutcome() {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"success" | "error" | undefined>();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const report = useCallback((message: string, problem = false) => {
    clearTimeout(timer.current);
    setNotice(problem ? "" : message);
    setError(problem ? message : "");
    setFeedback(problem ? "error" : "success");
    timer.current = setTimeout(() => setFeedback(undefined), 1000);
  }, []);
  return { notice, error, feedback, report };
}

/**
 * Composes complete recipe regions while leaving identity, feedback, and motion to STE.
 * Screen changes move focus only when the visitor is already interacting inside the frame.
 */
export function ScenarioScaffold({
  model,
  navigate,
  children,
  aside,
  after,
  navigation,
  brand,
  notice,
  error,
}: ScenarioProps & {
  children: ReactNode;
  aside?: ReactNode;
  after?: ReactNode;
  navigation: readonly { screen: string; label: string }[];
  brand?: string;
  notice?: string;
  error?: string;
}) {
  const scenario = SCENARIOS.find(
    (item) => item.id === model.preview.scenario,
  )!;
  const areas = recipeAreas(model.design.configuration.recipe ?? "split-hero");
  const main = useRef<HTMLElement>(null);
  const previousScreen = useRef(model.preview.screen);
  useEffect(() => {
    if (previousScreen.current !== model.preview.screen && document.hasFocus())
      main.current?.focus({ preventScroll: true });
    previousScreen.current = model.preview.screen;
  }, [model.preview.screen]);
  const header = (
    <Layout.Header>
      <Layout.Cluster gap={3} className="ly-justify-between">
        <strong className="studio-sample-brand">
          <ScenarioIcon model={model} name={scenario.icon} />{" "}
          {model.copy.name || brand || "Your business"}
        </strong>
        <Badge>{scenario.label}</Badge>
      </Layout.Cluster>
    </Layout.Header>
  );
  const nav = (
    <nav aria-label={`${scenario.label} sample navigation`}>
      <Layout.Cluster gap={2}>
        {navigation.map((item) => (
          <Button
            key={item.screen}
            variant={model.preview.screen === item.screen ? "primary" : "ghost"}
            aria-pressed={model.preview.screen === item.screen}
            onClick={() => navigate(item.screen)}
          >
            {item.label}
          </Button>
        ))}
      </Layout.Cluster>
    </nav>
  );
  const footer = (
    <Layout.Footer>
      <Layout.Cluster gap={3} className="ly-justify-between">
        <span>
          © {model.copy.name || brand || "Your business"} · Sample website
        </span>
        <span>
          <ScenarioIcon model={model} name="mail" /> hello@example.com
        </span>
      </Layout.Cluster>
    </Layout.Footer>
  );
  return (
    <div className="studio-scenario" data-template={scenario.id}>
      <Layout.Stack gap={5}>
        <Badge>Interactive sample · local data only</Badge>
        {!areas.header && header}
        {!areas.navigation && nav}
        <Layout.Recipe
          recipe={model.design.configuration.recipe ?? "split-hero"}
          gap={5}
        >
          {areas.header && (
            <Layout.Area area={areas.header}>{header}</Layout.Area>
          )}
          {areas.navigation && (
            <Layout.Area area={areas.navigation}>{nav}</Layout.Area>
          )}
          {areas.main ? (
            <Layout.Area area={areas.main}>
              <main ref={main} tabIndex={-1} data-template-main>
                {children}
              </main>
            </Layout.Area>
          ) : (
            <Layout.Item>
              <main ref={main} tabIndex={-1} data-template-main>
                {children}
              </main>
            </Layout.Item>
          )}
          {aside &&
            (areas.aside ? (
              <Layout.Area area={areas.aside}>
                <aside>{aside}</aside>
              </Layout.Area>
            ) : (
              <Layout.Item>
                <aside>{aside}</aside>
              </Layout.Item>
            ))}
          {areas.footer && (
            <Layout.Area area={areas.footer}>{footer}</Layout.Area>
          )}
        </Layout.Recipe>
        {after}
        {error && <p role="alert">{error}</p>}
        <p role="status" aria-live="polite">
          {notice || "Sample actions stay inside this preview."}
        </p>
        {!areas.footer && footer}
      </Layout.Stack>
    </div>
  );
}

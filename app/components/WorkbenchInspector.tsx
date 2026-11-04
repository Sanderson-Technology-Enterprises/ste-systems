"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  Button,
  Drawer,
  InterfaceRoot,
  Layout,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  DEFAULT_INSPECTOR,
  INSPECTOR_GROUPS,
  INSPECTOR_STORAGE_KEY,
  inspectorMaximum,
  parseInspectorPreferences,
  resizeInspector,
  type InspectorGroup,
  type InspectorPreferences,
} from "../lib/inspector-state";

/** The inspector supplies editor layout only; its contents share the workbench state. */
interface WorkbenchInspectorProps {
  controls: (group: InspectorGroup) => ReactNode;
  children: ReactNode;
}

/**
 * Compose an IDE-style activity rail, snapping inspector, and independent preview.
 * Pointer gestures never write client configuration or invoke lifecycle animation.
 * @param props Grouped controls and the persistent live preview subtree.
 * @returns A keyboard-accessible split workbench with a mobile drawer fallback.
 */
export function WorkbenchInspector({
  controls,
  children,
}: WorkbenchInspectorProps) {
  const [preferences, setPreferences] = useState<InspectorPreferences>({
    ...DEFAULT_INSPECTOR,
  });
  const current = useRef(preferences);
  const [available, setAvailable] = useState(1200);
  const [mobile, setMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const drag = useRef<{
    start: number;
    width: number;
    before: InspectorPreferences;
    open: boolean;
    handle: HTMLElement;
    pointer: number;
  } | null>(null);

  /** Persist successful user layout choices independently of the client theme. */
  const commit = useCallback((next: InspectorPreferences, persist = true) => {
    current.current = next;
    setPreferences(next);
    if (persist)
      try {
        localStorage.setItem(INSPECTOR_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* In-memory layout remains fully usable. */
      }
  }, []);

  useEffect(() => {
    const target = container.current;
    const media = matchMedia("(max-width: 1023px)");
    const experience = target?.closest<HTMLElement>(".lab-editor-experience");
    const header = experience?.querySelector<HTMLElement>(
      ":scope > [data-editor-chrome]:has(> .site-header)",
    );
    // Account for the shell, pane, and safety insets before reserving preview width.
    const refresh = () => {
      setMobile(media.matches);
      setAvailable((target?.clientWidth ?? 1200) - 16);
      // Frame geometry belongs to the editor, never the exported client settings.
      const height = `${header?.getBoundingClientRect().height ?? 96}px`;
      if (
        experience?.style.getPropertyValue("--workbench-header-height") !==
        height
      )
        experience?.style.setProperty("--workbench-header-height", height);
      if (!media.matches) setDrawerOpen(false);
    };
    const frame = requestAnimationFrame(() => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(INSPECTOR_STORAGE_KEY);
      } catch {
        /* Privacy modes use the same safe defaults. */
      }
      commit(parseInspectorPreferences(stored), false);
      refresh();
    });
    const observer = new ResizeObserver(refresh);
    if (target) observer.observe(target);
    if (header) observer.observe(header);
    addEventListener("resize", refresh);
    media.addEventListener("change", refresh);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("change", refresh);
      removeEventListener("resize", refresh);
      experience?.style.removeProperty("--workbench-header-height");
    };
  }, [commit]);

  useEffect(() => {
    container.current
      ?.querySelector<HTMLElement>("[data-inspector-scroll]")
      ?.scrollTo(0, 0);
  }, [preferences.group]);

  /** Open legacy Lab anchors in the corresponding single inspector. */
  useEffect(() => {
    const routeHash = () => {
      const group: Record<string, InspectorGroup> = {
        "#layouts": "Layout",
        "#ui-native": "Appearance",
        "#interactions": "Interaction",
        "#motion": "Motion",
      };
      const selected = group[location.hash];
      if (selected) {
        commit({ ...current.current, group: selected, open: true });
        if (matchMedia("(max-width: 1023px)").matches) setDrawerOpen(true);
        container.current?.scrollIntoView({ block: "start" });
      }
    };
    const frame = requestAnimationFrame(routeHash);
    addEventListener("hashchange", routeHash);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("hashchange", routeHash);
    };
  }, [commit]);

  const select = (group: InspectorGroup) => {
    const next = {
      ...current.current,
      group,
      open: mobile
        ? current.current.open
        : group === current.current.group
          ? !current.current.open
          : true,
    };
    commit(next);
    if (mobile) setDrawerOpen(true);
  };
  const toggle = () => {
    if (mobile) setDrawerOpen(true);
    else commit({ ...current.current, open: !current.current.open });
  };
  const begin = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      start: event.clientX,
      width: current.current.open
        ? Math.min(current.current.width, inspectorMaximum(available))
        : 0,
      before: { ...current.current },
      open: current.current.open,
      handle: event.currentTarget,
      pointer: event.pointerId,
    };
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current;
    if (!gesture) return;
    const next = resizeInspector(
      gesture.width + event.clientX - gesture.start,
      gesture.open,
      available,
    );
    gesture.open = next.open;
    commit(
      {
        ...current.current,
        open: next.open,
        width: next.open ? next.width : gesture.before.width,
      },
      false,
    );
  };
  const finish = (cancelled = false) => {
    const gesture = drag.current;
    if (!gesture) return;
    drag.current = null;
    if (gesture.handle.hasPointerCapture(gesture.pointer))
      gesture.handle.releasePointerCapture(gesture.pointer);
    commit(cancelled ? gesture.before : current.current);
    if (!current.current.open) opener.current?.focus();
  };
  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key === "Escape" && drag.current) {
        const gesture = drag.current;
        drag.current = null;
        if (gesture.handle.hasPointerCapture(gesture.pointer))
          gesture.handle.releasePointerCapture(gesture.pointer);
        commit(gesture.before);
        event.preventDefault();
      }
    };
    addEventListener("keydown", cancel);
    return () => {
      removeEventListener("keydown", cancel);
      const gesture = drag.current;
      if (gesture?.handle.hasPointerCapture(gesture.pointer))
        gesture.handle.releasePointerCapture(gesture.pointer);
    };
  }, [commit]);

  const width = preferences.open
    ? Math.min(preferences.width, inspectorMaximum(available))
    : 0;
  const editor = (content: ReactNode, className = "") => (
    <InterfaceRoot
      preset="minimal-saas"
      theme="midnight-gold"
      mode="dark"
      data-editor-chrome
      className={className}
    >
      {content}
    </InterfaceRoot>
  );
  const groupButtons = (
    <nav aria-label="Configuration groups" className="inspector-groups">
      {INSPECTOR_GROUPS.map((group, index) => (
        <Button
          key={group}
          variant="ghost"
          aria-label={group}
          title={group}
          aria-pressed={
            preferences.group === group &&
            (mobile ? drawerOpen : preferences.open)
          }
          onClick={() => select(group)}
        >
          <span aria-hidden="true">{["◐", "▦", "↗", "▷", "⇩"][index]}</span>
          <span className="inspector-mobile-label">{group}</span>
        </Button>
      ))}
    </nav>
  );
  return (
    <div
      ref={container}
      className="workbench-split"
      data-inspector-open={preferences.open}
      style={{ "--inspector-width": `${width}px` } as CSSProperties}
    >
      <div className="inspector-mobile-toolbar">
        {editor(
          <Button
            ref={mobile ? opener : undefined}
            variant="secondary"
            onClick={toggle}
            aria-expanded={drawerOpen}
          >
            Open settings
          </Button>,
        )}
      </div>
      <Layout.Sidebar
        sideSize={`${48 + width + 8 + 4}px`}
        // Reserve the preview's 360px plus its content pane's two 2px insets.
        minContentWidth="364px"
        gap={0}
        className="workbench-panes"
      >
        <Layout.SidebarItem position="side" className="inspector-dock">
          {editor(
            <>
              <Button
                ref={!mobile ? opener : undefined}
                variant="ghost"
                aria-label={
                  preferences.open
                    ? "Collapse settings panel"
                    : "Expand settings panel"
                }
                aria-expanded={preferences.open}
                onClick={toggle}
              >
                <span aria-hidden="true">☰</span>
              </Button>
              {groupButtons}
            </>,
            "inspector-rail",
          )}
          {!mobile &&
            editor(
              <div
                id="workbench-inspector"
                hidden={!preferences.open}
                data-inspector-panel
                className="inspector-panel"
              >
                <header className="inspector-heading">
                  <h2>{preferences.group}</h2>
                </header>
                <Layout.Scroll
                  limit="none"
                  className="inspector-scroll"
                  data-inspector-scroll
                  role="region"
                  aria-label={`${preferences.group} settings`}
                  tabIndex={0}
                >
                  {controls(preferences.group)}
                </Layout.Scroll>
              </div>,
              "inspector-panel-root",
            )}
          <div
            role="separator"
            aria-label="Resize settings panel"
            aria-valuetext={
              preferences.open
                ? `${Math.round(width)} pixels`
                : "Settings collapsed"
            }
            aria-orientation="vertical"
            aria-controls="workbench-inspector"
            aria-valuemin={0}
            aria-valuemax={inspectorMaximum(available)}
            aria-valuenow={width}
            tabIndex={0}
            className="inspector-divider"
            onPointerDown={begin}
            onPointerMove={move}
            onPointerUp={() => finish()}
            onPointerCancel={() => finish(true)}
            onDoubleClick={() =>
              commit({ ...current.current, open: true, width: 320 })
            }
            onKeyDown={(event) => {
              const step = event.shiftKey ? 64 : 16;
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End", "Enter"].includes(
                  event.key,
                )
              )
                return;
              event.preventDefault();
              if (event.key === "Home" || event.key === "Enter") {
                commit({
                  ...current.current,
                  open: event.key === "Home" ? false : !current.current.open,
                });
                if (!current.current.open) opener.current?.focus();
              } else
                commit({
                  ...current.current,
                  open: true,
                  width:
                    event.key === "End"
                      ? inspectorMaximum(available)
                      : Math.min(
                          inspectorMaximum(available),
                          Math.max(
                            240,
                            (current.current.open ? width : 320) +
                              (event.key === "ArrowLeft" ? -step : step),
                          ),
                        ),
                });
            }}
          />
        </Layout.SidebarItem>
        <Layout.SidebarItem position="content" className="workbench-canvas">
          {children}
        </Layout.SidebarItem>
      </Layout.Sidebar>
      {mobile &&
        editor(
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            placement="left"
            size="sm"
            title="Workbench settings"
            className="inspector-drawer"
          >
            {groupButtons}
            {controls(preferences.group)}
          </Drawer>,
        )}
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createDesignPlan,
  fixMotionSettings,
  migrateLegacyPlan,
  parseDesignPlan,
  PLAN_STORAGE_KEY,
  RENDERER_PACKAGES,
  serializeDesignPlan,
  type DesignPlan,
  type VisualDesign,
} from "../lib/design-plan";
import { CONFIGURATION_STORAGE_KEY } from "../lib/configuration";
import { decodeVisualLink } from "../lib/design-sharing";
import { MotionPreferences } from "./MotionPreferences";
import { applyWebsiteTemplate } from "../lib/website-templates";
import { websiteTemplate } from "../data/studio-scenarios";

type PlanUpdater = (plan: DesignPlan) => DesignPlan;
interface PlanContextValue {
  plan: DesignPlan;
  ready: boolean;
  saveStatus: string;
  notice: string;
  canUndo: boolean;
  pickerMode: "new" | "change" | null;
  hasDraft: boolean;
  chooseTemplate: (id: string) => void;
  showTemplates: (fresh?: boolean) => void;
  resume: () => void;
  update: (change: PlanUpdater) => void;
  updateDesign: (patch: Partial<VisualDesign>) => void;
  open: (plan: DesignPlan, notice?: string) => void;
  undo: () => void;
  announce: (notice: string) => void;
}
const PlanContext = createContext<PlanContextValue | null>(null);

/** Owns the complete design and autosave; hydration cannot overwrite an existing draft. */
export function DesignPlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState(createDesignPlan);
  const current = useRef(plan);
  const history = useRef<DesignPlan[]>([]);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);
  const [saveStatus, setSaveStatus] = useState("Opening design…");
  const [notice, announce] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [pickerMode, setPickerMode] = useState<"new" | "change" | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const committed = useRef(false);

  const persist = useCallback((next: DesignPlan) => {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, serializeDesignPlan(next));
      setSaveStatus("Saved locally");
    } catch {
      setSaveStatus("Not saved locally — download your design file");
    }
  }, []);
  const open = useCallback(
    (next: DesignPlan, message = "Design file opened.") => {
      const checked = parseDesignPlan(next).plan;
      if (committed.current)
        history.current = [...history.current.slice(-29), current.current];
      setCanUndo(history.current.length > 0);
      current.current = checked;
      setPlan(checked);
      committed.current = true;
      setHasDraft(true);
      setPickerMode(null);
      if (hydrated.current) persist(checked);
      announce(message);
    },
    [persist],
  );
  const update = useCallback(
    (change: PlanUpdater) => {
      if (!hydrated.current) return;
      const before = current.current;
      const changed = change(structuredClone(before));
      const next = parseDesignPlan({
        ...changed,
        revision: before.revision + 1,
        updatedAt: new Date().toISOString(),
        packages: { ...RENDERER_PACKAGES },
      }).plan;
      history.current = [...history.current.slice(-29), before];
      current.current = next;
      setPlan(next);
      setCanUndo(true);
      committed.current = true;
      setHasDraft(true);
      persist(next);
    },
    [persist],
  );
  const updateDesign = useCallback(
    (patch: Partial<VisualDesign>) =>
      update((plan) => ({
        ...plan,
        favorite: null,
        design: { ...plan.design, ...patch },
      })),
    [update],
  );
  const undo = useCallback(() => {
    const previous = history.current.pop();
    if (!previous) return;
    const next = {
      ...previous,
      revision: current.current.revision + 1,
      updatedAt: new Date().toISOString(),
    };
    current.current = next;
    setPlan(next);
    setPickerMode(null);
    setCanUndo(history.current.length > 0);
    persist(next);
    announce("Previous design restored.");
  }, [persist]);

  /** Commits template intent at the same validated boundary as file opening and undo. */
  const chooseTemplate = useCallback(
    (id: string) => {
      const fresh = pickerMode === "new" || !committed.current;
      const next = applyWebsiteTemplate(
        fresh ? createDesignPlan() : current.current,
        id,
        { fresh },
      );
      if (!fresh) {
        next.revision = current.current.revision + 1;
        next.updatedAt = new Date().toISOString();
      }
      // The studio's live direction status announces success without displacing the preview.
      open(next, "");
      const query = new URLSearchParams(location.search);
      query.delete("choose");
      query.delete("template");
      window.history.replaceState(
        window.history.state,
        "",
        location.pathname + (query.size ? `?${query}` : "") + location.hash,
      );
    },
    [open, pickerMode],
  );

  useEffect(() => {
    let disposed = false;
    const hydrate = async () => {
      let next = createDesignPlan();
      let message = "";
      let safeToSave = true;
      let existing = false;
      let incoming = false;
      let requestedChooser = false;
      try {
        const stored = localStorage.getItem(PLAN_STORAGE_KEY);
        existing = Boolean(stored);
        if (stored) {
          const result = parseDesignPlan(stored);
          next = result.plan;
          message = result.warnings.join(" ");
        }
        const query = new URLSearchParams(location.search);
        if (!existing && location.hash && !location.hash.startsWith("#design="))
          existing = true;
        const legacyKeys = [
          "layout",
          "ui",
          "theme",
          "mode",
          "recipe",
          "density",
        ];
        if (location.hash.startsWith("#design=")) {
          incoming = true;
          const shared = await decodeVisualLink(location.hash);
          if (stored) history.current = [next];
          next = shared;
          existing = true;
          message =
            "Shared visual direction opened. Project details and notes are not included. Undo restores your previous draft.";
          window.history.replaceState(
            window.history.state,
            "",
            location.pathname,
          );
        } else if (legacyKeys.some((key) => query.has(key))) {
          incoming = true;
          const fields = Object.fromEntries(
            legacyKeys
              .filter((key) => query.has(key))
              .map((key) => [key, query.get(key)]),
          );
          const result = migrateLegacyPlan({ configuration: fields });
          if (stored) history.current = [next];
          next = result.plan;
          existing = true;
          message = result.warnings.join(" ");
          window.history.replaceState(
            window.history.state,
            "",
            location.pathname + location.hash,
          );
        } else if (!stored) {
          const legacy = localStorage.getItem(CONFIGURATION_STORAGE_KEY);
          if (legacy) {
            const result = migrateLegacyPlan({
              configuration: JSON.parse(legacy),
            });
            next = result.plan;
            existing = true;
            message = result.warnings.join(" ");
          }
        }
        if (!incoming) {
          requestedChooser = query.get("choose") === "type";
          const id = query.get("template");
          if (id) {
            if (websiteTemplate(id)) {
              if (existing) history.current = [next];
              const previous = next;
              next = applyWebsiteTemplate(next, id, { fresh: !existing });
              if (existing) {
                next.revision = previous.revision + 1;
                next.updatedAt = new Date().toISOString();
              }
              existing = true;
              requestedChooser = false;
              message = "";
            } else
              message =
                "Unknown website type. Your saved draft is unchanged; choose one of the six starters.";
            query.delete("template");
            query.delete("choose");
            window.history.replaceState(
              window.history.state,
              "",
              location.pathname +
                (query.size ? `?${query}` : "") +
                location.hash,
            );
          }
        }
      } catch (error) {
        safeToSave = false;
        message = `Could not restore the saved design: ${error instanceof Error ? error.message : "Storage unavailable."} The original data has been retained. Open a design file or start a new plan.`;
      }
      if (disposed) return;
      current.current = next;
      setPlan(next);
      announce(message);
      hydrated.current = true;
      setReady(true);
      setCanUndo(history.current.length > 0);
      committed.current = existing;
      setHasDraft(existing);
      setPickerMode(
        incoming
          ? null
          : requestedChooser
            ? existing
              ? "change"
              : "new"
            : existing
              ? null
              : "new",
      );
      if (safeToSave && existing) persist(next);
      else if (safeToSave) setSaveStatus("Choose a website type to begin");
      else setSaveStatus("Recovery required — original draft retained");
    };
    // Development effect replay must retain consumed URL intent even when storage rejects writes.
    // Read the document once per provider instance; disposed guards pending asynchronous restores.
    if (!hydrated.current) void hydrate();
    const external = (event: StorageEvent) => {
      if (event.key === PLAN_STORAGE_KEY)
        announce(
          "Another tab changed the saved draft. Download this tab’s design before reopening the studio to load the other version.",
        );
    };
    addEventListener("storage", external);
    return () => {
      disposed = true;
      removeEventListener("storage", external);
    };
  }, [persist]);

  return (
    <PlanContext.Provider
      value={{
        plan,
        ready,
        saveStatus,
        notice,
        canUndo,
        pickerMode,
        hasDraft,
        chooseTemplate,
        showTemplates: (fresh = false) =>
          setPickerMode(fresh || !committed.current ? "new" : "change"),
        resume: () => {
          if (committed.current) setPickerMode(null);
          const query = new URLSearchParams(location.search);
          query.delete("choose");
          window.history.replaceState(
            window.history.state,
            "",
            location.pathname + (query.size ? `?${query}` : "") + location.hash,
          );
        },
        update,
        updateDesign,
        open,
        undo,
        announce,
      }}
    >
      <MotionPreferences
        value={plan.design.motion}
        onChange={(motion) =>
          updateDesign({ motion: fixMotionSettings(motion) })
        }
      >
        {children}
      </MotionPreferences>
    </PlanContext.Provider>
  );
}

/** Reads the sole durable studio document and its validated update boundary. */
export function useDesignPlan(): PlanContextValue {
  const context = useContext(PlanContext);
  if (!context)
    throw new Error("The design studio requires DesignPlanProvider.");
  return context;
}

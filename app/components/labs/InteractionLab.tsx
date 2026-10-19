"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";

import {
  INTERACTION_LEVELS,
  INTERACTION_VARIANTS,
  type InteractionVariant,
} from "../../data/catalog";

type PersistentCollisionState =
  "base" | "active" | "pressed" | "selected" | "current";

type PointerCollisionState = "base" | "hover" | "active";
type SurfaceFeedback = "error" | "success" | "attention";

type CollisionStyle = CSSProperties & {
  [key: `--interactive-surface-${string}`]: string | number | undefined;
};

const collisionStyle: CollisionStyle = {
  "--interactive-surface-lift-base": "0px",
  "--interactive-surface-lift-hover": "-7px",
  "--interactive-surface-lift-active": "3px",
  "--interactive-surface-shadow-base": "0 2px 8px rgb(0 0 0 / 0.16)",
  "--interactive-surface-shadow-hover": "0 16px 30px rgb(0 0 0 / 0.3)",
  "--interactive-surface-shadow-active": "inset 0 3px 9px rgb(0 0 0 / 0.28)",
  "--interactive-surface-state-layer-hover-opacity": "0.12",
  "--interactive-surface-state-layer-active-opacity": "0.24",
  rotate: "0.01deg",
  scale: "1.001",
  transform: "translateZ(0)",
};

const levelVariant: Record<
  (typeof INTERACTION_LEVELS)[number],
  InteractionVariant
> = {
  1: "subtle",
  2: "primary",
  3: "primary",
};

const feedbackMessages: Record<SurfaceFeedback, string> = {
  success: "The demonstration action completed successfully.",
  error: "The demonstration action failed. Review it and try again.",
  attention: "The demonstration action needs your attention.",
};

const feedbackGenerations = new WeakMap<HTMLButtonElement, number>();

/**
 * Replays one semantic outcome on a control, then clears the transient hook.
 *
 * @param control - Control receiving the feedback attribute.
 * @param outcome - Application-reported outcome to render.
 * @param visibleFor - Visible feedback window in milliseconds.
 */
function replaySurfaceFeedback(
  control: HTMLButtonElement,
  outcome: SurfaceFeedback,
  visibleFor = 600,
): void {
  const generation = (feedbackGenerations.get(control) ?? 0) + 1;
  feedbackGenerations.set(control, generation);
  control.removeAttribute("data-surface-feedback");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (feedbackGenerations.get(control) !== generation) return;

      control.setAttribute("data-surface-feedback", outcome);
      window.setTimeout(() => {
        if (
          feedbackGenerations.get(control) === generation &&
          control.getAttribute("data-surface-feedback") === outcome
        ) {
          control.removeAttribute("data-surface-feedback");
        }
      }, visibleFor);
    });
  });
}

function effectiveCollisionState(
  disabled: boolean,
  busy: boolean,
  pointerState: PointerCollisionState,
  persistentState: PersistentCollisionState,
  supportsFineHover: boolean,
) {
  if (disabled) return "disabled";
  if (busy) return "busy";
  if (pointerState === "active") return "active";
  if (persistentState !== "base") return persistentState;
  if (pointerState === "hover" && supportsFineHover) return "hover";
  return "base";
}

/** Demonstrates documented interaction states, feedback, and state precedence. */
export function InteractionLab() {
  const [guardedActivationCount, setGuardedActivationCount] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [collisionDisabled, setCollisionDisabled] = useState(false);
  const [collisionBusy, setCollisionBusy] = useState(false);
  const [supportsFineHover, setSupportsFineHover] = useState(false);
  const [persistentState, setPersistentState] =
    useState<PersistentCollisionState>("base");
  const [pointerState, setPointerState] =
    useState<PointerCollisionState>("base");

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const synchronizeHoverCapability = () => {
      // Keep the textual winner aligned with state-core's fine-pointer media gate.
      setSupportsFineHover(hoverQuery.matches);
    };

    synchronizeHoverCapability();
    hoverQuery.addEventListener("change", synchronizeHoverCapability);
    return () => {
      hoverQuery.removeEventListener("change", synchronizeHoverCapability);
    };
  }, []);

  const collisionWinner = effectiveCollisionState(
    collisionDisabled,
    collisionBusy,
    pointerState,
    persistentState,
    supportsFineHover,
  );

  function handleGuardedActivation(event: ReactMouseEvent<HTMLButtonElement>) {
    const control = event.currentTarget;
    const disabled =
      control.disabled ||
      control.getAttribute("aria-disabled") === "true" ||
      control.classList.contains("is-disabled");

    if (disabled) {
      // CSS owns affordance paint; this shared guard owns behavioral suppression.
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    setGuardedActivationCount((count) => count + 1);
  }

  function handleSurfaceFeedback(
    event: ReactMouseEvent<HTMLButtonElement>,
    outcome: SurfaceFeedback,
  ) {
    replaySurfaceFeedback(event.currentTarget, outcome);
    setFeedbackMessage(feedbackMessages[outcome]);
  }

  return (
    <section
      className="section-band ly-section"
      id="interactions"
      aria-labelledby="interactions-title"
    >
      <div className="ly-wrapper">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Behavior</p>
            <h2 id="interactions-title">
              Test interaction states and precedence.
            </h2>
          </div>
          <p>
            Try hover, keyboard focus, pressed, busy, and disabled states.
            Compare which state takes precedence when several apply. UI Style
            Kit CSS supplies the appearance, and Layout Style CSS arranges the
            examples.
          </p>
        </div>

        <div className="interaction-atlas ly-stack ly-gap-8">
          <section
            className="ly-stack ly-gap-4"
            data-specimen="interaction-variants"
            aria-labelledby="interaction-variants-title"
          >
            <div className="specimen-heading ly-stack ly-gap-2">
              <h3 id="interaction-variants-title">Six semantic variants</h3>
              <p>
                Variant comparisons use level 2 so paint depth stays constant.
              </p>
            </div>
            <div className="interaction-matrix">
              {INTERACTION_VARIANTS.map((variant) => (
                <button
                  className="interactive-surface site-action"
                  data-interaction-variant={variant}
                  data-surface-variant={variant}
                  data-surface-level="2"
                  key={variant}
                  type="button"
                >
                  {variant}
                </button>
              ))}
            </div>
          </section>

          <section
            className="ly-stack ly-gap-4"
            data-specimen="interaction-levels"
            aria-labelledby="interaction-levels-title"
          >
            <div className="specimen-heading ly-stack ly-gap-2">
              <h3 id="interaction-levels-title">Three surface levels</h3>
              <p>
                Level 1 is deliberately subtle; level 3 mixes the active
                identity into the strongest depth.
              </p>
            </div>
            <div className="interaction-matrix interaction-levels">
              {INTERACTION_LEVELS.map((level) => (
                <button
                  className="interactive-surface site-action"
                  data-interaction-level={level}
                  data-surface-variant={levelVariant[level]}
                  data-surface-level={level}
                  key={level}
                  type="button"
                >
                  Level {level}
                </button>
              ))}
            </div>
          </section>

          <section
            className="ly-stack ly-gap-4"
            data-specimen="interaction-feedback"
            aria-labelledby="interaction-feedback-title"
          >
            <div className="specimen-heading ly-stack ly-gap-2">
              <h3 id="interaction-feedback-title">Outcome feedback</h3>
              <p>
                Interactive Surface 1.7 renders one-shot semantic outcomes while
                the application keeps responsibility for accessible status text.
              </p>
            </div>
            <div className="interaction-matrix">
              {(Object.keys(feedbackMessages) as SurfaceFeedback[]).map(
                (outcome) => (
                  <button
                    className="interactive-surface site-action"
                    data-feedback-trigger={outcome}
                    data-surface-level="2"
                    data-surface-variant={
                      outcome === "success"
                        ? "primary"
                        : outcome === "error"
                          ? "danger"
                          : "warning"
                    }
                    key={outcome}
                    type="button"
                    onClick={(event) => handleSurfaceFeedback(event, outcome)}
                  >
                    {outcome} feedback
                  </button>
                ),
              )}
            </div>
            <p
              id="interaction-feedback-status"
              className="disabled-activation-status"
              role="status"
            >
              {feedbackMessage || "Choose an outcome to preview its feedback."}
            </p>
          </section>

          <details>
            <summary>View semantic attributes and class API parity</summary>
            <div
              className="interaction-state-grid"
              data-specimen="interaction-states"
            >
              <button
                className="interactive-surface site-action"
                data-interaction-state="aria-pressed"
                data-surface-variant="primary"
                data-surface-level="2"
                type="button"
                aria-pressed="true"
              >
                Pressed
              </button>

              <div role="tablist" aria-label="Selected-state specimen">
                <button
                  className="interactive-surface site-action"
                  data-interaction-state="aria-selected"
                  data-surface-variant="secondary"
                  data-surface-level="2"
                  type="button"
                  role="tab"
                  aria-selected="true"
                >
                  Selected
                </button>
              </div>

              <a
                className="interactive-surface site-action"
                data-interaction-state="aria-current"
                data-surface-variant="accent"
                data-surface-level="2"
                href="#interactions"
                aria-current="page"
              >
                Current
              </a>

              <button
                className="interactive-surface site-action"
                data-interaction-state="aria-busy"
                data-surface-variant="warning"
                data-surface-level="2"
                type="button"
                aria-busy="true"
              >
                Synchronizing
              </button>

              <button
                className="interactive-surface site-action"
                data-interaction-state="aria-disabled"
                data-surface-variant="subtle"
                data-surface-level="1"
                type="button"
                aria-disabled="true"
                data-guarded-action="aria-disabled"
                onClick={handleGuardedActivation}
              >
                ARIA disabled
              </button>

              <button
                className="interactive-surface site-action"
                data-interaction-state="native-disabled"
                data-surface-variant="subtle"
                data-surface-level="1"
                type="button"
                disabled
                data-guarded-action="native-disabled"
                onClick={handleGuardedActivation}
              >
                Native disabled
              </button>

              <button
                className="interactive-surface site-action is-active"
                data-interaction-state="is-active"
                data-surface-variant="primary"
                data-surface-level="2"
                type="button"
              >
                .is-active
              </button>

              <button
                className="interactive-surface site-action is-loading"
                data-interaction-state="is-loading"
                data-surface-variant="warning"
                data-surface-level="2"
                type="button"
              >
                .is-loading
              </button>

              <button
                className="interactive-surface site-action is-disabled"
                data-interaction-state="is-disabled"
                data-surface-variant="danger"
                data-surface-level="2"
                type="button"
                aria-disabled="true"
                data-guarded-action="class-disabled"
                onClick={handleGuardedActivation}
              >
                .is-disabled
              </button>
            </div>
            <p className="disabled-activation-status">
              Successful guarded activations:{" "}
              <output data-guarded-activation-count>
                {guardedActivationCount}
              </output>
            </p>
            <button
              className="interactive-surface site-action"
              data-guarded-action="enabled"
              data-surface-variant="subtle"
              data-surface-level="1"
              type="button"
              onClick={handleGuardedActivation}
            >
              Enabled activation control
            </button>
          </details>

          <section
            className="collision-console ly-stack ly-gap-6"
            data-specimen="interaction-collision"
            aria-labelledby="collision-title"
          >
            <div className="specimen-heading ly-stack ly-gap-2">
              <h3 id="collision-title">State-collision console</h3>
              <p>
                Toggle only documented ARIA and class hooks. Move the pointer
                onto the specimen for real hover, then hold the primary button
                for real <code>:active</code>.
              </p>
            </div>

            <div className="collision-console-layout">
              <form className="collision-controls ly-stack ly-gap-4">
                <fieldset className="ly-stack ly-gap-2">
                  <legend>Precedence overrides</legend>
                  <label>
                    <input
                      type="checkbox"
                      checked={collisionBusy}
                      onChange={(event) =>
                        setCollisionBusy(event.currentTarget.checked)
                      }
                    />
                    Busy
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={collisionDisabled}
                      onChange={(event) =>
                        setCollisionDisabled(event.currentTarget.checked)
                      }
                    />
                    Disabled
                  </label>
                </fieldset>

                <fieldset
                  className="ly-stack ly-gap-2"
                  role="radiogroup"
                  aria-label="Persistent collision state"
                >
                  <legend>Persistent collision state</legend>
                  {(
                    [
                      ["base", "Base"],
                      ["active", "Class active"],
                      ["pressed", "Pressed"],
                      ["selected", "Selected"],
                      ["current", "Current"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="collision-persistent-state"
                        value={value}
                        checked={persistentState === value}
                        onChange={() => setPersistentState(value)}
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
              </form>

              <div className="collision-stage ly-stack ly-gap-4 ly-items-center">
                <div
                  role={persistentState === "selected" ? "tablist" : undefined}
                  aria-label={
                    persistentState === "selected"
                      ? "Collision selected-state specimen"
                      : undefined
                  }
                >
                  <button
                    className={`interactive-surface site-action collision-surface${
                      persistentState === "active" ? " is-active" : ""
                    }`}
                    data-interaction-state="collision"
                    data-surface-variant="accent"
                    data-surface-level="2"
                    style={collisionStyle}
                    type="button"
                    role={persistentState === "selected" ? "tab" : undefined}
                    aria-busy={collisionBusy || undefined}
                    aria-current={
                      persistentState === "current" ? "page" : undefined
                    }
                    aria-disabled={collisionDisabled || undefined}
                    aria-pressed={
                      persistentState === "pressed" ? true : undefined
                    }
                    aria-selected={
                      persistentState === "selected" ? true : undefined
                    }
                    onPointerEnter={() => setPointerState("hover")}
                    onPointerLeave={() => setPointerState("base")}
                    onPointerDown={() => setPointerState("active")}
                    onPointerUp={() => setPointerState("hover")}
                    onPointerCancel={() => setPointerState("base")}
                  >
                    Collision surface
                  </button>
                </div>
                <p>
                  Effective precedence:{" "}
                  <output aria-live="polite" data-collision-winner>
                    {collisionWinner}
                  </output>
                </p>
                <p>
                  Disabled &gt; busy/loading &gt; real active &gt; persistent
                  active/pressed/selected/current &gt; real hover &gt; base.
                  Focus-visible remains independent.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

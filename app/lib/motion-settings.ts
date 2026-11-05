import {
  presets,
  type Direction,
  type MotionOptions,
  type Preset,
} from "@sanderson-technology-enterprises/motion-style-css";

/** User choices shared by automatic configuration transitions and manual playback. */
export interface MotionSettings {
  enabled: boolean;
  /** Configuration swaps are immediate unless the client explicitly opts in. */
  animateConfigurationChanges: boolean;
  entrance: Preset | "random";
  exit: Preset | "random";
  direction: Direction | "random";
  duration: number | "random";
  delay: number | "random";
  interval: number | "random";
  easing: string;
}

/** New sessions retain overlay/playback motion without animating configuration edits. */
export const DEFAULT_MOTION_SETTINGS: Readonly<MotionSettings> = Object.freeze({
  enabled: true,
  animateConfigurationChanges: false,
  entrance: "random",
  exit: "random",
  direction: "random",
  duration: "random",
  delay: "random",
  interval: "random",
  easing: "random",
});

/** Public CSS easing values exposed by the configuration controls. */
export const MOTION_EASINGS = [
  "ease",
  "ease-in-out",
  "ease-out",
  "linear",
] as const;

/** Fully resolved options are sampled once and remain stable through a phase. */
type ResolvedPhase = Required<
  Pick<
    MotionOptions,
    | "preset"
    | "direction"
    | "duration"
    | "delay"
    | "easing"
    | "respectReducedMotion"
  >
>;

/**
 * Resolve each random choice afresh, preserving explicit values without sampling.
 * Random timings are deliberately bounded so configuration changes stay usable.
 * @param settings Current user preferences.
 * @param random Injectable source returning a value from zero up to, excluding, one.
 * @returns Independent entrance/exit options and the group stagger interval.
 */
export function resolveMotionSettings(
  settings: Readonly<MotionSettings>,
  random: () => number = Math.random,
): { in: ResolvedPhase; out: ResolvedPhase; interval: number } {
  const pick = <T>(values: readonly T[]): T =>
    values[Math.floor(random() * values.length)];
  const timing = (
    value: number | "random",
    min: number,
    max: number,
    step: number,
  ): number =>
    value === "random"
      ? min + Math.floor(random() * ((max - min) / step + 1)) * step
      : value;
  const phase = (preset: Preset | "random"): ResolvedPhase => ({
    preset: preset === "random" ? pick(presets) : preset,
    direction:
      settings.direction === "random"
        ? pick(["left", "right", "up", "down"] as const)
        : settings.direction,
    duration: timing(settings.duration, 200, 700, 50),
    delay: timing(settings.delay, 0, 150, 25),
    easing:
      settings.easing === "random" ? pick(MOTION_EASINGS) : settings.easing,
    respectReducedMotion: true,
  });
  return {
    in: phase(settings.entrance),
    out: phase(settings.exit),
    interval: timing(settings.interval, 30, 120, 10),
  };
}

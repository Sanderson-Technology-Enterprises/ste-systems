import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_MOTION_SETTINGS,
  resolveMotionSettings,
} from "../app/lib/motion-settings";

test("configuration transitions require opt-in while overlay motion starts randomized", () => {
  assert.equal(DEFAULT_MOTION_SETTINGS.enabled, true);
  assert.equal(DEFAULT_MOTION_SETTINGS.animateConfigurationChanges, false);
  for (const key of [
    "entrance",
    "exit",
    "direction",
    "duration",
    "delay",
    "interval",
    "easing",
  ] as const) {
    assert.equal(DEFAULT_MOTION_SETTINGS[key], "random", key);
  }
});

test("random motion resolves fresh bounded values for both phases on every change", () => {
  const first = resolveMotionSettings(DEFAULT_MOTION_SETTINGS, () => 0);
  const second = resolveMotionSettings(DEFAULT_MOTION_SETTINGS, () => 0.99);
  assert.notEqual(first.in.preset, second.in.preset);
  assert.notEqual(first.out.preset, second.out.preset);
  assert.notEqual(first.in.duration, second.in.duration);
  assert.notEqual(first.in.delay, second.in.delay);
  assert.notEqual(first.interval, second.interval);
  for (const config of [first, second]) {
    for (const phase of [config.in, config.out]) {
      assert.ok(phase.duration >= 200 && phase.duration <= 700);
      assert.ok(phase.delay >= 0 && phase.delay <= 150);
      assert.equal(phase.respectReducedMotion, true);
    }
    assert.ok(config.interval >= 30 && config.interval <= 120);
  }
  let sample = 0;
  const independentlyChosen = resolveMotionSettings(
    DEFAULT_MOTION_SETTINGS,
    () => (++sample % 2 ? 0 : 0.99),
  );
  assert.notDeepEqual(independentlyChosen.in, independentlyChosen.out);
});

test("explicit motion choices and all slider values override random defaults", () => {
  const resolved = resolveMotionSettings(
    {
      enabled: true,
      animateConfigurationChanges: false,
      entrance: "slide",
      exit: "curtain",
      direction: "right",
      duration: 520,
      delay: 75,
      interval: 70,
      easing: "ease-in-out",
    },
    () => {
      throw new Error("Fixed settings must not sample randomness");
    },
  );
  assert.deepEqual(resolved.in, {
    preset: "slide",
    direction: "right",
    duration: 520,
    delay: 75,
    easing: "ease-in-out",
    respectReducedMotion: true,
  });
  assert.deepEqual(resolved.out, { ...resolved.in, preset: "curtain" });
  assert.equal(resolved.interval, 70);
});

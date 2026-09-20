import assert from "node:assert/strict";
import test from "node:test";

type NavigationModule = {
  ATLAS_NAVIGATION_ACTIONS?: readonly { label: string; href: string }[];
  ATLAS_NAVIGATION_ITEMS?: readonly { label: string; href: string }[];
  HOME_NAVIGATION_ITEMS?: readonly { label: string; href: string }[];
  HOME_NAVIGATION_ACTIONS?: readonly { label: string; href: string }[];
  LAB_NAVIGATION_ITEMS?: readonly { label: string; href: string }[];
  LAB_NAVIGATION_ACTIONS?: readonly { label: string; href: string }[];
};

async function loadNavigationModule(): Promise<NavigationModule> {
  return import("../app/data/navigation").catch(() => ({}));
}

test("homepage navigation keeps the focused portal concise", async () => {
  const navigation = await loadNavigationModule();

  assert.ok(navigation.HOME_NAVIGATION_ITEMS);
  assert.ok(navigation.HOME_NAVIGATION_ACTIONS);
  assert.deepEqual(
    navigation.HOME_NAVIGATION_ITEMS.map(({ label, href }) => [label, href]),
    [
      ["Packages", "#libraries"],
      ["Components", "/components/"],
      ["Get started", "#get-started"],
      ["About", "#company"],
    ],
  );
  assert.deepEqual(
    navigation.HOME_NAVIGATION_ACTIONS.map(({ label, href }) => [label, href]),
    [
      ["Open lab", "/lab/"],
      [
        "GitHub",
        "https://github.com/Sanderson-Technology-Enterprises/ste-systems",
      ],
    ],
  );
});

test("lab navigation exposes every retained deep-link section", async () => {
  const navigation = await loadNavigationModule();

  assert.ok(navigation.LAB_NAVIGATION_ITEMS);
  assert.ok(navigation.LAB_NAVIGATION_ACTIONS);
  assert.deepEqual(
    navigation.LAB_NAVIGATION_ITEMS.map(({ label, href }) => [label, href]),
    [
      ["Top", "#top"],
      ["Workbench", "#workbench"],
      ["Layout", "#layouts"],
      ["UI & native", "#ui-native"],
      ["Interactions", "#interactions"],
      ["Integration", "#integrate"],
      ["Install", "#install"],
      ["Packages", "#libraries"],
    ],
  );
  assert.deepEqual(
    navigation.LAB_NAVIGATION_ACTIONS.map(({ label, href }) => [label, href]),
    [
      ["Component atlas", "/components/"],
      ["Back to overview", "/"],
      [
        "GitHub",
        "https://github.com/Sanderson-Technology-Enterprises/ste-systems",
      ],
    ],
  );
});

test("atlas navigation exposes the three library sections", async () => {
  const navigation = await loadNavigationModule();

  assert.ok(navigation.ATLAS_NAVIGATION_ITEMS);
  assert.ok(navigation.ATLAS_NAVIGATION_ACTIONS);
  assert.deepEqual(
    navigation.ATLAS_NAVIGATION_ITEMS.map(({ label, href }) => [label, href]),
    [
      ["Top", "#atlas-top"],
      ["Layout", "#atlas-layout"],
      ["UI & native", "#atlas-ui"],
      ["Interactions", "#atlas-interaction"],
    ],
  );
  assert.deepEqual(
    navigation.ATLAS_NAVIGATION_ACTIONS.map(({ label, href }) => [label, href]),
    [
      ["Open lab", "/lab/"],
      ["Overview", "/"],
    ],
  );
});

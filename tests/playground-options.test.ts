import assert from "node:assert/strict";
import test from "node:test";
import interactionManifest from "interactive-surface-css/manifest.json";
import {
  colorToHex,
  hexToChannels,
  buildThemeExport,
  interactionIntensity,
  recipeAreas,
} from "../app/lib/playground-options";

test("custom theme exports contain validated public RGB variables and usable CSS", () => {
  assert.equal(hexToChannels("#123456"), "18 52 86");
  assert.equal(colorToHex("18 52 86"), "#123456");
  assert.equal(colorToHex("rgb(18, 52, 86)"), "#123456");
  assert.throws(() => hexToChannels("red; color: white"));
  const exported = buildThemeExport({
    name: "Client colors",
    preset: "minimal-saas",
    theme: "midnight-gold",
    mode: "dark",
    variables: { "--usk-primary-rgb": "18 52 86", "--usk-bg-rgb": "7 17 31" },
  });
  assert.deepEqual(JSON.parse(exported.json).variables, {
    "--usk-primary-rgb": "18 52 86",
    "--usk-bg-rgb": "7 17 31",
  });
  assert.match(exported.css, /--usk-primary-rgb: 18 52 86;/);
  assert.throws(() =>
    buildThemeExport({
      name: "Bad",
      preset: "minimal-saas",
      theme: "native",
      mode: "light",
      variables: { "--usk-bg-rgb": "999 0 0" },
    }),
  );
});

test("hover intensity uses admitted Interactive Surface tokens and visibly different distances", () => {
  const subtle = interactionIntensity("subtle");
  const strong = interactionIntensity("strong");
  assert.notEqual(
    subtle["--interactive-surface-lift-hover"],
    strong["--interactive-surface-lift-hover"],
  );
  for (const key of Object.keys(strong))
    assert.ok(interactionManifest.tokens.public.includes(key), key);
  assert.equal(
    interactionIntensity("none")["--interactive-surface-lift-hover"],
    "0px",
  );
});

test("all named page recipes receive their correct canonical regions", () => {
  assert.deepEqual(recipeAreas("app-shell"), {
    header: "header",
    navigation: "sidebar",
    main: "main",
    aside: "aside",
    footer: "footer",
  });
  assert.equal(recipeAreas("docs").navigation, "nav");
  assert.equal(recipeAreas("list-detail").main, "primary");
  assert.equal(recipeAreas("split-hero").main, "content");
  assert.deepEqual(recipeAreas("gallery"), {});
  assert.deepEqual(recipeAreas("card-grid"), {});
});

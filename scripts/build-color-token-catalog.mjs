import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(root, "node_modules", "ui-style-kit-css");
const manifest = JSON.parse(
  await readFile(path.join(packageRoot, "manifest.json"), "utf8"),
);
/** Collects supported public RGB variables from one installed style scope. */
const collect = (css, prefix) =>
  [...new Set(css.match(new RegExp(`--${prefix}-[a-z0-9-]+-rgb`, "g")) ?? [])]
    .filter((token) => !token.includes("-fallback-"))
    .sort();
const native = {};
for (const preset of manifest.presets) {
  const css = await readFile(
    path.join(packageRoot, "dist", "visual", `${preset.id}.css`),
    "utf8",
  );
  native[preset.id] = collect(css, preset.prefix);
}
const sharedCss = await readFile(
  path.join(packageRoot, "styles", "theme-colors.css"),
  "utf8",
);
const catalog = {
  packageVersion: manifest.version,
  shared: collect(sharedCss, "usk"),
  native,
};
await writeFile(
  path.join(root, "app", "data", "ui-color-tokens.json"),
  JSON.stringify(catalog, null, 2) + "\n",
);

import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "node_modules", "ui-style-kit-icons");
const target = path.join(root, "public", "vendor", "ui-style-kit-icons");
const version = JSON.parse(
  await readFile(path.join(source, "package.json"), "utf8"),
).version;
const stamp = path.join(target, ".version");

/** Copy the published artwork as generated static assets for both hosting bases. */
export async function buildIconAssets() {
  try {
    if ((await readFile(stamp, "utf8")).trim() === version) return;
  } catch {
    /* First install has no generated artwork. */
  }
  await mkdir(target, { recursive: true });
  for (const directory of ["svg", "monochrome"]) {
    await cp(path.join(source, directory), path.join(target, directory), {
      recursive: true,
      force: true,
    });
  }
  await writeFile(stamp, version + "\n");
}

await buildIconAssets();

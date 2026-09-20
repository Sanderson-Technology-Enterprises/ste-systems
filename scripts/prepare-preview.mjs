import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const previewRoot = path.join(root, ".preview");
const projectRoot = path.join(previewRoot, "ste-systems");

// Mirror the GitHub Pages project path so local browser QA exercises real URLs.
await rm(previewRoot, { recursive: true, force: true });
await mkdir(projectRoot, { recursive: true });
await cp(path.join(root, "out"), projectRoot, { recursive: true });
await cp(
  path.join(root, "out", "404.html"),
  path.join(previewRoot, "404.html"),
);
await mkdir(path.join(root, ".tmp"), { recursive: true });

console.log("Prepared the GitHub Pages preview at .preview/ste-systems/.");

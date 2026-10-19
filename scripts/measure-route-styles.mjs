import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { gzipSync, brotliCompressSync } from "node:zlib";

const exportRoot = fileURLToPath(new URL("../out/", import.meta.url));

/**
 * Measures unique stylesheet payloads referenced by one exported route.
 * Compression sizes are local estimates, not production transfer measurements.
 * @param {string} route Relative HTML path inside the static export.
 * @returns {Promise<object>} Per-file and route-level raw, gzip, and Brotli totals.
 */
export async function measureRouteStyles(route) {
  const html = await readFile(path.join(exportRoot, route), "utf8");
  const hrefs = [
    ...new Set(
      [...html.matchAll(/<link\b[^>]*>/g)]
        .filter(([tag]) => /rel="stylesheet"/.test(tag))
        .map(([tag]) => tag.match(/href="([^"]+)"/)?.[1])
        .filter((href) => href?.includes("/_next/static/")),
    ),
  ];
  const stylesheets = [];
  for (const href of hrefs) {
    const relative = href.slice(href.indexOf("/_next/static/") + 1);
    const css = await readFile(path.join(exportRoot, relative));
    stylesheets.push({
      href,
      rawBytes: css.length,
      gzipBytes: gzipSync(css).length,
      brotliBytes: brotliCompressSync(css).length,
    });
  }
  const sum = (key) =>
    stylesheets.reduce((total, file) => total + file[key], 0);
  return {
    route,
    stylesheets,
    rawBytes: sum("rawBytes"),
    gzipBytes: sum("gzipBytes"),
    brotliBytes: sum("brotliBytes"),
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const reports = [];
  for (const route of [
    "index.html",
    "components/index.html",
    "lab/index.html",
    "health/index.html",
  ]) {
    reports.push(await measureRouteStyles(route));
  }
  console.log(JSON.stringify(reports, null, 2));
}

import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { parseArgs } from "node:util";

import { streamFileResponse } from "./preview-response.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    port: { type: "string", short: "p" },
    hostname: { type: "string", short: "H" },
  },
});
const directory = positionals[0] ?? ".preview";
const previewRoot = path.resolve(directory);
const isExport = path.basename(previewRoot) === "out";
const portValue =
  values.port ??
  positionals[1] ??
  (process.env.PORT?.trim() || (isExport ? "3000" : "4173"));
const requestedPort = Number(portValue);
const host = values.hostname ?? "127.0.0.1";

if (
  !/^\d+$/.test(portValue) ||
  !Number.isInteger(requestedPort) ||
  requestedPort < 1 ||
  requestedPort > 65_535
) {
  throw new Error(`Invalid server port: ${portValue}`);
}

try {
  const entry = isExport ? path.join(previewRoot, "index.html") : previewRoot;
  const entryStatus = await stat(entry);
  if (isExport ? !entryStatus.isFile() : !entryStatus.isDirectory()) {
    throw new Error("Invalid static export directory");
  }
} catch {
  console.error(
    isExport
      ? 'Static export not found. Run "npm run build" before "npm start".'
      : `Preview directory not found: ${previewRoot}. Run "npm run preview:prepare" first.`,
  );
  process.exit(1);
}

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

/**
 * Resolve a request beneath the selected static root without allowing traversal.
 * @param {string} requestUrl Incoming request URL.
 * @returns {string | null} Confined filesystem path, or null for traversal.
 */
function resolvePreviewPath(requestUrl) {
  const pathname = decodeURIComponent(
    new URL(requestUrl, `http://${host}`).pathname,
  );
  const candidate = path.resolve(previewRoot, pathname.replace(/^[/\\]+/, ""));
  const previewPrefix = `${previewRoot}${path.sep}`;

  return candidate === previewRoot || candidate.startsWith(previewPrefix)
    ? candidate
    : null;
}

/**
 * Find an exported file or the site's 404 document while preserving its status.
 * @param {string} requestUrl Incoming request URL.
 * @returns {Promise<{filePath: string | null, statusCode: number}>} Response file.
 */
async function resolveResponse(requestUrl) {
  const candidate = resolvePreviewPath(requestUrl);

  if (candidate === null) {
    return { filePath: null, statusCode: 403 };
  }

  try {
    const candidateStatus = await stat(candidate);
    const filePath = candidateStatus.isDirectory()
      ? path.join(candidate, "index.html")
      : candidate;
    const fileStatus = await stat(filePath);

    return fileStatus.isFile()
      ? { filePath, statusCode: 200 }
      : { filePath: null, statusCode: 404 };
  } catch {
    const fallback = path.join(previewRoot, "404.html");

    try {
      const fallbackStatus = await stat(fallback);
      return fallbackStatus.isFile()
        ? { filePath: fallback, statusCode: 404 }
        : { filePath: null, statusCode: 404 };
    } catch {
      return { filePath: null, statusCode: 404 };
    }
  }
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  try {
    const { filePath, statusCode } = await resolveResponse(request.url ?? "/");

    if (filePath === null) {
      response.writeHead(statusCode, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end(statusCode === 403 ? "Forbidden" : "Not found");
      return;
    }

    const fileStatus = await stat(filePath);
    streamFileResponse({
      contentLength: fileStatus.size,
      contentType:
        contentTypes.get(path.extname(filePath).toLowerCase()) ??
        "application/octet-stream",
      filePath,
      method: request.method,
      response,
      statusCode,
    });
  } catch (error) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Invalid request");
    console.error(error);
  }
});

server.listen(requestedPort, host, () => {
  const label = isExport ? "static export" : "Pages preview";
  const pathname = isExport ? "/" : "/ste-systems/";
  console.log(
    `Serving the ${label} at http://${host}:${requestedPort}${pathname}`,
  );
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    // Playwright terminates the preview command between suites; close without leaving the port occupied.
    server.close(() => process.exit(0));
  });
}

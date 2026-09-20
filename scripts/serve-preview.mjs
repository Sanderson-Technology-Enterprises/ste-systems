import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

import { streamFileResponse } from "./preview-response.mjs";

const previewRoot = path.resolve(process.argv[2] ?? ".preview");
const requestedPort = Number.parseInt(process.argv[3] ?? "4173", 10);
const host = "127.0.0.1";

if (
  !Number.isInteger(requestedPort) ||
  requestedPort < 1 ||
  requestedPort > 65_535
) {
  throw new Error(`Invalid preview port: ${process.argv[3] ?? ""}`);
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
  console.log(
    `Serving the Pages preview at http://${host}:${requestedPort}/ste-systems/.`,
  );
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    // Playwright terminates the preview command between suites; close without leaving the port occupied.
    server.close(() => process.exit(0));
  });
}

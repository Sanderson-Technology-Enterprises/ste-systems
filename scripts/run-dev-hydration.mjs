import { spawn } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const protectedFiles = ["next-env.d.ts", "tsconfig.json"].map((fileName) =>
  path.join(repositoryRoot, fileName),
);
const require = createRequire(import.meta.url);
const playwrightCli = require.resolve("@playwright/test/cli");
const nextCli = require.resolve("next/dist/bin/next");

/**
 * Reads a generated file when present without requiring it in a fresh clone.
 *
 * @param {string} filePath Absolute path to the generated file.
 * @returns {Promise<Buffer | null>} Existing bytes, or `null` when absent.
 */
async function readOptionalFile(filePath) {
  try {
    return await readFile(filePath);
  } catch (error) {
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Runs a task while restoring Next.js-generated files to their prior state.
 *
 * @param {readonly string[]} filePaths Files Next.js may rewrite during dev.
 * @param {() => Promise<number>} task Development-browser task to execute.
 * @returns {Promise<number>} The task exit code.
 */
async function withRestoredFiles(filePaths, task) {
  const snapshots = await Promise.all(
    filePaths.map(async (filePath) => ({
      contents: await readOptionalFile(filePath),
      filePath,
    })),
  );

  try {
    return await task();
  } finally {
    // Next rewrites these files during dev; preserve the checkout byte-for-byte.
    await Promise.all(
      snapshots.map(({ contents, filePath }) =>
        contents === null
          ? rm(filePath, { force: true })
          : writeFile(filePath, contents),
      ),
    );
  }
}

async function assertPortAvailable(port) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", () => {
      reject(
        new Error(`Development hydration port ${port} is already in use.`),
      );
    });
    server.listen({ host: "127.0.0.1", port }, () => {
      server.close(resolve);
    });
  });
}

function runPlaywright() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [playwrightCli, "test", "--config", "playwright.dev.config.ts"],
      {
        cwd: repositoryRoot,
        env: { ...process.env, PLAYWRIGHT_EXTERNAL_DEV_SERVER: "1" },
        stdio: "inherit",
      },
    );
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(
          new Error(`Development hydration test stopped by signal ${signal}.`),
        );
        return;
      }
      resolve(code ?? 1);
    });
  });
}

/** Starts the one test server directly so its process tree can be reclaimed. */
async function startDevServer(port) {
  const server = spawn(
    process.execPath,
    [
      nextCli,
      "dev",
      "--turbopack",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd: repositoryRoot,
      env: { ...process.env, NEXT_DIST_DIR: ".qa/next-dev-hydration" },
      stdio: ["ignore", "inherit", "inherit"],
      detached: process.platform !== "win32",
      windowsHide: true,
    },
  );
  /** Next can retain child handles after its listening process closes on Windows. */
  server.unref();
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null)
      throw new Error(`Development server exited before opening port ${port}.`);
    try {
      await fetch(`http://127.0.0.1:${port}/`, {
        signal: AbortSignal.timeout(1_000),
      });
      return server;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  await stopDevServer(server);
  throw new Error(`Development server did not open port ${port} in time.`);
}

/** Stops only the development server tree created by this runner. */
async function stopDevServer(server) {
  if (!server.pid) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const stop = spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
      stop.once("error", resolve);
      stop.once("exit", resolve);
    });
  } else {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      // A server that already exited has no remaining process group.
    }
  }
}

async function main() {
  const portText = process.env.PLAYWRIGHT_DEV_PORT?.trim() || "4176";
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PLAYWRIGHT_DEV_PORT: ${portText}`);
  }

  await assertPortAvailable(port);
  const exitCode = await withRestoredFiles(protectedFiles, async () => {
    const server = await startDevServer(port);
    try {
      return await runPlaywright();
    } finally {
      await stopDevServer(server);
    }
  });
  process.exitCode = exitCode;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

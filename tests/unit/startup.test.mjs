import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const serverScript = fileURLToPath(
  new URL("../../scripts/serve-preview.mjs", import.meta.url),
);

/**
 * Reserve an available loopback port for a focused server process check.
 * @returns {Promise<number>} An available TCP port.
 */
async function availablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

/**
 * Start a static server against a temporary export and await its ready message.
 * @param {import("node:test").TestContext} t Test cleanup owner.
 * @param {string[]} args Server command-line arguments.
 * @param {NodeJS.ProcessEnv} [env] Additional environment settings.
 * @returns {Promise<{url: string, output: string}>} The advertised ready URL.
 */
async function startFixture(t, args, env = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "ste-start-"));
  await mkdir(path.join(root, "out", "lab"), { recursive: true });
  await writeFile(path.join(root, "out", "index.html"), "Export home");
  await writeFile(path.join(root, "out", "lab", "index.html"), "Export lab");
  await writeFile(path.join(root, "out", "styles.css"), "body { color: red; }");
  await writeFile(path.join(root, "out", "404.html"), "Export not found");
  const child = spawn(process.execPath, [serverScript, ...args], {
    cwd: root,
    env: { ...process.env, PORT: "", ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.setEncoding("utf8").on("data", (chunk) => (output += chunk));
  child.stderr.setEncoding("utf8").on("data", (chunk) => (output += chunk));
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill();
      await once(child, "exit");
    }
    await rm(root, { recursive: true, force: true });
  });
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    const ready = output.match(/http:\/\/127\.0\.0\.1:\d+\//);
    if (ready) return { url: ready[0], output };
    assert.equal(child.exitCode, null, output);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.fail(`Server did not become ready: ${output}`);
}

test("start serves the static export, nested routes, assets, HEAD and real 404 responses", async (t) => {
  const port = await availablePort();
  const { url, output } = await startFixture(t, [
    "out",
    "--port",
    String(port),
  ]);
  assert.equal(url, `http://127.0.0.1:${port}/`);
  assert.doesNotMatch(output, /ste-systems\//);
  const home = await fetch(url);
  assert.equal(home.status, 200);
  assert.equal(await home.text(), "Export home");
  const nested = await fetch(`${url}lab/`);
  assert.equal(nested.status, 200);
  assert.equal(await nested.text(), "Export lab");
  const css = await fetch(`${url}styles.css`);
  assert.match(css.headers.get("content-type"), /text\/css/);
  assert.equal(await css.text(), "body { color: red; }");
  const head = await fetch(url, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  const missing = await fetch(`${url}missing/`);
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), "Export not found");
});

test("start respects PORT and explicit command-line ports take precedence", async (t) => {
  const port = await availablePort();
  const { url } = await startFixture(t, ["out"], { PORT: String(port) });
  assert.equal(url, `http://127.0.0.1:${port}/`);
  const explicitPort = await availablePort();
  const explicit = await startFixture(t, ["out", "-p", String(explicitPort)], {
    PORT: "invalid-environment-port",
  });
  assert.equal(explicit.url, `http://127.0.0.1:${explicitPort}/`);
});

test("dependency install policy covers the locked native build tools", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8"),
  );
  const lock = JSON.parse(
    await readFile(new URL("../../package-lock.json", import.meta.url), "utf8"),
  );
  for (const name of ["esbuild", "unrs-resolver"]) {
    const installed = lock.packages[`node_modules/${name}`];
    assert.equal(installed.hasInstallScript, true);
    assert.equal(
      manifest.allowScripts?.[`${name}@${installed.version}`],
      true,
      `${name}'s locked install script must be explicitly approved`,
    );
  }
});

test("install policy also covers optional platform build scripts", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8"),
  );
  const lock = JSON.parse(
    await readFile(new URL("../../package-lock.json", import.meta.url), "utf8"),
  );
  for (const [location, dependency] of Object.entries(lock.packages)) {
    if (!dependency.hasInstallScript) continue;
    const name = location.split("node_modules/").at(-1);
    assert.equal(
      typeof manifest.allowScripts?.[`${name}@${dependency.version}`],
      "boolean",
      `${name}@${dependency.version} needs an explicit install-script decision`,
    );
  }
});

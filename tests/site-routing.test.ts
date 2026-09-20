import assert from "node:assert/strict";
import test from "node:test";

import { SITE, withBasePath } from "../app/lib/site";

test("site URLs expose the Pages-safe lab and component routes", () => {
  assert.equal(SITE.labPath, "/lab/");
  assert.equal(SITE.labUrl, "https://stesystems.com/lab/");
  assert.equal(withBasePath(SITE.labPath, "ste-systems"), "/ste-systems/lab/");
  assert.equal(SITE.componentsPath, "/components/");
  assert.equal(SITE.componentsUrl, "https://stesystems.com/components/");
  assert.equal(
    withBasePath(SITE.componentsPath, "ste-systems"),
    "/ste-systems/components/",
  );
});

test("legacy configuration and lab anchors move to the lab route", async () => {
  const legacyNavigation = await import("../app/lib/legacy-navigation").catch(
    () => ({}),
  );
  const destination = (
    legacyNavigation as {
      legacyLabDestination?: (
        search: string,
        hash: string,
        requestedBasePath?: string,
      ) => string | null;
    }
  ).legacyLabDestination;

  assert.equal(typeof destination, "function");
  if (destination === undefined) return;

  assert.equal(
    destination(
      "?ui=cyberpunk&layout=split-screen&utm_source=release",
      "#workbench",
    ),
    "/lab/?ui=cyberpunk&layout=split-screen&utm_source=release#workbench",
  );
  assert.equal(
    destination("", "#layouts", "ste-systems"),
    "/ste-systems/lab/#layouts",
  );
  assert.equal(
    destination("?utm_source=release", "#layouts"),
    "/lab/?utm_source=release#layouts",
  );
});

test("homepage anchors and unrelated queries stay on the homepage", async () => {
  const legacyNavigation = await import("../app/lib/legacy-navigation").catch(
    () => ({}),
  );
  const destination = (
    legacyNavigation as {
      legacyLabDestination?: (
        search: string,
        hash: string,
        requestedBasePath?: string,
      ) => string | null;
    }
  ).legacyLabDestination;

  assert.equal(typeof destination, "function");
  if (destination === undefined) return;

  assert.equal(destination("", "#top"), null);
  assert.equal(destination("", "#libraries"), null);
  assert.equal(destination("", "#company"), null);
  assert.equal(destination("?utm_source=release", ""), null);
});

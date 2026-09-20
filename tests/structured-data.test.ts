import assert from "node:assert/strict";
import test from "node:test";

type StructuredDataModule = {
  buildHomeStructuredData?: () => {
    "@graph": Array<Record<string, unknown>>;
  };
  buildLabStructuredData?: () => {
    "@graph": Array<Record<string, unknown>>;
  };
  buildAtlasStructuredData?: () => {
    "@graph": Array<Record<string, unknown>>;
  };
  serializeStructuredData?: (value: unknown) => string;
};

async function loadStructuredDataModule(): Promise<StructuredDataModule> {
  return import("../app/lib/structured-data").catch(() => ({}));
}

test("homepage structured data describes the overview and package list", async () => {
  const structuredData = await loadStructuredDataModule();

  assert.equal(typeof structuredData.buildHomeStructuredData, "function");
  if (structuredData.buildHomeStructuredData === undefined) return;

  const graph = structuredData.buildHomeStructuredData()["@graph"];
  const webPage = graph.find((node) => node["@type"] === "WebPage");
  const packages = graph.find((node) => node["@type"] === "ItemList");

  assert.equal(webPage?.url, "https://stesystems.com/");
  assert.equal(packages?.url, "https://stesystems.com/#libraries");
  assert.equal(packages?.numberOfItems, 3);
});

test("atlas structured data assigns the application to the component route", async () => {
  const structuredData = await loadStructuredDataModule();

  assert.equal(typeof structuredData.buildAtlasStructuredData, "function");
  if (structuredData.buildAtlasStructuredData === undefined) return;

  const graph = structuredData.buildAtlasStructuredData()["@graph"];
  const webPage = graph.find((node) => node["@type"] === "WebPage");
  const application = graph.find(
    (node) => node["@type"] === "SoftwareApplication",
  );

  const expectedUrl = "https://stesystems.com/components/";
  assert.equal(webPage?.url, expectedUrl);
  assert.equal(application?.url, expectedUrl);
});

test("lab structured data assigns the application to the lab route", async () => {
  const structuredData = await loadStructuredDataModule();

  assert.equal(typeof structuredData.buildLabStructuredData, "function");
  if (structuredData.buildLabStructuredData === undefined) return;

  const graph = structuredData.buildLabStructuredData()["@graph"];
  const webPage = graph.find((node) => node["@type"] === "WebPage");
  const application = graph.find(
    (node) => node["@type"] === "SoftwareApplication",
  );

  assert.equal(webPage?.url, "https://stesystems.com/lab/");
  assert.equal(application?.url, "https://stesystems.com/lab/");
  assert.equal(
    application?.codeRepository,
    "https://github.com/Sanderson-Technology-Enterprises/ste-systems",
  );
});

test("structured data serialization cannot close the script element", async () => {
  const structuredData = await loadStructuredDataModule();

  assert.equal(typeof structuredData.serializeStructuredData, "function");
  if (structuredData.serializeStructuredData === undefined) return;

  assert.equal(
    structuredData.serializeStructuredData({ value: "</script>" }),
    '{"value":"\\u003c/script>"}',
  );
});

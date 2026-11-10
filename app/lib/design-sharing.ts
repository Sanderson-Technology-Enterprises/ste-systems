import {
  createDesignPlan,
  MAX_PLAN_BYTES,
  parseDesignPlan,
  type DesignPlan,
} from "./design-plan";

/** Links deliberately carry a public visual projection, never project text or notes. */
export async function encodeVisualLink(
  plan: DesignPlan,
  base: string,
): Promise<string> {
  const checked = parseDesignPlan(plan).plan;
  const bytes = new TextEncoder().encode(
    JSON.stringify({
      version: 1,
      design: checked.design,
      preview: checked.preview,
    }),
  );
  const compressed = new Uint8Array(
    await new Response(
      new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")),
    ).arrayBuffer(),
  );
  const encoded = btoa(
    Array.from(compressed, (byte) => String.fromCharCode(byte)).join(""),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  const url = new URL(base);
  url.search = "";
  url.hash = `design=1.${encoded}`;
  if (new TextEncoder().encode(url.href).length > 8192)
    throw new Error(
      "This visual direction is too large for a link. Download the complete design file instead.",
    );
  return url.href;
}

/** Restores a bounded visual projection into a new plan with no private context. */
export async function decodeVisualLink(hash: string): Promise<DesignPlan> {
  if (!hash.startsWith("#design=1.") || hash.length > 8192)
    throw new Error(
      "Unsupported or oversized visual-direction link. Open a design file instead.",
    );
  const encoded = hash.slice(10).replaceAll("-", "+").replaceAll("_", "/");
  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  const reader = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"))
    .getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_PLAN_BYTES)
        throw new Error("The expanded visual direction is too large.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const payload = JSON.parse(await new Blob(chunks as BlobPart[]).text());
  if (payload.version !== 1)
    throw new Error("Unsupported visual-direction version.");
  return parseDesignPlan({
    ...createDesignPlan(),
    design: payload.design,
    preview: payload.preview,
  }).plan;
}

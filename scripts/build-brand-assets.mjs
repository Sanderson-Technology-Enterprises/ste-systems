import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publicRoot = path.join(repositoryRoot, "public");
const socialCardSource = path.join(
  repositoryRoot,
  "assets",
  "brand",
  "ste-systems-social-preview-source.png",
);
const socialCardOutput = path.join(
  publicRoot,
  "ste-systems-social-preview.png",
);
const steSystemsLogoSource = path.join(publicRoot, "ste-systems-logo.png");
const steSystemsMarkCrop = {
  left: 0,
  top: 0,
  width: 1448,
  height: 724,
};

const transparentOutputs = new Map([
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
  ["mstile-150x150.png", 150],
]);

function readOption(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function buildPngIco(entries) {
  // PNG-backed ICO entries preserve full alpha at every browser-supported size.
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let dataOffset = header.length + directory.length;
  for (const [index, entry] of entries.entries()) {
    const offset = index * 16;
    directory[offset] = entry.size === 256 ? 0 : entry.size;
    directory[offset + 1] = entry.size === 256 ? 0 : entry.size;
    directory[offset + 2] = 0;
    directory[offset + 3] = 0;
    directory.writeUInt16LE(1, offset + 4);
    directory.writeUInt16LE(32, offset + 6);
    directory.writeUInt32LE(entry.png.length, offset + 8);
    directory.writeUInt32LE(dataOffset, offset + 12);
    dataOffset += entry.png.length;
  }

  return Buffer.concat([header, directory, ...entries.map(({ png }) => png)]);
}

async function renderTransparent(masterBuffer, size) {
  return sharp(masterBuffer)
    .resize(size, size, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

/**
 * Removes nearly transparent color noise left by the supplied PNG export.
 *
 * @param {Buffer} input RGBA-compatible image buffer.
 * @param {number} [alphaFloor=5] Alpha values at or below this floor are cleared.
 * @returns {Promise<Buffer>} Cleaned PNG buffer.
 */
async function removeTransparentColorNoise(input, alphaFloor = 5) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 3; offset < data.length; offset += info.channels) {
    if (data[offset] <= alphaFloor) {
      data[offset] = 0;
    }
  }

  return sharp(data, { raw: info }).png().toBuffer();
}

/**
 * Produces the complete favicon family from an approved transparent mark.
 *
 * @param {object} options Build options.
 * @param {string} options.sourceMaster Approved source artwork path.
 * @param {{left: number, top: number, width: number, height: number}} [options.markCrop]
 * Crop isolating the favicon mark from a larger lockup.
 * @param {string} [options.outputRoot] Destination directory.
 * @returns {Promise<{masterBuffer: Buffer}>} Generated normalized master.
 */
export async function buildLogoFamily({
  sourceMaster,
  markCrop,
  outputRoot = publicRoot,
}) {
  const sourceInput = await readFile(sourceMaster);
  const sourceMetadata = await sharp(sourceInput).metadata();
  if (!sourceMetadata.width || !sourceMetadata.height) {
    throw new Error("Brand source must expose readable image dimensions.");
  }

  if (
    markCrop &&
    (markCrop.left < 0 ||
      markCrop.top < 0 ||
      markCrop.width < 1 ||
      markCrop.height < 1 ||
      markCrop.left + markCrop.width > sourceMetadata.width ||
      markCrop.top + markCrop.height > sourceMetadata.height)
  ) {
    throw new Error("Brand mark crop must remain inside the source artwork.");
  }

  const input = markCrop
    ? await removeTransparentColorNoise(
        await sharp(sourceInput).extract(markCrop).png().toBuffer(),
      )
    : sourceInput;

  // A production master must expose a real matte rather than a baked
  // transparency grid or a completely opaque background.
  const stats = await sharp(input).ensureAlpha().stats();
  const alpha = stats.channels[3];
  if (!alpha || alpha.min !== 0 || alpha.max !== 255) {
    throw new Error(
      "Brand master must contain both transparent and opaque pixels.",
    );
  }

  const masterBuffer = await sharp(input)
    .trim({
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      threshold: 16,
    })
    .resize(1254, 1254, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "logo-master.png"), masterBuffer);

  const rendered = new Map();
  for (const [fileName, size] of transparentOutputs) {
    const buffer = await renderTransparent(masterBuffer, size);
    rendered.set(size, buffer);
    await writeFile(path.join(outputRoot, fileName), buffer);
  }

  // Retain a flat RGB chroma source for tooling that cannot consume alpha.
  const chroma = await sharp({
    create: {
      width: 1254,
      height: 1254,
      channels: 3,
      background: "#ff00ff",
    },
  })
    .composite([{ input: masterBuffer }])
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "logo-chroma-source.png"), chroma);

  const maskableMark = await renderTransparent(masterBuffer, 380);
  const maskable = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: "#081b33",
    },
  })
    .composite([{ input: maskableMark, left: 66, top: 66 }])
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "maskable-icon-512x512.png"), maskable);

  const previewMark = await renderTransparent(masterBuffer, 260);
  const previewTileMark = await renderTransparent(masterBuffer, 140);
  const pixelPreview = await sharp(rendered.get(48))
    .resize(176, 176, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  const darkTile = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: "#081b33",
    },
  })
    .composite([{ input: previewTileMark, left: 20, top: 20 }])
    .png()
    .toBuffer();
  const preview = await sharp({
    create: {
      width: 900,
      height: 360,
      channels: 4,
      background: "#f4f7fb",
    },
  })
    .composite([
      { input: previewMark, left: 35, top: 50 },
      { input: darkTile, left: 355, top: 90 },
      { input: pixelPreview, left: 650, top: 92 },
    ])
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "favicon-preview.png"), preview);

  const icoEntries = [16, 32, 48].map((size) => ({
    size,
    png: rendered.get(size),
  }));
  await writeFile(
    path.join(outputRoot, "favicon.ico"),
    buildPngIco(icoEntries),
  );

  return { masterBuffer };
}

/**
 * Produces the public Open Graph image from the approved finished artwork.
 * The source remains separate from the generated output so repeated asset
 * builds preserve the supplied design without adding generated copy.
 *
 * @param {object} [options] Build options.
 * @param {string} [options.sourcePath] Approved social-card artwork path.
 * @param {string} [options.outputPath] Generated public image path.
 * @returns {Promise<void>} Resolves after the public card has been written.
 */
export async function buildSocialCard({
  sourcePath = socialCardSource,
  outputPath = socialCardOutput,
} = {}) {
  const output = await sharp(sourcePath)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(outputPath, output);
}

const requestedMaster = readOption("--master");
await buildLogoFamily({
  sourceMaster: requestedMaster
    ? path.resolve(requestedMaster)
    : steSystemsLogoSource,
  markCrop: requestedMaster ? undefined : steSystemsMarkCrop,
});
await buildSocialCard();

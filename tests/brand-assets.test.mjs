import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import test from "node:test";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const legacyHashes = new Map([
  [
    "public/logo-master.png",
    "8ff9b62f7ca1724b452047e5c37c084deee79b24f0558928599684a9910d23aa",
  ],
  [
    "public/logo-chroma-source.png",
    "801462899c236bf2caeea2667c303542f429302eb4f9fe4526256d63e8cfdd4a",
  ],
  [
    "public/favicon.ico",
    "7bbccbc4bacc988dfb79dccc3e68c4f42b57a8122c957f59448be8359819ef5f",
  ],
  [
    "public/favicon-preview.png",
    "262489ac78d5fa51c88c78802101c80f858ec731dd4fe96f5260a6b6c8ed541e",
  ],
  [
    "public/favicon-16x16.png",
    "9346aac1d3dfd0e02a7adf9fa6e53573df0d4db76875c7b079805046a9c079d1",
  ],
  [
    "public/favicon-32x32.png",
    "425aaeb35336e19ff024e051544dd5301f810963f565cd0de7f2ba61385bf32c",
  ],
  [
    "public/favicon-48x48.png",
    "3e55d206d069f0ef1407203a30d131e7be79a7411b6f6ab41562f8f974115e14",
  ],
  [
    "public/apple-touch-icon.png",
    "93f1ccf3f9aa097d39fd7629f820cbe357e0780a27f18065c4a5624eb82da34d",
  ],
  [
    "public/android-chrome-192x192.png",
    "f30dbdd0ebb9bfc4222afc162f4119c37782eb288b4c17693eeec971a8ca6fa9",
  ],
  [
    "public/android-chrome-512x512.png",
    "50bb274c702d8ff26cc4179e156e8d96feca60617616817a263bbabe59a4d9fd",
  ],
  [
    "public/maskable-icon-512x512.png",
    "3d665313419b1ac4786dd04e740ff0d3057cf0fdee9e0f6c3d5817391038dfe2",
  ],
  [
    "public/mstile-150x150.png",
    "03e7f7a9cf8355e3b092d1d7d0e36e55cf1f042f89bb3b45b2921d0936a3c1f4",
  ],
  [
    "public/ste-systems-social-preview.png",
    "7c088b8f919d68b55e60248ad61c688a3b2aa6b86e630d6bd430628c2a8b9f59",
  ],
]);

const pngDimensions = new Map([
  ["public/logo-master.png", [1254, 1254]],
  ["public/logo-chroma-source.png", [1254, 1254]],
  ["public/favicon-preview.png", [900, 360]],
  ["public/favicon-16x16.png", [16, 16]],
  ["public/favicon-32x32.png", [32, 32]],
  ["public/favicon-48x48.png", [48, 48]],
  ["public/apple-touch-icon.png", [180, 180]],
  ["public/android-chrome-192x192.png", [192, 192]],
  ["public/android-chrome-512x512.png", [512, 512]],
  ["public/maskable-icon-512x512.png", [512, 512]],
  ["public/mstile-150x150.png", [150, 150]],
  ["public/ste-systems-banner.png", [2172, 724]],
  ["public/ste-systems-logo.png", [1448, 1086]],
  ["public/ste-systems-social-preview.png", [1200, 630]],
]);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function readPngHeader(buffer) {
  assert.equal(
    buffer.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    "asset must use a PNG signature",
  );
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25],
  };
}

test("the public logo family does not ship a known three-layer binary", async () => {
  for (const [relativePath, legacyHash] of legacyHashes) {
    const buffer = await readFile(path.join(repositoryRoot, relativePath));
    assert.notEqual(
      sha256(buffer),
      legacyHash,
      `${relativePath} still contains the three-layer mark`,
    );
  }
});

test("brand PNG outputs retain their public dimensions", async () => {
  for (const [relativePath, [width, height]] of pngDimensions) {
    const buffer = await readFile(path.join(repositoryRoot, relativePath));
    const metadata = readPngHeader(buffer);
    assert.deepEqual(
      [metadata.width, metadata.height],
      [width, height],
      relativePath,
    );
  }
});

test("generated social card preserves the supplied artwork without overlays", async () => {
  const sourcePath = path.join(
    repositoryRoot,
    "assets/brand/ste-systems-social-preview-source.png",
  );
  const outputPath = path.join(
    repositoryRoot,
    "public/ste-systems-social-preview.png",
  );
  const expected = await sharp(sourcePath)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .removeAlpha()
    .raw()
    .toBuffer();
  const actual = await sharp(outputPath).removeAlpha().raw().toBuffer();

  assert.equal(
    actual.equals(expected),
    true,
    "generated social-card pixels must match the approved source artwork",
  );
});

test("logo source files preserve transparent and chroma-ready formats", async () => {
  const master = readPngHeader(
    await readFile(path.join(repositoryRoot, "public/logo-master.png")),
  );
  const chroma = readPngHeader(
    await readFile(path.join(repositoryRoot, "public/logo-chroma-source.png")),
  );
  assert.equal(master.colorType, 6, "master must remain RGBA");
  assert.equal(chroma.colorType, 2, "chroma source must remain RGB");
});

test("favicon master derives from the approved STE Systems mark", async () => {
  const sourcePath = path.join(repositoryRoot, "public/ste-systems-logo.png");
  const masterPath = path.join(repositoryRoot, "public/logo-master.png");
  const croppedMark = await sharp(sourcePath)
    .extract({ left: 0, top: 0, width: 1448, height: 724 })
    .png()
    .toBuffer();
  const { data, info } = await sharp(croppedMark)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let offset = 3; offset < data.length; offset += info.channels) {
    if (data[offset] <= 5) {
      data[offset] = 0;
    }
  }
  const cleanedMark = await sharp(data, { raw: info }).png().toBuffer();
  const expected = await sharp(cleanedMark)
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
    .raw()
    .toBuffer();
  const actual = await sharp(masterPath).ensureAlpha().raw().toBuffer();

  assert.equal(
    actual.equals(expected),
    true,
    "favicon master must use the supplied STE Systems emblem",
  );
});

test("favicon.ico contains 16, 32, and 48 pixel 32-bit entries", async () => {
  const buffer = await readFile(
    path.join(repositoryRoot, "public/favicon.ico"),
  );
  assert.equal(buffer.readUInt16LE(0), 0);
  assert.equal(buffer.readUInt16LE(2), 1);
  assert.equal(buffer.readUInt16LE(4), 3);

  const entries = Array.from({ length: 3 }, (_, index) => {
    const offset = 6 + index * 16;
    return {
      width: buffer[offset] || 256,
      height: buffer[offset + 1] || 256,
      planes: buffer.readUInt16LE(offset + 4),
      bits: buffer.readUInt16LE(offset + 6),
    };
  });
  assert.deepEqual(entries, [
    { width: 16, height: 16, planes: 1, bits: 32 },
    { width: 32, height: 32, planes: 1, bits: 32 },
    { width: 48, height: 48, planes: 1, bits: 32 },
  ]);
});

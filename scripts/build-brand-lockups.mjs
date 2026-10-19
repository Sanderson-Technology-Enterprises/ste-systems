import sharp from "sharp";
import { fileURLToPath } from "node:url";

/** Builds small transparent lockups from the untouched master for responsive header/footer slots. */
async function buildLockups() {
  const master = fileURLToPath(
    new URL("../public/ste-systems-logo.png", import.meta.url),
  );
  for (const width of [64, 128, 256, 384]) {
    const destination = fileURLToPath(
      new URL(`../public/ste-systems-logo-${width}.webp`, import.meta.url),
    );
    await sharp(master)
      .resize({ width })
      .webp({ quality: 85, effort: 6 })
      .toFile(destination);
  }
}

await buildLockups();

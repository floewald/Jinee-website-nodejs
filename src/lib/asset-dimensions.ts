import fs from "node:fs";
import path from "node:path";

export interface ImageDimensions {
  width: number;
  height: number;
}

const webpDimensionsCache = new Map<string, ImageDimensions | null>();

/**
 * Read intrinsic dimensions from a local WebP file.
 *
 * All homepage/gallery assets are generated as WebP during the image build
 * step, so parsing the container header keeps this dependency-free.
 */
export function readWebPDimensions(filePath: string): ImageDimensions | undefined {
  if (webpDimensionsCache.has(filePath)) {
    return webpDimensionsCache.get(filePath) ?? undefined;
  }

  try {
    const buffer = fs.readFileSync(filePath);
    if (
      buffer.toString("ascii", 0, 4) !== "RIFF" ||
      buffer.toString("ascii", 8, 12) !== "WEBP"
    ) {
      webpDimensionsCache.set(filePath, null);
      return undefined;
    }

    const chunkType = buffer.toString("ascii", 12, 16);
    let dimensions: ImageDimensions | undefined;

    if (chunkType === "VP8 ") {
      dimensions = {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    } else if (chunkType === "VP8L") {
      const byte0 = buffer[21];
      const byte1 = buffer[22];
      const byte2 = buffer[23];
      const byte3 = buffer[24];
      dimensions = {
        width: 1 + (((byte1 & 0x3f) << 8) | byte0),
        height: 1 + (((byte3 & 0x0f) << 10) | (byte2 << 2) | ((byte1 & 0xc0) >> 6)),
      };
    } else if (chunkType === "VP8X") {
      dimensions = {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }

    webpDimensionsCache.set(filePath, dimensions ?? null);
    return dimensions;
  } catch {
    webpDimensionsCache.set(filePath, null);
    return undefined;
  }
}

/**
 * Resolve a public asset URL like `/assets/foo/image.webp` to a file under
 * `public/` and read its intrinsic dimensions.
 */
export function readPublicImageDimensions(publicAssetPath: string): ImageDimensions | undefined {
  const relativePath = decodeURIComponent(publicAssetPath).replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", relativePath);
  return readWebPDimensions(filePath);
}

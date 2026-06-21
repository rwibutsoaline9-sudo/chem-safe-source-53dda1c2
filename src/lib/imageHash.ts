// Perceptual image hashing utilities (dHash 8x8 → 64-bit hex)
// Used to detect visually similar product images across SKUs.

const HASH_SIZE = 8;

/** Compute a 64-bit dHash (16 hex chars) from an image URL. Returns null on failure. */
export async function computeDHash(url: string): Promise<string | null> {
  try {
    const img = await loadImage(url);
    const w = HASH_SIZE + 1;
    const h = HASH_SIZE;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    // Convert to grayscale
    const gray = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      gray[i] = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
    }

    // Build 64 bits by comparing adjacent pixels horizontally
    let bits = "";
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < HASH_SIZE; x++) {
        bits += gray[y * w + x] < gray[y * w + x + 1] ? "1" : "0";
      }
    }

    // Convert to hex (16 chars)
    let hex = "";
    for (let i = 0; i < bits.length; i += 4) {
      hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    }
    return hex;
  } catch {
    return null;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Hamming distance between two equal-length hex hashes (0–64). */
export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      dist += x & 1;
      x >>= 1;
    }
  }
  return dist;
}

import type React from "react";
import productUrea from "@/assets/product-urea.jpg";
import productSodiumCyanide from "@/assets/product-sodium-cyanide.jpg";
import productCausticSoda from "@/assets/product-caustic-soda.jpg";

// Only product-level assets should be reused in cards. Generic category images
// made too many products look identical, so category placeholders now fall
// through to a unique generated product visual instead.
const fileMap: Record<string, string> = {
  "product-urea.jpg": productUrea,
  "product-sodium-cyanide.jpg": productSodiumCyanide,
  "product-caustic-soda.jpg": productCausticSoda,
};

const genericCategoryFiles = new Set([
  "category-acids.jpg",
  "category-alkalis.jpg",
  "category-solvents.jpg",
  "category-salts.jpg",
  "category-organics.jpg",
  "category-gases.jpg",
  "category-polymers.jpg",
  "category-oxides.jpg",
  "category-surfactants.jpg",
  "category-metal-salts.jpg",
]);

const productNameAssets: Array<[RegExp, string]> = [
  [/\burea\b/i, productUrea],
  [/sodium cyanide/i, productSodiumCyanide],
  [/caustic soda|sodium hydroxide/i, productCausticSoda],
];

const palettes = [
  ["#ECFEFF", "#0891B2", "#155E75", "#F97316"],
  ["#F0FDF4", "#16A34A", "#166534", "#2563EB"],
  ["#FFF7ED", "#EA580C", "#9A3412", "#0F766E"],
  ["#EFF6FF", "#2563EB", "#1E3A8A", "#F59E0B"],
  ["#FDF4FF", "#C026D3", "#86198F", "#22C55E"],
  ["#F8FAFC", "#475569", "#0F172A", "#06B6D4"],
  ["#FEFCE8", "#CA8A04", "#854D0E", "#14B8A6"],
  ["#F0FDFA", "#0D9488", "#134E4A", "#DC2626"],
  ["#F5F3FF", "#7C3AED", "#4C1D95", "#F97316"],
  ["#FDF2F8", "#DB2777", "#831843", "#0EA5E9"],
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickProductAsset(seed: string): string | null {
  const match = productNameAssets.find(([pattern]) => pattern.test(seed));
  return match?.[1] ?? null;
}

function visualTypeFor(seed: string, category: string): "sacks" | "drums" | "glassware" | "cylinders" | "pellets" | "bottles" | "crystals" {
  const value = `${seed} ${category}`.toLowerCase();
  if (/gas|oxygen|nitrogen|argon|helium|chlorine/.test(value)) return "cylinders";
  if (/polymer|resin|plastic|pellet/.test(value)) return "pellets";
  if (/surfactant|soap|detergent/.test(value)) return "bottles";
  if (/salt|chloride|carbonate|sulfate|nitrate|phosphate|fertilizer|urea|powder|oxide|boron/.test(value)) return "sacks";
  if (/acid|solvent|amine|organic|peroxide|acetone|ethanol|methanol|toluene|xylene/.test(value)) return "glassware";
  if (/metal|precious|crystal|copper|nickel|zinc|silver/.test(value)) return "crystals";
  return "drums";
}

function productVisualFor(seed: string, category: string): string {
  const key = `${seed || "industrial chemical"}-${category || "catalog"}`;
  const hash = hashString(key);
  const [bg, accent, deep, highlight] = palettes[hash % palettes.length];
  const type = visualTypeFor(seed, category);
  const variant = hash % 5;
  const shift = (hash % 17) - 8;
  const opacity = 0.14 + ((hash % 6) * 0.025);

  const common = `
    <rect width="800" height="520" fill="${bg}"/>
    <rect width="800" height="520" fill="url(#grid)" opacity="${opacity}"/>
    <circle cx="${118 + shift}" cy="88" r="118" fill="${accent}" opacity="0.14"/>
    <circle cx="${682 - shift}" cy="430" r="150" fill="${highlight}" opacity="0.16"/>
    <path d="M0 402 C155 344 248 438 402 382 S646 315 800 372 V520 H0Z" fill="${deep}" opacity="0.08"/>`;

  const visuals = {
    sacks: `
      <g transform="translate(${84 + shift} 118)">
        <path d="M78 72h202l34 238H36z" fill="#FFFFFF" stroke="${deep}" stroke-width="9"/>
        <path d="M100 48h160l20 48H80z" fill="${accent}" opacity="0.9"/>
        <path d="M61 210h226" stroke="${accent}" stroke-width="18" opacity="0.35"/>
        <path d="M344 88h176l38 222H312z" fill="#FFFFFF" stroke="${deep}" stroke-width="9" opacity="0.94"/>
        <path d="M366 64h132l28 48H338z" fill="${highlight}" opacity="0.92"/>
        <ellipse cx="484" cy="333" rx="154" ry="31" fill="${deep}" opacity="0.16"/>
        ${Array.from({ length: 18 }, (_, i) => `<circle cx="${410 + ((i * 31 + variant * 11) % 180)}" cy="${286 + ((i * 19) % 50)}" r="${4 + (i % 4)}" fill="${accent}" opacity="0.42"/>`).join("")}
      </g>`,
    drums: `
      <g transform="translate(${118 + shift} 84)">
        <ellipse cx="182" cy="74" rx="124" ry="45" fill="${accent}"/>
        <path d="M58 74v244c0 25 56 45 124 45s124-20 124-45V74" fill="${accent}" opacity="0.88"/>
        <ellipse cx="182" cy="318" rx="124" ry="45" fill="${deep}" opacity="0.38"/>
        <path d="M72 142h220M72 236h220" stroke="#FFFFFF" stroke-width="15" opacity="0.4"/>
        <rect x="104" y="158" width="156" height="56" rx="10" fill="#FFFFFF" opacity="0.84"/>
        <g transform="translate(360 78)">
          <ellipse cx="116" cy="62" rx="100" ry="37" fill="${highlight}"/>
          <path d="M16 62v206c0 21 45 37 100 37s100-16 100-37V62" fill="${highlight}" opacity="0.88"/>
          <path d="M28 132h176M28 210h176" stroke="#FFFFFF" stroke-width="12" opacity="0.38"/>
        </g>
      </g>`,
    glassware: `
      <g transform="translate(${116 + shift} 62)">
        <path d="M145 42v126L72 336c-14 34 8 72 45 72h206c37 0 59-38 45-72l-73-168V42" fill="#FFFFFF" opacity="0.78" stroke="${deep}" stroke-width="9"/>
        <path d="M108 300c56-42 147 22 224-18l36 76c10 22-6 47-31 47H103c-25 0-41-25-31-47z" fill="${accent}" opacity="0.78"/>
        <rect x="128" y="24" width="184" height="36" rx="15" fill="${deep}" opacity="0.78"/>
        <g transform="translate(386 38)">
          <rect x="72" y="42" width="68" height="196" rx="27" fill="#FFFFFF" opacity="0.74" stroke="${deep}" stroke-width="8"/>
          <path d="M74 156c28-17 42 18 66 0v82H74z" fill="${highlight}" opacity="0.82"/>
          <rect x="54" y="236" width="104" height="32" rx="16" fill="${deep}" opacity="0.78"/>
        </g>
        <circle cx="174" cy="324" r="10" fill="#FFFFFF" opacity="0.72"/>
        <circle cx="252" cy="345" r="14" fill="#FFFFFF" opacity="0.55"/>
      </g>`,
    cylinders: `
      <g transform="translate(${140 + shift} 64)">
        ${[0, 1, 2, 3].map((i) => `
          <g transform="translate(${i * 118} ${i % 2 ? 36 : 0})">
            <rect x="12" y="52" width="78" height="286" rx="35" fill="${i % 2 ? highlight : accent}" stroke="${deep}" stroke-width="8"/>
            <rect x="31" y="18" width="40" height="42" rx="10" fill="${deep}" opacity="0.82"/>
            <path d="M22 132h58M22 238h58" stroke="#FFFFFF" stroke-width="10" opacity="0.38"/>
          </g>`).join("")}
        <ellipse cx="236" cy="375" rx="278" ry="31" fill="${deep}" opacity="0.14"/>
      </g>`,
    pellets: `
      <g transform="translate(${94 + shift} 114)">
        <rect x="24" y="20" width="230" height="292" rx="28" fill="#FFFFFF" stroke="${deep}" stroke-width="9" opacity="0.92"/>
        <path d="M49 198c52-35 103 27 180-10v88c0 21-17 38-38 38H87c-21 0-38-17-38-38z" fill="${accent}" opacity="0.56"/>
        <g transform="translate(330 88)">
          <ellipse cx="146" cy="210" rx="180" ry="54" fill="${deep}" opacity="0.13"/>
          ${Array.from({ length: 42 }, (_, i) => `<ellipse cx="${18 + ((i * 41 + variant * 13) % 260)}" cy="${122 + ((i * 23) % 128)}" rx="${11 + (i % 5)}" ry="${7 + (i % 4)}" fill="${i % 3 ? accent : highlight}" opacity="0.78" transform="rotate(${(i * 23) % 180} ${18 + ((i * 41) % 260)} ${122 + ((i * 23) % 128)})"/>`).join("")}
        </g>
      </g>`,
    bottles: `
      <g transform="translate(${120 + shift} 70)">
        ${[0, 1, 2].map((i) => `
          <g transform="translate(${i * 155} ${i === 1 ? 38 : 0})">
            <rect x="54" y="18" width="58" height="62" rx="13" fill="${deep}" opacity="0.82"/>
            <path d="M34 80h98l23 268c3 32-22 59-54 59H65c-32 0-57-27-54-59z" fill="#FFFFFF" stroke="${deep}" stroke-width="8" opacity="0.88"/>
            <path d="M24 230c36-28 73 18 122-9l11 119c3 25-17 47-43 47H53c-26 0-46-22-43-47z" fill="${i % 2 ? highlight : accent}" opacity="0.72"/>
            <circle cx="64" cy="204" r="13" fill="${accent}" opacity="0.5"/><circle cx="100" cy="190" r="9" fill="${highlight}" opacity="0.6"/>
          </g>`).join("")}
      </g>`,
    crystals: `
      <g transform="translate(${90 + shift} 86)">
        <rect x="22" y="18" width="230" height="312" rx="30" fill="#FFFFFF" stroke="${deep}" stroke-width="9" opacity="0.86"/>
        <path d="M50 238c47-28 100 18 174-13v78c0 16-13 29-29 29H79c-16 0-29-13-29-29z" fill="${accent}" opacity="0.5"/>
        <g transform="translate(342 60)">
          ${Array.from({ length: 18 }, (_, i) => {
            const x = 10 + ((i * 47 + variant * 17) % 300);
            const y = 84 + ((i * 29) % 190);
            const s = 18 + (i % 6) * 4;
            return `<path d="M${x} ${y - s} L${x + s} ${y} L${x} ${y + s} L${x - s} ${y}Z" fill="${i % 2 ? highlight : accent}" opacity="0.78" stroke="${deep}" stroke-width="3"/>`;
          }).join("")}
          <ellipse cx="166" cy="310" rx="178" ry="34" fill="${deep}" opacity="0.12"/>
        </g>
      </g>`,
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img" aria-label="${seed.replace(/"/g, "&quot;")}">
    <defs>
      <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0v44" fill="none" stroke="${deep}" stroke-width="1.5"/></pattern>
      <filter id="soft"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="${deep}" flood-opacity="0.18"/></filter>
    </defs>
    ${common}
    <g filter="url(#soft)">${visuals[type]}</g>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Get the best image for a product.
 * Priority: uploaded URL → known product file → unique deterministic product visual.
 */
export function getProductImage(
  imageUrl: string | null,
  category: string,
  seed?: string | null,
): string {
  if (imageUrl && imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl && fileMap[imageUrl]) return fileMap[imageUrl];
  const key = (seed && seed.length > 0) ? seed : category || "product";
  const productAsset = pickProductAsset(key);
  if (productAsset && (!imageUrl || genericCategoryFiles.has(imageUrl))) return productAsset;

  // Category placeholders should not repeat across cards; generate a unique
  // chemical product scene from the product name and category instead.
  const key = (seed && seed.length > 0) ? seed : category || "product";
  return productVisualFor(key, category);
}

/**
 * No filter when we already serve a unique image per product. Keep a stable
 * signature so callers that pass a style prop don't break.
 */
export function getProductImageStyle(
  _seed: string | null | undefined,
  _imageUrl?: string | null,
): React.CSSProperties {
  return {};
}

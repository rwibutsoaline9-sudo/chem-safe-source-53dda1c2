import type React from "react";
import productUrea from "@/assets/product-urea.jpg";
import productSodiumCyanide from "@/assets/product-sodium-cyanide.jpg";
import productCausticSoda from "@/assets/product-caustic-soda.jpg";

// Product-level assets are okay to reuse only for their exact chemicals. Generic
// placeholders and old stock-photo URLs are replaced with product-specific SVGs
// so the catalog grid no longer shows repeated/suspicious images.
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

function isGenericImageUrl(imageUrl: string | null): boolean {
  if (!imageUrl) return false;
  return genericCategoryFiles.has(imageUrl) || imageUrl.includes("images.unsplash.com/");
}

const exactProductAssets: Array<[RegExp, string]> = [
  [/^urea\b|urea technical grade/i, productUrea],
  [/^sodium cyanide$/i, productSodiumCyanide],
  [/caustic soda flakes|sodium hydroxide pellets/i, productCausticSoda],
];

const palettes = [
  { bg: "#EAF9F7", surface: "#FFFFFF", accent: "#0F766E", deep: "#134E4A", highlight: "#F59E0B" },
  { bg: "#F7F3EA", surface: "#FFFFFF", accent: "#B45309", deep: "#1F2937", highlight: "#0891B2" },
  { bg: "#EEF6FF", surface: "#FFFFFF", accent: "#2563EB", deep: "#1E3A8A", highlight: "#F97316" },
  { bg: "#F1F8E9", surface: "#FFFFFF", accent: "#65A30D", deep: "#365314", highlight: "#0284C7" },
  { bg: "#FFF1F2", surface: "#FFFFFF", accent: "#E11D48", deep: "#881337", highlight: "#14B8A6" },
  { bg: "#F5F7FA", surface: "#FFFFFF", accent: "#475569", deep: "#0F172A", highlight: "#06B6D4" },
  { bg: "#FEFCE8", surface: "#FFFFFF", accent: "#CA8A04", deep: "#713F12", highlight: "#16A34A" },
  { bg: "#F0FDFA", surface: "#FFFFFF", accent: "#0D9488", deep: "#134E4A", highlight: "#DC2626" },
  { bg: "#F8FAFC", surface: "#FFFFFF", accent: "#64748B", deep: "#334155", highlight: "#22C55E" },
  { bg: "#EFF6FF", surface: "#FFFFFF", accent: "#1D4ED8", deep: "#172554", highlight: "#FACC15" },
  { bg: "#FDF2F8", surface: "#FFFFFF", accent: "#DB2777", deep: "#831843", highlight: "#0EA5E9" },
  { bg: "#ECFDF5", surface: "#FFFFFF", accent: "#059669", deep: "#064E3B", highlight: "#EA580C" },
];

type SceneType =
  | "toxic-vault"
  | "aromatic-reactor"
  | "alkali-flakes"
  | "fertilizer-bags"
  | "acid-ibc"
  | "amine-tank"
  | "corrosive-drums"
  | "peroxide-cans"
  | "laboratory-salts"
  | "carbonate-sacks"
  | "metal-crystals"
  | "oxide-powder"
  | "boron-boxes"
  | "preservative-bottles"
  | "organic-acid-trays"
  | "solvent-drums"
  | "alcohol-bottles"
  | "glycol-ibc"
  | "compressed-gas"
  | "surfactant-foam"
  | "polymer-pellets"
  | "resin-pails"
  | "lab-flasks"
  | "process-plant";

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickProductAsset(seed: string): string | null {
  const match = exactProductAssets.find(([pattern]) => pattern.test(seed));
  return match?.[1] ?? null;
}

function initials(seed: string): string {
  const words = seed.replace(/\([^)]*\)/g, "").split(/\s+|-/).filter(Boolean);
  return (words[0]?.[0] ?? "C").toUpperCase() + (words[1]?.[0] ?? words[0]?.[1] ?? "P").toUpperCase();
}

function sceneTypeFor(seed: string, category: string): SceneType {
  const value = `${seed} ${category}`.toLowerCase();
  if (/cyanide|dichromate|chromate|fluoride|bifluoride|carbon monoxide|chlorine/.test(value)) return "toxic-vault";
  if (/phenyl|benzene|toluene|xylene|phenol|cresol|aromatic/.test(value)) return "aromatic-reactor";
  if (/caustic|hydroxide|alkali|flake|pellet/.test(value)) return "alkali-flakes";
  if (/fertilizer|nitrate|potassium chloride|ammonium sulfate|urea/.test(value)) return "fertilizer-bags";
  if (/phosphoric|hydrochloric|sulfuric|nitric acid|acetic acid|formic acid/.test(value)) return "acid-ibc";
  if (/methylamine|ammonia|amine/.test(value)) return "amine-tank";
  if (/hypochlorite|chlorite|chlorate|corrosive/.test(value)) return "corrosive-drums";
  if (/peroxide|permanganate/.test(value)) return "peroxide-cans";
  if (/carbonate|bicarbonate|soda ash|calcium carbonate/.test(value)) return "carbonate-sacks";
  if (/sulfate|sulfite|thiosulfate|chloride|bromide|iodide|acetate|salt/.test(value)) return "laboratory-salts";
  if (/copper|nickel|zinc|ferric|iron|aluminum|manganese|metal/.test(value)) return "metal-crystals";
  if (/oxide|titanium dioxide|quicklime|lime/.test(value)) return "oxide-powder";
  if (/boric|borax|borate/.test(value)) return "boron-boxes";
  if (/benzoate|sorbate|preservative|food/.test(value)) return "preservative-bottles";
  if (/citric|lactic|oxalic|tartaric|maleic|fumaric|succinic|benzoic/.test(value)) return "organic-acid-trays";
  if (/acetone|dmf|dmso|acetonitrile|chloroform|dichloromethane|carbon tetrachloride|acetate|solvent|cyclohexane/.test(value)) return "solvent-drums";
  if (/ethanol|alcohol|methanol|butanol|ipa|isopropyl/.test(value)) return "alcohol-bottles";
  if (/glycol|glycerin|glycerol|peg/.test(value)) return "glycol-ibc";
  if (/gas|oxygen|argon|helium|nitrogen|hydrogen|dioxide|monoxide|sulfur dioxide|nitric oxide/.test(value)) return "compressed-gas";
  if (/surfactant|sulfate \(sls\)|sulfonate|ethoxylate|tween|soap|detergent/.test(value)) return "surfactant-foam";
  if (/poly|pvc|polystyrene|polyethylene|polypropylene|granules|plastic/.test(value)) return "polymer-pellets";
  if (/resin|epoxy/.test(value)) return "resin-pails";
  return hashString(value) % 2 === 0 ? "lab-flasks" : "process-plant";
}

function dots(hash: number, accent: string, highlight: string, deep: string, count = 20): string {
  return Array.from({ length: count }, (_, i) => {
    const x = 34 + ((hash >>> (i % 12)) + i * 53) % 640;
    const y = 46 + ((hash >>> ((i + 5) % 12)) + i * 31) % 350;
    const r = 4 + ((hash + i) % 9);
    const fill = i % 3 === 0 ? highlight : i % 3 === 1 ? accent : deep;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="0.18"/>`;
  }).join("");
}

function productVisualFor(seed: string, category: string): string {
  const key = `${seed || "industrial chemical"}-${category || "catalog"}`;
  const hash = hashString(key);
  const palette = palettes[hash % palettes.length];
  const type = sceneTypeFor(seed, category);
  const mark = initials(seed);
  const flip = hash % 2 === 0 ? 1 : -1;
  const shift = (hash % 46) - 23;
  const rotate = (hash % 10) - 5;
  const band = 78 + (hash % 72);
  const fillOpacity = 0.58 + ((hash % 5) * 0.055);

  const base = `
    <rect width="800" height="520" fill="${palette.bg}"/>
    <path d="M0 ${365 + (hash % 34)} C138 ${318 + (hash % 42)} 236 ${450 - (hash % 30)} 384 ${382 + (hash % 18)} S643 ${314 + (hash % 24)} 800 ${356 + (hash % 52)} V520 H0Z" fill="${palette.deep}" opacity="0.08"/>
    <circle cx="${98 + shift}" cy="${94 + (hash % 22)}" r="${112 + (hash % 40)}" fill="${palette.accent}" opacity="0.13"/>
    <circle cx="${684 - shift}" cy="${410 - (hash % 26)}" r="${128 + (hash % 48)}" fill="${palette.highlight}" opacity="0.16"/>
    ${dots(hash, palette.accent, palette.highlight, palette.deep, 18)}
  `;

  const scenes: Record<SceneType, string> = {
    "toxic-vault": `
      <g transform="translate(${118 + shift} 78) rotate(${rotate})">
        <rect x="54" y="82" width="292" height="252" rx="24" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="10"/>
        <path d="M82 130h236v146H82z" fill="${palette.accent}" opacity="${fillOpacity}"/>
        <path d="M132 218l68-118 68 118z" fill="${palette.highlight}" stroke="${palette.deep}" stroke-width="8"/>
        <circle cx="200" cy="170" r="22" fill="${palette.deep}"/><path d="M166 222h68M178 246h44" stroke="${palette.deep}" stroke-width="14" stroke-linecap="round"/>
        <g transform="translate(370 42)"><rect x="0" y="0" width="164" height="318" rx="24" fill="${palette.deep}" opacity="0.9"/><rect x="26" y="42" width="112" height="72" rx="12" fill="${palette.highlight}"/><path d="M38 174h88M38 222h88" stroke="${palette.surface}" stroke-width="12" opacity="0.5"/></g>
      </g>`,
    "aromatic-reactor": `
      <g transform="translate(${98 + shift} 70) scale(${flip} 1) translate(${flip < 0 ? -560 : 0} 0)">
        <rect x="52" y="92" width="210" height="244" rx="38" fill="${palette.accent}" opacity="0.9" stroke="${palette.deep}" stroke-width="9"/>
        <ellipse cx="157" cy="92" rx="105" ry="38" fill="${palette.highlight}"/><path d="M74 170h166M74 252h166" stroke="${palette.surface}" stroke-width="12" opacity="0.42"/>
        <g transform="translate(332 70)" stroke="${palette.deep}" stroke-width="12" fill="none"><polygon points="92,0 184,52 184,158 92,210 0,158 0,52"/><polygon points="310,74 402,126 402,232 310,284 218,232 218,126"/><path d="M184 106h34"/></g>
      </g>`,
    "alkali-flakes": `
      <g transform="translate(${96 + shift} 82)">
        <path d="M78 84h206l30 256H44z" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="9"/><path d="M104 48h150l26 58H78z" fill="${palette.accent}"/>
        <rect x="94" y="168" width="172" height="62" rx="12" fill="${palette.highlight}" opacity="0.78"/>
        <g transform="translate(360 88)">${Array.from({ length: 34 }, (_, i) => `<path d="M${(i * 37) % 260} ${48 + ((i * 29) % 198)} l${14 + (i % 8)} ${8 + (i % 6)} l-${10 + (i % 7)} ${13 + (i % 5)} l-${13 + (i % 8)} -9z" fill="${i % 2 ? palette.accent : palette.highlight}" opacity="0.8"/>`).join("")}<ellipse cx="142" cy="284" rx="174" ry="32" fill="${palette.deep}" opacity="0.12"/></g>
      </g>`,
    "fertilizer-bags": `
      <g transform="translate(${70 + shift} 104)">
        ${[0, 1, 2].map((i) => `<g transform="translate(${i * 170} ${i === 1 ? -36 : 20})"><path d="M42 64h146l28 250H12z" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="8"/><path d="M64 34h100l25 54H38z" fill="${i % 2 ? palette.highlight : palette.accent}"/><path d="M42 ${band}h142" stroke="${i % 2 ? palette.accent : palette.highlight}" stroke-width="18" opacity="0.55"/>${Array.from({ length: 8 }, (_, n) => `<circle cx="${54 + ((n * 23 + hash) % 94)}" cy="${202 + ((n * 17) % 64)}" r="${5 + (n % 4)}" fill="${palette.accent}" opacity="0.45"/>`).join("")}</g>`).join("")}
      </g>`,
    "acid-ibc": `
      <g transform="translate(${88 + shift} 72)">
        <rect x="42" y="58" width="300" height="306" rx="26" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="10"/><path d="M70 276c72-48 157 28 244-16v78H70z" fill="${palette.accent}" opacity="0.68"/>
        <path d="M70 118h244M70 178h244M126 58v306M192 58v306M258 58v306" stroke="${palette.deep}" stroke-width="7" opacity="0.5"/>
        <g transform="translate(402 110)"><rect x="0" y="34" width="148" height="214" rx="24" fill="${palette.highlight}" stroke="${palette.deep}" stroke-width="8"/><rect x="34" y="0" width="82" height="48" rx="14" fill="${palette.deep}"/><path d="M30 116h88M30 166h88" stroke="${palette.surface}" stroke-width="11" opacity="0.45"/></g>
      </g>`,
    "amine-tank": `
      <g transform="translate(${96 + shift} 66)">
        <ellipse cx="220" cy="96" rx="154" ry="54" fill="${palette.highlight}"/><path d="M66 96v230c0 30 69 54 154 54s154-24 154-54V96" fill="${palette.accent}" opacity="0.88" stroke="${palette.deep}" stroke-width="9"/>
        <path d="M82 166h276M82 250h276" stroke="${palette.surface}" stroke-width="14" opacity="0.36"/><path d="M430 98h94v246h-94z" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="8"/><path d="M452 142h50M452 196h50M452 250h50" stroke="${palette.highlight}" stroke-width="13"/>
      </g>`,
    "corrosive-drums": `
      <g transform="translate(${92 + shift} 86)">
        ${[0, 1, 2].map((i) => `<g transform="translate(${i * 155} ${i === 1 ? -28 : 18})"><ellipse cx="80" cy="52" rx="76" ry="30" fill="${i % 2 ? palette.highlight : palette.accent}"/><path d="M4 52v230c0 17 34 30 76 30s76-13 76-30V52" fill="${i % 2 ? palette.highlight : palette.accent}" opacity="0.88" stroke="${palette.deep}" stroke-width="8"/><path d="M20 122h120M20 210h120" stroke="${palette.surface}" stroke-width="11" opacity="0.42"/><path d="M54 166h52l-26 45z" fill="${palette.deep}" opacity="0.75"/></g>`).join("")}
      </g>`,
    "peroxide-cans": `
      <g transform="translate(${116 + shift} 70)">
        ${[0, 1, 2].map((i) => `<g transform="translate(${i * 148} ${i === 1 ? 34 : 0})"><rect x="26" y="64" width="112" height="274" rx="24" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="8"/><rect x="48" y="24" width="70" height="54" rx="14" fill="${i % 2 ? palette.accent : palette.highlight}"/><path d="M44 222c31-20 56 17 82-8v92H44z" fill="${i % 2 ? palette.highlight : palette.accent}" opacity="0.7"/><circle cx="82" cy="154" r="36" fill="${palette.deep}" opacity="0.16"/><path d="M82 123v62M51 154h62" stroke="${palette.deep}" stroke-width="10" stroke-linecap="round"/></g>`).join("")}
      </g>`,
    "laboratory-salts": `
      <g transform="translate(${86 + shift} 82)">
        <rect x="42" y="42" width="198" height="306" rx="26" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="9"/><path d="M70 234c42-28 95 22 142-10v86H70z" fill="${palette.accent}" opacity="0.5"/>
        <g transform="translate(300 54)">${Array.from({ length: 28 }, (_, i) => `<rect x="${(i * 43) % 270}" y="${44 + ((i * 31) % 230)}" width="${16 + (i % 5) * 3}" height="${16 + (i % 5) * 3}" rx="4" fill="${i % 2 ? palette.highlight : palette.accent}" opacity="0.78" transform="rotate(${(i * 19) % 90} ${(i * 43) % 270} ${44 + ((i * 31) % 230)})"/>`).join("")}<ellipse cx="146" cy="318" rx="170" ry="30" fill="${palette.deep}" opacity="0.13"/></g>
      </g>`,
    "carbonate-sacks": `
      <g transform="translate(${78 + shift} 108)">
        <path d="M58 58h180l30 258H26z" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="9"/><path d="M82 28h130l26 52H56z" fill="${palette.accent}"/><path d="M76 222c46-22 84 18 136-7v72H76z" fill="${palette.highlight}" opacity="0.45"/>
        <g transform="translate(330 56)"><ellipse cx="132" cy="226" rx="160" ry="62" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="8"/><path d="M0 210c78-56 202 36 292-24" stroke="${palette.accent}" stroke-width="34" opacity="0.54"/><path d="M198 26l88 76-100 48" fill="none" stroke="${palette.deep}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></g>
      </g>`,
    "metal-crystals": `
      <g transform="translate(${70 + shift} 78)">
        <rect x="40" y="52" width="190" height="298" rx="26" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="9"/><path d="M66 246c48-30 88 18 136-10v78H66z" fill="${palette.accent}" opacity="0.48"/>
        <g transform="translate(300 32)">${Array.from({ length: 16 }, (_, i) => { const x = 12 + ((i * 59 + hash) % 300); const y = 88 + ((i * 37) % 230); const s = 20 + (i % 5) * 7; return `<path d="M${x} ${y - s} L${x + s} ${y} L${x + s / 2} ${y + s} L${x - s / 2} ${y + s} L${x - s} ${y}Z" fill="${i % 2 ? palette.highlight : palette.accent}" stroke="${palette.deep}" stroke-width="4" opacity="0.78"/>`; }).join("")}<ellipse cx="168" cy="352" rx="184" ry="30" fill="${palette.deep}" opacity="0.12"/></g>
      </g>`,
    "oxide-powder": `
      <g transform="translate(${96 + shift} 84)">
        <rect x="34" y="34" width="218" height="306" rx="28" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="9"/><circle cx="143" cy="186" r="76" fill="${palette.accent}" opacity="0.22"/><path d="M88 280h110" stroke="${palette.highlight}" stroke-width="24" opacity="0.68"/>
        <g transform="translate(330 92)"><ellipse cx="150" cy="202" rx="178" ry="58" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="8"/><path d="M2 194c80-66 218 42 298-30" stroke="${palette.accent}" stroke-width="42" opacity="0.46"/>${Array.from({ length: 24 }, (_, i) => `<circle cx="${34 + ((i * 41) % 240)}" cy="${80 + ((i * 23) % 120)}" r="${3 + (i % 7)}" fill="${palette.deep}" opacity="0.18"/>`).join("")}</g>
      </g>`,
    "boron-boxes": `
      <g transform="translate(${92 + shift} 100)">
        ${[0, 1, 2].map((i) => `<g transform="translate(${i * 155} ${i === 1 ? -36 : 24})"><path d="M22 78l110-44 110 44v188l-110 44-110-44z" fill="${i % 2 ? palette.highlight : palette.accent}" opacity="0.78" stroke="${palette.deep}" stroke-width="8"/><path d="M22 78l110 44 110-44M132 122v188" stroke="${palette.surface}" stroke-width="8" opacity="0.45"/><circle cx="132" cy="206" r="38" fill="${palette.surface}" opacity="0.32"/></g>`).join("")}
      </g>`,
    "preservative-bottles": `
      <g transform="translate(${112 + shift} 76)">
        ${[0, 1, 2, 3].map((i) => `<g transform="translate(${i * 116} ${i % 2 ? 42 : 0})"><rect x="38" y="18" width="54" height="54" rx="12" fill="${palette.deep}"/><path d="M20 72h90l20 260c3 30-20 56-50 56H50c-30 0-53-26-50-56z" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="7"/><path d="M24 224h102v70H24z" fill="${i % 2 ? palette.highlight : palette.accent}" opacity="0.68"/></g>`).join("")}
      </g>`,
    "organic-acid-trays": `
      <g transform="translate(${80 + shift} 92)">
        <rect x="46" y="48" width="246" height="286" rx="30" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="9"/><path d="M86 154h166M86 224h166" stroke="${palette.accent}" stroke-width="16" opacity="0.45"/>
        <g transform="translate(356 70)"><rect x="0" y="160" width="266" height="78" rx="24" fill="${palette.deep}" opacity="0.18"/>${Array.from({ length: 18 }, (_, i) => `<circle cx="${28 + ((i * 37) % 208)}" cy="${46 + ((i * 29) % 148)}" r="${13 + (i % 5) * 3}" fill="${i % 2 ? palette.highlight : palette.accent}" opacity="0.82"/>`).join("")}</g>
      </g>`,
    "solvent-drums": `
      <g transform="translate(${80 + shift} 74)">
        <g><ellipse cx="150" cy="72" rx="118" ry="42" fill="${palette.accent}"/><path d="M32 72v258c0 23 53 42 118 42s118-19 118-42V72" fill="${palette.accent}" opacity="0.88" stroke="${palette.deep}" stroke-width="9"/><rect x="76" y="156" width="148" height="74" rx="14" fill="${palette.surface}" opacity="0.8"/></g>
        <g transform="translate(340 48) rotate(${rotate})"><ellipse cx="104" cy="62" rx="100" ry="36" fill="${palette.highlight}"/><path d="M4 62v226c0 20 45 36 100 36s100-16 100-36V62" fill="${palette.highlight}" opacity="0.88" stroke="${palette.deep}" stroke-width="8"/><path d="M30 138h148M30 216h148" stroke="${palette.surface}" stroke-width="12" opacity="0.38"/></g>
      </g>`,
    "alcohol-bottles": `
      <g transform="translate(${112 + shift} 66)">
        ${[0, 1, 2].map((i) => `<g transform="translate(${i * 154} ${i === 1 ? 44 : 0})"><rect x="58" y="12" width="52" height="72" rx="14" fill="${palette.deep}"/><path d="M34 84h100l25 270c3 32-22 60-55 60H64c-33 0-58-28-55-60z" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="8"/><path d="M28 250c38-30 74 18 126-10l8 100c2 25-18 46-43 46H50c-25 0-45-21-43-46z" fill="${i % 2 ? palette.highlight : palette.accent}" opacity="0.64"/></g>`).join("")}
      </g>`,
    "glycol-ibc": `
      <g transform="translate(${92 + shift} 70)">
        <rect x="48" y="60" width="304" height="314" rx="28" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="10"/><path d="M78 248c76-38 160 24 244-12v92H78z" fill="${palette.accent}" opacity="0.55"/><path d="M78 122h244M78 188h244M142 60v314M216 60v314M290 60v314" stroke="${palette.deep}" stroke-width="7" opacity="0.45"/>
        <g transform="translate(420 78)"><circle cx="82" cy="90" r="58" fill="${palette.highlight}" opacity="0.76"/><circle cx="112" cy="192" r="78" fill="${palette.accent}" opacity="0.52"/><circle cx="58" cy="260" r="42" fill="${palette.deep}" opacity="0.2"/></g>
      </g>`,
    "compressed-gas": `
      <g transform="translate(${118 + shift} 60)">
        ${[0, 1, 2, 3].map((i) => `<g transform="translate(${i * 118} ${i % 2 ? 42 : 0})"><rect x="18" y="58" width="78" height="306" rx="38" fill="${i % 2 ? palette.highlight : palette.accent}" stroke="${palette.deep}" stroke-width="8"/><rect x="36" y="18" width="42" height="48" rx="12" fill="${palette.deep}"/><path d="M30 138h54M30 246h54" stroke="${palette.surface}" stroke-width="10" opacity="0.38"/></g>`).join("")}
        <ellipse cx="232" cy="406" rx="276" ry="32" fill="${palette.deep}" opacity="0.13"/>
      </g>`,
    "surfactant-foam": `
      <g transform="translate(${86 + shift} 70)">
        <rect x="42" y="74" width="172" height="282" rx="34" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="9"/><path d="M64 238c40-28 92 18 128-10v92H64z" fill="${palette.accent}" opacity="0.62"/><circle cx="92" cy="180" r="20" fill="${palette.highlight}" opacity="0.7"/><circle cx="146" cy="154" r="16" fill="${palette.accent}" opacity="0.55"/>
        <g transform="translate(292 56)">${Array.from({ length: 22 }, (_, i) => `<circle cx="${34 + ((i * 47) % 300)}" cy="${38 + ((i * 31) % 250)}" r="${12 + (i % 6) * 5}" fill="${i % 2 ? palette.highlight : palette.surface}" stroke="${palette.accent}" stroke-width="4" opacity="0.78"/>`).join("")}</g>
      </g>`,
    "polymer-pellets": `
      <g transform="translate(${88 + shift} 90)">
        <rect x="36" y="32" width="218" height="300" rx="30" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="9"/><path d="M64 208c48-33 106 24 162-12v88H64z" fill="${palette.accent}" opacity="0.48"/>
        <g transform="translate(318 58)">${Array.from({ length: 48 }, (_, i) => `<ellipse cx="${12 + ((i * 41 + hash) % 294)}" cy="${48 + ((i * 23) % 224)}" rx="${10 + (i % 5)}" ry="${7 + (i % 4)}" fill="${i % 3 ? palette.accent : palette.highlight}" opacity="0.75" transform="rotate(${(i * 23) % 180} ${12 + ((i * 41) % 294)} ${48 + ((i * 23) % 224)})"/>`).join("")}<ellipse cx="154" cy="310" rx="184" ry="32" fill="${palette.deep}" opacity="0.12"/></g>
      </g>`,
    "resin-pails": `
      <g transform="translate(${94 + shift} 84)">
        ${[0, 1, 2].map((i) => `<g transform="translate(${i * 170} ${i === 1 ? -18 : 36})"><path d="M28 76h152l-22 226c-3 27-26 48-53 48H83c-27 0-50-21-53-48z" fill="${i % 2 ? palette.highlight : palette.accent}" opacity="0.86" stroke="${palette.deep}" stroke-width="8"/><ellipse cx="104" cy="76" rx="76" ry="28" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="8"/><path d="M52 160h104" stroke="${palette.surface}" stroke-width="15" opacity="0.45"/></g>`).join("")}
      </g>`,
    "lab-flasks": `
      <g transform="translate(${112 + shift} 54)">
        <path d="M144 42v126L70 342c-14 34 9 72 46 72h214c37 0 60-38 46-72l-74-174V42" fill="${palette.surface}" opacity="0.82" stroke="${palette.deep}" stroke-width="9"/><path d="M106 300c62-48 152 26 236-20l34 82c9 22-7 47-32 47H102c-25 0-41-25-32-47z" fill="${palette.accent}" opacity="0.68"/><rect x="126" y="22" width="194" height="38" rx="16" fill="${palette.deep}"/>
        <g transform="translate(414 52)"><rect x="68" y="42" width="70" height="216" rx="30" fill="${palette.surface}" opacity="0.82" stroke="${palette.deep}" stroke-width="8"/><path d="M72 168c28-18 42 18 62 0v88H72z" fill="${palette.highlight}" opacity="0.74"/><rect x="50" y="254" width="110" height="34" rx="17" fill="${palette.deep}"/></g>
      </g>`,
    "process-plant": `
      <g transform="translate(${86 + shift} 92)">
        <rect x="38" y="92" width="138" height="226" rx="18" fill="${palette.accent}" opacity="0.9" stroke="${palette.deep}" stroke-width="8"/><rect x="238" y="46" width="128" height="272" rx="18" fill="${palette.surface}" stroke="${palette.deep}" stroke-width="8"/><rect x="430" y="128" width="116" height="190" rx="18" fill="${palette.highlight}" opacity="0.86" stroke="${palette.deep}" stroke-width="8"/><path d="M176 174h62M366 192h64M102 92V34h366v94" stroke="${palette.deep}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M70 168h74M270 126h64M454 210h68" stroke="${palette.surface}" stroke-width="12" opacity="0.45"/></g>
      </g>`,
  };

  const label = `
    <g transform="translate(620 48)">
      <rect x="0" y="0" width="110" height="72" rx="18" fill="${palette.surface}" opacity="0.88" stroke="${palette.deep}" stroke-width="5"/>
      <text x="55" y="47" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="800" fill="${palette.deep}">${mark}</text>
    </g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img" aria-label="${seed.replace(/"/g, "&quot;")}">
    <defs><filter id="soft"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="${palette.deep}" flood-opacity="0.18"/></filter></defs>
    ${base}
    <g filter="url(#soft)">${scenes[type]}</g>
    ${label}
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Get the best image for a product.
 * Priority: real uploaded URL → exact product asset → unique deterministic visual.
 */
export function getProductImage(
  imageUrl: string | null,
  category: string,
  seed?: string | null,
): string {
  const key = seed && seed.trim().length > 0 ? seed.trim() : category || "product";

  if (imageUrl && imageUrl.startsWith("http") && !isGenericImageUrl(imageUrl)) return imageUrl;
  if (imageUrl && fileMap[imageUrl]) return fileMap[imageUrl];

  const productAsset = pickProductAsset(key);
  if (productAsset) return productAsset;

  return productVisualFor(key, category);
}

export function getProductImageStyle(
  _seed: string | null | undefined,
  _imageUrl?: string | null,
): React.CSSProperties {
  return {};
}
import type React from "react";
import productUrea from "@/assets/product-urea.jpg";
import productSodiumCyanide from "@/assets/product-sodium-cyanide.jpg";
import productCausticSoda from "@/assets/product-caustic-soda.jpg";
import sceneDrums from "@/assets/scene-drums.jpg";
import scenePowder from "@/assets/scene-powder.jpg";
import sceneCrystals from "@/assets/scene-crystals.jpg";
import sceneGas from "@/assets/scene-gas.jpg";
import sceneHazard from "@/assets/scene-hazard.jpg";
import scenePlant from "@/assets/scene-plant.jpg";
import sceneLab from "@/assets/scene-lab.jpg";
import scenePellets from "@/assets/scene-pellets.jpg";
import sceneTotes from "@/assets/scene-totes.jpg";
import scenePigment from "@/assets/scene-pigment.jpg";
import sceneAcid from "@/assets/scene-acid.jpg";
import sceneSacks from "@/assets/scene-sacks.jpg";

// Real product photos. Uploaded images are used verbatim. Otherwise we serve a
// curated, locally hosted photograph matched to the chemical's scene type
// (drums for solvents, sacks for fertilizers, cylinders for gases, …) and
// selected with a deterministic hash of the product name so every SKU keeps a
// stable, context-appropriate picture.

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

type SceneType =
  | "toxic"
  | "aromatic"
  | "alkali"
  | "fertilizer"
  | "acid"
  | "amine"
  | "corrosive"
  | "peroxide"
  | "salts"
  | "carbonate"
  | "metal"
  | "oxide"
  | "boron"
  | "preservative"
  | "organic-acid"
  | "solvent"
  | "alcohol"
  | "glycol"
  | "gas"
  | "surfactant"
  | "polymer"
  | "resin"
  | "lab"
  | "plant";

// Curated local photo sets per scene. Several candidates per scene so similar
// chemicals still get visually distinct cards.
const scenePhotos: Record<SceneType, string[]> = {
  toxic: [sceneHazard, sceneDrums],
  aromatic: [scenePlant, sceneDrums],
  alkali: [scenePowder, sceneCrystals],
  fertilizer: [sceneSacks, scenePowder],
  acid: [sceneAcid, sceneTotes],
  amine: [sceneTotes, scenePlant],
  corrosive: [sceneHazard, sceneTotes],
  peroxide: [sceneAcid, sceneLab],
  salts: [sceneCrystals, scenePowder],
  carbonate: [scenePowder, sceneSacks],
  metal: [scenePigment, sceneCrystals],
  oxide: [scenePigment, scenePowder],
  boron: [sceneCrystals, sceneSacks],
  preservative: [sceneLab, sceneAcid],
  "organic-acid": [sceneCrystals, sceneLab],
  solvent: [sceneDrums, sceneTotes],
  alcohol: [sceneAcid, sceneDrums],
  glycol: [sceneTotes, sceneDrums],
  gas: [sceneGas, scenePlant],
  surfactant: [sceneTotes, scenePowder],
  polymer: [scenePellets, sceneSacks],
  resin: [scenePellets, sceneDrums],
  lab: [sceneLab, sceneAcid],
  plant: [scenePlant, sceneGas],
};


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

function sceneTypeFor(seed: string, category: string): SceneType {
  const value = `${seed} ${category}`.toLowerCase();
  if (/cyanide|dichromate|chromate|fluoride|bifluoride|carbon monoxide|chlorine/.test(value)) return "toxic";
  if (/phenyl|benzene|toluene|xylene|phenol|cresol|aromatic/.test(value)) return "aromatic";
  if (/caustic|hydroxide|alkali|flake|pellet/.test(value)) return "alkali";
  if (/fertilizer|nitrate|potassium chloride|ammonium sulfate|urea/.test(value)) return "fertilizer";
  if (/phosphoric|hydrochloric|sulfuric|nitric acid|acetic acid|formic acid/.test(value)) return "acid";
  if (/methylamine|ammonia|amine/.test(value)) return "amine";
  if (/hypochlorite|chlorite|chlorate|corrosive/.test(value)) return "corrosive";
  if (/peroxide|permanganate/.test(value)) return "peroxide";
  if (/carbonate|bicarbonate|soda ash|calcium carbonate/.test(value)) return "carbonate";
  if (/sulfate|sulfite|thiosulfate|chloride|bromide|iodide|acetate|salt/.test(value)) return "salts";
  if (/copper|nickel|zinc|ferric|iron|aluminum|manganese|metal/.test(value)) return "metal";
  if (/oxide|titanium dioxide|quicklime|lime/.test(value)) return "oxide";
  if (/boric|borax|borate/.test(value)) return "boron";
  if (/benzoate|sorbate|preservative|food/.test(value)) return "preservative";
  if (/citric|lactic|oxalic|tartaric|maleic|fumaric|succinic|benzoic/.test(value)) return "organic-acid";
  if (/acetone|dmf|dmso|acetonitrile|chloroform|dichloromethane|carbon tetrachloride|acetate|solvent|cyclohexane/.test(value)) return "solvent";
  if (/ethanol|alcohol|methanol|butanol|ipa|isopropyl/.test(value)) return "alcohol";
  if (/glycol|glycerin|glycerol|peg/.test(value)) return "glycol";
  if (/gas|oxygen|argon|helium|nitrogen|hydrogen|dioxide|monoxide|sulfur dioxide|nitric oxide/.test(value)) return "gas";
  if (/surfactant|sulfate \(sls\)|sulfonate|ethoxylate|tween|soap|detergent/.test(value)) return "surfactant";
  if (/poly|pvc|polystyrene|polyethylene|polypropylene|granules|plastic/.test(value)) return "polymer";
  if (/resin|epoxy/.test(value)) return "resin";
  return hashString(value) % 2 === 0 ? "lab" : "plant";
}

function realPhotoFor(seed: string, category: string): string {
  const key = `${seed || "industrial chemical"}|${category || "catalog"}`;
  const hash = hashString(key);
  const scene = sceneTypeFor(seed, category);
  const tags = sceneTags[scene];
  // `lock` guarantees the same photo is returned for the same seed every time,
  // and different seeds get different photos.
  return `https://loremflickr.com/800/520/${encodeURIComponent(tags)}/all?lock=${hash}`;
}

/**
 * Get the best image for a product.
 * Priority: real uploaded URL → exact product asset → unique real photo.
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

  return realPhotoFor(key, category);
}

export function getProductImageStyle(
  _seed: string | null | undefined,
  _imageUrl?: string | null,
): React.CSSProperties {
  return {};
}

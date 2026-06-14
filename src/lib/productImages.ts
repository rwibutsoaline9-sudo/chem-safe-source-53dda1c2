import categoryAcids from "@/assets/category-acids.jpg";
import categoryAlkalis from "@/assets/category-alkalis.jpg";
import categorySolvents from "@/assets/category-solvents.jpg";
import categorySalts from "@/assets/category-salts.jpg";
import categoryOrganics from "@/assets/category-organics.jpg";
import categoryGases from "@/assets/category-gases.jpg";
import categoryPolymers from "@/assets/category-polymers.jpg";
import categoryOxides from "@/assets/category-oxides.jpg";
import categorySurfactants from "@/assets/category-surfactants.jpg";
import categoryMetalSalts from "@/assets/category-metal-salts.jpg";
import productUrea from "@/assets/product-urea.jpg";
import productSodiumCyanide from "@/assets/product-sodium-cyanide.jpg";
import productCausticSoda from "@/assets/product-caustic-soda.jpg";

// Map known local asset filenames
const fileMap: Record<string, string> = {
  "product-urea.jpg": productUrea,
  "product-sodium-cyanide.jpg": productSodiumCyanide,
  "product-caustic-soda.jpg": productCausticSoda,
  "category-acids.jpg": categoryAcids,
  "category-alkalis.jpg": categoryAlkalis,
  "category-solvents.jpg": categorySolvents,
  "category-salts.jpg": categorySalts,
  "category-organics.jpg": categoryOrganics,
  "category-gases.jpg": categoryGases,
  "category-polymers.jpg": categoryPolymers,
  "category-oxides.jpg": categoryOxides,
  "category-surfactants.jpg": categorySurfactants,
  "category-metal-salts.jpg": categoryMetalSalts,
};

// Map DB categories to the best matching category image
const categoryImageMap: Record<string, string> = {
  "Inorganic Acid": categoryAcids,
  "Organic Acid": categoryAcids,
  "Industrial Chemical": categoryAlkalis,
  "Solvent": categorySolvents,
  "Inorganic Salt": categorySalts,
  "Organic Salt": categorySalts,
  "Fluoride Salt": categorySalts,
  "Fertilizer": categorySalts,
  "Organic Chemical": categoryOrganics,
  "Amine": categoryOrganics,
  "Chelating Agent": categoryOrganics,
  "Industrial Gas": categoryGases,
  "Polymer": categoryPolymers,
  "Metal Oxide": categoryOxides,
  "Inorganic Peroxide": categoryOxides,
  "Boron Compound": categoryOxides,
  "Surfactant": categorySurfactants,
  "Soap/Surfactant": categorySurfactants,
  "Metal Soap": categorySurfactants,
  "Metal soap": categorySurfactants,
  "Metal Salt": categoryMetalSalts,
  "Precious Metal Salt": categoryMetalSalts,
  "Metal Hydroxide": categoryAlkalis,
  "Phosphate": categorySalts,
};

/**
 * Get the best image for a product based on its image_url and category.
 */
export function getProductImage(imageUrl: string | null, category: string): string {
  // 1. If it's a full URL (from storage bucket), use directly
  if (imageUrl && imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // 2. If it's a known local filename
  if (imageUrl && fileMap[imageUrl]) {
    return fileMap[imageUrl];
  }

  // 3. Fall back to category-based image
  return categoryImageMap[category] || categorySalts;
}

/**
 * Deterministic CSS filter per product so shared category images don't look
 * identical across the catalog. Stable for a given product name.
 */
export function getProductImageStyle(
  seed: string | null | undefined,
  imageUrl?: string | null,
): React.CSSProperties {
  // If the product has its own uploaded image, leave it untouched.
  if (imageUrl && (imageUrl.startsWith("http") || fileMap[imageUrl])) {
    return {};
  }
  const s = (seed ?? "").toString();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const sat = 0.85 + ((h >> 9) % 30) / 100; // 0.85 - 1.14
  const bright = 0.92 + ((h >> 17) % 16) / 100; // 0.92 - 1.07
  return {
    filter: `hue-rotate(${hue}deg) saturate(${sat}) brightness(${bright})`,
  };
}

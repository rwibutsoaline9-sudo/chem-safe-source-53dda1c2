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

import type React from "react";
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

// Large pool of distinct chemistry / industrial / lab photos (Unsplash CDN).
// Each product without its own uploaded image gets a deterministic pick from
// this pool based on its name, so different SKUs render visibly different
// pictures instead of all sharing one category image.
const unsplashPool = [
  "photo-1532634922-8fe0b757fb13", // colorful lab flasks
  "photo-1554475901-4538ddfbccc2", // amber bottles
  "photo-1576086213369-97a306d36557", // lab glassware
  "photo-1582719471384-894fbb16e074", // pipette
  "photo-1581093588401-fbb62a02f120", // scientist hand
  "photo-1603126857599-f6e157fa2fe6", // beakers
  "photo-1567427017947-545c5f8d16ad", // microscope
  "photo-1530026405186-ed1f139313f8", // colorful liquids
  "photo-1614935151651-0bea6508db6b", // white powder
  "photo-1628177142898-93e36e4e3a50", // industrial drums
  "photo-1565008576549-57569a49371d", // blue crystals
  "photo-1606206522398-de3a3a4f63c4", // chemical plant
  "photo-1581093804475-577d72e38aa0", // gloved hands
  "photo-1582719508461-905c673771fd", // research lab
  "photo-1554475900-0a0350e3fc7b", // pharma bottles
  "photo-1614935151651-0bea6508db6b", // crystalline
  "photo-1532187863486-abf9dbad1b69", // industrial pipes
  "photo-1581094271901-8022df4466f9", // chemical analysis
  "photo-1604881991720-f91add269bed", // green liquid
  "photo-1611273426858-450d8e3c9fce", // sacks bulk
  "photo-1581093458791-9d09e44b1a96", // dropper
  "photo-1530026186672-2cd00ffc50fe", // green flask
  "photo-1573164574048-f968d7e1ebd9", // gas tanks
  "photo-1581093588401-22b3f4a14a7d", // safety
  "photo-1518152006812-edab29b069ac", // yellow powder
  "photo-1583912267550-d8e0e8d4f8b5", // amber liquid
  "photo-1565514020179-026b92b84bb6", // titration
  "photo-1606761568499-6d2451b23c66", // factory
  "photo-1532187643623-dbf2f7b9a5f8", // refinery
  "photo-1581094288338-2314dddb7ece", // microscope close
  "photo-1635070041078-e363dbe005cb", // molecular
  "photo-1532187863486-abf9dbad1b69", // pipes 2
  "photo-1622818425825-5e9c2c9be86d", // industrial container
  "photo-1581093196277-9f6e9b96cc99", // liquid test
  "photo-1603126857599-f6e157fa2fe6", // beakers 2
  "photo-1614935151651-0bea6508db6b", // powder
  "photo-1581093804475-577d72e38aa0", // chemical hand 2
  "photo-1599494549751-22ae6bca8f93", // refinery tank
  "photo-1581093588401-fbb62a02f120", // scientist
  "photo-1611273426858-450d8e3c9fce", // bulk sacks
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function poolImageFor(seed: string): string {
  const id = unsplashPool[hashString(seed) % unsplashPool.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
}

/**
 * Get the best image for a product.
 * Priority: uploaded URL → known local file → unique deterministic Unsplash pick.
 */
export function getProductImage(
  imageUrl: string | null,
  category: string,
  seed?: string | null,
): string {
  if (imageUrl && imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl && fileMap[imageUrl]) return fileMap[imageUrl];
  // Unique-per-product fallback so no two SKUs share the same picture.
  const key = (seed && seed.length > 0) ? seed : category || "product";
  return poolImageFor(key);
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

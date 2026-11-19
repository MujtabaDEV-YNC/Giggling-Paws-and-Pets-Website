export type PetFilter = "all" | "dogs" | "cats";

export type Product = {
  slug: string;
  name: string;
  description: string;
  price: string;
  pet: Exclude<PetFilter, "all">;
  url: string;
};

/**
 * Six products from pet-parade-products/product-catalog.md.
 * Images live in public/products/{storefront,lifestyle}/<slug>.webp
 * (generated from pet-parade-products/ by scripts/optimize-assets.mjs).
 */
export const products: Product[] = [
  {
    slug: "gpp-pet-bandana",
    name: "GPP Pet Bandana",
    description:
      "Polyester duck-fabric bandana with a one-sided print and a black adjustable collar with plastic buckle.",
    price: "$20.68",
    pet: "dogs",
    url: "https://gigglingpawsandpets.com/product/gpp-pet-bandana",
  },
  {
    slug: "very-important-pet-tag",
    name: "Very Important Pet Tag",
    description: "One-inch round tag in white-coated solid metal, with a metal clip.",
    price: "$20.00",
    pet: "dogs",
    url: "https://gigglingpawsandpets.com/product/very-important-pet-tag",
  },
  {
    slug: "pet-bowl",
    name: "Pet Bowl",
    description:
      "Glazed white ceramic bowl, 16 fl oz, 6 inches across and 2.25 inches tall, with a printed design.",
    price: "$23.64",
    pet: "cats",
    url: "https://gigglingpawsandpets.com/product/pet-bowl",
  },
  {
    slug: "a-kings-pet-bed",
    name: "A King's Pet Bed",
    description:
      "40 × 30-inch indoor pillow bed with printed fleece top, cotton underside and a shape-retaining insert.",
    price: "$70.00",
    pet: "dogs",
    url: "https://gigglingpawsandpets.com/product/a-kings-pet-bed",
  },
  {
    slug: "cat-harness-leash-set",
    name: "Cat Harness & Leash Set",
    description:
      "Suede-fabric harness and leash set with lace trim and a quick-release feature. Sizes S to XXXL.",
    price: "$6.02",
    pet: "cats",
    url: "https://gigglingpawsandpets.com/product/cat-harness-leash-set-for-chihuahua-accessories-dog-cat-vest-pug-leashes-walking-tools-walk-out-lead-product-2",
  },
  {
    slug: "catnip-ball-toy",
    name: "Catnip Ball Toy",
    description:
      "Edible catnip play toy. Listed with 1.5 cm and 3 cm ball options.",
    price: "$3.02",
    pet: "cats",
    url: "https://gigglingpawsandpets.com/product/pet-catnip-toys-edible-catnip-ball-safety-healthy-cat-mint-cats-home-chasing-game-toy-products-clean-teeth-the-stomach-catmint-2",
  },
];

export const STORE_HOME = "https://gigglingpawsandpets.com/";
export const STORE_COLLECTIONS = "https://gigglingpawsandpets.com/collections/all";
export const STORE_INSTAGRAM = "https://www.instagram.com/gigglingpawsandpets_/";

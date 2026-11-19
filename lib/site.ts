/**
 * Homepage hero photo. To swap in a new shot, drop the source into
 * pet-parade-products/hero/, run `node scripts/optimize-assets.mjs`, and update
 * the paths, size and focal points below. Focal points are CSS object-position
 * values that keep the pets' faces in frame at each crop.
 */
export const HERO_IMAGE = {
  src: "/art/hero-pets-1752.webp",
  srcSet: "/art/hero-pets-960.webp 960w, /art/hero-pets-1752.webp 1752w",
  width: 1752,
  height: 897,
  alt: "A smiling golden retriever in a navy paw-print bandana sits beside a grey tabby wearing a golden-orange harness",
  /** Wide screens: photo fills the hero, pets sit on the right. */
  focusWide: "60% 35%",
  /** Split layout (tablet / narrow desktop): photo fills the right column. */
  focusSplit: "74% 35%",
  /** Phones: photo stacks above the copy, cropped to both pets. */
  focusMobile: "77% 30%",
};

/**
 * Spots in the hero photo ("x,y" as fractions of the full image) where the hero's
 * animated extras sit. Update these if the hero photo is swapped.
 */
export const HERO_SPOTS = {
  /** speech bubbles, anchored at the bubble's tail */
  woof: "0.555,0.21",
  mew: "0.86,0.2",
  /** hearts rising from beside the retriever's head */
  hearts: "0.735,0.12",
  /** product hotspots: the paw badge on the bandana, the paw badge on the harness */
  bandana: "0.656,0.574",
  harness: "0.85,0.557",
  /** the striped ball on the rug between the pets, and its diameter as a fraction of image height */
  ball: "0.752,0.905",
  ballSize: "0.075",
};

export const SOCIAL = {
  instagram: "https://www.instagram.com/gigglingpawsandpets_/",
  facebook: "https://www.facebook.com/GigglingPaws/",
  tiktok: "https://www.tiktok.com/@gigglingpawsandpets",
};

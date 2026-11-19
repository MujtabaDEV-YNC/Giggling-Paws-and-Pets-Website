// Converts the provided Pet Parade product photos into web-sized WebP files
// and the homepage hero / footer photos from pet-parade-products/hero/.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.resolve(root, "pet-parade-products");
const out = path.resolve(root, "public", "products");

// slug -> storefront file (default state) and lifestyle file (hover/focus state)
const products = {
  "gpp-pet-bandana": {
    storefront: "originals/gpp-pet-bandana.png",
    lifestyle: "Golden retriever in a paw-print bandana.png",
  },
  "very-important-pet-tag": {
    storefront: "originals/very-important-pet-tag.png",
    lifestyle: "Golden retriever and signature paw tag.png",
  },
  "pet-bowl": {
    storefront: "originals/pet-bowl.png",
    lifestyle: "Tabby Sips from a Favorite Bowl.png",
  },
  "a-kings-pet-bed": {
    storefront: "originals/a-kings-pet-bed.png",
    lifestyle: "Golden Retriever Resting on Kingly Pillow.png",
  },
  "cat-harness-leash-set": {
    storefront: "originals/cat-harness-leash-set.png",
    lifestyle: "Sunlit Tabby in Golden-Orange Harness.png",
  },
  "catnip-ball-toy": {
    storefront: "originals/catnip-ball-toy.png",
    lifestyle: "Tabby Reaches for Catnip Ball.png",
  },
};

await mkdir(path.join(out, "storefront"), { recursive: true });
await mkdir(path.join(out, "lifestyle"), { recursive: true });
await mkdir(path.join(root, "public", "art"), { recursive: true });

for (const [slug, files] of Object.entries(products)) {
  await sharp(path.join(src, files.storefront))
    .resize(640, 640, { fit: "cover" })
    .webp({ quality: 84, effort: 6 })
    .toFile(path.join(out, "storefront", `${slug}.webp`));

  await sharp(path.join(src, files.lifestyle))
    .resize(800, 800, { fit: "cover" })
    .webp({ quality: 78, effort: 6 })
    .toFile(path.join(out, "lifestyle", `${slug}.webp`));
  console.log("optimized", slug);
}

// Homepage hero: the bandana retriever and harness tabby. To swap the photo, replace the
// source file and update HERO in lib/site.ts if the focal point moves.
const heroSrc = path.join(src, "hero", "hero-pets-living-room.webp");
for (const width of [960, 1752]) {
  await sharp(heroSrc)
    .resize({ width })
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(root, "public", "art", `hero-pets-${width}.webp`));
}

// Footer band: the studio shot, cropped to the pets on the right.
const studio = sharp(path.join(src, "hero", "hero-pets-studio-yellow.webp"));
const meta = await studio.metadata();
await studio
  .extract({ left: Math.round(meta.width * 0.34), top: 0, width: Math.round(meta.width * 0.66), height: meta.height })
  .resize({ width: 900 })
  .webp({ quality: 80, effort: 6 })
  .toFile(path.join(root, "public", "art", "footer-pets.webp"));
console.log("hero and footer photos written");

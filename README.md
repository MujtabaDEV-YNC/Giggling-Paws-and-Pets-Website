# The Pet Parade — Giggling Paws & Pets

Interactive landing-page showcase built with Next.js, React Three Fiber / Three.js and GSAP ScrollTrigger.

- `app/`, `components/`, `lib/` — the Next.js app
- `public/` — optimized images served by the site
- `pet-parade-products/` — product catalog and source photos

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Production build: `npm run build && npm start`.

Regenerate optimized images from `pet-parade-products/` with `node scripts/optimize-assets.mjs`.

## Deploy

Netlify reads `netlify.toml`: build command `npm run build`, publish directory `.next`, Node 22.
In the Netlify UI, leave the base directory empty.

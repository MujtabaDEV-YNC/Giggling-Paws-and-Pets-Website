"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import type { PetFilter } from "@/lib/products";
import { PawIcon } from "@/components/SiteHeader";
import CollectionPet from "@/components/pets/CollectionPet";

/** Asks Pet Favourites to show one pet's products. The link's #pet-favourites jump works on its own. */
export function requestFavouriteFilter(filter: Exclude<PetFilter, "all">) {
  window.dispatchEvent(new CustomEvent<PetFilter>("pet-parade:filter", { detail: filter }));
}

export default function ShopByPet() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const ctx = gsap.context(() => {
      // Panels rise in as the section scrolls up from the ribbon; scrubbed, so it reverses too.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top 90%", end: "top 20%", scrub: 0.8 },
        })
        .from(".pet-panel", {
          y: 140,
          rotation: (i) => (i ? 4 : -4),
          clipPath: "inset(18% 0% 0% 0% round 36px)",
          duration: 0.7,
          stagger: 0.15,
        })
        .from(".hand-tag", { scale: 0.6, rotation: -14, autoAlpha: 0, duration: 0.3 }, 0.3)
        .from(".paw-step", { autoAlpha: 0, scale: 0.4, duration: 0.12, stagger: 0.06 }, 0.45);

      // Layered parallax on the doodles.
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
        const depth = Number(el.dataset.depth);
        gsap.fromTo(
          el,
          { yPercent: depth * 30 },
          {
            yPercent: -depth * 30,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="shop-by-pet" ref={sectionRef} className="shop" aria-labelledby="shop-title">
      <div className="shop-grid">
        <div className="shop-intro">
          <p className="eyebrow eyebrow--brown">Follow the parade</p>
          <h2 id="shop-title" className="section-title">
            Shop <span className="nowrap">by Pet</span>
          </h2>
          <p className="hand-tag">Follow the parade to your pet&rsquo;s perfect picks!</p>
          <div className="paw-trail" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <PawIcon key={i} className="paw-step" />
            ))}
          </div>
        </div>

        <article id="for-dogs" className="pet-panel pet-panel--dogs" aria-labelledby="dogs-title">
          <svg className="doodle doodle-bone" data-depth="0.9" viewBox="0 0 64 32" aria-hidden="true">
            <path
              d="M14 10a6 6 0 1 1 6-6h24a6 6 0 1 1 6 6 6 6 0 1 1-6 6H20a6 6 0 1 1-6-6Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
              transform="translate(0 8)"
            />
          </svg>
          <div className="panel-copy">
            <h3 id="dogs-title" className="panel-title">
              For <span>Dogs</span>
            </h3>
            <p>Bandanas, tags and a bed fit for a king.</p>
            <a className="panel-cta" href="#pet-favourites" onClick={() => requestFavouriteFilter("dogs")}>
              Shop Dogs
              <span className="panel-cta-arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <div className="panel-art">
            <CollectionPet pet="dog" fallbackSrc="/products/lifestyle/gpp-pet-bandana.webp" />
          </div>
        </article>

        <article id="for-cats" className="pet-panel pet-panel--cats" aria-labelledby="cats-title">
          <svg className="doodle doodle-cat" data-depth="0.9" viewBox="0 0 64 48" aria-hidden="true">
            <path
              d="M10 44c-4-10-2-22 6-28l-2-12 10 8c6-2 12-2 18 0l10-8-2 12c8 6 10 18 6 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="panel-copy">
            <h3 id="cats-title" className="panel-title">
              For <span>Cats</span>
            </h3>
            <p>A favourite bowl, a sunny harness and catnip play.</p>
            <a className="panel-cta" href="#pet-favourites" onClick={() => requestFavouriteFilter("cats")}>
              Shop Cats
              <span className="panel-cta-arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <div className="panel-art">
            <CollectionPet pet="cat" fallbackSrc="/products/lifestyle/cat-harness-leash-set.webp" />
          </div>
        </article>
      </div>
    </section>
  );
}

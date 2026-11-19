"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { products, type PetFilter } from "@/lib/products";
import ProductCard from "./ProductCard";

const filters: { value: PetFilter; label: string }[] = [
  { value: "all", label: "All pets" },
  { value: "dogs", label: "Dogs" },
  { value: "cats", label: "Cats" },
];

export default function PetFavourites() {
  const [filter, setFilter] = useState<PetFilter>("all");
  const gridRef = useRef<HTMLUListElement>(null);
  const firstRender = useRef(true);

  // The Shop by Pet panels send this when their CTA is used.
  useEffect(() => {
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<PetFilter>).detail;
      if (detail === "dogs" || detail === "cats" || detail === "all") setFilter(detail);
    };
    window.addEventListener("pet-parade:filter", onRequest);
    return () => window.removeEventListener("pet-parade:filter", onRequest);
  }, []);

  const visible = products.filter((p) => filter === "all" || p.pet === filter);

  // Subtle stagger the first time the grid scrolls into view.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".product-card", {
        y: 36,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.08,
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      });
    }, grid);
    return () => ctx.revert();
  }, []);

  // A quicker version of the same stagger when the filter changes.
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const grid = gridRef.current;
    if (!grid || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const tween = gsap.from(grid.querySelectorAll(".product-card"), {
      y: 18,
      autoAlpha: 0,
      duration: 0.4,
      ease: "power2.out",
      stagger: 0.06,
      clearProps: "transform,opacity,visibility",
    });
    return () => {
      tween.kill();
    };
  }, [filter]);

  const label = filter === "all" ? "favourites" : `${filter === "dogs" ? "dog" : "cat"} favourites`;

  return (
    <section id="pet-favourites" className="favourites" aria-labelledby="favourites-title" tabIndex={-1}>
      <header className="section-head">
        <h2 id="favourites-title" className="section-title">
          <span className="title-dashes" aria-hidden="true" />
          Pet Favourites
          <span className="title-dashes title-dashes--end" aria-hidden="true" />
        </h2>
        <p className="section-lede">Our most-loved picks for happier, healthier, more playful pets.</p>
        <div className="filter" role="group" aria-label="Show products for">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className="filter-btn"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Showing {visible.length} {label}
        </p>
      </header>

      <ul ref={gridRef} className="product-grid">
        {visible.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

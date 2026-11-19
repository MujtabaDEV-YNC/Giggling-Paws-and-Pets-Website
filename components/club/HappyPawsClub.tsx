"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { STORE_HOME, STORE_INSTAGRAM } from "@/lib/products";
import { PawIcon } from "@/components/SiteHeader";
import { Dashes } from "@/components/Doodles";

// Instant-photo frames. The pets are the same golden retriever and grey tabby from the lifestyle shoot.
const photos = [
  { slug: "gpp-pet-bandana", alt: "Golden retriever grinning in a paw-print bandana", tilt: -5, tape: -4 },
  { slug: "pet-bowl", alt: "Grey tabby sipping from a favourite bowl", tilt: 4, tape: 6 },
  { slug: "a-kings-pet-bed", alt: "Golden retriever resting on a kingly pillow bed", tilt: 3, tape: -8 },
  { slug: "cat-harness-leash-set", alt: "Grey tabby in a sunlit doorway wearing a golden-orange harness", tilt: -3, tape: 3 },
  { slug: "very-important-pet-tag", alt: "Golden retriever showing off a signature paw tag", tilt: 6, tape: -2 },
];

export default function HappyPawsClub() {
  const collageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const collage = collageRef.current;
    if (!collage || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".polaroid", {
        y: 50,
        rotation: 0,
        autoAlpha: 0,
        duration: 0.9,
        ease: "back.out(1.4)",
        stagger: 0.12,
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: collage, start: "top 78%", once: true },
      });
    }, collage);
    return () => ctx.revert();
  }, []);

  return (
    <section id="happy-paws-club" className="club" aria-labelledby="club-title">
      <div className="club-copy">
        <h2 id="club-title" className="club-title">
          <Dashes className="club-dashes" />
          <span className="club-the">The</span>
          <span className="club-coral">
            Happy
            <PawIcon className="club-paw" />
          </span>
          <span className="club-coral">Paws</span>
          <span className="club-brown">Club</span>
        </h2>
        <p className="club-text">
          A community of pet lovers, real pet moments and everyday joy. Join the parade, share your stories and be part
          of our happy pack!
        </p>
        <div className="club-actions">
          <a className="btn btn-coral" href={STORE_INSTAGRAM} target="_blank" rel="noopener noreferrer">
            Follow Us
            <span aria-hidden="true" className="btn-arrow">→</span>
            <span className="sr-only"> on Instagram (opens in a new tab)</span>
          </a>
          <a className="btn btn-outline" href={STORE_HOME}>
            Join the Club
            <span className="sr-only"> — newsletter signup at the bottom of the store page</span>
          </a>
        </div>
      </div>

      <div className="collage" ref={collageRef}>
        {photos.map((photo, i) => (
          <figure
            key={photo.slug}
            className={`polaroid polaroid-${i + 1}`}
            style={{ ["--tilt" as string]: `${photo.tilt}deg`, ["--tape" as string]: `${photo.tape}deg` }}
          >
            <span className="tape" aria-hidden="true" />
            <img
              src={`/products/lifestyle/${photo.slug}.webp`}
              alt={photo.alt}
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

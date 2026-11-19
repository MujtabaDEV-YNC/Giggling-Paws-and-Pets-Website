"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { products } from "@/lib/products";
import { HERO_IMAGE, HERO_SPOTS } from "@/lib/site";
import { Dashes, Heart } from "@/components/Doodles";
import { PawIcon } from "@/components/SiteHeader";

const bandana = products.find((p) => p.slug === "gpp-pet-bandana")!;
const harness = products.find((p) => p.slug === "cat-harness-leash-set")!;

/** Splits a phrase into words that rise in one after another. */
function Words({ text, start }: { text: string; start: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <span className="word" style={{ "--i": start + i } as CSSProperties}>
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

/**
 * Photo-led hero with life: words rise in, the photo breathes and follows the pointer,
 * the pets "talk", product hotspots pulse on the bandana and harness, hearts float off
 * the retriever, and the striped ball rolls in, then rolls away as you scroll.
 *
 * Decorations are pinned to spots in the photo (HERO_SPOTS, as fractions of the image),
 * so they stay on the pets at every crop.
 */
export default function PhotoHero() {
  const heroRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const scrollLayerRef = useRef<HTMLDivElement>(null);
  const pointerLayerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLSpanElement>(null);

  // Keep every anchored decoration on its spot in the photo, whatever the object-fit crop.
  useEffect(() => {
    const frame = frameRef.current!;
    const img = imgRef.current!;
    const place = () => {
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      const W = img.naturalWidth || HERO_IMAGE.width;
      const H = img.naturalHeight || HERO_IMAGE.height;
      const s = Math.max(w / W, h / H);
      const [px, py] = getComputedStyle(img)
        .objectPosition.split(" ")
        .map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5));
      const ox = (w - W * s) * px;
      const oy = (h - H * s) * py;
      frame.querySelectorAll<HTMLElement>("[data-spot]").forEach((el) => {
        const [x, y] = el.dataset.spot!.split(",").map(Number);
        let left = ox + x * W * s;
        // Speech bubbles are centred on their spot; keep the whole bubble inside the frame.
        if (el.classList.contains("hero-bubble")) {
          const half = el.offsetWidth / 2 + 8;
          left = Math.min(Math.max(left, half), w - half);
        }
        const top = oy + y * H * s;
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        if (el.dataset.size) el.style.setProperty("--size", `${Number(el.dataset.size) * H * s}px`);
        el.dataset.offscreen = String(left < 12 || left > w - 12 || top < 12 || top > h - 12);
      });
    };
    place();
    img.addEventListener("load", place);
    const ro = new ResizeObserver(place);
    ro.observe(frame);
    return () => {
      img.removeEventListener("load", place);
      ro.disconnect();
    };
  }, []);

  // Pointer depth (desktop) and scroll parallax. Nothing runs when motion is reduced.
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const hero = heroRef.current!;
    const ctx = gsap.context(() => {
      // Scroll: the photo drifts slower than the page, the copy lifts a little,
      // and the ball rolls off toward the ribbon.
      const st = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 };
      gsap.to(scrollLayerRef.current, { yPercent: 9, ease: "none", scrollTrigger: st });
      gsap.to(copyRef.current, { y: -50, ease: "none", scrollTrigger: st });
      gsap.to(ballRef.current, {
        x: () => (mediaRef.current?.clientWidth ?? 800) * 0.45,
        ease: "none",
        scrollTrigger: { ...st, invalidateOnRefresh: true },
      });
      gsap.to(".hero-ball-spin", { rotation: 540, ease: "none", scrollTrigger: st });
    }, hero);

    // Pointer: the photo and the copy shift in opposite directions for a sense of depth.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let cleanupPointer = () => {};
    if (fine.matches) {
      const photoX = gsap.quickTo(pointerLayerRef.current, "x", { duration: 0.9, ease: "power3.out" });
      const photoY = gsap.quickTo(pointerLayerRef.current, "y", { duration: 0.9, ease: "power3.out" });
      const copyX = gsap.quickTo(copyRef.current, "x", { duration: 1.1, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        photoX(nx * -22);
        photoY(ny * -14);
        copyX(nx * 10);
      };
      const onLeave = () => {
        photoX(0);
        photoY(0);
        copyX(0);
      };
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
      cleanupPointer = () => {
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
      };
    }

    return () => {
      cleanupPointer();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const focus = {
    "--focus-wide": HERO_IMAGE.focusWide,
    "--focus-split": HERO_IMAGE.focusSplit,
    "--focus-mobile": HERO_IMAGE.focusMobile,
  } as CSSProperties;

  return (
    <section id="top" ref={heroRef} className="photo-hero" aria-labelledby="hero-title" style={focus}>
      <div className="photo-hero-media" ref={mediaRef}>
        <div className="hero-layer" ref={scrollLayerRef}>
          <div className="hero-layer hero-layer--pointer" ref={pointerLayerRef}>
            <div className="photo-hero-frame" ref={frameRef}>
              <img
                ref={imgRef}
                src={HERO_IMAGE.src}
                srcSet={HERO_IMAGE.srcSet}
                sizes="(max-width: 760px) 100vw, (max-width: 1100px) 56vw, 100vw"
                width={HERO_IMAGE.width}
                height={HERO_IMAGE.height}
                alt={HERO_IMAGE.alt}
                fetchPriority="high"
                decoding="async"
              />

              {/* the pets talk */}
              <span className="hero-bubble hero-bubble--woof" data-spot={HERO_SPOTS.woof} aria-hidden="true">
                Woof!
              </span>
              <span className="hero-bubble hero-bubble--mew" data-spot={HERO_SPOTS.mew} aria-hidden="true">
                Mew?
              </span>

              {/* hearts float up off the retriever */}
              <span className="hero-hearts" data-spot={HERO_SPOTS.hearts} aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <Heart key={i} className="float-heart" />
                ))}
              </span>

              {/* shoppable hotspots on what the pets are wearing */}
              <a className="hotspot" data-spot={HERO_SPOTS.bandana} href={bandana.url}>
                <span className="hotspot-dot" aria-hidden="true" />
                <span className="hotspot-card">
                  {bandana.name}{" "}
                  <b>{bandana.price}</b>
                </span>
              </a>
              <a className="hotspot hotspot--cat" data-spot={HERO_SPOTS.harness} href={harness.url}>
                <span className="hotspot-dot" aria-hidden="true" />
                <span className="hotspot-card">
                  {harness.name}{" "}
                  <b>{harness.price}</b>
                </span>
              </a>

              {/* the striped ball from the Pet Parade rolls in */}
              <span
                ref={ballRef}
                className="hero-ball"
                data-spot={HERO_SPOTS.ball}
                data-size={HERO_SPOTS.ballSize}
                aria-hidden="true"
              >
                <span className="hero-ball-spin">
                  <span className="hero-ball-inner" />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="photo-hero-copy" ref={copyRef}>
        <p className="eyebrow">
          The Pet Parade
          <Dashes className="eyebrow-dashes" />
        </p>
        <h1 id="hero-title" className="hero-title">
          <Words text="Made for" start={0} />{" "}
          <span className="accent">
            <Words text="wagging tails" start={2} />
            <svg className="title-squiggle" viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true">
              <path pathLength={1} d="M2 10 C 20 2, 36 14, 54 8 S 90 2, 108 9 S 144 14, 162 7 S 190 4, 198 9" />
            </svg>
          </span>{" "}
          <Words text="and" start={4} />{" "}
          <span className="accent accent--brown">
            <Words text="curious paws" start={5} />
            <Heart className="title-heart" />
          </span>
        </h1>
        <p className="hero-lede">Playful accessories, toys, and everyday favorites for dogs and cats.</p>
        <div className="hero-actions">
          <a className="btn btn-coral" href="#for-dogs">
            Shop Dogs
            <span aria-hidden="true" className="btn-arrow">→</span>
          </a>
          <a className="btn btn-cat" href="#for-cats">
            Shop Cats
            <span aria-hidden="true" className="btn-arrow">→</span>
          </a>
        </div>
      </div>

      {/* little paw prints wander across the floor */}
      <div className="hero-paw-walk" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <PawIcon key={i} className="walk-paw" />
        ))}
      </div>
    </section>
  );
}

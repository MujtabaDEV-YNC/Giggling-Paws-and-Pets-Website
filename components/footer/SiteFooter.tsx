"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { STORE_COLLECTIONS, STORE_HOME } from "@/lib/products";
import { SOCIAL } from "@/lib/site";
import { PawIcon } from "@/components/SiteHeader";

const WORDMARK = "Giggling Paws";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Shop Dogs", href: "#for-dogs" },
      { label: "Shop Cats", href: "#for-cats" },
      { label: "Pet Favourites", href: "#pet-favourites" },
      { label: "All products", href: STORE_COLLECTIONS },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "The Pet Parade", href: "#top" },
      { label: "Shop by Pet", href: "#shop-by-pet" },
      { label: "The Happy Paws Club", href: "#happy-paws-club" },
      { label: "Visit the store", href: STORE_HOME },
    ],
  },
];

const socials = [
  { label: "Instagram", href: SOCIAL.instagram, icon: <InstagramIcon /> },
  { label: "Facebook", href: SOCIAL.facebook, icon: <FacebookIcon /> },
  { label: "TikTok", href: SOCIAL.tiktok, icon: <TikTokIcon /> },
];

/**
 * Closing footer, after the big-type sign-offs on the reference sites: a sunny CTA card,
 * link columns, and an oversized wordmark whose letters rise in as it scrolls into view.
 */
export default function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".wordmark-letter", {
        yPercent: 110,
        rotation: (i) => (i % 2 ? 8 : -8),
        duration: 0.9,
        ease: "back.out(1.6)",
        stagger: 0.04,
        scrollTrigger: { trigger: ".footer-wordmark", start: "top 92%", once: true },
      });
      gsap.from(".footer-cta", {
        y: 60,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: footer, start: "top 85%", once: true },
      });
    }, footer);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="site-footer" aria-labelledby="footer-title">
      <svg className="footer-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 80V40C180 0 360 0 540 28s360 52 540 24 270-40 360-32v20Z" fill="currentColor" />
      </svg>

      <div className="footer-cta">
        <div className="footer-cta-copy">
          <p className="eyebrow eyebrow--brown">See you on the next walk</p>
          <h2 id="footer-title" className="footer-cta-title">
            More joy is just a <span>wag</span> away
          </h2>
          <p>Fresh finds for wagging tails and curious paws. Browse the full collection on our store.</p>
          <div className="footer-cta-actions">
            <a className="btn btn-coral" href={STORE_COLLECTIONS}>
              Shop all products
              <span aria-hidden="true" className="btn-arrow">→</span>
            </a>
            <a className="btn btn-outline" href={STORE_HOME}>
              Get the newsletter
              <span className="sr-only"> (signup at the bottom of the store page)</span>
            </a>
          </div>
        </div>
        <img
          className="footer-cta-photo"
          src="/art/footer-pets.webp"
          alt="Golden retriever in a paw-print bandana and a tabby in an orange harness, posing on a sunny yellow set"
          width={900}
          height={682}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <a className="footer-logo" href="#top">
            <PawIcon className="footer-logo-paw" />
            <span>
              Giggling
              <br />
              Paws &amp; Pets
            </span>
          </a>
          <p>A little more joy for every paw. Accessories, toys and everyday favourites for dogs and cats.</p>
          <ul className="footer-socials" aria-label="Follow Giggling Paws & Pets">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (opens in a new tab)`}>
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          {columns.map((col) => (
            <div key={col.title} className="footer-col">
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-col">
            <h3>Follow</h3>
            <ul>
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <p className="footer-wordmark" aria-hidden="true">
        {WORDMARK.split("").map((ch, i) => (
          <span key={i} className="wordmark-letter">
            {ch === " " ? " " : ch}
          </span>
        ))}
        <PawIcon className="wordmark-paw" />
      </p>

      <div className="footer-bottom">
        <p>© 2026 Giggling Paws &amp; Pets. Orders are handled securely on gigglingpawsandpets.com.</p>
        <a className="to-top" href="#top">
          Back to top
          <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v6h4v-6h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8Z" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M15 3c.4 2.6 2 4.2 4.5 4.4v3.4c-1.7 0-3.2-.5-4.5-1.4v6.1A5.5 5.5 0 1 1 9.5 10v3.5a2 2 0 1 0 2 2V3H15Z" fill="currentColor" />
    </svg>
  );
}

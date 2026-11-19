import { Fragment } from "react";
import { PawIcon } from "@/components/SiteHeader";

const BACK = ["Bandanas", "Harnesses", "Toys", "Bowls"];
const FRONT = ["Wag More", "Purr More", "Play More"];

/** One run of the strip. Two identical runs sit side by side so a -50% shift loops seamlessly. */
function Run({ items, repeat, separator }: { items: string[]; repeat: number; separator: "dot" | "paw" }) {
  return (
    <div className="ribbon-run">
      {Array.from({ length: repeat }).flatMap((_, r) =>
        items.map((item, i) => (
          <Fragment key={`${r}-${i}`}>
            <span className="ribbon-word">{item}</span>
            {separator === "dot" ? (
              <span className="ribbon-dot">·</span>
            ) : (
              <PawIcon className="ribbon-paw" />
            )}
          </Fragment>
        )),
      )}
    </div>
  );
}

/**
 * Layered scrolling ribbon: a slim chocolate strip behind, a wider angled coral ribbon in front,
 * looping in opposite directions. CSS-only, static under prefers-reduced-motion.
 */
export default function PawRibbon() {
  return (
    <section className="ribbons" aria-label="Bandanas, harnesses, toys and bowls. Wag more, purr more, play more.">
      <div className="ribbon ribbon--back" aria-hidden="true">
        <div className="ribbon-track">
          <Run items={BACK} repeat={6} separator="dot" />
          <Run items={BACK} repeat={6} separator="dot" />
        </div>
      </div>
      <div className="ribbon ribbon--front" aria-hidden="true">
        <div className="ribbon-track">
          <Run items={FRONT} repeat={5} separator="paw" />
          <Run items={FRONT} repeat={5} separator="paw" />
        </div>
      </div>
    </section>
  );
}

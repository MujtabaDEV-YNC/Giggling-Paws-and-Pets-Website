"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY, supportsWebGL } from "@/lib/motion";
import type { Progress } from "./Characters";
import type { PetKind } from "./PetStage";

// three.js loads only once a panel is close to the viewport.
const PetStage = dynamic(() => import("./PetStage"), { ssr: false });

type Status = "waiting" | "loading" | "ready" | "fallback";

/**
 * The 3D pet inside a collection panel. The panel's links never depend on it: until the model
 * is ready a light placeholder shows, and without WebGL the lifestyle photo stands in.
 */
export default function CollectionPet({ pet, fallbackSrc }: { pet: PetKind; fallbackSrc: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const greet: Progress = useRef(0);
  const [status, setStatus] = useState<Status>("waiting");
  const [animate, setAnimate] = useState(true);

  // Mount the canvas just before the panel scrolls in.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    if (!supportsWebGL()) {
      setStatus("fallback");
      return;
    }
    setAnimate(!window.matchMedia(REDUCED_MOTION_QUERY).matches);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatus((s) => (s === "waiting" ? "loading" : s));
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  // Each time the panel comes well into view, play a short greeting (head tilt, tail wag / paw wave).
  useEffect(() => {
    const box = boxRef.current;
    if (!box || status !== "ready" || !animate) return;
    let tween: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        tween?.kill();
        tween = gsap.fromTo(greet, { current: 0 }, { current: 1, duration: 1.8, ease: "sine.inOut", delay: 0.15 });
      },
      { threshold: 0.6 },
    );
    io.observe(box);
    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [status, animate, greet]);

  return (
    <div ref={boxRef} className="collection-pet" data-status={status} aria-hidden="true">
      {status === "fallback" ? (
        <img className="collection-pet-fallback" src={fallbackSrc} alt="" width={800} height={800} loading="lazy" />
      ) : (
        <>
          <span className="collection-pet-placeholder">
            <span className="placeholder-paw" />
          </span>
          {(status === "loading" || status === "ready") && (
            <div className="collection-pet-canvas">
              <PetStage pet={pet} greet={greet} animate={animate} onReady={() => setStatus("ready")} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

/**
 * Stylized, procedurally built Pet Parade cast: a golden retriever in a coral bandana,
 * a grey tabby with a yellow bow, and the striped felt ball. No model files are loaded;
 * everything is built from shared primitives and two small canvas textures, so the
 * whole scene costs a few kilobytes of JavaScript instead of a multi-megabyte GLB.
 */

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Quaternion,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type Group,
  type Material,
  type Mesh,
} from "three";

export type Progress = MutableRefObject<number>;
type V3 = [number, number, number];

/* ------------------------------------------------------------------ */
/* Stage constants                                                      */
/* ------------------------------------------------------------------ */

export const GROUND_Y = -1;
export const BALL_R = 0.24;
/** The ball starts between the pets and rolls forward-right, toward the camera and out of frame. */
const BALL_FROM = new Vector3(0.1, GROUND_Y + BALL_R, 0.55);
const BALL_TO = new Vector3(2.5, GROUND_Y + BALL_R, 4.2);

export const BALL_COLORS = ["#E8685A", "#F6EBD9", "#7FC0E8", "#F8D46A", "#E8685A", "#F6EBD9", "#7FC0E8", "#F8D46A"];

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const smoothstep = (a: number, b: number, v: number) => {
  const t = range(v, a, b);
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ */
/* Shared textures, materials and geometry (created once, client only) */
/* ------------------------------------------------------------------ */

function canvasTexture(w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paint(c.getContext("2d")!);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Felt-ball segments that run pole to pole, with a little fibre speckle. */
function ballTexture() {
  return canvasTexture(512, 256, (ctx) => {
    const band = 512 / BALL_COLORS.length;
    BALL_COLORS.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * band, 0, band + 1, 256);
    });
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 256, 1.5, 1.5);
    }
  });
}

/** Grey tabby coat: wavy dark stripes over the back, fading to a pale belly. */
function tabbyTexture() {
  return canvasTexture(512, 256, (ctx) => {
    ctx.fillStyle = "#9A9DA8";
    ctx.fillRect(0, 0, 512, 256);
    const belly = ctx.createLinearGradient(0, 130, 0, 256);
    belly.addColorStop(0, "rgba(222,224,230,0)");
    belly.addColorStop(1, "rgba(222,224,230,1)");
    ctx.strokeStyle = "rgba(72,76,88,0.9)";
    ctx.lineCap = "round";
    for (let i = 0; i < 16; i++) {
      const x0 = i * 32 + 8;
      ctx.lineWidth = 7 + (i % 3) * 2;
      ctx.beginPath();
      for (let y = 6; y < 170; y += 6) {
        const x = x0 + Math.sin(y * 0.06 + i) * 5;
        if (y === 6) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = belly;
    ctx.fillRect(0, 120, 512, 136);
  });
}

type Mats = Record<
  | "gold" | "goldLight" | "goldDark" | "cream" | "nose" | "mouth" | "tongue" | "white" | "iris"
  | "coral" | "tabby" | "tabbyLight" | "tabbyDark" | "catWhite" | "pink" | "catMouth" | "bow" | "bell" | "ball",
  Material
>;

let materials: Mats | null = null;
function mats(): Mats {
  if (materials) return materials;
  const std = (color: string, roughness = 0.85, extra: Record<string, unknown> = {}) =>
    new MeshStandardMaterial({ color, roughness, ...extra });
  materials = {
    gold: std("#E3A55A"),
    goldLight: std("#F3C886"),
    goldDark: std("#C7843C"),
    cream: std("#FFF0D8"),
    nose: std("#2A1A14", 0.3),
    mouth: std("#7A2A2A", 0.6),
    tongue: std("#F07986", 0.45),
    white: std("#FFFFFF", 0.25),
    iris: std("#3A2215", 0.25),
    coral: std("#E8685A", 0.75),
    tabby: std("#FFFFFF", 0.9, { map: tabbyTexture() }),
    tabbyLight: std("#D8DAE0"),
    tabbyDark: std("#4E525E"),
    catWhite: std("#F5F3EF"),
    pink: std("#F2A1AC", 0.55),
    catMouth: std("#C94F5B", 0.5),
    bow: std("#F6C33F", 0.5),
    bell: std("#E5B744", 0.25, { metalness: 0.65 }),
    ball: std("#FFFFFF", 0.92, { map: ballTexture() }),
  };
  return materials;
}

let geometries: { sphere: SphereGeometry; capsule: CapsuleGeometry; cone: ConeGeometry; arc: TorusGeometry } | null = null;
function geo() {
  if (!geometries) {
    geometries = {
      sphere: new SphereGeometry(1, 32, 24),
      capsule: new CapsuleGeometry(1, 1, 6, 16),
      cone: new ConeGeometry(1, 1, 24),
      arc: new TorusGeometry(1, 0.2, 8, 24, Math.PI),
    };
  }
  return geometries;
}

/** An ellipsoid blob — the basic sculpting unit for both pets. */
function Blob({ m, at, s, r }: { m: Material; at: V3; s: V3 | number; r?: V3 }) {
  const scale: V3 = typeof s === "number" ? [s, s, s] : s;
  return <mesh geometry={geo().sphere} material={m} position={at} scale={scale} rotation={r} />;
}

function Capsule({ m, at, radius, length, r }: { m: Material; at: V3; radius: number; length: number; r?: V3 }) {
  return <mesh geometry={geo().capsule} material={m} position={at} scale={[radius, length / 2, radius]} rotation={r} />;
}

function tube(points: V3[], radius: number) {
  return new TubeGeometry(new CatmullRomCurve3(points.map((p) => new Vector3(...p))), 32, radius, 12, false);
}

/* ------------------------------------------------------------------ */
/* Golden retriever                                                     */
/* ------------------------------------------------------------------ */

const DOG_REACH = 0.82; // torso centre to paw bottom

type PetProps = {
  progress: Progress;
  base: V3;
  /** Standing pose for a collection panel: no chase, no trot. */
  showcase?: boolean;
  /** 0 → 1 pulse played when the pet's collection scrolls into view (head tilt + tail wag). */
  greet?: Progress;
};

const pulse = (greet?: Progress) => (greet ? Math.sin(Math.PI * clamp01(greet.current)) : 0);

/**
 * Golden retriever with real retriever proportions: deep chest and tucked waist, long straight
 * forelegs, angled hind legs with haunches, a neck, a long muzzle with a defined stop,
 * low-set hanging ears, and a long feathered tail carried level.
 */
export function GoldenRetriever({ progress, base, showcase = false, greet }: PetProps) {
  const M = mats();
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const earL = useRef<Group>(null);
  const earR = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const legs = [useRef<Group>(null), useRef<Group>(null), useRef<Group>(null), useRef<Group>(null)];
  const phase = useRef(0);

  const tailGeo = useMemo(
    () => tube([[0, 0, 0], [-0.2, 0.06, 0], [-0.42, 0.14, 0], [-0.62, 0.2, 0]], 0.065),
    [],
  );
  const flapGeo = useMemo(() => {
    const s = new Shape();
    s.moveTo(-0.22, 0.07);
    s.lineTo(0.22, 0.07);
    s.quadraticCurveTo(0.04, -0.17, 0, -0.23);
    s.quadraticCurveTo(-0.04, -0.17, -0.22, 0.07);
    const g = new ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 });
    g.translate(0, 0, -0.0125);
    return g;
  }, []);
  const bandGeo = useMemo(() => new TorusGeometry(0.2, 0.05, 12, 36), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    const chase = smoothstep(0.06, 0.8, p);
    const moving = p > 0.04 && p < 0.98;
    const run = showcase ? 0 : moving ? 1 : 0.18; // a lazy trot in place before the parade starts
    const g = pulse(greet);
    phase.current += delta * (moving ? 11 : 5);
    const f = phase.current;

    root.current!.position.set(base[0] + chase * 0.6, GROUND_Y + DOG_REACH, base[2] + chase * 0.9);
    root.current!.rotation.y = (showcase ? -0.75 : -0.4) - chase * 0.3;

    // Breathing / gait bob.
    body.current!.position.y = Math.abs(Math.sin(f)) * 0.07 * run + Math.sin(t * 2.2) * 0.006;
    body.current!.rotation.z = Math.sin(f) * 0.06 * run;

    head.current!.rotation.z = 0.04 - Math.sin(f) * 0.05 * run + Math.sin(t * 0.9) * 0.02;
    head.current!.rotation.y = Math.sin(t * 0.8) * 0.08 + chase * 0.15;
    head.current!.rotation.x = g * 0.4; // curious head tilt

    // Ears swing with the gait and lift a little during the head tilt.
    earL.current!.rotation.x = 0.12 + Math.sin(f + 1) * 0.15 * run + g * 0.22;
    earR.current!.rotation.x = -0.12 - Math.sin(f + 1) * 0.15 * run + g * 0.08;

    // Tail is carried level, so the wag is side to side (about y), lifting when excited.
    tail.current!.rotation.y = Math.sin(t * (9 + g * 10)) * (0.35 + g * 0.45);
    tail.current!.rotation.z = 0.15 + g * 0.25;

    const amp = 0.6 * run;
    legs[0].current!.rotation.z = Math.sin(f) * amp;
    legs[1].current!.rotation.z = Math.sin(f + 0.5) * amp;
    legs[2].current!.rotation.z = Math.sin(f + Math.PI) * amp * 0.85;
    legs[3].current!.rotation.z = Math.sin(f + Math.PI + 0.5) * amp * 0.85;
  });

  return (
    <group ref={root}>
      <group ref={body}>
        {/* torso: deep chest, tucked waist, rounded rump */}
        <Blob m={M.gold} at={[0.36, 0.02, 0]} s={[0.36, 0.34, 0.3]} />
        <Blob m={M.gold} at={[0, 0.05, 0]} s={[0.5, 0.29, 0.28]} />
        <Blob m={M.gold} at={[-0.4, 0.06, 0]} s={[0.32, 0.31, 0.3]} />
        {/* chest feathering and belly fringe */}
        <Blob m={M.goldLight} at={[0.5, -0.12, 0]} s={[0.17, 0.24, 0.22]} />
        <Blob m={M.goldLight} at={[0.08, -0.13, 0]} s={[0.36, 0.1, 0.2]} />

        {/* forelegs: long and straight, with feathering behind */}
        {(
          [
            [0.36, -0.12, 0.15],
            [0.36, -0.12, -0.15],
          ] as V3[]
        ).map((pos, i) => (
          <group key={`f${i}`} ref={legs[i]} position={pos}>
            <Capsule m={M.gold} at={[0, -0.3, 0]} radius={0.09} length={0.4} />
            <Blob m={M.goldLight} at={[-0.06, -0.26, 0]} s={[0.05, 0.15, 0.06]} />
            <Blob m={M.goldLight} at={[0.03, -0.66, 0]} s={[0.115, 0.06, 0.1]} />
          </group>
        ))}

        {/* hind legs: muscular haunch and an angled hock */}
        {(
          [
            [-0.4, -0.06, 0.15],
            [-0.4, -0.06, -0.15],
          ] as V3[]
        ).map((pos, i) => (
          <group key={`h${i}`} ref={legs[i + 2]} position={pos}>
            <Blob m={M.gold} at={[0, -0.08, 0]} s={[0.2, 0.25, 0.13]} />
            <Capsule m={M.gold} at={[-0.07, -0.42, 0]} radius={0.082} length={0.28} r={[0, 0, -0.22]} />
            <Blob m={M.goldLight} at={[-0.15, -0.3, 0]} s={[0.06, 0.13, 0.06]} />
            <Blob m={M.goldLight} at={[-0.05, -0.72, 0]} s={[0.115, 0.06, 0.1]} />
          </group>
        ))}

        {/* long feathered tail carried level */}
        <group ref={tail} position={[-0.66, 0.14, 0]}>
          <mesh geometry={tailGeo} material={M.gold} />
          <Blob m={M.goldLight} at={[-0.22, -0.03, 0]} s={[0.15, 0.06, 0.055]} />
          <Blob m={M.goldLight} at={[-0.43, 0.06, 0]} s={[0.14, 0.06, 0.05]} />
          <Blob m={M.goldLight} at={[-0.62, 0.18, 0]} s={[0.07, 0.06, 0.06]} />
        </group>

        {/* neck with a soft ruff */}
        <Capsule m={M.gold} at={[0.56, 0.3, 0]} radius={0.16} length={0.3} r={[0, 0, -0.65]} />
        <Blob m={M.goldLight} at={[0.6, 0.18, 0]} s={[0.15, 0.17, 0.19]} />

        {/* coral bandana: neck band + paw-print flap on the chest */}
        <group position={[0.55, 0.26, 0]} rotation={[0, 0, 0.9]}>
          <mesh geometry={bandGeo} material={M.coral} rotation={[0, Math.PI / 2, 0]} />
        </group>
        <group position={[0.7, 0.1, 0.04]} rotation={[0, Math.PI / 2 - 0.55, 0.1]}>
          <mesh geometry={flapGeo} material={M.coral} />
          <Blob m={M.cream} at={[0, -0.06, 0.025]} s={[0.045, 0.037, 0.01]} />
          <Blob m={M.cream} at={[-0.054, 0.0, 0.025]} s={[0.017, 0.021, 0.008]} />
          <Blob m={M.cream} at={[-0.018, 0.026, 0.025]} s={[0.017, 0.021, 0.008]} />
          <Blob m={M.cream} at={[0.018, 0.026, 0.025]} s={[0.017, 0.021, 0.008]} />
          <Blob m={M.cream} at={[0.054, 0.0, 0.025]} s={[0.017, 0.021, 0.008]} />
        </group>

        {/* head: broad skull, defined stop, long muzzle */}
        <group ref={head} position={[0.74, 0.56, 0]}>
          <Blob m={M.gold} at={[0, 0, 0]} s={[0.29, 0.26, 0.25]} />
          <Blob m={M.goldLight} at={[-0.02, -0.12, 0.16]} s={[0.14, 0.12, 0.08]} />
          <Blob m={M.goldLight} at={[-0.02, -0.12, -0.16]} s={[0.14, 0.12, 0.08]} />
          {/* muzzle and lower jaw */}
          <Blob m={M.gold} at={[0.3, -0.07, 0]} s={[0.25, 0.12, 0.14]} />
          <Blob m={M.goldLight} at={[0.32, -0.12, 0]} s={[0.22, 0.08, 0.13]} />
          <Blob m={M.goldLight} at={[0.24, -0.2, 0]} s={[0.18, 0.05, 0.1]} />
          <Blob m={M.nose} at={[0.54, -0.035, 0]} s={[0.065, 0.05, 0.075]} />
          <Blob m={M.white} at={[0.575, -0.01, 0.025]} s={0.014} />
          {/* open, panting mouth */}
          <Blob m={M.mouth} at={[0.33, -0.17, 0]} s={[0.16, 0.04, 0.1]} />
          <Blob m={M.tongue} at={[0.34, -0.23, 0.01]} s={[0.08, 0.05, 0.065]} r={[0, 0, -0.35]} />
          {/* almond eyes set forward at the stop, with brows */}
          {[1, -1].map((side) => (
            <group key={side}>
              <Blob m={M.iris} at={[0.19, 0.06, 0.15 * side]} s={[0.045, 0.04, 0.035]} r={[0, -0.6 * side, 0]} />
              <Blob m={M.white} at={[0.215, 0.075, 0.165 * side]} s={0.011} />
              <Blob m={M.goldDark} at={[0.18, 0.12, 0.15 * side]} s={[0.055, 0.016, 0.035]} r={[0, 0, -0.2]} />
            </group>
          ))}
          {/* low-set ears hanging past the jaw */}
          <group ref={earL} position={[-0.06, 0.1, 0.22]}>
            <Blob m={M.goldDark} at={[0.02, -0.2, 0.02]} s={[0.12, 0.23, 0.05]} r={[0, 0, 0.12]} />
          </group>
          <group ref={earR} position={[-0.06, 0.1, -0.22]}>
            <Blob m={M.goldDark} at={[0.02, -0.2, -0.02]} s={[0.12, 0.23, 0.05]} r={[0, 0, 0.12]} />
          </group>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Grey tabby                                                           */
/* ------------------------------------------------------------------ */

const CAT_REACH = 0.4;

export function GreyTabby({ progress, base, showcase = false, greet }: PetProps) {
  const M = mats();
  const G = geo();
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const legs = [useRef<Group>(null), useRef<Group>(null), useRef<Group>(null), useRef<Group>(null)];

  const tailGeo = useMemo(() => tube([[0, 0, 0], [-0.16, 0.12, 0], [-0.22, 0.36, 0], [-0.12, 0.56, 0], [0, 0.6, 0]], 0.045), []);
  const collarGeo = useMemo(() => new TorusGeometry(0.2, 0.025, 8, 32), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    // The cat pounces over the ball as it rolls past, then turns to watch it go.
    const leap = range(p, 0.14, 0.46);
    const arc = Math.sin(Math.PI * leap);
    const forward = smoothstep(0.14, 0.46, p);
    const watch = smoothstep(0.46, 0.75, p);
    const idle = 1 - range(p, 0, 0.1);
    const g = pulse(greet);

    root.current!.position.set(base[0] + forward * 0.45, GROUND_Y + CAT_REACH + arc * 0.8, base[2] + forward * 0.5);
    root.current!.rotation.z = Math.cos(Math.PI * leap) * 0.38 * arc;
    root.current!.rotation.y = (showcase ? -0.65 : -0.2) - watch * 0.5;
    body.current!.position.y = Math.sin(t * 2.4) * 0.01;
    head.current!.rotation.y = watch * 0.45 + Math.sin(t * 1.1) * 0.05 + g * 0.3;
    head.current!.rotation.z = Math.sin(t * 1.7) * 0.05 - arc * 0.2;
    head.current!.rotation.x = -g * 0.42; // curious head tilt
    tail.current!.rotation.x = Math.sin(t * (3 + g * 6)) * (0.3 + g * 0.35);
    tail.current!.rotation.z = -arc * 0.6;

    // Stretch into the leap; tap a front paw while waiting; wave hello when greeted.
    const tap = Math.max(0, Math.sin(t * 3)) * (showcase ? 0.25 : 0.6) * idle;
    legs[0].current!.rotation.z = arc * 1.0 + tap + g * 1.1;
    legs[1].current!.rotation.z = arc * 0.9;
    legs[2].current!.rotation.z = -arc * 0.9;
    legs[3].current!.rotation.z = -arc * 0.8;
  });

  return (
    <group ref={root}>
      <group ref={body}>
        <Blob m={M.tabby} at={[0, 0, 0]} s={[0.42, 0.28, 0.27]} />
        <Blob m={M.catWhite} at={[0.05, -0.1, 0]} s={[0.3, 0.16, 0.2]} />
        <Blob m={M.catWhite} at={[0.3, 0.02, 0]} s={[0.17, 0.2, 0.2]} />

        {(
          [
            [0.22, -0.08, 0.12],
            [0.22, -0.08, -0.12],
            [-0.22, -0.07, 0.12],
            [-0.22, -0.07, -0.12],
          ] as V3[]
        ).map((pos, i) => (
          <group key={i} ref={legs[i]} position={pos}>
            <Capsule m={M.tabby} at={[0, -0.14, 0]} radius={0.06} length={0.16} />
            <Blob m={M.catWhite} at={[0.02, -0.27, 0]} s={[0.075, 0.05, 0.07]} />
          </group>
        ))}

        <group ref={tail} position={[-0.4, 0.06, 0]}>
          <mesh geometry={tailGeo} material={M.tabby} />
          <Blob m={M.tabbyDark} at={[0, 0.6, 0]} s={0.05} />
        </group>

        {/* collar, yellow bow and bell */}
        <group position={[0.3, 0.13, 0]} rotation={[0, 0, 0.6]}>
          <mesh geometry={collarGeo} material={M.bow} rotation={[0, Math.PI / 2, 0]} />
        </group>
        <Blob m={M.bow} at={[0.37, 0.1, 0.085]} s={[0.045, 0.065, 0.08]} r={[0.5, 0, 0]} />
        <Blob m={M.bow} at={[0.37, 0.1, -0.085]} s={[0.045, 0.065, 0.08]} r={[-0.5, 0, 0]} />
        <Blob m={M.bow} at={[0.39, 0.1, 0]} s={0.036} />
        <Blob m={M.bell} at={[0.39, 0.02, 0]} s={0.042} />

        <group ref={head} position={[0.42, 0.3, 0]}>
          <Blob m={M.tabby} at={[0, 0, 0]} s={[0.33, 0.29, 0.32]} r={[0, 0, Math.PI / 2]} />
          <Blob m={M.tabbyLight} at={[0.1, -0.12, 0.2]} s={[0.15, 0.11, 0.12]} />
          <Blob m={M.tabbyLight} at={[0.1, -0.12, -0.2]} s={[0.15, 0.11, 0.12]} />
          <Blob m={M.catWhite} at={[0.25, -0.09, 0]} s={[0.12, 0.08, 0.13]} />
          <Blob m={M.pink} at={[0.36, -0.04, 0]} s={[0.035, 0.025, 0.035]} />
          <Blob m={M.catMouth} at={[0.3, -0.16, 0]} s={[0.06, 0.055, 0.07]} />
          {/* closed, smiling eyes */}
          <mesh geometry={G.arc} material={M.nose} position={[0.27, 0.05, 0.16]} rotation={[0, 0.6, 0]} scale={0.055} />
          <mesh geometry={G.arc} material={M.nose} position={[0.27, 0.05, -0.16]} rotation={[0, -0.6, 0]} scale={0.055} />
          {/* forehead "M" stripes */}
          {[-0.05, 0, 0.05].map((z) => (
            <Capsule key={z} m={M.tabbyDark} at={[0.13, 0.21, z]} radius={0.012} length={0.08} r={[0, 0, 0.5]} />
          ))}
          {/* ears */}
          {[1, -1].map((side) => (
            <group key={side} position={[-0.02, 0.26, 0.16 * side]} rotation={[0.3 * side, 0, 0]}>
              <mesh geometry={G.cone} material={M.tabby} scale={[0.12, 0.24, 0.12]} />
              <mesh geometry={G.cone} material={M.pink} position={[0.03, -0.02, 0]} scale={[0.07, 0.16, 0.06]} />
            </group>
          ))}
          {/* whiskers */}
          {[1, -1].flatMap((side) =>
            [0.1, -0.1].map((tilt) => (
              <Capsule
                key={`${side}${tilt}`}
                m={M.catWhite}
                at={[0.27, -0.1, 0.2 * side]}
                radius={0.004}
                length={0.22}
                r={[Math.PI / 2 + tilt, 0, 0]}
              />
            )),
          )}
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Striped felt ball                                                    */
/* ------------------------------------------------------------------ */

export function StripedBall({ progress }: { progress: Progress }) {
  const M = mats();
  const ref = useRef<Mesh>(null);
  const { axis, length } = useMemo(() => {
    const d = BALL_TO.clone().sub(BALL_FROM);
    d.y = 0;
    // Rolling without slipping: spin about (up × direction) by distance / radius.
    return { axis: new Vector3(d.z, 0, -d.x).normalize(), length: d.length() };
  }, []);
  const q = useMemo(() => new Quaternion(), []);
  const tilt = useMemo(() => new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.4), []);
  const pos = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    const e = Math.pow(range(p, 0.08, 0.95), 1.35); // gathers speed as it rolls away
    const wobble = Math.sin(t * 2.2) * 0.05 * (1 - range(p, 0, 0.08));
    pos.lerpVectors(BALL_FROM, BALL_TO, e);
    pos.x += wobble;
    ref.current!.position.copy(pos);
    q.setFromAxisAngle(axis, (e * length + wobble) / BALL_R);
    ref.current!.quaternion.copy(q).multiply(tilt);
  });

  return <mesh ref={ref} geometry={geo().sphere} material={M.ball} scale={BALL_R} />;
}

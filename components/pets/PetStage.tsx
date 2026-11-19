"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { GoldenRetriever, GreyTabby, GROUND_Y, type Progress } from "./Characters";

export type PetKind = "dog" | "cat";

// Framing per pet: camera position and the point it looks at.
const FRAMING: Record<PetKind, { camera: [number, number, number]; look: [number, number, number] }> = {
  dog: { camera: [0.1, 0.3, 3.45], look: [0.1, -0.2, 0] },
  cat: { camera: [0.1, 0.05, 3.1], look: [0.1, -0.42, 0] },
};

/** A single-pet canvas for a collection panel. Reuses the parade models in their standing pose. */
export default function PetStage({
  pet,
  greet,
  animate,
  onReady,
}: {
  pet: PetKind;
  greet: Progress;
  animate: boolean;
  onReady: () => void;
}) {
  const still = useRef(0); // collection pets never run the parade choreography
  const { camera, look } = FRAMING[pet];

  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={animate ? "always" : "demand"}
      camera={{ position: camera, fov: 30, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={(state) => {
        state.camera.lookAt(...look);
        onReady();
      }}
    >
      <hemisphereLight args={["#FFF6E6", "#E9C9A0", 1.15]} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} color="#FFEBCB" />
      <directionalLight position={[-4, 2.5, -3]} intensity={0.8} color="#FFD9A6" />
      <ambientLight intensity={0.25} />

      {pet === "dog" ? (
        <GoldenRetriever progress={still} base={[-0.05, 0, 0]} showcase greet={greet} />
      ) : (
        <GreyTabby progress={still} base={[0, 0, 0]} showcase greet={greet} />
      )}

      <ContactShadows
        position={[0.1, GROUND_Y + 0.001, 0]}
        scale={4}
        far={1.2}
        blur={2.2}
        opacity={0.45}
        resolution={256}
        frames={animate ? Infinity : 1}
        color="#7A4A2A"
      />
    </Canvas>
  );
}

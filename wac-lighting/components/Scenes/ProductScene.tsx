"use client";

import { useRef, Suspense, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  Environment,
  PresentationControls,
  MeshReflectorMaterial,
  Text3D,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

function TrackLuminaire({ hovered }: { hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const lensRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!lensRef.current) return;
    const t = clock.getElapsedTime();
    const mat = lensRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = hovered ? 3 + Math.sin(t * 4) * 0.5 : 1.5 + Math.sin(t * 2) * 0.3;

    if (glowRef.current) {
      glowRef.current.scale.setScalar(hovered ? 1.3 + Math.sin(t * 3) * 0.1 : 1 + Math.sin(t * 2) * 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Track arm */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Head housing */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 20]} />
        <meshStandardMaterial
          color={hovered ? "#2a2520" : "#1e1e1e"}
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>

      {/* Trim ring */}
      <mesh position={[0, 0.44, 0]}>
        <torusGeometry args={[0.18, 0.015, 16, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Lens */}
      <mesh position={[0, 0.42, 0]} ref={lensRef}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 32]} />
        <meshStandardMaterial
          color="#E4C76B"
          emissive="#C9A84C"
          emissiveIntensity={2}
          metalness={0.3}
          roughness={0.1}
        />
      </mesh>

      {/* Glow sphere */}
      <mesh position={[0, 0.42, 0]} ref={glowRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial
          color="#C9A84C"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Light cone */}
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.55, 1.5, 20, 1, true]} />
        <meshBasicMaterial
          color="#C9A84C"
          transparent
          opacity={hovered ? 0.12 : 0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Spot light */}
      <spotLight
        position={[0, 0.4, 0]}
        angle={0.4}
        penumbra={0.5}
        intensity={hovered ? 15 : 8}
        color="#E4C76B"
        castShadow
        target-position={[0, -3, 0]}
      />
    </group>
  );
}

function ReflectivePlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050505"
        metalness={0.8}
        mirror={0}
      />
    </mesh>
  );
}

function ProductScene3D() {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[-5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[5, -3, -2]} intensity={0.5} color="#4060ff" />

      <Environment preset="city" background={false} />

      <PresentationControls
        global
        config={{ mass: 2, tension: 200 }}
        snap={{ mass: 4, tension: 200 }}
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <Float rotationIntensity={0.3} floatIntensity={0.3} speed={2}>
          <group
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            <TrackLuminaire hovered={hovered} />
          </group>
        </Float>
      </PresentationControls>

      <ReflectivePlane />
      <ContactShadows position={[0, -1.49, 0]} opacity={0.5} scale={8} blur={2} far={4} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.5}
          luminanceSmoothing={0.3}
          intensity={2}
          blendFunction={BlendFunction.ADD}
        />
      </EffectComposer>
    </>
  );
}

export function ProductShowcaseScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov: 45 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      shadows
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ProductScene3D />
      </Suspense>
    </Canvas>
  );
}

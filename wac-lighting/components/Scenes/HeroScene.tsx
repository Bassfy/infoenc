"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Float, MeshDistortMaterial, Stars, Environment, Trail } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

function LightBeam({
  position,
  color,
  intensity = 1,
}: {
  position: [number, number, number];
  color: string;
  intensity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = clock.getElapsedTime() * 0.3;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.05, 4, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color={color} intensity={intensity * 2} distance={5} />
    </group>
  );
}

function FloatingLuminaire({
  position,
  scale = 1,
  rotationSpeed = 0.3,
  floatOffset = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
  floatOffset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() + floatOffset;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.3;
    groupRef.current.rotation.y = t * rotationSpeed;

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Housing cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 16]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      {/* Lens disk */}
      <mesh position={[0, -0.22, 0]} ref={coreRef}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 32]} />
        <meshStandardMaterial
          color="#C9A84C"
          emissive="#C9A84C"
          emissiveIntensity={2}
          metalness={0.5}
          roughness={0.1}
        />
      </mesh>
      {/* Light cone */}
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.35, 0.8, 16, 1, true]} />
        <meshBasicMaterial
          color="#C9A84C"
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#E4C76B" intensity={3} distance={4} position={[0, -0.3, 0]} />
    </group>
  );
}

function ParticleField() {
  const count = 800;
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 4 + Math.random() * 8;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 3 + 0.5;
    }
    return { positions, sizes };
  }, []);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    particlesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.1;
  });

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(201,168,76,1)");
    grad.addColorStop(0.3, "rgba(201,168,76,0.6)");
    grad.addColorStop(1, "rgba(201,168,76,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        map={texture}
        transparent
        opacity={0.6}
        vertexColors={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function GeometricOrb({
  position,
  color,
  size = 0.4,
}: {
  position: [number, number, number];
  color: string;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.4;
    meshRef.current.rotation.y = t * 0.6;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
      <mesh ref={meshRef} castShadow>
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.05}
          envMapIntensity={3}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

function CameraRig({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0, y: 0 });

  useFrame(() => {
    targetRef.current.x += (mouse.current[0] * 1.5 - targetRef.current.x) * 0.03;
    targetRef.current.y += (mouse.current[1] * 0.8 - targetRef.current.y) * 0.03;

    camera.position.x = targetRef.current.x;
    camera.position.y = targetRef.current.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SceneContent({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  return (
    <>
      <CameraRig mouse={mouse} />

      <ambientLight intensity={0.1} />
      <pointLight position={[0, 10, 5]} intensity={2} color="#C9A84C" />
      <pointLight position={[-5, -5, 3]} intensity={1} color="#4060ff" />
      <pointLight position={[5, -3, 3]} intensity={1} color="#ff4060" />

      <ParticleField />

      <FloatingLuminaire position={[0, 1.5, 0]} scale={1.4} rotationSpeed={0.2} floatOffset={0} />
      <FloatingLuminaire position={[-2.5, 0.5, -1]} scale={0.9} rotationSpeed={0.4} floatOffset={2} />
      <FloatingLuminaire position={[2.5, 0.8, -1]} scale={1} rotationSpeed={0.3} floatOffset={4} />
      <FloatingLuminaire position={[-1.5, -0.8, 1]} scale={0.7} rotationSpeed={0.5} floatOffset={6} />
      <FloatingLuminaire position={[1.8, -0.5, 1]} scale={0.8} rotationSpeed={0.35} floatOffset={8} />

      <GeometricOrb position={[-3.5, 1.5, -2]} color="#C9A84C" size={0.3} />
      <GeometricOrb position={[3.5, -1, -2]} color="#888888" size={0.2} />
      <GeometricOrb position={[0, -2.5, -1]} color="#C9A84C" size={0.25} />

      <LightBeam position={[-2, 2, -3]} color="#C9A84C" intensity={0.5} />
      <LightBeam position={[2, 2, -3]} color="#E4C76B" intensity={0.4} />
      <LightBeam position={[0, 3, -2]} color="#ffffff" intensity={0.3} />

      <Stars radius={20} depth={10} count={1000} factor={2} saturation={0} fade speed={0.5} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={0.3}
          intensity={1.5}
          blendFunction={BlendFunction.ADD}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette
          eskil={false}
          offset={0.1}
          darkness={0.8}
        />
      </EffectComposer>
    </>
  );
}

export function HeroScene({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      dpr={[1, 2]}
      className="absolute inset-0"
    >
      <Suspense fallback={null}>
        <SceneContent mouse={mouse} />
      </Suspense>
    </Canvas>
  );
}

"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gradientPoles } from "@infoenc/ui/tokens";

/**
 * HeroOrb — the academy hero's live 3D moment (Phase 4 doc 05).
 *
 * A ~2,600-point particle sphere rendered with a custom GLSL ShaderMaterial whose color runs the
 * signature gradient poles (purple → pink → baby blue, from @infoenc/ui tokens). It rotates on its
 * own axis, breathes with a per-particle sine, and steers with the pointer for parallax. Additive
 * blending over the transparent canvas makes it read as a glowing orb against the aurora backdrop.
 *
 * Motion honors prefers-reduced-motion: when set, time is frozen so the orb renders as a single
 * still frame (NFR-062). No DOM color is hardcoded — the poles come from the token source of truth,
 * so a theme change flows through here too.
 */

const COUNT = 2600;
const RADIUS = 1.45;

function toVec3(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uSize;
  attribute float aSeed;
  varying float vDepth;
  varying float vSeed;

  mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
  mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

  void main() {
    vec3 p = position;
    // per-particle breathing
    p *= 1.0 + 0.05 * sin(uTime * 0.9 + aSeed * 6.2831);
    // spin on Y + pointer-steered tilt
    mat3 rot = rotY(uTime * 0.18 + uPointer.x * 0.8) * rotX(uPointer.y * 0.5 + 0.12);
    p = rot * p;
    vDepth = p.z;
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // perspective size attenuation
    gl_PointSize = uSize * (1.6 + 2.4 * (p.z + 1.0)) / -mv.z;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec3 cPurple;
  uniform vec3 cPink;
  uniform vec3 cBlue;
  varying float vDepth;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.0, d);
    a *= a; // soft glow falloff
    float m = vDepth * 0.5 + 0.5;
    vec3 col = mix(cPurple, cPink, smoothstep(0.0, 0.62, m));
    col = mix(col, cBlue, smoothstep(0.55, 1.0, m));
    float bright = 0.35 + 0.75 * m + 0.12 * sin(vSeed * 30.0);
    gl_FragColor = vec4(col * bright, a * 0.95);
  }
`;

function Orb({ reduced }: { reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const { size } = useThree();

  // Fibonacci sphere — even point distribution, no clustering at the poles.
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      positions[i * 3] = Math.cos(theta) * r * RADIUS;
      positions[i * 3 + 1] = y * RADIUS;
      positions[i * 3 + 2] = Math.sin(theta) * r * RADIUS;
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uSize: { value: Math.min(size.width, size.height) * 0.14 },
      cPurple: { value: toVec3(gradientPoles.purple) },
      cPink: { value: toVec3(gradientPoles.pink) },
      cBlue: { value: toVec3(gradientPoles.babyBlue) },
    }),
    // uSize recomputed on resize below; poles are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uSize.value = Math.min(state.size.width, state.size.height) * 0.14;
    // smooth the pointer toward the target
    const p = m.uniforms.uPointer.value as THREE.Vector2;
    p.x += (pointer.current.x - p.x) * 0.05;
    p.y += (pointer.current.y - p.y) * 0.05;
    // freeze time under reduced motion → a single still frame
    m.uniforms.uTime.value = reduced ? 0.6 : state.clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        args={[{ uniforms, vertexShader: vertex, fragmentShader: fragment }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function HeroOrb() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <Canvas
      aria-hidden
      frameloop={reduced ? "demand" : "always"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <Orb reduced={reduced} />
    </Canvas>
  );
}

export default HeroOrb;

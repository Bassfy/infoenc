"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroScene({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Lights
    scene.add(new THREE.AmbientLight(0x111111, 1));
    const keyLight = new THREE.PointLight(0xC9A84C, 8, 20);
    keyLight.position.set(0, 5, 5);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x4060ff, 3, 15);
    fillLight.position.set(-5, -5, 3);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0xff4060, 2, 15);
    rimLight.position.set(5, -3, 3);
    scene.add(rimLight);

    // ── Particle Field ──────────────────────────────────────────────
    const particleCount = 600;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 4 + Math.random() * 8;
      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));

    // Particle texture
    const ptCanvas = document.createElement("canvas");
    ptCanvas.width = 32; ptCanvas.height = 32;
    const ptCtx = ptCanvas.getContext("2d")!;
    const grad = ptCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(201,168,76,1)");
    grad.addColorStop(0.4, "rgba(201,168,76,0.5)");
    grad.addColorStop(1, "rgba(201,168,76,0)");
    ptCtx.fillStyle = grad; ptCtx.fillRect(0, 0, 32, 32);
    const pTex = new THREE.CanvasTexture(ptCanvas);

    const pMat = new THREE.PointsMaterial({ size: 0.07, map: pTex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Luminaires ──────────────────────────────────────────────────
    function makeLuminaire(x: number, y: number, z: number, scale: number) {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.scale.setScalar(scale);

      // Housing
      const housingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.95, roughness: 0.05 });
      const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.4, 16), housingMat);
      g.add(housing);

      // Trim ring
      const trimMat = new THREE.MeshStandardMaterial({ color: 0xC9A84C, metalness: 0.9, roughness: 0.1 });
      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.015, 16, 32), trimMat);
      trim.position.y = -0.21;
      g.add(trim);

      // Emissive lens
      const lensMat = new THREE.MeshStandardMaterial({ color: 0xE4C76B, emissive: new THREE.Color(0xC9A84C), emissiveIntensity: 2.5, metalness: 0.3, roughness: 0.1 });
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 32), lensMat);
      lens.position.y = -0.22;
      g.add(lens);

      // Light cone
      const coneMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 16, 1, true), coneMat);
      cone.position.y = -0.6;
      cone.rotation.x = Math.PI;
      g.add(cone);

      // Point light
      const light = new THREE.PointLight(0xE4C76B, 4, 4);
      light.position.y = -0.3;
      g.add(light);

      return { group: g, lens, lensMat, cone };
    }

    const luminaires = [
      makeLuminaire(0, 1.5, 0, 1.4),
      makeLuminaire(-2.5, 0.5, -1, 0.9),
      makeLuminaire(2.5, 0.8, -1, 1.0),
      makeLuminaire(-1.5, -0.8, 1, 0.7),
      makeLuminaire(1.8, -0.5, 1, 0.8),
    ];
    luminaires.forEach(({ group }) => scene.add(group));

    const FLOAT_OFFSETS = [0, 2, 4, 6, 8];
    const ROT_SPEEDS = [0.2, 0.4, 0.3, 0.5, 0.35];
    const BASE_Y = [1.5, 0.5, 0.8, -0.8, -0.5];

    // ── Geometric Orbs ───────────────────────────────────────────────
    function makeOrb(x: number, y: number, z: number, size: number, color: number) {
      const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.05 });
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    }
    const orbs = [
      makeOrb(-3.5, 1.5, -2, 0.3, 0xC9A84C),
      makeOrb(3.5, -1, -2, 0.2, 0x888888),
      makeOrb(0, -2.5, -1, 0.25, 0xC9A84C),
    ];

    // ── Camera target ────────────────────────────────────────────────
    const cameraTarget = { x: 0, y: 0 };

    // ── Resize handler ───────────────────────────────────────────────
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ───────────────────────────────────────────────
    let animId = 0;
    let startTime = Date.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (Date.now() - startTime) / 1000;

      // Mouse camera
      cameraTarget.x += (mouse.current[0] * 1.5 - cameraTarget.x) * 0.03;
      cameraTarget.y += (mouse.current[1] * 0.8 - cameraTarget.y) * 0.03;
      camera.position.x = cameraTarget.x;
      camera.position.y = cameraTarget.y;
      camera.lookAt(0, 0, 0);

      // Animate luminaires
      luminaires.forEach(({ group, lensMat, cone }, i) => {
        const offset = FLOAT_OFFSETS[i];
        const ft = t + offset;
        group.position.y = BASE_Y[i] + Math.sin(ft * 0.7) * 0.3;
        group.rotation.y = ft * ROT_SPEEDS[i];
        lensMat.emissiveIntensity = 1.5 + Math.sin(ft * 3) * 0.5;
        (cone.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(ft * 2) * 0.02;
      });

      // Animate orbs
      orbs.forEach((orb, i) => {
        orb.rotation.x = t * (0.3 + i * 0.1);
        orb.rotation.y = t * (0.5 + i * 0.1);
      });

      // Animate particles
      particles.rotation.y = t * 0.03;
      particles.rotation.x = Math.sin(t * 0.02) * 0.1;

      // Pulse key light
      keyLight.intensity = 6 + Math.sin(t * 1.5) * 2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [mouse]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}

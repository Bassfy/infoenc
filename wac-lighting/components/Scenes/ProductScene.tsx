"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ProductShowcaseScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0x222222, 2));
    const spotLight = new THREE.SpotLight(0xE4C76B, 20, 10, 0.4, 0.5);
    spotLight.position.set(0, 4, 2);
    spotLight.castShadow = true;
    scene.add(spotLight);
    const fillLight = new THREE.PointLight(0x4060ff, 2, 10);
    fillLight.position.set(-3, -2, -2);
    scene.add(fillLight);

    // ── Track Head Model ─────────────────────────────────────────────
    const model = new THREE.Group();

    // Arm
    const armMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95, roughness: 0.05 });
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), armMat);
    arm.position.y = 1.2;
    arm.castShadow = true;
    model.add(arm);

    // Housing
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.95, roughness: 0.05 });
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.5, 20), housingMat);
    housing.position.y = 0.7;
    housing.castShadow = true;
    model.add(housing);

    // Gold trim ring
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xC9A84C, metalness: 0.9, roughness: 0.1 });
    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 16, 32), trimMat);
    trim.position.y = 0.44;
    model.add(trim);

    // Emissive lens
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xE4C76B, emissive: new THREE.Color(0xC9A84C), emissiveIntensity: 2, metalness: 0.3, roughness: 0.1 });
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 32), lensMat);
    lens.position.y = 0.42;
    model.add(lens);

    // Glow sphere
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.06, depthWrite: false, blending: THREE.AdditiveBlending });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), glowMat);
    glow.position.y = 0.42;
    model.add(glow);

    // Light cone
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 20, 1, true), coneMat);
    cone.position.y = -0.3;
    cone.rotation.x = Math.PI;
    model.add(cone);

    scene.add(model);

    // Spot light from luminaire
    const lumLight = new THREE.SpotLight(0xE4C76B, 0, 6, 0.4, 0.5);
    lumLight.position.copy(lens.position).add(model.position);
    lumLight.position.y += 0.42;
    lumLight.target.position.set(0, -2, 0);
    scene.add(lumLight);
    scene.add(lumLight.target);

    // ── Reflective floor ─────────────────────────────────────────────
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.9, roughness: 0.1 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Resize
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", onResize);

    // Mouse drag
    let isDragging = false;
    let prevX = 0;
    let rotY = 0.3;

    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevX) * 0.01;
      prevX = e.clientX;
    };
    const onMouseUp = () => { isDragging = false; };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const onEnter = () => { isHoveredRef.current = true; };
    const onLeave = () => { isHoveredRef.current = false; };
    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);

    // Animation
    let animId = 0;
    const startTime = Date.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (Date.now() - startTime) / 1000;
      const hov = isHoveredRef.current;

      if (!isDragging) rotY += 0.003;
      model.rotation.y = rotY;

      // Pulse lens
      lensMat.emissiveIntensity = hov ? 3 + Math.sin(t * 4) * 0.5 : 1.5 + Math.sin(t * 2) * 0.3;
      (glowMat as THREE.MeshBasicMaterial).opacity = hov ? 0.12 + Math.sin(t * 3) * 0.02 : 0.05;
      (coneMat as THREE.MeshBasicMaterial).opacity = hov ? 0.1 : 0.05;
      lumLight.intensity = hov ? 8 + Math.sin(t * 3) * 2 : 4;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ display: "block" }}
    />
  );
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function TechScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    scene.add(new THREE.AmbientLight(0x111111, 2));
    const pLight = new THREE.PointLight(0xC9A84C, 6, 10);
    pLight.position.set(0, 0, 3);
    scene.add(pLight);

    // ── Network particles ─────────────────────────────────────────────
    const count = 150;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 1.5 + Math.random() * 2;
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.5,
        r * Math.cos(phi)
      ));
    }

    // Point cloud
    const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const pMat = new THREE.PointsMaterial({ color: 0xC9A84C, size: 0.05, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const pointCloud = new THREE.Points(pGeo, pMat);
    scene.add(pointCloud);

    // Edges
    const linePositions: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < 1.2) {
          linePositions.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lMat = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });
    const lines = new THREE.LineSegments(lGeo, lMat);
    scene.add(lines);

    // ── Core sphere ───────────────────────────────────────────────────
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xC9A84C, emissive: new THREE.Color(0xC9A84C), emissiveIntensity: 0.4, metalness: 0.9, roughness: 0.1, wireframe: true });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 2), coreMat);
    scene.add(core);

    // ── Energy rings ──────────────────────────────────────────────────
    const rings = [1.2, 1.8, 2.4].map((r, i) => {
      const mat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xE4C76B : 0xA0832E, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 16, 100), mat);
      scene.add(mesh);
      return mesh;
    });

    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", onResize);

    let animId = 0;
    const startTime = Date.now();
    const rotSpeeds = [0.5, -0.3, 0.2];

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (Date.now() - startTime) / 1000;

      pointCloud.rotation.y = t * 0.1;
      pointCloud.rotation.x = Math.sin(t * 0.07) * 0.3;
      lines.rotation.y = t * 0.1;
      lines.rotation.x = Math.sin(t * 0.07) * 0.3;

      core.rotation.y = t * 0.2;
      core.rotation.x = t * 0.1;

      rings.forEach((ring, i) => {
        ring.rotation.z = t * rotSpeeds[i];
        ring.rotation.x = Math.sin(t * 0.3 + i) * 0.2;
      });

      pLight.intensity = 5 + Math.sin(t * 2) * 2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}

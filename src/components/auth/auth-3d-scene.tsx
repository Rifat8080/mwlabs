"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Auth3DScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.35, 8.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const group = new THREE.Group();
    scene.add(group);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25, 4),
      new THREE.MeshStandardMaterial({ color: 0x1677ff, emissive: 0x063b9e, emissiveIntensity: 0.65, metalness: 0.7, roughness: 0.2 }),
    );
    group.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.48, 2),
      new THREE.MeshBasicMaterial({ color: 0x70e7ff, wireframe: true, transparent: true, opacity: 0.42 }),
    );
    group.add(shell);

    const ringMaterials = [0x3b82f6, 0x22d3ee, 0x93c5fd];
    ringMaterials.forEach((color, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.9 + index * 0.34, 0.012 + index * 0.004, 8, 96),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 - index * 0.14 }),
      );
      ring.rotation.set(index * 0.8, index * 0.48, index * 0.36);
      group.add(ring);
    });

    const pointGeometry = new THREE.SphereGeometry(0.065, 12, 12);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x9ff6ff });
    const points = [
      [2.35, 0.1, 0.2],
      [-2.1, 0.8, -0.25],
      [0.3, -1.95, 0.1],
      [-0.75, 1.75, 0.2],
    ].map(([x, y, z]) => {
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.set(x, y, z);
      group.add(point);
      return point;
    });

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(180 * 3);
    for (let index = 0; index < starPositions.length; index += 3) {
      starPositions[index] = (Math.random() - 0.5) * 11;
      starPositions[index + 1] = (Math.random() - 0.5) * 7;
      starPositions[index + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x8bdcf8, size: 0.025, transparent: true, opacity: 0.7 }));
    scene.add(stars);

    scene.add(new THREE.AmbientLight(0x9ccfff, 1.8));
    const keyLight = new THREE.PointLight(0x2dd4ff, 18, 12);
    keyLight.position.set(3, 2, 5);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x2563eb, 12, 10);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const move = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", move);
    resize();

    let frame = 0;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      const elapsed = time * 0.00035;
      pointer.lerp(target, 0.035);
      group.rotation.y = (reducedMotion ? 0.18 : elapsed) + pointer.x * 0.16;
      group.rotation.x = pointer.y * 0.1;
      core.rotation.x = reducedMotion ? 0 : elapsed * 0.7;
      shell.rotation.y = reducedMotion ? 0 : -elapsed * 0.55;
      points.forEach((point, index) => { point.scale.setScalar(1 + Math.sin(time * 0.002 + index) * 0.24); });
      stars.rotation.y = reducedMotion ? 0 : elapsed * 0.05;
      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", move);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
    };
  }, []);

  return <canvas ref={canvasRef} aria-label="Interactive 3D visualization of the M&W Command workspace" className="auth-scene-canvas" />;
}

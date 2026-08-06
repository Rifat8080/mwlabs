"use client";

import { useRef } from "react";
import { Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";

function GrowthCore() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.1;
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, state.pointer.y * 0.18 + Math.sin(state.clock.elapsedTime * 0.3) * 0.08, 3, delta);
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, -state.pointer.x * 0.12, 3, delta);
  });

  return (
    <group ref={group}>
      <Float speed={1.7} rotationIntensity={0.65} floatIntensity={0.75}>
        <mesh>
          <torusKnotGeometry args={[1.18, 0.34, 180, 28, 2, 3]} />
          <MeshTransmissionMaterial
            color="#02d1fa"
            thickness={0.7}
            roughness={0.18}
            transmission={0.9}
            chromaticAberration={0.08}
          />
        </mesh>
      </Float>
      {[0, 1, 2].map((ring) => (
        <mesh key={ring} rotation={[ring * 0.76, ring * 0.44, ring * 0.9]}>
          <torusGeometry args={[2 + ring * 0.24, 0.012, 8, 160]} />
          <meshBasicMaterial color={ring === 1 ? "#02d1fa" : "#155dfc"} transparent opacity={0.48 - ring * 0.08} />
        </mesh>
      ))}
      {Array.from({ length: 9 }).map((_, index) => {
        const angle = (index / 9) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 2.2, Math.sin(angle * 1.5) * 0.7, Math.sin(angle) * 1.3]}>
            <sphereGeometry args={[index % 3 === 0 ? 0.09 : 0.045, 16, 16]} />
            <meshStandardMaterial color={index % 3 === 0 ? "#02d1fa" : "#dbeafe"} emissive={index % 3 === 0 ? "#0188ec" : "#012788"} emissiveIntensity={1.4} />
          </mesh>
        );
      })}
    </group>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0" aria-label="Animated 3D digital growth network">
      <Canvas camera={{ position: [0, 0, 6.4], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 4, 5]} intensity={4} color="#ffffff" />
      <pointLight position={[-3, -2, 3]} intensity={45} color="#02d1fa" />
      <Sparkles count={42} scale={[5.5, 4.2, 3]} size={1.5} speed={0.25} color="#155dfc" opacity={0.45} />
      <GrowthCore />
      </Canvas>
    </div>
  );
}

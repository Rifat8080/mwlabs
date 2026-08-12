"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bot, Clapperboard, Code2, Megaphone, Palette, Target, Zap } from "lucide-react";
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  MathUtils,
  type Group,
  type Mesh,
  type PointLight,
  TubeGeometry,
  Vector3,
} from "three";

const flowingServices = [
  { id: "strategy", label: "Growth Strategy", icon: Target },
  { id: "branding", label: "Branding & Design", icon: Palette },
  { id: "product", label: "Web Development", icon: Code2 },
  { id: "content", label: "Video Editing", icon: Clapperboard },
  { id: "marketing", label: "Digital Marketing", icon: Megaphone },
  { id: "automation", label: "AI Automation", icon: Bot },
];

const serviceLabelPositions = [
  { left: "10%", top: "69%" },
  { left: "65%", top: "51%" },
  { left: "14%", top: "16%" },
  { left: "61%", top: "73%" },
  { left: "66%", top: "17%" },
  { left: "42%", top: "84%" },
];
const CURVE_SAMPLES = 320;
const RIBBON_SEGMENTS = 420;
const RIBBON_HALF_WIDTH = 0.46;
const RIBBON_HALF_DEPTH = 0.16;
const RIBBON_BEVEL = 0.095;

const deepNavy = new Color("#010b29");
const cobalt = new Color("#052c9f");
const electricBlue = new Color("#0758e8");
const logoCyan = new Color("#05c4dd");
const logoViolet = new Color("#b65cff");

function logoColorAt(x: number, y = 0) {
  const progress = MathUtils.clamp((x + 4.18) / 7.8, 0, 1);
  if (progress < 0.38) {
    const height = MathUtils.clamp((y + 1.65) / 3.3, 0, 1);
    const leftTone = deepNavy.clone().lerp(logoViolet, height);
    return leftTone.lerp(cobalt, (progress / 0.38) * 0.58);
  }
  if (progress < 0.66) return cobalt.clone().lerp(electricBlue, (progress - 0.38) / 0.28);
  return electricBlue.clone().lerp(logoCyan, (progress - 0.66) / 0.34);
}

function createLogoCurve() {
  const points: Vector3[] = [];

  for (let index = 0; index < CURVE_SAMPLES; index += 1) {
    const angle = (index / CURVE_SAMPLES) * Math.PI * 2;
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);

    // This asymmetric Gerono loop reproduces the wide left lobe, tighter cyan
    // lobe, and genuine over-under crossover of the M&W ribbon mark.
    const x = cosine * (cosine < 0 ? 3.74 : 3.25);
    const y = Math.sin(angle * 2) * 1.62 * (cosine < 0 ? 1.035 : 0.975);
    const z = sine * 0.56 + Math.sin(angle * 2) * 0.035;
    points.push(new Vector3(x, y, z));
  }

  return new CatmullRomCurve3(points, true, "centripetal", 0.42);
}

function createRoundedRibbonSection() {
  const section: Array<[number, number]> = [];
  const corners = [
    { x: RIBBON_HALF_WIDTH - RIBBON_BEVEL, z: -RIBBON_HALF_DEPTH + RIBBON_BEVEL, start: -Math.PI / 2 },
    { x: RIBBON_HALF_WIDTH - RIBBON_BEVEL, z: RIBBON_HALF_DEPTH - RIBBON_BEVEL, start: 0 },
    { x: -RIBBON_HALF_WIDTH + RIBBON_BEVEL, z: RIBBON_HALF_DEPTH - RIBBON_BEVEL, start: Math.PI / 2 },
    { x: -RIBBON_HALF_WIDTH + RIBBON_BEVEL, z: -RIBBON_HALF_DEPTH + RIBBON_BEVEL, start: Math.PI },
  ];

  corners.forEach((corner) => {
    for (let step = 0; step < 4; step += 1) {
      const angle = corner.start + (step / 4) * (Math.PI / 2);
      section.push([
        corner.x + Math.cos(angle) * RIBBON_BEVEL,
        corner.z + Math.sin(angle) * RIBBON_BEVEL,
      ]);
    }
  });

  return section;
}

function createLogoRibbon(curve: CatmullRomCurve3) {
  const geometry = new BufferGeometry();
  const section = createRoundedRibbonSection();
  const frames = curve.computeFrenetFrames(RIBBON_SEGMENTS, true);
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let segment = 0; segment < RIBBON_SEGMENTS; segment += 1) {
    const point = curve.getPointAt(segment / RIBBON_SEGMENTS);
    const normal = frames.normals[segment];
    const binormal = frames.binormals[segment];

    section.forEach(([side, depth]) => {
      const vertex = point
        .clone()
        .addScaledVector(normal, side)
        .addScaledVector(binormal, depth);
      const color = logoColorAt(point.x, point.y);
      positions.push(vertex.x, vertex.y, vertex.z);
      colors.push(color.r, color.g, color.b);
    });
  }

  for (let segment = 0; segment < RIBBON_SEGMENTS; segment += 1) {
    const nextSegment = (segment + 1) % RIBBON_SEGMENTS;
    for (let side = 0; side < section.length; side += 1) {
      const nextSide = (side + 1) % section.length;
      const a = segment * section.length + side;
      const b = segment * section.length + nextSide;
      const c = nextSegment * section.length + side;
      const d = nextSegment * section.length + nextSide;
      indices.push(a, c, b, b, c, d);
    }
  }

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createOrbitCurve(startAngle: number, endAngle: number) {
  const points: Vector3[] = [];

  for (let index = 0; index <= 64; index += 1) {
    const progress = index / 64;
    const angle = MathUtils.lerp(startAngle, endAngle, progress);
    points.push(
      new Vector3(
        -0.24 + Math.cos(angle) * 4.18,
        Math.sin(angle) * 2.27,
        -0.27 - Math.sin(progress * Math.PI) * 0.07,
      ),
    );
  }

  return new CatmullRomCurve3(points, false, "centripetal", 0.35);
}

function createColoredOrbit(curve: CatmullRomCurve3) {
  const geometry = new TubeGeometry(curve, 128, 0.017, 10, false);
  const positions = geometry.getAttribute("position");
  const colors: number[] = [];

  for (let index = 0; index < positions.count; index += 1) {
    const color = logoColorAt(positions.getX(index), positions.getY(index));
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

function InteractiveKeyLight() {
  const light = useRef<PointLight>(null);

  useFrame((state, delta) => {
    if (!light.current) return;
    light.current.position.x = MathUtils.damp(light.current.position.x, 2.2 + state.pointer.x * 2.4, 3.2, delta);
    light.current.position.y = MathUtils.damp(light.current.position.y, 2.8 + state.pointer.y * 1.5, 3.2, delta);
  });

  return <pointLight ref={light} position={[2.2, 2.8, 5]} intensity={10} distance={13} decay={2} color="#e5fbff" />;
}

function OrbitAccents() {
  const topNode = useRef<Mesh>(null);
  const bottomNode = useRef<Mesh>(null);
  const reducedMotion = useRef(false);
  const topCurve = useMemo(() => createOrbitCurve(1.72, 0.12), []);
  const bottomCurve = useMemo(() => createOrbitCurve(3.25, 4.79), []);
  const topGeometry = useMemo(() => createColoredOrbit(topCurve), [topCurve]);
  const bottomGeometry = useMemo(() => createColoredOrbit(bottomCurve), [bottomCurve]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useFrame((state) => {
    const elapsed = reducedMotion.current ? 0 : state.clock.elapsedTime;
    const topProgress = 0.34 + Math.sin(elapsed * 0.28) * 0.045;
    const bottomProgress = 0.57 + Math.sin(elapsed * 0.25 + 1.2) * 0.045;
    topNode.current?.position.copy(topCurve.getPointAt(topProgress)).setZ(0.15);
    bottomNode.current?.position.copy(bottomCurve.getPointAt(bottomProgress)).setZ(0.15);
  });

  return (
    <group>
      <mesh geometry={topGeometry}>
        <meshPhysicalMaterial vertexColors roughness={0.38} metalness={0.01} clearcoat={0.45} transparent opacity={0.72} />
      </mesh>
      <mesh geometry={bottomGeometry}>
        <meshPhysicalMaterial vertexColors roughness={0.38} metalness={0.01} clearcoat={0.45} transparent opacity={0.72} />
      </mesh>
      <mesh ref={topNode}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshPhysicalMaterial color="#05c4dd" roughness={0.22} clearcoat={0.8} />
      </mesh>
      <mesh ref={bottomNode}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshPhysicalMaterial color="#073fc2" roughness={0.22} clearcoat={0.8} />
      </mesh>
    </group>
  );
}

function GrowthPulse({ curve, activeIndex }: { curve: CatmullRomCurve3; activeIndex: number }) {
  const pulse = useRef<Mesh>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useFrame((state) => {
    if (!pulse.current) return;
    const elapsed = reducedMotion.current ? 0 : state.clock.elapsedTime;
    const anchor = (activeIndex + 0.72) / flowingServices.length;
    const progress = (anchor + Math.sin(elapsed * 0.9) * 0.01 + 1) % 1;
    pulse.current.position.copy(curve.getPointAt(progress));
    pulse.current.scale.setScalar(reducedMotion.current ? 1 : 1 + Math.sin(elapsed * 2.8) * 0.13);
  });

  return (
    <mesh ref={pulse}>
      <sphereGeometry args={[0.06, 24, 24]} />
      <meshPhysicalMaterial color="#e8fdff" emissive="#49ddf5" emissiveIntensity={0.5} roughness={0.12} clearcoat={1} />
    </mesh>
  );
}

function SystemHalo({ activeId }: { activeId: string }) {
  const halo = useRef<Group>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useFrame((state, delta) => {
    if (!halo.current) return;
    const target = reducedMotion.current ? 0 : Math.sin(state.clock.elapsedTime * 0.2) * 0.014;
    halo.current.rotation.z = MathUtils.damp(halo.current.rotation.z, target, 2.5, delta);
  });

  return (
    <group ref={halo} position={[-0.18, 0, -0.82]}>
      <mesh scale={[1.28, 0.72, 1]}>
        <ringGeometry args={[2.88, 2.895, 160]} />
        <meshBasicMaterial color="#155dfc" transparent opacity={0.13} depthWrite={false} />
      </mesh>
      <mesh scale={[1.05, 0.59, 1]} position={[0, 0, 0.02]}>
        <ringGeometry args={[2.88, 2.9, 160]} />
        <meshBasicMaterial color="#02d1fa" transparent opacity={0.09} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.03]}>
        <circleGeometry args={[2.54, 128]} />
        <meshBasicMaterial color="#dbeafe" transparent opacity={0.04} depthWrite={false} />
      </mesh>
      {flowingServices.map((service, index) => {
        const angle = (index / flowingServices.length) * Math.PI * 2;
        const isActive = service.id === activeId;
        return (
          <mesh key={service.id} position={[Math.cos(angle) * 3.68, Math.sin(angle) * 2.08, 0.08]}>
            <sphereGeometry args={[isActive ? 0.06 : 0.036, 20, 20]} />
            <meshBasicMaterial color={isActive ? "#155dfc" : "#93c5fd"} transparent opacity={isActive ? 0.96 : 0.42} />
          </mesh>
        );
      })}
    </group>
  );
}

function ExactLogoMark({ activeId, activeIndex }: { activeId: string; activeIndex: number }) {
  const root = useRef<Group>(null);
  const reducedMotion = useRef(false);
  const { viewport } = useThree();
  const curve = useMemo(() => createLogoCurve(), []);
  const geometry = useMemo(() => createLogoRibbon(curve), [curve]);
  const compact = viewport.width < 6;
  const responsiveScale = compact
    ? Math.min(0.72, viewport.width / 9.35)
    : Math.min(0.88, viewport.width / 10.35);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useFrame((state, delta) => {
    if (!root.current) return;
    const reduce = reducedMotion.current;
    const baseY = compact ? 0.16 : 0;
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, reduce ? -0.035 : state.pointer.y * 0.05 - 0.035, 4.2, delta);
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, reduce ? -0.025 : state.pointer.x * 0.085 - 0.025, 4.2, delta);
    root.current.rotation.z = MathUtils.damp(root.current.rotation.z, reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.32) * 0.007, 3, delta);
    root.current.position.y = MathUtils.damp(root.current.position.y, reduce ? baseY : baseY + Math.sin(state.clock.elapsedTime * 0.42) * 0.025, 3, delta);
    root.current.scale.setScalar(MathUtils.damp(root.current.scale.x, responsiveScale, 4, delta));
  });

  return (
    <group ref={root} scale={responsiveScale} position={[0, compact ? 0.16 : 0, 0]} rotation={[-0.035, -0.025, 0]}>
      <SystemHalo activeId={activeId} />
      <OrbitAccents />
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          vertexColors
          side={DoubleSide}
          roughness={0.24}
          metalness={0.045}
          clearcoat={0.88}
          clearcoatRoughness={0.13}
          ior={1.42}
          specularIntensity={0.52}
          specularColor="#eef8ff"
          sheen={0.13}
          sheenColor="#8dddf2"
          sheenRoughness={0.5}
          envMapIntensity={0.72}
          reflectivity={0.54}
        />
      </mesh>
      <GrowthPulse curve={curve} activeIndex={activeIndex} />
    </group>
  );
}

function ServiceLabels({ activeIndex, onActivate }: { activeIndex: number; onActivate: (index: number) => void }) {
  const activeService = flowingServices[activeIndex];
  const ActiveIcon = activeService.icon;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20 hidden xl:block">
        {flowingServices.map((service, index) => {
          const active = index === activeIndex;
          const Icon = service.icon;
          const position = serviceLabelPositions[index];

          return (
            <button
              type="button"
              key={service.id}
              className={`pointer-events-auto absolute flex w-[13rem] items-center gap-3 rounded-[1.15rem] border bg-white/94 p-3 pr-4 text-slate-900 backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-500 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-600 ${active ? "-translate-y-1.5 border-blue-200 shadow-[0_22px_50px_rgba(37,99,235,0.2)] ring-1 ring-blue-100" : "border-white shadow-[0_14px_38px_rgba(15,23,42,0.1)] hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_18px_42px_rgba(37,99,235,0.14)]"}`}
              style={{ left: position.left, top: position.top }}
              onPointerEnter={() => onActivate(index)}
              onFocus={() => onActivate(index)}
              onClick={() => onActivate(index)}
              aria-pressed={active}
              aria-label={`Explore ${service.label}`}
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-500 ${active ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.24)]" : "bg-blue-50 text-blue-600"}`}>
                <Icon className="size-[1.1rem]" strokeWidth={2.3} />
              </span>
              <span className="whitespace-nowrap text-left text-[0.78rem] font-black leading-tight tracking-[-0.025em]">
                {service.label}
              </span>
            </button>
          );
        })}

        <div className="absolute left-[2%] top-[45%] flex min-w-[13.5rem] items-center gap-3 rounded-[1.15rem] border border-white bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.11)] backdrop-blur-xl">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.24)]">
            <Zap className="size-[1.05rem] fill-current" />
          </span>
          <span className="text-left">
            <span className="block text-[0.48rem] font-black uppercase tracking-[0.19em] text-slate-400">Launch stack</span>
            <span className="mt-1 block text-[0.76rem] font-black leading-none tracking-[-0.025em] text-slate-950">Strategy + Build + Growth</span>
          </span>
        </div>

        <div className="absolute right-[5%] top-[40%] rounded-[1.1rem] bg-slate-900 px-4 py-3.5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.2)]">
          <span className="block text-[0.47rem] font-black uppercase tracking-[0.18em] text-cyan-200">Optimized</span>
          <span className="mt-1 block text-[1.5rem] font-black leading-none tracking-[-0.05em]">98<span className="text-[0.72rem]">%</span></span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-3 z-20 xl:hidden">
        <button
          type="button"
          className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-white/95 bg-white/94 p-2.5 pr-3 shadow-[0_16px_45px_rgba(37,99,235,0.13)] transition hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(37,99,235,0.16)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-600"
          onClick={() => onActivate((activeIndex + 1) % flowingServices.length)}
          aria-label={`Showing ${activeService.label}. Show next connected service`}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-600 to-cyan-400 text-white shadow-[0_8px_22px_rgba(34,211,238,0.22)]">
            <ActiveIcon className="size-4" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[0.72rem] font-black leading-none tracking-[-0.02em] text-slate-900">
              {activeService.label}
            </span>
            <span className="mt-1 block text-[0.43rem] font-black uppercase tracking-[0.17em] text-blue-600">Connected growth service</span>
          </span>
          <span className="text-[0.46rem] font-black tabular-nums tracking-[0.12em] text-slate-400">
            0{activeIndex + 1}/06
          </span>
        </button>
      </div>
    </>
  );
}

export function HeroScene() {
  const [activeIndex, setActiveIndex] = useState(0);
  const interactionPauseUntil = useRef(0);
  const activeService = flowingServices[activeIndex];

  function activateService(index: number) {
    interactionPauseUntil.current = Date.now() + 6000;
    setActiveIndex(index);
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const interval = window.setInterval(() => {
      if (Date.now() < interactionPauseUntil.current) return;
      setActiveIndex((current) => (current + 1) % flowingServices.length);
    }, 2400);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0">
      <span className="sr-only">Interactive three-dimensional M&amp;W ribbon connecting six agency disciplines into one growth system.</span>
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => { gl.toneMappingExposure = 0.98; }}
      >
        <ambientLight intensity={0.48} />
        <hemisphereLight args={["#ffffff", "#c8d8ff", 0.92]} />
        <directionalLight castShadow position={[4.8, 5.9, 7.2]} intensity={1.55} color="#ffffff" shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[-5.2, 1.2, 4.3]} intensity={0.66} color="#9dbdff" />
        <directionalLight position={[4.2, -2.8, 3.4]} intensity={0.46} color="#b9f5ff" />
        <spotLight position={[0, 4.5, 6.8]} angle={0.38} penumbra={0.5} intensity={2.5} color="#f8fdff" castShadow />
        <InteractiveKeyLight />

        <Environment resolution={128}>
          <Lightformer form="rect" intensity={1.25} color="#ffffff" position={[0, 5, 4]} rotation-x={Math.PI / 2} scale={[5, 1.4, 1]} />
          <Lightformer form="rect" intensity={0.78} color="#c8efff" position={[4, 0, 3]} rotation-y={Math.PI / 2} scale={[3, 1, 1]} />
          <Lightformer form="rect" intensity={0.56} color="#8aaeff" position={[-4, -1, 2]} rotation-y={-Math.PI / 2} scale={[3, 1, 1]} />
        </Environment>

        <ExactLogoMark activeId={activeService.id} activeIndex={activeIndex} />
        <ContactShadows position={[-0.2, -2.12, -0.72]} opacity={0.08} scale={9} blur={3.2} far={4.5} color="#1d4ed8" />
      </Canvas>
      <ServiceLabels activeIndex={activeIndex} onActivate={activateService} />
    </div>
  );
}

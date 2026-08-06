"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ContactShadows, Environment, Html, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  MathUtils,
  type Group,
  type Mesh,
  type PointLight,
  TubeGeometry,
  Vector3,
} from "three";

type GrowthStep = {
  id: string;
  action: string;
  service: string;
  hint: string;
};

const growthSteps: GrowthStep[] = [
  { id: "strategy", action: "Plan", service: "Growth strategy", hint: "Begin with a clear strategy and a reason to choose you." },
  { id: "product", action: "Build", service: "Web & software", hint: "Now build the experience where interest becomes trust." },
  { id: "marketing", action: "Acquire", service: "Digital marketing", hint: "With the foundation ready, create qualified demand." },
  { id: "automation", action: "Scale", service: "AI & automation", hint: "Finally, automate delivery and compound what works." },
];

const shuffledSteps = [growthSteps[3], growthSteps[0], growthSteps[2], growthSteps[1]];

const flowingServices = [
  { id: "strategy", label: "Growth strategy" },
  { id: "branding", label: "Branding & design" },
  { id: "product", label: "Web & software" },
  { id: "content", label: "Video & content" },
  { id: "marketing", label: "Digital marketing" },
  { id: "automation", label: "AI & automation" },
];

const CURVE_SAMPLES = 320;
const RIBBON_SEGMENTS = 420;
const RIBBON_HALF_WIDTH = 0.52;
const RIBBON_HALF_DEPTH = 0.155;
const RIBBON_BEVEL = 0.105;

const deepNavy = new Color("#010b29");
const cobalt = new Color("#052c9f");
const electricBlue = new Color("#0758e8");
const logoCyan = new Color("#05c4dd");

function logoColorAt(x: number) {
  const progress = MathUtils.clamp((x + 4.18) / 7.8, 0, 1);
  if (progress < 0.38) return deepNavy.clone().lerp(cobalt, progress / 0.38);
  if (progress < 0.66) return cobalt.clone().lerp(electricBlue, (progress - 0.38) / 0.28);
  return electricBlue.clone().lerp(logoCyan, (progress - 0.66) / 0.34);
}

function createLogoCurve() {
  const points: Vector3[] = [];

  for (let index = 0; index < CURVE_SAMPLES; index += 1) {
    const angle = (index / CURVE_SAMPLES) * Math.PI * 2;
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);

    // A sculpted Gerono loop produces the broad oval lobes and clean diagonal
    // crossover of the M&W mark. The left lobe is deliberately larger.
    const x = cosine * (cosine < 0 ? 3.74 : 3.25);
    const y = Math.sin(angle * 2) * 1.62 * (cosine < 0 ? 1.035 : 0.975);
    // Opposing depth at the centre creates a genuine over/under crossover.
    const z = sine * 0.56 + Math.sin(angle * 2) * 0.035;
    points.push(new Vector3(x, y, z));
  }

  return new CatmullRomCurve3(points, true, "centripetal", 0.42);
}

function createRoundedCrossSection() {
  const points: Array<[number, number]> = [];
  const bevelSteps = 4;
  const corners = [
    { x: RIBBON_HALF_WIDTH - RIBBON_BEVEL, y: RIBBON_HALF_DEPTH - RIBBON_BEVEL, start: 0 },
    { x: -RIBBON_HALF_WIDTH + RIBBON_BEVEL, y: RIBBON_HALF_DEPTH - RIBBON_BEVEL, start: Math.PI / 2 },
    { x: -RIBBON_HALF_WIDTH + RIBBON_BEVEL, y: -RIBBON_HALF_DEPTH + RIBBON_BEVEL, start: Math.PI },
    { x: RIBBON_HALF_WIDTH - RIBBON_BEVEL, y: -RIBBON_HALF_DEPTH + RIBBON_BEVEL, start: Math.PI * 1.5 },
  ];

  corners.forEach((corner) => {
    for (let step = 0; step <= bevelSteps; step += 1) {
      const angle = corner.start + (step / bevelSteps) * (Math.PI / 2);
      points.push([
        corner.x + Math.cos(angle) * RIBBON_BEVEL,
        corner.y + Math.sin(angle) * RIBBON_BEVEL,
      ]);
    }
  });

  return points;
}

function createLogoRibbon(curve: CatmullRomCurve3) {
  const geometry = new BufferGeometry();
  const crossSection = createRoundedCrossSection();
  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const tangent = new Vector3();
  const baseWidth = new Vector3();
  const baseDepth = new Vector3();
  const widthAxis = new Vector3();
  const depthAxis = new Vector3();
  const vertex = new Vector3();

  for (let segment = 0; segment < RIBBON_SEGMENTS; segment += 1) {
    const progress = segment / RIBBON_SEGMENTS;
    const center = curve.getPointAt(progress);
    tangent.copy(curve.getTangentAt(progress)).normalize();
    baseWidth.set(-tangent.y, tangent.x, 0).normalize();
    baseDepth.crossVectors(tangent, baseWidth).normalize();

    // The outer turns roll into camera space while the crossing remains broad.
    // A smaller secondary roll prevents the band from feeling mathematically rigid.
    const pathAngle = progress * Math.PI * 2;
    const twist = Math.cos(pathAngle) * 0.43 + Math.sin(pathAngle * 2) * 0.055;
    const cosine = Math.cos(twist);
    const sine = Math.sin(twist);
    widthAxis.copy(baseWidth).multiplyScalar(cosine).addScaledVector(baseDepth, sine).normalize();
    depthAxis.copy(baseDepth).multiplyScalar(cosine).addScaledVector(baseWidth, -sine).normalize();

    const widthScale = 0.82 + Math.abs(Math.cos(pathAngle)) * 0.18;
    const depthScale = 0.9 + Math.abs(Math.cos(pathAngle)) * 0.1;

    crossSection.forEach(([width, depth]) => {
      vertex.copy(center).addScaledVector(widthAxis, width * widthScale).addScaledVector(depthAxis, depth * depthScale);
      vertices.push(vertex.x, vertex.y, vertex.z);

      // The underside is intentionally darker, while direct studio lighting
      // produces the soft blue/cyan highlights instead of an emissive glow.
      const faceLight = MathUtils.lerp(0.68, 1, MathUtils.clamp((depth / RIBBON_HALF_DEPTH + 1) / 2, 0, 1));
      const pathLight = 0.94 + Math.max(0, Math.sin(pathAngle + 0.5)) * 0.06;
      const color = logoColorAt(center.x).multiplyScalar(faceLight * pathLight);
      colors.push(color.r, color.g, color.b);
    });
  }

  const ringSize = crossSection.length;
  for (let segment = 0; segment < RIBBON_SEGMENTS; segment += 1) {
    const nextSegment = (segment + 1) % RIBBON_SEGMENTS;
    for (let edge = 0; edge < ringSize; edge += 1) {
      const nextEdge = (edge + 1) % ringSize;
      const a = segment * ringSize + edge;
      const b = nextSegment * ringSize + edge;
      const c = nextSegment * ringSize + nextEdge;
      const d = segment * ringSize + nextEdge;
      indices.push(a, c, b, a, d, c);
    }
  }

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createOrbitCurve(startAngle: number, endAngle: number) {
  const points: Vector3[] = [];
  const samples = 64;

  for (let index = 0; index <= samples; index += 1) {
    const progress = index / samples;
    const angle = MathUtils.lerp(startAngle, endAngle, progress);
    points.push(new Vector3(-0.24 + Math.cos(angle) * 4.18, Math.sin(angle) * 2.27, -0.27 - Math.sin(progress * Math.PI) * 0.07));
  }

  return new CatmullRomCurve3(points, false, "centripetal", 0.35);
}

function createColoredOrbit(curve: CatmullRomCurve3) {
  const geometry = new TubeGeometry(curve, 128, 0.019, 10, false);
  const positions = geometry.getAttribute("position");
  const colors: number[] = [];

  for (let index = 0; index < positions.count; index += 1) {
    const color = logoColorAt(positions.getX(index));
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

function InteractiveKeyLight() {
  const light = useRef<PointLight>(null);

  useFrame((state, delta) => {
    if (!light.current) return;
    light.current.position.x = MathUtils.damp(light.current.position.x, 2.4 + state.pointer.x * 2.8, 3.2, delta);
    light.current.position.y = MathUtils.damp(light.current.position.y, 2.8 + state.pointer.y * 1.8, 3.2, delta);
  });

  return <pointLight ref={light} position={[2.4, 2.8, 5]} intensity={19} distance={13} decay={2} color="#dff8ff" />;
}

function OrbitAccents({ complete }: { complete: boolean }) {
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
    const multiplier = complete ? 1.65 : 1;
    const topProgress = 0.34 + Math.sin(elapsed * 0.42 * multiplier) * 0.05;
    const bottomProgress = 0.57 + Math.sin(elapsed * 0.38 * multiplier + 1.2) * 0.05;
    topNode.current?.position.copy(topCurve.getPointAt(topProgress)).setZ(0.15);
    bottomNode.current?.position.copy(bottomCurve.getPointAt(bottomProgress)).setZ(0.15);
  });

  return (
    <group>
      <mesh geometry={topGeometry}>
        <meshPhysicalMaterial vertexColors roughness={0.32} metalness={0.025} clearcoat={0.55} clearcoatRoughness={0.24} transparent opacity={0.86} />
      </mesh>
      <mesh geometry={bottomGeometry}>
        <meshPhysicalMaterial vertexColors roughness={0.32} metalness={0.025} clearcoat={0.55} clearcoatRoughness={0.24} transparent opacity={0.86} />
      </mesh>
      <mesh ref={topNode}>
        <sphereGeometry args={[0.098, 32, 32]} />
        <meshPhysicalMaterial color="#05c4dd" roughness={0.18} metalness={0.025} clearcoat={0.9} clearcoatRoughness={0.12} />
      </mesh>
      <mesh ref={bottomNode}>
        <sphereGeometry args={[0.098, 32, 32]} />
        <meshPhysicalMaterial color="#073fc2" roughness={0.18} metalness={0.025} clearcoat={0.9} clearcoatRoughness={0.12} />
      </mesh>
    </group>
  );
}

function GrowthPulse({ curve, activeCount, complete }: { curve: CatmullRomCurve3; activeCount: number; complete: boolean }) {
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
    if (!pulse.current || activeCount === 0) return;
    const elapsed = reducedMotion.current ? 0 : state.clock.elapsedTime;
    const anchoredProgress = activeCount / growthSteps.length - 0.035;
    const progress = complete
      ? (elapsed * 0.07) % 1
      : MathUtils.clamp(anchoredProgress + Math.sin(elapsed * 1.2) * 0.012, 0, 0.96);
    pulse.current.position.copy(curve.getPointAt(progress));
    const scale = complete && !reducedMotion.current ? 1 + Math.sin(elapsed * 3.2) * 0.16 : 1;
    pulse.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={pulse} visible={activeCount > 0}>
      <sphereGeometry args={[0.065, 24, 24]} />
      <meshPhysicalMaterial color="#d8fbff" roughness={0.12} metalness={0.08} clearcoat={1} clearcoatRoughness={0.08} />
    </mesh>
  );
}

function ServiceNameFlow({ activeIds, complete }: { activeIds: string[]; complete: boolean }) {
  const nodes = useRef<Array<Group | null>>([]);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useFrame((state) => {
    const elapsed = reducedMotion.current ? 0 : state.clock.elapsedTime;
    const speed = complete ? 0.042 : 0.022;

    nodes.current.forEach((node, index) => {
      if (!node) return;
      const progress = (index / flowingServices.length + elapsed * speed) % 1;
      const angle = progress * Math.PI * 2;
      node.position.set(
        -0.2 + Math.cos(angle) * 3.72,
        Math.sin(angle) * 2.04,
        0.68 + Math.sin(angle * 2) * 0.1,
      );
    });
  });

  return (
    <group>
      {flowingServices.map((service, index) => {
        const active = complete || activeIds.includes(service.id);
        return (
          <group key={service.id} ref={(node) => { nodes.current[index] = node; }}>
            <Html center zIndexRange={[14, 6]} style={{ pointerEvents: "none" }}>
              <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[0.43rem] font-black uppercase tracking-[0.12em] shadow-lg backdrop-blur-xl transition duration-500 sm:px-2.5 sm:text-[0.5rem] ${active ? "border-cyan-300/30 bg-[#071b42]/92 text-cyan-100 shadow-cyan-950/30" : "border-white/10 bg-[#020817]/72 text-slate-400"}`}>
                <span className={`mr-1.5 text-[0.38rem] ${active ? "text-cyan-300" : "text-slate-600"}`}>0{index + 1}</span>
                {active && <span className="mr-1.5 size-1 rounded-full bg-cyan-300" />}
                {service.label}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function ExactLogoMark({ activeIds, complete }: { activeIds: string[]; complete: boolean }) {
  const root = useRef<Group>(null);
  const reducedMotion = useRef(false);
  const { viewport } = useThree();
  const curve = useMemo(() => createLogoCurve(), []);
  const geometry = useMemo(() => createLogoRibbon(curve), [curve]);
  const responsiveScale = Math.min(1, viewport.width / 8.65);
  const compact = viewport.width < 6;

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
    const pulse = complete && !reduce ? 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.008 : 1;
    const targetScale = responsiveScale * pulse;
    const baseY = compact ? 0.86 : 0.56;

    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, reduce ? -0.035 : state.pointer.y * 0.08 - 0.035, 4.2, delta);
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, reduce ? -0.025 : state.pointer.x * 0.14 - 0.025, 4.2, delta);
    root.current.rotation.z = MathUtils.damp(root.current.rotation.z, reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.38) * 0.009, 3, delta);
    root.current.position.y = MathUtils.damp(root.current.position.y, reduce ? baseY : baseY + Math.sin(state.clock.elapsedTime * 0.5) * 0.035, 3, delta);
    root.current.scale.setScalar(MathUtils.damp(root.current.scale.x, targetScale, 4, delta));
  });

  return (
    <group ref={root} scale={responsiveScale} position={[0, compact ? 0.86 : 0.56, 0]} rotation={[-0.035, -0.025, 0]}>
      <OrbitAccents complete={complete} />
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.27}
          metalness={0.018}
          clearcoat={0.82}
          clearcoatRoughness={0.16}
          ior={1.42}
          specularIntensity={0.48}
          specularColor="#ddebff"
          sheen={0.16}
          sheenColor="#84adff"
          sheenRoughness={0.58}
          envMapIntensity={0.7}
        />
      </mesh>
      <GrowthPulse curve={curve} activeCount={activeIds.length} complete={complete} />
      <ServiceNameFlow activeIds={activeIds} complete={complete} />
    </group>
  );
}

function GrowthSequenceGame({
  selected,
  mistakeId,
  message,
  onSelect,
  onReset,
}: {
  selected: GrowthStep[];
  mistakeId: string | null;
  message: string;
  onSelect: (step: GrowthStep) => void;
  onReset: () => void;
}) {
  const complete = selected.length === growthSteps.length;

  return (
    <div className="absolute inset-x-3 bottom-3 z-30 rounded-[1.35rem] border border-white/90 bg-white/88 p-3 shadow-[0_22px_65px_rgba(1,22,69,0.18)] backdrop-blur-xl sm:inset-x-6 sm:bottom-5 sm:rounded-[1.65rem] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[0.52rem] font-black uppercase tracking-[0.16em] text-blue-600"><Sparkles className="size-3" /> Mini growth game</p>
          <p className="mt-1 truncate text-[0.62rem] font-bold text-slate-600 sm:text-xs">Tap the services in the order that creates compound growth.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[0.52rem] font-black uppercase tracking-wider ${complete ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{complete ? "Loop live" : `${selected.length} / 4`}</span>
          {selected.length > 0 && <button type="button" onClick={onReset} aria-label="Reset growth sequence" className="grid size-7 place-items-center rounded-full border border-blue-100 bg-white text-slate-500 transition hover:rotate-[-35deg] hover:text-blue-600"><RotateCcw className="size-3" /></button>}
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-4 gap-1.5" aria-label="Your growth sequence">
        {growthSteps.map((_, index) => {
          const step = selected[index];
          return (
            <div key={index} className={`flex min-h-9 min-w-0 items-center rounded-lg border px-1.5 py-1.5 transition sm:px-2 ${step ? "border-blue-200 bg-blue-50/85" : "border-dashed border-slate-200 bg-white/55"}`}>
              <span className={`mr-1.5 grid size-4 shrink-0 place-items-center rounded-full text-[0.42rem] font-black ${step ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>{step ? <Check className="size-2.5" /> : index + 1}</span>
              <span className="truncate text-[0.46rem] font-black uppercase tracking-[0.06em] text-slate-700 sm:text-[0.55rem]">{step?.action ?? "Next"}</span>
            </div>
          );
        })}
      </div>

      {!complete ? (
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {shuffledSteps.map((step) => {
            const used = selected.some((selectedStep) => selectedStep.id === step.id);
            const mistake = mistakeId === step.id;
            return (
              <button
                key={step.id}
                type="button"
                disabled={used}
                onClick={() => onSelect(step)}
                className={`min-w-0 rounded-xl border px-2 py-1.5 text-left transition duration-300 sm:px-2.5 ${used ? "cursor-default border-emerald-200 bg-emerald-50 opacity-55" : mistake ? "border-rose-300 bg-rose-50 ring-2 ring-rose-200" : "border-blue-100 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"}`}
              >
                <span className={`block text-[0.44rem] font-black uppercase tracking-[0.12em] ${mistake ? "text-rose-600" : used ? "text-emerald-600" : "text-blue-600"}`}>{used ? "Added" : step.action}</span>
                <span className="mt-0.5 block truncate text-[0.55rem] font-black text-slate-900 sm:text-[0.62rem]">{step.service}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Check className="size-3.5" /></span><p className="truncate text-[0.6rem] font-black text-emerald-900 sm:text-xs">Growth loop activated — now every service strengthens the next.</p></div>
          <button type="button" onClick={onReset} className="shrink-0 text-[0.5rem] font-black uppercase tracking-wider text-emerald-700 hover:text-emerald-900">Play again</button>
        </div>
      )}

      <p aria-live="polite" className={`mt-1.5 truncate text-[0.5rem] font-bold ${mistakeId ? "text-rose-600" : complete ? "text-emerald-700" : "text-slate-400"}`}>{message}</p>
    </div>
  );
}

export function HeroScene() {
  const [selected, setSelected] = useState<GrowthStep[]>([]);
  const [mistakeId, setMistakeId] = useState<string | null>(null);
  const [message, setMessage] = useState("Start with the decision that gives every other investment direction.");
  const complete = selected.length === growthSteps.length;

  useEffect(() => {
    if (!mistakeId) return;
    const timeout = window.setTimeout(() => setMistakeId(null), 850);
    return () => window.clearTimeout(timeout);
  }, [mistakeId]);

  function selectStep(step: GrowthStep) {
    const expected = growthSteps[selected.length];
    if (!expected || selected.some((item) => item.id === step.id)) return;

    if (step.id !== expected.id) {
      setMistakeId(step.id);
      setMessage(expected.hint);
      return;
    }

    const next = [...selected, step];
    setSelected(next);
    setMistakeId(null);
    setMessage(next.length === growthSteps.length ? "You built a complete, compounding growth system." : growthSteps[next.length].hint);
  }

  function resetGame() {
    setSelected([]);
    setMistakeId(null);
    setMessage("Start with the decision that gives every other investment direction.");
  }

  return (
    <div className="absolute inset-0">
      <span className="sr-only">Interactive three-dimensional M&amp;W logo and business growth sequence game.</span>
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => { gl.toneMappingExposure = 1.04; }}
      >
        <ambientLight intensity={0.38} />
        <hemisphereLight args={["#f3f9ff", "#04102f", 0.95]} />
        <directionalLight castShadow position={[4.5, 5.5, 7]} intensity={1.75} color="#ffffff" shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[-5, 1, 4]} intensity={0.78} color="#9dbdff" />
        <directionalLight position={[4, -3, 3]} intensity={0.52} color="#b9f5ff" />
        <InteractiveKeyLight />

        <Environment resolution={128}>
          <Lightformer form="rect" intensity={1.55} color="#ffffff" position={[0, 5, 4]} rotation-x={Math.PI / 2} scale={[5, 1.4, 1]} />
          <Lightformer form="rect" intensity={0.92} color="#c8efff" position={[4, 0, 3]} rotation-y={Math.PI / 2} scale={[3, 1, 1]} />
          <Lightformer form="rect" intensity={0.68} color="#8aaeff" position={[-4, -1, 2]} rotation-y={-Math.PI / 2} scale={[3, 1, 1]} />
        </Environment>

        <ExactLogoMark activeIds={selected.map((step) => step.id)} complete={complete} />
        <ContactShadows position={[-0.2, -2.16, -0.72]} opacity={0.17} scale={9} blur={2.8} far={4.5} color="#153e91" />
      </Canvas>
      <GrowthSequenceGame selected={selected} mistakeId={mistakeId} message={message} onSelect={selectStep} onReset={resetGame} />
    </div>
  );
}

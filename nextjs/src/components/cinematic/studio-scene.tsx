"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, Environment, Lightformer, MeshTransmissionMaterial, PerformanceMonitor } from "@react-three/drei";
import { MathUtils, type Material, type MeshPhysicalMaterial, type MeshStandardMaterial, type Group } from "three";
import * as THREE from "three";
import { useScrollStore, type MaterialTarget } from "@/lib/scroll-store";

const shaderPrelude = `
uniform float uTime;
uniform float uProgress;
uniform float uMorph;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod(i,289.0); vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0)); vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w); vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 curlNoise(vec3 p){float e=.12;float n1=snoise(p+vec3(0.,e,0.));float n2=snoise(p-vec3(0.,e,0.));float n3=snoise(p+vec3(e,0.,0.));float n4=snoise(p-vec3(e,0.,0.));float n5=snoise(p+vec3(0.,0.,e));float n6=snoise(p-vec3(0.,0.,e));return normalize(vec3(n2-n1,n3-n4,n6-n5));}
`;

type CompiledShader = { uniforms: Record<string, { value: number }>; vertexShader: string };

function attachDisplacement(material: Material, shaders: MutableRefObject<CompiledShader[]>) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 }; shader.uniforms.uProgress = { value: 0 }; shader.uniforms.uMorph = { value: 0 }; shader.uniforms.uNoiseAmp = { value: .105 }; shader.uniforms.uNoiseFreq = { value: 1.35 };
    shader.vertexShader = shader.vertexShader.replace("#include <common>", `#include <common>${shaderPrelude}`);
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `
      vec3 transformed=position;
      vec3 unit=normalize(transformed);
      vec3 faceted=unit*max(max(abs(transformed.x),abs(transformed.y)),abs(transformed.z))*1.65;
      vec3 oblong=transformed*vec3(1.36,.7,1.12);
      vec3 upright=transformed*vec3(.78,1.5,.9);
      float a=smoothstep(.10,.30,uMorph); float b=smoothstep(.32,.56,uMorph); float c=smoothstep(.60,.86,uMorph);
      transformed=mix(transformed,faceted,a);
      transformed=mix(transformed,oblong,b);
      transformed=mix(transformed,upright,c);
      vec3 curl=curlNoise(transformed*uNoiseFreq+uTime*.16);
      float n=snoise(transformed*uNoiseFreq+curl*.3+uTime*.12);
      transformed+=unit*n*uNoiseAmp*(.65+.35*sin(uProgress*6.2831));
    `);
    shaders.current.push(shader);
  };
  material.needsUpdate = true;
}

function ChromeForm() {
  const group = useRef<Group>(null);
  const chrome = useRef<MeshStandardMaterial>(null);
  const glass = useRef<MeshPhysicalMaterial>(null);
  const steel = useRef<MeshStandardMaterial>(null);
  const ceramic = useRef<MeshStandardMaterial>(null);
  const shaders = useRef<CompiledShader[]>([]);
  const morph = useRef(0);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.08, 6), []);
  useEffect(() => { const materials = [chrome.current, glass.current, steel.current, ceramic.current]; materials.forEach((material) => { if (material) attachDisplacement(material, shaders); }); return () => { geometry.dispose(); shaders.current = []; }; }, [geometry]);
  useFrame(({ clock }, delta) => {
    const { progressRef, pointerRef, morphRef, materialRef } = useScrollStore.getState();
    morph.current = MathUtils.damp(morph.current, morphRef.current, 2.5, delta);
    if (group.current) { group.current.rotation.y = MathUtils.damp(group.current.rotation.y, progressRef.current * Math.PI * 2.4 + pointerRef.current.x * .18, 1.5, delta); group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -.2 + pointerRef.current.y * .12 + morph.current * .42, 1.5, delta); group.current.position.y = Math.sin(clock.elapsedTime * .5) * .045; }
    shaders.current.forEach((shader) => { shader.uniforms.uTime.value = clock.elapsedTime; shader.uniforms.uProgress.value = progressRef.current; shader.uniforms.uMorph.value = morph.current; });
    const target = materialRef.current;
    const weights: Record<MaterialTarget, [number, number, number, number]> = { chrome: [1, 0, 0, 0], glass: [.1, .9, 0, 0], steel: [.12, 0, .88, 0], ceramic: [.08, 0, 0, .92] };
    [chrome.current, glass.current, steel.current, ceramic.current].forEach((material, index) => { if (material) material.opacity = MathUtils.damp(material.opacity, weights[target][index], 4, delta); });
  });
  return <group ref={group} position={[0, .05, 0]}><mesh geometry={geometry} renderOrder={1}><meshStandardMaterial ref={chrome} color="#c5cbd0" metalness={1} roughness={.09} envMapIntensity={3.1} transparent opacity={1} depthWrite={false} /></mesh><mesh geometry={geometry} renderOrder={2}><MeshTransmissionMaterial ref={(material) => { glass.current = material as unknown as MeshPhysicalMaterial | null; }} color="#d8e2e3" transmission={1} thickness={.55} roughness={.08} ior={1.25} chromaticAberration={.035} anisotropy={.18} transparent opacity={0} depthWrite={false} /></mesh><mesh geometry={geometry} renderOrder={3}><meshStandardMaterial ref={steel} color="#8e969b" metalness={.92} roughness={.42} envMapIntensity={2.1} transparent opacity={0} depthWrite={false} /></mesh><mesh geometry={geometry} renderOrder={4}><meshStandardMaterial ref={ceramic} color="#e6e7e1" metalness={0} roughness={.78} envMapIntensity={.7} transparent opacity={0} depthWrite={false} /></mesh></group>;
}

function QualityGovernor({ onDecline }: { onDecline: () => void }) { return <><AdaptiveDpr pixelated={false} /><PerformanceMonitor onDecline={onDecline} /></>; }

export function StudioScene({ active }: { active: boolean }) {
  const [lowQuality, setLowQuality] = useState(false);
  return <Canvas className="studio-webgl" dpr={lowQuality ? [1, 1.25] : [1, 1.75]} frameloop={active ? "always" : "never"} shadows camera={{ position: [0, 0, 5], fov: 35 }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}><QualityGovernor onDecline={() => setLowQuality(true)} /><ambientLight intensity={.28} /><directionalLight position={[3, 4, 5]} intensity={2.6} castShadow /><Environment resolution={256}><Lightformer form="rect" intensity={6} color="#ffffff" position={[2, 3, 2]} scale={[5, 4, 1]} /><Lightformer form="rect" intensity={4} color="#b9c8ff" position={[-3, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[4, 2, 1]} /><Lightformer form="rect" intensity={8} color="#ffffff" position={[0, 0, -3]} rotation={[0, Math.PI, 0]} scale={[1, 7, 1]} /><Lightformer form="ring" intensity={2} color="#d9ce55" position={[0, -2, 1]} scale={[3, 3, 1]} /></Environment><ChromeForm /><ContactShadows position={[0, -1.32, 0]} opacity={.22} scale={4.2} blur={2.8} far={4} color="#202225" /></Canvas>;
}

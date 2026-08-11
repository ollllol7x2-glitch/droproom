"use client";

import { ContactShadows, Float } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Shape } from "three";
import type { Group } from "three";

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function GlassKnot() {
  return (
    <group rotation={[0.18, -0.24, 0.05]}>
      <mesh rotation={[0.35, 0.2, 0.18]} scale={[1.15, 1, 0.9]}>
        <torusKnotGeometry args={[1.26, 0.3, 160, 28, 2, 3]} />
        <meshPhysicalMaterial
          color="#b99bea"
          roughness={0.08}
          metalness={0.02}
          transmission={0.48}
          thickness={1.3}
          transparent
          opacity={0.82}
          clearcoat={1}
          clearcoatRoughness={0.08}
          iridescence={0.35}
          iridescenceIOR={1.3}
        />
      </mesh>
      <mesh rotation={[-0.12, -0.35, 1.05]} scale={[0.96, 0.96, 0.78]}>
        <torusKnotGeometry args={[1.04, 0.24, 144, 24, 2, 3]} />
        <meshPhysicalMaterial
          color="#d5c6f3"
          roughness={0.1}
          transmission={0.38}
          thickness={1}
          transparent
          opacity={0.74}
          clearcoat={1}
          iridescence={0.24}
        />
      </mesh>
    </group>
  );
}

function HeartCharm() {
  const shape = useMemo(() => {
    const heart = new Shape();
    heart.moveTo(0, -0.42);
    heart.bezierCurveTo(-0.08, -0.2, -0.62, 0.1, -0.62, 0.46);
    heart.bezierCurveTo(-0.62, 0.82, -0.18, 0.92, 0, 0.58);
    heart.bezierCurveTo(0.18, 0.92, 0.62, 0.82, 0.62, 0.46);
    heart.bezierCurveTo(0.62, 0.1, 0.08, -0.2, 0, -0.42);
    return heart;
  }, []);

  return (
    <mesh scale={0.62} rotation={[0.1, -0.25, Math.PI]}>
      <extrudeGeometry args={[shape, { depth: 0.28, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 5 }]} />
      <meshPhysicalMaterial color="#ff9f91" roughness={0.16} clearcoat={1} clearcoatRoughness={0.08} />
    </mesh>
  );
}

function FlowerCharm() {
  return (
    <group>
      {Array.from({ length: 5 }).map((_, index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.34, Math.sin(angle) * 0.34, 0]} scale={[0.34, 0.45, 0.24]} rotation={[0, 0, angle - Math.PI / 2]}>
            <sphereGeometry args={[1, 28, 20]} />
            <meshPhysicalMaterial color="#8fc5ef" roughness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
          </mesh>
        );
      })}
      <mesh scale={0.2} position={[0, 0, 0.16]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color="#5e9fd2" roughness={0.2} />
      </mesh>
    </group>
  );
}

function ChromeStar() {
  return (
    <mesh scale={[0.56, 0.56, 0.22]} rotation={[0.15, 0.2, 0.45]}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial color="#eef0f5" metalness={0.42} roughness={0.16} clearcoat={1} emissive="#9a98a2" emissiveIntensity={0.18} />
    </mesh>
  );
}

function SageBlob() {
  return (
    <mesh scale={[0.66, 0.55, 0.38]} rotation={[0.1, 0.2, 0.3]}>
      <dodecahedronGeometry args={[0.78, 2]} />
      <meshPhysicalMaterial color="#aacbb8" roughness={0.18} clearcoat={0.75} />
    </mesh>
  );
}

function OrbitRing() {
  return (
    <mesh rotation={[1.18, 0.22, -0.38]}>
      <torusGeometry args={[2.75, 0.018, 10, 128]} />
      <meshStandardMaterial color="#5f516e" transparent opacity={0.28} />
    </mesh>
  );
}

function Scene() {
  const rig = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const reduced = useReducedMotionPreference();
  const width = useThree((state) => state.viewport.width);
  const compact = width < 8;

  useFrame((state, delta) => {
    if (!rig.current || reduced) return;
    const targetX = state.pointer.y * 0.11;
    const targetY = state.pointer.x * 0.14;
    rig.current.rotation.x += (targetX - rig.current.rotation.x) * Math.min(delta * 2.3, 1);
    rig.current.rotation.y += (targetY - rig.current.rotation.y) * Math.min(delta * 2.3, 1);
    if (orbit.current) orbit.current.rotation.z += delta * 0.055;
  });

  const float = reduced ? 0 : 0.42;

  return (
    <>
      <ambientLight intensity={2.3} />
      <directionalLight position={[5, 7, 7]} intensity={5.2} color="#fff8f3" />
      <directionalLight position={[-5, 1, 5]} intensity={2.4} color="#a98fe9" />
      <pointLight position={[1, -3, 4]} intensity={18} distance={8} color="#9bcff6" />
      <group ref={rig} position={[compact ? 0.55 : 0.9, 0.05, 0]} scale={compact ? 0.76 : 1}>
        <Float speed={1.05} rotationIntensity={float * 0.35} floatIntensity={float}>
          <GlassKnot />
        </Float>
        <OrbitRing />
        <group ref={orbit}>
          <Float speed={1.3} rotationIntensity={float} floatIntensity={float * 0.7}>
            <group position={[-2.38, 0.62, 0.4]}><HeartCharm /></group>
          </Float>
          <Float speed={1.15} rotationIntensity={float * 0.8} floatIntensity={float}>
            <group position={[2.36, 1.18, 0.15]} scale={0.84}><FlowerCharm /></group>
          </Float>
          <Float speed={1.45} rotationIntensity={float * 1.2} floatIntensity={float * 0.85}>
            <group position={[-1.75, -1.75, 0.8]}><ChromeStar /></group>
          </Float>
          {!compact && (
            <Float speed={1.2} rotationIntensity={float} floatIntensity={float * 0.9}>
              <group position={[2.28, -1.35, -0.3]}><SageBlob /></group>
            </Float>
          )}
        </group>
      </group>
      <ContactShadows position={[0.7, -2.55, 0]} opacity={0.17} scale={7.5} blur={3.2} far={4} color="#78688a" />
    </>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 8.4], fov: 39 }}
      dpr={[1, 1.35]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Scene />
    </Canvas>
  );
}

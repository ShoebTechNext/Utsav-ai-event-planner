"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { HeroFallback } from "./HeroFallback";
import { useUtsav } from "@/hooks/useUtsavStore";

// Primitive Floating Diya Model
function Diya({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Brass Urli/Diya Bowl */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.7, 0.4, 0.35, 16]} />
        <meshStandardMaterial color="#FFB000" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Flame Cone */}
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.2, 0.5, 12]} />
        <meshStandardMaterial
          color="#FFD314"
          emissive="#FF8A00"
          emissiveIntensity={2}
          roughness={0.1}
        />
      </mesh>
      <pointLight color="#FFB000" intensity={2} distance={4} />
    </group>
  );
}

// Primitive Floating Gift Box Model
function GiftBox({
  position,
  color,
  rotationSpeed = 0.5,
}: {
  position: [number, number, number];
  color: string;
  rotationSpeed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * (rotationSpeed * 0.5);
    meshRef.current.rotation.y = state.clock.getElapsedTime() * rotationSpeed;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.75, 0.75, 0.75]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

// Floating Festive Balloon/Sphere Model
function FestiveBalloon({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.45, 16, 16]} />
      <meshStandardMaterial
        color={color}
        metalness={0.4}
        roughness={0.2}
      />
    </mesh>
  );
}

// Sparkle Particle Field
function SparkleField() {
  const count = 40;
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#FFF8EE" transparent opacity={0.7} />
    </points>
  );
}

function SceneContent({ mousePos }: { mousePos: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Pointer parallax
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mousePos.x * 0.35,
      0.05,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -mousePos.y * 0.25,
      0.05,
    );
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 5, 4]} intensity={1.2} />
      <pointLight position={[-3, -2, 2]} color="#E8457C" intensity={1.5} />

      {/* Floating Center Diya */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
        <Diya position={[0, -0.1, 0]} />
      </Float>

      {/* Floating Gift Boxes */}
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.5}>
        <GiftBox position={[-2, 1.2, -0.5]} color="#E8457C" />
      </Float>
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.3}>
        <GiftBox position={[2.2, -0.8, -0.8]} color="#2B0A3D" rotationSpeed={0.3} />
      </Float>

      {/* Floating Balloons */}
      <Float speed={2.2} rotationIntensity={0.3} floatIntensity={1.4}>
        <FestiveBalloon position={[1.8, 1.4, -0.2]} color="#FFB000" />
      </Float>
      <Float speed={1.7} rotationIntensity={0.4} floatIntensity={1.1}>
        <FestiveBalloon position={[-1.7, -1.2, 0.2]} color="#FFA3BC" />
      </Float>

      {/* Background Sparkles */}
      <SparkleField />
    </group>
  );
}

export default function Hero3DScene() {
  const { settings } = useUtsav();
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback to static CSS 3D illustration if user prefers reduced motion or on error
  useEffect(() => {
    // Visibility observer to pause/unpause when tab is hidden or offscreen
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (settings.reduceMotion || hasError) {
    return <HeroFallback />;
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      aria-hidden="true"
      className="relative w-full h-[380px] sm:h-[460px] rounded-3xl overflow-hidden border border-plum-700/50 bg-gradient-to-b from-plum-950/90 to-plum-900/60 shadow-glass"
    >
      {isVisible && (
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          camera={{ position: [0, 0, 4.8], fov: 45 }}
          onError={() => setHasError(true)}
        >
          <SceneContent mousePos={mousePos} />
        </Canvas>
      )}
    </div>
  );
}

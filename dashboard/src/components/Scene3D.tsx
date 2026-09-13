"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Core() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.03;
    }
  });

  const participants = useMemo(() => {
    const count = 8;
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.6;
      return {
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle * 1.5) * 0.6,
          Math.sin(angle) * radius,
        ] as [number, number, number],
      };
    });
  }, []);

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh>
          <icosahedronGeometry args={[1.35, 1]} />
          <MeshDistortMaterial
            color="#6366f1"
            emissive="#312e81"
            distort={0.35}
            speed={1.6}
            roughness={0.15}
            metalness={0.6}
          />
        </mesh>
      </Float>

      {participants.map((p, i) => (
        <group key={i}>
          <mesh position={p.position}>
            <sphereGeometry args={[0.14, 24, 24]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#0e7490"
              emissiveIntensity={0.6}
              roughness={0.3}
            />
          </mesh>
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) => {
                geo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(...p.position)]);
              }}
            />
            <lineBasicMaterial attach="material" color="#3730a3" transparent opacity={0.35} />
          </line>
        </group>
      ))}
    </group>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 6.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={60} color="#818cf8" />
      <pointLight position={[-5, -3, -5]} intensity={40} color="#22d3ee" />
      <Core />
    </Canvas>
  );
}

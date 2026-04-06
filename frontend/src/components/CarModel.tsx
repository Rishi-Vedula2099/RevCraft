"use client";

import { useRef, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

interface CarModelProps {
  modelUrl?: string;
  bodyType: string;
  color: string;
  hasSpoiler: boolean;
  spoilerType: string;
  wheelType: string;
  hasAeroKit: boolean;
}

function ExternalModel({ url, color }: { url: string; color: string }) {
  const { scene } = useGLTF(url);
  
  // Apply car color to parts named "body", "paint", etc.
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        if (name.includes("body") || name.includes("paint") || name.includes("exterior")) {
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            // Upgrade to Physical Material for better reflections
            const physicalMat = new THREE.MeshPhysicalMaterial({
              color: color,
              metalness: 0.9,
              roughness: 0.1,
              clearcoat: 1.0,
              clearcoatRoughness: 0.05,
              reflectivity: 1.0,
              envMapIntensity: 1.5,
            });
            mesh.material = physicalMat;
          }
        }
      }
    });
  }, [scene, color]);

  return <primitive object={scene} scale={1.2} position={[0, -0.2, 0]} castShadow receiveShadow />;
}

export default function CarModel({ 
  modelUrl, bodyType, color, hasSpoiler, spoilerType, wheelType, hasAeroKit 
}: CarModelProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  // Body dimensions based on type for procedural fallback
  const bodyDims = {
    sedan:    { length: 4.2, width: 1.8, height: 1.1, groundClearance: 0.35 },
    coupe:    { length: 3.8, width: 1.7, height: 0.95, groundClearance: 0.3 },
    suv:      { length: 4.5, width: 2.0, height: 1.6, groundClearance: 0.45 },
    truck:    { length: 5.0, width: 2.1, height: 1.5, groundClearance: 0.5 },
    sports:   { length: 4.0, width: 1.85, height: 0.85, groundClearance: 0.22 },
    hypercar: { length: 4.2, width: 2.0, height: 0.78, groundClearance: 0.18 },
  };

  const dims = bodyDims[bodyType as keyof typeof bodyDims] || bodyDims.sports;
  const y = dims.groundClearance + dims.height / 2;
  const wheelRadius = bodyType === "suv" || bodyType === "truck" ? 0.38 : wheelType.includes("20") ? 0.34 : 0.3;

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <Suspense fallback={<mesh><boxGeometry args={[2, 0.5, 1]} /><meshStandardMaterial color="#333" wireframe /></mesh>}>
        {modelUrl ? (
          <ExternalModel url={modelUrl} color={color} />
        ) : (
          <>
            {/* ── Procedural Body ── */}
            <mesh position={[0, y, 0]} castShadow>
              <boxGeometry args={[dims.length, dims.height, dims.width]} />
              <meshPhysicalMaterial 
                color={color} 
                metalness={0.9} 
                roughness={0.15} 
                clearcoat={1.0} 
                clearcoatRoughness={0.05}
                reflectivity={1.0}
                envMapIntensity={2}
              />
            </mesh>

            {/* ── Cabin ── */}
            <mesh position={[0.15, y + dims.height * 0.65, 0]} castShadow>
              <boxGeometry args={[dims.length * 0.55, dims.height * 0.55, dims.width * 0.9]} />
              <meshPhysicalMaterial 
                color="#050505" 
                metalness={1} 
                roughness={0} 
                transmission={0.5} 
                thickness={0.5}
                transparent 
                opacity={0.9} 
              />
            </mesh>

            {/* ── Wheels ── */}
            {[
              [-dims.length * 0.32, wheelRadius + dims.groundClearance - 0.1, dims.width / 2 + 0.05],
              [-dims.length * 0.32, wheelRadius + dims.groundClearance - 0.1, -dims.width / 2 - 0.05],
              [dims.length * 0.3, wheelRadius + dims.groundClearance - 0.1, dims.width / 2 + 0.05],
              [dims.length * 0.3, wheelRadius + dims.groundClearance - 0.1, -dims.width / 2 - 0.05],
            ].map((pos, i) => (
              <group key={i} position={pos as [number, number, number]}>
                {/* Tire */}
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[wheelRadius, wheelRadius, 0.25, 32]} />
                  <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
                {/* Rim */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[wheelRadius * 0.7, wheelRadius * 0.7, 0.27, 16]} />
                  <meshPhysicalMaterial color="#888" metalness={1} roughness={0.1} />
                </mesh>
              </group>
            ))}

            {/* ── Spoiler ── */}
            {hasSpoiler && (
              <mesh position={[dims.length * 0.42, y + dims.height * 0.3, 0]} castShadow>
                <boxGeometry args={[0.3, 0.04, dims.width * 0.85]} />
                <meshPhysicalMaterial color={color} metalness={0.8} roughness={0.2} clearcoat={1} />
              </mesh>
            )}

            {/* ── Aero Kit ── */}
            {hasAeroKit && (
              <mesh position={[0, dims.groundClearance + 0.05, 0]} receiveShadow>
                <boxGeometry args={[dims.length * 0.8, 0.05, dims.width * 1.05]} />
                <meshPhysicalMaterial color="#050505" metalness={0.8} roughness={0.2} />
              </mesh>
            )}
          </>
        )}
      </Suspense>
    </group>
  );
}

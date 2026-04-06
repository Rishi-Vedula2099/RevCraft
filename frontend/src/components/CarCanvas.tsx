"use client";

import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";
import { EffectComposer, Bloom, SSAO, Vignette, ToneMapping } from "@react-three/postprocessing";
import CarModel from "./CarModel";
import { useStore } from "@/lib/store";
import * as THREE from "three";
import { Suspense } from "react";

// Re-expose RectAreaLight for R3F
extend({ RectAreaLight: THREE.RectAreaLight });

export default function CarCanvas() {
  const config = useStore((s) => s.config);

  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [5, 2.5, 5], fov: 32 }}
        gl={{ 
          antialias: false, 
          stencil: false, 
          depth: true,
          powerPreference: "high-performance" 
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#050507"]} />

        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.15} />
        
        {/* Top Studio Softbox */}
        <rectAreaLight
          width={15}
          height={15}
          intensity={1.5}
          color="#ffffff"
          position={[0, 10, 0]}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />

        {/* Side Rim Lights for Paint Shine */}
        <rectAreaLight
          width={10}
          height={2}
          intensity={4}
          color="#ffffff"
          position={[5, 2, 5]}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />
        <rectAreaLight
          width={10}
          height={2}
          intensity={4}
          color="#3a86ff"
          position={[-5, 2, -5]}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />
        
        <spotLight 
          position={[10, 10, 10]} 
          intensity={1.5} 
          angle={0.3} 
          penumbra={1} 
          castShadow 
          shadow-mapSize={1024}
        />

        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
            <CarModel
              modelUrl={config.model_url}
              bodyType={config.body_type}
              color={config.color}
              hasSpoiler={config.spoiler !== "none"}
              spoilerType={config.spoiler}
              wheelType={config.wheels}
              hasAeroKit={config.aero_kit !== "none"}
            />
          </Float>
        </Suspense>

        {/* Contact Shadows for ground occlusion */}
        <ContactShadows 
          position={[0, -0.01, 0]} 
          opacity={0.7} 
          scale={15} 
          blur={1.8} 
          far={4} 
          resolution={512} 
        />

        {/* High-Fidelity Environment Map for Reflections */}
        <Environment preset="city" />

        {/* Post-Processing Stack for "Forza" Look */}
        <EffectComposer multisampling={4}>
          <SSAO 
            intensity={20} 
            radius={0.3} 
            luminanceInfluence={0.6} 
          />
          <Bloom 
            luminanceThreshold={1.0} 
            mipmapBlur 
            intensity={0.4} 
            radius={0.3} 
          />
          <Vignette eskil={false} offset={0.1} darkness={1.0} />
          <ToneMapping mode={THREE.ACESFilmicToneMapping} />
        </EffectComposer>

        {/* Professional Controls */}
        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={9}
          maxPolarAngle={Math.PI / 2.1}
          makeDefault
        />
      </Canvas>

      {/* Overlay info */}
      <div style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        fontSize: "0.65rem",
        color: "rgba(255,255,255,0.4)",
        fontFamily: "var(--font-display)",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        pointerEvents: "none",
      }}>
        RevCraft Visual Engine v2.0 · Real-time PBR
      </div>
    </div>
  );
}

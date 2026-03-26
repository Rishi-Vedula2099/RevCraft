"use client";

import dynamic from "next/dynamic";
import ConfigPanel from "@/components/ConfigPanel";
import StatsPanel from "@/components/StatsPanel";
import AiInsights from "@/components/AiInsights";
import { useStore } from "@/lib/store";
import { createBuild } from "@/lib/api";

// Dynamic import for Three.js (no SSR)
const CarCanvas = dynamic(() => import("@/components/CarCanvas"), { ssr: false });

export default function BuilderPage() {
  const token = useStore((s) => s.token);
  const config = useStore((s) => s.config);
  const buildName = useStore((s) => s.buildName);

  const handleSave = async () => {
    if (!token) {
      alert("Please log in to save builds.");
      return;
    }
    try {
      await createBuild(token, buildName, config);
      alert("Build saved to garage! 🏎️");
    } catch (err: unknown) {
      alert(`Save failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="builder-layout">
        {/* 3D Viewport */}
        <CarCanvas />

        {/* Right panel — scrollable */}
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ConfigPanel />

            <div style={{ padding: "0 24px 16px" }}>
              <StatsPanel />
              <AiInsights />

              {/* Save button */}
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 16, padding: "14px" }}
                onClick={handleSave}
              >
                💾 Save to Garage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

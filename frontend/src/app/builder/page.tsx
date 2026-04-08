"use client";

import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import ConfigPanel from "@/components/ConfigPanel";
import StatsPanel from "@/components/StatsPanel";
import SimulationPanel from "@/components/SimulationPanel";
import ReportPanel from "@/components/ReportPanel";
import { useStore } from "@/lib/store";
import { createBuild, getAiInsights } from "@/lib/api";

// Dynamic import for Three.js (no SSR)
const CarCanvas = dynamic(() => import("@/components/CarCanvas"), { ssr: false });

export default function BuilderPage() {
  const token = useStore((s) => s.token);
  const config = useStore((s) => s.config);
  const stats = useStore((s) => s.stats);
  const setInsights = useStore((s) => s.setInsights);
  const buildName = useStore((s) => s.buildName);
  
  const simulationState = useStore((s) => s.simulationState);
  const setSimulationState = useStore((s) => s.setSimulationState);

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

  const handleRunSimulation = () => {
    // Scroll right panel to top to ensure simulation runs in view
    document.getElementById("builder-right-panel")?.scrollTo(0, 0);
    setSimulationState("simulating");
  };

  const fetchInsightsForSimulation = async () => {
    if (!stats) return;
    try {
      const insights = await getAiInsights(config, stats);
      setInsights(insights);
    } catch (e) {
      console.error(e);
      // Fallback is handled in backend logic or we can safely ignore
    }
  };

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="builder-layout">
        {/* 3D Viewport */}
        <CarCanvas />

        {/* Right panel — scrollable */}
        <div id="builder-right-panel" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden", position: "relative" }}>
          
          <AnimatePresence mode="wait">
            {simulationState === "idle" && (
              <div key="configurator" style={{ flex: 1, overflowY: "auto", width: "100%" }}>
                <ConfigPanel />

                <div style={{ padding: "0 24px 16px" }}>
                  <StatsPanel />
                  
                  {/* Simulation Button replaces the old AI Insights generator */}
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: 16, padding: "16px", fontSize: "1.1rem" }}
                    onClick={handleRunSimulation}
                    disabled={!stats}
                  >
                    🏎️ RUN FULL SIMULATION
                  </button>

                  {/* Save button */}
                  <button
                    className="btn btn-secondary"
                    style={{ width: "100%", marginTop: 12, padding: "14px" }}
                    onClick={handleSave}
                  >
                    💾 Save to Garage
                  </button>
                </div>
              </div>
            )}

            {simulationState === "simulating" && (
              <div key="simulating" style={{ width: "100%", height: "100%" }}>
                <SimulationPanel 
                  onSimulationComplete={() => setSimulationState("report")} 
                  fetchInsights={fetchInsightsForSimulation} 
                />
              </div>
            )}

            {simulationState === "report" && (
               <div key="report" style={{ width: "100%", height: "100%" }}>
                 <ReportPanel onExit={() => setSimulationState("idle")} />
               </div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onSimulationComplete: () => void;
  fetchInsights: () => Promise<void>;
}

export default function SimulationPanel({ onSimulationComplete, fetchInsights }: Props) {
  const [phase, setPhase] = useState<"initializing" | "analyzing" | "finalizing">("initializing");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime = Date.now();
    let frameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const totalDuration = 10000; // 10 seconds total

      const currentProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(currentProgress);

      if (elapsed < 3000) {
        if (phase !== "initializing") setPhase("initializing");
      } else if (elapsed < 7000) {
        if (phase !== "analyzing") {
          setPhase("analyzing");
          // Fire the API call
          fetchInsights().catch(console.error);
        }
      } else if (elapsed < 10000) {
        if (phase !== "finalizing") setPhase("finalizing");
      } else {
        onSimulationComplete();
        return; // stop animation
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPhaseText = () => {
    switch (phase) {
      case "initializing":
        return "INITIALIZING TELEMETRY...";
      case "analyzing":
        return "RUNNING PERFORMANCE ANALYSIS...";
      case "finalizing":
        return "GENERATING AI REPORT...";
      default:
        return "";
    }
  };

  const getSubText = () => {
    switch (phase) {
      case "initializing":
        return "Calibrating suspension parameters. Synchronizing engine map. Establishing connection with RevCraft Data Warehouse.";
      case "analyzing":
        return "Executing aerodynamic CFD simulation. Evaluating 0-100 acceleration curves. Requesting AI engineer input.";
      case "finalizing":
        return "Formatting performance output. Rendering class badge. Finalizing upgrade recommendations.";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        height: "100%",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background cinematic lines */}
      <div className="sim-scanline" />

      <motion.div
        key={phase}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        style={{ zIndex: 2 }}
      >
        <div style={{
          fontSize: "3rem",
          marginBottom: "16px",
          color: "var(--accent-primary)",
        }}>
          {phase === "initializing" && "⚙️"}
          {phase === "analyzing" && "⚡"}
          {phase === "finalizing" && "🧠"}
        </div>
        
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.2rem",
          letterSpacing: "0.2em",
          color: "var(--text-primary)",
          marginBottom: "12px",
        }}>
          {getPhaseText()}
        </h2>
        
        <p style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          maxWidth: "300px",
          margin: "0 auto",
          lineHeight: 1.6,
        }}>
          {getSubText()}
        </p>
      </motion.div>

      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "var(--bg-tertiary)",
      }}>
        <motion.div
          style={{
            height: "100%",
            background: "var(--gradient-primary)",
            width: `${progress}%`,
          }}
        />
      </div>
    </motion.div>
  );
}

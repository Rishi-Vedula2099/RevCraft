"use client";

import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import ClassBadge from "./ClassBadge";
import { CheckCircle2, ChevronRight, AlertTriangle, ArrowRight } from "lucide-react";

interface Props {
  onExit: () => void;
}

export default function ReportPanel({ onExit }: Props) {
  const stats = useStore((s) => s.stats);
  const insights = useStore((s) => s.insights);

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="report-panel glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        padding: "32px",
        background: "var(--bg-secondary)", // a bit darker for the report
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            color: "var(--text-primary)",
            marginBottom: 4,
          }}>
            PERFORMANCE REPORT
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Telemetry & AI Analysis Output
          </p>
        </div>
        <ClassBadge carClass={stats.car_class} size="lg" />
      </div>

      <div className="grid-2" style={{ marginBottom: 32, gap: 16 }}>
        {/* Core Stats Overview */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 12 }}>CORE STATS</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Horsepower</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>{stats.horsepower} HP</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Torque</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>{stats.torque} lb-ft</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>0-60 Time</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>{stats.acceleration}s</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Handling</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>{stats.handling}/100</div>
            </div>
          </div>
        </div>

        {/* Score Overview */}
        <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
           <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>REVCRAFT RATING</div>
           <div style={{
             fontSize: "3.5rem",
             fontWeight: 900,
             fontFamily: "var(--font-display)",
             background: "var(--gradient-primary)",
             WebkitBackgroundClip: "text",
             WebkitTextFillColor: "transparent",
             lineHeight: 1
           }}>
             {stats.score}
           </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div style={{ flex: 1 }}>
        <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            color: "var(--accent-primary)",
            marginBottom: 16,
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8
        }}>
          <ChevronRight size={18} /> AI ANALYSIS
        </h3>

        {!insights ? (
           <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
             AI Analyst failed to generate a report.
           </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h4 style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: 8 }}>Performance Profile</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {insights.performance_analysis}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                Class Evaluation
              </h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                 {insights.class_explanation}
              </p>
            </div>

            <div style={{ background: "rgba(139, 92, 246, 0.05)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
              <h4 style={{ fontSize: "0.85rem", color: "var(--accent-secondary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <ArrowRight size={16} /> Recommended Upgrade Path
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {insights.upgrade_suggestions.map((s, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                     <CheckCircle2 size={16} color="var(--accent-success)" style={{ marginTop: 2, flexShrink: 0 }} />
                     <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-secondary" style={{ marginTop: 40, width: "100%" }} onClick={onExit}>
        RETURN TO LABORATORY
      </button>
    </motion.div>
  );
}

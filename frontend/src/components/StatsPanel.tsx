"use client";

import { useStore } from "@/lib/store";
import ClassBadge from "./ClassBadge";

export default function StatsPanel() {
  const stats = useStore((s) => s.stats);
  const isCalculating = useStore((s) => s.isCalculating);

  if (!stats) {
    return (
      <div className="config-section">
        <div className="config-section-title">Performance</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
          {isCalculating ? "Calculating..." : "Modify your build to see stats"}
        </div>
      </div>
    );
  }

  const statItems = [
    { label: "Horsepower", value: `${stats.horsepower} HP`, max: 800, current: stats.horsepower },
    { label: "Torque", value: `${stats.torque} lb-ft`, max: 800, current: stats.torque },
    { label: "Top Speed", value: `${stats.top_speed} mph`, max: 320, current: stats.top_speed },
    { label: "0-60 mph", value: `${stats.acceleration}s`, max: 15, current: 15 - stats.acceleration },
    { label: "Weight", value: `${stats.weight} kg`, max: 2500, current: 2500 - stats.weight },
    { label: "Handling", value: `${stats.handling}/100`, max: 100, current: stats.handling },
  ];

  return (
    <div className="config-section">
      <div className="config-section-title">Performance Stats</div>

      {/* Score + Class */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        padding: "16px",
        background: "var(--bg-tertiary)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
      }}>
        <div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-display)" }}>
            Score
          </div>
          <div style={{
            fontSize: "2rem",
            fontWeight: 900,
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "var(--font-display)",
          }}>
            {stats.score}
          </div>
        </div>
        <ClassBadge carClass={stats.car_class} size="lg" />
      </div>

      {/* Stat bars */}
      {statItems.map((item) => (
        <div key={item.label} style={{ marginBottom: 14 }}>
          <div className="stat-item">
            <span className="stat-label">{item.label}</span>
            <span className="stat-value">{item.value}</span>
          </div>
          <div className="stat-bar-container">
            <div
              className="stat-bar-fill"
              style={{ width: `${Math.min(100, (item.current / item.max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

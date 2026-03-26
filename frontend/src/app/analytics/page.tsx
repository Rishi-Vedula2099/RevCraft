"use client";

import { useEffect, useState } from "react";
import {
  getClassDistribution,
  getTrends,
  getOverallStats,
  type ClassDistribution,
  type TrendPoint,
} from "@/lib/api";

// Class color map
const CLASS_COLORS: Record<string, string> = {
  D: "#6b7280",
  C: "#3b82f6",
  B: "#10b981",
  A: "#8b5cf6",
  S: "#fbbf24",
};

export default function AnalyticsPage() {
  const [classData, setClassData] = useState<ClassDistribution[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [stats, setStats] = useState<{
    total_builds: number;
    total_users: number;
    avg_score: number;
    max_score: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClassDistribution(), getTrends(), getOverallStats()])
      .then(([cd, tr, st]) => {
        setClassData(cd);
        setTrends(tr);
        setStats(st);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">📊 Analytics Dashboard</h1>
      <p className="page-subtitle">Platform-wide insights powered by the cloud data warehouse.</p>

      {/* Stats overview cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: "Total Builds", value: stats?.total_builds ?? "—", icon: "🏎️" },
          { label: "Total Users", value: stats?.total_users ?? "—", icon: "👤" },
          { label: "Avg Score", value: stats?.avg_score ?? "—", icon: "⚡" },
          { label: "Max Score", value: stats?.max_score ?? "—", icon: "🏆" },
        ].map((s, i) => (
          <div key={i} className={`glass-card animate-in animate-in-delay-${i + 1}`} style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{s.icon}</div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              fontWeight: 800,
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {loading ? "..." : s.value}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Class Distribution */}
        <div className="glass-card chart-container">
          <div className="chart-title">Class Distribution</div>
          {loading ? (
            <div className="shimmer" style={{ height: 200, borderRadius: 8 }} />
          ) : classData.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>
              No data available yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {classData.map((cd) => (
                <div key={cd.car_class}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        className={`class-badge class-${cd.car_class}`}
                        style={{ width: 28, height: 28, fontSize: "0.7rem" }}
                      >
                        {cd.car_class}
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Class {cd.car_class}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      color: CLASS_COLORS[cd.car_class] || "var(--text-primary)",
                    }}>
                      {cd.count} ({cd.percentage}%)
                    </span>
                  </div>
                  <div className="stat-bar-container">
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: `${cd.percentage}%`,
                        background: CLASS_COLORS[cd.car_class] || "var(--gradient-primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trends */}
        <div className="glass-card chart-container">
          <div className="chart-title">Build Trends</div>
          {loading ? (
            <div className="shimmer" style={{ height: 200, borderRadius: 8 }} />
          ) : trends.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>
              No trend data available yet. Create some builds!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {trends.slice(-10).map((t) => (
                <div key={t.date} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
                    {t.date}
                  </span>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent-primary)" }}>
                      Avg: {t.avg_score}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent-secondary)" }}>
                      Builds: {t.build_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Architecture note */}
      <div className="glass-card" style={{ padding: 24, marginTop: 32, textAlign: "center" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>
          POWERED BY AMAZON REDSHIFT · DATA PIPELINE VIA S3 + GLUE · CACHED ANALYTICS API
        </div>
      </div>
    </div>
  );
}

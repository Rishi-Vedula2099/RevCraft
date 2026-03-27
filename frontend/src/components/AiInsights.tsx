"use client";

import { useStore } from "@/lib/store";

export default function AiInsights() {
  const insights = useStore((s) => s.insights);
  const isLoading = useStore((s) => s.isLoadingInsights);

  if (isLoading) {
    return (
      <div className="glass-card insights-card animate-in" style={{ marginTop: 16 }}>
        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🤖</div>
          Analyzing your build...
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="glass-card insights-card animate-in" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: "1.2rem" }}>🤖</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--accent-secondary)" }}>
          AI ANALYSIS
        </span>
      </div>

      <div className="insight-section">
        <div className="insight-title">Performance Analysis</div>
        <div className="insight-text">{insights.performance_analysis}</div>
      </div>

      <div className="insight-section">
        <div className="insight-title">Class Rating</div>
        <div className="insight-text">{insights.class_explanation}</div>
      </div>

      <div className="insight-section">
        <div className="insight-title">Upgrade Suggestions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {insights.upgrade_suggestions.map((s, i) => (
            <span key={i} className="suggestion-tag">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

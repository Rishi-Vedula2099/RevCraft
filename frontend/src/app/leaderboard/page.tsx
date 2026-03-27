"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api";
import ClassBadge from "@/components/ClassBadge";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(50)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">🏆 Leaderboard</h1>
      <p className="page-subtitle">Top builds ranked by performance score. Can you reach S-Class?</p>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        {/* Header row */}
        <div className="leaderboard-row" style={{
          borderBottom: "2px solid var(--border-subtle)",
          background: "var(--bg-tertiary)",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
            RANK
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
            BUILDER
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
            BUILD
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text-muted)", textAlign: "right" }}>
            SCORE
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text-muted)", textAlign: "center" }}>
            CLASS
          </div>
        </div>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="leaderboard-row">
              <div className="shimmer" style={{ width: 30, height: 20, borderRadius: 4 }} />
              <div className="shimmer" style={{ width: 120, height: 16, borderRadius: 4 }} />
              <div className="shimmer" style={{ width: 100, height: 16, borderRadius: 4 }} />
              <div className="shimmer" style={{ width: 60, height: 16, borderRadius: 4, marginLeft: "auto" }} />
              <div className="shimmer" style={{ width: 32, height: 32, borderRadius: "50%", margin: "0 auto" }} />
            </div>
          ))
        ) : entries.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 0" }}>
            <div className="emoji">🏁</div>
            <h3>No Entries Yet</h3>
            <p>Be the first to claim the top spot!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={`${entry.rank}-${entry.username}`} className="leaderboard-row animate-in" style={{ animationDelay: `${entry.rank * 0.03}s` }}>
              <div className={`leaderboard-rank ${entry.rank <= 3 ? "top-3" : ""}`}>
                {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{entry.username}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{entry.build_name}</div>
              <div style={{
                textAlign: "right",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1rem",
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {entry.performance_score}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ClassBadge carClass={entry.car_class} size="sm" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

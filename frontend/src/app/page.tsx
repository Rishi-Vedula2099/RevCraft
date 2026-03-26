"use client";

import Link from "next/link";

const features = [
  {
    icon: "🏎️",
    title: "3D CAR BUILDER",
    desc: "Build and customize cars in real-time with an interactive 3D viewport. Choose body types, engines, aero kits, and more.",
  },
  {
    icon: "⚡",
    title: "PERFORMANCE SCORING",
    desc: "Every modification updates your performance score instantly. HP, torque, top speed, handling — all calculated in real-time.",
  },
  {
    icon: "🏁",
    title: "CLASS RANKINGS",
    desc: "Earn your class from D-tier to the legendary S-Class. Push your build to the limit and climb the ranks.",
  },
  {
    icon: "🤖",
    title: "AI INSIGHTS",
    desc: "Get intelligent analysis of your build's strengths, weaknesses, and personalized upgrade recommendations.",
  },
  {
    icon: "🔧",
    title: "GARAGE SYSTEM",
    desc: "Save unlimited builds to your personal garage. Compare configurations and perfect your designs over time.",
  },
  {
    icon: "📊",
    title: "ANALYTICS ENGINE",
    desc: "Cloud-native analytics powered by a data warehouse. Leaderboards, trends, and class distribution insights.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="hero-title">
            Build. <span className="gradient-text">Tune.</span> Dominate.
          </h1>
          <p className="hero-subtitle">
            The cloud-native car builder platform with real-time 3D customization,
            AI-powered insights, and competitive class rankings.
          </p>
          <div className="hero-actions">
            <Link href="/builder" className="btn btn-primary" style={{ padding: "16px 40px", fontSize: "1rem" }}>
              🏎️ Start Building
            </Link>
            <Link href="/leaderboard" className="btn btn-secondary" style={{ padding: "16px 40px", fontSize: "1rem" }}>
              🏆 Leaderboard
            </Link>
          </div>

          {/* Class badges preview */}
          <div style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginTop: 48,
            animation: "fadeInUp 1s ease-out 0.5s both",
          }}>
            {["D", "C", "B", "A", "S"].map((cls) => (
              <div
                key={cls}
                className={`class-badge class-${cls}`}
                style={{ width: 44, height: 44, fontSize: "1rem" }}
              >
                {cls}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-grid">
        {features.map((f, i) => (
          <div key={i} className={`glass-card feature-card animate-in animate-in-delay-${(i % 3) + 1}`}>
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Architecture callout */}
      <section style={{
        maxWidth: 900,
        margin: "80px auto 60px",
        padding: "0 24px",
        textAlign: "center",
        animation: "fadeInUp 1s ease-out 0.6s both",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          marginBottom: 16,
          color: "var(--text-primary)",
        }}>
          Cloud-Native Architecture
        </h2>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          flexWrap: "wrap",
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
        }}>
          {[
            { label: "Transactional", icon: "🟢", tech: "PostgreSQL (RDS)" },
            { label: "Data Lake", icon: "🟣", tech: "Amazon S3" },
            { label: "Warehouse", icon: "🔴", tech: "Amazon Redshift" },
            { label: "Compute", icon: "🔵", tech: "FastAPI (ECS)" },
            { label: "AI Engine", icon: "🧠", tech: "OpenAI GPT" },
          ].map((a) => (
            <div key={a.label} className="glass-card" style={{ padding: "20px 24px", minWidth: 140, textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{a.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: 4 }}>{a.label}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{a.tech}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

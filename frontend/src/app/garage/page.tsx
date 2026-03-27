"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { listBuilds, deleteBuild, type Build } from "@/lib/api";
import BuildCard from "@/components/BuildCard";
import Link from "next/link";

export default function GaragePage() {
  const token = useStore((s) => s.token);
  const setConfig = useStore((s) => s.setConfig);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    listBuilds(token)
      .then(setBuilds)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Delete this build?")) return;
    try {
      await deleteBuild(token, id);
      setBuilds((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Failed to delete build.");
    }
  };

  const handleSelect = (id: string) => {
    const build = builds.find((b) => b.id === id);
    if (build) {
      setConfig(build.config);
      window.location.href = "/builder";
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🔧 Your Garage</h1>
      <p className="page-subtitle">All your saved builds in one place. Click to load into the builder.</p>

      {!token ? (
        <div className="empty-state">
          <div className="emoji">🔒</div>
          <h3>Login Required</h3>
          <p>Sign in to access your garage and saved builds.</p>
        </div>
      ) : loading ? (
        <div className="grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card shimmer" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      ) : builds.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🏎️</div>
          <h3>No Builds Yet</h3>
          <p style={{ marginBottom: 20 }}>Head to the builder to create your first masterpiece.</p>
          <Link href="/builder" className="btn btn-primary">Start Building</Link>
        </div>
      ) : (
        <div className="grid-3">
          {builds.map((build, i) => (
            <div key={build.id} className={`animate-in animate-in-delay-${(i % 3) + 1}`}>
              <BuildCard
                id={build.id}
                name={build.name}
                score={build.performance_score}
                carClass={build.car_class}
                bodyType={build.config.body_type || "sports"}
                engine={build.config.engine || "v6_standard"}
                updatedAt={build.updated_at}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

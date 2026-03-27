"use client";

import ClassBadge from "./ClassBadge";

interface Props {
  id: string;
  name: string;
  score: number;
  carClass: string;
  bodyType: string;
  engine: string;
  updatedAt: string;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function BuildCard({ id, name, score, carClass, bodyType, engine, updatedAt, onSelect, onDelete }: Props) {
  return (
    <div className="glass-card build-card" onClick={() => onSelect?.(id)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="build-name">{name}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 12 }}>
            {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)} · {engine.replace(/_/g, " ").toUpperCase()}
          </div>
        </div>
        <ClassBadge carClass={carClass} size="sm" />
      </div>

      <div className="build-score">{score}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
        Updated {new Date(updatedAt).toLocaleDateString()}
      </div>

      {onDelete && (
        <button
          className="btn btn-danger"
          style={{ marginTop: 12, padding: "6px 14px", fontSize: "0.75rem" }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
}

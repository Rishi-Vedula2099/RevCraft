"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { calculateStats, getAiInsights } from "@/lib/api";

const BRANDS = [
  { value: "generic", label: "RevCraft Generic" },
  { value: "bmw", label: "BMW Performance" },
  { value: "mercedes", label: "Mercedes AMG Style" },
  { value: "audi", label: "Audi Quattro Spirit" },
  { value: "porsche", label: "Porsche GT Style" },
  { value: "ferrari", label: "Ferrari Rosso Core" },
  { value: "toyota", label: "Toyota JDM Style" },
];

const BRAND_MODELS: Record<string, string> = {
  bmw: "/models/bmw.glb",
  mercedes: "/models/mercedes.glb",
  audi: "/models/audi.glb",
  porsche: "/models/porsche.glb",
  ferrari: "/models/ferrari.glb",
};

const BODY_TYPES = [
  { value: "sedan", label: "Sedan" },
  { value: "coupe", label: "Coupe" },
  { value: "suv", label: "SUV" },
  { value: "truck", label: "Truck" },
  { value: "sports", label: "Sports" },
  { value: "hypercar", label: "Hypercar" },
];

const ENGINES = [
  { value: "i4_economy", label: "I4 Economy" },
  { value: "i4_turbo", label: "I4 Turbo" },
  { value: "v6_standard", label: "V6 Standard" },
  { value: "v6_turbo", label: "V6 Twin-Turbo" },
  { value: "v8_standard", label: "V8 Naturally Aspirated" },
  { value: "v8_supercharged", label: "V8 Supercharged" },
  { value: "v10_racing", label: "V10 Racing" },
  { value: "v12_flagship", label: "V12 Flagship" },
  { value: "electric_dual", label: "Electric Dual Motor" },
  { value: "electric_tri", label: "Electric Tri Motor" },
  { value: "hybrid_v6", label: "Hybrid V6" },
  { value: "hybrid_v8", label: "Hybrid V8" },
];

const WHEELS = [
  { value: "economy_16", label: '16" Economy' },
  { value: "sport_18", label: '18" Sport' },
  { value: "performance_19", label: '19" Performance' },
  { value: "racing_20", label: '20" Racing' },
  { value: "offroad_17", label: '17" Off-Road' },
  { value: "lightweight_18", label: '18" Lightweight' },
];

const SPOILERS = [
  { value: "none", label: "None" },
  { value: "lip", label: "Lip Spoiler" },
  { value: "mid_wing", label: "Mid Wing" },
  { value: "gt_wing", label: "GT Wing" },
  { value: "active_aero", label: "Active Aero" },
];

const SUSPENSIONS = [
  { value: "standard", label: "Standard" },
  { value: "sport", label: "Sport" },
  { value: "racing", label: "Racing" },
  { value: "adjustable", label: "Adjustable" },
  { value: "offroad", label: "Off-Road" },
];

const BRAKES = [
  { value: "standard", label: "Standard" },
  { value: "sport", label: "Sport" },
  { value: "ceramic", label: "Ceramic" },
  { value: "carbon_ceramic", label: "Carbon Ceramic" },
];

const EXHAUSTS = [
  { value: "standard", label: "Standard" },
  { value: "sport", label: "Sport" },
  { value: "racing", label: "Racing" },
  { value: "titanium", label: "Titanium" },
];

const TRANSMISSIONS = [
  { value: "automatic", label: "Automatic" },
  { value: "manual_6", label: "6-Speed Manual" },
  { value: "dct_7", label: "7-Speed DCT" },
  { value: "sequential", label: "Sequential" },
];

const AERO_KITS = [
  { value: "none", label: "None" },
  { value: "street", label: "Street" },
  { value: "track", label: "Track" },
  { value: "widebody", label: "Widebody" },
];

const WEIGHT_REDUCTIONS = [
  { value: "none", label: "None" },
  { value: "stage_1", label: "Stage 1 (-80 kg)" },
  { value: "stage_2", label: "Stage 2 (-160 kg)" },
  { value: "stage_3", label: "Stage 3 (-280 kg)" },
  { value: "extreme", label: "Extreme (-400 kg)" },
];

const COLORS = [
  "#e63946", "#f72585", "#ff6d00", "#ffd60a",
  "#06d6a0", "#00f0ff", "#3a86ff", "#8b5cf6",
  "#f0f0f5", "#1a1a24", "#6b7280", "#b91c1c",
];

function SelectField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function ConfigPanel() {
  const config = useStore((s) => s.config);
  const setConfig = useStore((s) => s.setConfig);
  const stats = useStore((s) => s.stats);
  const setStats = useStore((s) => s.setStats);
  const setInsights = useStore((s) => s.setInsights);
  const setIsCalculating = useStore((s) => s.setIsCalculating);
  const setIsLoadingInsights = useStore((s) => s.setIsLoadingInsights);
  const buildName = useStore((s) => s.buildName);
  const setBuildName = useStore((s) => s.setBuildName);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recalculate = useCallback(async (currentConfig: any) => {
    setIsCalculating(true);
    try {
      const stats = await calculateStats(currentConfig);
      setStats(stats);
      setInsights(null);
    } catch {
      // Backend unavailable — use a local fallback display
    } finally {
      setIsCalculating(false);
    }
  }, [setStats, setInsights, setIsCalculating]);

  const handleChange = useCallback(
    (partial: Record<string, string | boolean>) => {
      const newConfig = { ...config, ...partial };
      setConfig(partial);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => recalculate(newConfig), 300);
    },
    [config, setConfig, recalculate]
  );

  // Calculate on mount
  useEffect(() => {
    recalculate(config);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGetInsights = async () => {
    // Access latest state directly from the store's current values
    if (!stats) return;
    setIsLoadingInsights(true);
    try {
      const insights = await getAiInsights(config, stats);
      setInsights(insights);
    } catch {
      // AI unavailable
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="config-panel">
      {/* Build name */}
      <div style={{ marginBottom: 20 }}>
        <label className="label">Build Name</label>
        <input
          type="text"
          className="input"
          value={buildName}
          onChange={(e) => setBuildName(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Color */}
      <div className="config-section">
        <div className="config-section-title">Exterior Color</div>
        <div className="color-picker-row">
          {COLORS.map((c) => (
            <div
              key={c}
              className={`color-swatch ${config.color === c ? "active" : ""}`}
              style={{ background: c }}
              onClick={() => handleChange({ color: c })}
            />
          ))}
        </div>
      </div>

      {/* Brand & Body */}
      <div className="config-section">
        <div className="config-section-title">Brand & Identity</div>
        <SelectField 
          label="Manufacturer" 
          value={config.brand || "generic"} 
          options={BRANDS} 
          onChange={(v) => handleChange({ brand: v, model_url: BRAND_MODELS[v] || "" })} 
        />
        <SelectField label="Body Type" value={config.body_type} options={BODY_TYPES} onChange={(v) => handleChange({ body_type: v })} />
        <SelectField label="Engine" value={config.engine} options={ENGINES} onChange={(v) => handleChange({ engine: v })} />
        <SelectField label="Transmission" value={config.transmission} options={TRANSMISSIONS} onChange={(v) => handleChange({ transmission: v })} />
        <SelectField label="Exhaust" value={config.exhaust} options={EXHAUSTS} onChange={(v) => handleChange({ exhaust: v })} />

        {/* Turbo toggle */}
        <div style={{ marginTop: 8 }}>
          <div
            className="toggle-container"
            onClick={() => handleChange({ turbo: !config.turbo })}
          >
            <div className={`toggle-track ${config.turbo ? "active" : ""}`}>
              <div className="toggle-thumb" />
            </div>
            <span style={{ fontSize: "0.85rem", color: config.turbo ? "var(--accent-primary)" : "var(--text-secondary)" }}>
              Turbo {config.turbo ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      {/* Chassis & Aero */}
      <div className="config-section">
        <div className="config-section-title">Chassis & Aerodynamics</div>
        <SelectField label="Wheels" value={config.wheels} options={WHEELS} onChange={(v) => handleChange({ wheels: v })} />
        <SelectField label="Spoiler" value={config.spoiler} options={SPOILERS} onChange={(v) => handleChange({ spoiler: v })} />
        <SelectField label="Suspension" value={config.suspension} options={SUSPENSIONS} onChange={(v) => handleChange({ suspension: v })} />
        <SelectField label="Brakes" value={config.brakes} options={BRAKES} onChange={(v) => handleChange({ brakes: v })} />
        <SelectField label="Aero Kit" value={config.aero_kit} options={AERO_KITS} onChange={(v) => handleChange({ aero_kit: v })} />
        <SelectField label="Weight Reduction" value={config.weight_reduction} options={WEIGHT_REDUCTIONS} onChange={(v) => handleChange({ weight_reduction: v })} />
      </div>

    </div>
  );
}

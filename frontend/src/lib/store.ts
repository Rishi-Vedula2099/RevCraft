/**
 * RevCraft — Global State Store (Zustand)
 */

import { create } from "zustand";
import type { CarConfig, PerformanceStats, AiInsights } from "./api";

export const DEFAULT_CONFIG: CarConfig = {
  brand: "generic",
  model_url: "",
  body_type: "sports",
  color: "#e63946",
  engine: "v6_standard",
  wheels: "sport_18",
  spoiler: "none",
  suspension: "standard",
  brakes: "standard",
  turbo: false,
  weight_reduction: "none",
  exhaust: "standard",
  transmission: "automatic",
  aero_kit: "none",
};

interface AppState {
  // Auth
  token: string | null;
  username: string | null;
  setAuth: (token: string, username: string) => void;
  logout: () => void;

  // Builder
  config: CarConfig;
  stats: PerformanceStats | null;
  insights: AiInsights | null;
  isCalculating: boolean;
  isLoadingInsights: boolean;

  setConfig: (config: Partial<CarConfig>) => void;
  resetConfig: () => void;
  setStats: (stats: PerformanceStats) => void;
  setInsights: (insights: AiInsights | null) => void;
  setIsCalculating: (v: boolean) => void;
  setIsLoadingInsights: (v: boolean) => void;

  // Build name
  buildName: string;
  setBuildName: (name: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  username: typeof window !== "undefined" ? localStorage.getItem("username") : null,
  setAuth: (token, username) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
    }
    set({ token, username });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    }
    set({ token: null, username: null });
  },

  // Builder
  config: DEFAULT_CONFIG,
  stats: null,
  insights: null,
  isCalculating: false,
  isLoadingInsights: false,

  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG, stats: null, insights: null }),
  setStats: (stats) => set({ stats }),
  setInsights: (insights) => set({ insights }),
  setIsCalculating: (v) => set({ isCalculating: v }),
  setIsLoadingInsights: (v) => set({ isLoadingInsights: v }),

  // Build name
  buildName: "My Build",
  setBuildName: (name) => set({ buildName: name }),
}));

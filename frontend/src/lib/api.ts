/**
 * RevCraft — API Client
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(errorData.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ── Auth ────────────────────────────────────
export async function register(username: string, email: string, password: string) {
  return apiFetch<{ access_token: string; user: { id: string; username: string; email: string } }>(
    "/auth/register",
    { method: "POST", body: JSON.stringify({ username, email, password }) }
  );
}

export async function login(username: string, password: string) {
  return apiFetch<{ access_token: string; user: { id: string; username: string; email: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ username, password }) }
  );
}

// ── Scoring (stateless) ─────────────────────
export interface CarConfig {
  brand?: string;
  model_url?: string;
  body_type: string;
  color: string;
  engine: string;
  wheels: string;
  spoiler: string;
  suspension: string;
  brakes: string;
  turbo: boolean;
  weight_reduction: string;
  exhaust: string;
  transmission: string;
  aero_kit: string;
}

export interface PerformanceStats {
  horsepower: number;
  torque: number;
  weight: number;
  top_speed: number;
  acceleration: number;
  handling: number;
  score: number;
  car_class: string;
}

export async function calculateStats(config: CarConfig): Promise<PerformanceStats> {
  return apiFetch<PerformanceStats>("/scoring/calculate", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

// ── Builds ──────────────────────────────────
export interface Build {
  id: string;
  user_id: string;
  name: string;
  config: CarConfig;
  horsepower: number;
  torque: number;
  weight: number;
  top_speed: number;
  acceleration: number;
  handling: number;
  performance_score: number;
  car_class: string;
  created_at: string;
  updated_at: string;
}

export async function createBuild(token: string, name: string, config: CarConfig): Promise<Build> {
  return apiFetch<Build>("/builds", {
    method: "POST",
    token,
    body: JSON.stringify({ name, config }),
  });
}

export async function listBuilds(token: string): Promise<Build[]> {
  return apiFetch<Build[]>("/builds", { token });
}

export async function getBuild(token: string, id: string): Promise<Build> {
  return apiFetch<Build>(`/builds/${id}`, { token });
}

export async function updateBuild(token: string, id: string, data: { name?: string; config?: CarConfig }): Promise<Build> {
  return apiFetch<Build>(`/builds/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteBuild(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/builds/${id}`, { method: "DELETE", token });
}

// ── AI Insights ─────────────────────────────
export interface AiInsights {
  performance_analysis: string;
  class_explanation: string;
  upgrade_suggestions: string[];
}

export async function getAiInsights(config: CarConfig, stats: PerformanceStats): Promise<AiInsights> {
  return apiFetch<AiInsights>("/ai/insights", {
    method: "POST",
    body: JSON.stringify({ config, stats }),
  });
}

// ── Analytics ───────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  username: string;
  build_name: string;
  performance_score: number;
  car_class: string;
}

export interface ClassDistribution {
  car_class: string;
  count: number;
  percentage: number;
}

export interface TrendPoint {
  date: string;
  avg_score: number;
  build_count: number;
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(`/analytics/leaderboard?limit=${limit}`);
}

export async function getClassDistribution(): Promise<ClassDistribution[]> {
  return apiFetch<ClassDistribution[]>("/analytics/class-distribution");
}

export async function getTrends(days = 30): Promise<TrendPoint[]> {
  return apiFetch<TrendPoint[]>(`/analytics/trends?days=${days}`);
}

export async function getOverallStats(): Promise<{
  total_builds: number;
  total_users: number;
  avg_score: number;
  max_score: number;
}> {
  return apiFetch("/analytics/stats");
}

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  'http://localhost:8787';

export type GradeResponse = {
  label: string;
  price: number;
  status?: 'good' | 'warn' | 'bad';
  source?: string;
};

export type PricesResponse = {
  siteId: string;
  name: string;
  address: string;
  lastUpdated: string;
  grades: GradeResponse[];
  source?: string;
};

export type AnalysisStats = {
  ourPrice?: number;
  compAvg?: number | null;
  compMin?: number | null;
  compMax?: number | null;
  margin?: string | null;
  wholesalePrice?: number;
  wholesaleSource?: string;
  wholesaleParsedAt?: string | null;
};

export type AnalysisCompetitor = {
  name: string;
  distanceMi: number;
  price: number | null;
  delta?: number | null;
};

export type AnalysisResponse = {
  strategy: 'Match' | 'Premium' | 'Undercut';
  color: 'green' | 'yellow' | 'red';
  recommendation: string;
  competitors: AnalysisCompetitor[];
  stats?: AnalysisStats;
};

export type TankInfo = {
  grade: string;
  levelPct: number;
  gallons: number;
  capacity: number;
};

export type TankResponse = {
  lastSensorAt?: string;
  levelPct?: number;
  estDaysToEmpty?: number;
  notes?: string;
  tanks?: TankInfo[];
};

export type ServicesResponse = {
  laborPerHour: number;
  oilChange: number;
  tires: number;
  rating?: number;
  margin?: { labor?: number; oil?: number; tires?: number };
};

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const fetchPrices = (siteId: string) =>
  safeFetch<PricesResponse>(`/api/site/${siteId}/prices`);

export const fetchAnalysis = (siteId: string) =>
  safeFetch<AnalysisResponse>(`/api/site/${siteId}/analysis`);

export const fetchTank = (siteId: string) =>
  safeFetch<TankResponse>(`/api/site/${siteId}/tank`);

export const fetchServices = (siteId: string) =>
  safeFetch<ServicesResponse>(`/api/site/${siteId}/services`);

export const setStrategy = async (siteId: string, strategy: 'Match' | 'Premium' | 'Undercut') => {
  try {
    const res = await fetch(`${API_BASE}/api/site/${siteId}/strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const syncSite = async (siteId: string) => {
  try {
    const res = await fetch(`${API_BASE}/api/site/${siteId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const apiBase = API_BASE;

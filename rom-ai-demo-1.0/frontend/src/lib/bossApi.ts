const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

async function readErrorMessage(res: Response) {
  const text = await res.text().catch(() => '');
  if (!text) return `${res.status} ${res.statusText}`.trim();
  try {
    const data = JSON.parse(text) as { detail?: unknown; message?: unknown };
    const detail = data.detail ?? data.message;
    if (typeof detail === 'string') return detail;
    if (detail) return JSON.stringify(detail);
  } catch {
    // Keep plain text when the server does not return JSON.
  }
  return text;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return res.json();
}

/* ---------- Types ---------- */
export type BossMetric = {
  label: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  trend_value?: number;
};

export type BossTimeline = {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'milestone' | 'deadline';
};

export type BossTodo = {
  id: string;
  title: string;
  project_name: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  status: 'open' | 'in_progress' | 'overdue';
};

export type BossDashboard = {
  metrics: BossMetric[];
  timeline: BossTimeline[];
  todos: BossTodo[];
};

/* ---------- API Functions ---------- */
export function getBossDashboard() {
  return request<BossDashboard>('/api/boss/dashboard');
}

export function getBossMetrics() {
  return request<BossMetric[]>('/api/boss/metrics');
}

export function getBossTimeline() {
  return request<BossTimeline[]>('/api/boss/timeline');
}

export function getBossTodos() {
  return request<BossTodo[]>('/api/boss/todos');
}

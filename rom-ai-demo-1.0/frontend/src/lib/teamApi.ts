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
export type TeamMember = {
  id: string;
  project_id: string;
  name: string;
  role: string;
  skills: string;
  avatar: string;
  group: 'human' | 'ai';
  status: string;
  workload: number;
};

export type TeamMemberCreatePayload = {
  name: string;
  role: string;
  skills?: string;
  avatar?: string;
  group?: 'human' | 'ai';
};

/* ---------- API Functions ---------- */
export function listTeamMembers(projectId: string) {
  return request<TeamMember[]>(`/api/projects/${projectId}/team`);
}

export function addTeamMember(projectId: string, payload: TeamMemberCreatePayload) {
  return request<TeamMember>(`/api/projects/${projectId}/team`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function removeTeamMember(projectId: string, memberId: string) {
  return request<{ ok: boolean }>(`/api/projects/${projectId}/team/${memberId}`, { method: 'DELETE' });
}

export function updateTeamMember(projectId: string, memberId: string, payload: Partial<TeamMemberCreatePayload>) {
  return request<TeamMember>(`/api/projects/${projectId}/team/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

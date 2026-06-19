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
export type Meeting = {
  id: string;
  project_id: string;
  title: string;
  date: string;
  attendees: string;
  summary: string;
  action_items: string;
  created_at: string;
};

export type MeetingCreatePayload = {
  title: string;
  date: string;
  attendees?: string;
  summary?: string;
  action_items?: string;
};

/* ---------- API Functions ---------- */
export function listMeetings(projectId: string) {
  return request<Meeting[]>(`/api/projects/${projectId}/meetings`);
}

export function createMeeting(projectId: string, payload: MeetingCreatePayload) {
  return request<Meeting>(`/api/projects/${projectId}/meetings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMeeting(projectId: string, meetingId: string) {
  return request<Meeting>(`/api/projects/${projectId}/meetings/${meetingId}`);
}

export function updateMeeting(projectId: string, meetingId: string, payload: Partial<MeetingCreatePayload>) {
  return request<Meeting>(`/api/projects/${projectId}/meetings/${meetingId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteMeeting(projectId: string, meetingId: string) {
  return request<{ ok: boolean }>(`/api/projects/${projectId}/meetings/${meetingId}`, { method: 'DELETE' });
}

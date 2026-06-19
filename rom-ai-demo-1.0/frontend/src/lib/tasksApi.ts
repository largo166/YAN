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
export type Task = {
  id: string;
  project_id: string;
  task_name: string;
  task_type: string;
  priority: string;
  owner_role: string;
  estimated_days: number;
  dependencies: string;
  risk_level: string;
  status: string;
  output_requirement: string;
  created_at: string;
  updated_at: string;
};

export type TaskCreatePayload = {
  task_name: string;
  task_type?: string;
  priority?: string;
  owner_role?: string;
  estimated_days?: number;
  dependencies?: string;
  risk_level?: string;
  status?: string;
  output_requirement?: string;
};

export type TaskUpdatePayload = Partial<TaskCreatePayload> & { status?: string };

/* ---------- API Functions ---------- */
export function listTasks(projectId: string) {
  return request<Task[]>(`/api/projects/${projectId}/tasks`);
}

export function createTask(projectId: string, payload: TaskCreatePayload) {
  return request<Task>(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTask(projectId: string, taskId: string, payload: TaskUpdatePayload) {
  return request<Task>(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteTask(projectId: string, taskId: string) {
  return request<{ ok: boolean }>(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
}

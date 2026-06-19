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
export type SkillCard = {
  id: string;
  name: string;
  scenario: string;
  input: string;
  output: string;
  status: string;
};

export type SkillExecution = {
  id: string;
  project_id: string;
  skill_card_id: string;
  input_context: string;
  output_json: string;
  status: string;
  created_at: string;
};

export type SkillExecutionPayload = {
  project_id: string;
  input_context?: string;
};

/* ---------- API Functions ---------- */
export function listSkillCards() {
  return request<{ skill_cards: SkillCard[] }>('/api/skill-cards');
}

export function executeSkillCard(skillCardId: string, payload: SkillExecutionPayload) {
  return request<SkillExecution>(`/api/skill-cards/${skillCardId}/execute`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listSkillExecutions(projectId: string) {
  return request<SkillExecution[]>(`/api/projects/${projectId}/skill-executions`);
}

export function getSkillExecution(executionId: string) {
  return request<SkillExecution>(`/api/skill-executions/${executionId}`);
}

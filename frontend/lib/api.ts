import type { DashboardData, LoginResult, Task, TaskDetail, UploadResult } from '@/lib/types';
import { notifyAuthExpired } from '@/lib/auth';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  code: 'AUTH_EXPIRED' | 'REQUEST_FAILED';
  status: number;

  constructor(message: string, code: 'AUTH_EXPIRED' | 'REQUEST_FAILED', status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let detail = `Request failed: ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        detail = payload.detail;
      }
    } catch {
      // Ignore parsing failure.
    }

    if (isAuthError(response.status, detail)) {
      const message = '登录已过期，请重新登录。';
      notifyAuthExpired(message);
      throw new ApiError(message, 'AUTH_EXPIRED', response.status);
    }

    throw new ApiError(detail, 'REQUEST_FAILED', response.status);
  }

  return (await response.json()) as T;
}

export function isAuthExpiredError(error: unknown) {
  return error instanceof ApiError && error.code === 'AUTH_EXPIRED';
}

function isAuthError(status: number, detail: string) {
  if (status === 401) {
    return true;
  }

  return /token expired|unauthorized|invalid token/i.test(detail);
}

export const api = {
  login(username: string, password: string) {
    return request<LoginResult>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  upload(token: string, file?: File | null, text_content?: string) {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (text_content) {
      formData.append('text_content', text_content);
    }
    return request<UploadResult>('/api/uploads', {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  createTask(token: string, payload: { upload_id: number; title: string }) {
    return request<Task>('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },
  listTasks(token: string, query: Record<string, string>) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    const suffix = params.toString() ? `?${params}` : '';
    return request<Task[]>(`/api/tasks${suffix}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getTask(token: string, taskId: number) {
    return request<TaskDetail>(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  applyAction(token: string, taskId: number, payload: { action: string; comment: string }) {
    return request<{ ok: boolean; task_id: number; action: string; status: string }>(`/api/tasks/${taskId}/actions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },
  dashboard(token: string) {
    return request<DashboardData>('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ApiError {
  message: string;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(err?.message ?? `HTTP ${response.status} ${response.statusText}`);
  }

  return response.json();
}

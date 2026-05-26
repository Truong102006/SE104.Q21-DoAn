"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { ApiEnvelope, ApiErrorItem } from "@/types/backend";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const AUTH_STORAGE_KEY = "gold-store-auth";

export class ApiClientError extends Error {
  status: number;
  errors: ApiErrorItem[];

  constructor(message: string, status: number, errors: ApiErrorItem[] = []) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

function toQueryString(query?: Record<string, string | number | boolean | null | undefined>): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function readPersistedToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

function resolveToken(explicitToken?: string | null): string | null {
  if (explicitToken !== undefined) {
    return explicitToken;
  }

  const storeToken = useAuthStore.getState().token;
  if (storeToken) {
    return storeToken;
  }

  return readPersistedToken();
}

async function parseBody<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    query?: Record<string, string | number | boolean | null | undefined>;
    token?: string | null;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const method = options?.method ?? "GET";
  const token = resolveToken(options?.token);
  const queryString = toQueryString(options?.query);
  const url = `${API_BASE_URL}${path}${queryString}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options?.headers ?? {}),
  };

  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const parsedBody = await parseBody<T>(response);

  if (!response.ok || !parsedBody?.success) {
    const fallbackMessage = response.ok ? "Y\u00eau c\u1ea7u th\u1ea5t b\u1ea1i" : `HTTP ${response.status}`;
    const message = parsedBody?.message?.trim() || fallbackMessage;
    const errors = parsedBody?.errors ?? [];
    throw new ApiClientError(message, response.status, errors);
  }

  return parsedBody.data;
}

import type { LoginRequest, LoginResponse, User, UserRole } from "@/types";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BackendAuthPayload {
  accessToken?: string;
  tokenType?: string;
  username: string;
  groupCode: string;
  roles?: string[];
  permissions?: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function normalizeRole(payload: BackendAuthPayload): UserRole {
  const normalizedGroup = payload.groupCode.trim().toUpperCase();
  if (normalizedGroup === "ADMIN") {
    return "ADMIN";
  }
  return "STAFF";
}

function mapUser(payload: BackendAuthPayload): User {
  const role = normalizeRole(payload);
  return {
    id: 0,
    username: payload.username,
    fullName: payload.username,
    email: `${payload.username}@goldstore.local`,
    role,
    groupCode: payload.groupCode,
    roles: payload.roles ?? [payload.groupCode],
    permissions: payload.permissions ?? [],
  };
}

function normalizeErrorMessage(fallback: string, value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return fallback;
}

export async function loginWithPassword(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const body = (await response.json()) as ApiEnvelope<BackendAuthPayload>;
  if (!response.ok || !body.success || !body.data?.accessToken) {
    throw new Error(normalizeErrorMessage("Dang nhap that bai", body?.message));
  }

  return {
    token: body.data.accessToken,
    user: mapUser(body.data),
  };
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const body = (await response.json()) as ApiEnvelope<BackendAuthPayload>;
  if (!response.ok || !body.success || !body.data?.username) {
    throw new Error(normalizeErrorMessage("Khong lay duoc thong tin nguoi dung", body?.message));
  }

  return mapUser(body.data);
}

export async function requestLogout(token: string | null): Promise<void> {
  if (!token) {
    return;
  }

  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

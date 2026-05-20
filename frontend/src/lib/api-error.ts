import { ApiClientError } from "@/services/api-client";

export function getApiErrorMessage(error: unknown, fallback = "Yeu cau that bai"): string {
  if (error instanceof ApiClientError) {
    if (error.errors.length > 0) {
      return error.errors.map((item) => item.message).join("; ");
    }
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

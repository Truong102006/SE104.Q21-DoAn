import { ApiClientError } from "@/services/api-client";

export function getApiErrorMessage(error: unknown, fallback = "Y\u00eau c\u1ea7u th\u1ea5t b\u1ea1i"): string {
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

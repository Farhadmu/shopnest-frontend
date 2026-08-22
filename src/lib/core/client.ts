import { ApiError } from "./errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(endpoint: string, params?: RequestOptions["params"]): string {
  const url = new URL(`${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorDetails: unknown = null;

    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object") {
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
      }
    } catch {
      // Non-JSON error payload fallback
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Client Fetch Handler (GET)
 * Same contract as lib/core/server.ts's protectedFetch, but safe to call
 * from "use client" components. The browser attaches the better-auth
 * session cookie automatically (credentials: "include"); there is no
 * next/headers dependency here, so this file must stay client-safe.
 */
export async function clientFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
    credentials: "include",
  });

  return handleResponse<T>(response);
}

/** Client Mutation Handler (POST, PUT, PATCH, DELETE) */
export async function clientMutation<T>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    ...fetchOptions,
    method,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  return handleResponse<T>(response);
}

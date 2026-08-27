import { ApiError } from "./errors";

function getBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  url = url.trim().replace(/\/$/, "");
  if (url.startsWith("http") && !url.includes("/api/v1")) {
    url = `${url}/api/v1`;
  }
  if (typeof window === "undefined" && !url.startsWith("http")) {
    const port = process.env.PORT || 3000;
    url = `http://localhost:${port}${url.startsWith("/") ? "" : "/"}${url}`;
  }
  return url;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(endpoint: string, params?: RequestOptions["params"]): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseUrl = getBaseUrl();
  let fullPath = baseUrl.startsWith("http")
    ? `${baseUrl}${cleanEndpoint}`
    : `${baseUrl.replace(/\/$/, "")}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullPath += (fullPath.includes("?") ? "&" : "?") + queryString;
    }
  }
  return fullPath;
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

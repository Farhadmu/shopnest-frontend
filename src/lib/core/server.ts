import { ApiError } from "./errors";
import { getAuthHeaders } from "./session";

function getBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  url = url.trim().replace(/\/$/, "");
  if (url.startsWith("http") && !url.includes("/api/v1")) {
    url = `${url}/api/v1`;
  }
  return url;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Normalizes query parameter parameters onto the target URL.
 */
function buildUrl(endpoint: string, params?: RequestOptions["params"]): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}${cleanEndpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

/**
 * Parse and handle response output.
 */
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

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Public Fetch Handler
 * Makes unauthenticated requests to the Express backend.
 */
export async function publicFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  });

  return handleResponse<T>(response);
}

/**
 * Protected Fetch Handler (GET)
 * Makes authenticated requests to the Express backend by forwarding session credentials.
 */
export async function protectedFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);
  const authHeaders = await getAuthHeaders();

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...customHeaders,
    },
    credentials: "include",
  });

  return handleResponse<T>(response);
}

/**
 * Protected Mutation Handler (POST, PUT, PATCH, DELETE)
 * Executes authenticated mutations on the Express backend.
 */
export async function protectedMutation<T>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);
  const authHeaders = await getAuthHeaders();

  const response = await fetch(url, {
    ...fetchOptions,
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...customHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  return handleResponse<T>(response);
}

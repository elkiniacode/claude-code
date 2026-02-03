import type { User, RegisterRequest, LoginRequest } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper: Fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

// Helper: Handle API response
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: unknown;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      }
    } catch {
      // Failed to parse error response
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('Failed to parse response JSON', response.status);
  }
}

// Token management helpers
function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

// API methods
async function register(data: RegisterRequest): Promise<User> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<User>(response);
}

async function login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
  // Step 1: Get token
  const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const tokenData = await handleApiResponse<{ access_token: string; token_type: string }>(response);
  const token = tokenData.access_token;

  // Step 2: Save token
  saveToken(token);

  // Step 3: Get user data
  const user = await getCurrentUser(token);

  return { user, token };
}

async function getCurrentUser(token?: string): Promise<User> {
  const authToken = token || getToken();

  if (!authToken) {
    throw new ApiError('No authentication token available', 401);
  }

  const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  return handleApiResponse<User>(response);
}

async function logout(): Promise<void> {
  // Client-side only: clear localStorage
  clearToken();
}

export const authApi = {
  register,
  login,
  getCurrentUser,
  logout,
  getToken,
  saveToken,
  clearToken,
} as const;

import { ApiError, ApiResponse } from '@/types';
import { APP_CONFIG } from '@/constants/config';

const API_BASE_URL = APP_CONFIG.apiUrl;

type AuthProvider = {
  getRefreshToken: () => string | null;
  setToken: (token: string) => void;
  onLogout: () => void;
};

const isLocalUrl = (url: string) => url.includes('localhost') || url.includes('127.0.0.1');

const looksLikeHtml = (text: string) => {
  const trimmed = text.trimStart();
  return trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype');
};

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private authProvider: AuthProvider | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken;
  }

  setAuthProvider(provider: AuthProvider | null) {
    this.authProvider = provider;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      return { error: this.buildNetworkError(error) };
    }

    const text = await response.text();
    const parsed = this.parseBody(text, response);
    if ('error' in parsed) {
      return parsed;
    }
    const data = parsed.data;

    if (!response.ok) {
      // 401 + refresh-token available => try refresh once, then retry or log out.
      if (response.status === 401 && !isRetry && this.authProvider) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, true);
        }
        this.authProvider.onLogout();
      }

      const errorMessage =
        (typeof data === 'object' && data !== null && 'error' in data && (data as any).error) ||
        (typeof data === 'object' && data !== null && 'message' in data && (data as any).message) ||
        `HTTP ${response.status}: ${response.statusText}`;

      return {
        error: {
          code:
            (typeof data === 'object' && data !== null && 'code' in data && (data as any).code) ||
            'HTTP_ERROR',
          message: String(errorMessage),
          details:
            typeof data === 'object' && data !== null && 'details' in data
              ? (data as any).details
              : undefined,
        },
      };
    }

    return { data: data as T };
  }

  private parseBody(
    text: string,
    response: Response,
  ): { data: unknown } | { error: ApiError } {
    if (!text || text.trim() === '') {
      if (response.ok) {
        return { data: null };
      }
      return {
        error: {
          code: 'EMPTY_RESPONSE',
          message: `Empty response from server (HTTP ${response.status})`,
        },
      };
    }

    if (looksLikeHtml(text)) {
      return {
        error: {
          code: 'HTML_RESPONSE',
          message: `Server returned HTML instead of JSON (HTTP ${response.status})`,
        },
      };
    }

    try {
      return { data: JSON.parse(text) };
    } catch (parseError) {
      return {
        error: {
          code: 'PARSE_ERROR',
          message: `Failed to parse response: ${
            parseError instanceof Error ? parseError.message : 'Unknown error'
          }`,
        },
      };
    }
  }

  private buildNetworkError(error: unknown): ApiError {
    const message = error instanceof Error ? error.message : 'Network request failed';
    const isFetchFailure =
      message.includes('Network request failed') || message.includes('Failed to fetch');

    if (!isFetchFailure) {
      return { code: 'NETWORK_ERROR', message };
    }

    const detailedMessage = isLocalUrl(this.baseUrl)
      ? `Cannot connect to server at ${this.baseUrl}. On mobile devices, use your computer's IP address instead of localhost. Set EXPO_PUBLIC_API_URL environment variable (e.g., http://192.168.1.100:3000/api)`
      : `Cannot connect to server at ${this.baseUrl}. Please check:\n1. Backend is running\n2. Correct IP address\n3. Device and server are on the same network`;

    return { code: 'NETWORK_ERROR', message: detailedMessage };
  }

  /**
   * Deduplicates concurrent refresh attempts: while one refresh is in flight,
   * subsequent 401 retries reuse the same promise.
   */
  private refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    this.refreshPromise = this.performRefresh().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }

  private async performRefresh(): Promise<boolean> {
    const refreshToken = this.authProvider?.getRefreshToken() ?? this.refreshToken;
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;

      const text = await response.text();
      if (!text) return false;
      const data = JSON.parse(text);
      const token = data.token ?? data.data?.token;
      if (!token) return false;

      this.token = token;
      this.authProvider?.setToken(token);
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

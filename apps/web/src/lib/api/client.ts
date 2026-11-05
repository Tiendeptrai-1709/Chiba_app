// HTTP client gọi NestJS API qua rewrite `/api/*` trong next.config.ts.
// Tự gắn access token và tự refresh một lần khi gặp 401.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const ACCESS_TOKEN_KEY = 'chiba_access_token';
const REFRESH_TOKEN_KEY = 'chiba_refresh_token';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ----- Lưu token -----
const safeStorage = {
  get(key: string): string | null {
    try {
      return typeof window === 'undefined' ? null : localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

export const tokenStore = {
  getAccess: () => safeStorage.get(ACCESS_TOKEN_KEY),
  getRefresh: () => safeStorage.get(REFRESH_TOKEN_KEY),
  save(tokens: AuthTokens) {
    safeStorage.set(ACCESS_TOKEN_KEY, tokens.accessToken);
    safeStorage.set(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clear() {
    safeStorage.remove(ACCESS_TOKEN_KEY);
    safeStorage.remove(REFRESH_TOKEN_KEY);
  },
};

// Gọi khi refresh thất bại (phiên hết hạn) để store đăng xuất.
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

// ----- Request -----
async function parseError(res: Response): Promise<ApiError> {
  let message = 'Có lỗi xảy ra, vui lòng thử lại';
  try {
    const body = await res.json();
    if (Array.isArray(body?.message)) message = body.message.join('\n');
    else if (typeof body?.message === 'string') message = body.message;
  } catch {}
  return new ApiError(res.status, message);
}

// Đường dẫn file tĩnh do API trả về (vd. "/uploads/products/x.webp") → URL dùng được trên web.
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path}`;
}

async function rawRequest(path: string, init: RequestInit, token: string | null): Promise<Response> {
  const headers = new Headers(init.headers);
  // FormData (upload file): để trình duyệt tự đặt Content-Type kèm boundary.
  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  try {
    return await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.');
  }
}

// Nhiều request cùng gặp 401 chỉ refresh một lần.
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  refreshPromise ??= (async () => {
    try {
      const res = await rawRequest('/auth/refresh', { method: 'POST' }, refreshToken);
      if (!res.ok) return false;
      const data = (await res.json()) as AuthTokens;
      tokenStore.save(data);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // mặc định true
}

export async function apiRequest<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const init: RequestInit = {
    method,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  };

  let res = await rawRequest(path, init, auth ? tokenStore.getAccess() : null);

  if (res.status === 401 && auth) {
    if (await refreshTokens()) {
      res = await rawRequest(path, init, tokenStore.getAccess());
    } else {
      tokenStore.clear();
      onSessionExpired?.();
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

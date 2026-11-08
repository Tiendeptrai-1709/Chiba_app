// Gọi NestJS API: tự gắn access token, gặp 401 thì gia hạn token một lần rồi gọi lại.
// Cùng cách làm với web (apps/web/src/lib/api/client.ts), chỉ khác chỗ lưu token.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';

const ACCESS_KEY = 'chiba_access_token';
const REFRESH_KEY = 'chiba_refresh_token';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Token lưu trong SecureStore (Keychain / Keystore). Bản web (để test) dùng localStorage.
const storage = {
  async get(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') return localStorage.getItem(key);
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string) {
    try {
      if (Platform.OS === 'web') localStorage.setItem(key, value);
      else await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async remove(key: string) {
    try {
      if (Platform.OS === 'web') localStorage.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

// Giữ bản sao trong bộ nhớ để mỗi request không phải đọc SecureStore
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenStore = {
  async load() {
    [accessToken, refreshToken] = await Promise.all([storage.get(ACCESS_KEY), storage.get(REFRESH_KEY)]);
    return !!refreshToken;
  },
  async save(tokens: AuthTokens) {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    await Promise.all([storage.set(ACCESS_KEY, tokens.accessToken), storage.set(REFRESH_KEY, tokens.refreshToken)]);
  },
  async clear() {
    accessToken = null;
    refreshToken = null;
    await Promise.all([storage.remove(ACCESS_KEY), storage.remove(REFRESH_KEY)]);
  },
};

let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

async function parseError(res: Response): Promise<ApiError> {
  let message = 'Có lỗi xảy ra, vui lòng thử lại';
  try {
    const body = await res.json();
    if (Array.isArray(body?.message)) message = body.message.join('\n');
    else if (typeof body?.message === 'string') message = body.message;
  } catch {}
  if (res.status === 429) message = 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút';
  return new ApiError(res.status, message);
}

// Đường dẫn ảnh do API trả về ("/uploads/products/x.webp") → URL đầy đủ
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path}`;
}

async function rawRequest(path: string, init: RequestInit, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    return await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch (e: any) {
    // Lỗi mạng thật vs lỗi xảy ra ngay trên máy (vd. dữ liệu gửi đi không hợp lệ) — ghi kèm chi tiết để dễ tìm nguyên nhân
    const detail = typeof e?.message === 'string' && !/network request failed|failed to fetch/i.test(e.message) ? ` [${e.message}]` : '';
    throw new ApiError(0, `Không kết nối được máy chủ (${API_URL}). Kiểm tra mạng hoặc máy chủ đã bật chưa.${detail}`);
  }
}

// Nhiều request cùng gặp 401 chỉ gia hạn token một lần
let refreshPromise: Promise<boolean> | null = null;

export async function refreshTokens(): Promise<boolean> {
  if (!refreshToken) return false;
  refreshPromise ??= (async () => {
    try {
      const res = await rawRequest('/auth/refresh', { method: 'POST' }, refreshToken);
      if (!res.ok) return false;
      await tokenStore.save((await res.json()) as AuthTokens);
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

  let res = await rawRequest(path, init, auth ? accessToken : null);

  if (res.status === 401 && auth) {
    if (await refreshTokens()) {
      res = await rawRequest(path, init, accessToken);
    } else {
      await tokenStore.clear();
      onSessionExpired?.();
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

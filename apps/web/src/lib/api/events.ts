'use client';

import { useEffect, useRef } from 'react';
import { API_BASE, refreshTokens, tokenStore } from './client';

export interface OrderEvent {
  type: 'order.created' | 'order.updated';
  orderId: string;
  code: string;
  status: string;
  userId: string | null;
  paid: boolean;
}

const RETRY_MS = 3_000;
const MAX_RETRY_MS = 30_000;
// Server gửi "ping" mỗi 25 giây; im lặng lâu hơn mức này nghĩa là kết nối đã chết
// (hoặc proxy giữ lại dữ liệu, vd. Cloudflare Quick Tunnel) → ngắt và kết nối lại.
const SILENCE_TIMEOUT_MS = 60_000;

// Khi kết nối tức thì không dùng được, các trang vẫn tự tải lại sau khoảng này
export const ORDER_FALLBACK_POLL_MS = 20_000;

// Nhận sự kiện đơn hàng tức thì qua Server-Sent Events.
// Dùng fetch (không dùng EventSource) để gửi được header Authorization; tự kết nối lại
// khi rớt mạng và tự gia hạn token khi hết hạn.
export function subscribeOrderEvents(path: string, onEvent: (e: OrderEvent) => void): () => void {
  const controller = new AbortController();
  let delay = RETRY_MS;

  const run = async () => {
    while (!controller.signal.aborted) {
      try {
        let res = await connect(path, controller.signal);
        if (res.status === 401 && (await refreshTokens())) res = await connect(path, controller.signal);
        if (!res.ok || !res.body) throw new Error(`SSE ${res.status}`);
        delay = RETRY_MS; // kết nối thành công → reset thời gian chờ
        await readStream(res.body, onEvent, controller.signal);
      } catch {
        if (controller.signal.aborted) return;
      }
      // Rớt kết nối → chờ rồi thử lại (tăng dần, tối đa 30 giây)
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, MAX_RETRY_MS);
    }
  };
  run();
  return () => controller.abort();
}

function connect(path: string, signal: AbortSignal) {
  const token = tokenStore.getAccess();
  return fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'text/event-stream', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    signal,
    cache: 'no-store',
  });
}

async function readStream(body: ReadableStream<Uint8Array>, onEvent: (e: OrderEvent) => void, signal: AbortSignal) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const armWatchdog = () => {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => reader.cancel().catch(() => {}), SILENCE_TIMEOUT_MS);
  };
  signal.addEventListener('abort', () => clearTimeout(watchdog), { once: true });
  armWatchdog();
  while (!signal.aborted) {
    const { value, done } = await reader.read();
    if (done) {
      clearTimeout(watchdog);
      return;
    }
    armWatchdog();
    buffer += decoder.decode(value, { stream: true });
    // Mỗi sự kiện SSE kết thúc bằng một dòng trống
    let sep: number;
    while ((sep = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep).replace(/^\r?\n\r?\n/, '');
      let type = 'message';
      const data: string[] = [];
      for (const line of raw.split(/\r?\n/)) {
        if (line.startsWith('event:')) type = line.slice(6).trim();
        else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
      }
      if (type !== 'order.created' && type !== 'order.updated') continue; // bỏ qua ping
      try {
        onEvent(JSON.parse(data.join('\n')) as OrderEvent);
      } catch {}
    }
  }
}

// Hook React: đăng ký nhận sự kiện khi `enabled`, tự hủy khi rời trang.
export function useOrderEvents(path: string, enabled: boolean, onEvent: (e: OrderEvent) => void) {
  const handler = useRef(onEvent);
  handler.current = onEvent;
  useEffect(() => {
    if (!enabled) return;
    return subscribeOrderEvents(path, (e) => handler.current(e));
  }, [path, enabled]);
}

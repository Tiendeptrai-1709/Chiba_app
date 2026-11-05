import { Injectable } from "@nestjs/common";
import { Observable, Subject, filter, interval, map, merge } from "rxjs";

export type OrderEventType = "order.created" | "order.updated";

export interface OrderEvent {
  type: OrderEventType;
  orderId: string;
  code: string;
  status: string;
  userId: string | null;
  paid: boolean;
}

export interface SseMessage {
  type?: string;
  data: string | object;
}

const HEARTBEAT_MS = 25_000; // giữ kết nối qua proxy / Cloudflare (thường cắt sau ~100 giây im lặng)

// Kênh phát sự kiện đơn hàng tới các trình duyệt đang mở (Server-Sent Events).
// Chạy trong bộ nhớ của 1 tiến trình API — đủ cho 1 máy chủ. Nếu sau này chạy nhiều
// máy chủ API cùng lúc thì cần chuyển sang Redis pub/sub.
@Injectable()
export class OrderEventsService {
  private readonly events = new Subject<OrderEvent>();

  emit(event: OrderEvent) {
    this.events.next(event);
  }

  // forUserId: chỉ nhận sự kiện đơn của khách đó; bỏ trống = mọi đơn (nhân viên)
  stream(forUserId?: string): Observable<SseMessage> {
    const orders = this.events.pipe(
      filter((e) => !forUserId || e.userId === forUserId),
      map((e): SseMessage => ({ type: e.type, data: e })),
    );
    const heartbeat = interval(HEARTBEAT_MS).pipe(map((): SseMessage => ({ type: "ping", data: "{}" })));
    return merge(orders, heartbeat);
  }
}

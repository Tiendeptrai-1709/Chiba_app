// Đổi chuỗi thời hạn kiểu "15m", "7d", "12h", "30s" (hoặc số giây) sang mili-giây.
export function durationToMs(value: string): number {
  const match = /^(\d+)\s*([smhd]?)$/.exec(value.trim());
  if (!match) throw new Error(`Thời hạn không hợp lệ: "${value}" (ví dụ hợp lệ: 15m, 7d)`);
  const amount = Number(match[1]);
  const unit = { "": 1_000, s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as "" | "s" | "m" | "h" | "d"];
  return amount * unit;
}

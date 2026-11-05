'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { MenuStats as MenuStatsData, Store } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

// Ngày theo giờ Việt Nam dạng YYYY-MM-DD (server cũng tính theo giờ Việt Nam)
const vnDate = (offsetDays = 0) => new Date(Date.now() + 7 * 3600_000 + offsetDays * DAY_MS).toISOString().slice(0, 10);

type Preset = 'TODAY' | 'YESTERDAY' | '7D' | '30D' | 'MONTH' | 'CUSTOM';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'TODAY', label: 'Hôm nay' },
  { key: 'YESTERDAY', label: 'Hôm qua' },
  { key: '7D', label: '7 ngày' },
  { key: '30D', label: '30 ngày' },
  { key: 'MONTH', label: 'Tháng này' },
  { key: 'CUSTOM', label: 'Tùy chọn' },
];

function presetRange(preset: Preset): { from: string; to: string } | null {
  const today = vnDate();
  switch (preset) {
    case 'TODAY':
      return { from: today, to: today };
    case 'YESTERDAY':
      return { from: vnDate(-1), to: vnDate(-1) };
    case '7D':
      return { from: vnDate(-6), to: today };
    case '30D':
      return { from: vnDate(-29), to: today };
    case 'MONTH':
      return { from: `${today.slice(0, 8)}01`, to: today };
    default:
      return null;
  }
}

const money = (n: number) => `${n.toLocaleString('vi-VN')}₫`;
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

// Thống kê bán hàng theo danh mục và từng món (chỉ đơn đã hoàn thành)
export default function MenuStats() {
  const [preset, setPreset] = useState<Preset>('7D');
  const [range, setRange] = useState(() => presetRange('7D')!);
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [data, setData] = useState<MenuStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bấm vào một danh mục để lọc bảng món bên dưới
  const [focusGroup, setFocusGroup] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    apiRequest<Store[]>('/stores', { auth: false })
      .then(setStores)
      .catch(() => setStores([]));
  }, []);

  const load = useCallback(async () => {
    if (!range.from || !range.to) return;
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ from: range.from, to: range.to });
      if (storeId) q.set('storeId', storeId);
      setData(await apiRequest<MenuStatsData>(`/stats/menu?${q}`));
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được thống kê');
    } finally {
      setLoading(false);
    }
  }, [range, storeId]);

  useEffect(() => {
    load();
  }, [load]);

  const choosePreset = (p: Preset) => {
    setPreset(p);
    const r = presetRange(p);
    if (r) setRange(r);
  };

  const totalQty = useMemo(() => data?.groups.reduce((s, g) => s + g.quantity, 0) ?? 0, [data]);
  const maxGroupRevenue = useMemo(() => Math.max(1, ...(data?.groups.map((g) => g.revenue) ?? [])), [data]);
  const shownProducts = useMemo(
    () => (data ? (focusGroup === undefined ? data.products : data.products.filter((p) => p.groupId === focusGroup)) : []),
    [data, focusGroup],
  );
  const focusName = focusGroup === undefined ? null : data?.groups.find((g) => g.groupId === focusGroup)?.name;

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-5">
      <div className="border-b border-border pb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">📈 Thống kê món bán</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Chỉ tính đơn đã hoàn thành, theo giờ Việt Nam. Món được xếp theo danh mục hiện tại — đổi danh mục trong tab “Món &
            kho”.
          </p>
        </div>
        <button onClick={load} aria-label="Tải lại" className="p-2 rounded-lg border border-border hover:bg-muted shrink-0">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Bộ lọc thời gian + chi nhánh */}
      <div className="space-y-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => choosePreset(p.key)}
              aria-pressed={preset === p.key}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                preset === p.key ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {preset === 'CUSTOM' && (
            <>
              <label className="text-[11px] font-bold text-muted-foreground space-y-1">
                <span className="block uppercase">Từ ngày</span>
                <input
                  type="date"
                  value={range.from}
                  max={range.to}
                  onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                  className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground bg-card"
                />
              </label>
              <label className="text-[11px] font-bold text-muted-foreground space-y-1">
                <span className="block uppercase">Đến ngày</span>
                <input
                  type="date"
                  value={range.to}
                  min={range.from}
                  onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                  className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground bg-card"
                />
              </label>
            </>
          )}
          {stores.length > 1 && (
            <label className="text-[11px] font-bold text-muted-foreground space-y-1">
              <span className="block uppercase">Chi nhánh</span>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground bg-card max-w-[14rem]"
              >
                <option value="">Tất cả chi nhánh</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

      {data && (
        <>
          {/* Số tổng */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-neutral-50 border border-border/70 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Đơn hoàn thành</p>
              <p className="text-lg font-black text-foreground tabular-nums">{data.orderCount}</p>
            </div>
            <div className="bg-neutral-50 border border-border/70 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Doanh thu</p>
              <p className="text-lg font-black text-primary tabular-nums">{money(data.revenue)}</p>
            </div>
            <div className="bg-neutral-50 border border-border/70 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Số phần bán</p>
              <p className="text-lg font-black text-foreground tabular-nums">{totalQty}</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground -mt-2">
            Doanh thu = tiền khách thực trả (đã trừ điểm, gồm phí ship). Tiền theo danh mục/món = giá món × số phần, chưa trừ
            điểm; topping tính vào danh mục của topping.
          </p>

          {data.groups.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-border">
              Chưa có đơn hoàn thành trong khoảng thời gian này.
            </p>
          ) : (
            <>
              {/* Theo danh mục */}
              <section className="space-y-2">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Theo danh mục</h4>
                <ul className="space-y-1.5">
                  {data.groups.map((g) => {
                    const active = focusGroup === g.groupId;
                    return (
                      <li key={g.groupId ?? 'none'}>
                        <button
                          onClick={() => setFocusGroup(active ? undefined : g.groupId)}
                          aria-pressed={active}
                          className={`w-full text-left rounded-xl border px-3 py-2.5 transition ${
                            active ? 'border-primary bg-primary/5' : 'border-border/70 hover:bg-muted/60'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-bold text-foreground truncate">{g.name}</span>
                            <span className="text-xs font-black text-foreground tabular-nums shrink-0">{money(g.revenue)}</span>
                          </div>
                          <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${(g.revenue / maxGroupRevenue) * 100}%` }} />
                          </div>
                          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
                            <span>{g.quantity} phần</span>
                            <span>{pct(g.revenue, data.itemRevenue)}% tiền món</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Theo từng món */}
              <section className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Món bán chạy{focusName ? ` · ${focusName}` : ''}
                  </h4>
                  {focusGroup !== undefined && (
                    <button onClick={() => setFocusGroup(undefined)} className="text-[11px] font-bold text-primary underline underline-offset-2">
                      Xem tất cả
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto rounded-xl border border-border/70">
                  <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-[10px] uppercase text-muted-foreground">
                      <tr>
                        <th className="text-left font-bold px-3 py-2 w-8">#</th>
                        <th className="text-left font-bold px-2 py-2">Món</th>
                        <th className="text-right font-bold px-2 py-2">Số phần</th>
                        <th className="text-right font-bold px-3 py-2">Tiền món</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {shownProducts.map((p, i) => (
                        <tr key={p.productId}>
                          <td className="px-3 py-2 text-muted-foreground tabular-nums">{i + 1}</td>
                          <td className="px-2 py-2">
                            <p className="font-bold text-foreground leading-snug">{p.name}</p>
                            {focusGroup === undefined && <p className="text-[10px] text-muted-foreground">{p.groupName}</p>}
                          </td>
                          <td className="px-2 py-2 text-right font-bold tabular-nums">{p.quantity}</td>
                          <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{money(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

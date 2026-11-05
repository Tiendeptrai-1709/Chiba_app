'use client';

import React, { useMemo, useState } from 'react';
import { Crown, RefreshCw, Search } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { ROLE_LABELS, User, UserRole } from '@/types';

const ASSIGNABLE: UserRole[] = ['CUSTOMER', 'STAFF', 'ADMIN'];

const ROLE_TONE: Record<UserRole, string> = {
  CUSTOMER: 'bg-neutral-100 text-neutral-700',
  STAFF: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-primary/10 text-primary',
  OWNER: 'bg-amber-100 text-amber-800',
};

interface RoleManagerProps {
  users: User[];
  currentUserId: string;
  onChanged: () => void;
}

// Chỉ OWNER thấy: thăng cấp / hạ cấp Khách hàng ↔ Nhân viên ↔ Admin.
// Phong OWNER chỉ làm trực tiếp trong database.
export default function RoleManager({ users, currentUserId, onChanged }: RoleManagerProps) {
  const { showError, showSuccess } = useNotificationStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | UserRole>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ user: User; role: UserRole } | null>(null);

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    const order: Record<UserRole, number> = { OWNER: 0, ADMIN: 1, STAFF: 2, CUSTOMER: 3 };
    return users
      .filter((u) => filter === 'ALL' || u.role === filter)
      .filter(
        (u) =>
          !q ||
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.customerCode.toLowerCase().includes(q) ||
          (u.phone ?? '').includes(q),
      )
      .sort((a, b) => order[a.role] - order[b.role] || a.fullName.localeCompare(b.fullName, 'vi'));
  }, [users, query, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    users.forEach((u) => (c[u.role] = (c[u.role] ?? 0) + 1));
    return c;
  }, [users]);

  const apply = async () => {
    if (!pending) return;
    const { user, role } = pending;
    setBusyId(user.id);
    try {
      await apiRequest(`/users/${user.id}/role`, { method: 'PATCH', body: { role } });
      showSuccess(`${user.fullName} giờ là ${ROLE_LABELS[role]}`);
      setPending(null);
      onChanged();
    } catch (e: any) {
      showError(e?.message ?? 'Không đổi được vai trò');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-border/60 pb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-600" /> Phân quyền nhân sự
          </h2>
          <p className="text-[11px] text-muted-foreground mt-1">
            Thăng cấp khách hàng thành Nhân viên hoặc Admin, hoặc hạ cấp khi nghỉ việc. Có hiệu lực ngay ở lần thao tác tiếp
            theo của người đó.
          </p>
        </div>
        <button onClick={onChanged} aria-label="Tải lại" className="p-2 rounded-lg border border-border hover:bg-muted shrink-0">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT hoặc mã khách..."
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {(['ALL', 'OWNER', 'ADMIN', 'STAFF', 'CUSTOMER'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            aria-pressed={filter === r}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              filter === r ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border'
            }`}
          >
            {r === 'ALL' ? `Tất cả (${users.length})` : `${ROLE_LABELS[r]} (${counts[r] ?? 0})`}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl divide-y divide-border/60 overflow-hidden">
        {list.map((u) => {
          const locked = u.role === 'OWNER' || u.id === currentUserId;
          return (
            <div key={u.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground truncate">{u.fullName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_TONE[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                  {u.id === currentUserId && <span className="text-[10px] text-muted-foreground">(bạn)</span>}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {u.email} · {u.customerCode}
                </p>
              </div>
              {locked ? (
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {u.role === 'OWNER' ? 'Đổi trong database' : '—'}
                </span>
              ) : (
                <select
                  aria-label={`Vai trò của ${u.fullName}`}
                  value={u.role}
                  disabled={busyId === u.id}
                  onChange={(e) => setPending({ user: u, role: e.target.value as UserRole })}
                  className="shrink-0 text-xs font-bold border border-border rounded-lg px-2 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ASSIGNABLE.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="text-center text-xs text-muted-foreground py-10">Không tìm thấy người dùng nào</p>}
      </div>

      {/* Xác nhận ngay trong trang trước khi đổi quyền */}
      {pending && (
        <div className="sticky bottom-4 bg-foreground text-white rounded-2xl p-4 shadow-modal space-y-3">
          <p className="text-sm">
            Đổi <b>{pending.user.fullName}</b> từ {ROLE_LABELS[pending.user.role]} thành <b>{ROLE_LABELS[pending.role]}</b>?
          </p>
          {pending.role === 'ADMIN' && (
            <p className="text-xs text-white/70">Admin xem được toàn bộ khách hàng, điều chỉnh điểm và sửa menu.</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setPending(null)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-sm font-semibold">
              Hủy
            </button>
            <button onClick={apply} disabled={!!busyId} className="flex-1 py-2.5 rounded-xl bg-white text-foreground text-sm font-bold disabled:opacity-50">
              {busyId ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

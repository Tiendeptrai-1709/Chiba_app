'use client';

import { useEffect, useState } from 'react';
import { History, RefreshCw, Search } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { POINT_TYPE_LABELS, PointTransaction, PointTransactionType } from '@/types';

const TYPE_TONE: Record<PointTransactionType, string> = {
  EARNED_ORDER: 'bg-green-50 text-green-700 border-green-200',
  EARNED_STORE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REDEEMED_APP: 'bg-blue-50 text-blue-700 border-blue-200',
  REDEEMED_STORE: 'bg-orange-50 text-orange-700 border-orange-200',
  REFUND: 'bg-sky-50 text-sky-700 border-sky-200',
  ADMIN_ADJUST: 'bg-purple-50 text-purple-700 border-purple-200',
};

function TransactionHistory() {
  const fetchPointHistory = useAuthStore((s) => s.fetchPointHistory);
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setHistory(await fetchPointHistory('all'));
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được nhật ký điểm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = query.toLowerCase().trim();
  const filtered = history.filter(
    (tx) =>
      !q ||
      tx.user?.fullName.toLowerCase().includes(q) ||
      tx.user?.email.toLowerCase().includes(q) ||
      tx.user?.customerCode.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-4">
      <div className="border-b border-border/60 pb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
            <History className="w-4 h-4 text-primary" /> Nhật ký giao dịch điểm
          </h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            Tích điểm online/tại quầy, dùng điểm, đổi quà, hoàn điểm và điều chỉnh của Admin.
          </p>
        </div>
        <button
          onClick={load}
          aria-label="Tải lại"
          className="p-2 rounded-lg border border-border hover:bg-muted transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Lọc theo tên, email, mã khách hoặc nội dung..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold placeholder:text-muted-foreground/50 shadow-sm"
        />
      </div>

      {error && <p className="text-xs text-destructive font-semibold">{error}</p>}

      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/60 shadow-sm">
        {filtered.map((tx) => {
          const positive = tx.points >= 0;
          return (
            <div key={tx.id} className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{tx.user?.fullName ?? 'Khách đã xóa'}</span>
                  {tx.user && <span className="text-[9.5px] text-muted-foreground font-medium">{tx.user.customerCode}</span>}
                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase border ${TYPE_TONE[tx.type]}`}>
                    {POINT_TYPE_LABELS[tx.type]}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-semibold">{tx.description}</p>
                <div className="flex gap-2.5 text-[9.5px] text-muted-foreground font-semibold flex-wrap">
                  <span>
                    Số dư: {tx.pointsBefore} → {tx.pointsAfter}
                  </span>
                  <span>•</span>
                  <span>{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
              <div
                className={`text-xs font-black whitespace-nowrap px-2 py-1 rounded ${
                  positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-destructive'
                }`}
              >
                {positive ? '+' : ''}
                {tx.points}
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xs text-muted-foreground font-bold">Chưa có giao dịch điểm nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;

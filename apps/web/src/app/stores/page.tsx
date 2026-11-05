'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, MapPin, Phone, RefreshCw, Search } from 'lucide-react';
import { Store } from '@/types';
import { apiRequest } from '@/lib/api/client';
import { getSelectedStore, saveSelectedStore } from '@/lib/selectedStore';

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setStores(await apiRequest<Store[]>('/stores', { auth: false }));
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được danh sách cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedId(getSelectedStore()?.id ?? null);
    load();
  }, []);

  const handleSelectStore = (store: Store) => {
    saveSelectedStore(store);
    router.push('/order');
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredStores = stores.filter(
    (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q),
  );

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="sticky top-0 z-40 bg-primary text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/order" aria-label="Quay lại đặt món" className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Chọn cửa hàng</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
          <input
            type="search"
            placeholder="Tìm kiếm chi nhánh gần nhất..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Đang tải danh sách cửa hàng...</div>
          ) : error ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-foreground">{error}</p>
              <button onClick={load} className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2 rounded-full">
                <RefreshCw className="w-4 h-4" /> Thử lại
              </button>
            </div>
          ) : filteredStores.length > 0 ? (
            filteredStores.map((store, index) => {
              const selected = store.id === selectedId;
              return (
                <button
                  key={store.id}
                  onClick={() => handleSelectStore(store)}
                  aria-pressed={selected}
                  className={`w-full text-left p-5 hover:bg-neutral-50 active:bg-neutral-100 flex items-start gap-4 transition-all duration-150 ${
                    index !== filteredStores.length - 1 ? 'border-b border-border' : ''
                  } ${selected ? 'bg-primary/5' : ''}`}
                >
                  <div className="p-2 bg-primary/5 rounded-xl mt-0.5 text-primary shrink-0">
                    <MapPin className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm tracking-tight truncate">{store.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{store.address}</p>
                    {store.phone && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {store.phone}
                      </p>
                    )}
                  </div>
                  {selected && <Check className="w-5 h-5 text-primary shrink-0 mt-1" aria-label="Đang chọn" />}
                </button>
              );
            })
          ) : (
            <div className="p-10 text-center text-muted-foreground">
              <p className="text-3xl mb-2">📍</p>
              <p className="font-semibold text-sm">Không tìm thấy chi nhánh nào</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Vui lòng thử tìm kiếm bằng từ khóa khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

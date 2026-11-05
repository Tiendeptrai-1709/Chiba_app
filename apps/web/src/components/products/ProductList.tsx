'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useProductStore } from '@/lib/stores/useProductStore';
import ProductCard from './ProductCard';
import { useProductPicker } from './useProductPicker';

// 'ALL' = tất cả, 'NONE' = món chưa có danh mục, còn lại là id danh mục
const ALL = 'ALL';
const NONE = 'NONE';

export default function ProductList() {
  const { products, groups, loaded, loading, error, fetchProducts } = useProductStore();
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const { pick, overlay } = useProductPicker();

  // Luôn tải lại khi mở trang để thấy ngay món nhân viên vừa báo hết.
  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  // Chip danh mục: chỉ hiện danh mục đang có món, theo thứ tự Admin đặt
  const categories = useMemo(() => {
    const ids = new Set(groups.map((g) => g.id));
    const chips = [{ key: ALL, label: 'Tất cả' }];
    for (const g of groups) if (products.some((p) => p.groupId === g.id)) chips.push({ key: g.id, label: g.name });
    if (chips.length > 1 && products.some((p) => !p.groupId || !ids.has(p.groupId))) chips.push({ key: NONE, label: 'Khác' });
    return chips;
  }, [groups, products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const ids = new Set(groups.map((g) => g.id));
    const inCategory = (groupId?: string | null) =>
      activeCategory === ALL ||
      (activeCategory === NONE ? !groupId || !ids.has(groupId) : groupId === activeCategory);
    return products.filter((p) => inCategory(p.groupId) && p.name.toLowerCase().includes(query));
  }, [products, groups, activeCategory, searchQuery]);

  // Danh mục đang chọn bị xóa / hết món → quay về "Tất cả"
  useEffect(() => {
    if (!categories.some((c) => c.key === activeCategory)) setActiveCategory(ALL);
  }, [categories, activeCategory]);

  return (
    <div className="space-y-5">
      {/* Ô tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="search"
          placeholder="Tìm trà, cà phê, bánh..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-[3.25rem] pr-5 py-4 bg-card rounded-full shadow-premium text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/70"
        />
      </div>

      {/* Chip danh mục */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none -mx-5 px-5 pb-1">
        {categories.map((cat) => {
          const active = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              aria-pressed={active}
              className={`whitespace-nowrap px-5 py-3 text-sm font-semibold rounded-full transition-all duration-200 ${
                active ? 'bg-caramel text-caramel-foreground shadow-sm' : 'bg-card text-foreground/80 hover:bg-cream'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Lưới sản phẩm 2 cột */}
      {!loaded && loading ? (
        <div className="grid grid-cols-2 gap-3.5" aria-label="Đang tải menu">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-[1.75rem] p-2.5 shadow-premium animate-pulse">
              <div className="aspect-square rounded-[1.4rem] bg-muted" />
              <div className="h-3 bg-muted rounded mt-3 mx-1.5 w-3/4" />
              <div className="h-3 bg-muted rounded mt-2 mx-1.5 w-1/3" />
            </div>
          ))}
        </div>
      ) : error && products.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-3xl space-y-3">
          <p className="font-semibold text-foreground">Không tải được menu</p>
          <p className="text-sm text-muted-foreground px-6">{error}</p>
          <button
            onClick={() => fetchProducts(true)}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={pick} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-3xl">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="font-semibold text-foreground">Không tìm thấy món</h3>
          <p className="text-sm text-muted-foreground mt-1 px-4">Thử từ khóa khác hoặc chọn danh mục khác nhé.</p>
        </div>
      )}

      {overlay}
    </div>
  );
}

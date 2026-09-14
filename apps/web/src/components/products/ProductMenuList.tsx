'use client';

import React, { useState, useMemo } from 'react';
// import { useCart } from '@/lib/context/CartContext';

import { Search, Plus, Sparkles } from 'lucide-react';
import ProductModal from './ProductModal';
import { Product, Topping, ProductCategory, useGetAllProduct } from '@chiba/api-client';
import { api } from '@/lib/axios';
import Image from 'next/image';

const CATEGORIES: {id: ProductCategory, label:string}[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'MON_NUOC', label: 'Món Nước' },
  { id: 'TOPPING', label: 'Topping Nước' },
  { id: 'BANH', label: 'Bánh & Đồ Ăn Kèm' },
];

export const ProductMenuList = () => {
  // const { addItem } = useCart();
  const { data: PRODUCTS } = useGetAllProduct(api)
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [drinkQuantity, setDrinkQuantity] = useState(1);

  /*
  * Filter products
  */
  const filteredProducts = useMemo(() => {
    const query = searchQuery
      .toLowerCase()
      .trim();

    return PRODUCTS.filter((product: any) => {
      const matchSearch =
        !query ||
        product.name
          .toLowerCase()
          .includes(query);

      const matchCategory =
        activeCategory === "ALL" ||
        product.category === activeCategory;

      return matchSearch && matchCategory;
    });
  }, [
    PRODUCTS,
    searchQuery,
    activeCategory,
  ]);

  /*
   * Available toppings
   */
  const availableToppings = useMemo(() => {
    return PRODUCTS.filter((product: Product) => product.category === 'TOPPING');
  }, [PRODUCTS]);

  /*
   * Toast
   */
  const triggerToast = (name: string) => {
    setAddedItemName(name);
    setTimeout(() => {
      setAddedItemName(null);
    }, 2000);
  };

  /*
   * Add product
   */
  const handleAddToCart = (product: Product) => {
    if (product.category === 'MON_NUOC') {
      setSelectedProduct(product);
      setSelectedToppings([]);
      setDrinkQuantity(1);
      return;
    }

    triggerToast(product.name);
  };

  /*
   * Toggle topping
   */
  const handleToggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((item) => item.id === topping.id);
      if (exists) {
        return prev.filter((item) => item.id !== topping.id);
      }
      return [...prev, topping];
    });
  };

  /*
   * Confirm
   */
  const handleConfirmToppings = () => {
    if (!selectedProduct) return;

    const toppingNames = selectedToppings
      .map((topping) => topping.name)
      .join(', ');
    const toastName = toppingNames
      ? `${selectedProduct.name} (+Topping)`
      : selectedProduct.name;

    triggerToast(toastName);
    setSelectedProduct(null);
    setSelectedToppings([]);
    setDrinkQuantity(1);
  };

  /*
   * Calculate total
   */
  const currentTotalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    const toppingsPrice = selectedToppings.reduce(
      (sum, topping) => sum + topping.price,
      0,
    );
    return (selectedProduct.price + toppingsPrice) * drinkQuantity;
  }, [selectedProduct, selectedToppings, drinkQuantity]);

  /*
   * Product icon
   */
  // const getProductIcon = (product: Product) => {
  //   if (product.category === 'MON_NUOC') {
  //     return '☕';
  //   }
  //   if (product.category === 'TOPPING') {
  //     return '🥛';
  //   }
  //   return '🍰';
  // };

  return (
    <>
      <div className="space-y-6">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Tìm trà, cà phê hay món bánh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>

        {/* Categories Horizontal Scroll Bar */}
        <div className="flex border-b border-border overflow-x-auto scrollbar-none gap-2 pb-px -mx-4 px-4 sticky top-[66px] bg-background/95 backdrop-blur-md z-30 py-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted/20'
                  }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Visual Toast Notification on Addition */}
        {addedItemName && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/90 text-white text-xs px-4 py-3 rounded-full shadow-floating flex items-center gap-2 animate-fade-in whitespace-nowrap">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Đã thêm <span className="font-bold text-accent">{addedItemName}</span> vào giỏ hàng!
          </div>
        )}

        {/* Dynamic Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-3">
            {filteredProducts.map((product: Product) => (
              <div
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border interactive-card cursor-pointer select-none"
              >
                {/* Product Thumbnail/Icon */}
                {
                  product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-muted text-2xl rounded-xl">
                      {product.category === 'MON_NUOC' ? '☕' : product.category === 'TOPPING' ? '🥛' : '🍰'}
                    </div>)
                }

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight truncate sm:whitespace-normal">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold text-sm mt-1">
                    {product.price.toLocaleString('vi-VN')} đ
                  </p>
                </div>

                {/* Add/Configure Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary-hover active:scale-90 text-white rounded-full transition-all duration-200 shadow-sm"
                  title={product.category === 'MON_NUOC' ? 'Tùy chọn món' : 'Thêm vào giỏ'}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="font-semibold text-foreground">Không tìm thấy món</h3>
            <p className="text-sm text-muted-foreground mt-1 px-4">
              Hãy thử tìm bằng từ khóa khác hoặc chuyển sang danh mục khác.
            </p>
          </div>
        )}

      </div>
      {/* PREMIUM TOPPING SELECTION MODAL */}
      {selectedProduct && (
        <ProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          availableToppings={availableToppings}
          selectedToppings={selectedToppings}
          onToggleTopping={handleToggleTopping}
          drinkQuantity={drinkQuantity}
          onChangeQuantity={setDrinkQuantity}
          currentTotalPrice={currentTotalPrice}
          onConfirm={handleConfirmToppings}
        />
      )}
    </>
  );
}

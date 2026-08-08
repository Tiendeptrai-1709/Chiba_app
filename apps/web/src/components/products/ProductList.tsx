'use client';

import React, { useState, useMemo, useEffect } from 'react';
// import { useCart } from '@/lib/context/CartContext';
import { Product, ProductCategory } from '@/types';
import { Search, Plus, ShoppingCart, Sparkles, X } from 'lucide-react';
import ProductOptionModal from './ProductModal';

export const MOCK_PRODUCTS: Product[] = [
  // MÓN NƯỚC (Highlands Coffee & Bubble Tea Style)
  { id: 'p1', name: 'Trà Thanh Đào Highlands', price: 49000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p2', name: 'Trà Thạch Sen Bùi Thơm', price: 49000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p3', name: 'Trà Thạch Vải Dai Ngọt', price: 49000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p4', name: 'Phin Sữa Đá Đậm Đà', price: 35000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p5', name: 'Phin Đen Đá Nguyên Bản', price: 29000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p6', name: 'Freeze Trà Xanh Thạch Vy', price: 55000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p7', name: 'Trà Sữa Thốt Nốt ZEN', price: 54000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p8', name: 'Trà Sữa Trân Châu Hoàng Kim', price: 48000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p9', name: 'Trà Xanh Đậu Đỏ Phố Cổ', price: 49000, category: 'MON_NUOC', isAvailable: true },
  { id: 'p10', name: 'Freeze Sô-cô-la Bông Kem', price: 55000, category: 'MON_NUOC', isAvailable: true },

  // TOPPING NƯỚC (BÁN RIÊNG)
  { id: 't1', name: 'Thạch Đào Giòn Sần Sật', price: 10000, category: 'TOPPING', isAvailable: true },
  { id: 't2', name: 'Thạch Sen Thơm Bùi', price: 10000, category: 'TOPPING', isAvailable: true },
  { id: 't3', name: 'Trân Châu Hoàng Kim', price: 10000, category: 'TOPPING', isAvailable: true },
  { id: 't4', name: 'Kem Phô Mai Macchiato Béo', price: 15000, category: 'TOPPING', isAvailable: true },
  { id: 't5', name: 'Kem Phô Mai Macchiato Béo2', price: 15000, category: 'TOPPING', isAvailable: true },
  { id: 't5', name: 'Kem Phô Mai Macchiato Béo3', price: 15000, category: 'TOPPING', isAvailable: true },

  // BÁNH & ĐỒ ĂN KÈM (Highlands Style)
  { id: 'b1', name: 'Bánh Mì Que Pate Xá Xíu', price: 29000, category: 'BANH', isAvailable: true },
  { id: 'b2', name: 'Bánh Mì Que Gà Phô Mai', price: 29000, category: 'BANH', isAvailable: true },
  { id: 'b3', name: 'Bánh Chuối Nướng Truyền Thống', price: 35000, category: 'BANH', isAvailable: true },
  { id: 'b4', name: 'Bánh Tiramisu Highlands Mềm', price: 39000, category: 'BANH', isAvailable: true },
  { id: 'b5', name: 'Bánh Caramel Phô Mai Ngọt Ngào', price: 39000, category: 'BANH', isAvailable: true }
];

export const ProductList = () => {
  // const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('MON_NUOC');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // States for toppings integration modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Product[]>([]);
  const [drinkQuantity, setDrinkQuantity] = useState(1);

  const categories: { key: ProductCategory; label: string }[] = [
    { key: 'MON_NUOC', label: 'Món Nước' },
    { key: 'TOPPING', label: 'Topping Nước (Bán riêng)' },
    { key: 'BANH', label: 'Bánh & Đồ Ăn Kèm' }
  ];

  // Optimize filter calculation using useMemo (Caching filter results)
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(
      (product) =>
        product.category === activeCategory &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  // Cache available toppings list for better rendering performance
  const availableToppings = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => product.category === 'TOPPING');
  }, []);

  const triggerToast = (name: string) => {
    setAddedItemName(name);
    setTimeout(() => {
      setAddedItemName(null);
    }, 2000);
  };

  const handleAddToCart = (product: Product) => {
    if (product.category === 'MON_NUOC') {
      setSelectedProduct(product);
      setSelectedToppings([]);
      setDrinkQuantity(1);
    } else {
      // addItem({ id: product.id, name: product.name, price: product.price });
      triggerToast(product.name);
    }
  };

  const handleToggleTopping = (topping: Product) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleConfirmToppings = () => {
    if (!selectedProduct) return;

    // addItem(
    //   { id: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price },
    //   selectedToppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
    //   drinkQuantity
    // );

    const toppingNames = selectedToppings.map((t) => t.name).join(', ');
    const toastName = toppingNames ? `${selectedProduct.name} (+Topping)` : selectedProduct.name;
    triggerToast(toastName);

    // Reset and close
    setSelectedProduct(null);
    setSelectedToppings([]);
    setDrinkQuantity(1);
  };

  // Dynamic price calculation with useMemo caching
  const currentTotalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return (selectedProduct.price + toppingsPrice) * drinkQuantity;
  }, [selectedProduct, selectedToppings, drinkQuantity]);

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
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
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
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border interactive-card cursor-pointer select-none"
              >
                {/* Product Thumbnail/Icon */}
                <div className="w-12 h-12 flex items-center justify-center bg-muted text-2xl rounded-xl">
                  {product.category === 'MON_NUOC' ? '☕' : product.category === 'TOPPING' ? '🥛' : '🍰'}
                </div>

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
        <ProductOptionModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          productName={selectedProduct?.name ?? ""}
          productPrice={selectedProduct?.price ?? 0}
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

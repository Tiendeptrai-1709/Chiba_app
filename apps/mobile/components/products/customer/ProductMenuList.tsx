import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Plus, Search, Sparkles } from 'lucide-react-native';

import { Product, ProductCategory } from '@/types';

import { useGetAllProduct } from '@chiba/api-client';
import { api } from '@/lib/axios';
import ProductModal from './ProductModal';

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'MON_NUOC', label: 'Món Nước' },
  { id: 'TOPPING', label: 'Topping Nước' },
  { id: 'BANH', label: 'Bánh & Đồ Ăn Kèm' },
];

const ProductMenuList = () => {
  const { data: PRODUCTS } = useGetAllProduct(api)
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>('MON_NUOC');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Product[]>([]);
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
  }, []);

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
  const handleToggleTopping = (topping: Product) => {
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
  const getProductIcon = (product: Product) => {
    if (product.category === 'MON_NUOC') {
      return '☕';
    }
    if (product.category === 'TOPPING') {
      return '🥛';
    }
    return '🍰';
  };

  return (
    <View className="flex-1">
      {/* =========================================
          SEARCH
      ========================================== */}
      <View className="h-[50px] flex-row items-center bg-white border border-[#E5E5E5] rounded-xl mb-3">
        <Search size={20} color="#999999" className="ml-3.5" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm trà, cà phê hay món bánh..."
          placeholderTextColor="#999999"
          className="flex-1 h-full px-3 text-sm font-medium text-[#262626]"
        />
      </View>

      {/* =========================================
          CATEGORIES
      ========================================== */}
      <View className="mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2 py-0.5"
          renderItem={({ item }) => {
            const isActive = activeCategory === item.id;
            return (
              <Pressable
                onPress={() => {
                  setActiveCategory(item.id);
                  setSearchQuery('');
                }}
                className={`px-4 py-2.5 rounded-lg border ${isActive
                  ? 'bg-primary border-primary'
                  : 'bg-white border-[#E5E5E5]'
                  }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-[#777777]'
                    }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* =========================================
          TOAST
      ========================================== */}
      {addedItemName && (
        <View className="absolute z-[100] bottom-5 left-5 right-5 min-h-12 px-4 rounded-full bg-black/90 flex-row items-center justify-center">
          <Sparkles size={16} color="#FFD54A" />
          <Text className="ml-2 text-xs font-medium text-white">
            Đã thêm{' '}
            <Text className="font-extrabold text-accent">
              {addedItemName}
            </Text>{' '}
            vào giỏ hàng!
          </Text>
        </View>
      )}

      {/* =========================================
          PRODUCT LIST
      ========================================== */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3 pb-28"
        renderItem={({ item: product }) => (
          <Pressable
            onPress={() => handleAddToCart(product)}
            className="min-h-[82px] flex-row items-center p-3.5 bg-white border border-[#E5E5E5] rounded-xl"
          >
            {/* Product icon */}
            <View className="w-12 h-12 rounded-xl bg-[#F5F5F5] items-center justify-center mr-3.5">
              <Text className="text-2xl">{getProductIcon(product)}</Text>
            </View>

            {/* Product information */}
            <View className="flex-1 pr-2">
              <Text
                numberOfLines={2}
                className="text-sm leading-5 font-semibold text-[#262626]"
              >
                {product.name}
              </Text>
              <Text className="mt-1 text-sm font-extrabold text-primary">
                {product.price.toLocaleString('vi-VN')} đ
              </Text>
            </View>

            {/* Add */}
            <Pressable
              onPress={() => handleAddToCart(product)}
              className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-70"
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="min-h-[250px] bg-white border border-[#E5E5E5] rounded-xl items-center justify-center px-6">
            <Text className="text-5xl mb-3">🔍</Text>
            <Text className="text-base font-bold text-[#262626]">
              Không tìm thấy món
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-[#777777] text-center">
              Hãy thử tìm bằng từ khóa khác hoặc chuyển sang danh mục khác.
            </Text>
          </View>
        }
      />

      {/* =========================================
          PRODUCT OPTION MODAL
      ========================================== */}
      {selectedProduct && (
        <ProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          productName={selectedProduct.name}
          productPrice={selectedProduct.price}
          availableToppings={availableToppings}
          selectedToppings={selectedToppings}
          onToggleTopping={handleToggleTopping}
          drinkQuantity={drinkQuantity}
          onChangeQuantity={setDrinkQuantity}
          currentTotalPrice={currentTotalPrice}
          onConfirm={handleConfirmToppings}
        />
      )}
    </View>
  );
};

export default ProductMenuList;
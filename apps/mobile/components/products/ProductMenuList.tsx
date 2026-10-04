import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import { Plus, Search, Sparkles } from 'lucide-react-native';

import { Product, ProductCategory, Topping, useAddCartItems, useGetAllProduct, useNotificationStore } from '@chiba/api-client';
import { api } from '@/lib/axios';
import ProductModal from './ProductModal';

const CATEGORIES: { id: ProductCategory, label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'MON_NUOC', label: 'Món Nước' },
  { id: 'TOPPING', label: 'Topping Nước' },
  { id: 'BANH', label: 'Bánh & Đồ Ăn Kèm' },
];

const ProductMenuList = () => {
  const { data: PRODUCTS } = useGetAllProduct(api)
  const { mutate: addToCart, isPending: isAddingToCart, } = useAddCartItems(api)
  const { showError, showSuccess } = useNotificationStore()

  const [activeCategory, setActiveCategory] = useState<ProductCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState('');
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
   * Add product
   */
  const handleAddToCart = (product: Product) => {
    // Topping / sản phẩm không cần chọn option
    if (product.category === "TOPPING") {
      addToCart(
        {
          productId: product.id,
          quantity: 1,
          toppingIds: [],
        },
        {
          onSuccess: () => {
            showSuccess("Đã thêm sản phẩm vào giỏ hàng");
          },
          onError: () => {
            showError("Thêm sản phẩm thất bại");
          },
        }
      );

      return;
    }
    // Món nước → mở modal chọn topping
    setSelectedProduct(product);
    setSelectedToppings([]);
    setDrinkQuantity(1);
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

    const toppingIds = selectedToppings.map(
      (topping) => topping.id
    );

    addToCart(
      { productId: selectedProduct.id, quantity: drinkQuantity, toppingIds },
      {
        onSuccess: () => {
          showSuccess("Đã thêm sản phẩm vào giỏ hàng");

          setSelectedProduct(null);
          setSelectedToppings([]);
          setDrinkQuantity(1);
        },

        onError: () => {
          showError("Thêm sản phẩm thất bại");
        },
      }
    );
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
              {product?.imageUrl ? (
                <Image source={{ uri: product.imageUrl }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                  }} />
              ) : (
                <Text className="w-12 h-12 flex items-center justify-center bg-muted text-2xl rounded-xl"> {product.category === 'MON_NUOC' ? '☕' : product.category === 'TOPPING' ? '🥛' : '🍰'} </Text>
              )
              }
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
          product={selectedProduct}
          availableToppings={availableToppings}
          selectedToppings={selectedToppings}
          onToggleTopping={handleToggleTopping}
          drinkQuantity={drinkQuantity}
          onChangeQuantity={setDrinkQuantity}
          currentTotalPrice={currentTotalPrice}
          onConfirm={handleConfirmToppings}
          isAddingToCart={isAddingToCart}
        />
      )}
    </View>
  );
};

export default ProductMenuList;
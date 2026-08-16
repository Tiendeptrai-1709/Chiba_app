import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ToggleLeft, ToggleRight } from "lucide-react-native";

const StockController = () => {
  const [productStocks, setProductStocks] = useState<Record<string, boolean>>({
    p1: true,
    p2: true,
    b4: false,
  });

  const handleToggleStock = (prodId: string) => {
    setProductStocks((prev) => ({
      ...prev,
      [prodId]: !prev[prodId],
    }));
  };

  const products = [
    {
      id: "p1",
      name: "Trà Thanh Đào Highlands",
    },
    {
      id: "p2",
      name: "Trà Thạch Sen Bùi Thơm",
    },
    {
      id: "b4",
      name: "Bánh Tiramisu Highlands Mềm",
    },
  ];

  return (
    <View className="bg-card border border-border p-5 rounded-2xl gap-4">
      {/* Header Info */}
      <View className="border-b border-border pb-3">
        <Text className="font-bold text-sm text-foreground">
          🛒 Quản lý tình trạng món
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">
          Nhân viên có thể bật/tắt nhanh khi hết nguyên liệu
        </Text>
      </View>

      {/* Product List */}
      <View className="gap-3">
        {products.map((product) => {
          const inStock = productStocks[product.id] !== false;

          return (
            <View
              key={product.id}
              className="flex-row items-center justify-between bg-neutral-50 border border-border p-3 rounded-xl"
            >
              <View>
                <Text className="text-xs font-bold text-foreground">
                  {product.name}
                </Text>
                <Text className="text-[10px] text-muted-foreground mt-0.5">
                  ID: {product.id}
                </Text>
              </View>

              <Pressable
                onPress={() => handleToggleStock(product.id)}
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border active:opacity-70 ${
                  inStock
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                {inStock ? (
                  <>
                    <ToggleRight size={20} color="#16a34a" />
                    <Text className="text-xs font-bold text-green-600">
                      Còn hàng
                    </Text>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={20} color="#dc2626" />
                    <Text className="text-xs font-bold text-red-600">
                      Hết hàng
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default StockController;
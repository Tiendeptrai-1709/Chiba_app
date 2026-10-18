
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useGetCart,
  useProfile,
} from "@chiba/api-client";
import { api } from "@/lib/axios";
import { BillingSummary } from "@/components/cart/BillingSummary";
import { CartItemsList } from "@/components/cart/CartItemsList";
import { OrderTypeSection } from "@/components/cart/OrderTypeSection";
import { DeliveryAddress } from "@/components/cart/DeliveryAddress";
import { LoyaltyPoints } from "@/components/cart/LoyaltyPoints";
import { calculateCartTotals } from "@chiba/api-client/src/lib/cart-pricing";

type OrderType = "DELIVERY" | "PICKUP";

// type CheckoutPayload = {
//   orderType: OrderType;
//   address: string;
//   pointsUsed: number;
//   discountAmount: number;
//   shippingFee: number;
//   finalPrice: number;
// };

export default function CartPage() {
  const router = useRouter();
  // const queryClient = useQueryClient();

  const { data: cart, isLoading: isCartLoading } = useGetCart(api);
  const { data: user, isLoading: isUserLoading } = useProfile(api);

  const [address, setAddress] = useState("");
  const [hasEditedAddress, setHasEditedAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  const items = cart?.items ?? [];
  const userPoints = user?.zenPoints ?? 0;

  const { maxPointsAllowed } = calculateCartTotals({
    items,
    orderType,
    pointsToUse: 0,
  });

  const maxPointsPossible = Math.min(
    userPoints,
    maxPointsAllowed,
  );

  // Redirect nếu user chưa đăng nhập.
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Đồng bộ address từ Profile khi user tải xong,
  // nhưng không ghi đè nếu người dùng đã tự chỉnh sửa.
  useEffect(() => {
    if (user?.address && !hasEditedAddress) {
      setAddress(user.address);
    }
  }, [user?.address, hasEditedAddress]);

  // Giới hạn số điểm khi subtotal hoặc điểm của user thay đổi.
  useEffect(() => {
    if (!usePoints) {
      setPointsToUse(0);
      return;
    }

    setPointsToUse((current) =>
      Math.min(current, maxPointsPossible),
    );
  }, [usePoints, maxPointsPossible]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setHasEditedAddress(true);
  };

  if (isUserLoading || isCartLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-muted-foreground">
          Đang tải giỏ hàng...
        </Text>
      </View>
    );
  }

  // Tránh render trang cart trong lúc điều hướng đăng nhập.
  // if (!user) {
  //   return (
  //     <View className="flex-1 items-center justify-center bg-background">
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <View className="flex-1 bg-background mt-10">
      {/* Header */}
      <View className="flex-row items-center border-b border-border bg-card px-4 py-4 ">
        <Pressable
          onPress={() => router.push("/")}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text className="text-lg font-bold text-foreground">
            {"‹"}
          </Text>
        </Pressable>

        <Text className="flex-1 text-xl font-bold text-foreground">
          Giỏ hàng của bạn
        </Text>

        <View className="rounded-full bg-primary px-3 py-1">
          <Text className="text-xs font-bold text-white">
            {items.length} Món
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        {items.length > 0 ? (
          <View className="gap-4">
            <OrderTypeSection
              orderType={orderType}
              setOrderType={setOrderType}
            />

            <DeliveryAddress
              orderType={orderType}
              address={address}
              setAddress={handleAddressChange}
              saveAsDefault={saveAsDefault}
              setSaveAsDefault={setSaveAsDefault}
            />

            <CartItemsList />

            <LoyaltyPoints
              userPoints={userPoints}
              usePoints={usePoints}
              setUsePoints={setUsePoints}
              pointsToUse={pointsToUse}
              setPointsToUse={setPointsToUse}
              maxPointsPossible={maxPointsPossible}
              maxPointsAllowed={maxPointsAllowed}
            />

            <BillingSummary
              orderType={orderType}
              address={address}
              usePoints={usePoints}
              pointsToUse={pointsToUse}
              saveAsDefault={saveAsDefault}
            // onCheckout={handleCheckout}
            />
          </View>
        ) : (
          <View className="items-center rounded-2xl border border-border bg-card px-5 py-16">
            <Text className="mb-4 text-6xl">🛒</Text>

            <Text className="text-center font-bold text-foreground">
              Giỏ hàng của bạn đang trống
            </Text>

            <Text className="mt-2 text-center text-xs text-muted-foreground">
              Hãy chọn những món trà, cà phê hay sữa tươi
              thơm ngon nhất của chúng tôi nhé!
            </Text>

            <Pressable
              onPress={() => router.push("/")}
              className="mt-6 rounded-xl bg-primary px-6 py-3"
            >
              <Text className="font-bold text-white">
                Chọn món ngay
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Success modal */}

    </View>
  );
}

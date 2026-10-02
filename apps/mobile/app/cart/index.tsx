
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
  // const { showError } = useNotificationStore();

  const [earnedPoints, setEarnedPoints] = useState(0);
  const [address, setAddress] = useState("");
  const [hasEditedAddress, setHasEditedAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      router.replace("/login");
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

  // const handleCheckout = async (payload: CheckoutPayload) => {
  //   if (isSubmitting) return;

  //   try {
  //     setIsSubmitting(true);

  //     // Backend tự tính lại giá và xác thực điểm Zen.
  //     const response = await api.post("/orders/checkout", {
  //       orderType: payload.orderType,
  //       address:
  //         payload.orderType === "DELIVERY"
  //           ? payload.address.trim()
  //           : undefined,
  //       pointsUsed: payload.pointsUsed,
  //     });

  //     const order = response.data;

  //     setEarnedPoints(order.earnedPoints ?? 0);
  //     setShowSuccessModal(true);

  //     // Đồng bộ lại cart và profile sau khi đặt hàng.
  //     await Promise.all([
  //       queryClient.invalidateQueries({ queryKey: ["cart"] }),
  //       queryClient.invalidateQueries({ queryKey: ["profile"] }),
  //     ]);
  //   } catch (error: any) {
  //     const message =
  //       error?.response?.data?.message ??
  //       "Không thể đặt hàng. Vui lòng thử lại.";

  //     showError(message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

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
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center border-b border-border bg-card px-4 py-4">
        <Pressable
          onPress={() => router.back()}
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
              setEarnedPoints={setEarnedPoints}
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
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className="w-full max-w-sm items-center rounded-2xl bg-card p-6">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Text className="text-4xl text-primary">✓</Text>
            </View>

            <Text className="text-center text-2xl font-black text-primary">
              Đặt hàng thành công!
            </Text>

            <Text className="mt-3 text-center text-sm text-muted-foreground">
              Đơn hàng của bạn đã được tiếp nhận.
            </Text>

            <View className="mt-5 w-full flex-row items-center justify-center rounded-xl border border-orange-200 bg-orange-50 p-4">
              <Text className="text-center text-sm font-bold text-orange-800">
                ✨ Bạn nhận được +{earnedPoints} điểm Chiba!
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/");
              }}
              className="mt-6 w-full items-center rounded-xl bg-primary px-5 py-3"
            >
              <Text className="font-bold text-white">
                Đồng ý & Tiếp tục
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
